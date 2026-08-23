"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session.user;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  parentId: z.string().optional(),
});

export type CatalogActionState = { error?: string; success?: boolean };

export async function createCategory(
  _prevState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      parentId: parsed.data.parentId || null,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();

  const productCount = await prisma.product.count({ where: { categoryId } });
  if (productCount > 0) {
    return { error: "Can't delete a category that still has products in it." };
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/settings");
}

const attributeSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1, "Attribute name is required"),
  type: z.enum(["TEXT", "NUMBER", "SELECT"]),
  unit: z.string().optional(),
  options: z.string().optional(), // comma-separated, for SELECT
  required: z.coerce.boolean().optional(),
});

export async function createCategoryAttribute(
  _prevState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  await requireAdmin();

  const parsed = attributeSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    type: formData.get("type"),
    unit: formData.get("unit") || undefined,
    options: formData.get("options") || undefined,
    required: formData.get("required") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const data = parsed.data;

  await prisma.categoryAttribute.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      type: data.type,
      unit: data.unit || null,
      required: !!data.required,
      options:
        data.type === "SELECT" && data.options
          ? data.options.split(",").map((o) => o.trim()).filter(Boolean)
          : [],
    },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteCategoryAttribute(attributeId: string) {
  await requireAdmin();

  const specCount = await prisma.productSpec.count({ where: { attributeId } });
  if (specCount > 0) {
    return { error: "Can't delete an attribute that products already use." };
  }

  await prisma.categoryAttribute.delete({ where: { id: attributeId } });
  revalidatePath("/admin/settings");
}

const settingsSchema = z.object({
  defaultCommissionRate: z.coerce.number().min(0).max(100),
  taxRate: z.coerce.number().min(0).max(100),
});

export async function updatePlatformSettings(
  _prevState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    defaultCommissionRate: formData.get("defaultCommissionRate"),
    taxRate: formData.get("taxRate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
