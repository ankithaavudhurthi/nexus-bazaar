import { getMemoizedSession, getMemoizedVendorProfile } from "@/lib/memoized-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { VendorOrderCard } from "@/components/vendor/vendor-order-card";

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await getMemoizedSession();
  if (!session?.user?.id) return null;

  const vendor = await getMemoizedVendorProfile(session.user.id);
  if (!vendor) return null;

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: {
      vendorId: vendor.id,
      ...(status ? { fulfillmentStatus: status.toUpperCase() as never } : {}),
    },
    include: {
      order: {
        include: {
          address: true,
          buyer: {
            select: {
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      },
      items: true,
      refundRequests: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const filters = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Packed", value: "packed" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Orders</h1>

      <div className="flex gap-3">
        {filters.map((f) => {
          const isActive = status === f.value || (!status && !f.value);
          return (
            <Link
              key={f.label}
              href={f.value ? `/vendor/orders?status=${f.value}` : "/vendor/orders"}
              className={`px-5 py-2.5 text-base rounded-full font-semibold transition-all ${
                isActive
                  ? "btn-gold-sm"
                  : "btn-outline"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {vendorOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-base text-[var(--color-text-secondary)]">No orders found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {vendorOrders.map((vo) => {
            const activeRefund = vo.refundRequests.find((r) =>
              ["REQUESTED", "APPROVED"].includes(r.status)
            );
            return (
              <VendorOrderCard
                key={vo.id}
                order={{
                  id: vo.id,
                  orderNumber: vo.order.orderNumber,
                  fulfillmentStatus: vo.fulfillmentStatus,
                  trackingCarrier: vo.trackingCarrier,
                  trackingNumber: vo.trackingNumber,
                  vendorEarning: vo.vendorEarning.toString(),
                  createdAt: vo.createdAt.toISOString(),
                  customer: {
                    name: vo.order.buyer.name,
                    email: vo.order.buyer.email,
                    phone: vo.order.address.phone || vo.order.buyer.phone || null,
                  },
                  shippingAddress: vo.order.address
                    ? {
                        line1: vo.order.address.line1,
                        line2: vo.order.address.line2,
                        city: vo.order.address.city,
                        state: vo.order.address.state,
                        pincode: vo.order.address.pincode,
                      }
                    : null,
                  items: vo.items.map((i) => ({
                    id: i.id,
                    productName: i.productName,
                    quantity: i.quantity,
                    productImage: i.productImage,
                    customImage: i.customImage,
                    customText: i.customText,
                  })),
                  activeRefund: activeRefund
                    ? {
                        id: activeRefund.id,
                        reason: activeRefund.reason,
                        amount: activeRefund.amount.toString(),
                      }
                    : null,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}