'use client';

import { useState, useCallback, type DragEvent } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardWidget, loadWidgetConfig, saveWidgetConfig, type WidgetConfig } from '@/components/DashboardWidget';
import { useDashboardStats, useDeliveryTrend, useWebhooks, useEndpoints } from '@/hooks/useDashboardData';
import {
  LazyAreaChart as AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from '@/components/LazyCharts';
import { StatCard } from '@/components/tremor/StatCard';
import { ChartCard } from '@/components/tremor/ChartCard';
import { Link } from '@/i18n/navigation';
import { Settings, Eye, EyeOff, Link2, Package, FlaskConical, TrendingUp, Inbox, RefreshCw } from '@/components/icons';

export function DashboardOverview() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadWidgetConfig);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  // React Query — replaces loadData + useState + useEffect
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: trendData } = useDeliveryTrend(timeRange);
  const { data: deliveriesData } = useWebhooks({ page: 1 });
  const { data: endpoints } = useEndpoints();

  const recentDeliveries = deliveriesData?.deliveries?.slice(0, 5) ?? [];
  const endpointCount = endpoints?.length ?? 0;
  const loading = statsLoading;

  // Widget management
  const handleDragStart = useCallback((id: string) => (e: DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragId && overId && dragId !== overId) {
      setWidgets((prev) => {
        const ids = prev.map((w) => w.id);
        const fromIdx = ids.indexOf(dragId);
        const toIdx = ids.indexOf(overId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        saveWidgetConfig(next);
        return next;
      });
    }
    setDragId(null);
    setOverId(null);
  }, [dragId, overId]);

  const handleDragOver = useCallback((id: string) => (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverId(id);
  }, []);

  const handleDrop = useCallback((_id: string) => (e: DragEvent) => {
    e.preventDefault();
    setOverId(null);
  }, []);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const next = prev.map((w) => w.id === id ? { ...w, visible: !w.visible } : w);
      saveWidgetConfig(next);
      return next;
    });
  }, []);

  const isWidgetVisible = useCallback((id: string) => {
    return widgets.find((w) => w.id === id)?.visible ?? true;
  }, [widgets]);

  const chartData = trendData?.buckets.map((b) => ({
    date: new Date(b.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    successful: b.successful,
    failed: b.failed,
  })) || [];

  const successRate = stats?.success_rate ?? 0;

  const statusColors: Record<string, string> = {
    delivered: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    pending: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-emerald-400',
    failed: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWidgetSettings(!showWidgetSettings)}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl border transition ${
              showWidgetSettings
                ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800'
                : 'text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
            title={t('customizeWidgets')}
          >
            <Settings size={16} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => refetchStats()}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw size={14} strokeWidth={1.75} className="inline mr-1" />
            {tc('refresh')}
          </button>
        </div>
      </div>

      {/* Widget Settings Panel */}
      {showWidgetSettings && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
            {t('widgetSettings')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-500 mb-3">
            {t('widgetSettingsDesc')}
          </p>
          <div className="flex flex-wrap gap-2">
            {widgets.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWidget(w.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                  w.visible
                    ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800'
                    : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                }`}
              >
                {w.visible ? <Eye size={14} strokeWidth={1.75} className="inline mr-1" /> : <EyeOff size={14} strokeWidth={1.75} className="inline mr-1" />} {w.id.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      {isWidgetVisible('stat-cards') && (
        <DashboardWidget
          id="stat-cards"
          title={t('statCards')}
          dragHandleProps={{
            onDragStart: handleDragStart('stat-cards'),
            onDragEnd: handleDragEnd,
            onDragOver: handleDragOver('stat-cards'),
            onDrop: handleDrop('stat-cards'),
            isDragging: dragId === 'stat-cards',
            isOver: overId === 'stat-cards',
          }}
        >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('totalDeliveries')}
          value={loading ? '—' : (stats?.total_deliveries?.toLocaleString() ?? '0')}
          color="blue"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label={t('successRate')}
          value={loading ? '—' : `${successRate.toFixed(1)}%`}
          color={successRate >= 95 ? 'emerald' : successRate >= 80 ? 'amber' : 'red'}
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label={t('activeEndpoints')}
          value={loading ? '—' : endpointCount.toString()}
          color="violet"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        />
        <StatCard
          label={t('failedDeliveries')}
          value={loading ? '—' : (stats?.failed?.toLocaleString() ?? '0')}
          color="red"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>
      </DashboardWidget>
      )}

      {/* Charts Row */}
      {isWidgetVisible('charts') && (
        <DashboardWidget
          id="charts"
          title={t('charts')}
          dragHandleProps={{
            onDragStart: handleDragStart('charts'),
            onDragEnd: handleDragEnd,
            onDragOver: handleDragOver('charts'),
            onDrop: handleDrop('charts'),
            isDragging: dragId === 'charts',
            isOver: overId === 'charts',
          }}
        >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title={t('deliveryTrends')}
            subtitle={t('deliveryTrendsDesc')}
            showTimeRange
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          >
            <div className="h-56">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse text-gray-500 dark:text-slate-500">{tc('loading')}</div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-500">
                  {tc('noResults')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashColorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="dashColorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary, #fff)',
                        border: '1px solid var(--border-color, #e5e7eb)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area type="monotone" dataKey="successful" stroke="#10b981" fillOpacity={1} fill="url(#dashColorSuccess)" strokeWidth={2} name="Successful" />
                    <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={1} fill="url(#dashColorFailed)" strokeWidth={2} name="Failed" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Quick Stats Summary */}
        <div className="glass-card p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            {t('quickStats')}
          </h3>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-slate-700 rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('delivered')}</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{stats?.delivered?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('pending')}</span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{stats?.pending?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('failedLabel')}</span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{stats?.failed?.toLocaleString() ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('endpoints')}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{endpointCount}</span>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
            <h4 className="text-[11px] font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-2">
              {t('quickActions')}
            </h4>
            <div className="space-y-2">
              <Link
                href="/applications"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <Link2 size={16} strokeWidth={1.75} className="text-gray-400" />
                {t('manageEndpoints')}
              </Link>
              <Link
                href="/deliveries"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <Package size={16} strokeWidth={1.75} className="text-gray-400" />
                {t('viewDeliveries')}
              </Link>
              <Link
                href="/devtools"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <FlaskConical size={16} strokeWidth={1.75} className="text-gray-400" />
                {t('openPlayground')}
              </Link>
              <Link
                href="/observability"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <TrendingUp size={16} strokeWidth={1.75} className="text-gray-400" />
                {t('viewAnalytics')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      </DashboardWidget>
      )}

      {/* Recent Deliveries */}
      {isWidgetVisible('recent-deliveries') && (
        <DashboardWidget
          id="recent-deliveries"
          title={t('recentDeliveries')}
          dragHandleProps={{
            onDragStart: handleDragStart('recent-deliveries'),
            onDragEnd: handleDragEnd,
            onDragOver: handleDragOver('recent-deliveries'),
            onDrop: handleDrop('recent-deliveries'),
            isDragging: dragId === 'recent-deliveries',
            isOver: overId === 'recent-deliveries',
          }}
        >
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('recentDeliveries')}
          </h3>
          <Link
            href="/deliveries"
            className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            {t('viewAll')}
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        ) : recentDeliveries.length === 0 ? (
          <div className="text-center py-8">
            <Inbox size={48} strokeWidth={1.75} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-500 text-sm">
              {t('noDeliveries')}
            </p>
            <Link
              href="/devtools"
              className="inline-block mt-3 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition"
            >
              {t('tryPlayground')}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('event')}</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('status')}</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden sm:table-cell">{t('attempts')}</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden md:table-cell">{t('time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {recentDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <Link href={`/deliveries/${d.id}`} className="font-mono text-xs text-brand-600 dark:text-brand-400 hover:underline">
                        {d.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-slate-300">{d.event || '—'}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[d.status] || ''}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hidden sm:table-cell">{d.attempt_count}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs text-gray-500 dark:text-slate-500 hidden md:table-cell">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </DashboardWidget>
      )}
    </div>
  );
}
