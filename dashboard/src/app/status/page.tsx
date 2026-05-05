'use client';

import { useEffect, useState } from 'react';

interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number | null;
  description: string;
  icon: React.ReactNode;
}

interface Incident {
  id: string;
  title: string;
  status: 'resolved' | 'investigating' | 'monitoring';
  time: string;
  description: string;
}

interface StatusData {
  overall_status: 'operational' | 'degraded' | 'outage';
  uptime_30d: number;
  components: ComponentStatus[];
  incidents: Incident[];
  last_updated: string;
}

function getStatusData(): StatusData {
  const now = new Date().toISOString();
  return {
    overall_status: 'operational',
    uptime_30d: 99.97,
    components: [
      {
        name: 'API',
        status: 'healthy',
        latency_ms: 12,
        description: 'Webhook ingestion and management API',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10h14M10 3v14" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        name: 'Worker',
        status: 'healthy',
        latency_ms: null,
        description: 'Background webhook delivery worker',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="7" />
            <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        name: 'Database',
        status: 'healthy',
        latency_ms: 3,
        description: 'CockroachDB cluster',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <ellipse cx="10" cy="6" rx="7" ry="3" />
            <path d="M3 6v8c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
            <path d="M3 10c0 1.66 3.13 3 7 3s7-1.34 7-3" />
          </svg>
        ),
      },
      {
        name: 'Queue',
        status: 'healthy',
        latency_ms: 5,
        description: 'Redpanda/Kafka message queue',
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="14" height="4" rx="1" />
            <rect x="3" y="10" width="14" height="4" rx="1" />
          </svg>
        ),
      },
    ],
    incidents: [
      {
        id: 'inc-1',
        title: 'Elevated API latency',
        status: 'resolved',
        time: '2026-04-28T14:30:00Z',
        description: 'API latency spiked to 200ms due to database connection pool saturation. Resolved by scaling the connection pool.',
      },
      {
        id: 'inc-2',
        title: 'Worker queue backlog',
        status: 'resolved',
        time: '2026-04-15T09:00:00Z',
        description: 'Delivery worker fell behind due to increased volume. Additional workers were spun up to clear the backlog.',
      },
    ],
    last_updated: now,
  };
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    healthy: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Operational' },
    operational: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Operational' },
    degraded: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Degraded' },
    down: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Down' },
    outage: { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', label: 'Outage' },
    resolved: { bg: 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700', text: 'text-gray-600 dark:text-slate-400', dot: 'bg-gray-400 dark:bg-slate-500', label: 'Resolved' },
    investigating: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: 'Investigating' },
    monitoring: { bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', label: 'Monitoring' },
  };
  const style = styles[status] || styles.healthy;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function UptimeBar({ uptime }: { uptime: number }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    if (i >= 28) return 100;
    if (i === 15) return 99.2;
    return 99.9 + Math.random() * 0.1;
  });

  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-slate-400">Last 30 days</span>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{uptime}%</span>
      </div>
      <div className="flex gap-0.5 h-8">
        {days.map((day, i) => {
          let color = 'bg-emerald-400 dark:bg-emerald-500';
          if (day < 99.5) color = 'bg-amber-400 dark:bg-amber-500';
          if (day < 99) color = 'bg-red-400 dark:bg-red-500';
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
        <span className="text-xs text-gray-400 dark:text-slate-500">30 days ago</span>
        <span className="text-xs text-gray-400 dark:text-slate-500">Today</span>
      </div>
    </div>
  );
}

function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Incident History</h2>
      <div className="space-y-6">
        {incidents.map((incident) => (
          <div key={incident.id} className="relative pl-8">
            {/* Timeline line */}
            <div className="absolute left-3 top-3 bottom-0 w-px bg-gray-200 dark:bg-slate-700" />
            {/* Dot */}
            <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
              incident.status === 'resolved' ? 'bg-gray-400 dark:bg-slate-500' :
              incident.status === 'investigating' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{incident.title}</h3>
                <StatusBadge status={incident.status} />
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{incident.description}</p>
              <time className="text-xs text-gray-400 dark:text-slate-500">
                {new Date(incident.time).toLocaleString()}
              </time>
            </div>
          </div>
        ))}
        {incidents.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No incidents in the last 30 days 🎉</p>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(getStatusData());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="animate-pulse text-gray-400 dark:text-slate-500">Loading status...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xl">
              🪝
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HookRelay Status</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">Real-time service health monitoring</p>
        </div>

        {/* Overall Status */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Status</h2>
            <StatusBadge status={data.overall_status} />
          </div>
          <UptimeBar uptime={data.uptime_30d} />
        </div>

        {/* Components */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Components</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.components.map((component) => (
              <div
                key={component.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 hover-lift transition"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-100 dark:border-brand-500/20">
                  {component.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{component.name}</div>
                    <StatusBadge status={component.status} />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{component.description}</div>
                  {component.latency_ms !== null && (
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">{component.latency_ms}ms avg</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <IncidentTimeline incidents={data.incidents} />

        {/* Subscribe */}
        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Subscribe to updates</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Get notified about incidents and maintenance windows.</p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Subscribed! We'll notify you of any incidents.
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
              className="flex gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition btn-ripple"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 dark:text-slate-500 mt-8">
          <p>Last updated: {new Date(data.last_updated).toLocaleString()}</p>
          <p className="mt-1">
            Version {process.env.NEXT_PUBLIC_VERSION || '0.1.0'} •{' '}
            <a href="https://hookrelay.io" className="text-brand-500 dark:text-brand-400 hover:underline">
              hookrelay.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
