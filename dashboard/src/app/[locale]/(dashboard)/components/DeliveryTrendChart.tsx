'use client';

import { useTranslations } from 'next-intl';
import { type DeliveryTrendResponse } from '@/lib/api';

interface DeliveryTrendChartProps {
  data: DeliveryTrendResponse | null;
  loading?: boolean;
}

export function DeliveryTrendChart({ data, loading }: DeliveryTrendChartProps) {
  const t = useTranslations('dashboard');

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-400 dark:text-slate-500">{t('loadingShort')}</div>
      </div>
    );
  }

  if (!data?.buckets?.length) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('noDeliveryData')}</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.buckets.map(p => p.total), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 h-40">
        {data.buckets.map((point, i) => {
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5" title={`${point.timestamp}: ${point.total} deliveries`}>
              {point.failed > 0 && (
                <div
                  className="w-full bg-red-400 dark:bg-red-500/60 rounded-t-sm"
                  style={{ height: `${(point.failed / maxVal) * 100}%` }}
                />
              )}
              <div
                className="w-full bg-emerald-400 dark:bg-emerald-500/60 rounded-t-sm"
                style={{ height: `${(point.successful / maxVal) * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500">
        <span>{data.buckets[0]?.timestamp}</span>
        <span>{data.buckets[data.buckets.length - 1]?.timestamp}</span>
      </div>
    </div>
  );
}
