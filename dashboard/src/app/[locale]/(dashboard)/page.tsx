'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import {
  applicationsApi,
  analyticsApi,
  billingApiExtended,
  type Application,
  type DeliveryTrendResponse,
  type BillingUsage,
  type BillingSubscription,
} from '@/lib/api';
import {
  LazyBarChart as BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from '@/components/LazyCharts';
import { StatCard, ChartCard } from '@/components/tremor';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';

type TimeRange = '7d' | '30d' | '90d';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  // Data states
  const [apps, setApps] = useState<Application[]>([]);
  const [trendData, setTrendData] = useState<DeliveryTrendResponse | null>(null);
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appsData, trend, usageData, sub] = await Promise.all([
        applicationsApi.list(token).catch(() => []),
        analyticsApi.deliveryTrend(token, timeRange).catch(() => null),
        billingApiExtended.getUsage(token).catch(() => null),
        billingApiExtended.getSubscription(token).catch(() => null),
      ]);
      setApps(appsData);
      if (trend) setTrendData(trend);
      if (usageData) setUsage(usageData);
      if (sub) setSubscription(sub);
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [token, timeRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!token || !deleteId) return;
    setDeleting(true);
    try {
      await applicationsApi.delete(token, deleteId);
      setApps((prev) => prev.filter((a) => a.id !== deleteId));
      toast(t('appDeleted') || 'Application deleted', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('failedToDelete'), 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Compute chart data
  const chartData = trendData?.buckets.map((b) => ({
    date: new Date(b.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    total: b.total,
    successful: b.successful,
    failed: b.failed,
  })) || [];

  // Compute stats from trend data
  const totalEvents = trendData?.buckets.reduce((sum, b) => sum + b.total, 0) ?? 0;
  const totalDays = trendData?.buckets.length ?? 1;
  const avgPerDay = totalDays > 0 ? Math.round(totalEvents / totalDays) : 0;
  const peakDay = trendData?.buckets.reduce((max, b) => (b.total > max.total ? b : max), trendData.buckets[0])?.total ?? 0;

  // Usage percentages
  const endpointPercent = usage ? Math.min(100, Math.round((usage.endpoints_count / Math.max(usage.endpoints_limit, 1)) * 100)) : 0;
  const deliveryPercent = usage ? Math.min(100, Math.round((usage.deliveries_used / Math.max(usage.deliveries_limit, 1)) * 100)) : 0;

  const planName = subscription?.plan || user?.plan || 'developer';
  const planLabels: Record<string, string> = {
    developer: t('planDeveloper') || 'Developer',
    startup: t('planStartup') || 'Startup',
    pro: t('planPro') || 'Pro',
    enterprise: t('planEnterprise') || 'Enterprise',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        {/* Table skeleton */}
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Organization Header ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name || user?.email?.split('@')[0] || t('orgName')}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {t('memberCount', { count: 1 })}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                {t('applicationCount', { count: apps.length })}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                {t('eventsPerDay', { count: avgPerDay })}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            {planLabels[planName] || planName}
          </span>
        </div>
      </div>

      {/* ── Inbound Events Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label={t('stats.totalEvents')}
          value={totalEvents.toLocaleString()}
          color="blue"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-6" />
            </svg>
          }
        />
        <StatCard
          label={t('stats.avgPerDay')}
          value={avgPerDay.toLocaleString()}
          color="emerald"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8,12 11,15 16,9" />
            </svg>
          }
        />
        <StatCard
          label={t('stats.peakDay')}
          value={peakDay.toLocaleString()}
          color="violet"
          icon={
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* ── Inbound Events Chart ── */}
      <ChartCard
        title={t('inboundEvents')}
        subtitle={t('inboundEventsDesc')}
        showTimeRange
        timeRange={timeRange}
        onTimeRangeChange={(r) => setTimeRange(r as TimeRange)}
      >
        <div className="h-72">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-slate-500">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-sm">{t('noData')}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name={t('totalEvents')} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      {/* ── Applications Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('applications')}
          </h2>
          <Link
            href="/applications"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            {t('createApplication')}
          </Link>
        </div>

        {apps.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('noApplications')}
            </p>
            <Link
              href="/applications"
              className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              {t('createApplication')}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">{tc('name')}</th>
                  <th className="px-6 py-3">{tc('id')}</th>
                  <th className="px-6 py-3 text-right">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3">
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {app.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <code className="text-xs font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {app.id.slice(0, 8)}…
                      </code>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(app.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {tc('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Usage & Plan Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            {t('usage')}
          </h2>
          <div className="space-y-5">
            {/* Deliveries */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('deliveries')}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {usage ? `${usage.deliveries_used.toLocaleString()} / ${usage.deliveries_limit.toLocaleString()}` : '—'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${deliveryPercent}%`,
                    backgroundColor: deliveryPercent > 90 ? '#ef4444' : deliveryPercent > 70 ? '#f59e0b' : '#6366f1',
                  }}
                />
              </div>
            </div>

            {/* Endpoints */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('endpoints')}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {usage ? `${usage.endpoints_count} / ${usage.endpoints_limit}` : '—'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${endpointPercent}%`,
                    backgroundColor: endpointPercent > 90 ? '#ef4444' : endpointPercent > 70 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
            </div>

            {/* Retention */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('retention')}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {planName === 'enterprise' ? '365' : planName === 'pro' ? '30' : '7'} {t('days')}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-500"
                  style={{ width: planName === 'enterprise' ? '100%' : planName === 'pro' ? '60%' : '20%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            {t('planInfo')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('currentPlan')}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                {planLabels[planName] || planName}
              </span>
            </div>
            {subscription?.status && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">{t('status')}</span>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {subscription.status}
                </span>
              </div>
            )}
            {subscription?.current_period_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">{t('renewsOn')}</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(subscription.current_period_end).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {planName !== 'enterprise' && (
              <Link
                href="/billing"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition w-full justify-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {t('upgradePlan')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteAppTitle') || 'Delete application'}
        message={t('deleteAppConfirm') || 'Are you sure you want to delete this application? This action cannot be undone.'}
        confirmLabel={tc('delete')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
