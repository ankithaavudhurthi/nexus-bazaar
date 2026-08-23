"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTicket, type TicketActionState } from "@/actions/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: TicketActionState = {};

export function NewTicketForm() {
  const [state, formAction, pending] = useActionState(createTicket, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.ticketId) {
      router.push(`/account/support/${state.ticketId}`);
    }
  }, [state.success, state.ticketId, router]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm outline-none focus-visible:border-[var(--color-steel)]"
        />
      </div>
      {state.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
