'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  /** The label/title of the stat */
  label: string;
  /** The main value (string, number, or JSX element) */
  value: ReactNode;
  /** Icon element to display */
  icon: ReactNode;
  /** Optional trend indicator (positive or negative change) */
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  /** Optional color override */
  color?: 'blue' | 'emerald' | 'red' | 'amber' | 'violet' | 'slate';
  /** Whether the value is a percentage */
  isPercent?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-500/20',
    trend: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    trend: 'text-emerald-600 dark:text-emerald-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-100 dark:border-red-500/20',
    trend: 'text-red-600 dark:text-red-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-500/20',
    trend: 'text-amber-600 dark:text-amber-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    icon: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-100 dark:border-violet-500/20',
    trend: 'text-violet-600 dark:text-violet-400',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-500/10',
    icon: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-100 dark:border-slate-500/20',
    trend: 'text-slate-600 dark:text-slate-400',
  },
};

/**
 * Tremor-style StatCard component.
 *
 * Displays a metric with icon, value, label, and optional trend indicator.
 * Uses Tremor-inspired styling with Tailwind CSS.
 */
export function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  isPercent = false,
  className = '',
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={`glass-card p-4 hover-lift card-tilt group ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-9 h-9 rounded-lg ${colors.bg} ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border ${colors.border}`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.direction === 'up'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trend.direction === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {trend.direction === 'up' && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l5-5 5 5M7 11l5-5 5 5" />
              </svg>
            )}
            {trend.direction === 'down' && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-5 5-5-5M17 13l-5 5-5-5" />
              </svg>
            )}
            <span>
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
              {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="text-xs text-gray-500 dark:text-slate-500 ml-1">{trend.label}</span>
            )}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
        {isPercent ? `${value}%` : value}
      </div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
