'use client';

import { useTranslations } from 'next-intl';

export type TimeRange = '24h' | '7d' | '30d';

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  const t = useTranslations('dashboard');
  const ranges: TimeRange[] = ['24h', '7d', '30d'];
  const labels: Record<TimeRange, string> = { '24h': t('timeRange.24h'), '7d': t('timeRange.7d'), '30d': t('timeRange.30d') };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            value === range
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          {labels[range]}
        </button>
      ))}
    </div>
  );
}
