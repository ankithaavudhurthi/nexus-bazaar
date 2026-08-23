import { getMemoizedSession, getMemoizedVendorProfile } from "@/lib/memoized-auth";
import { ShopSettingsForm } from "@/components/vendor/shop-settings-form";

export default async function ShopSettingsPage() {
  const session = await getMemoizedSession();
  if (!session?.user?.id) return null;

  const profile = await getMemoizedVendorProfile(session.user.id);
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Shop Settings</h1>
        <p className="text-base text-[var(--color-text-secondary)] mt-1">Manage your shop information</p>
      </div>

      <div className="card p-8">
        <ShopSettingsForm profile={profile} />
      </div>
    </div>
  );
}