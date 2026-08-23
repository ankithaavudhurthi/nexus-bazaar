import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getCachedCategories } from "@/lib/cache";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCachedCategories().then(cats => cats.slice(0, 6)),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: [{ position: "asc" }], take: 1 },
        vendor: { select: { shopName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-20 px-4">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="text-5xl font-bold text-[var(--color-text-primary)] mb-6">
              Welcome to Our Marketplace
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-10 text-xl">
              Shop from multiple vendors in one place
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/products" className="btn-gold">
                Browse Products
              </Link>
              <Link href="/shops" className="btn-secondary">
                View Shops
              </Link>
            </div>
          </div>
        </section>

        {categories.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="card p-6 text-center group"
                >
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-gold)] transition-colors">{category.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Latest Products</h2>
            <Link href="/products" className="text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] font-medium transition-colors">
              View all →
            </Link>
          </div>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="card p-12 text-center">
              <p className="text-[var(--color-text-secondary)]">No products available yet</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}