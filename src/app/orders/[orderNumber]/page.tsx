import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?next=/orders/${orderNumber}`);

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      address: true,
      vendorOrders: {
        include: { vendor: true, items: true },
      },
    },
  });

  if (!order || order.buyerId !== session.user.id) notFound();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-10 pt-24">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold">Order {order.orderNumber}</h1>
          <StatusBadge
            tone={
              order.paymentStatus === "PAID"
                ? "success"
                : order.paymentStatus === "FAILED"
                  ? "danger"
                  : "ignition"
            }
          >
            {order.paymentStatus}
          </StatusBadge>
        </div>

        {order.paymentMethod === "COD" && (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Payment mode: <span className="font-medium">Cash on Delivery</span>
          </p>
        )}

        {order.paymentStatus === "PENDING" && order.paymentMethod === "COD" && (
          <p className="mt-2 text-sm text-[var(--color-success)]">
            Order placed successfully! vendor has been notified to start preparing your order.
            You will pay cash when your order is delivered.
          </p>
        )}
        {order.paymentStatus === "PAID" && (
          <p className="mt-2 text-sm text-[var(--color-success)]">
            Payment confirmed. Each vendor has been notified to start preparing your order.
          </p>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Shipping to</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--color-text-secondary)]">
            <p className="font-medium text-[var(--color-text-primary)]">{order.address.label}</p>
            <p>
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city},{" "}
              {order.address.state} {order.address.pincode}
            </p>
            <p className="font-numeric">{order.address.phone}</p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Payment Method</span>
              <span className="font-medium">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[var(--color-text-secondary)]">Payment Status</span>
              <span className="font-medium">{order.paymentStatus}</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-4">
          {order.vendorOrders.map((vo) => (
            <Card key={vo.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">{vo.vendor.shopName}</CardTitle>
                <StatusBadge tone="steel">{vo.fulfillmentStatus}</StatusBadge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {vo.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    {item.productImage ? (
                      <div className="relative h-10 w-10 rounded-md border border-[var(--color-border)] overflow-hidden">
                        <Image
                          src={item.productImage}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]" />
                    )}
                    <span className="flex-1">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-numeric">{formatPrice(item.lineTotal.toString())}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardContent className="flex flex-col gap-2 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-numeric">{formatPrice(order.subtotal.toString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Tax</span>
              <span className="font-numeric">{formatPrice(order.taxAmount.toString())}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="font-numeric">{formatPrice(order.total.toString())}</span>
            </div>
          </CardContent>
        </Card>

        <Button variant="secondary" className="mt-6" asChild>
          <Link href="/products">Continue shopping</Link>
        </Button>
      </main>
    </>
  );
}
