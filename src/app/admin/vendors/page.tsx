import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { VendorActionButtons } from "@/components/admin/vendor-action-buttons";

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const vendors = await prisma.vendorProfile.findMany({
    where: status ? { status: status.toUpperCase() as never } : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const filters = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Suspended", value: "suspended" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
        <p className="text-sm text-black">Manage vendor applications and shops</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = status === f.value || (!status && !f.value);
          return (
            <Link
              key={f.label}
              href={f.value ? `/admin/vendors?status=${f.value}` : "/admin/vendors"}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-all ${
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

      <div className="bg-white border border-gray-200 rounded">
        {vendors.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-black">No vendors found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-black">Shop Name</th>
                <th className="text-left p-4 text-sm font-medium text-black">Owner</th>
                <th className="text-left p-4 text-sm font-medium text-black">Email</th>
                <th className="text-left p-4 text-sm font-medium text-black">Status</th>
                <th className="text-left p-4 text-sm font-medium text-black">Joined</th>
                <th className="text-left p-4 text-sm font-medium text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-b border-gray-200">
                  <td className="p-4 font-medium text-gray-900">{v.shopName}</td>
                  <td className="p-4 text-sm text-black">{v.user.name}</td>
                  <td className="p-4 text-sm text-black">{v.user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      v.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      v.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      v.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-black">{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex items-center gap-3">
                    <Link href={`/admin/vendors/${v.id}`} className="text-sm font-medium text-[var(--color-gold-dark)] hover:underline">
                      View
                    </Link>
                    <VendorActionButtons vendorId={v.id} status={v.status} />
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