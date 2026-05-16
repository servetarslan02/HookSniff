'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type TimeRange = '24h' | '7d' | '30d' | '90d';

interface ChartCardProps {
  /** Chart title */
  title: string;
  /** The chart content */
  children: ReactNode;
  /** Whether to show the time range selector */
  showTimeRange?: boolean;
  /** Current time range value */
  timeRange?: TimeRange;
  /** Callback when time range changes */
  onTimeRangeChange?: (range: TimeRange) => void;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional action element in the header */
  action?: ReactNode;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Tremor-style ChartCard wrapper component.
 *
 * Provides a consistent card layout for charts with optional
 * time range selector and action buttons.
 */
export function ChartCard({
  title,
  children,
  showTimeRange = false,
  timeRange = '24h',
  onTimeRangeChange,
  subtitle,
  action,
  className = '',
}: ChartCardProps) {
  const t = useTranslations('chart');

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: t('hours24') },
    { value: '7d', label: t('days7') },
    { value: '30d', label: t('days30') },
    { value: '90d', label: t('days90') },
  ];

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showTimeRange && onTimeRangeChange && (
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
              {timeRanges.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onTimeRangeChange(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    timeRange === value
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}
