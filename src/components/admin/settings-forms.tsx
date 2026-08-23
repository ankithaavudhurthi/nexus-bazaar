"use client";

import { useActionState, useTransition, useState } from "react";
import {
  updatePlatformSettings,
  createCategory,
  deleteCategory,
  type CatalogActionState,
} from "@/actions/admin-catalog";

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
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="defaultCommissionRate" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Commission Rate (%)
        </label>
        <input
          id="defaultCommissionRate"
          name="defaultCommissionRate"
          type="number"
          step="0.1"
          min="0"
          max="100"
          defaultValue={defaultCommissionRate}
          required
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded focus:border-[var(--color-gold)] outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="taxRate" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Tax Rate (%)
        </label>
        <input
          id="taxRate"
          name="taxRate"
          type="number"
          step="0.1"
          min="0"
          max="100"
          defaultValue={taxRate}
          required
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded focus:border-[var(--color-gold)] outline-none transition-colors"
        />
      </div>
      {state?.error && (
        <p className="text-sm font-medium text-[var(--color-danger)]">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-[var(--color-success)]">Settings updated successfully!</p>
      )}
      <button type="submit" disabled={pending} className="btn-gold-sm">
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}

export function AddCategoryForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createCategory, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Category Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter category name"
          required
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded focus:border-[var(--color-gold)] outline-none transition-colors"
        />
      </div>
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          Parent Category
        </label>
        <select
          id="parentId"
          name="parentId"
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded focus:border-[var(--color-gold)] outline-none transition-colors bg-[var(--color-surface)]"
        >
          <option value="">None (Top level)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {state?.error && (
        <p className="text-sm font-medium text-[var(--color-danger)]">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm font-medium text-[var(--color-success)]">Category added successfully!</p>
      )}
      <button type="submit" disabled={pending} className="btn-gold-sm">
        {pending ? "Adding…" : "Add Category"}
      </button>
    </form>
  );
}

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCategory(categoryId);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {error && <p className="text-xs text-[var(--color-danger)] font-medium">{error}</p>}
    </div>
  );
}
