'use client';

import { StatusBadge } from '@/components/StatusBadge';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell } from '@/components/LazyCharts';
import { LazySection, Skeletons } from '@/components/LazySection';
import type { OverviewTabProps } from './types';

const PLAN_OPTIONS = ['developer', 'startup', 'pro', 'enterprise'];

export function OverviewTab({
  detail,
  planHistory,
  analytics,
  t,
  tc,
  newPlan,
  setNewPlan,
  handleUpdatePlan,
  handleToggleStatus,
  handleViewDelivery,
  handleReplay,
}: OverviewTabProps) {
  return (<>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Info Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("userInfo")}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400">ID</label>
            <p className="text-sm font-mono text-gray-900 dark:text-white">{detail.user.id}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400">{t("email")}</label>
            <p className="text-sm text-gray-900 dark:text-white">{detail.user.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400">{t("name")}</label>
            <p className="text-sm text-gray-900 dark:text-white">{detail.user.name || '—'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400">{t("status")}</label>
            <div className="mt-1">
              <StatusBadge status={detail.user.status} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-slate-400">{t("created")}</label>
            <p className="text-sm text-gray-900 dark:text-white">
              {new Date(detail.user.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Plan & Status Management */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("management")}</h2>

        <div className="space-y-6">
          {/* Plan Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t("plan")}
            </label>
            <div className="flex gap-2">
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <button type="button"
                onClick={handleUpdatePlan}
                disabled={newPlan === detail.user.plan}
                className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-40"
              >
                {t("update")}
              </button>
            </div>
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t("accountStatus")}
            </label>
            <button type="button"
              onClick={handleToggleStatus}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                detail.user.status === 'active'
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20'
              }`}
            >
              {detail.user.status === 'active' ? t('banUser') : t('activateUser')}
            </button>
          </div>

          {/* Usage Stats */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              {t("usageStats")}
            </label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t("totalDeliveries")}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {detail.usage_stats?.total_deliveries?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t("successRate")}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {detail.usage_stats?.success_rate || 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t("endpoints")}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {detail.usage_stats?.endpoints_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("endpoints")}</h2>
        {detail.endpoints?.length ? (
          <div className="space-y-3">
            {detail.endpoints.map((ep: any) => (
              <div
                key={ep.id}
                className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              >
                <p className="text-sm font-mono text-gray-900 dark:text-white truncate">{ep.url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${ep.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {ep.is_active ? t('active') : t('inactive')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(ep.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-slate-400">{t("noEndpoints")}</p>
        )}
      </div>
    </div>

    {/* Plan History */}
    {planHistory.length > 0 && (
      <LazySection fallback={Skeletons.card} rootMargin={300}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📋 {t("planHistory") || "Plan History"}</h2>
        </div>
        <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
          {planHistory.map((entry: any, i: number) => (
            <div key={i} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {String(entry.details?.new_plan || '—')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t("changedBy") || "Changed by"}: {String(entry.details?.admin_email || 'system')}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </LazySection>
    )}

    {/* Recent Deliveries */}
    <LazySection fallback={Skeletons.table()} rootMargin={300}>
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("recentDeliveries")}</h2>
      </div>
      {detail.recent_deliveries?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("event")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("status")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("attempts")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("time")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {detail.recent_deliveries.map((d: any, index: number) => (
                <tr key={d.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer`} onClick={() => handleViewDelivery(d.id)}>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 10)}…</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">
                      {d.event || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{d.attempt_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button type="button"
                        onClick={() => handleViewDelivery(d.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                      >
                        🔍 {t("viewDetails") || "Details"}
                      </button>
                      <button type="button"
                        onClick={() => handleReplay(d.id)}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                      >
                        ↩ {t("replayDelivery")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">
          {t("noDeliveries")}
        </div>
      )}
    </div>
    </LazySection>

    {/* Customer Analytics Charts */}
    {analytics && (
      <LazySection fallback={Skeletons.chart} rootMargin={300}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Deliveries Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("dailyDeliveries")}</h2>
          <div className="h-48">
            {(analytics.daily_deliveries?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.daily_deliveries!.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white' }}
                  />
                  <Bar dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noData")}</p>
            )}
          </div>
        </div>

        {/* Event Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("eventDistribution")}</h2>
          <div className="h-48">
            {(analytics.top_events?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.top_events!}
                    dataKey="count"
                    nameKey="event"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={4}
                  >
                    {analytics.top_events!.map((_: any, i: number) => (
                      <Cell key={i} fill={['#4c6ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noData")}</p>
            )}
          </div>
        </div>

        {/* Endpoint Health */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("endpointHealth")}</h2>
          <div className="space-y-3">
            {(analytics.endpoint_health?.length ?? 0) > 0 ? (
              analytics.endpoint_health!.map((ep: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <p className="text-xs font-mono text-gray-900 dark:text-white truncate">{ep.url}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${ep.success_rate >= 99 ? 'bg-green-500' : ep.success_rate >= 95 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${ep.success_rate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-slate-400 w-12 text-right">{ep.success_rate}%</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">avg {ep.avg_latency_ms}ms</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noEndpoints")}</p>
            )}
          </div>
        </div>
      </div>
      </LazySection>
    )}
  </>);
}
