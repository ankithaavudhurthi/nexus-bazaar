"use client";

import { useTransition } from "react";
import { updateTicketStatus } from "@/actions/support";
import { NativeSelect } from "@/components/ui/select-native";

export function TicketStatusSelect({ ticketId, status }: { ticketId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <NativeSelect
      value={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => void updateTicketStatus(ticketId, e.target.value))}
      className="w-40"
    >
      <option value="OPEN">Open</option>
      <option value="IN_PROGRESS">In progress</option>
      <option value="RESOLVED">Resolved</option>
      <option value="CLOSED">Closed</option>
    </NativeSelect>
  );
}
