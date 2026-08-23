import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id, role: "BUYER" },
    include: {
      orders: {
        where: { paymentStatus: "PAID" },
        include: {
          vendorOrders: {
            include: {
              items: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = customer.orders.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/customers" className="text-sm text-[var(--color-gold)] hover:underline mb-2 block">
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-black">{customer.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Total Orders</p>
          <p className="text-2xl font-bold text-[var(--color-gold)]">{totalOrders}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Total Spent</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{formatPrice(totalSpent)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Member Since</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Recent Orders</h2>
        </div>
        {customer.orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-black">No orders found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-black">Order #</th>
                <th className="text-left p-4 text-sm font-medium text-black">Date</th>
                <th className="text-left p-4 text-sm font-medium text-black">Items</th>
                <th className="text-left p-4 text-sm font-medium text-black">Total</th>
                <th className="text-left p-4 text-sm font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((order) => {
                const itemCount = order.vendorOrders.reduce((s, vo) => s + vo.items.length, 0);
                return (
                  <tr key={order.id} className="border-b border-gray-200">
                    <td className="p-4 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="p-4 text-sm text-black">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-gray-900">{itemCount} items</td>
                    <td className="p-4 text-sm text-gray-900">{formatPrice(Number(order.total))}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}