'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi, type RevenueResponse, type ChurnUser } from '@/lib/api';
import { StatCard } from '@/components/tremor/StatCard';
import { ChartCard } from '@/components/tremor/ChartCard';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell } from '@/components/LazyCharts';
import { useTranslations } from 'next-intl';

const PLAN_COLORS: Record<string, string> = {
  developer: '#94a3b8',
  startup: '#10b981',
  pro: '#4c6ef5',
  enterprise: '#8b5cf6',
};

type DateRange = '7d' | '30d' | '90d' | '12m' | 'all';

export default function AdminRevenuePage() {
  const { token } = useAuth();
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [churnUsers, setChurnUsers] = useState<ChurnUser[]>([]);
  const [planPrices, setPlanPrices] = useState<{ pro: number; enterprise: number }>({ pro: 29, enterprise: 99 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('12m');
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const fetchRevenue = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [revenueData, churnData, settings] = await Promise.all([
        adminApi.getRevenue(token),
        adminApi.getChurn(token).catch(() => ({ users: [] })),
        adminApi.getSettings(token).catch(() => null),
      ]);
      setRevenue(revenueData);
      setChurnUsers(churnData.users || []);
      if (settings) {
        setPlanPrices({ pro: settings.plan_price_pro, enterprise: settings.plan_price_enterprise });
      }
    } catch {
      setError(t("failedToLoadRevenue"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, t]);

  const handleExportCSV = () => {
    if (!token) return;
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
    const url = adminApi.exportRevenue(token, 12);
    window.open(`${API}${url}&token=${token}`, '_blank');
  };

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  const DATE_RANGE_OPTIONS: { value: DateRange; labelKey: string }[] = [
    { value: '7d', labelKey: 'last7Days' },
    { value: '30d', labelKey: 'last30Days' },
    { value: '90d', labelKey: 'last90Days' },
    { value: '12m', labelKey: 'last12Months' },
    { value: 'all', labelKey: 'allTime' },
  ];

  // Filter monthly data based on date range
  const allMonthlyData = revenue?.monthly_revenue || [];
  const monthlyData = (() => {
    if (dateRange === 'all') return allMonthlyData;
    const now = new Date();
    let cutoff: Date;
    switch (dateRange) {
      case '7d': cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case '12m': cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1); break;
      default: return allMonthlyData;
    }
    return allMonthlyData.filter((m) => {
      const d = new Date(m.month);
      return d >= cutoff;
    });
  })();

  const planData = revenue?.revenue_by_plan?.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.revenue,
    count: item.count,
  })) || [];

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
          <button type="button"
            onClick={() => fetchRevenue()}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  const hasRevenueData = monthlyData.length > 0 || planData.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with date range + refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("revenueTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('revenueDesc')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="date-range" className="sr-only">{t('dateRange')}</label>
          <select
            id="date-range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            aria-label={t('dateRange')}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>
          <button type="button"
            onClick={() => fetchRevenue(true)}
            disabled={refreshing}
            aria-label={t('refreshData')}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? t('refreshing') : t('refreshData')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={t('mrr')}
          value={`₺${(revenue?.mrr || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">💰</span>}
          color="violet"
          trend={revenue?.mrr_trend != null && revenue.mrr_trend !== 0 ? {
            value: Math.abs(revenue.mrr_trend),
            label: t('vsLastMonth') || 'vs last month',
            direction: revenue.mrr_trend > 0 ? 'up' : 'down',
          } : undefined}
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
        <button type="button"
          onClick={handleExportCSV}
          className="glass-card p-4 sm:p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer border border-gray-200 dark:border-slate-700"
        >
          <span className="text-2xl" aria-hidden="true">⬇</span>
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">{t('exportReport')}</span>
        </button>
      </div>

      {/* Plan Prices Info */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-500 dark:text-slate-400 font-medium">💰 {t('planPrices') || 'Plan Prices'}:</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
          {t('proPlan') || 'Pro'}: ${planPrices.pro}/mo
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-medium">
          {t('enterprisePlan') || 'Enterprise'}: ${planPrices.enterprise}/mo
        </span>
        <span className="text-xs text-gray-400 dark:text-slate-500">{t('configurableFromSettings') || 'Configurable from Settings'}</span>
      </div>

      {hasRevenueData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-2">
            <ChartCard title={t('monthlyRevenue')} subtitle={t('revenueOverTime')}>
              <div className="h-64 sm:h-80" role="img" aria-label={t('revenueChartDesc')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <title>{t('revenueChartTitle')}</title>
                    <desc>{t('revenueChartDesc')}</desc>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      className="text-gray-500 dark:text-slate-400"
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-gray-500 dark:text-slate-400"
                      tickFormatter={(v) => `₺${v}`}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(15 23 42)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '12px',
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
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('revenueByPlan')}</h2>
            {planData.length > 0 ? (
              <>
                <div className="h-48" role="img" aria-label={t('planDistributionDesc')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <title>{t('planDistributionTitle')}</title>
                      <desc>{t('planDistributionDesc')}</desc>
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
                          fontSize: '12px',
                        }}
                        formatter={(value: number) => [`₺${value.toLocaleString()}`, t("revenue")]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="space-y-3 mt-4" role="list" aria-label={t('planDistributionTitle')}>
                  {planData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between" role="listitem">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8' }}
                          aria-hidden="true"
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
              <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noRevenue')}</p>
            )}
          </div>
        </div>
      ) : (
        /* Empty state placeholder */
        <div className="glass-card p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noRevenueData')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">
            {t('revenueDesc')}
          </p>
        </div>
      )}

      {/* Churn Analysis */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('churnAnalysis')}</h2>
        </div>
        {churnUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('email')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('name')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('plan')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('amount')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('churnDate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {churnUsers.map((u, index) => (
                  <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{u.name || '—'}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400">₺{u.amount.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(u.churn_date).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-3xl mb-2" aria-hidden="true">📉</div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noChurn')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
