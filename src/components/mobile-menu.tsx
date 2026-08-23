"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { X, ShoppingCart, Heart, LogOut, Store, Package, UserCheck, LogIn, UserPlus, Shield } from "lucide-react";
import CartBadge from "./cart-badge";

export default function MobileMenu({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors"
        aria-label="Open navigation menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Solid Backdrop Overlay to isolate menu from hero section */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          {/* Compact Vertical Menu Container */}
          <div className="fixed right-4 top-20 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[var(--color-border)] rounded-xl shadow-2xl z-10 flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Vertical options list — 3 to 4+ items visible simultaneously, remaining scroll vertically */}
            <nav className="flex flex-col p-3 space-y-1 overflow-y-auto bg-white max-h-[60vh]">
              <Link
                href="/vendor/register"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Store className="h-4 w-4 text-[var(--color-gold)]" />
                Become a Seller
              </Link>

              {session?.user && session.user.role === "BUYER" && (
                <>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="h-4 w-4 text-[var(--color-gold)]" />
                    Orders
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart className="h-4 w-4 text-[var(--color-gold)]" />
                    Wishlist
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4 text-[var(--color-gold)]" />
                    Cart
                    <CartBadge />
                  </Link>
                </>
              )}

              {!session?.user && (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="h-4 w-4 text-[var(--color-gold)]" />
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserPlus className="h-4 w-4 text-[var(--color-gold)]" />
                    Sign Up
                  </Link>
                </>
              )}

              {session?.user && (
                <>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-[var(--color-gold)]" />
                      Admin
                    </Link>
                  )}
                  {session.user.role === "VENDOR" && (
                    <Link
                      href="/vendor/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCheck className="h-4 w-4 text-[var(--color-gold)]" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setIsOpen(false);
                      await signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-gold)] transition-colors border-t border-[var(--color-border)]/40 mt-1 pt-2.5 w-full text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Log out
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
