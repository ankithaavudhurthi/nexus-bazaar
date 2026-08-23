import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";

export function CatalogFilterBar({
  basePath,
  categories,
  current,
}: {
  basePath: string;
  categories?: { slug: string; name: string }[];
  current: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    q?: string;
  };
}) {
  return (
    <form
      action={basePath}
      method="GET"
      className="flex flex-wrap items-end gap-3 border-b border-[var(--color-border)] pb-6"
    >
      {categories && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
            Category
          </label>
          <NativeSelect name="category" defaultValue={current.category ?? ""} className="w-44">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}



      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-[var(--color-text-secondary)]">Sort</label>
        <NativeSelect name="sort" defaultValue={current.sort ?? "newest"} className="w-40">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </NativeSelect>
      </div>

      {"q" in current && <input type="hidden" name="q" value={current.q ?? ""} />}

      <Button type="submit" variant="secondary" size="default">
        Apply
      </Button>
    </form>
  );
}
