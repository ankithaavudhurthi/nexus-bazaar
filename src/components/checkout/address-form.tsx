"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createAddress, type AddressActionState } from "@/actions/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AddressActionState = {};

export function AddressForm() {
  const [state, formAction, pending] = useActionState(createAddress, initialState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.success]);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} type="button">
        Add a new address
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-[var(--color-border)] p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" placeholder="Home" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required className="font-numeric" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="line1">Address line 1</Label>
          <Input id="line1" name="line1" required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="line2">Address line 2 (optional)</Label>
          <Input id="line2" name="line2" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" name="pincode" required className="font-numeric" />
        </div>
      </div>

      {state.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Saving…" : "Save address"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
