import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getMemoizedSession, getMemoizedVendorProfile } from "@/lib/memoized-auth";
import { formatPrice } from "@/lib/format";

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await getMemoizedSession();
  if (!session?.user?.id) return null;

  const vendor = await getMemoizedVendorProfile(session.user.id);
  if (!vendor) return null;

  const products = await prisma.product.findMany({
    where: {
      vendorId: vendor.id,
      ...(status ? { status: status.toUpperCase() as never } : {}),
    },
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  const filters = [
    { label: "All", value: undefined },
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Products</h1>
        <Link href="/vendor/products/new" className="btn-gold-sm">
          Add Product
        </Link>
      </div>

      <div className="flex gap-3">
        {filters.map((f) => {
          const isActive = status === f.value || (!status && !f.value);
          return (
            <Link
              key={f.label}
              href={f.value ? `/vendor/products?status=${f.value}` : "/vendor/products"}
              className={`px-5 py-2.5 text-base rounded-full font-semibold transition-all ${
                isActive
                  ? "btn-gold-sm"
                  : "btn-outline"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="card">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base text-[var(--color-text-secondary)]">No products found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="text-left p-5 text-base font-semibold text-gray-700">Product</th>
                <th className="text-left p-5 text-base font-semibold text-gray-700">Price</th>
                <th className="text-left p-5 text-base font-semibold text-gray-700">Stock</th>
                <th className="text-left p-5 text-base font-semibold text-gray-700">Status</th>
                <th className="text-left p-5 text-base font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)]">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      {p.images[0] && (
                        <div className="relative w-14 h-14 overflow-hidden rounded">
                          <Image
                            src={p.images[0].url}
                            alt={p.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-base text-[var(--color-text-primary)]">{p.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-base text-[var(--color-text-primary)] font-medium">{formatPrice(Number(p.basePrice))}</td>
                  <td className="p-5 text-base text-[var(--color-text-primary)] font-medium">{p.stock}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 text-sm rounded-full font-semibold ${
                      p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <Link href={`/vendor/products/${p.id}/edit`} className="btn-link text-sm">
                      Edit
                    </Link>
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