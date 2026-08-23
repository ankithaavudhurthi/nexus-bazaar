import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "danger" | "steel" | "ignition";

const toneClasses: Record<StatusTone, string> = {
  neutral:
    "bg-[var(--color-border)]/40 text-[var(--color-text-secondary)] border-[var(--color-border)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30",
  danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30",
  steel: "bg-[var(--color-steel)]/10 text-[var(--color-steel)] border-[var(--color-steel)]/30",
  ignition: "bg-[var(--color-ignition)]/10 text-[var(--color-ignition)] border-[var(--color-ignition)]/30",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function vendorStatusTone(status: string): StatusTone {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "ignition";
    case "REJECTED":
      return "danger";
    case "SUSPENDED":
      return "danger";
    default:
      return "neutral";
  }
}
