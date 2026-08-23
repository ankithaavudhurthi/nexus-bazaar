"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  createCategoryAttribute,
  deleteCategory,
  deleteCategoryAttribute,
  type CatalogActionState,
} from "@/actions/admin-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

type Attribute = {
  id: string;
  name: string;
  type: string;
  unit: string | null;
  options: string[];
  required: boolean;
};

const initialState: CatalogActionState = {};

export function CategoryCard({
  category,
}: {
  category: { id: string; name: string; slug: string; attributes: Attribute[] };
}) {
  const [state, formAction, pending] = useActionState(createCategoryAttribute, initialState);
  const [attrType, setAttrType] = useState("TEXT");
  const [isPending, startTransition] = useTransition();
  const [attrError, setAttrError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>{category.name}</CardTitle>
          <p className="font-numeric text-xs text-[var(--color-text-secondary)]">
            /{category.slug}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteCategory(category.id);
              if (res?.error) setAttrError(res.error);
            })
          }
        >
          {isPending ? "Deleting…" : "Delete category"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {attrError && <p className="text-sm text-[var(--color-danger)]">{attrError}</p>}

        {category.attributes.length > 0 && (
          <div className="flex flex-col gap-2">
            {category.attributes.map((attr) => (
              <div
                key={attr.id}
                className="flex items-center justify-between rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{attr.name}</span>
                  <StatusBadge tone="steel">{attr.type}</StatusBadge>
                  {attr.unit && (
                    <span className="font-numeric text-xs text-[var(--color-text-secondary)]">
                      {attr.unit}
                    </span>
                  )}
                  {attr.required && <StatusBadge tone="ignition">required</StatusBadge>}
                  {attr.options.length > 0 && (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {attr.options.join(", ")}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await deleteCategoryAttribute(attr.id);
                      if (res?.error) setAttrError(res.error);
                    })
                  }
                >
                  {isPending ? "Removing…" : "Remove"}
                </Button>
              </div>
            ))}
          </div>
        )}

        <form
          ref={formRef}
          action={formAction}
          className="flex flex-wrap items-end gap-2 border-t border-[var(--color-border)] pt-4"
        >
          <input type="hidden" name="categoryId" value={category.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`attr-name-${category.id}`}>Attribute</Label>
            <Input id={`attr-name-${category.id}`} name="name" required placeholder="e.g. RAM" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`attr-type-${category.id}`}>Type</Label>
            <NativeSelect
              id={`attr-type-${category.id}`}
              name="type"
              value={attrType}
              onChange={(e) => setAttrType(e.target.value)}
            >
              <option value="TEXT">Text</option>
              <option value="NUMBER">Number</option>
              <option value="SELECT">Select</option>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`attr-unit-${category.id}`}>Unit</Label>
            <Input id={`attr-unit-${category.id}`} name="unit" placeholder="GB" className="w-20" />
          </div>
          {attrType === "SELECT" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`attr-options-${category.id}`}>Options (comma-separated)</Label>
              <Input
                id={`attr-options-${category.id}`}
                name="options"
                placeholder="Black, White, Blue"
              />
            </div>
          )}
          <label className="flex items-center gap-1.5 pb-2 text-sm text-[var(--color-text-secondary)]">
            <input type="checkbox" name="required" /> Required
          </label>
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? "Adding…" : "Add attribute"}
          </Button>
          {state.error && (
            <p className="w-full text-sm text-[var(--color-danger)]">{state.error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
