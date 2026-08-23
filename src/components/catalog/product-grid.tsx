import { ProductCard, type ProductCardData } from "@/components/catalog/product-card";

type GridProduct = {
  slug: string;
  name: string;
  basePrice: unknown;
  compareAtPrice: unknown;
  avgRating: number;
  reviewCount: number;
  isFeatured?: boolean;
  images: { url: string }[];
  vendor: { shopName: string };
};

export function ProductGrid({ products }: { products: GridProduct[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">
        No products match these filters yet.
      </p>
    );
  }

  const mapped: ProductCardData[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    basePrice: String(p.basePrice),
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : null,
    imageUrl: p.images[0]?.url,
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
    vendorShopName: p.vendor.shopName,
    isFeatured: p.isFeatured,
  }));

  return (
    <div className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {mapped.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
