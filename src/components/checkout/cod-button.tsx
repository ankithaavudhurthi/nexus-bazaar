"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckoutOrder } from "@/actions/checkout";
import { Button } from "@/components/ui/button";

export function CodCheckoutButton({
  addressId,
}: {
  addressId: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handlePlaceOrder() {
    if (!addressId) {
      setError("Select or add a shipping address first");
      return;
    }
    setError(null);
    setLoading(true);

    const result = await createCheckoutOrder(addressId);

    if ("error" in result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Redirect to order confirmation page
    router.push(`/orders/${result.orderNumber}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Placing order..." : "Place Order (Cash on Delivery)"}
      </Button>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <p className="text-xs text-[var(--color-text-secondary)]">
        You will pay cash when your order is delivered
      </p>
    </div>
  );
}