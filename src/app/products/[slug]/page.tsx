import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import type { Metadata } from "next";
import { getMemoizedSession, getMemoizedVendorProfile } from "@/lib/memoized-auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, discountPercent } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductGrid } from "@/components/catalog/product-grid";
import { AddToCartControl } from "@/components/catalog/add-to-cart-control";
import { WishlistButton } from "@/components/catalog/wishlist-button";
import { ReviewList } from "@/components/catalog/review-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// React cache deduplicates query across generateMetadata and ProductDetailPage
const getProductBySlugOrId = cache(async (slug: string) => {
  const decoded = decodeURIComponent(slug);
  return prisma.product.findFirst({
    where: {
      OR: [{ slug }, { slug: decoded }, { id: slug }],
    },
    include: {
      images: { orderBy: { position: "asc" } },
      specs: { include: { attribute: true } },
      vendor: true,
      category: true,
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  if (!product) return { title: "Product not found" };

  const description = product.description.slice(0, 155);

  return {
    title: `${product.name} — Nexus Bazaar`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  if (!product || product.status !== "ACTIVE") notFound();

  // Run session check and secondary queries in parallel
  const session = await getMemoizedSession();

  const [reviews, wishlistItem, vendorProfile, related] = await Promise.all([
    prisma.review.findMany({
      where: { productId: product.id },
      include: { buyer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    session?.user
      ? prisma.wishlistItem.findFirst({
          where: { productId: product.id, wishlist: { userId: session.user.id } },
        })
      : null,
    session?.user?.role === "VENDOR"
      ? getMemoizedVendorProfile(session.user.id)
      : null,
    prisma.product.findMany({
      where: { categoryId: product.categoryId, status: "ACTIVE", id: { not: product.id } },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        vendor: { select: { shopName: true } },
      },
      take: 4,
    }),
  ]);

  const canReplyAsVendor = vendorProfile?.id === product.vendorId;

  const discount = product.compareAtPrice
    ? discountPercent(product.basePrice.toString(), product.compareAtPrice.toString())
    : 0;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agniomega.com";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.sku,
    brand: { "@type": "Brand", name: product.vendor.shopName },
    offers: {
      "@type": "Offer",
      price: product.basePrice.toString(),
      priceCurrency: "INR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${product.slug}`,
    },
  };

  const formattedImages =
    product.images.length > 0
      ? product.images.map((i) => ({ url: i.url, altText: i.altText }))
      : [{ url: "/placeholder-product.svg", altText: product.name }];

  return (
    <>
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <main className="mx-auto max-w-7xl px-6 py-10 pt-24">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Link href="/" className="hover:text-[var(--color-text-primary)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[var(--color-text-primary)]">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/category/${product.category.slug}`}
            className="hover:text-[var(--color-text-primary)]"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-primary)] truncate max-w-xs font-medium">
            {product.name}
          </span>
        </nav>

        {/* Top Split: Gallery + Key Buy Block */}
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ProductGallery images={formattedImages} productName={product.name} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div>
              <Link
                href={`/shop/${product.vendor.shopSlug}`}
                className="text-sm font-bold uppercase tracking-wider text-[var(--color-gold-dark)] hover:underline"
              >
                {product.vendor.shopName}
              </Link>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] mt-1">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              {product.reviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[var(--color-ignition)] text-[var(--color-ignition)]" />
                    <span className="font-numeric font-semibold text-[var(--color-text-primary)]">
                      {product.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <span>•</span>
                  <span>
                    {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <span className="italic">No reviews yet</span>
              )}
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-3 rounded-lg bg-[var(--color-surface)] p-4 border border-[var(--color-border)]">
              <span className="font-numeric text-3xl font-bold text-[var(--color-text-primary)]">
                {formatPrice(product.basePrice.toString())}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="font-numeric text-lg text-[var(--color-text-secondary)] line-through">
                    {formatPrice(product.compareAtPrice.toString())}
                  </span>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-success)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-danger)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <AddToCartControl
                productId={product.id}
                stock={product.stock}
                isCustomizable={product.isCustomizable}
                customizationType={product.customizationType}
              />
              <WishlistButton
                productId={product.id}
                initialWishlisted={!!wishlistItem}
              />
              {!session && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  <Link href="/login" className="text-[var(--color-gold-dark)] underline">
                    Log in
                  </Link>{" "}
                  to add items to your wishlist.
                </p>
              )}
            </div>

            {/* Seller Card */}
            <Card className="mt-4 bg-[var(--color-bg)] border-[var(--color-border)]">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)]">Sold by</p>
                  <p className="font-display font-semibold text-[var(--color-text-primary)]">
                    {product.vendor.shopName}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="btn-outline">
                  <Link href={`/shop/${product.vendor.shopSlug}`}>Visit Shop</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Specifications & Description */}
        <section className="mt-16 border-t border-[var(--color-border)] pt-10">
          <h2 className="font-display text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
            Product Details
          </h2>

          <div className="prose max-w-none text-[var(--color-text-secondary)] leading-relaxed mb-8">
            <p className="whitespace-pre-line text-base">{product.description}</p>
          </div>

          {product.specs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold mb-3 text-[var(--color-text-primary)]">
                Specifications
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {product.specs.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex justify-between rounded-md bg-[var(--color-surface)] p-3 text-sm border border-[var(--color-border)]"
                  >
                    <span className="font-medium text-[var(--color-text-secondary)]">
                      {spec.attribute.name}
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {spec.value} {spec.attribute.unit ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Reviews Section */}
        <section className="mt-16 border-t border-[var(--color-border)] pt-10">
          <ReviewList
            reviews={reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              title: r.title,
              body: r.body,
              buyerName: r.buyer.name,
              createdAt: r.createdAt,
              vendorReply: r.vendorReply,
            }))}
            canReplyAsVendor={canReplyAsVendor}
          />
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-[var(--color-border)] pt-10">
            <h2 className="font-display text-xl font-semibold mb-6 text-[var(--color-text-primary)]">
              You might also like
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </main>
    </>
  );
}
