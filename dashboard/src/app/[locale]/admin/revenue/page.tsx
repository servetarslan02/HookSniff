'use client';

import { useState } from 'react';
import { useAdminRevenue, useAdminRevenueMetrics, useAdminRevenueCohorts, useAdminRefunds, useAdminChurn, useAdminSettings } from '@/hooks/useAdminData';
import { StatCard } from '@/components/tremor/StatCard';
import { ChartCard } from '@/components/tremor/ChartCard';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell } from '@/components/LazyCharts';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from '@/components/Toast';
import { adminApi, API_BASE } from '@/lib/api';
import { useAuth } from '@/lib/store';

const PLAN_COLORS: Record<string, string> = {
  developer: '#94a3b8',
  startup: '#10b981',
  pro: '#4c6ef5',
  enterprise: '#8b5cf6',
};

type DateRange = '7d' | '30d' | '90d' | '12m' | 'all';

const DATE_RANGE_OPTIONS: { value: DateRange; labelKey: string }[] = [
  { value: '7d', labelKey: 'last7Days' },
  { value: '30d', labelKey: 'last30Days' },
  { value: '90d', labelKey: 'last90Days' },
  { value: '12m', labelKey: 'last12Months' },
  { value: 'all', labelKey: 'allTime' },
];

export default function AdminRevenuePage() {
  const { token } = useAuth();
  const { data: revenue, isLoading, error, refetch } = useAdminRevenue();
  const { data: revenueMetrics } = useAdminRevenueMetrics();
  const { data: cohortsData } = useAdminRevenueCohorts(12);
  const { data: refundsData } = useAdminRefunds({ per_page: 50 });
  const { data: churnUsers = [] } = useAdminChurn();
  const { data: settings } = useAdminSettings();

  const [dateRange, setDateRange] = useState<DateRange>('12m');
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { toast } = useToast();

  const cohorts = cohortsData?.cohorts ?? [];
  const allRefunds = refundsData?.refunds ?? [];
  const refundsTotal = refundsData?.total ?? 0;
  const planPrices = { pro: settings?.plan_price_pro ?? 29, business: settings?.plan_price_business ?? 99 };

  const handleExportCSV = async () => {
    if (!token) return;
    try {
      const url = adminApi.exportRevenue(token, 12);
      const res = await fetch(`${API_BASE}${url}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(t('exportFailed'));
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `hooksniff-revenue-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast(tc('error'), 'error');
    }
  };

  // Filter monthly data based on date range
  const allMonthlyData = revenue?.monthly_revenue || [];
  const monthlyData = (() => {
    if (dateRange === 'all') return allMonthlyData;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let cutoff: Date;
    switch (dateRange) {
      case '7d': cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case '12m': cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1); break;
      default: return allMonthlyData;
    }
    return allMonthlyData.filter((m) => {
      // Always include current month (it has partial data)
      if (m.month === currentMonth) return true;
      // For other months, check if month end is after cutoff
      const d = new Date(m.month + '-01');
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return monthEnd >= cutoff;
    });
  })();

  const planData = revenue?.revenue_by_plan?.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.revenue,
    count: item.count,
  })) || [];

  if (isLoading) {
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
          <span className="text-red-700 dark:text-red-400 text-sm">{t("failedToLoadRevenue")}</span>
          <button type="button"
            onClick={() => refetch()}
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
        <div className="flex items-center gap-2 shrink-0">
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
            onClick={() => refetch()}
            aria-label={t('refreshData')}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('refreshData')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label={t('mrr')}
          value={`$${(revenue?.mrr || 0).toLocaleString()}`}
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
          value={`$${(revenue?.monthly_revenue?.reduce((sum, m) => sum + m.revenue, 0) || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">📈</span>}
          color="emerald"
        />
        <StatCard
          label={t('collectedRevenue') || 'Collected Revenue'}
          value={`$${(revenue?.collected_revenue || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">🏦</span>}
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

      {/* Advanced Metrics */}
      {revenueMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label={t('arpu') || 'ARPU'}
            value={`$${revenueMetrics.arpu.toFixed(2)}`}
            icon={<span className="text-lg" aria-hidden="true">👤</span>}
            color="blue"
          />
          <StatCard
            label={t('ltv') || 'LTV'}
            value={`$${revenueMetrics.ltv.toFixed(2)}`}
            icon={<span className="text-lg" aria-hidden="true">🏆</span>}
            color="amber"
          />
          <StatCard
            label={t('nrr') || 'NRR'}
            value={`${revenueMetrics.nrr.toFixed(1)}%`}
            icon={<span className="text-lg" aria-hidden="true">🔄</span>}
            color={revenueMetrics.nrr >= 100 ? 'emerald' : 'red'}
          />
          <StatCard
            label={t('expansionRevenue') || 'Expansion'}
            value={`$${revenueMetrics.expansion_revenue.toFixed(2)}`}
            icon={<span className="text-lg" aria-hidden="true">🚀</span>}
            color="violet"
          />
        </div>
      )}

      {/* Customer Breakdown */}
      {revenueMetrics && (
        <div className="glass-card p-4 flex flex-wrap items-center gap-6 text-sm">
          <span className="text-gray-500 dark:text-slate-400 font-medium">👥 {t('customers') || 'Customers'}:</span>
          <span className="text-gray-900 dark:text-white"><strong>{revenueMetrics.total_customers}</strong> {t('total') || 'total'}</span>
          <span className="text-emerald-600 dark:text-emerald-400"><strong>{revenueMetrics.paying_customers}</strong> {t('paying') || 'paying'}</span>
          <span className="text-amber-600 dark:text-amber-400">{t('avgRetention') || 'Avg retention'}: <strong>{revenueMetrics.avg_months_retained.toFixed(1)}</strong> {t('months') || 'mo'}</span>
          <span className="text-red-600 dark:text-red-400">{t('churnRate') || 'Churn'}: <strong>{revenueMetrics.churn_rate.toFixed(1)}%</strong></span>
        </div>
      )}

      {/* Plan Prices Info */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-500 dark:text-slate-400 font-medium">💰 {t('planPrices') || 'Plan Prices'}:</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
          {t('proPlan') || 'Pro'}: ${planPrices.pro}/mo
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-medium">
          {t('businessPlan') || 'Business'}: ${planPrices.business}/mo
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
                      tickFormatter={(v) => `$${v}`}
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
                      formatter={(value: number) => [`$${value.toLocaleString()}`, t("revenue")]}
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
                        formatter={(value: number) => [`$${value.toLocaleString()}`, t("revenue")]}
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
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8' }}
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${entry.value.toLocaleString()}
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

      {/* Cohort Analysis */}
      {cohorts.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📊 {t('cohortAnalysis') || 'Cohort Analysis'}</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('cohortDesc') || 'Monthly customer cohorts — signups, retention, and revenue'}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('cohort') || 'Cohort'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('signedUp') || 'Signed Up'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('active') || 'Active'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('retention') || 'Retention'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('revenue') || 'Revenue'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {cohorts.map((c) => (
                  <tr key={c.cohort_month} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{c.cohort_month}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-slate-400">{c.customers_signed_up}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-slate-400">{c.customers_active}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.retention_rate >= 70 ? 'bg-emerald-500' : c.retention_rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(c.retention_rate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-slate-400">{c.retention_rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-slate-400">${(c.total_revenue_cents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refund History */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('refundHistory') || 'Refund History'}</h2>
            {refundsTotal > 0 && (
              <span className="text-sm text-gray-500 dark:text-slate-400">{refundsTotal} {t('total') || 'total'}</span>
            )}
          </div>
        </div>
        {allRefunds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('email')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('amount')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('reason') || 'Reason'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('status')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {allRefunds.map((ref, index) => (
                  <tr key={ref.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">{ref.email || ref.customer_id.slice(0, 8) + '...'}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-red-600 dark:text-red-400">-{(ref.amount_cents / 100).toFixed(2)} {ref.currency.toUpperCase()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400 max-w-xs truncate">{ref.reason || '—'}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ref.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        ref.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>{ref.status}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(ref.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-3xl mb-2" aria-hidden="true">💸</div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noRefunds') || 'No refunds yet'}</p>
          </div>
        )}
      </div>

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
                {churnUsers.map((u: { id: string; email: string; name?: string; plan: string; amount: number; churn_date: string }, index: number) => (
                  <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{u.name || '—'}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400">${u.amount.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(u.churn_date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
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
