"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerVendor, type VendorRegisterState } from "@/actions/vendor";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const initialState: VendorRegisterState = {};

export function VendorRegisterForm({ session }: { session: any }) {
  const [state, formAction, pending] = useActionState(registerVendor, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/vendor/pending");
    }
  }, [state.success, router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/" className="mb-8 hover:opacity-90 transition-opacity">
        <Logo />
      </Link>

      <Card className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/40 px-6 py-8 sm:px-8 space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Partner Onboarding Application
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Submit your business credentials to launch your verified storefront. Applications are evaluated by our merchant team within 24–48 business hours.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          {session?.user && (
            <div className="mb-6 rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-3.5 text-xs text-[var(--color-text-primary)] font-medium">
              Upgrading logged-in account (<strong>{session.user.email}</strong>) to a Seller account. Enter your current password to confirm.
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-6">
            {/* Hidden inputs to ensure all fields submit together */}
            <input type="hidden" name="businessName" value="" />
            <input type="hidden" name="gstNumber" value="" />
            <input type="hidden" name="panNumber" value="" />
            <input type="hidden" name="bankAccountName" value="" />
            <input type="hidden" name="bankAccountNo" value="" />
            <input type="hidden" name="bankIFSC" value="" />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shopName" className="text-xs font-semibold text-[var(--color-text-primary)]">Shop Name</Label>
              <Input id="shopName" name="shopName" placeholder="e.g. Apex Artisans" required className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-[var(--color-text-primary)]">Owner Full Name</Label>
              <Input id="name" name="name" defaultValue={session?.user?.name ?? ""} placeholder="e.g. Rahul Sharma" required className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[var(--color-text-primary)]">Contact Email</Label>
              <Input id="email" name="email" type="email" defaultValue={session?.user?.email ?? ""} placeholder="name@company.com" required className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-[var(--color-text-primary)]">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Minimum 8 characters" required minLength={8} className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-[var(--color-text-primary)]">Phone</Label>
              <Input id="phone" name="phone" type="tel" placeholder="e.g. 9876543210" required className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city" className="text-xs font-semibold text-[var(--color-text-primary)]">City</Label>
              <Input id="city" name="city" placeholder="e.g. Mumbai" required className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category" className="text-xs font-semibold text-[var(--color-text-primary)]">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Electronics" required className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shopDescription" className="text-xs font-semibold text-[var(--color-text-primary)]">Shop Description</Label>
              <Input id="shopDescription" name="shopDescription" placeholder="Brief statement about your brand and products" className="bg-[var(--color-bg)] border-[var(--color-border)]" />
            </div>

            {state.error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400 font-medium">
                {state.error}
              </div>
            )}

            <Button type="submit" disabled={pending} size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold">
              {pending ? "Processing Registration…" : "Submit Partnership Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
