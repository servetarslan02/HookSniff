'use client';

import { useTranslations } from 'next-intl';
import type { ComponentStatus } from './types';
import { latencyColor } from './utils';
import { StatusBadge } from './StatusBadge';
import { Sparkline } from './Sparkline';
import { Wrench } from 'lucide-react';

export function ComponentRow({ component, responseTimes }: { component: ComponentStatus; responseTimes: number[] }) {
  const t = useTranslations('status');
  const currentLatency = component.latency_ms;
  const uptime = component.uptime_30d;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-lg">{component.icon || <Wrench size={16} strokeWidth={1.75} />}</span>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{component.name}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{component.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Uptime % */}
          {uptime !== undefined && uptime !== null && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500 dark:text-slate-500">{t("uptime")}</div>
              <div className={`text-sm font-semibold ${uptime >= 99.5 ? 'text-emerald-600 dark:text-emerald-400' : uptime >= 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {uptime.toFixed(2)}%
              </div>
            </div>
          )}
          {/* Latency */}
          {currentLatency !== null && currentLatency > 0 && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500 dark:text-slate-500">{t("latency")}</div>
              <div className={`text-sm font-semibold ${latencyColor(currentLatency)}`}>
                {currentLatency}ms
              </div>
            </div>
          )}
          <StatusBadge status={component.status} />
        </div>
      </div>
      {/* Sparkline */}
      {responseTimes.length > 0 && (
        <div className="mt-2">
          <Sparkline data={responseTimes} />
        </div>
      )}
    </div>
  );
}
