'use client';

import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <svg
        className={clsx('animate-spin text-brand-600', sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-sm w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/4" />
      </div>
      <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-6">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
