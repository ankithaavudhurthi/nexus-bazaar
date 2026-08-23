import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge, vendorStatusTone } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default async function SellerPendingPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "VENDOR") {
    redirect("/login");
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/vendor/register");
  if (profile.status === "APPROVED") redirect("/vendor/dashboard");

  const isRejected = profile.status === "REJECTED";

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-12 sm:px-6">
      <Link href="/" className="mb-8 hover:opacity-90 transition-opacity">
        <Logo />
      </Link>

      <Card className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md overflow-hidden">
        <CardHeader className="space-y-4 border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/40 px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <StatusBadge tone={vendorStatusTone(profile.status)}>
              {profile.status}
            </StatusBadge>
            <span className="text-xs font-numeric font-medium text-[var(--color-text-secondary)]">
              Shop: {profile.shopName}
            </span>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {isRejected
              ? "Application Declined"
              : "Shop Registration Submitted"}
          </CardTitle>

          <CardDescription className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {isRejected
              ? "Your seller registration application was not approved at this time."
              : "Thank you for registering your storefront! Your seller account is currently waiting for admin approval. Once the administrator approves your shop, you will be able to access your seller dashboard and start listing products."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Rejection Details Box */}
          {isRejected && profile.rejectionReason && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-200 space-y-1">
              <p className="font-semibold">Reason from Admin:</p>
              <p className="text-red-800/90 dark:text-red-300">{profile.rejectionReason}</p>
            </div>
          )}

          {/* Simple Status Steps */}
          {!isRejected ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-4 space-y-3 text-xs sm:text-sm">
              <p className="font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                Approval Status
              </p>
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Shop Form Submitted</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Your store details have been saved.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                    ⏳
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Awaiting Admin Approval</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">An administrator will review your application soon.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-50">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-xs font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Seller Dashboard Access</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Manage your inventory and orders.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)] text-center leading-relaxed">
              If you have questions regarding your application decision, please contact support below.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild variant="outline" className="w-full border-[var(--color-border)] hover:bg-[var(--color-bg)]">
              <Link href="/">Return to Storefront</Link>
            </Button>
            <Button asChild className="w-full bg-[var(--color-gold-dark)] hover:bg-[var(--color-gold)] text-white shadow-sm font-medium">
              <Link href="/account/support">Contact Merchant Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}