import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import Link from "next/link";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const vendorOrders = await prisma.vendorOrder.findMany({
    where: {
      ...(status ? { fulfillmentStatus: status.toUpperCase() as never } : {}),
    },
    include: {
      order: { include: { buyer: { select: { name: true, email: true } } } },
      vendor: { select: { shopName: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const filters = [
    { label: "All", value: undefined },
    { label: "Pending", value: "pending" },
    { label: "Packed", value: "packed" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-black">View all platform orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = status === f.value || (!status && !f.value);
          return (
            <Link
              key={f.label}
              href={f.value ? `/admin/orders?status=${f.value}` : "/admin/orders"}
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
        {vendorOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-black">No orders found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-black">Order #</th>
                <th className="text-left p-4 text-sm font-medium text-black">Buyer</th>
                <th className="text-left p-4 text-sm font-medium text-black">Shop</th>
                <th className="text-left p-4 text-sm font-medium text-black">Items</th>
                <th className="text-left p-4 text-sm font-medium text-black">Total</th>
                <th className="text-left p-4 text-sm font-medium text-black">Status</th>
                <th className="text-left p-4 text-sm font-medium text-black">Date</th>
              </tr>
            </thead>
            <tbody>
              {vendorOrders.map((vo) => (
                <tr key={vo.id} className="border-b border-gray-200">
                  <td className="p-4 text-sm font-medium text-gray-900">{vo.order.orderNumber}</td>
                  <td className="p-4 text-sm text-black">{vo.order.buyer.name}</td>
                  <td className="p-4 text-sm text-black">{vo.vendor.shopName}</td>
                  <td className="p-4 text-sm text-black">{vo.items.length} item{vo.items.length > 1 ? 's' : ''}</td>
                  <td className="p-4 text-sm text-gray-900">{formatPrice(Number(vo.order.total))}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      vo.fulfillmentStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      vo.fulfillmentStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      vo.fulfillmentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {vo.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-black">{new Date(vo.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}