export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatRelativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function uptimeColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-400';
  if (pct >= 99) return 'bg-lime-400';
  if (pct >= 95) return 'bg-yellow-400';
  if (pct >= 90) return 'bg-orange-400';
  return 'bg-red-400';
}

export function uptimeCalendarColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 99) return 'bg-lime-500';
  if (pct >= 95) return 'bg-yellow-500';
  if (pct >= 90) return 'bg-orange-500';
  if (pct > 0) return 'bg-red-500';
  return 'bg-gray-600';
}

export function latencyColor(ms: number | null): string {
  if (ms === null || ms === 0) return 'text-gray-500 dark:text-slate-500';
  if (ms < 200) return 'text-emerald-600 dark:text-emerald-400';
  if (ms < 500) return 'text-yellow-600 dark:text-yellow-400';
  if (ms < 1000) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function sparkBarColor(ms: number): string {
  if (ms < 200) return 'bg-emerald-400';
  if (ms < 500) return 'bg-yellow-400';
  if (ms < 1000) return 'bg-orange-400';
  return 'bg-red-400';
}
