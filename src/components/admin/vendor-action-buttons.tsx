"use client";

import { useTransition } from "react";
import { approveVendor, suspendVendor, reactivateMerchant } from "@/actions/admin-vendors";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldAlert, RefreshCw } from "lucide-react";

export function VendorActionButtons({
  vendorId,
  status,
}: {
  vendorId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {status === "PENDING" && (
        <Button
          size="sm"
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold flex items-center gap-1.5"
          onClick={() => startTransition(() => void approveVendor(vendorId))}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isPending ? "Approving…" : "Approve"}
        </Button>
      )}

      {status === "APPROVED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          className="border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 font-semibold flex items-center gap-1.5"
          onClick={() => startTransition(() => void suspendVendor(vendorId))}
        >
          <ShieldAlert className="h-4 w-4" />
          {isPending ? "Suspending…" : "Suspend"}
        </Button>
      )}

      {status === "SUSPENDED" && (
        <Button
          size="sm"
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold flex items-center gap-1.5"
          onClick={() => startTransition(() => void reactivateMerchant(vendorId))}
        >
          <RefreshCw className="h-4 w-4" />
          {isPending ? "Unsuspending…" : "Unsuspend"}
        </Button>
      )}
    </div>
  );
}
