"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function StarRatingInput({ name }: { name: string }) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={rating} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setRating(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
        >
          <Star
            className={
              n <= (hovered ?? rating)
                ? "h-6 w-6 fill-[var(--color-ignition)] text-[var(--color-ignition)]"
                : "h-6 w-6 text-[var(--color-text-secondary)]"
            }
          />
        </button>
      ))}
    </div>
  );
}
