"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialWishlisted,
}: {
  productId: string;
  initialWishlisted: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="icon"
      disabled={isPending}
      className={cn("transition-opacity", isPending && "opacity-50 cursor-not-allowed")}
      onClick={() =>
        startTransition(async () => {
          const res = await toggleWishlist(productId);
          if ("wishlisted" in res) setWishlisted(res.wishlisted as boolean);
        })
      }
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          wishlisted && "fill-[var(--color-ignition)] text-[var(--color-ignition)]"
        )}
      />
    </Button>
  );
}
