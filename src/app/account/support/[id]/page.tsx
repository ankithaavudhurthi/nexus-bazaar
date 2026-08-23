import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { TicketThread } from "@/components/support/ticket-thread";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?next=/account/support/${id}`);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket || ticket.userId !== session.user.id) notFound();

  // Look up sender names/roles for the thread in one query.
  const senderIds = Array.from(new Set(ticket.messages.map((m) => m.senderId)));
  const senders = await prisma.user.findMany({
    where: { id: { in: senderIds } },
    select: { id: true, name: true, role: true },
  });
  const senderMap = new Map(senders.map((s) => [s.id, s]));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-10 pt-24">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-semibold">{ticket.subject}</h1>
          <StatusBadge tone="steel">{ticket.status}</StatusBadge>
        </div>

        <div className="mt-6">
          <TicketThread
            ticketId={ticket.id}
            currentUserId={session.user.id}
            messages={ticket.messages.map((m) => ({
              id: m.id,
              message: m.message,
              createdAt: m.createdAt.toISOString(),
              senderId: m.senderId,
              senderName: senderMap.get(m.senderId)?.name ?? "Unknown",
              senderIsAdmin: senderMap.get(m.senderId)?.role === "ADMIN",
            }))}
          />
        </div>
      </main>
    </>
  );
}
