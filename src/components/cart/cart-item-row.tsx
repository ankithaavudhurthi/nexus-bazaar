"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { updateCartItemQuantity, removeCartItem } from "@/actions/cart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export function CartItemRow({
  item,
}: {
  item: {
    id: string;
    quantity: number;
    stock: number;
    productSlug: string;
    productName: string;
    imageUrl?: string;
    unitPrice: string;
    customImage?: string | null;
    customText?: string | null;
  };
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4 border-b border-[var(--color-border)] py-4 last:border-0">
      {item.imageUrl ? (
        <div className="relative h-16 w-16 rounded-md border border-[var(--color-border)] overflow-hidden">
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-16 w-16 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]" />
      )}

      <div className="flex-1">
        <Link href={`/products/${item.productSlug}`} className="font-medium hover:underline">
          {item.productName}
        </Link>
        <p className="font-numeric text-sm text-[var(--color-text-secondary)]">
          {formatPrice(item.unitPrice)}
        </p>
        {item.customText && (
          <p className="mt-1 text-xs font-semibold text-[var(--color-text-primary)]">
            Custom Text: <span className="font-normal italic text-[var(--color-gold-dark)]">{item.customText}</span>
          </p>
        )}
        {item.customImage && (
          <p className="mt-0.5 text-xs font-semibold text-[var(--color-gold-dark)]">
            ✓ Reference image attached
          </p>
        )}
      </div>

      <Input
        type="number"
        min={1}
        max={item.stock}
        value={quantity}
        className="font-numeric w-16"
        disabled={isPending}
        onChange={(e) => {
          const q = Math.max(1, Math.min(item.stock, Number(e.target.value)));
          setQuantity(q);
        }}
        onBlur={() => {
          if (quantity !== item.quantity) {
            startTransition(async () => {
              await updateCartItemQuantity(item.id, quantity);
              window.dispatchEvent(new Event("cart-updated"));
            });
          }
        }}
      />

      <p className="font-numeric w-24 text-right font-medium">
        {formatPrice((Number(item.unitPrice) * quantity).toString())}
      </p>

      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        className={isPending ? "opacity-50 cursor-not-allowed" : undefined}
        onClick={() =>
          startTransition(async () => {
            await removeCartItem(item.id);
            window.dispatchEvent(new Event("cart-updated"));
          })
        }
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
