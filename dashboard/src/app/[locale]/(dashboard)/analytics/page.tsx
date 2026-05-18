'use client';

import { useState } from 'react';
import { useDeliveryTrend, useSuccessRate, useLatencyTrend } from '@/hooks/useDashboardData';
import {
  LazyAreaChart as AreaChart,
  LazyPieChart as PieChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Pie,
  Cell,
} from '@/components/LazyCharts';
import { ChartCard, StatCard } from '@/components/tremor';
import { useTranslations } from 'next-intl';

type TimeRange = '24h' | '7d' | '30d' | '90d';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const t = useTranslations('analytics');
  const tc = useTranslations('common');

  const { data: trendData, isLoading: trendLoading } = useDeliveryTrend(timeRange);
  const { data: successRateData, isLoading: srLoading } = useSuccessRate(timeRange);
  const { data: latencyData, isLoading: latencyLoading } = useLatencyTrend(timeRange);

  const loading = trendLoading || srLoading || latencyLoading;

  const chartData = trendData?.buckets.map((b) => ({
    date: new Date(b.timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      ...(trendData.range === '24h' ? { hour: '2-digit', minute: '2-digit' } : {}),
    }),
    successful: b.successful,
    failed: b.failed,
  })) || [];

  const rate = successRateData?.success_rate ?? 0;
  const pieData = [
    { name: tc('success'), value: successRateData?.successful ?? 0 },
    { name: tc('failed'), value: successRateData?.failed ?? 0 },
    { name: tc('pending'), value: successRateData?.pending ?? 0 },
  ];
  const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitleDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t("analytics.successRate")} value={`${rate.toFixed(1)}%`} color="emerald" isPercent={false}
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" /></svg>} />
        <StatCard label={t("analytics.totalDelivered")} value={successRateData?.successful?.toLocaleString() ?? '0'} color="blue"
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="8,12 11,15 16,9" /></svg>} />
        <StatCard label={t("analytics.totalFailed")} value={successRateData?.failed?.toLocaleString() ?? '0'} color="red"
          icon={<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title={t('deliveryTrends')} subtitle={t('deliveryTrends')} showTimeRange timeRange={timeRange} onTimeRangeChange={setTimeRange}>
            <div className="h-80">
              {loading ? (
                <div className="h-full flex items-center justify-center"><div className="animate-pulse text-gray-500 dark:text-slate-500">{tc('loading')}</div></div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-500">{tc('noResults')}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsColorSuccess" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                      <linearGradient id="analyticsColorFailed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary, #fff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="successful" stroke="#10b981" fillOpacity={1} fill="url(#analyticsColorSuccess)" strokeWidth={2} name={t('successfulLabel')} />
                    <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={1} fill="url(#analyticsColorFailed)" strokeWidth={2} name={t('failedLabel')} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        <ChartCard title={t('successRateOverTime')} subtitle={t('successRateOverTime')}>
          <div className="h-80 flex items-center justify-center">
            {loading ? (
              <div className="animate-pulse text-gray-500 dark:text-slate-500">{tc('loading')}</div>
            ) : (
              <div className="relative">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{rate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{t('successLabel')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      <ChartCard title={t('latencyTrend')} subtitle={t('latencyTrendDesc')} showTimeRange timeRange={timeRange} onTimeRangeChange={setTimeRange}>
        <div className="h-80">
          {latencyLoading ? (
            <div className="h-full flex items-center justify-center"><div className="animate-pulse text-gray-500 dark:text-slate-500">{tc('loading')}</div></div>
          ) : !latencyData || latencyData.buckets.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-500">{tc('noResults')}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData.buckets.map((b) => ({
                date: new Date(b.ts).toLocaleString(undefined, { month: 'short', day: 'numeric' }),
                avg: b.avg_ms,
                p95: b.p95_ms,
              }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyColorAvg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="latencyColorP95" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} unit="ms" />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary, #fff)', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="avg" stroke="#8b5cf6" fillOpacity={1} fill="url(#latencyColorAvg)" strokeWidth={2} name="Avg (ms)" />
                <Area type="monotone" dataKey="p95" stroke="#f59e0b" fillOpacity={1} fill="url(#latencyColorP95)" strokeWidth={2} name="P95 (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
