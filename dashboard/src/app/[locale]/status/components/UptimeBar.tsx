'use client';

import { useTranslations } from 'next-intl';
import type { HistoryDay } from './types';
import { formatDate, uptimeColor } from './utils';

export function UptimeBar({ history }: { history: HistoryDay[] }) {
  const t = useTranslations('status');
  const last30 = history.slice(-30);
  const avgUptime = last30.reduce((s, d) => s + d.uptime, 0) / last30.length;

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-slate-400">{t('last30Days')}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgUptime.toFixed(2)}%</span>
          {last30.length >= 2 && (
            <span className={`text-xs font-medium ${last30[last30.length - 1].uptime >= last30[last30.length - 2].uptime ? 'text-emerald-500' : 'text-red-500'}`}>
              {last30[last30.length - 1].uptime >= last30[last30.length - 2].uptime ? '↑' : '↓'}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-0.5 h-8">
        {last30.map((day) => (
          <div
            key={day.date}
            className={`flex-1 rounded-xs transition-all hover:opacity-80 cursor-help ${uptimeColor(day.uptime)}`}
            title={`${formatDate(day.date)}: ${day.uptime.toFixed(2)}%`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500 dark:text-slate-500">30 days ago</span>
        <span className="text-xs text-gray-500 dark:text-slate-500">{t("today")}</span>
      </div>
    </div>
  );
}
