'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useToast } from '@/components/Toast';
import {
  useSystemHealth,
  useAdminAlerts,
  useQueueStatus,
  useFailedDeliveries,
  useDeadLetters,
  useRateLimitViolations,
  useApiLatency,
  useTestWebhook,
  useBatchReplay,
} from '@/hooks/useAdminData';

const mockHealth = {
  status: 'unknown',
  database: { status: 'unknown', latency_ms: 0 },
  redis: { status: 'unknown', latency_ms: 0 },
  api: { status: 'unknown', uptime_seconds: 0 },
  queue: { pending: 0, processing: 0, failed: 0 },
  checks: {
    database: { status: 'unknown', latency_ms: 0 },
    redis: { status: 'unknown', latency_ms: 0 },
    queue: { status: 'unknown', latency_ms: 0, pending_count: 0 },
  },
} as const;

export default function AdminSystemPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const tc = useTranslations('common');
  const { toast } = useToast();

  // React Query hooks
  const { data: health, isLoading, error: healthError, refetch: refetchHealth } = useSystemHealth();
  const { data: alerts = [] } = useAdminAlerts();
  const { data: queueStatus } = useQueueStatus();
  const { data: failedData } = useFailedDeliveries({ limit: 20, since: '24h' });
  const { data: deadLettersData } = useDeadLetters({ limit: 20, since: '24h' });
  const { data: rlvData } = useRateLimitViolations({ limit: 20, since: '24h' });
  const { data: latencyData } = useApiLatency({ period: '24h' });
  const testWebhookMutation = useTestWebhook();
  const batchReplayMutation = useBatchReplay();

  const failedDeliveries = failedData?.deliveries ?? [];
  const deadLetters = deadLettersData?.dead_letters ?? [];
  const rateLimitViolations = rlvData?.violations ?? [];
  const apiLatency = latencyData?.endpoints ?? [];
  const activeAlerts = alerts.filter((a) => a.is_active).length;

  // Local UI state
  const [selectedFailed, setSelectedFailed] = useState<Set<string>>(new Set());
  const [testUrl, setTestUrl] = useState('');
  const [testEvent, setTestEvent] = useState('test.ping');
  const [testPayload, setTestPayload] = useState('{\n  "message": "Hello from HookSniff"\n}');
  const [testResult, setTestResult] = useState<{ status_code: number; response_body: string; duration_ms: number } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestWebhook = async () => {
    if (!testUrl) return;
    setTestError(null);
    setTestResult(null);
    try {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(testPayload);
      } catch {
        setTestError('Invalid JSON payload');
        return;
      }
      const result = await testWebhookMutation.mutateAsync({
        endpoint_url: testUrl,
        event_type: testEvent,
        payload,
      });
      setTestResult(result as { status_code: number; response_body: string; duration_ms: number });
    } catch (err) {
      setTestError(err instanceof Error ? err.message : t('testFailed'));
    }
  };

  const handleBatchReplay = async () => {
    if (selectedFailed.size === 0) return;
    try {
      await batchReplayMutation.mutateAsync(Array.from(selectedFailed));
      toast(t('batchReplaySuccess') || 'Replayed successfully', 'success');
      setSelectedFailed(new Set());
    } catch (err) {
      toast(err instanceof Error ? err.message : (t('batchReplayFailed') || 'Replay failed'), 'error');
    }
  };

  const toggleFailedSelect = (id: string) => {
    setSelectedFailed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFailed.size === failedDeliveries.length) {
      setSelectedFailed(new Set());
    } else {
      setSelectedFailed(new Set(failedDeliveries.map((d) => d.id)));
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'ok':
        return { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' };
      case 'degraded':
      case 'slow':
        return { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' };
      default:
        return { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' };
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const d = t('uptimeDays') || 'd';
    const h = t('uptimeHours') || 'h';
    const m = t('uptimeMinutes') || 'm';
    if (days > 0) return `${days}${d} ${hours}${h} ${mins}${m}`;
    if (hours > 0) return `${hours}${h} ${mins}${m}`;
    return `${mins}${m}`;
  };

  const displayHealth = health || mockHealth;
  const isHealthError = !!healthError;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('fetchingHealth')}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('fetchingHealth')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const services = [
    {
      name: t('apiServer'),
      icon: '🚀',
      status: displayHealth?.api?.status || displayHealth?.status || 'unknown',
      detail: displayHealth?.api?.uptime_seconds ? `${t('uptimeLabel') || 'Uptime'}: ${formatUptime(displayHealth.api.uptime_seconds)}` : t('checking'),
      latency: null,
    },
    {
      name: t('database'),
      icon: '🐘',
      status: displayHealth?.checks?.database?.status || displayHealth?.database?.status || 'unknown',
      detail: (displayHealth?.checks?.database?.latency_ms || displayHealth?.database?.latency_ms) ? `${t('latencyLabel') || 'Latency'}: ${displayHealth?.checks?.database?.latency_ms || displayHealth?.database?.latency_ms}ms` : t('checking'),
      latency: displayHealth?.checks?.database?.latency_ms || displayHealth?.database?.latency_ms,
    },
    {
      name: t('cache'),
      icon: '⚡',
      status: displayHealth?.checks?.redis?.status || displayHealth?.redis?.status || 'unknown',
      detail: (displayHealth?.checks?.redis?.latency_ms || displayHealth?.redis?.latency_ms) ? `${t('latencyLabel') || 'Latency'}: ${displayHealth?.checks?.redis?.latency_ms || displayHealth?.redis?.latency_ms}ms` : t('checking'),
      latency: displayHealth?.checks?.redis?.latency_ms || displayHealth?.redis?.latency_ms,
    },
    {
      name: t('queue'),
      icon: '📬',
      status: displayHealth?.checks?.queue ? (displayHealth.checks.queue.pending_count ?? 0) > 100 ? 'degraded' : 'healthy' : displayHealth?.queue ? (displayHealth.queue.failed > 10 ? 'degraded' : 'healthy') : 'unknown',
      detail: displayHealth?.checks?.queue
        ? `${displayHealth.checks.queue.pending_count ?? 0} pending`
        : displayHealth?.queue
        ? `${displayHealth.queue.pending} pending · ${displayHealth.queue.processing} processing · ${displayHealth.queue.failed} failed`
        : t('checking'),
      latency: displayHealth?.checks?.queue?.latency_ms ?? null,
    },
  ];

  const allOk = !isHealthError && services.every(s => s.status === 'healthy' || s.status === 'connected' || s.status === 'ok');
  const someDegraded = isHealthError || services.some(s => s.status === 'degraded' || s.status === 'slow');

  const infrastructureItems = [
    { label: t('apiServer'), value: 'Google Cloud Run', detail: 'Serverless, auto-scaling' },
    { label: t('database'), value: 'Neon PostgreSQL', detail: 'Serverless, Free tier' },
    { label: t('cache'), value: 'Upstash Redis', detail: 'Serverless, Free tier' },
    { label: t('cdn'), value: 'Cloudflare Workers', detail: 'Edge proxy, DNS, SSL' },
    { label: t('dashboard'), value: 'Vercel', detail: 'Next.js 15, Hobby plan' },
    { label: t('monitoring'), value: 'Grafana Cloud', detail: 'OpenTelemetry, Free tier' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('systemHealthDesc')}
        </p>
      </div>

      {/* Error banner */}
      {healthError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400" aria-hidden="true">⚠️</span>
              <span className="text-red-700 dark:text-red-400 text-sm font-medium">{t('healthCheckFailed') || 'Health check failed'}</span>
            </div>
            <button
              type="button"
              onClick={() => refetchHealth()}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            >
              {tc('retry')}
            </button>
          </div>
          <p className="mt-2 text-xs text-red-600/80 dark:text-red-400/70 font-mono bg-red-100/50 dark:bg-red-500/5 rounded-xl px-3 py-2">
            {t('errorDetails')}: {healthError.message || `HTTP error`}
          </p>
        </div>
      )}

      {/* Overall Status */}
      <div className="glass-card p-6" aria-live="polite" aria-atomic="true">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              allOk ? 'bg-green-500'
                : someDegraded ? 'bg-yellow-500'
                : 'bg-red-500'
            }`} />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {allOk ? t('allOperational')
                : someDegraded ? t('partialDegradation')
                : t('systemIssues')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetchHealth()}
            className="self-start sm:self-auto sm:ml-auto text-xs px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {tc('refresh')}
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('lastChecked', { time: new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()) })} · {t('autoRefresh30s')}
        </p>
      </div>

      {/* Active Alerts Summary */}
      <div className={`glass-card p-4 flex items-center gap-3 ${activeAlerts > 0 ? 'border-l-4 border-amber-500' : ''}`}>
        <span className="text-2xl" aria-hidden="true">{activeAlerts > 0 ? '🚨' : '✅'}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {activeAlerts > 0
              ? `${activeAlerts} ${t('activeAlertRules') || 'active alert rule(s)'}`
              : t('noActiveAlerts') || 'No active alerts'}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {t('alertThresholdsDesc') || 'Monitoring thresholds configured in Settings'}
          </p>
        </div>
      </div>

      {/* Service Cards — below the fold, lazy loaded */}
      <LazySection fallback={<Skeletons.statCards />} rootMargin={400}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => {
          const colors = statusColor(service.status);
          return (
            <div key={service.name} className={`glass-card p-6 ${colors.bg}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{service.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{service.detail}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {service.status}
                </span>
              </div>
              {service.latency !== null && service.latency !== undefined && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        service.latency < 50 ? 'bg-green-500' :
                        service.latency < 200 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((service.latency / 500) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
                    <span>0ms</span>
                    <span>{service.latency}ms ({service.latency < 50 ? t('fast') : service.latency < 200 ? t('moderate') : t('slow')})</span>
                    <span>500ms</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </LazySection>

      {/* DB Size + Queue Details — lazy loaded */}
      <LazySection fallback={Skeletons.card} rootMargin={300}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {health?.checks?.db_size?.size && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🐘 {t('databaseSize') || 'Database Size'}</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{health.checks.db_size.size}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('currentDbUsage') || 'Current database usage'}</p>
          </div>
        )}
        {health?.checks?.queue_detail && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📬 {t('queueDetails') || 'Queue Details'}</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t('pending') || 'Pending'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{health.checks.queue_detail.pending ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t('processing') || 'Processing'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{health.checks.queue_detail.processing ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t('failedLastHour') || 'Failed (1h)'}</span>
                <span className={`font-medium ${(health.checks.queue_detail.failed_last_hour ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {health.checks.queue_detail.failed_last_hour ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      </LazySection>

      {/* Recent Error Logs — lazy loaded */}
      <LazySection fallback={Skeletons.table()} rootMargin={300}>
      {health?.checks?.recent_errors?.errors && health.checks.recent_errors.errors.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🔴 {t('recentErrors') || 'Recent Errors'}</h2>
          </div>
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {health.checks.recent_errors.errors.map((err) => (
              <div key={err.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{err.event || '—'}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{err.error || 'Unknown error'}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(err.created_at).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </LazySection>

      {/* Infrastructure — lazy loaded */}
      <LazySection fallback={Skeletons.card} rootMargin={200}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('infrastructure')}</h2>
        </div>
        <div className="hidden md:grid md:grid-cols-3 gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-800/30 border-b border-gray-200/50 dark:border-slate-700/50 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          <div>{t('infrastructureHeader')}</div>
          <div>{t('providerLabel')}</div>
          <div>{t('details')}</div>
        </div>
        <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
          {infrastructureItems.map((item) => (
            <div key={item.label} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
              <div className="text-sm text-gray-600 dark:text-slate-300">{item.value}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
      </LazySection>

      {/* Queue Status — lazy loaded */}
      <LazySection fallback={Skeletons.card} rootMargin={200}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📬 {t('queueStatus') || 'Queue Status'}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('queueStatusDesc') || 'Webhook delivery queue depth'}</p>
          </div>
        </div>
        {queueStatus ? (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t('queuePending'), value: queueStatus.pending, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
                { label: t('queueProcessing'), value: queueStatus.processing, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: t('queueFailed'), value: queueStatus.failed, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
                { label: t('queueTotal'), value: queueStatus.total, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-50 dark:bg-slate-800' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-4 ${item.bg}`}>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{item.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
            {queueStatus.failed_last_hour > 0 && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">⚠️ {t('failedInLastHour', { count: queueStatus.failed_last_hour })}</p>
            )}
            {queueStatus.oldest_pending_at && (
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{t('oldestPending')}: {new Date(queueStatus.oldest_pending_at).toLocaleString()}</p>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">{t('noData') || 'No data'}</div>
        )}
      </div>
      </LazySection>

      {/* Failed Deliveries — lazy loaded */}
      <LazySection fallback={Skeletons.table()} rootMargin={200}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">❌ {t('failedDeliveries') || 'Failed Deliveries'} (24h)</h2>
          {failedDeliveries.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedFailed.size > 0 && (
                <button
                  onClick={handleBatchReplay}
                  disabled={batchReplayMutation.isPending}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {batchReplayMutation.isPending ? (t('replaying') || 'Replaying...') : `↩ ${t('replaySelected') || 'Replay Selected'} (${selectedFailed.size})`}
                </button>
              )}
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {selectedFailed.size === failedDeliveries.length ? (t('deselectAll') || 'Deselect All') : (t('selectAll') || 'Select All')}
              </button>
            </div>
          )}
        </div>
        {failedDeliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 py-3 text-left"><input type="checkbox" checked={selectedFailed.size === failedDeliveries.length && failedDeliveries.length > 0} onChange={toggleSelectAll} className="rounded-sm" /></th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('user') || 'User'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('endpoint') || 'Endpoint'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('event') || 'Event'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('attempts') || 'Attempts'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('error') || 'Error'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('time') || 'Time'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {failedDeliveries.map((d) => (
                  <tr key={d.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${selectedFailed.has(d.id) ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : ''}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedFailed.has(d.id)} onChange={() => toggleFailedSelect(d.id)} className="rounded-sm" /></td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{d.customer_email || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400 max-w-[200px] truncate">{d.endpoint_url || '—'}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">{d.event_type || '—'}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{d.attempt_count}</td>
                    <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400 max-w-[200px] truncate">{d.error_message || (d.response_status ? `HTTP ${d.response_status}` : '—')}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(d.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">✅ {t('noFailedDeliveries') || 'No failed deliveries in the last 24h'}</div>
        )}
      </div>
      </LazySection>

      {/* Dead Letters — lazy loaded */}
      <LazySection fallback={Skeletons.table()} rootMargin={200}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💀 {t('deadLetters') || 'Dead Letters'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('deadLettersDesc') || 'Permanently failed deliveries — no more retries'}</p>
        </div>
        {deadLetters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('user') || 'User'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('endpoint') || 'Endpoint'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('reason') || 'Reason'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('attempts') || 'Attempts'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('time') || 'Time'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {deadLetters.map((dl) => (
                  <tr key={dl.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400">{dl.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dl.customer_email || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400 max-w-[200px] truncate">{dl.endpoint_url || '—'}</td>
                    <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400 max-w-[250px] truncate">{dl.reason || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{dl.attempts}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(dl.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">✅ {t('noDeadLetters') || 'No dead letters'}</div>
        )}
      </div>
      </LazySection>

      {/* Rate Limit Violations — lazy loaded */}
      <LazySection fallback={Skeletons.table()} rootMargin={200}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🚦 {t('rateLimitViolations') || 'Rate Limit Violations'}</h2>
        </div>
        {rateLimitViolations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('user') || 'User'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">IP</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('requests') || 'Requests'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('limit') || 'Limit'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('window') || 'Window'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('time') || 'Time'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {rateLimitViolations.map((rv) => (
                  <tr key={rv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rv.customer_email || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400">{rv.ip || '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{rv.requests_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rv.limit_per_window}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{rv.window_seconds}s</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(rv.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">✅ {t('noViolations') || 'No rate limit violations'}</div>
        )}
      </div>
      </LazySection>

      {/* API Latency — lazy loaded */}
      <LazySection fallback={Skeletons.table()} rootMargin={200}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">⏱️ {t('apiLatency') || 'API Latency'} (24h)</h2>
        </div>
        {apiLatency.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('endpoint') || 'Endpoint'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('deliveries') || 'Deliveries'}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Avg</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">P95</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('errorRate') || 'Error Rate'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {apiLatency.map((ep) => (
                  <tr key={ep.endpoint_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-white max-w-[250px] truncate">{ep.url}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ep.total_deliveries.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ep.avg_latency_ms ? `${Math.round(ep.avg_latency_ms)}ms` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{ep.p95_latency_ms ? `${Math.round(ep.p95_latency_ms)}ms` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        ep.error_rate > 10 ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                        : ep.error_rate > 5 ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                        : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                      }`}>{ep.error_rate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">{t('noData') || 'No data'}</div>
        )}
      </div>
      </LazySection>

      {/* Test Webhook Console — lazy loaded */}
      <LazySection fallback={Skeletons.card} rootMargin={200}>
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('testWebhookTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('testWebhookDesc')}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="test-url" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {t('endpointUrl')}
              </label>
              <input
                id="test-url"
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label htmlFor="test-event" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                {t('eventType')}
              </label>
              <input
                id="test-event"
                type="text"
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value)}
                placeholder="test.ping"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="test-payload" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {t('payload')}
            </label>
            <textarea
              id="test-payload"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={4}
              spellCheck={false}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition resize-y"
            />
          </div>

          <button
            type="button"
            onClick={handleTestWebhook}
            disabled={testWebhookMutation.isPending || !testUrl}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {testWebhookMutation.isPending ? t('testSending') : `🚀 ${t('sendTest')}`}
          </button>

          {testError && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
              <span className="text-red-700 dark:text-red-400 text-sm">{testError}</span>
            </div>
          )}

          {testResult && (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">✅</span>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">{t('testSuccess')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{t('responseStatus')}</span>
                  <p className={`text-lg font-bold ${
                    testResult.status_code < 400 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {testResult.status_code}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{t('responseTime')}</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {testResult.duration_ms}ms
                  </p>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('responseBody')}</span>
                <pre className="mt-1 text-xs font-mono text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg p-3 overflow-x-auto max-h-40 border border-gray-200 dark:border-slate-700">
                  {testResult.response_body}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      </LazySection>
    </div>
  );
}
