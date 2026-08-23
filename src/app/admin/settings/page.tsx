import { prisma } from "@/lib/prisma";
import {
  PlatformSettingsForm,
  AddCategoryForm,
  DeleteCategoryButton,
} from "@/components/admin/settings-forms";

export default async function AdminSettingsPage() {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Platform configuration</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Commission & Tax</h2>
        <PlatformSettingsForm
          defaultCommissionRate={settings.defaultCommissionRate}
          taxRate={settings.taxRate}
        />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Add Category</h2>
        <AddCategoryForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>

      <div>
        <h2 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">Existing Categories</h2>
        <div className="card">
          {categories.length === 0 ? (
            <div className="p-4 text-center text-[var(--color-text-secondary)]">No categories yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-black">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-black">Slug</th>
                  <th className="text-left p-4 text-sm font-medium text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-gray-200">
                    <td className="p-4 font-medium text-gray-900">{c.name}</td>
                    <td className="p-4 text-sm text-black">{c.slug}</td>
                    <td className="p-4">
                      <DeleteCategoryButton categoryId={c.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}