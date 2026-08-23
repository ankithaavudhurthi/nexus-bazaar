"use client";

import { useActionState, useEffect, useState } from "react";
import { createReview, type ReviewActionState } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { StarRatingInput } from "@/components/account/star-rating-input";

const initialState: ReviewActionState = {};

export function WriteReviewDialog({
  orderItemId,
  productName,
}: {
  orderItemId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createReview, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} type="button">
        Write a review
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {productName}</DialogTitle>
          <DialogDescription>Your review will show as a verified purchase.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="orderItemId" value={orderItemId} />
          <div>
            <Label>Rating</Label>
            <div className="mt-1">
              <StarRatingInput name="rating" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">Review</Label>
            <textarea
              id="body"
              name="body"
              required
              rows={4}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-sm outline-none focus-visible:border-[var(--color-steel)]"
            />
          </div>
          {state.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Submitting…" : "Submit review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
