"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireApprovedVendor } from "@/lib/vendor-guard";

async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

const reviewSchema = z.object({
  orderItemId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(5, "Tell us a bit more about the product"),
});

export type ReviewActionState = { error?: string; success?: boolean };

export async function createReview(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const parsed = reviewSchema.safeParse({
    orderItemId: formData.get("orderItemId"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: parsed.data.orderItemId },
    include: { vendorOrder: { include: { order: true } } },
  });
  if (!orderItem || orderItem.vendorOrder.order.buyerId !== session.user.id) {
    return { error: "Order item not found" };
  }
  if (orderItem.vendorOrder.fulfillmentStatus !== "DELIVERED") {
    return { error: "You can review this once it's delivered" };
  }

  const existing = await prisma.review.findFirst({ where: { orderItemId: orderItem.id } });
  if (existing) return { error: "You've already reviewed this item" };

  await prisma.review.create({
    data: {
      productId: orderItem.productId,
      buyerId: session.user.id,
      orderItemId: orderItem.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
    },
  });

  await recomputeProductRating(orderItem.productId);

  revalidatePath("/account/orders");
  revalidatePath("/products/[slug]", "page");
  return { success: true };
}

const replySchema = z.object({
  reviewId: z.string(),
  vendorReply: z.string().min(1, "Reply can't be empty"),
});

export async function replyToReview(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const vendor = await requireApprovedVendor();

  const parsed = replySchema.safeParse({
    reviewId: formData.get("reviewId"),
    vendorReply: formData.get("vendorReply"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const review = await prisma.review.findUnique({
    where: { id: parsed.data.reviewId },
    include: { product: true },
  });
  if (!review || review.product.vendorId !== vendor.id) {
    return { error: "Review not found" };
  }

  await prisma.review.update({
    where: { id: review.id },
    data: { vendorReply: parsed.data.vendorReply },
  });

  revalidatePath("/products/[slug]", "page");
  return { success: true };
}
