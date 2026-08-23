import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateProduct } from "@/actions/vendor-products";
import { ProductForm } from "@/components/vendor/product-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: true, vendor: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product || product.vendor.userId !== session.user.id) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit {product.name}</CardTitle>
          <CardDescription className="font-numeric text-base">SKU {product.sku}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories}
            action={boundUpdate}
            existing={{
              id: product.id,
              name: product.name,
              categoryId: product.categoryId,
              description: product.description,
              basePrice: product.basePrice.toString(),
              compareAtPrice: product.compareAtPrice?.toString() ?? null,
              stock: product.stock,
              images: product.images,
              isCustomizable: product.isCustomizable,
              customizationType: product.customizationType,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
