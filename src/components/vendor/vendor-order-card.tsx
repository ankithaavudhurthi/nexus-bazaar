"use client";

import { useActionState, useTransition } from "react";
import {
  updateFulfillment,
  resolveRefundRequest,
  type VendorOrderActionState,
} from "@/actions/vendor-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/lib/format";

const initialState: VendorOrderActionState = {};

type VendorOrderData = {
  id: string;
  orderNumber: string;
  fulfillmentStatus: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  vendorEarning: string;
  createdAt: string;
  customer?: {
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  shippingAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    productImage: string;
    customImage?: string | null;
    customText?: string | null;
  }[];
  activeRefund: { id: string; reason: string; amount: string } | null;
};

export function VendorOrderCard({ order }: { order: VendorOrderData }) {
  const [state, formAction, pending] = useActionState(updateFulfillment, initialState);
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="font-numeric text-base">{order.orderNumber}</CardTitle>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {new Date(order.createdAt).toLocaleDateString()} · Earning{" "}
            {formatPrice(order.vendorEarning)}
          </p>
        </div>
        <StatusBadge tone="steel">{order.fulfillmentStatus}</StatusBadge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {(order.customer || order.shippingAddress) && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-3.5 text-sm flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Delivery Details
            </span>
            <div className="flex flex-col gap-1 text-xs text-[var(--color-text-primary)]">
              {order.customer?.name && (
                <p>
                  <span className="text-[var(--color-text-secondary)]">Customer:</span>{" "}
                  <span className="font-semibold">{order.customer.name}</span>
                </p>
              )}
              {order.customer?.phone && (
                <p>
                  <span className="text-[var(--color-text-secondary)]">Phone:</span>{" "}
                  <span className="font-numeric font-medium">{order.customer.phone}</span>
                </p>
              )}
              {order.customer?.email && (
                <p>
                  <span className="text-[var(--color-text-secondary)]">Email:</span>{" "}
                  <span>{order.customer.email}</span>
                </p>
              )}

              {order.shippingAddress && (
                <div className="mt-1 pt-2 border-t border-[var(--color-border)]/50">
                  <p className="text-[var(--color-text-secondary)] font-medium mb-0.5">
                    Delivery Address:
                  </p>
                  <p className="font-medium">{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && (
                    <p className="font-medium">{order.shippingAddress.line2}</p>
                  )}
                  <p className="font-medium">
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    <span className="font-numeric">{order.shippingAddress.pincode}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5 border-b border-[var(--color-border)]/40 pb-2.5 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {item.productName} × {item.quantity}
              </p>
              {(item.customText || item.customImage) && (
                <div className="mt-1 flex flex-col gap-2 rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 p-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                    Customization Details
                  </span>
                  {item.customText && (
                    <div className="text-xs text-[var(--color-text-primary)]">
                      <span className="font-semibold">Custom Text:</span>{" "}
                      <span className="font-normal italic text-[var(--color-gold-dark)]">{item.customText}</span>
                    </div>
                  )}
                  {item.customImage && (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="relative h-14 w-14 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.customImage}
                          alt="Customer Reference Image"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">
                          Reference Image
                        </span>
                        <a
                          href={item.customImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 text-xs font-semibold text-[var(--color-gold-dark)] hover:underline"
                        >
                          View Image ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {order.activeRefund && (
          <div className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3 text-sm">
            <p className="font-medium">
              Refund requested — {formatPrice(order.activeRefund.amount)}
            </p>
            <p className="text-[var(--color-text-secondary)]">{order.activeRefund.reason}</p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => void resolveRefundRequest(order.activeRefund!.id, true))
                }
              >
                {isPending ? "Processing…" : "Approve & refund"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => void resolveRefundRequest(order.activeRefund!.id, false))
                }
              >
                {isPending ? "Processing…" : "Reject"}
              </Button>
            </div>
          </div>
        )}

        <form
          action={formAction}
          className="flex flex-wrap items-end gap-2 border-t border-[var(--color-border)] pt-4"
        >
          <input type="hidden" name="vendorOrderId" value={order.id} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              Status
            </label>
            <NativeSelect
              name="fulfillmentStatus"
              defaultValue={order.fulfillmentStatus}
              className="w-40"
            >
              <option value="PENDING">Pending</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              Carrier
            </label>
            <Input
              name="trackingCarrier"
              defaultValue={order.trackingCarrier ?? ""}
              className="w-32"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              Tracking #
            </label>
            <Input
              name="trackingNumber"
              defaultValue={order.trackingNumber ?? ""}
              className="w-36 font-numeric"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? "Saving…" : "Update"}
          </Button>
          {state.error && (
            <p className="w-full text-sm text-[var(--color-danger)]">{state.error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
