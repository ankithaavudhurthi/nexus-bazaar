import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHelpPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const tickets = await prisma.supportTicket.findMany({
    where: status ? { status: status.toUpperCase() as never } : undefined,
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const filters = [
    { label: "All", value: undefined },
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help</h1>
        <p className="text-sm text-black">Manage support tickets</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = status === f.value || (!status && !f.value);
          return (
            <Link
              key={f.label}
              href={f.value ? `/admin/help?status=${f.value}` : "/admin/help"}
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
        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-black">No tickets found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-black">Subject</th>
                <th className="text-left p-4 text-sm font-medium text-black">User</th>
                <th className="text-left p-4 text-sm font-medium text-black">Role</th>
                <th className="text-left p-4 text-sm font-medium text-black">Status</th>
                <th className="text-left p-4 text-sm font-medium text-black">Created</th>
                <th className="text-left p-4 text-sm font-medium text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-gray-200">
                  <td className="p-4 font-medium text-gray-900">{t.subject}</td>
                  <td className="p-4 text-sm text-black">{t.user.name}</td>
                  <td className="p-4 text-sm text-black">{t.user.role}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      t.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      t.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-black">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Link href={`/admin/help/${t.id}`} className="text-sm text-[var(--color-gold)] hover:underline">
                      View
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