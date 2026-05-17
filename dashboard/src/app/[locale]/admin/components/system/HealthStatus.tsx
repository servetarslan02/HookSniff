'use client';

import { useTranslations, useLocale } from 'next-intl';

interface HealthCheck {
  status: string;
  latency_ms?: number;
}

interface HealthData {
  status: string;
  database?: HealthCheck;
  redis?: HealthCheck;
  api?: { status: string; uptime_seconds?: number };
  queue?: { pending: number; processing: number; failed: number };
  checks?: {
    database?: HealthCheck;
    redis?: HealthCheck;
    queue?: { status: string; latency_ms?: number; pending_count?: number };
    db_size?: { size: string };
    recent_errors?: { errors: Array<{ id: string; event: string; error: string; created_at: string }> };
    queue_detail?: { pending: number; processing: number; failed_last_hour: number };
  };
}

interface HealthStatusProps {
  health: HealthData;
  isHealthError: boolean;
  alerts: Array<{ is_active: boolean }>;
  onRefresh: () => void;
}

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

const formatUptime = (seconds: number, t: (key: string) => string) => {
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

export default function HealthStatus({ health, isHealthError, alerts, onRefresh }: HealthStatusProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const activeAlerts = alerts.filter((a) => a.is_active).length;

  const services = [
    {
      name: t('database') || 'Database',
      icon: '🐘',
      status: health.checks?.database?.status || health.database?.status || 'unknown',
      latency: health.checks?.database?.latency_ms ?? health.database?.latency_ms ?? null,
      detail: (health.checks?.database?.latency_ms || health.database?.latency_ms)
        ? `${t('latencyLabel') || 'Latency'}: ${health.checks?.database?.latency_ms || health.database?.latency_ms}ms`
        : t('checking'),
    },
    {
      name: t('redis') || 'Redis',
      icon: '🔴',
      status: health.checks?.redis?.status || health.redis?.status || 'unknown',
      latency: health.checks?.redis?.latency_ms ?? health.redis?.latency_ms ?? null,
      detail: (health.checks?.redis?.latency_ms || health.redis?.latency_ms)
        ? `${t('latencyLabel') || 'Latency'}: ${health.checks?.redis?.latency_ms || health.redis?.latency_ms}ms`
        : t('checking'),
    },
    {
      name: t('apiStatus') || 'API',
      icon: '⚡',
      status: health.api?.status || 'unknown',
      latency: null,
      detail: health.api?.uptime_seconds
        ? `${t('uptime') || 'Uptime'}: ${formatUptime(health.api.uptime_seconds, t)}`
        : t('checking'),
    },
    {
      name: t('queue') || 'Queue',
      icon: '📬',
      status: health.checks?.queue?.status || health.queue?.pending !== undefined ? 'ok' : 'unknown',
      latency: health.checks?.queue?.latency_ms ?? null,
      detail: health.queue
        ? `${health.queue.pending} ${t('pending') || 'pending'} · ${health.queue.processing} ${t('processing') || 'processing'}`
        : t('checking'),
    },
  ];

  return (
    <>
      {/* Health Status Card */}
      <div className="glass-card p-6" aria-live="polite" aria-atomic="true">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              health.status === 'healthy' ? 'bg-green-500'
                : health.status === 'degraded' ? 'bg-yellow-500'
                : isHealthError ? 'bg-red-500'
                : 'bg-gray-400'
            }`} />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {health.status === 'healthy' ? (t('allSystemsOperational') || 'All Systems Operational')
                : health.status === 'degraded' ? (t('degradedPerformance') || 'Degraded Performance')
                : isHealthError ? (t('healthCheckFailed') || 'Health check failed')
                : (t('checking') || 'Checking...')}
            </span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="sm:ml-auto px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            🔄 {tc('refresh')}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {t('lastChecked', { time: new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()) })} · {t('autoRefresh30s')}
        </p>
      </div>

      {/* Active Alerts Banner */}
      <div className={`glass-card p-4 flex items-center gap-3 ${activeAlerts > 0 ? 'border-l-4 border-amber-500' : ''}`}>
        <span className="text-xl">🔔</span>
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {activeAlerts > 0
              ? `${activeAlerts} ${t('activeAlertRules') || 'active alert rule(s)'}`
              : (t('noActiveAlerts') || 'No active alerts')}
          </span>
          <p className="text-xs text-gray-500 dark:text-slate-400">{t('alertThresholdsDesc') || 'Monitoring thresholds configured in Settings'}</p>
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
    </>
  );
}
