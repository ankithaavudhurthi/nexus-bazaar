"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { quickUpdateStock, archiveProduct } from "@/actions/vendor-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductRow({
  product,
}: {
  product: {
    id: string;
    name: string;
    sku: string;
    basePrice: string;
    stock: number;
    status: string;
    categoryName: string;
    imageUrl?: string;
  };
}) {
  const [stock, setStock] = useState(product.stock);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {product.imageUrl ? (
          <div className="relative h-12 w-12 rounded-md border border-[var(--color-border)] overflow-hidden">
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]" />
        )}
        <div>
          <a href={`/vendor/products/${product.id}/edit`} className="font-medium hover:underline">
            {product.name}
          </a>
          <p className="font-numeric text-xs text-[var(--color-text-secondary)]">
            {product.sku} · {product.categoryName} · ₹{product.basePrice}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
          {product.status}
        </span>
        <Input
          type="number"
          value={stock}
          min={0}
          className="font-numeric w-20"
          onChange={(e) => setStock(Number(e.target.value))}
          onBlur={() => {
            if (stock !== product.stock) {
              startTransition(() => void quickUpdateStock(product.id, stock));
            }
          }}
          disabled={isPending}
        />
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => startTransition(() => void archiveProduct(product.id))}
        >
          {isPending ? "Archiving…" : "Archive"}
        </Button>
      </div>
    </div>
  );
}
