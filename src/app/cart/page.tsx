import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/cart");

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
              vendor: { select: { shopName: true, id: true } },
            },
          },
        },
      },
    },
  });

  const items = cart?.items.filter((i) => i.product.status === "ACTIVE") ?? [];

  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.product.vendor.shopName;
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  const subtotal = items.reduce((sum, i) => sum + Number(i.product.basePrice) * i.quantity, 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-10 pt-24">
        <h1 className="font-display text-2xl font-semibold">Your cart</h1>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">Your cart is empty.</p>
            <Button className="mt-4" asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {Array.from(grouped.entries()).map(([shopName, shopItems]) => (
              <Card key={shopName}>
                <CardHeader>
                  <CardTitle className="text-base">{shopName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {shopItems.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={{
                        id: item.id,
                        quantity: item.quantity,
                        stock: item.product.stock,
                        productSlug: item.product.slug,
                        productName: item.product.name,
                        imageUrl: item.product.images[0]?.url,
                        unitPrice: item.product.basePrice.toString(),
                        customImage: item.customImage,
                        customText: item.customText,
                      }}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Subtotal</p>
                  <p className="font-numeric text-xl font-semibold">{formatPrice(subtotal)}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Tax calculated at checkout
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
