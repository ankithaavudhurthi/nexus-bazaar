"use client";

import { useEffect, useState } from "react";

export default function CartBadge() {
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart/count", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setCartCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchCartCount();

    const handleUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  if (!mounted || cartCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-[var(--color-gold)] text-xs text-white font-bold shadow-lg">
      {cartCount}
    </span>
  );
}
