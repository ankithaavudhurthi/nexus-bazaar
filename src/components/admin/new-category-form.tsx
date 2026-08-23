"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory, type CatalogActionState } from "@/actions/admin-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select-native";

const initialState: CatalogActionState = {};

export function NewCategoryForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-name">Category name</Label>
        <Input id="cat-name" name="name" required placeholder="e.g. Laptops" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cat-parent">Parent (optional)</Label>
        <NativeSelect id="cat-parent" name="parentId" defaultValue="">
          <option value="">None — top level</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Add category"}
      </Button>
      {state.error && <p className="text-sm text-[var(--color-danger)] w-full">{state.error}</p>}
    </form>
  );
}
