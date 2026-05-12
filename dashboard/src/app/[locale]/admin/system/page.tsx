'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';

/* ─── Hook0-style Admin System: Servis durumu tablosu ─── */

interface SystemHealth {
  database: { status: string; latency_ms: number };
  redis: { status: string; latency_ms: number };
  api: { status: string; uptime_seconds: number };
  queue: { pending: number; processing: number; failed: number };
}

const STATUS_BADGE: Record<string, string> = {
  healthy: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  degraded: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  unhealthy: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  unknown: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

export default function AdminSystemPage() {
  const { token } = useAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const fetchHealth = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
      const res = await fetch(`${API.replace(/\/v1\/?$/, '')}/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Health check failed');
      const data = await res.json();
      setHealth({
        database: data.database || { status: 'unknown', latency_ms: 0 },
        redis: data.redis || { status: 'unknown', latency_ms: 0 },
        api: data.api || { status: 'unknown', uptime_seconds: 0 },
        queue: data.queue || { pending: 0, processing: 0, failed: 0 },
      });
    } catch {
      setError(t('failedToLoadSystem') || 'Sistem bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}g ${h}s`;
    if (h > 0) return `${h}s ${m}dk`;
    return `${m}dk`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('system') || 'Sistem'}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('system') || 'Sistem'}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <button type="button" onClick={fetchHealth} className="text-sm text-red-600 dark:text-red-400 hover:underline">
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  const services = [
    { name: 'PostgreSQL', ...health?.database },
    { name: 'Redis', ...health?.redis },
    { name: 'API', ...health?.api },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('system') || 'Sistem'}</h2>
        <button
          type="button"
          onClick={fetchHealth}
          className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          {t('refresh') || 'Yenile'}
        </button>
      </div>

      {/* ── Servis Durumu Tablosu ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('serviceStatus') || 'Servis Durumu'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('service') || 'Servis'}</th>
                <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('status') || 'Durum'}</th>
                <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('latency') || 'Gecikme'}</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.name} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">{s.name}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[s.status || 'unknown'] || STATUS_BADGE.unknown}`}>
                      {s.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                    {'latency_ms' in s && s.latency_ms ? `${s.latency_ms}ms` : 'uptime_seconds' in s && s.uptime_seconds ? `${Math.floor(s.uptime_seconds / 3600)}s` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Queue Durumu ── */}
      {health?.queue && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('queueStatus') || 'Kuyruk Durumu'}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('pending') || 'Bekleyen'}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{health.queue.pending}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('processing') || 'İşleniyor'}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{health.queue.processing}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('failed') || 'Başarısız'}</p>
              <p className={`text-xl font-bold ${health.queue.failed > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {health.queue.failed}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Uptime ── */}
      {health?.api?.uptime_seconds ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{t('uptime') || 'Uptime'}</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatUptime(health.api.uptime_seconds)}</p>
        </div>
      ) : null}
    </div>
  );
}
