"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendNewOrderVendorEmail, sendLowStockAlertEmail } from "@/lib/email";

export type CheckoutResult =
  | { error: string }
  | {
      success: true;
      orderNumber: string;
    };

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AO-${ts}-${rand}`;
}

const LOW_STOCK_THRESHOLD = 5;

export async function createCheckoutOrder(
  addressId: string
): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) {
    return { error: "Address not found" };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { vendor: { include: { user: { select: { email: true } } } }, images: { orderBy: { position: "asc" }, take: 1 } },
          },
        },
      },
    },
  });

  const items = (cart?.items ?? []).filter((i) => i.product.status === "ACTIVE");
  if (items.length === 0) return { error: "Your cart is empty" };

  for (const item of items) {
    if (item.quantity > item.product.stock) {
      return { error: `"${item.product.name}" doesn't have enough stock left` };
    }
  }

  const settings = await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const subtotal = items.reduce((sum, i) => sum + Number(i.product.basePrice) * i.quantity, 0);

  const taxAmount = Math.round(subtotal * (settings.taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  // Group cart items by vendor for VendorOrder splitting.
  const byVendor = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.product.vendorId;
    byVendor.set(key, [...(byVendor.get(key) ?? []), item]);
  }

  const orderNumber = generateOrderNumber();

  // Snapshot current stock before decrementing, so we can tell which
  // products just crossed the low-stock threshold from this sale.
  const productIds = items.map((i) => i.productId);
  const productsBefore = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, stock: true },
  });
  const stockBefore = new Map(productsBefore.map((p) => [p.id, p]));

  // Create order and process COD payment flow in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        buyerId: session.user.id,
        addressId: address.id,
        subtotal,
        taxAmount,
        shippingTotal: 0,
        total,
        paymentStatus: "PENDING", // COD orders start as PENDING
        paymentMethod: "COD",
        vendorOrders: {
          create: Array.from(byVendor.entries()).map(([vendorId, vendorItems]) => {
            const vendor = vendorItems[0].product.vendor;
            const vendorSubtotal = vendorItems.reduce(
              (sum, i) => sum + Number(i.product.basePrice) * i.quantity,
              0
            );
            const commissionRate = vendor.commissionRateOverride ?? settings.defaultCommissionRate;
            const commissionAmount =
              Math.round(vendorSubtotal * (commissionRate / 100) * 100) / 100;
            const vendorEarning =
              Math.round((vendorSubtotal - commissionAmount) * 100) / 100;

            return {
              vendorId,
              subtotal: vendorSubtotal,
              commissionRate,
              commissionAmount,
              vendorEarning,
              fulfillmentStatus: "PENDING" as const,
              payoutStatus: "UNPAID" as const,
              items: {
                create: vendorItems.map((i) => ({
                  productId: i.productId,
                  productName: i.product.name,
                  productImage: i.product.images[0]?.url ?? "",
                  unitPrice: i.product.basePrice,
                  quantity: i.quantity,
                  lineTotal: Math.round(Number(i.product.basePrice) * i.quantity * 100) / 100,
                  customImage: i.customImage ?? null,
                  customText: i.customText ?? null,
                })),
              },
            };
          }),
        },
      },
    });

    // Decrement stock for COD orders immediately (payment collected on delivery)
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear the purchased items out of the buyer's cart
    await tx.cartItem.deleteMany({
      where: {
        cart: { userId: session.user.id },
        productId: { in: productIds },
      },
    });

    return newOrder;
  });

  // Send order confirmation email
  await sendOrderConfirmationEmail(session.user.email ?? '', orderNumber, total.toString());

  // Send vendor emails and low stock alerts
  for (const [vendorId, vendorItems] of byVendor.entries()) {
    const vendor = vendorItems[0].product.vendor;
    await sendNewOrderVendorEmail(vendor.user.email, orderNumber, vendorItems.length);

    for (const item of vendorItems) {
      const before = stockBefore.get(item.productId);
      if (!before) continue;
      const newStock = before.stock - item.quantity;
      // Only fire the moment stock crosses the threshold on this sale
      if (before.stock > LOW_STOCK_THRESHOLD && newStock <= LOW_STOCK_THRESHOLD) {
        await sendLowStockAlertEmail(vendor.user.email, before.name, Math.max(newStock, 0));
      }
    }
  }

  return {
    success: true,
    orderNumber,
  };
}
