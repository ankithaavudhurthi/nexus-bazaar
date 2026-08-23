import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Privacy Policy</h1>
            <p className="text-[var(--color-text-secondary)]">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="card p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Information We Collect</h2>
              <p className="text-[var(--color-text-secondary)]">
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, shipping address, and payment information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">How We Use Your Information</h2>
              <p className="text-[var(--color-text-secondary)]">
                We use the information we collect to process your orders, provide customer support, improve our services, and communicate with you about your orders and our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Information Sharing</h2>
              <p className="text-[var(--color-text-secondary)]">
                We share your information with vendors when you make a purchase to fulfill your order. We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Data Security</h2>
              <p className="text-[var(--color-text-secondary)]">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Your Rights</h2>
              <p className="text-[var(--color-text-secondary)]">
                You have the right to access, update, or delete your personal information. You can do this by logging into your account or contacting our support team.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Contact Us</h2>
              <p className="text-[var(--color-text-secondary)]">
                If you have any questions about this Privacy Policy, please contact us at support@nexusbazaar.com
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}