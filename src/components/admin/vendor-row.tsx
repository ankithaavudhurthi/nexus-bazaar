"use client";

import { useState, useTransition } from "react";
import {
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateMerchant,
  updateVendorCommission,
} from "@/actions/admin-vendors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, vendorStatusTone } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Store, User, Mail, Calendar, Percent, ShieldAlert, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

type VendorRowData = {
  id: string;
  shopName: string;
  businessName: string;
  status: string;
  createdAt: Date;
  commissionRateOverride: number | null;
  user: { name: string; email: string };
};

export function VendorRow({ vendor }: { vendor: VendorRowData }) {
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [commissionInput, setCommissionInput] = useState(
    vendor.commissionRateOverride?.toString() ?? ""
  );
  const [commissionError, setCommissionError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 py-5 transition-colors hover:bg-[var(--color-bg)]/40 rounded-xl px-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--color-border)]/50 last:border-0">
      <div className="space-y-2 flex-1">
        {/* Title and Status Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
            <Store className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            {vendor.shopName}
          </span>
          <StatusBadge tone={vendorStatusTone(vendor.status)}>{vendor.status}</StatusBadge>
        </div>

        {/* Business & User Credentials */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
          <span className="font-medium text-[var(--color-text-primary)]">{vendor.businessName}</span>
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 opacity-70" />
            {vendor.user.name}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Mail className="h-3.5 w-3.5 opacity-70" />
            {vendor.user.email}
          </span>
          <span className="flex items-center gap-1 font-numeric text-[11px] opacity-80">
            <Calendar className="h-3.5 w-3.5 opacity-70" />
            Applied {vendor.createdAt.toLocaleDateString()}
          </span>
        </div>

        {/* Commission Rate Override Controls */}
        {vendor.status === "APPROVED" && (
          <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-bg)]/80 p-2.5 max-w-md">
            <Label htmlFor={`commission-${vendor.id}`} className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1 shrink-0">
              <Percent className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Commission Override (%)
            </Label>
            <Input
              id={`commission-${vendor.id}`}
              type="number"
              min={0}
              max={100}
              step="0.1"
              placeholder="System Default"
              value={commissionInput}
              onChange={(e) => setCommissionInput(e.target.value)}
              className="font-numeric h-7 w-28 text-xs bg-[var(--color-surface)] border-[var(--color-border)]"
              disabled={isPending}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              className="h-7 text-xs border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium"
              onClick={() =>
                startTransition(async () => {
                  setCommissionError(null);
                  const res = await updateVendorCommission(vendor.id, commissionInput);
                  if (res?.error) setCommissionError(res.error);
                })
              }
            >
              {isPending ? "Updating…" : "Update Rate"}
            </Button>
            {commissionError && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">{commissionError}</span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
        {vendor.status === "PENDING" && (
          <>
            <Button
              size="sm"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold flex items-center gap-1.5"
              onClick={() => startTransition(() => approveVendor(vendor.id))}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isPending ? "Authorizing…" : "Authorize Merchant"}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={isPending}
              className="border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 font-semibold flex items-center gap-1.5"
              onClick={() => setRejectOpen(true)}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </>
        )}
        {vendor.status === "APPROVED" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            className="border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 font-semibold flex items-center gap-1.5"
            onClick={() => startTransition(() => suspendVendor(vendor.id))}
          >
            <ShieldAlert className="h-4 w-4" />
            {isPending ? "Suspending…" : "Suspend Storefront"}
          </Button>
        )}
        {vendor.status === "SUSPENDED" && (
          <Button
            size="sm"
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold flex items-center gap-1.5"
            onClick={() => startTransition(() => reactivateMerchant(vendor.id))}
          >
            <RefreshCw className="h-4 w-4" />
            {isPending ? "Reactivating…" : "Reactivate Merchant"}
          </Button>
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-lg font-bold text-[var(--color-text-primary)]">
              Reject Merchant Application: {vendor.shopName}
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--color-text-secondary)]">
              Specify the compliance or document review reason. This message will be displayed to the merchant upon login.
            </DialogDescription>
          </DialogHeader>
          <form
            action={(formData) => {
              startTransition(async () => {
                await rejectVendor(formData);
                setRejectOpen(false);
              });
            }}
            className="flex flex-col gap-4 mt-2"
          >
            <input type="hidden" name="vendorProfileId" value={vendor.id} />
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-semibold text-[var(--color-text-primary)]">
                Rejection Remarks / Deficiency Details
              </Label>
              <textarea
                id="reason"
                name="reason"
                required
                rows={3}
                placeholder="e.g. Invalid GST document or mismatched account holder name."
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-xs outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="sm" className="text-xs">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" size="sm" disabled={isPending} className="text-xs font-semibold">
                {isPending ? "Rejecting…" : "Confirm Application Rejection"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}