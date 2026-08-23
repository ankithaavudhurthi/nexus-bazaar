import Link from "next/link";
import { redirect } from "next/navigation";
import { getMemoizedSession } from "@/lib/memoized-auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";

export default async function WishlistPage() {
  const session = await getMemoizedSession();
  if (!session?.user) redirect("/login?next=/account/wishlist");

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
              vendor: { select: { shopName: true } },
            },
          },
        },
      },
    },
  });

  const products = (wishlist?.items ?? [])
    .map((i) => i.product)
    .filter((p) => p.status === "ACTIVE");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 pt-24">
        <h1 className="font-display text-2xl font-semibold">Your wishlist</h1>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Nothing saved yet — tap the heart on any product to add it here.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </main>
    </>
  );
}
