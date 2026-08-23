export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="h-4 w-60 rounded bg-gray-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-24 rounded border border-gray-200 bg-white" />
        <div className="h-24 rounded border border-gray-200 bg-white" />
        <div className="h-24 rounded border border-gray-200 bg-white" />
        <div className="h-24 rounded border border-gray-200 bg-white" />
      </div>
      <div className="h-72 rounded border border-gray-200 bg-white" />
    </div>
  );
}
