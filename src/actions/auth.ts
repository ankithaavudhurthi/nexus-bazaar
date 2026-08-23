"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerBuyer(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "BUYER",
    },
  });

  return { success: true };
}

export type PasswordResetState = {
  error?: string;
  success?: boolean;
};

export async function requestPasswordReset(email: string): Promise<PasswordResetState> {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    // Don't reveal whether email exists for security
    return { success: true };
  }

  if (!user.passwordHash) {
    return { error: "This account uses OAuth (Google) sign-in and doesn't have a password to reset" };
  }

  // Generate a simple reset token (in production, use a proper token system)
  const resetToken = crypto.randomBytes(16).toString("hex");

  // For demo purposes, we'll just store the token in the user's image field temporarily
  // In production, you'd want a dedicated PasswordReset table
  await prisma.user.update({
    where: { id: user.id },
    data: {
      image: resetToken, // Temporary storage for demo
    },
  });

  // In a real application, you would send an email here with the reset link
  console.log(`Password reset token for ${email}: ${resetToken}`);
  console.log(`Reset link: http://localhost:3002/reset-password?token=${resetToken}&email=${email}`);

  return { success: true };
}

export async function resetPassword(
  token: string,
  email: string,
  newPassword: string
): Promise<PasswordResetState> {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    return { error: "Invalid reset link" };
  }

  // Verify token (simplified - checking if it matches the stored token)
  if (user.image !== token) {
    return { error: "Invalid or expired reset link" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      image: null, // Clear the token
    },
  });

  return { success: true };
}
