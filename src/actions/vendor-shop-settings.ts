"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireApprovedVendor } from "@/lib/vendor-guard";
import { prisma } from "@/lib/prisma";

const shopSettingsSchema = z.object({
  shopName: z.string().min(2, "Shop name is required"),
  shopDescription: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  instagramHandle: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export type ShopSettingsActionState = { error?: string; success?: boolean };

export async function updateShopSettings(
  _prevState: ShopSettingsActionState,
  formData: FormData
): Promise<ShopSettingsActionState> {
  const vendor = await requireApprovedVendor();

  const parsed = shopSettingsSchema.safeParse({
    shopName: formData.get("shopName"),
    shopDescription: formData.get("shopDescription") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    bannerUrl: formData.get("bannerUrl") || undefined,
    instagramHandle: formData.get("instagramHandle") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      shopName: parsed.data.shopName,
      shopDescription: parsed.data.shopDescription || null,
      logoUrl: parsed.data.logoUrl || null,
      bannerUrl: parsed.data.bannerUrl || null,
      instagramHandle: parsed.data.instagramHandle || null,
      websiteUrl: parsed.data.websiteUrl || null,
    },
  });

  revalidatePath("/vendor/shop-settings");
  revalidatePath(`/shop/${vendor.shopSlug}`);
  return { success: true };
}
