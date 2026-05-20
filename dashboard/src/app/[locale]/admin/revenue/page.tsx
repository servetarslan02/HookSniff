'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAdminRevenue, useAdminRevenueMetrics, useAdminRevenueCohorts, useAdminRefunds, useAdminChurn, useAdminSettings, useUpdateSettings } from '@/hooks/useAdminData';
import { StatCard } from '@/components/tremor/StatCard';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { adminApi, API_BASE } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { DollarSign, Landmark, RefreshCw, Rocket, TrendingDown, TrendingUp, User, Users } from '@/components/icons';

type DateRange = '7d' | '30d' | '90d' | '12m' | 'all';

const DATE_RANGE_OPTIONS: { value: DateRange; labelKey: string }[] = [
  { value: '7d', labelKey: 'last7Days' },
  { value: '30d', labelKey: 'last30Days' },
  { value: '90d', labelKey: 'last90Days' },
  { value: '12m', labelKey: 'last12Months' },
  { value: 'all', labelKey: 'allTime' },
];

const contentSkeleton = (
  <div className="space-y-6 sm:space-y-8 animate-pulse">
    <div className="glass-card p-6"><div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6"><div className="h-80 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
      <div className="glass-card p-6"><div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
    </div>
    <div className="glass-card p-6"><div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
  </div>
);

const RevenueContent = dynamic(() => import('./components/RevenueContent'), { ssr: false, loading: () => contentSkeleton });

export default function AdminRevenuePage() {
  const { token } = useAuth();
  // Primary data — needed immediately
  const { data: revenue, isLoading, error, refetch } = useAdminRevenue();
  const { data: revenueMetrics } = useAdminRevenueMetrics();

  // Secondary data — deferred (don't block initial render)
  const [deferredReady, setDeferredReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDeferredReady(true), 300); return () => clearTimeout(t); }, []);

  const { data: cohortsData } = useAdminRevenueCohorts(deferredReady ? 12 : undefined);
  const { data: refundsData } = useAdminRefunds(deferredReady ? { per_page: 50 } : undefined);
  const { data: churnUsers = [] } = useAdminChurn(deferredReady);
  const { data: settings } = useAdminSettings();
  const updateSettingsMutation = useUpdateSettings();
  const queryClient = useQueryClient();

  const [dateRange, setDateRange] = useState<DateRange>('12m');
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const { toast } = useToast();

  const cohorts = cohortsData?.cohorts ?? [];
  const allRefunds = refundsData?.refunds ?? [];
  const refundsTotal = refundsData?.total ?? 0;

  // ── Plan Management State ──
  const [editingPlans, setEditingPlans] = useState(false);
  const [planForm, setPlanForm] = useState({
    plan_price_startup: settings?.plan_price_startup ?? 14,
    plan_price_pro: settings?.plan_price_pro ?? 29,
    plan_price_enterprise: settings?.plan_price_enterprise ?? 99,
    max_endpoints_free: settings?.max_endpoints_free ?? 5,
    max_endpoints_startup: settings?.max_endpoints_startup ?? 20,
    max_endpoints_pro: settings?.max_endpoints_pro ?? 50,
    max_endpoints_enterprise: settings?.max_endpoints_enterprise ?? 200,
    max_webhooks_free: settings?.max_webhooks_free ?? 1000,
    max_webhooks_startup: settings?.max_webhooks_startup ?? 10000,
    max_webhooks_pro: settings?.max_webhooks_pro ?? 50000,
    max_webhooks_enterprise: settings?.max_webhooks_enterprise ?? 500000,
    rate_limit_free: settings?.rate_limit_free ?? 100,
    rate_limit_startup: settings?.rate_limit_startup ?? 500,
    rate_limit_pro: settings?.rate_limit_pro ?? 1000,
    rate_limit_enterprise: settings?.rate_limit_enterprise ?? 5000,
    retention_days_free: settings?.retention_days_free ?? 7,
    retention_days_startup: settings?.retention_days_startup ?? 14,
    retention_days_pro: settings?.retention_days_pro ?? 180,
    retention_days_enterprise: settings?.retention_days_enterprise ?? 365,
  });
  const [savingPlans, setSavingPlans] = useState(false);

  // Sync form when settings load
  useEffect(() => {
    if (settings) {
      setPlanForm({
        plan_price_startup: settings.plan_price_startup ?? 14,
        plan_price_pro: settings.plan_price_pro ?? 29,
        plan_price_enterprise: settings.plan_price_enterprise ?? 99,
        max_endpoints_free: settings.max_endpoints_free ?? 5,
        max_endpoints_startup: settings.max_endpoints_startup ?? 20,
        max_endpoints_pro: settings.max_endpoints_pro ?? 50,
        max_endpoints_enterprise: settings.max_endpoints_enterprise ?? 200,
        max_webhooks_free: settings.max_webhooks_free ?? 1000,
        max_webhooks_startup: settings.max_webhooks_startup ?? 10000,
        max_webhooks_pro: settings.max_webhooks_pro ?? 50000,
        max_webhooks_enterprise: settings.max_webhooks_enterprise ?? 500000,
        rate_limit_free: settings.rate_limit_free ?? 100,
        rate_limit_startup: settings.rate_limit_startup ?? 500,
        rate_limit_pro: settings.rate_limit_pro ?? 1000,
        rate_limit_enterprise: settings.rate_limit_enterprise ?? 5000,
        retention_days_free: settings.retention_days_free ?? 7,
        retention_days_startup: settings.retention_days_startup ?? 14,
        retention_days_pro: settings.retention_days_pro ?? 180,
        retention_days_enterprise: settings.retention_days_enterprise ?? 365,
      });
    }
  }, [settings]);

  const handleSavePlans = async () => {
    if (!token || !settings) return;
    setSavingPlans(true);
    try {
      await updateSettingsMutation.mutateAsync({ ...settings, ...planForm });
      toast(t('settingsSaved') || 'Plan settings saved! Prices syncing to Polar...', 'success');
      setEditingPlans(false);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    } catch {
      toast(t('settingsSaveFailed') || 'Failed to save plan settings', 'error');
    } finally {
      setSavingPlans(false);
    }
  };

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
      if (m.month === currentMonth) return true;
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
          <button type="button" onClick={() => refetch()} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline">{tc('retry')}</button>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("revenueTitle")}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('revenueDesc')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="date-range" className="sr-only">{t('dateRange')}</label>
          <select id="date-range" value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)} aria-label={t('dateRange')}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm">
            {DATE_RANGE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>))}
          </select>
          <button type="button" onClick={() => refetch()} aria-label={t('refreshData')}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('refreshData')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label={t('mrr')} value={`$${(revenue?.mrr || 0).toLocaleString()}`} icon={<span className="text-lg" aria-hidden="true"><DollarSign size={18} strokeWidth={1.75} /></span>} color="violet"
          trend={revenue?.mrr_trend != null && revenue.mrr_trend !== 0 ? { value: Math.abs(revenue.mrr_trend), label: t('vsLastMonth') || 'vs last month', direction: revenue.mrr_trend > 0 ? 'up' : 'down' } : undefined} />
        <StatCard label={t('totalRevenueLabel')} value={`$${(revenue?.monthly_revenue?.reduce((sum, m) => sum + m.revenue, 0) || 0).toLocaleString()}`} icon={<span className="text-lg" aria-hidden="true"><TrendingUp size={18} strokeWidth={1.75} /></span>} color="emerald" />
        <StatCard label={t('collectedRevenue') || 'Collected Revenue'} value={`$${(revenue?.collected_revenue || 0).toLocaleString()}`} icon={<span className="text-lg" aria-hidden="true"><Landmark size={18} strokeWidth={1.75} /></span>} color="emerald" />
        <StatCard label={t('churnRate')} value={revenue?.churn_rate?.toFixed(1) || '0'} icon={<span className="text-lg" aria-hidden="true"><TrendingDown size={18} strokeWidth={1.75} /></span>} color="red" isPercent />
        <button type="button" onClick={handleExportCSV}
          className="glass-card p-4 sm:p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer border border-gray-200 dark:border-slate-700">
          <span className="text-2xl" aria-hidden="true">⬇</span>
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">{t('exportReport')}</span>
        </button>
      </div>

      {/* Advanced Metrics */}
      {revenueMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label={t('arpu') || 'ARPU'} value={`$${revenueMetrics.arpu.toFixed(2)}`} icon={<span className="text-lg" aria-hidden="true"><User size={18} strokeWidth={1.75} /></span>} color="blue" />
          <StatCard label={t('ltv') || 'LTV'} value={`$${revenueMetrics.ltv.toFixed(2)}`} icon={<TrendingUp size={18} strokeWidth={1.75} />} color="amber" />
          <StatCard label={t('nrr') || 'NRR'} value={`${revenueMetrics.nrr.toFixed(1)}%`} icon={<span className="text-lg" aria-hidden="true"><RefreshCw size={18} strokeWidth={1.75} /></span>} color={revenueMetrics.nrr >= 100 ? 'emerald' : 'red'} />
          <StatCard label={t('expansionRevenue') || 'Expansion'} value={`$${revenueMetrics.expansion_revenue.toFixed(2)}`} icon={<span className="text-lg" aria-hidden="true"><Rocket size={18} strokeWidth={1.75} /></span>} color="violet" />
        </div>
      )}

      {/* Customer Breakdown */}
      {revenueMetrics && (
        <div className="glass-card p-4 flex flex-wrap items-center gap-6 text-sm">
          <span className="text-gray-500 dark:text-slate-400 font-medium"><Users size={16} strokeWidth={1.75} className="inline mr-1" /> {t('customers') || 'Customers'}:</span>
          <span className="text-gray-900 dark:text-white"><strong>{revenueMetrics.total_customers}</strong> {t('total') || 'total'}</span>
          <span className="text-emerald-600 dark:text-emerald-400"><strong>{revenueMetrics.paying_customers}</strong> {t('paying') || 'paying'}</span>
          <span className="text-amber-600 dark:text-amber-400">{t('avgRetention') || 'Avg retention'}: <strong>{revenueMetrics.avg_months_retained.toFixed(1)}</strong> {t('months') || 'mo'}</span>
          <span className="text-red-600 dark:text-red-400">{t('churnRate') || 'Churn'}: <strong>{revenueMetrics.churn_rate.toFixed(1)}%</strong></span>
        </div>
      )}

      {/* Below-the-fold content — lazy loaded */}
      <RevenueContent
        monthlyData={monthlyData}
        planData={planData}
        hasRevenueData={hasRevenueData}
        cohorts={cohorts}
        allRefunds={allRefunds}
        refundsTotal={refundsTotal}
        churnUsers={churnUsers}
        editingPlans={editingPlans}
        setEditingPlans={setEditingPlans}
        planForm={planForm}
        setPlanForm={setPlanForm}
        handleSavePlans={handleSavePlans}
        savingPlans={savingPlans}
      />
    </div>
  );
}
