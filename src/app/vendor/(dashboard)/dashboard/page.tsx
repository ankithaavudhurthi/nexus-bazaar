import Link from "next/link";
import { getMemoizedSession, getMemoizedVendorProfile } from "@/lib/memoized-auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function SellerDashboardPage() {
  const session = await getMemoizedSession();
  
  if (!session?.user?.id) return null;

  const profile = await getMemoizedVendorProfile(session.user.id);

  if (!profile) return null;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [revenueAgg, pendingCount, totalProductsCount] = await Promise.all([
    prisma.vendorOrder.aggregate({
      where: {
        vendorId: profile.id,
        order: { paymentStatus: "PAID" },
        createdAt: { gte: startOfMonth },
      },
      _sum: { vendorEarning: true },
    }),
    prisma.vendorOrder.count({
      where: {
        vendorId: profile.id,
        fulfillmentStatus: { in: ["PENDING", "PACKED"] },
      },
    }),
    prisma.product.count({
      where: { vendorId: profile.id },
    }),
  ]);

  const currentEarnings = revenueAgg._sum.vendorEarning?.toString() ?? "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{profile.shopName}</h1>
          <p className="text-base text-[var(--color-text-secondary)] mt-1">Vendor Dashboard</p>
        </div>
        <div className="flex gap-3">
          <Link href="/vendor/products/new" className="btn-secondary">
            Add Product
          </Link>
          <Link href="/vendor/orders" className="btn-gold-sm">
            View Orders
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card p-6">
          <p className="text-base font-semibold text-[var(--color-text-secondary)]">Monthly Earnings</p>
          <p className="text-3xl font-bold text-[var(--color-gold)] mt-2">{formatPrice(currentEarnings)}</p>
        </div>
        <div className="card p-6">
          <p className="text-base font-semibold text-[var(--color-text-secondary)]">Orders to Fulfill</p>
          <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">{pendingCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-base font-semibold text-[var(--color-text-secondary)]">Total Products</p>
          <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">{totalProductsCount}</p>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="card p-6 bg-amber-50 border-amber-200">
          <p className="text-base text-amber-900 font-semibold">
            {pendingCount} order{pendingCount > 1 ? 's' : ''} pending fulfillment
          </p>
          <Link href="/vendor/orders" className="text-base text-amber-700 hover:text-amber-900 font-semibold transition-colors">
            Process orders →
          </Link>
        </div>
      )}
    </div>
  );
}