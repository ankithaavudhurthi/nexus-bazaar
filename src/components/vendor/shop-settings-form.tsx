"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateShopSettings, type ShopSettingsActionState } from "@/actions/vendor-shop-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = {
  shopName: string;
  shopDescription: string | null;
  shopSlug: string;
  logoUrl?: string | null;
  instagramHandle?: string | null;
  websiteUrl?: string | null;
};

const initialState: ShopSettingsActionState = {};

export function ShopSettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateShopSettings, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="shopName" className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">
          Shop Name
        </Label>
        <Input
          id="shopName"
          name="shopName"
          type="text"
          required
          defaultValue={profile.shopName}
          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-base"
        />
      </div>

      <div>
        <Label htmlFor="shopDescription" className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">
          Description
        </Label>
        <textarea
          id="shopDescription"
          name="shopDescription"
          defaultValue={profile.shopDescription || ""}
          rows={4}
          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-gold)] outline-none transition-colors text-base"
        />
      </div>

      <div>
        <Label htmlFor="logoUrl" className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">
          Logo URL
        </Label>
        {profile.logoUrl && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
              <Image
                src={profile.logoUrl}
                alt="Shop Logo"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Current Logo</span>
          </div>
        )}
        <Input
          id="logoUrl"
          name="logoUrl"
          type="text"
          placeholder="https://example.com/logo.png"
          defaultValue={profile.logoUrl || ""}
          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-base"
        />
      </div>

      <div>
        <Label htmlFor="instagramHandle" className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">
          Instagram ID / Username (Optional)
        </Label>
        <Input
          id="instagramHandle"
          name="instagramHandle"
          type="text"
          placeholder="e.g. claypots_official"
          defaultValue={profile.instagramHandle || ""}
          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-base"
        />
      </div>

      <div>
        <Label htmlFor="websiteUrl" className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">
          Website URL (Optional)
        </Label>
        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          placeholder="e.g. https://claypots.com"
          defaultValue={profile.websiteUrl || ""}
          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg text-base"
        />
      </div>

      <div>
        <Label htmlFor="shopSlug" className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">
          Shop Slug
        </Label>
        <Input
          id="shopSlug"
          type="text"
          defaultValue={profile.shopSlug}
          disabled
          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-gray-50 text-[var(--color-text-secondary)] text-base"
        />
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">Contact support to change shop slug</p>
      </div>

      {state.error && <p className="text-sm text-[var(--color-danger)] font-medium">{state.error}</p>}
      {state.success && <p className="text-sm text-[var(--color-success)] font-medium">Shop settings saved successfully!</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={pending} className="btn-gold-sm">
          {pending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
