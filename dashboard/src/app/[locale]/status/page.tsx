'use client';

import { useEffect, useState, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// ─── Types ───
interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number | null;
  description: string;
  last_checked: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  updates: Array<{
    time: string;
    message: string;
    status: string;
  }>;
}

interface StatusData {
  overall_status: 'operational' | 'degraded' | 'outage';
  uptime_30d: number;
  components: ComponentStatus[];
  incidents: Incident[];
  last_updated: string;
}

// ─── Simulated status data (in production, fetch from /health or status API) ───
function getStatusData(): StatusData {
  const now = new Date().toISOString();
  const t = useTranslations('status');
  const tc = useTranslations('common');
  return {
    overall_status: 'operational',
    uptime_30d: 99.97,
    components: [
      {
        name: 'API',
        status: 'healthy',
        latency_ms: 12,
        description: 'Webhook ingestion and management API',
        last_checked: now,
      },
      {
        name: 'Worker',
        status: 'healthy',
        latency_ms: null,
        description: 'Background webhook delivery worker',
        last_checked: now,
      },
      {
        name: 'Database',
        status: 'healthy',
        latency_ms: 3,
        description: 'CockroachDB distributed SQL cluster',
        last_checked: now,
      },
      {
        name: 'Kafka',
        status: 'healthy',
        latency_ms: 5,
        description: 'Redpanda message queue for event streaming',
        last_checked: now,
      },
      {
        name: 'Temporal',
        status: 'healthy',
        latency_ms: 8,
        description: 'Temporal workflow engine for durable execution',
        last_checked: now,
      },
    ],
    incidents: [
      {
        id: 'inc-001',
        title: 'Elevated API latency in EU region',
        severity: 'minor',
        status: 'resolved',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        resolved_at: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
        updates: [
          {
            time: new Date(Date.now() - 5 * 86400000).toISOString(),
            message: 'Investigating reports of slow API responses in EU.',
            status: 'investigating',
          },
          {
            time: new Date(Date.now() - 5 * 86400000 + 1800000).toISOString(),
            message: 'Identified cause: database connection pool exhaustion. Scaling up connections.',
            status: 'identified',
          },
          {
            time: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
            message: 'Issue resolved. Latency back to normal levels.',
            status: 'resolved',
          },
        ],
      },
      {
        id: 'inc-002',
        title: 'Webhook delivery delays',
        severity: 'major',
        status: 'resolved',
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        resolved_at: new Date(Date.now() - 12 * 86400000 + 7200000).toISOString(),
        updates: [
          {
            time: new Date(Date.now() - 12 * 86400000).toISOString(),
            message: 'Webhook deliveries experiencing 5-10 minute delays.',
            status: 'investigating',
          },
          {
            time: new Date(Date.now() - 12 * 86400000 + 7200000).toISOString(),
            message: 'Kafka consumer lag resolved. All queued deliveries processed.',
            status: 'resolved',
          },
        ],
      },
      {
        id: 'inc-003',
        title: 'Dashboard authentication outage',
        severity: 'critical',
        status: 'resolved',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        resolved_at: new Date(Date.now() - 20 * 86400000 + 5400000).toISOString(),
        updates: [
          {
            time: new Date(Date.now() - 20 * 86400000).toISOString(),
            message: 'Users unable to log in to dashboard. API authentication unaffected.',
            status: 'investigating',
          },
          {
            time: new Date(Date.now() - 20 * 86400000 + 2700000).toISOString(),
            message: 'Root cause identified: expired JWT signing certificate.',
            status: 'identified',
          },
          {
            time: new Date(Date.now() - 20 * 86400000 + 5400000).toISOString(),
            message: 'Certificate rotated. All authentication flows restored.',
            status: 'resolved',
          },
        ],
      },
    ],
    last_updated: now,
  };
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
    down: {
      bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500',
      label: 'Down',
    },
    outage: {
      bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500',
      label: 'Outage',
    },
    investigating: {
      bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
      label: 'Investigating',
    },
    identified: {
      bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500',
      label: 'Identified',
    },
    monitoring: {
      bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
      text: 'text-purple-700 dark:text-purple-400',
      dot: 'bg-purple-500',
      label: 'Monitoring',
    },
    resolved: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      label: 'Resolved',
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

// ─── Severity Badge ───
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    minor: 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400',
    major: 'bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-400',
    critical: 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        styles[severity] || styles.minor
      }`}
    >
      {severity}
    </span>
  );
}

// ─── Uptime Bar ───
function UptimeBar({ uptime }: { uptime: number }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    if (i >= 28) return 100;
    if (i === 15) return 99.2;
    if (i === 8) return 98.5;
    return 99.9 + Math.random() * 0.1;
  });

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

// ─── Incident Timeline ───
function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-slate-500">
        <div className="text-3xl mb-2">🎉</div>
        <p>{t('noIncidents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <SeverityBadge severity={incident.severity} />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {incident.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {new Date(incident.created_at).toLocaleDateString()} •{' '}
                  {incident.resolved_at
                    ? `${t('resolvedIn', { minutes: Math.round((new Date(incident.resolved_at).getTime() - new Date(incident.created_at).getTime()) / 60000) })}`
                    : 'Ongoing'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={incident.status} />
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  expandedId === incident.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedId === incident.id && (
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-800">
              <div className="mt-3 space-y-3">
                {incident.updates.map((update, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 ${
                          update.status === 'resolved'
                            ? 'bg-emerald-500'
                            : update.status === 'identified'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                        }`}
                      />
                      {i < incident.updates.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 dark:bg-slate-700 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                          {update.status}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">
                          {new Date(update.time).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Status Page ───
export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = useCallback(() => {
    // Simulate loading (in production, fetch from API)
    setData(getStatusData());
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 dark:text-slate-500">{t('loadingStatus')}</div>
      </div>
    );
  }

  if (!data) return null;

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
          <IncidentTimeline incidents={data.incidents} />
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
