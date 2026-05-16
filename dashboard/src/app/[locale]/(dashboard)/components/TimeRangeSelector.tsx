'use client';

import { useTranslations } from 'next-intl';

export type TimeRange = '24h' | '7d' | '30d';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const t = useTranslations('dashboard');

  const options: { label: string; value: TimeRange }[] = [
    { label: t('timeRange24h'), value: '24h' },
    { label: t('timeRange7d'), value: '7d' },
    { label: t('timeRange30d'), value: '30d' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-slate-800 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            value === opt.value
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
