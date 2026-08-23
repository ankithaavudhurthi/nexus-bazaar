"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authorized");
  return session.user;
}

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId } });
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  customImage?: string,
  customText?: string
) {
  let user;
  try {
    user = await requireUser();
  } catch (err: any) {
    if (err?.message === "Not authorized") {
      return { unauthenticated: true, error: "Not authorized" };
    }
    throw err;
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    return { error: "This product isn't available" };
  }
  if (product.stock < quantity) {
    return { error: "Not enough stock available" };
  }

  if (product.isCustomizable) {
    const type = product.customizationType ?? "PHOTO";
    const requiresPhoto = type === "PHOTO" || type === "PHOTO_TEXT";
    const requiresText = type === "TEXT" || type === "PHOTO_TEXT";

    if (requiresPhoto && !customImage) {
      return { error: "Please upload a reference image before adding to cart" };
    }
    if (requiresText && !customText?.trim()) {
      return { error: "Please enter your custom text before adding to cart" };
    }
  }

  const cart = await getOrCreateCart(user.id);

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQty = Math.min(existingItem.quantity + quantity, product.stock);
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQty,
        customImage: customImage || existingItem.customImage,
        customText: customText?.trim() || existingItem.customText,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: Math.min(quantity, product.stock),
        customImage: customImage || null,
        customText: customText?.trim() || null,
      },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/products/[slug]", "page");
  return { success: true };
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const user = await requireUser();

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  });
  if (!item || item.cart.userId !== user.id) return { error: "Item not found" };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: Math.min(quantity, item.product.stock) },
    });
  }

  revalidatePath("/cart");
}

export async function removeCartItem(cartItemId: string) {
  const user = await requireUser();

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== user.id) return { error: "Item not found" };

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
}
