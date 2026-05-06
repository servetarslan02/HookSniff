'use client';

import { useEffect, useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// ─── Types ───
interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'unhealthy';
  latency_ms: number | null;
  description: string;
  last_checked: string;
}

interface StatusData {
  overall_status: 'operational' | 'degraded' | 'down';
  uptime_30d: number;
  components: ComponentStatus[];
  checked_at: string;
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    healthy: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      label: 'Operational',
    },
    operational: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      label: 'Operational',
    },
    degraded: {
      bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
      label: 'Degraded',
    },
    unhealthy: {
      bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500',
      label: 'Unhealthy',
    },
    down: {
      bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500',
      label: 'Down',
    },
  };
  const style = styles[status] || styles.healthy;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

// ─── Uptime Bar ───
function UptimeBar({ uptime }: { uptime: number }) {
  const t = useTranslations('status');
  // Generate 30 bars based on the uptime percentage.
  // When uptime tracking is implemented server-side, this should fetch per-day data.
  // For now, use a single value for all days.
  const days = Array.from({ length: 30 }, () => uptime);

  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-slate-400">{t('last30Days')}</span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{uptime}%</span>
      </div>
      <div className="flex gap-0.5 h-8">
        {days.map((day, i) => {
          let color = 'bg-emerald-400';
          if (day < 99.5) color = 'bg-amber-400';
          if (day < 99) color = 'bg-red-400';
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm ${color} transition-all hover:opacity-80 cursor-help`}
              title={`Day ${30 - i}: ${day.toFixed(2)}%`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400 dark:text-slate-500">{t('daysAgo')}</span>
        <span className="text-xs text-gray-400 dark:text-slate-500">{t('today')}</span>
      </div>
    </div>
  );
}

// ─── Main Status Page ───
export default function StatusPage() {
  const t = useTranslations('status');
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`${API}/status`);
      if (!res.ok) {
        throw new Error(`Status API returned ${res.status}`);
      }
      const json: StatusData = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status');
      // If we had previous data, keep showing it
      if (!data) {
        setData(null);
      }
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [API]);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 dark:text-slate-500">{t('loadingStatus')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-gray-600 dark:text-slate-400 font-medium">Unable to load status</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🪝</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">{t('subtitle')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Auto-refreshes every 30s • Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('currentStatus')}</h2>
            <StatusBadge status={data.overall_status} />
          </div>
          <UptimeBar uptime={data.uptime_30d} />
        </div>

        {/* Components */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('components')}</h2>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {data.components.map((component) => (
              <div key={component.name} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{component.name}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{component.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {component.latency_ms !== null && (
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        {component.latency_ms}ms
                      </span>
                    )}
                    <StatusBadge status={component.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Incident History
          </h2>
          <div className="text-center py-8 text-gray-400 dark:text-slate-500">
            <div className="text-3xl mb-2">🎉</div>
            <p>{t('noIncidents')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 dark:text-slate-500">
          <p>
            Version {process.env.NEXT_PUBLIC_VERSION || '0.1.0'} •{' '}
            <Link href="/" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
              hookrelay.dev
            </Link>{' '}
            •{' '}
            <Link href="/docs" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
              Docs
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
