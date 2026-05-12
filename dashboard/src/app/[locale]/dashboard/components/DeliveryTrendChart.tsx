'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  LazyAreaChart as AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend,
} from '@/components/LazyCharts';
import { ChartCard } from '@/components/tremor';
import type { DeliveryTrendResponse } from '@/lib/api';

export function DeliveryTrendChart({
  data,
  loading,
}: {
  data: DeliveryTrendResponse | null;
  loading: boolean;
}) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const chartData = data?.buckets.map((b) => ({
    date: new Date(b.timestamp).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      ...(data.range === '24h' ? { hour: '2-digit', minute: '2-digit' } : {}),
    }),
    successful: b.successful,
    failed: b.failed,
  })) || [];

  return (
    <ChartCard title={t('deliveryTrend')}>
      <div className="h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-gray-500 dark:text-slate-400">{t('loadingChart')}</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
            {t('noData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary, #fff)',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="successful"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSuccess)"
                strokeWidth={2}
                name={t('successful')}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorFailed)"
                strokeWidth={2}
                name={t('failed')}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
