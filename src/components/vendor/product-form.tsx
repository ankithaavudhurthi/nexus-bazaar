"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select-native";
import type { ProductActionState } from "@/actions/vendor-products";

type Category = { id: string; name: string };

type ExistingProduct = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  basePrice: string;
  compareAtPrice: string | null;
  stock: number;
  images: { url: string }[];
  brandName?: string;
  isCustomizable?: boolean;
  customizationType?: "PHOTO" | "TEXT" | "PHOTO_TEXT" | null;
};

export function ProductForm({
  categories,
  action,
  existing,
}: {
  categories: Category[];
  action: (state: ProductActionState, formData: FormData) => Promise<ProductActionState>;
  existing?: ExistingProduct;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? "");
  const [isCustomizable, setIsCustomizable] = useState(existing?.isCustomizable ? "true" : "false");

  if (state.success && !existing) {
    router.push("/vendor/products");
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="name" className="text-base font-semibold">Product Title</Label>
          <Input id="name" name="name" required defaultValue={existing?.name} className="text-base py-3" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="brandName" className="text-base font-semibold">Brand Name</Label>
          <Input id="brandName" name="brandName" placeholder="e.g. Samsung, Apple" defaultValue={existing?.brandName} className="text-base py-3" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId" className="text-base font-semibold">Category</Label>
          <NativeSelect
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="text-base py-3"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="isCustomizable" className="text-base font-semibold">Customizable Product?</Label>
          <NativeSelect
            id="isCustomizable"
            name="isCustomizable"
            value={isCustomizable}
            onChange={(e) => setIsCustomizable(e.target.value)}
            className="text-base py-3"
          >
            <option value="false">No — Standard Product</option>
            <option value="true">Yes — Requires Customer Customization</option>
          </NativeSelect>
        </div>

        {isCustomizable === "true" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="customizationType" className="text-base font-semibold">
              Customization Requirement <span className="text-red-500">*</span>
            </Label>
            <NativeSelect
              id="customizationType"
              name="customizationType"
              defaultValue={existing?.customizationType ?? "PHOTO"}
              required
              className="text-base py-3 border-[var(--color-gold)]"
            >
              <option value="PHOTO">Photo Only (Requires Reference Photo)</option>
              <option value="TEXT">Text Only (Requires Name / Text Input)</option>
              <option value="PHOTO_TEXT">Photo + Text (Requires Both Photo & Text)</option>
            </NativeSelect>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="basePrice" className="text-base font-semibold">Selling Price (₹)</Label>
          <Input
            id="basePrice"
            name="basePrice"
            type="number"
            step="0.01"
            required
            defaultValue={existing?.basePrice}
            className="font-numeric text-base py-3"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="compareAtPrice" className="text-base font-semibold">Original MRP (₹)</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            step="0.01"
            defaultValue={existing?.compareAtPrice ?? undefined}
            className="font-numeric text-base py-3"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="stock" className="text-base font-semibold">Available Quantity</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            required
            defaultValue={existing?.stock ?? 0}
            className="font-numeric text-base py-3"
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description" className="text-base font-semibold">Simple product write-up</Label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            defaultValue={existing?.description}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-base outline-none focus-visible:border-[var(--color-gold)] transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 border-t border-[var(--color-border)] pt-8">
        <h3 className="font-numeric text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
          Product Images
        </h3>
        {existing && existing.images && existing.images.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {existing.images.map((img, idx) => {
              const safeUrl =
                img.url.startsWith("http://") ||
                img.url.startsWith("https://") ||
                img.url.startsWith("/") ||
                img.url.startsWith("data:")
                  ? img.url
                  : `/${img.url}`;
              return (
                <div key={img.url + idx} className="relative h-20 w-20 rounded-lg border border-[var(--color-border)] overflow-hidden bg-gray-100">
                  <Image
                    src={safeUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="imageUrls" className="text-base font-semibold">Paste photo links (comma-separated)</Label>
          <Input
            id="imageUrls"
            name="imageUrls"
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            defaultValue={existing?.images?.map((i) => i.url).join(", ") ?? ""}
            className="text-base py-3"
          />
        </div>
      </div>

      {state.error && <p className="text-base text-[var(--color-danger)] font-medium">{state.error}</p>}
      {state.success && existing && <p className="text-base text-[var(--color-success)] font-medium">Saved.</p>}

      <Button type="submit" disabled={pending} className="self-start btn-gold-sm">
        {pending ? "Saving…" : existing ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
