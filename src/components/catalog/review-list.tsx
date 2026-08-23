import { Star } from "lucide-react";
import { VendorReplyForm } from "@/components/vendor/review-reply-form";

type ReviewData = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  vendorReply: string | null;
  createdAt: Date;
  buyerName: string;
};

export function ReviewList({
  reviews,
  canReplyAsVendor,
}: {
  reviews: ReviewData[];
  canReplyAsVendor: boolean;
}) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        No reviews yet — be the first to buy and review this.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((r) => (
        <div key={r.id} className="border-b border-[var(--color-border)] pb-4 last:border-0">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={
                    n <= r.rating
                      ? "h-4 w-4 fill-[var(--color-ignition)] text-[var(--color-ignition)]"
                      : "h-4 w-4 text-[var(--color-border)]"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-medium">{r.buyerName}</span>
            <span className="text-xs text-[var(--color-success)]">Verified purchase</span>
          </div>
          {r.title && <p className="mt-1 font-medium">{r.title}</p>}
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{r.body}</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {r.createdAt.toLocaleDateString()}
          </p>

          {r.vendorReply ? (
            <div className="mt-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
              <p className="mb-1 text-xs font-semibold text-[var(--color-steel)]">
                Vendor response
              </p>
              <p className="text-[var(--color-text-secondary)]">{r.vendorReply}</p>
            </div>
          ) : (
            canReplyAsVendor && <VendorReplyForm reviewId={r.id} />
          )}
        </div>
      ))}
    </div>
  );
}
