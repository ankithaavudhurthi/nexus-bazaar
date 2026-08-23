import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  basePath,
  currentParams,
  page,
  pageCount,
}: {
  basePath: string;
  currentParams: Record<string, string | undefined>;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && pages[i - 1] !== p - 1 && (
            <span className="px-1 text-[var(--color-text-secondary)]">…</span>
          )}
          <Link
            href={hrefFor(p)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-numeric",
              p === page
                ? "border-[var(--color-ignition)] text-[var(--color-ignition)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-steel)]"
            )}
          >
            {p}
          </Link>
        </span>
      ))}
    </nav>
  );
}
