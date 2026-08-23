import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { CatalogSearchParams } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";
import { CatalogFilterBar } from "@/components/catalog/filter-bar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Pagination } from "@/components/catalog/pagination";

const PAGE_SIZE = 24;

const sortMap = {
  newest: { createdAt: "desc" as const },
  price_asc: { basePrice: "asc" as const },
  price_desc: { basePrice: "desc" as const },
  rating: { avgRating: "desc" as const },
};

// Deduplicate category lookup between metadata and page component
const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };

  return {
    title: `${category.name} — Nexus Bazaar`,
    description: `Shop ${category.name} from vendors across Nexus Bazaar.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const page = Math.max(1, Number(search.page) || 1);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  // Products in this category and its direct subcategories.
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const where = {
    status: "ACTIVE" as const,
    categoryId: { in: categoryIds },
    ...(search.minPrice || search.maxPrice
      ? {
          basePrice: {
            ...(search.minPrice ? { gte: Number(search.minPrice) } : {}),
            ...(search.maxPrice ? { lte: Number(search.maxPrice) } : {}),
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        vendor: { select: { shopName: true, shopSlug: true } },
      },
      orderBy: sortMap[(search.sort as keyof typeof sortMap) ?? "newest"] ?? sortMap.newest,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 pt-24">
        <h1 className="font-display text-2xl font-semibold">{category.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {total} product{total === 1 ? "" : "s"}
        </p>

        {category.children.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {category.children.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-steel)] hover:text-[var(--color-text-primary)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6">
          <CatalogFilterBar
            basePath={`/category/${slug}`}
            current={{
              sort: search.sort,
            }}
          />
        </div>

        <ProductGrid products={products} />

        <Pagination
          basePath={`/category/${slug}`}
          currentParams={search}
          page={page}
          pageCount={pageCount}
        />
      </main>
    </>
  );
}
