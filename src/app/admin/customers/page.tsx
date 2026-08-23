import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const buyers = await prisma.user.findMany({
    where: {
      role: "BUYER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      orders: {
        where: { paymentStatus: "PAID" },
        select: { total: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Users</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Manage customer accounts</p>
      </div>

      <div className="card p-4">
        <form action="/admin/customers" method="GET">
          <div className="relative search-bar">
            <input
              type="text"
              name="q"
              placeholder="Search users..."
              defaultValue={q}
              className="w-full px-4 py-2 text-sm outline-none"
            />
          </div>
        </form>
      </div>

      <div className="card">
        {buyers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[var(--color-text-secondary)]">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-black">Name</th>
                <th className="text-left p-4 text-sm font-medium text-black">Email</th>
                <th className="text-left p-4 text-sm font-medium text-black">Orders</th>
                <th className="text-left p-4 text-sm font-medium text-black">Total Spent</th>
                <th className="text-left p-4 text-sm font-medium text-black">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer) => {
                const totalSpent = buyer.orders.reduce((sum, order) => sum + Number(order.total), 0);
                return (
                  <tr key={buyer.id} className="border-b border-[var(--color-border)]">
                    <td className="p-4 font-medium text-[var(--color-text-primary)]">{buyer.name}</td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{buyer.email}</td>
                    <td className="p-4 text-sm text-[var(--color-text-primary)]">{buyer.orders.length}</td>
                    <td className="p-4 text-sm text-[var(--color-text-primary)]">{formatPrice(totalSpent)}</td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{new Date(buyer.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Link href={`/admin/customers/${buyer.id}`} className="text-sm text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] font-medium transition-colors">
                        View Profile
                      </Link>
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