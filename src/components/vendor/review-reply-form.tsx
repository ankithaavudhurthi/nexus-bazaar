"use client";

import { useActionState, useState } from "react";
import { replyToReview, type ReviewActionState } from "@/actions/reviews";
import { Button } from "@/components/ui/button";

const initialState: ReviewActionState = {};

export function VendorReplyForm({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(replyToReview, initialState);

  if (state.success) {
    return <p className="text-sm text-[var(--color-success)]">Reply posted.</p>;
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} type="button">
        Reply as vendor
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <textarea
        name="vendorReply"
        required
        rows={2}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-sm outline-none focus-visible:border-[var(--color-steel)]"
      />
      {state.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "Posting…" : "Post reply"}
      </Button>
    </form>
  );
}
