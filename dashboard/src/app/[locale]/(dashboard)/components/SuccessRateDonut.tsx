'use client';

import { type SuccessRateData } from '@/lib/api';

interface SuccessRateDonutProps {
  data: SuccessRateData | null;
  loading?: boolean;
}

export function SuccessRateDonut({ data, loading }: SuccessRateDonutProps) {
  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400 dark:text-slate-500">Loading...</div>
      </div>
    );
  }

  const rate = data?.success_rate ?? 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (rate / 100) * circumference;
  const color = rate >= 99 ? 'text-emerald-500' : rate >= 95 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-gray-200 dark:stroke-slate-700" />
          <circle
            cx="50" cy="50" r="45" fill="none" strokeWidth="8"
            className={`${color} stroke-current`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{rate.toFixed(1)}%</span>
          <span className="text-xs text-gray-500 dark:text-slate-400">success</span>
        </div>
      </div>
    </div>
  );
}
