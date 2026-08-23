"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVendorApprovedEmail, sendVendorRejectedEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session.user;
}

export async function approveVendor(vendorProfileId: string) {
  const admin = await requireAdmin();

  const profile = await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: { status: "APPROVED", approvedAt: new Date(), rejectionReason: null },
    include: { user: { select: { email: true } } },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "VENDOR_APPROVED",
      targetType: "VendorProfile",
      targetId: profile.id,
    },
  });

  await sendVendorApprovedEmail(profile.user.email, profile.shopName);

  revalidatePath("/admin/vendors");
}

const rejectSchema = z.object({
  vendorProfileId: z.string(),
  reason: z.string().min(3, "Please provide a reason"),
});

export async function rejectVendor(formData: FormData) {
  const admin = await requireAdmin();

  const parsed = rejectSchema.safeParse({
    vendorProfileId: formData.get("vendorProfileId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return;

  const profile = await prisma.vendorProfile.update({
    where: { id: parsed.data.vendorProfileId },
    data: { status: "REJECTED", rejectionReason: parsed.data.reason },
    include: { user: { select: { email: true } } },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "VENDOR_REJECTED",
      targetType: "VendorProfile",
      targetId: profile.id,
      detail: parsed.data.reason,
    },
  });

  await sendVendorRejectedEmail(profile.user.email, profile.shopName, parsed.data.reason);

  revalidatePath("/admin/vendors");
}

export async function suspendVendor(vendorProfileId: string) {
  const admin = await requireAdmin();

  const profile = await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: { status: "SUSPENDED" },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "VENDOR_SUSPENDED",
      targetType: "VendorProfile",
      targetId: profile.id,
    },
  });

  revalidatePath("/admin/vendors");
}

export async function reactivateMerchant(vendorProfileId: string) {
  const admin = await requireAdmin();

  const profile = await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: { status: "APPROVED", rejectionReason: null },
    include: { user: { select: { email: true } } },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "MERCHANT_REACTIVATED",
      targetType: "VendorProfile",
      targetId: profile.id,
    },
  });

  await sendVendorApprovedEmail(profile.user.email, profile.shopName);

  revalidatePath("/admin/vendors");
}

export async function updateVendorCommission(vendorProfileId: string, rateInput: string) {
  const admin = await requireAdmin();

  // Empty string clears the override, falling back to the platform default.
  const rate = rateInput.trim() === "" ? null : Number(rateInput);
  if (rate !== null && (Number.isNaN(rate) || rate < 0 || rate > 100)) {
    return { error: "Enter a rate between 0 and 100, or leave blank to clear it" };
  }

  const profile = await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: { commissionRateOverride: rate },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "VENDOR_COMMISSION_OVERRIDE_SET",
      targetType: "VendorProfile",
      targetId: profile.id,
      detail: rate === null ? "cleared" : `${rate}%`,
    },
  });

  revalidatePath("/admin/vendors");
  return { success: true };
}
