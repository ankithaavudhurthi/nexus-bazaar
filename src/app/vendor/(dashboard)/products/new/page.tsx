import { prisma } from "@/lib/prisma";
import { createProduct } from "@/actions/vendor-products";
import { ProductForm } from "@/components/vendor/product-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add a product</CardTitle>
          <CardDescription className="text-base">
            Fill in the product details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} action={createProduct} />
        </CardContent>
      </Card>
    </main>
  );
}
