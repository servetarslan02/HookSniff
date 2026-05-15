'use client';

/**
 * Shared loading skeleton for dashboard pages.
 * Shows a tab bar skeleton + content placeholder.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Tab bar skeleton */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded-t-lg"
            />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {/* Stat cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 dark:bg-slate-700 rounded-xl"
            />
          ))}
        </div>

        {/* Table/chart skeleton */}
        <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />

        {/* Row skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
