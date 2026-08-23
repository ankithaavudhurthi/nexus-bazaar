export default function VendorLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-[var(--color-border)]/60" />
          <div className="h-4 w-32 rounded bg-[var(--color-border)]/40" />
        </div>
        <div className="h-10 w-28 rounded bg-[var(--color-border)]/60" />
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card p-6 h-28 bg-[var(--color-surface)] border border-[var(--color-border)]" />
        <div className="card p-6 h-28 bg-[var(--color-surface)] border border-[var(--color-border)]" />
        <div className="card p-6 h-28 bg-[var(--color-surface)] border border-[var(--color-border)]" />
      </div>
      <div className="card h-64 bg-[var(--color-surface)] border border-[var(--color-border)]" />
    </div>
  );
}
