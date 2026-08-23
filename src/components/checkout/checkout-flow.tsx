"use client";

import { useState } from "react";
import { AddressForm } from "@/components/checkout/address-form";
import { CodCheckoutButton } from "@/components/checkout/cod-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
};

type LineItem = { id: string; name: string; quantity: number; lineTotal: number };

export function CheckoutFlow({
  addresses,
  items,
  subtotal,
  taxRate,
}: {
  addresses: Address[];
  items: LineItem[];
  subtotal: number;
  taxRate: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null
  );

  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors",
                    selectedId === addr.id
                      ? "border-[var(--color-ignition)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-steel)]"
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={selectedId === addr.id}
                    onChange={() => setSelectedId(addr.id)}
                  />
                  <div>
                    <p className="font-medium">{addr.label}</p>
                    <p className="text-[var(--color-text-secondary)]">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}{" "}
                      {addr.pincode}
                    </p>
                    <p className="font-numeric text-[var(--color-text-secondary)]">
                      {addr.phone}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <AddressForm />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-numeric">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}

            <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-numeric">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Tax ({taxRate}%)</span>
              <span className="font-numeric">{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-semibold">
              <span>Total</span>
              <span className="font-numeric">{formatPrice(total)}</span>
            </div>

            <div className="mt-2 border-t border-[var(--color-border)] pt-4">
              <CodCheckoutButton addressId={selectedId} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
