'use client';

import { useEffect, useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// ─── Types ───
interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'unhealthy' | 'unknown';
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
    unknown: {
      bg: 'bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20',
      text: 'text-gray-500 dark:text-gray-400',
      dot: 'bg-gray-400',
      label: 'Unknown',
    },
  };
  const style = styles[status] || styles.unknown;

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

// ─── Fallback when API is unreachable ───
function unreachableData(): StatusData {
  return {
    overall_status: 'down',
    uptime_30d: 0,
    components: [
      {
        name: 'API',
        status: 'unknown',
        latency_ms: null,
        description: 'Cannot reach API server',
        last_checked: new Date().toISOString(),
      },
      {
        name: 'Database',
        status: 'unknown',
        latency_ms: null,
        description: 'Cannot verify — API unreachable',
        last_checked: new Date().toISOString(),
      },
      {
        name: 'Worker',
        status: 'unknown',
        latency_ms: null,
        description: 'Cannot verify — API unreachable',
        last_checked: new Date().toISOString(),
      },
    ],
    checked_at: new Date().toISOString(),
  };
}

// ─── Main Status Page ───
export default function StatusPage() {
  const t = useTranslations('status');
  const [data, setData] = useState<StatusData>(unreachableData());
  const [loading, setLoading] = useState(true);
  const [apiReachable, setApiReachable] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';

  const loadData = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API}/status`, {
        signal: controller.signal,
        mode: 'cors',
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: StatusData = await res.json();
      setData(json);
      setApiReachable(true);
    } catch {
      setData(unreachableData());
      setApiReachable(false);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [API]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl">🪝</span>
            <span className="font-bold text-gray-900 dark:text-white">HookSniff</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Status</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>
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

        {/* API unreachable banner */}
        {!apiReachable && !loading && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                API server unreachable
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Cannot connect to {API} — status data may be outdated
              </p>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

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
              hooksniff.vercel.app
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
