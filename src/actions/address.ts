"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  label: z.string().min(1, "Give this address a label"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(4, "Enter a valid pincode"),
  phone: z.string().min(6, "Enter a valid phone number"),
});

export type AddressActionState = { error?: string; success?: boolean };

export async function createAddress(
  _prevState: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } });

  await prisma.address.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
      line2: parsed.data.line2 || null,
      isDefault: existingCount === 0,
    },
  });

  revalidatePath("/checkout");
  return { success: true };
}
