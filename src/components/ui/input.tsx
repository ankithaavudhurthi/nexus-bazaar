import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
  "flex h-12 w-full rounded-lg border-2 border-[var(--color-border)] bg-white px-4 py-2 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] outline-none transition-colors",
  "focus-visible:border-[var(--color-gold)] focus-visible:ring-0",
  "disabled:cursor-not-allowed disabled:bg-gray-100",
  className
)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
