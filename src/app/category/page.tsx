import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Shop by Category</h1>
            <p className="text-[var(--color-text-secondary)]">Browse our wide selection of product categories</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="card-premium p-8 group"
                >
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">{category.name}</h3>

                  {category.children.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-black font-medium">Subcategories:</p>
                      {category.children.slice(0, 3).map((child) => (
                        <p key={child.id} className="text-sm text-black">• {child.name}</p>
                      ))}
                      {category.children.length > 3 && (
                        <p className="text-sm text-[var(--color-gold)]">+{category.children.length - 3} more</p>
                      )}
                    </div>
                  )}
                  <span className="text-sm text-[var(--color-gold)] font-medium mt-4 block">Browse →</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center">
              <p className="text-[var(--color-text-secondary)]">No categories available yet</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}