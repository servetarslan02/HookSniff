/**
 * Loading skeletons for Suspense boundaries.
 * Used in dashboard, admin, and docs layouts.
 *
 * Each skeleton mirrors the layout structure so the page
 * doesn't jump when real content loads in.
 */

export function SkeletonDashboard() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>

      {/* Table rows */}
      <div className="space-y-3">
        <div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonAdmin() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-56 rounded-lg bg-gray-200 dark:bg-slate-700" />
        <div className="h-5 w-16 rounded-full bg-red-100 dark:bg-red-900/30" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-gray-200 dark:bg-slate-700"
          />
        ))}
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="h-10 rounded-lg bg-gray-200 dark:bg-slate-700" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-gray-100 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDocs() {
  return (
    <div className="animate-pulse flex gap-8">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-60 shrink-0 space-y-6 py-8">
        {Array.from({ length: 4 }).map((_, g) => (
          <div key={g} className="space-y-2">
            <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            {Array.from({ length: 4 + g }).map((_, i) => (
              <div
                key={i}
                className="h-4 rounded bg-gray-100 dark:bg-gray-800"
                style={{ width: `${60 + ((g * 7 + i * 13) % 30)}%` }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-4 py-10">
        <div className="h-8 w-72 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-4/6 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-32 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}
