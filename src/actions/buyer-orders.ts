"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const refundSchema = z.object({
  vendorOrderId: z.string(),
  reason: z.string().min(5, "Tell us a bit more about the issue"),
});

export type RefundActionState = { error?: string; success?: boolean };

export async function requestRefund(
  _prevState: RefundActionState,
  formData: FormData
): Promise<RefundActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const parsed = refundSchema.safeParse({
    vendorOrderId: formData.get("vendorOrderId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const vendorOrder = await prisma.vendorOrder.findUnique({
    where: { id: parsed.data.vendorOrderId },
    include: { order: true },
  });
  if (!vendorOrder || vendorOrder.order.buyerId !== session.user.id) {
    return { error: "Order not found" };
  }
  if (vendorOrder.order.paymentStatus !== "PAID") {
    return { error: "This order hasn't been paid yet" };
  }

  const existing = await prisma.refundRequest.findFirst({
    where: { vendorOrderId: vendorOrder.id, status: { in: ["REQUESTED", "APPROVED"] } },
  });
  if (existing) return { error: "A refund request is already in progress for this order" };

  await prisma.refundRequest.create({
    data: {
      vendorOrderId: vendorOrder.id,
      buyerId: session.user.id,
      reason: parsed.data.reason,
      amount: vendorOrder.subtotal,
      status: "REQUESTED",
    },
  });

  revalidatePath("/account/orders");
  return { success: true };
}
