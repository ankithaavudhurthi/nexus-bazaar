import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Instagram, Globe } from "lucide-react";
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

// Deduplicate vendor lookup between metadata and page component
const getVendorBySlug = cache(async (slug: string) => {
  return prisma.vendorProfile.findUnique({ where: { shopSlug: slug } });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return { title: "Shop not found" };

  return {
    title: `${vendor.shopName} — Nexus Bazaar`,
    description: vendor.shopDescription?.slice(0, 155) ?? `Shop ${vendor.shopName} on Nexus Bazaar.`,
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const page = Math.max(1, Number(search.page) || 1);

  const vendor = await getVendorBySlug(slug);
  if (!vendor || vendor.status !== "APPROVED") notFound();

  const where = {
    status: "ACTIVE" as const,
    vendorId: vendor.id,
    ...(search.minPrice || search.maxPrice
      ? {
          basePrice: {
            ...(search.minPrice ? { gte: Number(search.minPrice) } : {}),
            ...(search.maxPrice ? { lte: Number(search.maxPrice) } : {}),
          },
        }
      : {}),
  };

  const [products, total, avgRatingAgg] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        vendor: { select: { shopName: true } },
      },
      orderBy: sortMap[(search.sort as keyof typeof sortMap) ?? "newest"] ?? sortMap.newest,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.aggregate({
      where: { vendorId: vendor.id, status: "ACTIVE" },
      _avg: { avgRating: true },
      _sum: { reviewCount: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-[var(--color-bg)] pt-20 pb-16">
        {/* Hero Section with Minimalistic Centered Banner */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] shadow-md">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 px-6 py-8">
              <div className="flex items-end gap-6">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
                  {vendor.logoUrl && (
                    <Image
                      src={vendor.logoUrl}
                      alt={vendor.shopName}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-4xl font-bold text-white mb-2">{vendor.shopName}</h1>
                  {avgRatingAgg._sum.reviewCount ? (
                    <div className="flex items-center gap-2 text-white">
                      <Star className="h-5 w-5 fill-[#FFD700] text-[#FFD700]" />
                      <span className="font-numeric text-lg font-semibold">
                        {(avgRatingAgg._avg.avgRating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-sm opacity-90">({avgRatingAgg._sum.reviewCount} reviews)</span>
                    </div>
                  ) : (
                    <p className="text-white opacity-90 text-sm">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Content */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          {vendor.shopDescription && (
            <p className="text-black text-base leading-relaxed max-w-3xl mb-4">
              {vendor.shopDescription}
            </p>
          )}

          {(vendor.instagramHandle || vendor.websiteUrl) && (
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              {vendor.instagramHandle && (
                <a
                  href={`https://instagram.com/${vendor.instagramHandle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--color-gold-dark)] hover:underline"
                >
                  <Instagram className="h-4 w-4" />
                  @{vendor.instagramHandle.replace(/^@/, '')}
                </a>
              )}
              {vendor.websiteUrl && (
                <a
                  href={vendor.websiteUrl.startsWith('http') ? vendor.websiteUrl : `https://${vendor.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--color-gold-dark)] hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {vendor.websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          )}

          <div className="mb-6">
            <CatalogFilterBar
              basePath={`/shop/${slug}`}
              current={{
                sort: search.sort,
              }}
            />
          </div>

          <ProductGrid products={products} />

          <Pagination
            basePath={`/shop/${slug}`}
            currentParams={search}
            page={page}
            pageCount={pageCount}
          />
        </div>
      </main>
    </>
  );
}