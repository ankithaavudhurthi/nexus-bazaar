"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type TicketActionState = { error?: string; success?: boolean; ticketId?: string };

const newTicketSchema = z.object({
  subject: z.string().min(3, "Give it a short subject"),
  message: z.string().min(5, "Tell us what's going on"),
});

export async function createTicket(
  _prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const parsed = newTicketSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      subject: parsed.data.subject,
      status: "OPEN",
      messages: { create: { senderId: session.user.id, message: parsed.data.message } },
    },
  });

  revalidatePath("/account/support");
  revalidatePath("/admin/help");
  return { success: true, ticketId: ticket.id };
}

const replySchema = z.object({
  ticketId: z.string(),
  message: z.string().min(1, "Message can't be empty"),
});

export async function replyToTicket(
  _prevState: TicketActionState,
  formData: FormData
): Promise<TicketActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const parsed = replySchema.safeParse({
    ticketId: formData.get("ticketId"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const ticket = await prisma.supportTicket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket) return { error: "Ticket not found" };

  const isOwner = ticket.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { error: "Not authorized" };

  await prisma.ticketMessage.create({
    data: { ticketId: ticket.id, senderId: session.user.id, message: parsed.data.message },
  });

  // Replying reopens a resolved ticket, and an admin reply moves it to
  // in-progress so other admins can see it's being worked.
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: isAdmin ? "IN_PROGRESS" : ticket.status === "RESOLVED" ? "OPEN" : ticket.status,
    },
  });

  revalidatePath(`/account/support/${ticket.id}`);
  revalidatePath(`/admin/help/${ticket.id}`);
  return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Not authorized" };

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" },
  });

  revalidatePath(`/admin/help/${ticketId}`);
  revalidatePath("/admin/help");
}
