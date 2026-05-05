'use client';

interface StatusBadgeProps {
  /** The status string */
  status: string;
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional className for additional styling */
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  delivered: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'ring-emerald-600/20 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'ring-emerald-600/20 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  failed: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    ring: 'ring-red-600/20 dark:ring-red-500/30',
    dot: 'bg-red-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    ring: 'ring-red-600/20 dark:ring-red-500/30',
    dot: 'bg-red-500',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    ring: 'ring-amber-600/20 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  active: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    ring: 'ring-blue-600/20 dark:ring-blue-500/30',
    dot: 'bg-blue-500',
  },
  inactive: {
    bg: 'bg-gray-50 dark:bg-gray-500/10',
    text: 'text-gray-700 dark:text-gray-400',
    ring: 'ring-gray-600/20 dark:ring-gray-500/30',
    dot: 'bg-gray-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    ring: 'ring-amber-600/20 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

/**
 * Tremor-style StatusBadge component.
 *
 * A color-coded status indicator that adapts to common
 * webhook delivery statuses. Supports multiple size variants.
 */
export function StatusBadge({
  status,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.pending;
  const sizeClass = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset ${style.bg} ${style.text} ${style.ring} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
