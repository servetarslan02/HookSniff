import { Check, Repeat, X } from 'lucide-react';
'use client';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; ring: string; dot: string; icon?: string }> = {
  delivered: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'ring-emerald-600/20 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
    icon: <Check size={16} strokeWidth={1.75} />,
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'ring-emerald-600/20 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
    icon: <Check size={16} strokeWidth={1.75} />,
  },
  failed: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    ring: 'ring-red-600/20 dark:ring-red-500/30',
    dot: 'bg-red-500',
    icon: <X size={16} strokeWidth={1.75} />,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    ring: 'ring-red-600/20 dark:ring-red-500/30',
    dot: 'bg-red-500',
    icon: <X size={16} strokeWidth={1.75} />,
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    ring: 'ring-amber-600/20 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
    icon: '…',
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
  banned: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    ring: 'ring-red-600/20 dark:ring-red-500/30',
    dot: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    ring: 'ring-amber-600/20 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  paid: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'ring-emerald-600/20 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  replayed: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-400',
    ring: 'ring-violet-600/20 dark:ring-violet-500/30',
    dot: 'bg-violet-500',
    icon: '↩',
  },
  cached: {
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-400',
    ring: 'ring-cyan-600/20 dark:ring-cyan-500/30',
    dot: 'bg-cyan-500',
    icon: <Repeat size={16} strokeWidth={1.75} />,
  },
  filtered: {
    bg: 'bg-gray-50 dark:bg-gray-500/10',
    text: 'text-gray-500 dark:text-gray-400',
    ring: 'ring-gray-400/20 dark:ring-gray-500/30',
    dot: 'bg-gray-400',
    icon: '⏭',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
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

export default StatusBadge;
