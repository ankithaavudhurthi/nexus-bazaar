export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 pt-24 space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-[var(--color-border)]/60" />
      <div className="space-y-4">
        <div className="h-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]" />
        <div className="h-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
    </div>
  );
}
