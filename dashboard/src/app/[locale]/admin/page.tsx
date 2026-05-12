'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { adminApi, type AdminStatsResponse, type AuditLogEntry } from '@/lib/api';
import { StatCard } from '@/components/tremor/StatCard';
import { LazyPieChart as PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from '@/components/LazyCharts';
import { useTranslations } from 'next-intl';

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  pro: '#4c6ef5',
  business: '#8b5cf6',
};

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tc = useTranslations('common');


  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, auditData] = await Promise.all([
        adminApi.getStats(token),
        adminApi.getAuditLogs(token, { limit: 5 }).catch(() => ({ entries: [], total: 0, limit: 5, offset: 0 })),
      ]);
      setStats(statsData);
      setAuditLogs(auditData.entries || []);
    } catch (err) {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("overviewTitle")}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('overviewDesc')}
        </p>
      </div>

      {/* Stats Cards */}
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
            /* Item 67 — CSS bar chart placeholder when no data */
            <div aria-label={t('chartPlaceholder')} role="img">
              <div className="flex items-end gap-3 h-32 mb-3">
                {[
                  { labelKey: 'freePlan', pct: 60, color: PLAN_COLORS.free },
                  { labelKey: 'proPlan', pct: 30, color: PLAN_COLORS.pro },
                  { labelKey: 'businessPlan', pct: 10, color: PLAN_COLORS.business },
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
                {t('noSignups')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
