'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { webhooksApi, type Delivery } from '@/lib/api';

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    delivered: 'bg-emerald-500',
    success: 'bg-emerald-500',
    failed: 'bg-red-500',
    error: 'bg-red-500',
    pending: 'bg-amber-500',
    active: 'bg-blue-500',
  };
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full ${colors[status] || colors.pending}`}
      role="img"
      aria-label={status}
    />
  );
}

export function ActivityFeed({ token }: { token: string }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    try {
      const data = await webhooksApi.list(token, { page: 1 });
      setDeliveries(data.deliveries.slice(0, 10));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('error'));
    } finally {
      setLoading(false);
    }
  }, [token, tc]);

  useEffect(() => {
    fetchDeliveries();

    // Only poll when tab is visible to save resources (Item 336)
    let interval: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (!interval) interval = setInterval(fetchDeliveries, 5000);
    };
    const stopPolling = () => {
      if (interval) { clearInterval(interval); interval = null; }
    };

    const handleVisibility = () => {
      if (document.hidden) stopPolling();
      else { fetchDeliveries(); startPolling(); }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    if (!document.hidden) startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchDeliveries]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('liveActivity')}</h3>
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-400">{t('autoRefresh5s')}</span>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400 animate-pulse">{tc('loading')}</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>
      ) : deliveries.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-slate-400">{t('noActivity')}</div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {deliveries.map((d, i) => (
            <div
              key={d.id}
              className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <StatusDot status={d.status} />
                <div>
                  <div className="text-sm font-mono text-gray-700 dark:text-slate-300">
                    {d.event || 'webhook'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {d.id.slice(0, 10)}…
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {d.attempt_count} attempt{d.attempt_count !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {new Date(d.created_at).toLocaleTimeString(locale)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
