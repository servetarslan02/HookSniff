'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';

interface SystemHealth {
  database: { status: string; latency_ms: number };
  redis: { status: string; latency_ms: number };
  api: { status: string; uptime_seconds: number };
  queue: { pending: number; processing: number; failed: number };
}

export default function AdminSystemPage() {
  const { token } = useAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API}/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHealth(await res.json());
      } else {
        setError(t('systemHealthDesc'));
      }
    } catch {
      setError(t('systemHealthDesc'));
    } finally {
      setLoading(false);
    }
  }, [token, API, t]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{tc('loading')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          <button
            type="button"
            onClick={fetchHealth}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  const services = [
    {
      name: t('apiServer'),
      icon: '🚀',
      status: health?.api?.status || 'unknown',
      detail: health?.api?.uptime_seconds ? `Uptime: ${formatUptime(health.api.uptime_seconds)}` : t('checking'),
      latency: null,
    },
    {
      name: t("database"),
      icon: '🐘',
      status: health?.database?.status || 'unknown',
      detail: health?.database?.latency_ms ? `Latency: ${health.database.latency_ms}ms` : t('checking'),
      latency: health?.database?.latency_ms,
    },
    {
      name: t("cache"),
      icon: '⚡',
      status: health?.redis?.status || 'unknown',
      detail: health?.redis?.latency_ms ? `Latency: ${health.redis.latency_ms}ms` : t('checking'),
      latency: health?.redis?.latency_ms,
    },
    {
      name: t("queue"),
      icon: '📬',
      status: health?.queue ? (health.queue.failed > 10 ? 'degraded' : 'healthy') : 'unknown',
      detail: health?.queue
        ? `${health.queue.pending} pending · ${health.queue.processing} processing · ${health.queue.failed} failed`
        : t('checking'),
      latency: null,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('systemHealthDesc')}
        </p>
      </div>

      {/* Overall Status */}
      <div className="glass-card p-6" aria-live="polite" aria-atomic="true">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            services.every(s => s.status === 'healthy' || s.status === 'connected' || s.status === 'ok')
              ? 'bg-green-500'
              : services.some(s => s.status === 'degraded' || s.status === 'slow')
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`} />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {services.every(s => s.status === 'healthy' || s.status === 'connected' || s.status === 'ok')
              ? t('allOperational')
              : services.some(s => s.status === 'degraded' || s.status === 'slow')
                ? t('partialDegradation')
                : t('systemIssues')}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('lastChecked', { time: new Intl.DateTimeFormat('tr-TR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date()) })} · {t('autoRefresh15s')}
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => {
          const colors = statusColor(service.status);
          return (
            <div key={service.name} className={`glass-card p-6 ${colors.bg}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
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
                    <span>{service.latency}ms</span>
                    <span>500ms</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Infrastructure Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('infrastructure')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: t('apiServer'), value: 'Oracle Cloud ARM', detail: '4 OCPU, 24 GB RAM' },
            { label: t("database"), value: "Neon PostgreSQL", detail: "Serverless, 0.5 GB" },
            { label: t("cache"), value: "Upstash Redis", detail: "Serverless, 256 MB" },
            { label: t("cdn"), value: "Cloudflare", detail: "DNS, SSL, DDoS" },
            { label: t("dashboard"), value: "Vercel", detail: "Next.js 15" },
            { label: t("monitoring"), value: "Grafana Cloud", detail: "OpenTelemetry" },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.detail}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
