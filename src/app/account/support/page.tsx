import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/account/support");

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-bg)] pt-20">
        <section className="bg-white border-b border-[var(--color-border)] py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Help & Support</h1>
            <p className="text-[var(--color-text-secondary)] text-lg">Get help with your account and orders</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Create New Ticket</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Brief description of your issue"
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-gold)] outline-none transition-colors text-base"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-[var(--color-text-primary)] mb-2">Message</label>
                  <textarea
                    placeholder="Describe your issue in detail"
                    rows={5}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:border-[var(--color-gold)] outline-none transition-colors text-base"
                  />
                </div>
                <button type="submit" className="btn-gold-sm">
                  Submit Ticket
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Previous Tickets</h2>
              <div className="card">
                {tickets.length === 0 ? (
                  <div className="p-12 text-center text-[var(--color-text-secondary)] text-base">No previous tickets</div>
                ) : (
                  <div className="divide-y divide-[var(--color-border)]">
                    {tickets.map((t) => (
                      <Link
                        key={t.id}
                        href={`/account/support/${t.id}`}
                        className="block p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-base text-[var(--color-text-primary)]">{t.subject}</p>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">{t.createdAt.toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1.5 text-sm rounded-full font-semibold ${
                            t.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                            t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}