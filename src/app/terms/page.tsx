import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Terms of Service</h1>
            <p className="text-[var(--color-text-secondary)]">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="card p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Acceptance of Terms</h2>
              <p className="text-[var(--color-text-secondary)]">
                By accessing or using Nexus Bazaar, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Account Responsibilities</h2>
              <p className="text-[var(--color-text-secondary)]">
                You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Vendor Responsibilities</h2>
              <p className="text-[var(--color-text-secondary)]">
                Vendors must accurately represent their products, fulfill orders in a timely manner, and provide excellent customer service. Vendors are responsible for ensuring their products comply with all applicable laws and regulations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Buyer Responsibilities</h2>
              <p className="text-[var(--color-text-secondary)]">
                Buyers must provide accurate information for orders, make timely payments, and communicate respectfully with vendors. Buyers are responsible for reviewing product details before making a purchase.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Prohibited Activities</h2>
              <p className="text-[var(--color-text-secondary)]">
                You may not use our platform for illegal activities, fraud, or to violate the rights of others. This includes posting false information, attempting to interfere with platform security, or engaging in harassment.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Intellectual Property</h2>
              <p className="text-[var(--color-text-secondary)]">
                All content on Nexus Bazaar, including text, graphics, logos, and software, is protected by intellectual property laws. You may not use our content without prior written permission.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Limitation of Liability</h2>
              <p className="text-[var(--color-text-secondary)]">
                Nexus Bazaar shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Modifications to Terms</h2>
              <p className="text-[var(--color-text-secondary)]">
                We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Contact Us</h2>
              <p className="text-[var(--color-text-secondary)]">
                If you have any questions about these Terms of Service, please contact us at support@nexusbazaar.com
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}