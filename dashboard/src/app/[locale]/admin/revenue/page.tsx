'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi, type RevenueResponse } from '@/lib/api';
import { StatCard } from '@/components/tremor/StatCard';
import { ChartCard } from '@/components/tremor/ChartCard';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell, Legend } from '@/components/LazyCharts';
import { useTranslations } from 'next-intl';
import EmptyState from '@/components/EmptyState';

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  pro: '#4c6ef5',
  business: '#8b5cf6',
};

export default function AdminRevenuePage() {
  const { token } = useAuth();
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('all');
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const fetchRevenue = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getRevenue(token);
      setRevenue(data);
    } catch (err) {
      setError(t("failedToLoadRevenue"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('revenue')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('revenue')}</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          <button
            onClick={fetchRevenue}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  const allMonthlyData = revenue?.monthly_revenue || [];
  const monthlyData = dateRange === 'all'
    ? allMonthlyData
    : allMonthlyData.slice(-parseInt(dateRange));
  const planData = revenue?.revenue_by_plan?.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.revenue,
    count: item.count,
  })) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("revenueTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('revenueDesc')}
          </p>
        </div>
        <button
          onClick={fetchRevenue}
          disabled={loading}
          className="self-start px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-2"
          aria-label={tc('refresh')}
        >
          <span className={loading ? 'animate-spin' : ''} aria-hidden="true">🔄</span>
          {tc('refresh')}
        </button>
      </div>

      {/* Date range filter — Item 90 */}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="date-range-select" className="text-sm text-gray-500 dark:text-slate-400">{t('dateRange')}:</label>
        <select
          id="date-range-select"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">{t('allTime')}</option>
          <option value="3">{t('lastMonths', { count: 3 })}</option>
          <option value="6">{t('lastMonths', { count: 6 })}</option>
          <option value="12">{t('lastMonths', { count: 12 })}</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label={t('mrr')}
          value={`₺${(revenue?.mrr || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">💰</span>}
          color="violet"
        />
        <StatCard
          label={t('totalRevenueLabel')}
          value={`₺${(revenue?.monthly_revenue?.reduce((sum, m) => sum + m.revenue, 0) || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">📈</span>}
          color="emerald"
        />
        <StatCard
          label={t('churnRate')}
          value={revenue?.churn_rate?.toFixed(1) || '0'}
          icon={<span className="text-lg" aria-hidden="true">📉</span>}
          color="red"
          isPercent
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartCard title={t('monthlyRevenue')} subtitle={t('revenueOverTime')}>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="text-gray-500 dark:text-slate-400"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-gray-500 dark:text-slate-400"
                    tickFormatter={(v) => `₺${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(15 23 42)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                    formatter={(value: number) => [`₺${value.toLocaleString()}`, t("revenue")]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Revenue by Plan */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('revenueByPlan')}</h2>
          {planData.length > 0 ? (
            <>
              <div className="h-40 sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(15 23 42)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                      }}
                      formatter={(value: number) => [`₺${value.toLocaleString()}`, t("revenue")]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => <span className="text-xs text-gray-600 dark:text-slate-400">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {planData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8' }}
                      />
                      <span className="text-sm text-gray-600 dark:text-slate-400">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₺{entry.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">
                        ({entry.count} {t('users')})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="💰" title={t('noRevenue')} description={t('noRevenueDesc')} />
          )}
        </div>
      </div>
    </div>
  );
}
