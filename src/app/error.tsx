"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-6 py-16 text-center">
      <div className="card max-w-md p-10 shadow-lg">
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
          An unexpected error occurred. Please try again or return to the main store.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={() => reset()} className="btn-gold">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
