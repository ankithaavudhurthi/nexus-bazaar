import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TicketThread } from "@/components/support/ticket-thread";
import { TicketStatusSelect } from "@/components/admin/ticket-status-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true, email: true, role: true } },
    },
  });
  if (!ticket) notFound();

  const senderIds = Array.from(new Set(ticket.messages.map((m) => m.senderId)));
  const senders = await prisma.user.findMany({
    where: { id: { in: senderIds } },
    select: { id: true, name: true, role: true },
  });
  const senderMap = new Map(senders.map((s) => [s.id, s]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12 space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/help"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Support Tickets</span>
        </Link>
      </div>

      {/* Header Info & Status Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-border)]/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
            {ticket.subject}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Created by <span className="font-semibold text-[var(--color-text-primary)]">{ticket.user.name}</span> ({ticket.user.email}) · <span className="capitalize">{ticket.user.role.toLowerCase()}</span>
          </p>
        </div>
        <div className="shrink-0">
          <TicketStatusSelect ticketId={ticket.id} status={ticket.status} />
        </div>
      </div>

      {/* Main Ticket Thread Card */}
      <Card className="border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader className="border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/30 px-6 py-4">
          <CardTitle className="text-base font-bold text-[var(--color-text-primary)]">
            Conversation Thread
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <TicketThread
            ticketId={ticket.id}
            currentUserId={session!.user.id}
            messages={ticket.messages.map((m) => ({
              id: m.id,
              message: m.message,
              createdAt: m.createdAt.toISOString(),
              senderId: m.senderId,
              senderName: senderMap.get(m.senderId)?.name ?? "Unknown",
              senderIsAdmin: senderMap.get(m.senderId)?.role === "ADMIN",
            }))}
          />
        </CardContent>
      </Card>
    </main>
  );
}