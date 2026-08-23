import Link from "next/link";
import { redirect } from "next/navigation";
import { getMemoizedSession } from "@/lib/memoized-auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { RefundRequestDialog } from "@/components/account/refund-request-dialog";
import { WriteReviewDialog } from "@/components/account/write-review-dialog";
import { OrderFulfillmentProgress } from "@/components/account/order-fulfillment-progress";

export default async function AccountOrdersPage() {
  const session = await getMemoizedSession();
  if (!session?.user) redirect("/login?next=/account/orders");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      vendorOrders: {
        include: {
          vendor: true,
          refundRequests: true,
          items: { include: { reviews: { select: { id: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 pt-24">
        <h1 className="font-display text-2xl font-semibold">Your orders</h1>

        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--color-text-secondary)]">
            No orders yet.{" "}
            <Link href="/products" className="text-[var(--color-steel)] hover:underline">
              Start shopping
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-numeric text-base">{order.orderNumber}</CardTitle>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Placed on {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-numeric text-sm font-bold text-[var(--color-text-primary)]">
                      Total: {formatPrice(order.total.toString())}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                      <span>Payment:</span>
                      <StatusBadge
                        tone={
                          order.paymentStatus === "PAID"
                            ? "success"
                            : order.paymentStatus === "FAILED"
                              ? "danger"
                              : "ignition"
                        }
                      >
                        {order.paymentStatus === "PAID"
                          ? "Paid"
                          : order.paymentStatus === "FAILED"
                            ? "Failed"
                            : "Pending"}
                      </StatusBadge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {order.vendorOrders.map((vo) => {
                    const activeRefund = vo.refundRequests.find((r) =>
                      ["REQUESTED", "APPROVED"].includes(r.status)
                    );
                    return (
                      <div
                        key={vo.id}
                        className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3 first:border-0 first:pt-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{vo.vendor.shopName}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {vo.items.length} item{vo.items.length === 1 ? "" : "s"}
                            </p>
                          </div>
                          {order.paymentStatus === "PAID" &&
                            (activeRefund ? (
                              <StatusBadge tone="steel">Refund {activeRefund.status}</StatusBadge>
                            ) : (
                              <RefundRequestDialog
                                vendorOrderId={vo.id}
                                shopName={vo.vendor.shopName}
                              />
                            ))}
                        </div>

                        <OrderFulfillmentProgress
                          fulfillmentStatus={vo.fulfillmentStatus}
                          trackingCarrier={vo.trackingCarrier}
                          trackingNumber={vo.trackingNumber}
                        />

                        {vo.fulfillmentStatus === "DELIVERED" && (
                          <div className="flex flex-wrap gap-2">
                            {vo.items
                              .filter((item) => item.reviews.length === 0)
                              .map((item) => (
                                <WriteReviewDialog
                                  key={item.id}
                                  orderItemId={item.id}
                                  productName={item.productName}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="mt-1 text-sm text-[var(--color-steel)] hover:underline"
                  >
                    View order details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
