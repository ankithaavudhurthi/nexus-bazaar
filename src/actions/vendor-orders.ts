"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireApprovedVendor } from "@/lib/vendor-guard";
import { prisma } from "@/lib/prisma";
import { sendShipmentStatusEmail } from "@/lib/email";

const fulfillmentSchema = z.object({
  vendorOrderId: z.string(),
  fulfillmentStatus: z.enum(["PENDING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingCarrier: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export type VendorOrderActionState = { error?: string; success?: boolean };

export async function updateFulfillment(
  _prevState: VendorOrderActionState,
  formData: FormData
): Promise<VendorOrderActionState> {
  const vendor = await requireApprovedVendor();

  const parsed = fulfillmentSchema.safeParse({
    vendorOrderId: formData.get("vendorOrderId"),
    fulfillmentStatus: formData.get("fulfillmentStatus"),
    trackingCarrier: formData.get("trackingCarrier") || undefined,
    trackingNumber: formData.get("trackingNumber") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const vendorOrder = await prisma.vendorOrder.findUnique({
    where: { id: parsed.data.vendorOrderId },
    include: { order: { include: { buyer: { select: { email: true } } } } },
  });

  if (!vendorOrder || vendorOrder.vendorId !== vendor.id) {
    return { error: "Order not found" };
  }

  const trackingCarrier = parsed.data.trackingCarrier || vendorOrder.trackingCarrier;
  const trackingNumber = parsed.data.trackingNumber || vendorOrder.trackingNumber;

  await prisma.vendorOrder.update({
    where: { id: vendorOrder.id },
    data: {
      fulfillmentStatus: parsed.data.fulfillmentStatus,
      trackingCarrier,
      trackingNumber,
      shippedAt: parsed.data.fulfillmentStatus === "SHIPPED" ? new Date() : vendorOrder.shippedAt,
      deliveredAt:
        parsed.data.fulfillmentStatus === "DELIVERED" ? new Date() : vendorOrder.deliveredAt,
    },
  });

  // For COD orders, mark payment as PAID when delivered
  if (parsed.data.fulfillmentStatus === "DELIVERED" && vendorOrder.order.paymentMethod === "COD") {
    await prisma.order.update({
      where: { id: vendorOrder.orderId },
      data: { paymentStatus: "PAID" },
    });
  }

  if (parsed.data.fulfillmentStatus === "SHIPPED" || parsed.data.fulfillmentStatus === "DELIVERED") {
    await sendShipmentStatusEmail(
      vendorOrder.order.buyer.email,
      vendorOrder.order.orderNumber,
      parsed.data.fulfillmentStatus,
      trackingCarrier,
      trackingNumber
    );
  }

  revalidatePath("/vendor/orders");
  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function resolveRefundRequest(refundRequestId: string, approve: boolean) {
  const vendor = await requireApprovedVendor();

  const refund = await prisma.refundRequest.findUnique({
    where: { id: refundRequestId },
    include: { vendorOrder: { include: { order: true } } },
  });
  if (!refund || refund.vendorOrder.vendorId !== vendor.id) {
    return { error: "Refund request not found" };
  }
  if (refund.status !== "REQUESTED") {
    return { error: "This request has already been resolved" };
  }

  if (!approve) {
    await prisma.refundRequest.update({
      where: { id: refund.id },
      data: { status: "REJECTED", resolvedAt: new Date(), resolvedBy: vendor.id },
    });
    revalidatePath("/vendor/orders");
    return { success: true };
  }

  // Approve — mark order as REFUNDED (no gateway call for COD)
  const { order } = refund.vendorOrder;

  await prisma.$transaction([
    prisma.refundRequest.update({
      where: { id: refund.id },
      data: { status: "REFUNDED", resolvedAt: new Date(), resolvedBy: vendor.id },
    }),
    prisma.vendorOrder.update({
      where: { id: refund.vendorOrder.id },
      data: { fulfillmentStatus: "CANCELLED" },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "REFUNDED" },
    }),
  ]);

  revalidatePath("/vendor/orders");
  return { success: true };
}
