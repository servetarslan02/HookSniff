'use client';

// ─── Status Badge (system health) ───
// NOTE: This is intentionally separate from @/components/StatusBadge.
// The shared StatusBadge handles delivery statuses (delivered, failed, pending, etc.)
// while this one handles system/infra health statuses (healthy, degraded, down, investigating, etc.)
// They share the same visual pattern but different status vocabularies.
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    healthy: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Operational' },
    operational: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Operational' },
    degraded: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Degraded' },
    unhealthy: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Unhealthy' },
    down: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Down' },
    investigating: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Investigating' },
    identified: { bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', label: 'Identified' },
    monitoring: { bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', label: 'Monitoring' },
    resolved: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Resolved' },
    unknown: { bg: 'bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-slate-700', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400', label: 'Unknown' },
  };
  const style = styles[status] || styles.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
