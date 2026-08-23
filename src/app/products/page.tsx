import { prisma } from "@/lib/prisma";
import { queryCatalog, type CatalogSearchParams } from "@/lib/catalog";
import { getCachedCategories } from "@/lib/cache";
import { SiteHeader } from "@/components/site-header";
import { CatalogFilterBar } from "@/components/catalog/filter-bar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Pagination } from "@/components/catalog/pagination";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;

  const categories = await getCachedCategories();
  const selectedCategory = params.category
    ? categories.find((c) => c.slug === params.category) ||
      (await prisma.category.findUnique({ where: { slug: params.category } }))
    : null;

  const { products, total, page, pageCount } = await queryCatalog(params, selectedCategory?.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 pt-24">
        <h1 className="font-display text-2xl font-semibold">
          {params.q ? `Results for "${params.q}"` : "All products"}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {total} product{total === 1 ? "" : "s"}
        </p>

        <div className="mt-6">
          <CatalogFilterBar
            basePath="/products"
            categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
            current={{
              category: params.category,
              sort: params.sort,
              q: params.q,
            }}
          />
        </div>

        <ProductGrid products={products} />

        <Pagination
          basePath="/products"
          currentParams={params}
          page={page}
          pageCount={pageCount}
        />
      </main>
    </>
  );
}
