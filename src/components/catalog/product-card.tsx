import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatPrice, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  basePrice: string;
  compareAtPrice: string | null;
  imageUrl?: string;
  avgRating: number;
  reviewCount: number;
  vendorShopName: string;
  isFeatured?: boolean;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = product.compareAtPrice
    ? discountPercent(product.basePrice, product.compareAtPrice)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-steel)] hover:shadow-md",
        product.isFeatured && "card-featured border-[var(--color-steel)] shadow-md"
      )}
    >
      {/* Product Image Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg)]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs tracking-wider uppercase text-[var(--color-text-secondary)]">
            No image
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[var(--color-ignition)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-bg)] shadow-sm">
            -{discount}%
          </span>
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <p className="line-clamp-2 text-sm font-medium leading-snug tracking-tight text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-ignition)]">
            {product.name}
          </p>
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-text-secondary)]">
            {product.vendorShopName}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--color-border)]/50">
          {/* Reviews Rating */}
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
            {product.reviewCount > 0 ? (
              <>
                <Star className="h-3.5 w-3.5 fill-[var(--color-ignition)] text-[var(--color-ignition)]" />
                <span className="font-numeric font-semibold text-[var(--color-text-primary)]">
                  {product.avgRating.toFixed(1)}
                </span>
                <span className="text-xs">({product.reviewCount})</span>
              </>
            ) : (
              <span className="text-xs italic text-[var(--color-text-secondary)]">No reviews yet</span>
            )}
          </div>

          {/* Pricing Details */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-numeric text-lg font-bold text-[var(--color-text-primary)]">
              {formatPrice(product.basePrice)}
            </span>
            {product.compareAtPrice && (
              <span className="font-numeric text-xs text-[var(--color-text-secondary)] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}