import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { unstable_cache } from "next/cache";

const getApprovedShops = unstable_cache(
  async () =>
    prisma.vendorProfile.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { shopName: "asc" },
    }),
  ["approved-shops"],
  { tags: ["shops"], revalidate: 300 }
);

export default async function ShopsPage() {
  const vendors = await getApprovedShops();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Our Premium Shops</h1>
            <p className="text-[var(--color-text-secondary)] text-lg">Discover quality products from our trusted vendors</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          {vendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/shop/${vendor.shopSlug}`}
                  className="card-premium p-8 group"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3 group-hover:text-[var(--color-gold)] transition-colors">{vendor.shopName}</h3>
                    <p className="text-sm text-black line-clamp-2">{vendor.shopDescription || "Quality products from trusted vendor"}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                    <span className="text-xs text-black flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></span>
                      Verified Seller
                    </span>
                    <span className="text-sm text-[var(--color-gold)] font-medium group-hover:text-[var(--color-gold-dark)] transition-colors">Visit Shop →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <p className="text-[var(--color-text-secondary)] mb-6 text-lg">No shops available yet</p>
              <Link href="/vendor/register" className="btn-gold">
                Become a Seller
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}