'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { apiFetch } from '@/lib/api';

export function LiveRequestViewer() {
  const t = useTranslations('playground');
  const locale = useLocale();
  const [liveDeliveries, setLiveDeliveries] = useState<
    Array<{ id: string; event: string; status: string; time: string }>
  >([]);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLive = useCallback(async () => {
    setIsLive(true);
    // Poll for recent deliveries
    const poll = async () => {
      try {
        const data = await apiFetch<{ deliveries?: Array<Record<string, unknown>> }>('/webhooks?page=1');
        const recent = (data.deliveries || []).slice(0, 5).map((d) => ({
          id: String(d.id).slice(0, 10),
          event: String(d.event || 'webhook'),
          status: String(d.status),
          time: new Date(String(d.created_at)).toLocaleTimeString(locale),
        }));
        setLiveDeliveries(recent);
      } catch {
        // Live polling — silently retry on next interval
      }
    };
    poll();
    intervalRef.current = setInterval(poll, 3000);
  }, [locale]);

  const stopLive = useCallback(() => {
    setIsLive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('liveViewer')}</h3>
        <button type="button"
          onClick={isLive ? stopLive : startLive}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            isLive
              ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
          }`}
        >
          {isLive ? t('stop') : t('startLive')}
        </button>
      </div>
      {isLive && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 dark:text-green-400">{t('watchingDeliveries')}</span>
        </div>
      )}
      {liveDeliveries.length > 0 ? (
        <div className="space-y-2">
          {liveDeliveries.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    d.status === 'delivered'
                      ? 'bg-green-500'
                      : d.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                  }`}
                />
                <span className="text-xs font-mono text-gray-700 dark:text-slate-300">{d.event}</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-slate-500">{d.time}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-slate-500">
          {isLive ? t('waitingRequests') : t('clickStart')}
        </p>
      )}
    </div>
  );
}
