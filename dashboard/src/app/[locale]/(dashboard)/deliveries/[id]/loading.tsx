export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="glass-card p-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
      </div>
      <div className="glass-card p-6">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-2/3" />
      </div>
    </div>
  );
}
