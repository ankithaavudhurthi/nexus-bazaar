import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/shops" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Shops
                </Link>
              </li>
              <li>
                <Link href="/vendor/register" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Become a Seller
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account/support" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors font-medium">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-[var(--color-text-secondary)] font-medium">support@nexusbazaar.com</li>
              <li className="text-sm text-[var(--color-text-secondary)] font-medium">+1 234 567 890</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-border)] text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            © {new Date().getFullYear()} Nexus Bazaar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}