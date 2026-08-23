"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const vendorRegisterSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Enter a valid phone number"),
  city: z.string().min(2, "City is required"),
  category: z.string().min(2, "Category is required"),
  shopName: z.string().min(2, "Shop name is required"),
  shopDescription: z.string().optional(),
  // Hidden/optional fields for DB compatibility
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankIFSC: z.string().optional(),
});

export type VendorRegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerVendor(
  _prevState: VendorRegisterState,
  formData: FormData
): Promise<VendorRegisterState> {
  const parsed = vendorRegisterSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const baseSlug = slugify(data.shopName);
  let shopSlug = baseSlug;
  let suffix = 1;
  while (await prisma.vendorProfile.findUnique({ where: { shopSlug } })) {
    shopSlug = `${baseSlug}-${suffix++}`;
  }

  // Apply safe DB fallbacks for COD-only flow
  const businessName = data.name; // Use owner name as business name
  const gstNumber = null;
  const panNumber = null;
  const bankAccountName = data.name; // Use owner name as bank account name
  const bankAccountNo = "PENDING_COD_SETTLEMENT"; // Placeholder for COD-only
  const bankIFSC = "CODONLY0000"; // Placeholder for COD-only

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    include: { vendorProfile: true },
  });

  if (existingUser) {
    if (existingUser.vendorProfile) {
      return { error: "An account or seller application already exists for this email" };
    }

    if (existingUser.passwordHash) {
      const validPassword = await bcrypt.compare(data.password, existingUser.passwordHash);
      if (!validPassword) {
        return { error: "Incorrect password for your existing account" };
      }
    }

    // Upgrade existing customer to VENDOR role while preserving exact userId and customer data
    await prisma.$transaction([
      prisma.user.update({
        where: { id: existingUser.id },
        data: { role: "VENDOR" },
      }),
      prisma.vendorProfile.create({
        data: {
          userId: existingUser.id,
          shopName: data.shopName,
          shopSlug,
          shopDescription: data.shopDescription || null,
          businessName,
          gstNumber,
          panNumber,
          bankAccountName,
          bankAccountNo,
          bankIFSC,
          status: "PENDING",
        },
      }),
    ]);

    return { success: true };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  // Brand-new vendor registration
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      role: "VENDOR",
      vendorProfile: {
        create: {
          shopName: data.shopName,
          shopSlug,
          shopDescription: data.shopDescription || null,
          businessName,
          gstNumber,
          panNumber,
          bankAccountName,
          bankAccountNo,
          bankIFSC,
          status: "PENDING",
        },
      },
    },
  });

  return { success: true };
}
