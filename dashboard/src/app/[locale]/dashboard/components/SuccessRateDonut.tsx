'use client';

import { useTranslations } from 'next-intl';
import {
  LazyPieChart as PieChart,
  ResponsiveContainer,
  Pie,
  Cell,
  Tooltip,
} from '@/components/LazyCharts';
import { ChartCard } from '@/components/tremor';
import type { SuccessRateData } from '@/lib/api';

export function SuccessRateDonut({
  data,
  loading,
}: {
  data: SuccessRateData | null;
  loading: boolean;
}) {
  const t = useTranslations('dashboard');
  const tc = useTranslations("common");
  const rate = data?.success_rate ?? 0;
  const chartData = [
    { name: tc('success'), value: data?.successful ?? 0 },
    { name: tc('failed'), value: data?.failed ?? 0 },
    { name: tc('pending'), value: data?.pending ?? 0 },
  ];
  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <ChartCard title={t('successRate')}>
      <div className="h-72 flex items-center justify-center">
        {loading ? (
          <div className="animate-pulse text-gray-500 dark:text-slate-400">{tc('loading')}</div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{rate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{t('success')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
