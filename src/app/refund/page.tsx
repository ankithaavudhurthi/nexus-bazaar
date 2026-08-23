import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function RefundPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Refund Policy</h1>
            <p className="text-[var(--color-text-secondary)]">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="card p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Refund Eligibility</h2>
              <p className="text-[var(--color-text-secondary)]">
                We want you to be completely satisfied with your purchase. If you are not satisfied with your order, you may be eligible for a refund under the following conditions:
              </p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] mt-2 space-y-1">
                <li>The item is defective or damaged upon arrival</li>
                <li>The item received is significantly different from the product description</li>
                <li>The item was never delivered</li>
                <li>The vendor agrees to a refund based on their specific refund policy</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Refund Request Process</h2>
              <p className="text-[var(--color-text-secondary)]">
                To request a refund, please follow these steps:
              </p>
              <ol className="list-decimal list-inside text-[var(--color-text-secondary)] mt-2 space-y-1">
                <li>Contact the vendor directly through your order page</li>
                <li>Provide details about why you are requesting a refund</li>
                <li>Include photos if the item is damaged or defective</li>
                <li>Wait for the vendor to respond to your request</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Refund Timeline</h2>
              <p className="text-[var(--color-text-secondary)]">
                Refund requests must be made within 7 days of delivery. Once approved, refunds are typically processed within 5-10 business days, depending on your payment method.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Non-Refundable Items</h2>
              <p className="text-[var(--color-text-secondary)]">
                Certain items may not be eligible for refunds, including:
              </p>
              <ul className="list-disc list-inside text-[var(--color-text-secondary)] mt-2 space-y-1">
                <li>Custom or personalized items</li>
                <li>Items marked as final sale</li>
                <li>Digital products or downloads</li>
                <li>Items that have been used or damaged by the customer</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Dispute Resolution</h2>
              <p className="text-[var(--color-text-secondary)]">
                If you and the vendor cannot agree on a refund, you can escalate the issue to our support team. We will review the case and make a final decision based on the evidence provided.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Platform Fees</h2>
              <p className="text-[var(--color-text-secondary)]">
                In cases where a refund is approved, platform fees may be non-refundable. Please refer to our vendor agreement for specific details about fee refunds.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Contact Support</h2>
              <p className="text-[var(--color-text-secondary)]">
                If you need assistance with a refund request, please contact our support team through your account or email us at support@nexusbazaar.com
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}