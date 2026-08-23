import { cn } from "@/lib/utils";

/**
 * Classic AGNI OMEGA monogram – horizontal layout for headers.
 * A small gold circular emblem with "AΩ" beside the wordmark "AGNI OMEGA".
 */
export function Logo({
  className,
  showWordmark = true,
  variant = "default",
}: {
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "vendor" | "admin";
}) {
  const colors = {
    default: {
      circle: "var(--color-gold)",
      text: "var(--color-gold)",
      wordmark: "var(--color-gold-dark)",
    },
    vendor: {
      circle: "#FFD700",
      text: "#FFD700",
      wordmark: "#FFFFFF",
    },
    admin: {
      circle: "var(--color-gold)",
      text: "var(--color-gold)",
      wordmark: "var(--color-text-primary)",
    },
  };

  const color = colors[variant];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Circular monogram emblem */}
      <svg
        width="34"
        height="34"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Outer gold circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke={color.circle}
          strokeWidth="1.5"
        />
        {/* Stylised "AΩ" monogram */}
        <text
          x="50%"
          y="54%"
          dominantBaseline="central"
          textAnchor="middle"
          fill={color.text}
          fontFamily="var(--font-display)"
          fontSize="20"
          fontWeight="bold"
          letterSpacing="0.05em"
        >
          NB
        </text>
      </svg>

      {showWordmark && (
        <span className="font-display text-sm font-semibold tracking-[0.2em] uppercase whitespace-nowrap" style={{ color: color.wordmark }}>
          Nexus Bazaar
        </span>
      )}
    </div>
  );
}