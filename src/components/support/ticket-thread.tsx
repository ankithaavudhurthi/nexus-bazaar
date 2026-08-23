"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyToTicket, type TicketActionState } from "@/actions/support";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: TicketActionState = {};

type Message = {
  id: string;
  message: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  senderIsAdmin: boolean;
};

export function TicketThread({
  ticketId,
  messages,
  currentUserId,
}: {
  ticketId: string;
  messages: Message[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(replyToTicket, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-md border p-3 text-sm",
                isMine
                  ? "ml-auto border-[var(--color-ignition)]/30 bg-[var(--color-ignition)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              )}
            >
              <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">
                {m.senderName}
                {m.senderIsAdmin ? " (Support)" : ""} · {new Date(m.createdAt).toLocaleString()}
              </p>
              <p className="whitespace-pre-line">{m.message}</p>
            </div>
          );
        })}
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4"
      >
        <input type="hidden" name="ticketId" value={ticketId} />
        <textarea
          name="message"
          required
          rows={3}
          placeholder="Write a reply…"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus-visible:border-[var(--color-steel)]"
        />
        {state.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Sending…" : "Send reply"}
        </Button>
      </form>
    </div>
  );
}
