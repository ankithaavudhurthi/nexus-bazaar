"use client";

import { useState, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { addToCart } from "@/actions/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

export function AddToCartControl({
  productId,
  stock,
  isCustomizable = false,
  customizationType,
}: {
  productId: string;
  stock: number;
  isCustomizable?: boolean;
  customizationType?: "PHOTO" | "TEXT" | "PHOTO_TEXT" | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const effectiveType = customizationType ?? "PHOTO";
  const requiresPhoto = isCustomizable && (effectiveType === "PHOTO" || effectiveType === "PHOTO_TEXT");
  const requiresText = isCustomizable && (effectiveType === "TEXT" || effectiveType === "PHOTO_TEXT");
  const isMissingCustomization =
    (requiresPhoto && !customImage) || (requiresText && !customText.trim());

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image file size must be less than 5MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAdd(goToCart: boolean) {
    if (requiresPhoto && !customImage) {
      setError("Please upload a reference photo before adding to cart.");
      return;
    }
    if (requiresText && !customText.trim()) {
      setError("Please enter your custom text before adding to cart.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await addToCart(
          productId,
          quantity,
          customImage || undefined,
          customText.trim() || undefined
        );
        if (res?.unauthenticated) {
          const currentPath = window.location.pathname;
          router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
          return;
        }
        if (res?.error) {
          setError(res.error);
          return;
        }
        window.dispatchEvent(new Event("cart-updated"));
        if (goToCart) {
          router.push("/cart");
        } else {
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }
      } catch (err: any) {
        if (err?.message === "Not authorized" || err?.message?.includes("Not authorized")) {
          const currentPath = window.location.pathname;
          router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
          return;
        }
        setError("An error occurred. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {isCustomizable && (
        <div className="rounded-xl border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 p-4 space-y-4">
          {requiresText && (
            <div className="space-y-2">
              <Label htmlFor="customText" className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                Custom Name / Text <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customText"
                type="text"
                placeholder="Enter name, message, or inscription"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="bg-white border-[var(--color-border)] text-sm"
              />
            </div>
          )}

          {requiresPhoto && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                <ImageIcon className="h-4 w-4 text-[var(--color-gold-dark)]" />
                Upload Reference Photo <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Attach your design, photo, or reference image for the seller.
              </p>

              {customImage ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shrink-0">
                    <Image src={customImage} alt="Reference photo" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[var(--color-success)]">✓ Reference Photo Attached</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomImage(null)}
                      className="h-7 px-2 text-xs text-[var(--color-danger)] border-[var(--color-border)]"
                    >
                      <X className="mr-1 h-3 w-3" /> Remove / Change
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="referenceImageInput"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="referenceImageInput"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-dashed border-[var(--color-gold)] bg-white text-sm font-semibold text-[var(--color-gold-dark)] cursor-pointer hover:bg-[var(--color-gold)]/10 transition-colors"
                  >
                    <Upload className="h-4 w-4" /> Choose Photo from Device
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Input
          type="number"
          min={1}
          max={stock}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(stock, Number(e.target.value))))}
          className="font-numeric w-20"
          disabled={stock === 0}
        />
        <Button
          size="lg"
          disabled={stock === 0 || isPending || isMissingCustomization}
          className="flex-1"
          onClick={() => handleAdd(false)}
        >
          {isPending ? "Adding…" : added ? "Added ✓" : "Add to cart"}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          disabled={stock === 0 || isPending || isMissingCustomization}
          onClick={() => handleAdd(true)}
        >
          {isPending ? "Processing…" : "Buy now"}
        </Button>
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] font-medium">{error}</p>}
    </div>
  );
}
