import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { VendorActionButtons } from "@/components/admin/vendor-action-buttons";

export default async function AdminVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      products: {
        where: { status: "ACTIVE" },
        take: 10,
      },
      vendorOrders: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/vendors" className="text-sm text-[var(--color-gold)] hover:underline mb-2 block">
            ← Back to Shops
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{vendor.shopName}</h1>
          <p className="text-sm text-gray-700">
            {vendor.user.name} • {vendor.user.email} • Phone: {vendor.user.phone ?? "Not provided"}
          </p>
        </div>
        <div className="flex gap-3">
          <VendorActionButtons vendorId={vendor.id} status={vendor.status} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Status</p>
          <p className="text-2xl font-bold text-[var(--color-gold)]">{vendor.status}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Products</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{vendor.products.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">Orders</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{vendor.vendorOrders.length}</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Shop Description</h2>
          <p className="text-[var(--color-text-secondary)]">{vendor.shopDescription || "No description provided"}</p>
        </div>

        {(vendor.instagramHandle || vendor.websiteUrl) && (
          <div className="pt-4 border-t border-[var(--color-border)] grid gap-4 sm:grid-cols-2">
            {vendor.instagramHandle && (
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Instagram ID</p>
                <a
                  href={`https://instagram.com/${vendor.instagramHandle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[var(--color-gold-dark)] hover:underline"
                >
                  @{vendor.instagramHandle.replace(/^@/, '')}
                </a>
              </div>
            )}
            {vendor.websiteUrl && (
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">Website URL</p>
                <a
                  href={vendor.websiteUrl.startsWith('http') ? vendor.websiteUrl : `https://${vendor.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[var(--color-gold-dark)] hover:underline"
                >
                  {vendor.websiteUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Recent Products</h2>
        </div>
        {vendor.products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-700">No products found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Price</th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {vendor.products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200">
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-sm text-[var(--color-text-primary)]">{formatPrice(Number(product.basePrice))}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}