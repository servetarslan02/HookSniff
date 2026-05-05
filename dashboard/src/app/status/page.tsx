'use client';

import { useEffect, useState } from 'react';

interface ComponentStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number | null;
  description: string;
}

interface StatusData {
  overall_status: 'operational' | 'degraded' | 'outage';
  uptime_30d: number;
  components: ComponentStatus[];
  last_updated: string;
}

// Simulated status data (in production, fetch from /health or status API)
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
      },
      {
        name: 'Worker',
        status: 'healthy',
        latency_ms: null,
        description: 'Background webhook delivery worker',
      },
      {
        name: 'Database',
        status: 'healthy',
        latency_ms: 3,
        description: 'CockroachDB cluster',
      },
      {
        name: 'Queue',
        status: 'healthy',
        latency_ms: 5,
        description: 'Redpanda/Kafka message queue',
      },
    ],
    last_updated: now,
  };
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    healthy: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Operational' },
    operational: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Operational' },
    degraded: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Degraded' },
    down: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Down' },
    outage: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Outage' },
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
  // Generate 30 days of simulated uptime data
  const days = Array.from({ length: 30 }, (_, i) => {
    if (i >= 28) return 100; // Last 2 days: perfect
    if (i === 15) return 99.2; // One incident day
    return 99.9 + Math.random() * 0.1;
  });

  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-gray-500">Last 30 days</span>
        <span className="text-2xl font-bold text-gray-900">{uptime}%</span>
      </div>
      <div className="flex gap-0.5 h-8">
        {days.map((day, i) => {
          let color = 'bg-emerald-400';
          if (day < 99.5) color = 'bg-amber-400';
          if (day < 99) color = 'bg-red-400';
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm ${color} transition-all hover:opacity-80`}
              title={`Day ${30 - i}: ${day.toFixed(2)}%`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">30 days ago</span>
        <span className="text-xs text-gray-400">Today</span>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setData(getStatusData());
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading status...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HookRelay Status</h1>
          <p className="text-gray-500">Real-time service health monitoring</p>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Status</h2>
            <StatusBadge status={data.overall_status} />
          </div>
          <UptimeBar uptime={data.uptime_30d} />
        </div>

        {/* Components */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Components</h2>
          <div className="divide-y divide-gray-100">
            {data.components.map((component) => (
              <div key={component.name} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{component.name}</div>
                    <div className="text-sm text-gray-500">{component.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {component.latency_ms !== null && (
                      <span className="text-xs text-gray-400">{component.latency_ms}ms</span>
                    )}
                    <StatusBadge status={component.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>Last updated: {new Date(data.last_updated).toLocaleString()}</p>
          <p className="mt-1">
            Version {process.env.NEXT_PUBLIC_VERSION || '0.1.0'} •{' '}
            <a href="https://hookrelay.io" className="text-blue-500 hover:underline">
              hookrelay.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
