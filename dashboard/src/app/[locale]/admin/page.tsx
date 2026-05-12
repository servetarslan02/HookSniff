'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { adminApi, type AdminStatsResponse, type AuditLogEntry, type RevenueResponse, type FeatureFlag } from '@/lib/api';
import { StatCard } from '@/components/tremor/StatCard';
import { LazyPieChart as PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from '@/components/LazyCharts';
import { useTranslations } from 'next-intl';

const PLAN_COLORS: Record<string, string> = {
  developer: '#94a3b8',
  startup: '#10b981',
  pro: '#4c6ef5',
  enterprise: '#8b5cf6',
};

const SECURITY_ACTIONS = ['SSRF', 'SPOOFING', 'REPLAY', 'ENDPOINT_DISABLE', 'RATE_LIMIT_EXCEEDED', 'ABUSE_DETECTED'];

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityLogs, setSecurityLogs] = useState<AuditLogEntry[]>([]);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [uptime24h, setUptime24h] = useState<number | null>(null);
  const [uptime7d, setUptime7d] = useState<number | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, auditData, revenueData, securityData] = await Promise.all([
        adminApi.getStats(token),
        adminApi.getAuditLogs(token, { limit: 5 }).catch(() => ({ entries: [], total: 0, limit: 5, offset: 0 })),
        adminApi.getRevenue(token).catch(() => null),
        adminApi.getAuditLogs(token, { limit: 50 }).catch(() => ({ entries: [], total: 0, limit: 50, offset: 0 })),
      ]);
      setStats(statsData);
      setAuditLogs(auditData.entries || []);
      setRevenue(revenueData);
      // Filter security-related logs
      const allLogs = securityData.entries || [];
      setSecurityLogs(allLogs.filter((log: AuditLogEntry) =>
        SECURITY_ACTIONS.some(sa => log.action.toUpperCase().includes(sa))
      ));

      // Fetch uptime from health endpoint
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
        const healthRes = await fetch(`${API}/health`, { headers: { Authorization: `Bearer ${token}` } });
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setUptime24h(healthData.uptime_24h ?? null);
          setUptime7d(healthData.uptime_7d ?? null);
        }
      } catch {
        // Uptime fetch failed, silently continue
      }

      // Fetch feature flags
      try {
        const flagsData = await adminApi.listFeatureFlags(token);
        setFeatureFlags(flagsData.flags || []);
      } catch {
        // Feature flags fetch failed, silently continue
      }
    } catch {
      setError(t("failedToLoadStats"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  const pieData = stats?.users_by_plan?.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.count,
  })) || [];

  // MRR/ARR calculation
  const mrr = revenue?.mrr || 0;
  const arr = mrr * 12;

  // Endpoint stats (from admin stats)
  const totalEndpoints = (stats as unknown as Record<string, unknown>)?.total_endpoints as number | undefined;
  const activeEndpoints = (stats as unknown as Record<string, unknown>)?.active_endpoints as number | undefined;
  const disabledEndpoints = totalEndpoints != null && activeEndpoints != null ? totalEndpoints - activeEndpoints : undefined;

  // Security warnings count
  const ssrfCount = securityLogs.filter(l => l.action.toUpperCase().includes('SSRF')).length;
  const spoofingCount = securityLogs.filter(l => l.action.toUpperCase().includes('SPOOF')).length;
  const replayCount = securityLogs.filter(l => l.action.toUpperCase().includes('REPLAY')).length;
  const totalSecurityWarnings = ssrfCount + spoofingCount + replayCount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("overviewTitle")}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('overviewDesc')}
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('totalUsers')}
          value={stats?.total_users?.toLocaleString() || '0'}
          icon={<span className="text-lg" aria-hidden="true">👥</span>}
          color="blue"
          trend={stats?.trends ? (() => {
            const diff = stats.total_users - stats.trends.total_users_yesterday;
            return diff !== 0 ? {
              value: Math.abs(diff),
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
            const diff = stats.total_deliveries - stats.trends.total_deliveries_yesterday;
            return diff !== 0 ? {
              value: Math.abs(diff),
              label: t('vsYesterday') || 'vs yesterday',
              direction: diff > 0 ? 'up' as const : 'down' as const,
            } : undefined;
          })() : undefined}
        />
        <StatCard
          label={t('totalRevenue')}
          value={`₺${(stats?.total_revenue || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">💰</span>}
          color="violet"
          trend={stats?.trends ? (() => {
            const diff = stats.total_revenue - stats.trends.revenue_yesterday;
            return diff !== 0 ? {
              value: Math.abs(Math.round(diff)),
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
            const diff = stats.active_users_today - stats.trends.active_users_yesterday;
            return diff !== 0 ? {
              value: Math.abs(diff),
              label: t('vsYesterday') || 'vs yesterday',
              direction: diff > 0 ? 'up' as const : 'down' as const,
            } : undefined;
          })() : undefined}
        />
      </div>

      {/* ── MRR / ARR Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-l-4 border-violet-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl" aria-hidden="true">💎</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('mrrCard')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ₺{mrr.toLocaleString()}
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
            ₺{arr.toLocaleString()}
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

      {/* ── Endpoint Status + Security Warnings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    %{((activeEndpoints / totalEndpoints) * 100).toFixed(1)} aktif
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
          {totalSecurityWarnings > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">🛡️</span>
                  <span className="text-sm text-gray-700 dark:text-slate-300">{t('ssrfAttempts')}</span>
                </div>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{ssrfCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">⚠️</span>
                  <span className="text-sm text-gray-700 dark:text-slate-300">{t('spoofingAttempts')}</span>
                </div>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{spoofingCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">🔄</span>
                  <span className="text-sm text-gray-700 dark:text-slate-300">{t('replayAttempts')}</span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{replayCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{t('noSecurityWarnings')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Charts + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        backgroundColor: 'rgb(15 23 42)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
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

        {/* Recent Activity (Audit Log) */}
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
                      {new Date(entry.created_at).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
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

      {/* ── Recent Signups + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <p className="text-xs text-gray-500 dark:text-slate-400">MRR: ₺{mrr.toLocaleString()}</p>
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

      {/* ── Uptime + Feature Flags + Last Deploy + Active Sessions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uptime 24h */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">🟢</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('uptime24h')}</h2>
          </div>
          {uptime24h != null ? (
            <>
              <p className={`text-3xl font-bold ${uptime24h >= 99.9 ? 'text-emerald-600 dark:text-emerald-400' : uptime24h >= 99 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                %{uptime24h.toFixed(2)}
              </p>
              <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${uptime24h >= 99.9 ? 'bg-emerald-500' : uptime24h >= 99 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(uptime24h, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-lg text-gray-400 dark:text-slate-500">{t('na')}</p>
          )}
        </div>

        {/* Uptime 7d */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">📅</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('uptime7d')}</h2>
          </div>
          {uptime7d != null ? (
            <>
              <p className={`text-3xl font-bold ${uptime7d >= 99.9 ? 'text-emerald-600 dark:text-emerald-400' : uptime7d >= 99 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                %{uptime7d.toFixed(2)}
              </p>
              <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${uptime7d >= 99.9 ? 'bg-emerald-500' : uptime7d >= 99 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(uptime7d, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-lg text-gray-400 dark:text-slate-500">{t('na')}</p>
          )}
        </div>

        {/* Feature Flags */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">🚩</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('featureFlagStatus')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {featureFlags.filter(f => f.is_enabled).length} / {featureFlags.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {t('activeFlagCount')}: {featureFlags.filter(f => f.is_enabled).length}
          </p>
          {featureFlags.length > 0 && (
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
          )}
        </div>

        {/* Active Sessions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">👤</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('activeSessionsNow')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.active_users_today?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('activeUsersToday')}</p>
        </div>
      </div>

      {/* ── Weekly Comparison ── */}
      {stats?.trends && (
        <div className="glass-card p-6">
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
                <span className="text-2xl font-bold text-gray-900 dark:text-white">₺{stats.total_revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('vsYesterday')}:</span>
                <span className={`text-xs font-medium ${stats.total_revenue >= stats.trends.revenue_yesterday ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.total_revenue >= stats.trends.revenue_yesterday ? '+' : ''}₺{(stats.total_revenue - stats.trends.revenue_yesterday).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Standard Webhooks + Deduplication ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standard Webhooks */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" aria-hidden="true">📐</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('standardWebhooks')}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('standardWebhooksDesc')}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('webhookPrefix')}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                webhook-
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('whsecSecret')}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                whsec_
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('complianceStatus')}</span>
              {(() => {
                const swFlag = featureFlags.find(f => f.name === 'standard_webhooks');
                return swFlag?.is_enabled ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    ✅ Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                    {t('notConfigured')}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Deduplication */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" aria-hidden="true">🔁</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('deduplication')}</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('deduplicationDesc')}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('filteredEvents')}</span>
              <span className="text-lg font-bold text-gray-400 dark:text-slate-500">{t('na')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('dedupWindow')}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                {t('notConfigured')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('complianceStatus')}</span>
              {(() => {
                const dedupFlag = featureFlags.find(f => f.name === 'deduplication');
                return dedupFlag?.is_enabled ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    ✅ Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                    {t('notConfigured')}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Last Deploy ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl" aria-hidden="true">🚀</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('lastDeploy')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">main</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {t('lastDeployDesc')}
          </span>
        </div>
      </div>
    </div>
  );
}
