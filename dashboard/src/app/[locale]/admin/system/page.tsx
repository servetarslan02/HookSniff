'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface SystemHealth {
  status?: string;
  database?: { status: string; latency_ms: number };
  redis?: { status: string; latency_ms: number };
  api?: { status: string; uptime_seconds: number };
  queue?: { pending: number; processing: number; failed: number };
  checks?: {
    database?: { status: string; latency_ms: number };
    queue?: { status: string; latency_ms: number; pending_count?: number };
    redis?: { status: string; latency_ms: number };
    last_delivery?: { status: string; last_delivered_at?: string };
    db_size?: { status: string; size?: string };
    recent_errors?: { status: string; errors?: Array<{ id: string; event?: string; error?: string; created_at: string }> };
    queue_detail?: { status: string; pending?: number; processing?: number; failed_last_hour?: number };
  };
}

// Item 94 — Fallback mock data when API is unreachable
const mockHealth: SystemHealth = {
  database: { status: 'unknown', latency_ms: 0 },
  redis: { status: 'unknown', latency_ms: 0 },
  api: { status: 'unknown', uptime_seconds: 0 },
  queue: { pending: 0, processing: 0, failed: 0 },
};

export default function AdminSystemPage() {
  const { token } = useAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null); // Item 100
  const [activeAlerts, setActiveAlerts] = useState<number>(0);
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

  // Test Webhook state
  const [testUrl, setTestUrl] = useState('');
  const [testEvent, setTestEvent] = useState('test.ping');
  const [testPayload, setTestPayload] = useState('{\n  "message": "Hello from HookSniff"\n}');
  const [testResult, setTestResult] = useState<{ status_code: number; response_body: string; duration_ms: number } | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      setErrorDetail(null);
      const [res, alertsData] = await Promise.all([
        fetch(`${API}/health`, { headers: { Authorization: `Bearer ${token}` } }),
        token ? adminApi.listAlerts(token).catch(() => []) : Promise.resolve([]),
      ]);
      if (res.ok) {
        setHealth(await res.json());
      } else {
        const errText = await res.text().catch(() => '');
        setError(t('systemHealthDesc'));
        setErrorDetail(errText || `HTTP ${res.status}`);
        setHealth(mockHealth);
      }
      setActiveAlerts(Array.isArray(alertsData) ? alertsData.filter((a) => a.is_active).length : 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(t('systemHealthDesc'));
      setErrorDetail(msg); // Item 100
      setHealth(mockHealth); // Item 94 — fallback
    } finally {
      setLoading(false);
    }
  }, [token, API, t]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Test Webhook handler
  const handleTestWebhook = async () => {
    if (!token || !testUrl) return;
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    try {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(testPayload);
      } catch {
        setTestError('Invalid JSON payload');
        setTestLoading(false);
        return;
      }
      const result = await adminApi.testWebhook(token, {
        endpoint_url: testUrl,
        event_type: testEvent,
        payload,
      });
      setTestResult(result);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTestLoading(false);
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
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Item 98 — Loading spinner
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('fetchingHealth')}</p>
        </div>
        {/* Item 98 — Loading spinner */}
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
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
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
      status: health?.api?.status || health?.status || 'unknown',
      detail: health?.api?.uptime_seconds ? `Uptime: ${formatUptime(health.api.uptime_seconds)}` : t('checking'),
      latency: null,
    },
    {
      name: t('database'),
      icon: '🐘',
      status: health?.checks?.database?.status || health?.database?.status || 'unknown',
      detail: (health?.checks?.database?.latency_ms || health?.database?.latency_ms) ? `Latency: ${health?.checks?.database?.latency_ms || health?.database?.latency_ms}ms` : t('checking'),
      latency: health?.checks?.database?.latency_ms || health?.database?.latency_ms,
    },
    {
      name: t('cache'),
      icon: '⚡',
      status: health?.checks?.redis?.status || health?.redis?.status || 'unknown',
      detail: (health?.checks?.redis?.latency_ms || health?.redis?.latency_ms) ? `Latency: ${health?.checks?.redis?.latency_ms || health?.redis?.latency_ms}ms` : t('checking'),
      latency: health?.checks?.redis?.latency_ms || health?.redis?.latency_ms,
    },
    {
      name: t('queue'),
      icon: '📬',
      status: health?.checks?.queue ? (health.checks.queue.pending_count ?? 0) > 100 ? 'degraded' : 'healthy' : health?.queue ? (health.queue.failed > 10 ? 'degraded' : 'healthy') : 'unknown',
      detail: health?.checks?.queue
        ? `${health.checks.queue.pending_count ?? 0} pending`
        : health?.queue
        ? `${health.queue.pending} pending · ${health.queue.processing} processing · ${health.queue.failed} failed`
        : t('checking'),
      latency: null,
    },
  ];

  const allOk = services.every(s => s.status === 'healthy' || s.status === 'connected' || s.status === 'ok');
  const someDegraded = services.some(s => s.status === 'degraded' || s.status === 'slow');

  const infrastructureItems = [
    { label: t('apiServer'), value: 'Oracle Cloud ARM', detail: '4 OCPU, 24 GB RAM' },
    { label: t('database'), value: 'Neon PostgreSQL', detail: 'Serverless, 0.5 GB' },
    { label: t('cache'), value: 'Upstash Redis', detail: 'Serverless, 256 MB' },
    { label: t('cdn'), value: 'Cloudflare', detail: 'DNS, SSL, DDoS' },
    { label: t('dashboard'), value: 'Vercel', detail: 'Next.js 15' },
    { label: t('monitoring'), value: 'Grafana Cloud', detail: 'OpenTelemetry' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('systemHealthDesc')}
        </p>
      </div>

      {/* Item 100 — Error detail banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400" aria-hidden="true">⚠️</span>
              <span className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchHealth}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            >
              {tc('retry')}
            </button>
          </div>
          {errorDetail && (
            <p className="mt-2 text-xs text-red-600/80 dark:text-red-400/70 font-mono bg-red-100/50 dark:bg-red-500/5 rounded-xl px-3 py-2">
              {t('errorDetails')}: {errorDetail}
            </p>
          )}
        </div>
      )}

      {/* Overall Status — Item 103: improved layout */}
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
            onClick={fetchHealth}
            className="self-start sm:self-auto sm:ml-auto text-xs px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {tc('refresh')}
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('lastChecked', { time: new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()) })} · {t('autoRefresh15s')}
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

      {/* Service Cards */}
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

      {/* DB Size + Queue Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DB Size */}
        {health?.checks?.db_size?.size && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🐘 {t('databaseSize') || 'Database Size'}</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{health.checks.db_size.size}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('currentDbUsage') || 'Current database usage'}</p>
          </div>
        )}
        {/* Queue Details */}
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

      {/* Recent Error Logs */}
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
                    {new Date(err.created_at).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item 102 — Infrastructure table with proper header */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('infrastructure')}</h2>
        </div>
        {/* Item 102 — Table header */}
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

      {/* Test Webhook Console */}
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
            disabled={testLoading || !testUrl}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {testLoading ? t('testSending') : `🚀 ${t('sendTest')}`}
          </button>

          {/* Test Error */}
          {testError && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
              <span className="text-red-700 dark:text-red-400 text-sm">{testError}</span>
            </div>
          )}

          {/* Test Result */}
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
    </div>
  );
}
