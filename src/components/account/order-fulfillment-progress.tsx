"use client";

import { Check, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "PENDING", label: "Ordered", icon: Clock },
  { key: "PACKED", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_LEVELS: Record<string, number> = {
  PENDING: 1,
  PACKED: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

export function OrderFulfillmentProgress({
  fulfillmentStatus,
  trackingCarrier,
  trackingNumber,
}: {
  fulfillmentStatus: string;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
}) {
  if (fulfillmentStatus === "CANCELLED") {
    return (
      <div className="my-3 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3 text-xs font-medium text-[var(--color-danger)]">
        This item was cancelled.
      </div>
    );
  }

  const currentLevel = STATUS_LEVELS[fulfillmentStatus] ?? 1;

  return (
    <div className="my-4 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="relative flex items-center justify-between px-2 sm:px-6">
        {/* Connecting progress line */}
        <div className="absolute top-4 left-8 right-8 -z-0 h-0.5 bg-[var(--color-border)]">
          <div
            className="h-full bg-[var(--color-gold)] transition-all duration-500"
            style={{
              width: `${((currentLevel - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const stepLevel = idx + 1;
          const isCompleted = stepLevel < currentLevel;
          const isCurrent = stepLevel === currentLevel;
          const isActive = stepLevel <= currentLevel;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300",
                  isCompleted
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-white shadow-sm"
                    : isCurrent
                    ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-white ring-4 ring-[var(--color-gold)]/20 shadow-md"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <Icon className={cn("h-4 w-4", isCurrent ? "text-white" : "text-[var(--color-text-secondary)]")} />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold tracking-wide whitespace-nowrap",
                  isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] opacity-70"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tracking Info display when SHIPPED or DELIVERED */}
      {(fulfillmentStatus === "SHIPPED" || fulfillmentStatus === "DELIVERED") && (trackingCarrier || trackingNumber) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[var(--color-border)]/50 pt-2.5 text-xs text-[var(--color-text-secondary)]">
          <Truck className="h-3.5 w-3.5 text-[var(--color-gold)]" />
          <span>
            Carrier: <strong className="font-semibold text-[var(--color-text-primary)]">{trackingCarrier || "Standard"}</strong>
          </span>
          {trackingNumber && (
            <>
              <span>•</span>
              <span>
                Tracking #: <strong className="font-numeric font-semibold text-[var(--color-text-primary)]">{trackingNumber}</strong>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
