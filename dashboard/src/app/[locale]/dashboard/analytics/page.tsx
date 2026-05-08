'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import {
  analyticsApi,
  type DeliveryTrendResponse,
  type SuccessRateData,
} from '@/lib/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartCard, StatCard } from '@/components/tremor';
import { useTranslations } from 'next-intl';

type TimeRange = '24h' | '7d' | '30d';

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [trendData, setTrendData] = useState<DeliveryTrendResponse | null>(null);
  const [successRateData, setSuccessRateData] = useState<SuccessRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('analytics');
  const tc = useTranslations('common');

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [trend, sr] = await Promise.all([
        analyticsApi.deliveryTrend(token, timeRange).catch(() => null),
        analyticsApi.successRate(token, timeRange).catch(() => null),
      ]);
      if (trend) setTrendData(trend);
      if (sr) setSuccessRateData(sr);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    { name: 'Success', value: successRateData?.successful ?? 0 },
    { name: 'Failed', value: successRateData?.failed ?? 0 },
    { name: 'Pending', value: successRateData?.pending ?? 0 },
  ];
  const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Delivery trends, success rates, and performance metrics
          </p>
        </div>
      </div>

      {/* Summary StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Success Rate"
          value={`${rate.toFixed(1)}%`}
          color="emerald"
          isPercent={false}
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-6" />
            </svg>
          }
        />
        <StatCard
          label="Total Delivered"
          value={successRateData?.successful?.toLocaleString() ?? '0'}
          color="blue"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8,12 11,15 16,9" />
            </svg>
          }
        />
        <StatCard
          label="Total Failed"
          value={successRateData?.failed?.toLocaleString() ?? '0'}
          color="red"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title={t('deliveryTrends')}
            subtitle={t('deliveryTrends')}
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          >
            <div className="h-80">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-400 dark:text-slate-500">{tc('loading')}</div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                  {tc('noResults')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsColorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="analyticsColorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary, #fff)',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="successful" stroke="#10b981" fillOpacity={1} fill="url(#analyticsColorSuccess)" strokeWidth={2} name="Successful" />
                    <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={1} fill="url(#analyticsColorFailed)" strokeWidth={2} name="Failed" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        <ChartCard title={t('successRateOverTime')} subtitle={t('successRateOverTime')}>
          <div className="h-80 flex items-center justify-center">
            {loading ? (
              <div className="animate-pulse text-gray-400 dark:text-slate-500">{tc('loading')}</div>
            ) : (
              <div className="relative">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{rate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">success</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
