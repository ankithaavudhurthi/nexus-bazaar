import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { Button } from "@/components/ui/button";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/checkout");

  const [cart, addresses, settings] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
    prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  const items = (cart?.items ?? []).filter((i) => i.product.status === "ACTIVE");

  if (items.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-16 pt-28 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Your cart is empty.</p>
          <Button className="mt-4" asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        </main>
      </>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + Number(i.product.basePrice) * i.quantity, 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10 pt-24">
        <h1 className="font-display text-2xl font-semibold">Checkout</h1>

        <div className="mt-6">
          <CheckoutFlow
            addresses={addresses}
            items={items.map((i) => ({
              id: i.id,
              name: i.product.name,
              quantity: i.quantity,
              lineTotal: Number(i.product.basePrice) * i.quantity,
            }))}
            subtotal={subtotal}
            taxRate={settings.taxRate}
          />
        </div>
      </main>
    </>
  );
}
