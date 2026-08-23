import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [pendingVendors, totalVendors, totalCustomers, totalOrders] =
    await Promise.all([
      prisma.vendorProfile.count({ where: { status: "PENDING" } }),
      prisma.vendorProfile.count({ where: { status: "APPROVED" } }),
      prisma.user.count({ where: { role: "BUYER" } }),
      prisma.order.count(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-700">Overview of platform activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Total Shops</p>
          <p className="text-2xl font-bold text-[var(--color-gold)]">{totalVendors}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Pending Approvals</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{pendingVendors}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Total Users</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalCustomers}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Total Orders</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalOrders}</p>
        </div>
      </div>

      {pendingVendors > 0 && (
        <div className="card p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-900 font-medium">
            {pendingVendors} vendor{pendingVendors > 1 ? 's' : ''} pending approval
          </p>
          <Link href="/admin/vendors" className="text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors">
            Review applications →
          </Link>
        </div>
      )}
    </div>
  );
}