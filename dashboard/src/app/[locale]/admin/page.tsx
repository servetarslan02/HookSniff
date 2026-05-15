'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { adminApi, type AdminStatsResponse, type AuditLogEntry, type RevenueResponse, type FeatureFlag, type DeployInfo } from '@/lib/api';
import { StatCard } from '@/components/tremor/StatCard';
import { LazyPieChart as PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from '@/components/LazyCharts';
import { useTranslations, useLocale } from 'next-intl';

const PLAN_COLORS: Record<string, string> = {
  developer: '#94a3b8',
  startup: '#10b981',
  pro: '#4c6ef5',
  enterprise: '#8b5cf6',
};

/** Format uptime seconds into human-readable duration (e.g. "2g 5sa", "3sa 12dk") */
function formatUptime(seconds: number): string {
  const s = Math.floor(seconds);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}g ${h}sa`;
  if (h > 0) return `${h}sa ${m}dk`;
  return `${m}dk`;
}

/** Format uptime for CSV export (English) */
function formatUptimeCSV(seconds: number): string {
  const s = Math.floor(seconds);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [uptime24h, setUptime24h] = useState<number | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [deployInfo, setDeployInfo] = useState<DeployInfo | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewTab, setOverviewTab] = useState<'overview' | 'activity' | 'health' | 'infra'>('overview');
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, allLogs, revenueData] = await Promise.all([
        adminApi.getStats(token),
        adminApi.getAuditLogs(token, { limit: 5 }).catch(() => ({ entries: [], total: 0, limit: 5, offset: 0 })),
        adminApi.getRevenue(token).catch(() => null),
      ]);
      setStats(statsData);
      setAuditLogs(allLogs.entries || []);
      setRevenue(revenueData);

      // Fetch uptime from health endpoint (at root, not under /v1)
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000');
        const healthUrl = `${API_BASE.replace(/\/v1\/?$/, '')}/health`;
        const healthRes = await fetch(healthUrl);
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          const uptimeSeconds = healthData.uptime_seconds ?? 0;
          setUptime24h(uptimeSeconds > 0 ? uptimeSeconds : null);
        }
      } catch {
        // Uptime fetch failed, silently continue
      }

      // Fetch feature flags
      try {
        const flagsData = await adminApi.listFeatureFlags(token);
        setFeatureFlags(flagsData.flags || []);
      } catch {
        // Feature flags table might not exist yet — silently continue
      }

      // Fetch deploy info
      try {
        const deploy = await adminApi.getDeployInfo(token);
        setDeployInfo(deploy);
      } catch {
        // Deploy info endpoint might not be available — silently continue
      }
    } catch {
      setError(t("failedToLoadStats"));
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [token, t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh polling (every 60 seconds)
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchStats();
      }, 60000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, fetchStats]);

  // MRR/ARR calculation (needed by exportDashboard callback)
  const mrr = revenue?.mrr || 0;
  const arr = mrr * 12;

  // Export dashboard data as CSV
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
        [t('csvUptime'), uptime24h != null ? formatUptimeCSV(uptime24h) : t('csvNa')],
        ['', ''],
        [t('csvUsersByPlan'), t('csvCount')],
        ...stats.users_by_plan.map(p => [p.plan, p.count.toString()]),
        ['', ''],
        [t('csvRecentSignups'), ''],
        ...stats.recent_signups.map(u => [u.email, u.plan]),
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
  }, [stats, mrr, arr, uptime24h]);

  // Memoized computations — her render'da yeniden hesaplama
  const pieData = useMemo(() =>
    stats?.users_by_plan?.map((item) => ({
      name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
      value: item.count,
    })) || [],
    [stats?.users_by_plan]
  );

  const totalEndpoints = stats?.total_endpoints;
  const activeEndpoints = stats?.active_endpoints;
  const disabledEndpoints = totalEndpoints != null && activeEndpoints != null ? totalEndpoints - activeEndpoints : undefined;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('overview')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('loadingDashboard')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('overview')}</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          <button type="button"
            onClick={fetchStats}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("overviewTitle")}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('overviewDesc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              autoRefresh
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700'
            }`}
            title={autoRefresh ? t('autoRefreshEnabled') : t('autoRefreshDisabled')}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            {t('autoRefresh')}
          </button>
          {/* Export button */}
          <button
            type="button"
            onClick={exportDashboard}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            📥 {exporting ? t('exporting') : t('exportDashboard')}
          </button>
          {/* Last refresh time */}
          {lastRefresh && (
            <span className="text-[11px] text-gray-400 dark:text-slate-500">
              {lastRefresh.toLocaleTimeString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
        {([
          { key: 'overview', icon: '📊', label: t('overview') || 'Overview' },
          { key: 'activity', icon: '📋', label: t('activity') || 'Activity' },
          { key: 'health', icon: '💚', label: t('health') || 'Health' },
          { key: 'infra', icon: '🏗️', label: t('infrastructure') || 'Infrastructure' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setOverviewTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              overviewTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('totalUsers')}
          value={stats?.total_users?.toLocaleString() || '0'}
          icon={<span className="text-lg" aria-hidden="true">👥</span>}
          color="blue"
          trend={stats?.trends ? (() => {
            const prev = stats.trends.total_users_yesterday;
            const diff = stats.total_users - prev;
            if (diff === 0 || prev === 0) return undefined;
            const pct = Math.round(Math.abs(diff / prev) * 100);
            return pct > 0 ? {
              value: pct,
              label: t('vsYesterday') || 'vs yesterday',
              direction: diff > 0 ? 'up' as const : 'down' as const,
            } : undefined;
          })() : undefined}
        />
        <StatCard
          label={t('totalDeliveries')}
          value={stats?.total_deliveries?.toLocaleString() || '0'}
          icon={<span className="text-lg" aria-hidden="true">📦</span>}
          color="emerald"
          trend={stats?.trends ? (() => {
            const prev = stats.trends.total_deliveries_yesterday;
            const diff = stats.total_deliveries - prev;
            if (diff === 0 || prev === 0) return undefined;
            const pct = Math.round(Math.abs(diff / prev) * 100);
            return pct > 0 ? {
              value: pct,
              label: t('vsYesterday') || 'vs yesterday',
              direction: diff > 0 ? 'up' as const : 'down' as const,
            } : undefined;
          })() : undefined}
        />
        <StatCard
          label={t('totalRevenue')}
          value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">💰</span>}
          color="violet"
          trend={stats?.trends ? (() => {
            const prev = stats.trends.revenue_yesterday;
            const diff = stats.total_revenue - prev;
            if (diff === 0 || prev === 0) return undefined;
            const pct = Math.round(Math.abs(diff / prev) * 100);
            return pct > 0 ? {
              value: pct,
              label: t('vsYesterday') || 'vs yesterday',
              direction: diff > 0 ? 'up' as const : 'down' as const,
            } : undefined;
          })() : undefined}
        />
        <StatCard
          label={t('activeUsersToday')}
          value={stats?.active_users_today?.toLocaleString() || '0'}
          icon={<span className="text-lg" aria-hidden="true">🔥</span>}
          color="amber"
          trend={stats?.trends ? (() => {
            const prev = stats.trends.active_users_yesterday;
            const diff = stats.active_users_today - prev;
            if (diff === 0 || prev === 0) return undefined;
            const pct = Math.round(Math.abs(diff / prev) * 100);
            return pct > 0 ? {
              value: pct,
              label: t('vsYesterday') || 'vs yesterday',
              direction: diff > 0 ? 'up' as const : 'down' as const,
            } : undefined;
          })() : undefined}
        />
      </div>

      {/* ── MRR / ARR Cards (Overview tab) ── */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${overviewTab !== 'overview' ? 'hidden' : ''}`}>
        <div className="glass-card p-6 border-l-4 border-violet-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl" aria-hidden="true">💎</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('mrrCard')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('currencySymbol')}{mrr.toLocaleString()}
          </p>
          {revenue?.mrr_trend != null && revenue.mrr_trend !== 0 && (
            <p className={`text-sm mt-1 ${revenue.mrr_trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {revenue.mrr_trend > 0 ? '↑' : '↓'} %{Math.abs(revenue.mrr_trend).toFixed(1)} {t('vsLastMonth') || 'vs last month'}
            </p>
          )}
        </div>
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl" aria-hidden="true">📊</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('arrCard')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('currencySymbol')}{arr.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            MRR × 12
          </p>
        </div>
      </div>

      {/* ── Live Webhooks Indicator ── */}
      {stats?.trends?.active_webhooks != null && stats.trends.active_webhooks > 0 && (
        <div className="glass-card p-4 flex items-center gap-3 border-l-4 border-emerald-500">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {t('activeWebhooks') || 'Active webhooks'}: <strong>{stats.trends.active_webhooks}</strong>
          </span>
          <span className="text-xs text-gray-500 dark:text-slate-400">{t('currentlyProcessing') || 'currently processing'}</span>
        </div>
      )}

      {/* ── Endpoint Status + Security Warnings (Health) ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${overviewTab !== 'health' ? 'hidden' : ''}`}>
        {/* Endpoint Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('endpointStatus')}</h2>
            <Link href="/admin/users" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">
              {t('viewAllEndpoints')} →
            </Link>
          </div>
          {totalEndpoints != null ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('totalEndpoints')}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{totalEndpoints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('activeEndpoints')}</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{activeEndpoints ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('disabledEndpoints')}</span>
                <span className={`text-lg font-bold ${(disabledEndpoints ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {disabledEndpoints ?? '—'}
                </span>
              </div>
              {activeEndpoints != null && totalEndpoints > 0 && (
                <div className="mt-2">
                  <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(activeEndpoints / totalEndpoints) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 text-right">
                    %{((activeEndpoints / totalEndpoints) * 100).toFixed(1)} {t('active') || 'active'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('noEndpoints')}</p>
          )}
        </div>

        {/* Security Warnings */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('securityWarnings')}</h2>
            <Link href="/admin/activity" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">
              {t('viewSecurityLogs')} →
            </Link>
          </div>
          <div className="space-y-3">
            {/* Rate limit violations */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('rateLimitViolations') || 'Rate Limit Violations'}</span>
              <span className={`text-sm font-medium ${(stats?.trends?.active_webhooks ?? 0) > 100 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {(stats?.trends?.active_webhooks ?? 0) > 100 ? `⚠️ ${(stats?.trends?.active_webhooks ?? 0)}` : '✅ 0'}
              </span>
            </div>
            {/* Failed deliveries indicator */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('failedDeliveries') || 'Failed Deliveries (24h)'}</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✅ {t('monitoringActive') || 'Monitoring active'}
              </span>
            </div>
            {/* Signup status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('signupStatus') || 'Signup Status'}</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✅ {t('open') || 'Open'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Users by Plan (Overview tab) ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${overviewTab !== 'overview' ? 'hidden' : ''}`}>
        {/* Users by Plan Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('usersByPlan')}</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, rgb(15 23 42))',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'var(--tooltip-color, white)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8' }}
                    />
                    <span className="text-sm text-gray-600 dark:text-slate-400">{entry.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div aria-label={t('chartPlaceholder')} role="img">
              <div className="flex items-end gap-3 h-32 mb-3">
                {[
                  { labelKey: 'developerPlan', pct: 50, color: PLAN_COLORS.developer },
                  { labelKey: 'startupPlan', pct: 25, color: PLAN_COLORS.startup },
                  { labelKey: 'proPlan', pct: 15, color: PLAN_COLORS.pro },
                  { labelKey: 'enterprisePlan', pct: 10, color: PLAN_COLORS.enterprise },
                ].map((bar) => (
                  <div key={bar.labelKey} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full rounded-t-lg bg-gray-100 dark:bg-slate-800 overflow-hidden" style={{ height: '100%' }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-700 opacity-30"
                        style={{ height: `${bar.pct}%`, backgroundColor: bar.color, marginTop: 'auto' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-slate-500">{t(bar.labelKey)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 text-center">{t('noChartData')}</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Recent Activity (Activity tab) ── */}
      <div className={`${overviewTab !== 'activity' ? 'hidden' : ''}`}>
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentActivity')}</h2>
            <Link href="/admin/activity" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">
              {t('viewAll')} →
            </Link>
          </div>
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {auditLogs.length > 0 ? (
              auditLogs.map((entry) => (
                <div key={entry.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.action.replace(/[._]/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {entry.resource_type}{entry.resource_id ? ` · ${entry.resource_id.slice(0, 8)}…` : ''}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">
                      {new Date(entry.created_at).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">
                {t('noActivity')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Signups + Quick Actions (Activity tab) ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${overviewTab !== 'activity' ? 'hidden' : ''}`}>
        {/* Recent Signups */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentSignups')}</h2>
          </div>
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {stats?.recent_signups?.length ? (
              stats.recent_signups.map((user) => (
                <div key={user.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        {user.plan}
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">
                {t('noRecentSignups')}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/admin/system"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl" aria-hidden="true">🖥️</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('viewSystemHealth')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('systemHealth')}</p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl" aria-hidden="true">👥</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('userManagement')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('totalUsers')}: {stats?.total_users || 0}</p>
              </div>
            </Link>
            <Link
              href="/admin/revenue"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl" aria-hidden="true">💰</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('revenue')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">MRR: {t('currencySymbol')}{mrr.toLocaleString()}</p>
              </div>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span className="text-2xl" aria-hidden="true">⚙️</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t('platformSettings')}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('settingsNav')}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Uptime + Service Status (Health tab) ── */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${overviewTab !== 'health' ? 'hidden' : ''}`}>
        {/* Uptime */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">🟢</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('uptime')}</h2>
          </div>
          {uptime24h != null ? (
            <>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatUptime(uptime24h)}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('serverUptime')}</p>
            </>
          ) : (
            <p className="text-lg text-gray-400 dark:text-slate-500">{t('na')}</p>
          )}
        </div>

        {/* Uptime Status */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">📅</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('serviceStatus')}</h2>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {t('allSystemsOperational')}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('basedOnHealthCheck')}</p>
        </div>
      </div>

      {/* ── Feature Flags (Infrastructure tab) ── */}
      <div className={`${overviewTab !== 'infra' ? 'hidden' : ''}`}>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">🚩</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('featureFlagStatus')}</h2>
          </div>
          {featureFlags.length > 0 ? (
            <>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {featureFlags.filter(f => f.is_enabled).length} / {featureFlags.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {t('activeFlagCount')}: {featureFlags.filter(f => f.is_enabled).length}
              </p>
              <div className="mt-3 space-y-1">
                {featureFlags.slice(0, 3).map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${f.is_enabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="text-gray-600 dark:text-slate-400 truncate">{f.name}</span>
                  </div>
                ))}
                {featureFlags.length > 3 && (
                  <p className="text-xs text-gray-400 dark:text-slate-500">+{featureFlags.length - 3} {t('more') || 'more'}</p>
                )}
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('noFeatureFlags') || 'No feature flags configured yet'}</p>
              <Link href="/admin/feature-flags" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium mt-1 inline-block">
                {t('createFlag') || 'Create flag'} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Weekly Comparison (Overview tab) ── */}
      {stats?.trends && (
        <div className={`glass-card p-6 ${overviewTab !== 'overview' ? 'hidden' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('weekComparison')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Users comparison */}
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{t('totalUsers')}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('vsYesterday')}:</span>
                <span className={`text-xs font-medium ${stats.total_users >= stats.trends.total_users_yesterday ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.total_users >= stats.trends.total_users_yesterday ? '+' : ''}{stats.total_users - stats.trends.total_users_yesterday}
                </span>
              </div>
            </div>
            {/* Deliveries comparison */}
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{t('totalDeliveries')}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_deliveries.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('vsYesterday')}:</span>
                <span className={`text-xs font-medium ${stats.total_deliveries >= stats.trends.total_deliveries_yesterday ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.total_deliveries >= stats.trends.total_deliveries_yesterday ? '+' : ''}{stats.total_deliveries - stats.trends.total_deliveries_yesterday}
                </span>
              </div>
            </div>
            {/* Revenue comparison */}
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{t('totalRevenue')}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{t('currencySymbol')}{stats.total_revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('vsYesterday')}:</span>
                <span className={`text-xs font-medium ${stats.total_revenue >= stats.trends.revenue_yesterday ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.total_revenue >= stats.trends.revenue_yesterday ? '+' : ''}{t('currencySymbol')}{(stats.total_revenue - stats.trends.revenue_yesterday).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Standard Webhooks + Deduplication (Infrastructure tab) ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${overviewTab !== 'infra' ? 'hidden' : ''}`}>
        {/* Standard Webhooks */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" aria-hidden="true">📐</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('standardWebhooks')}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('standardWebhooksDesc')}</p>
          {(() => {
            const swFlag = featureFlags.find(f => f.name === 'standard_webhooks');
            const isEnabled = swFlag?.is_enabled;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('webhookPrefix')}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    isEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                  }`}>
                    webhook-
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('whsecSecret')}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    isEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                  }`}>
                    whsec_
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('complianceStatus')}</span>
                  {isEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      ✅ {t('active') || 'Active'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                      {t('notConfigured')}
                    </span>
                  )}
                </div>
                {isEnabled && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{t('standardWebhooksActiveDesc') || 'Standard Webhooks spec is active. All new webhooks use the standard format.'}</p>
                )}
                {!isEnabled && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{t('standardWebhooksInactiveDesc') || 'Enable the feature flag to switch to Standard Webhooks format (webhook- prefix, whsec_ secrets).'}</p>
                )}
              </div>
            );
          })()}
        </div>

        {/* Deduplication */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" aria-hidden="true">🔁</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('deduplication')}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('deduplicationDesc')}</p>
          {(() => {
            const dedupFlag = featureFlags.find(f => f.name === 'deduplication');
            const isEnabled = dedupFlag?.is_enabled;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('filteredEvents')}</span>
                  <span className={`text-lg font-bold ${isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                    {isEnabled ? (dedupFlag?.description?.match(/\d+/)?.[0] || '0') : '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('dedupWindow')}</span>
                  <span className={`text-sm ${isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                    {isEnabled ? (t('dedupWindowDefault') || '60s') : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-slate-400">{t('complianceStatus')}</span>
                  {isEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      ✅ {t('active') || 'Active'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                      {t('notConfigured')}
                    </span>
                  )}
                </div>
                {!isEnabled && featureFlags.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{t('dedupNotAvailable') || 'Deduplication is not yet configured. Enable the feature flag to get started.'}</p>
                )}
                {isEnabled && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{t('dedupActiveDesc') || 'Duplicate events are being filtered automatically.'}</p>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Last Deploy (Infrastructure tab) ── */}
      <div className={`glass-card p-6 ${overviewTab !== 'infra' ? 'hidden' : ''}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl" aria-hidden="true">🚀</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('lastDeploy')}</h2>
        </div>
        {deployInfo ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                v{deployInfo.version}
              </span>
            </div>
            {deployInfo.git_commit ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-600 dark:text-slate-400">
                {deployInfo.git_commit.slice(0, 7)}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-500 dark:text-slate-500">
                {t('commitNotAvailable') || 'commit: N/A'}
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {deployInfo.environment}
            </span>
            {deployInfo.build_time ? (
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {new Date(deployInfo.build_time).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {t('buildTimeNotAvailable') || 'build time: N/A'}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">main</span>
            </div>
            <span className="text-sm text-amber-600 dark:text-amber-400">
              {t('deployInfoUnavailable') || 'Deploy info unavailable — showing last known branch'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
