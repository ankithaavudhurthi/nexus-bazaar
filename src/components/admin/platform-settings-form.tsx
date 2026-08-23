"use client";

import { useActionState } from "react";
import { updatePlatformSettings, type CatalogActionState } from "@/actions/admin-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CatalogActionState = {};

export function PlatformSettingsForm({
  defaultCommissionRate,
  taxRate,
}: {
  defaultCommissionRate: number;
  taxRate: number;
}) {
  const [state, formAction, pending] = useActionState(updatePlatformSettings, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="defaultCommissionRate">Default commission rate (%)</Label>
        <Input
          id="defaultCommissionRate"
          name="defaultCommissionRate"
          type="number"
          step="0.1"
          min={0}
          max={100}
          defaultValue={defaultCommissionRate}
          className="font-numeric w-32"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="taxRate">Tax rate (%)</Label>
        <Input
          id="taxRate"
          name="taxRate"
          type="number"
          step="0.1"
          min={0}
          max={100}
          defaultValue={taxRate}
          className="font-numeric w-32"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.success && <span className="text-sm text-[var(--color-success)]">Saved</span>}
      {state.error && <span className="text-sm text-[var(--color-danger)]">{state.error}</span>}
    </form>
  );
}
