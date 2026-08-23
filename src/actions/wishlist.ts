"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOrCreateWishlist(userId: string) {
  const existing = await prisma.wishlist.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.wishlist.create({ data: { userId } });
}

export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const wishlist = await getOrCreateWishlist(session.user.id);

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    revalidatePath("/products/[slug]", "page");
    return { wishlisted: false };
  }

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  revalidatePath("/account/wishlist");
  revalidatePath("/products/[slug]", "page");
  return { wishlisted: true };
}
