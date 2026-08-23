import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/format";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        where: { paymentStatus: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">My Account</h1>
            <p className="text-[var(--color-text-secondary)]">Welcome back, {user.name}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/account/orders" className="card-premium p-6 group">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">My Orders</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">View and track your orders</p>
              <span className="text-sm text-[var(--color-gold)] font-medium">View Orders →</span>
            </Link>

            <Link href="/account/wishlist" className="card-premium p-6 group">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">Wishlist</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">View your saved products</p>
              <span className="text-sm text-[var(--color-gold)] font-medium">View Wishlist →</span>
            </Link>

            <Link href="/account/support" className="card-premium p-6 group">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">Support</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">Get help with your orders</p>
              <span className="text-sm text-[var(--color-gold)] font-medium">Get Support →</span>
            </Link>

            <Link href="/cart" className="card-premium p-6 group">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">Shopping Cart</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">View items in your cart</p>
              <span className="text-sm text-[var(--color-gold)] font-medium">View Cart →</span>
            </Link>

            {user.role === "VENDOR" && (
              <Link href="/vendor/dashboard" className="card-premium p-6 group">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">Vendor Dashboard</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">Manage your shop</p>
                <span className="text-sm text-[var(--color-gold)] font-medium">Go to Dashboard →</span>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link href="/admin" className="card-premium p-6 group">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">Admin Dashboard</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">Manage the platform</p>
                <span className="text-sm text-[var(--color-gold)] font-medium">Go to Admin →</span>
              </Link>
            )}
          </div>

          {user.orders.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Recent Orders</h2>
              <div className="card">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[var(--color-border)]">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Order #</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Total</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.map((order) => (
                      <tr key={order.id} className="border-b border-[var(--color-border)]">
                        <td className="p-4 font-medium text-[var(--color-text-primary)]">{order.orderNumber}</td>
                        <td className="p-4 text-sm text-[var(--color-text-secondary)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-sm text-[var(--color-text-primary)]">{formatPrice(Number(order.total))}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}