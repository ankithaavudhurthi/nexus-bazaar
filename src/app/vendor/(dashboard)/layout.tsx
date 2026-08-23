import Link from "next/link";
import { Logo } from "@/components/logo";
import { Search } from "lucide-react";
import { VendorMobileMenu } from "@/components/vendor/vendor-mobile-menu";

const links = [
  { href: "/vendor/dashboard", label: "Home" },
  { href: "/vendor/products", label: "Products" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/reviews", label: "Reviews" },
  { href: "/vendor/shop-settings", label: "Shop" },
  { href: "/products", label: "Marketplace" },
  { href: "/account/support", label: "Help" },
];

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="nav-unified">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/vendor/dashboard" className="block shrink-0">
              <Logo />
            </Link>

            <form action="/vendor/products" method="GET" className="hidden lg:block w-full max-w-md">
              <div className="relative search-unified">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-gold)]" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search your products..."
                  className="h-10 w-full pl-11 pr-4 text-sm outline-none"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 sm:gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="nav-link text-xs sm:text-sm whitespace-nowrap"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <VendorMobileMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 pt-24">
        {children}
      </main>
    </div>
  );
}