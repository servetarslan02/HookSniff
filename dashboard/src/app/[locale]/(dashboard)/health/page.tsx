'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useEndpointHealth } from '@/hooks/useDashboardData';
import { Activity, AlertTriangle } from '@/components/icons';

type TimeRange = '24h' | '7d' | '30d' | '90d';

const STATUS_CONFIG: Record<string, { color: string; bg: string; labelKey: string }> = {
  healthy: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20', labelKey: 'healthy' },
  degraded: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/20', labelKey: 'degraded' },
  unhealthy: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', labelKey: 'unhealthy' },
};

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24s' },
  { value: '7d', label: '7g' },
  { value: '30d', label: '30g' },
  { value: '90d', label: '90g' },
];

export default function EndpointHealthPage() {
  const t = useTranslations('health');
  const tc = useTranslations('common');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const { data: endpoints = [], isLoading, error, refetch } = useEndpointHealth(timeRange);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  timeRange === opt.value
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
            ↻ {tc('refresh') || 'Refresh'}
          </button>
        </div>
      </div>


      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400 text-sm">{error instanceof Error ? error.message : t('failedToLoad')}</span>
          <button
            onClick={() => refetch()}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            {tc('retry') || 'Retry'}
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: t('healthy'),
            count: endpoints.filter((e) => e.health_status === 'healthy').length,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-500/10',
          },
          {
            label: t('degraded'),
            count: endpoints.filter((e) => e.health_status === 'degraded').length,
            color: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-500/10',
          },
          {
            label: t('unhealthy'),
            count: endpoints.filter((e) => e.health_status === 'unhealthy').length,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-500/10',
          },
        ].map((card) => (
          <div key={card.label} className={`glass-card p-5 ${card.bg}`}>
            <div className={`text-3xl font-bold ${card.color}`}>{card.count}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{card.label} {t('endpoints')}</div>
          </div>
        ))}
      </div>

      {/* Endpoint List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
          </div>
        ) : endpoints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4 text-green-500"><Activity size={48} strokeWidth={1.5} /></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noEndpoints')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('noEndpointsDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {endpoints.map((ep) => {
              const status = STATUS_CONFIG[ep.health_status] || STATUS_CONFIG.healthy;
              return (
                <div key={ep.id} className="px-6 py-5 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {t(status.labelKey)}
                        </span>
                        <code className="text-sm font-mono text-gray-700 dark:text-slate-300">
                          {ep.url}
                        </code>
                      </div>
                      {ep.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{ep.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {ep.success_rate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{t('successRate')}</div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-3">
                    {[
                      { label: t('total'), value: ep.total_deliveries.toLocaleString() },
                      { label: t('successful'), value: ep.successful.toLocaleString() },
                      { label: t('failed'), value: ep.failed.toLocaleString() },
                      { label: t('avgLatency'), value: ep.total_deliveries > 0 && ep.avg_response_ms > 0 ? `${ep.avg_response_ms}ms` : '—' },
                      { label: t('p95Latency') || 'P95', value: ep.total_deliveries > 0 && ep.p95_response_ms > 0 ? `${ep.p95_response_ms}ms` : '—' },
                      { label: t('p99Latency') || 'P99', value: ep.total_deliveries > 0 && (ep.p99_response_ms ?? ep.p95_response_ms) > 0 ? `${ep.p99_response_ms ?? ep.p95_response_ms}ms` : '—' },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ep.health_status === 'healthy' ? 'bg-green-500' :
                          ep.health_status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, ep.success_rate)}%` }}
                      />
                    </div>
                  </div>

                  {ep.consecutive_failures > 0 && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle size={16} strokeWidth={1.75} className="inline mr-1" /> {t('consecutiveFailures', { count: ep.consecutive_failures, plural: ep.consecutive_failures > 1 ? 's' : '' })}
                      {ep.last_failure_at && ` · ${t('lastFailure', { time: new Date(ep.last_failure_at).toLocaleString() })}`}
                    </div>
                  )}

                  {/* Uptime + Last Success */}
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-slate-400">
                    {ep.uptime_7d != null && (
                      <span>{t('uptime7d') || 'Uptime 7d'}: <strong className="text-gray-700 dark:text-slate-300">{ep.uptime_7d.toFixed(1)}%</strong></span>
                    )}
                    {ep.last_success_at && (
                      <span>{t('lastSuccess') || 'Son başarılı'}: <strong className="text-gray-700 dark:text-slate-300">{new Date(ep.last_success_at).toLocaleString()}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
