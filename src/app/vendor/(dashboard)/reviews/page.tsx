import { getMemoizedSession, getMemoizedVendorProfile } from "@/lib/memoized-auth";
import { prisma } from "@/lib/prisma";

export default async function VendorReviewsPage() {
  const session = await getMemoizedSession();
  if (!session?.user?.id) return null;

  const vendor = await getMemoizedVendorProfile(session.user.id);
  if (!vendor) return null;

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id, reviewCount: { gt: 0 } },
    include: {
      reviews: {
        include: { buyer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { reviewCount: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      <div className="bg-white border border-gray-200 rounded">
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-black">No reviews yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{p.name}</h3>
                  <span className="text-sm text-black">{p.avgRating.toFixed(1)}★ ({p.reviewCount})</span>
                </div>
                <div className="space-y-3">
                  {p.reviews.map((r) => (
                    <div key={r.id} className="bg-gray-50 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{r.buyer.name}</span>
                        <span className="text-sm text-black">{r.rating}★</span>
                      </div>
                      <p className="text-sm text-black">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}