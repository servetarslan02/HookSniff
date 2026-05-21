'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAdminStats, useAdminRevenue, useAdminAuditLogs, useAdminFeatureFlags, useAdminDeployInfo, useRateLimitViolations, useFailedDeliveries, useQueueStatus } from '@/hooks/useAdminData';
import { StatCard } from '@/components/tremor/StatCard';
import { useTranslations } from 'next-intl';
import { BarChart3, ClipboardList, Heart, Building2, RefreshCw, Download, Users, Package, DollarSign, Flame } from '@/components/icons';

const tabSkeleton = (
  <div className="space-y-6 animate-pulse">
    <div className="glass-card p-6"><div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6"><div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
      <div className="glass-card p-6"><div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
    </div>
  </div>
);

// Lazy-loaded tab components — only mount when the tab is first visited
const OverviewTab = dynamic(() => import('./components/OverviewTab'), { ssr: false, loading: () => tabSkeleton });
const ActivityTab = dynamic(() => import('./components/ActivityTab'), { ssr: false, loading: () => tabSkeleton });
const HealthTab = dynamic(() => import('./components/HealthTab'), { ssr: false, loading: () => tabSkeleton });
const InfraTab = dynamic(() => import('./components/InfraTab'), { ssr: false, loading: () => tabSkeleton });

export default function AdminOverviewPage() {
  // Primary data — needed for above-the-fold stats
  const { data: stats, refetch: refetchStats } = useAdminStats();
  const { data: revenue, refetch: refetchRevenue } = useAdminRevenue();

  // Secondary data — deferred 500ms (not needed for initial render)
  const [deferredReady, setDeferredReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDeferredReady(true), 500); return () => clearTimeout(t); }, []);

  const { data: auditLogsData, refetch: refetchAuditLogs } = useAdminAuditLogs(deferredReady ? { limit: 5 } : undefined);
  const { data: featureFlagsData, refetch: refetchFeatureFlags } = useAdminFeatureFlags(deferredReady);
  const { data: deployInfo, refetch: refetchDeployInfo } = useAdminDeployInfo(deferredReady);
  const { data: rateLimitData, refetch: refetchRateLimit } = useRateLimitViolations(deferredReady ? { limit: 1 } : undefined);
  const { data: failedDeliveriesData, refetch: refetchFailed } = useFailedDeliveries(deferredReady ? { limit: 1 } : undefined);
  const { data: queueStatus, refetch: refetchQueue } = useQueueStatus(deferredReady);

  const auditLogs = auditLogsData?.entries ?? [];
  const featureFlags = featureFlagsData?.flags ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchRevenue(), refetchAuditLogs(), refetchFeatureFlags(), refetchDeployInfo(), refetchRateLimit(), refetchFailed(), refetchQueue()]);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const [exporting, setExporting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const overviewTab = (searchParams.get('tab') || 'overview') as 'overview' | 'activity' | 'health' | 'infra';
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['overview']));

  const setOverviewTab = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'overview') params.delete('tab');
    else params.set('tab', tab);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    setVisitedTabs(prev => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, [searchParams, router, pathname]);

  // Prefetch tab on hover
  const handleTabHover = useCallback((tab: string) => {
    setVisitedTabs(prev => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, []);

  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const mrr = revenue?.mrr || 0;
  const arr = mrr * 12;

  const totalEndpoints = stats?.total_endpoints;
  const activeEndpoints = stats?.active_endpoints;
  const disabledEndpoints = totalEndpoints != null && activeEndpoints != null ? totalEndpoints - activeEndpoints : undefined;

  // Export CSV
  const exportDashboard = useCallback(async () => {
    if (!stats) return;
    setExporting(true);
    try {
      const rows = [
        [t('csvMetric'), t('csvValue')],
        [t('csvTotalUsers'), stats.total_users.toString()],
        [t('csvTotalDeliveries'), stats.total_deliveries.toString()],
        [t('csvTotalRevenue'), stats.total_revenue.toFixed(2)],
        [t('csvActiveUsersToday'), stats.active_users_today.toString()],
        [t('csvTotalEndpoints'), (stats.total_endpoints ?? 0).toString()],
        [t('csvActiveEndpoints'), (stats.active_endpoints ?? 0).toString()],
        [t('csvMrr'), mrr.toFixed(2)],
        [t('csvArr'), arr.toFixed(2)],
      ];
      const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hooksniff-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [stats, mrr, arr, t]);

  const tabs = [
    { key: 'overview', icon: <BarChart3 size={14} strokeWidth={1.75} />, label: t('overview') || 'Overview' },
    { key: 'activity', icon: <ClipboardList size={14} strokeWidth={1.75} />, label: t('activity') || 'Activity' },
    { key: 'health', icon: <Heart size={14} strokeWidth={1.75} />, label: t('health') || 'Health' },
    { key: 'infra', icon: <Building2 size={14} strokeWidth={1.75} />, label: t('infrastructure') || 'Infrastructure' },
  ] as const;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header — always visible */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t("overviewTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('overviewDesc')}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button type="button" onClick={handleRefreshAll} disabled={refreshing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${refreshing ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
            <RefreshCw size={14} strokeWidth={1.75} className={`transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? (t('refreshing') || 'Refreshing...') : (tc('refresh') || 'Refresh')}
          </button>
          <button type="button" onClick={exportDashboard} disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition disabled:opacity-50">
            <Download size={14} strokeWidth={1.75} className="inline mr-1" />
            {exporting ? t('exporting') : t('exportDashboard')}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit max-w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setOverviewTab(tab.key)} onMouseEnter={() => handleTabHover(tab.key)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${overviewTab === tab.key ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}>
            <span className="text-xs">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Stats Cards — always visible, above the fold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('totalUsers')} value={stats?.total_users?.toLocaleString() || '0'} icon={<Users size={18} strokeWidth={1.75} />} color="blue"
          trend={stats?.trends ? (() => { const prev = stats.trends.total_users_yesterday; const diff = stats.total_users - prev; if (diff === 0 || prev === 0) return undefined; const pct = Math.round(Math.abs(diff / prev) * 100); return pct > 0 ? { value: pct, label: t('vsYesterday') || 'vs yesterday', direction: diff > 0 ? 'up' as const : 'down' as const } : undefined; })() : undefined} />
        <StatCard label={t('totalDeliveries')} value={stats?.total_deliveries?.toLocaleString() || '0'} icon={<Package size={18} strokeWidth={1.75} />} color="emerald"
          trend={stats?.trends ? (() => { const prev = stats.trends.total_deliveries_yesterday; const diff = stats.total_deliveries - prev; if (diff === 0 || prev === 0) return undefined; const pct = Math.round(Math.abs(diff / prev) * 100); return pct > 0 ? { value: pct, label: t('vsYesterday') || 'vs yesterday', direction: diff > 0 ? 'up' as const : 'down' as const } : undefined; })() : undefined} />
        <StatCard label={t('totalRevenue')} value={`$${(stats?.total_revenue || 0).toLocaleString()}`} icon={<DollarSign size={18} strokeWidth={1.75} />} color="violet"
          trend={stats?.trends ? (() => { const prev = stats.trends.revenue_yesterday; const diff = stats.total_revenue - prev; if (diff === 0 || prev === 0) return undefined; const pct = Math.round(Math.abs(diff / prev) * 100); return pct > 0 ? { value: pct, label: t('vsYesterday') || 'vs yesterday', direction: diff > 0 ? 'up' as const : 'down' as const } : undefined; })() : undefined} />
        <StatCard label={t('activeUsersToday')} value={stats?.active_users_today?.toLocaleString() || '0'} icon={<Flame size={18} strokeWidth={1.75} />} color="amber"
          trend={stats?.trends ? (() => { const prev = stats.trends.active_users_yesterday; const diff = stats.active_users_today - prev; if (diff === 0 || prev === 0) return undefined; const pct = Math.round(Math.abs(diff / prev) * 100); return pct > 0 ? { value: pct, label: t('vsYesterday') || 'vs yesterday', direction: diff > 0 ? 'up' as const : 'down' as const } : undefined; })() : undefined} />
      </div>

      {/* Live Webhooks Indicator */}
      {stats?.trends?.active_webhooks != null && stats.trends.active_webhooks > 0 && (
        <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-emerald-500">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{t('activeWebhooks') || 'Active webhooks'}: <strong>{stats.trends.active_webhooks}</strong></span>
          <span className="text-xs text-gray-500 dark:text-slate-400">{t('currentlyProcessing') || 'currently processing'}</span>
        </div>
      )}

      {/* Tab Content — lazy loaded, only visited tabs render */}
      {visitedTabs.has('overview') && (
        <div style={{ display: overviewTab === 'overview' ? 'block' : 'none' }}>
          <OverviewTab stats={stats} revenue={revenue} mrr={mrr} arr={arr} />
        </div>
      )}
      {visitedTabs.has('activity') && (
        <div style={{ display: overviewTab === 'activity' ? 'block' : 'none' }}>
          <ActivityTab auditLogs={auditLogs} stats={stats} mrr={mrr} />
        </div>
      )}
      {visitedTabs.has('health') && (
        <div style={{ display: overviewTab === 'health' ? 'block' : 'none' }}>
          <HealthTab stats={stats} rateLimitData={rateLimitData} failedDeliveriesData={failedDeliveriesData} queueStatus={queueStatus} totalEndpoints={totalEndpoints} activeEndpoints={activeEndpoints} disabledEndpoints={disabledEndpoints} />
        </div>
      )}
      {visitedTabs.has('infra') && (
        <div style={{ display: overviewTab === 'infra' ? 'block' : 'none' }}>
          <InfraTab featureFlags={featureFlags} deployInfo={deployInfo} />
        </div>
      )}
    </div>
  );
}
