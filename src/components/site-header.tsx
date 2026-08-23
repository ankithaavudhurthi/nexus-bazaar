import Link from "next/link";
import { Search, ShoppingCart, Heart } from "lucide-react";
import { signOut } from "@/lib/auth";
import { getMemoizedSession } from "@/lib/memoized-auth";
import { Logo } from "@/components/logo";
import CartBadge from "./cart-badge";
import MobileMenu from "./mobile-menu";
import { LogoutButton } from "./logout-button";

export async function SiteHeader() {
  const session = await getMemoizedSession();

  return (
    <>
      <header className="nav-unified">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
          </Link>

          <form action="/products" method="GET" className="hidden max-w-lg flex-1 md:block">
            <div className="relative search-unified">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-gold)]" />
              <input
                type="text"
                name="q"
                placeholder="Search luxury products..."
                className="h-12 w-full pl-14 pr-4 text-base outline-none font-medium"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link href="/vendor/register" className="nav-link text-sm">
              Become a Seller
            </Link>

            {session?.user && (session.user.role === "BUYER" || session.user.role === "VENDOR") && (
              <>
                <Link href="/account/orders" className="nav-link text-sm">
                  Orders
                </Link>
                <Link href="/account/wishlist" title="Wishlist" className="relative p-1 text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors">
                  <Heart className="h-6 w-6" />
                </Link>
                <Link href="/cart" title="Shopping Cart" className="relative p-1 text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  <CartBadge />
                </Link>
              </>
            )}

            {!session?.user && (
              <div className="flex items-center gap-4">
                <Link href="/account/wishlist" title="Wishlist" className="relative p-1 text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors">
                  <Heart className="h-6 w-6" />
                </Link>
                <Link href="/login" className="nav-link text-sm">
                  Log in
                </Link>
                <Link href="/register" className="btn-gold-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {session?.user && (
              <div className="flex items-center gap-4">
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="nav-link text-sm">
                    Admin
                  </Link>
                )}
                {session.user.role === "VENDOR" && (
                  <Link href="/vendor/dashboard" className="nav-link text-sm">
                    Dashboard
                  </Link>
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <LogoutButton />
                </form>
              </div>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-3">
            <Link href="/account/wishlist" title="Wishlist" className="relative p-1 text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors">
              <Heart className="h-6 w-6" />
            </Link>
            {session?.user && (session.user.role === "BUYER" || session.user.role === "VENDOR") && (
              <Link href="/cart" title="Shopping Cart" className="relative p-1 text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors">
                <ShoppingCart className="h-6 w-6" />
                <CartBadge />
              </Link>
            )}
            <MobileMenu session={session} />
          </div>
        </div>
      </header>
    </>
  );
}