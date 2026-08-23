"use client";

import { useActionState, useEffect, useState } from "react";
import { requestRefund, type RefundActionState } from "@/actions/buyer-orders";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const initialState: RefundActionState = {};

export function RefundRequestDialog({
  vendorOrderId,
  shopName,
}: {
  vendorOrderId: string;
  shopName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(requestRefund, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} type="button">
        Request refund
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a refund from {shopName}</DialogTitle>
          <DialogDescription>
            The vendor will review this request. You&apos;ll be notified once they respond.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="vendorOrderId" value={vendorOrderId} />
          <Label htmlFor="reason">Reason</Label>
          <textarea
            id="reason"
            name="reason"
            required
            rows={3}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-2 text-sm outline-none focus-visible:border-[var(--color-steel)]"
          />
          {state.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
