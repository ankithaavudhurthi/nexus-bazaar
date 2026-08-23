import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-6 pt-20 text-center">
        <div className="card max-w-md p-10 shadow-lg">
          <h1 className="font-display text-4xl font-bold text-[var(--color-text-primary)] mb-3">
            404
          </h1>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Page Not Found
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">
            The page or shop you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild className="btn-gold">
              <Link href="/">Return Home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
