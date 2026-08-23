export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Top Gold Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--color-border)] overflow-hidden">
        <div className="h-full w-1/3 bg-[var(--color-gold)] animate-pulse rounded-r" />
      </div>

      {/* Skeleton Content Grid */}
      <div className="mx-auto max-w-7xl px-6 py-10 pt-28 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-[var(--color-border)]/60" />
          <div className="h-4 w-72 rounded bg-[var(--color-border)]/40" />
        </div>

        {/* Filter/Banner Skeleton */}
        <div className="h-14 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]" />

        {/* Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="h-48 w-full rounded-lg bg-[var(--color-border)]/50" />
              <div className="h-4 w-3/4 rounded bg-[var(--color-border)]/60" />
              <div className="h-4 w-1/2 rounded bg-[var(--color-border)]/40" />
              <div className="mt-2 flex justify-between items-center">
                <div className="h-5 w-20 rounded bg-[var(--color-gold)]/20" />
                <div className="h-8 w-24 rounded-lg bg-[var(--color-border)]/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
