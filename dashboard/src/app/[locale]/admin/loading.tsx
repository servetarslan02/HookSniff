export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="glass-card p-6">
        <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="glass-card p-6">
          <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
