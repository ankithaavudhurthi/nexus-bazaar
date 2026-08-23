"use server";

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireApprovedVendor } from "@/lib/vendor-guard";
import { uploadProductImage } from "@/lib/storage";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function uniqueProductSlug(name: string, ignoreProductId?: string) {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (
    await prisma.product.findFirst({
      where: {
        slug,
        ...(ignoreProductId ? { id: { not: ignoreProductId } } : {}),
      },
    })
  ) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  brandName: z.string().optional(),
  categoryId: z.string().min(1, "Choose a category"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.coerce.number().positive("Enter a valid price"),
  compareAtPrice: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0),
  isCustomizable: z.boolean().optional(),
  customizationType: z.enum(["PHOTO", "TEXT", "PHOTO_TEXT"]).optional().nullable(),
});

export type ProductActionState = { error?: string; success?: boolean; productId?: string };

async function collectImageUrls(vendorId: string, formData: FormData) {
  const urls: string[] = [];

  // Manually entered URLs (comma-separated) — always supported, no storage config needed.
  const urlField = formData.get("imageUrls");
  if (typeof urlField === "string" && urlField.trim()) {
    const rawParts = urlField
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const parsedUrls: string[] = [];
    for (const part of rawParts) {
      const startsNewProductUrl =
        /^(https?:\/\/|\/|data:)/i.test(part) || parsedUrls.length === 0;

      if (startsNewProductUrl) {
        parsedUrls.push(part);
      } else {
        parsedUrls[parsedUrls.length - 1] = `${parsedUrls[parsedUrls.length - 1]},${part}`;
      }
    }

    for (const url of parsedUrls) {
      const subParts = url.split(/\s+/).filter(Boolean);
      for (const sub of subParts) {
        if (sub.length > 0) {
          urls.push(sub);
        }
      }
    }
  }

  // File uploads — requires SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY to be set.
  const files = formData
    .getAll("imageFiles")
    .filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    urls.push(await uploadProductImage(file, vendorId));
  }

  return urls;
}

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const vendor = await requireApprovedVendor();

  const isCustomizable = formData.get("isCustomizable") === "true";
  const rawCustomType = formData.get("customizationType");
  const customizationType = isCustomizable && typeof rawCustomType === "string" ? rawCustomType : null;

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    brandName: formData.get("brandName"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    compareAtPrice: formData.get("compareAtPrice") || "",
    stock: formData.get("stock"),
    isCustomizable,
    customizationType,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  let imageUrls: string[];
  try {
    imageUrls = await collectImageUrls(vendor.id, formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed" };
  }

  const slug = await uniqueProductSlug(data.name);
  const sku = slug.toUpperCase().replace(/-/g, "_");
  const status = data.stock > 0 ? "ACTIVE" : "OUT_OF_STOCK";

  await prisma.product.create({
    data: {
      vendorId: vendor.id,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      basePrice: data.basePrice,
      compareAtPrice: data.compareAtPrice || null,
      sku,
      stock: data.stock,
      status,
      isCustomizable: data.isCustomizable ?? false,
      customizationType: data.isCustomizable ? (data.customizationType as any) : null,
      specs: { create: [] },
      images: {
        create: imageUrls.map((url, i) => ({ url, position: i })),
      },
    },
  });

  revalidateTag("catalog-products");
  revalidatePath("/vendor/products");
  redirect("/vendor/products");
}

export async function updateProduct(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const vendor = await requireApprovedVendor();

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.vendorId !== vendor.id) {
    return { error: "Product not found" };
  }

  const isCustomizable = formData.get("isCustomizable") === "true";
  const rawCustomType = formData.get("customizationType");
  const customizationType = isCustomizable && typeof rawCustomType === "string" ? rawCustomType : null;

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    brandName: formData.get("brandName"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    compareAtPrice: formData.get("compareAtPrice") || "",
    stock: formData.get("stock"),
    isCustomizable,
    customizationType,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  let newImageUrls: string[];
  try {
    newImageUrls = await collectImageUrls(vendor.id, formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed" };
  }

  const slug = await uniqueProductSlug(data.name, productId);
  const sku = slug.toUpperCase().replace(/-/g, "_");
  const status = data.stock > 0 ? "ACTIVE" : "OUT_OF_STOCK";

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        description: data.description,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice || null,
        sku,
        stock: data.stock,
        status,
        isCustomizable: data.isCustomizable ?? false,
        customizationType: data.isCustomizable ? (data.customizationType as any) : null,
      },
    }),
    prisma.productSpec.deleteMany({ where: { productId } }),
    prisma.productImage.deleteMany({ where: { productId } }),
    ...(newImageUrls.length > 0
      ? [
          prisma.productImage.createMany({
            data: newImageUrls.map((url, i) => ({ productId, url, position: i })),
          }),
        ]
      : []),
  ]);

  revalidateTag("catalog-products");
  revalidatePath("/vendor/products");
  revalidatePath(`/vendor/products/${productId}/edit`);
  return { success: true, productId };
}

export async function quickUpdateStock(productId: string, stock: number) {
  const vendor = await requireApprovedVendor();

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.vendorId !== vendor.id) {
    return { error: "Product not found" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      stock,
      status: stock === 0 && existing.status === "ACTIVE" ? "OUT_OF_STOCK" : existing.status,
    },
  });

  revalidateTag("catalog-products");
  revalidatePath("/vendor/products");
}

export async function archiveProduct(productId: string) {
  const vendor = await requireApprovedVendor();

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.vendorId !== vendor.id) {
    return { error: "Product not found" };
  }

  await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
  revalidateTag("catalog-products");
  revalidatePath("/vendor/products");
}
