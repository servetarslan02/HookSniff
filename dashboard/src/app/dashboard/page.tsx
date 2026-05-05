'use client';

import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { statsApi, webhooksApi, type StatsResponse, type Delivery } from '@/lib/api';
import LoadingSpinner, { SkeletonCard } from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

const TIME_RANGES = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
] as const;

function MiniChart({ data, color = '#4c6ef5' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 200;
  const h = 48;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatsContent() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [s, d] = await Promise.all([
        statsApi.get(token),
        webhooksApi.list(token, { page: 1 }),
      ]);
      setStats(s);
      setRecentDeliveries(d.deliveries.slice(0, 5));
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Generate mock trend data for the chart based on time range
  const trendData = timeRange === '24h'
    ? [12, 19, 8, 15, 22, 18, 25, 30, 28, 35, 32, 40]
    : timeRange === '7d'
    ? [180, 220, 195, 250, 230, 280, 310]
    : [800, 950, 1100, 980, 1200, 1050, 1300, 1150, 1400, 1250, 1500, 1350, 1600, 1450];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load stats</h3>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={fetchData} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
          Retry
        </button>
      </div>
    );
  }

  const s = stats!;
  const statCards = [
    { name: 'Total Deliveries', value: s.total_deliveries.toLocaleString(), icon: '📦', change: '+12.5%', positive: true },
    { name: 'Delivered', value: s.delivered.toLocaleString(), icon: '✅', change: '+8.2%', positive: true },
    { name: 'Failed', value: s.failed.toLocaleString(), icon: '❌', change: '-23.1%', positive: false },
    { name: 'Success Rate', value: `${s.success_rate}%`, icon: '📈', change: '+0.3%', positive: true },
    { name: 'Pending', value: s.pending.toLocaleString(), icon: '⏳', change: '', positive: true },
    { name: 'Endpoints', value: s.endpoints_count.toString(), icon: '🔗', change: '+2', positive: true },
  ];

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                timeRange === r.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Auto-refresh
        </label>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              {stat.change && (
                <span className={clsx('text-sm font-medium', stat.positive ? 'text-green-600' : 'text-red-600')}>
                  {stat.change}
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Delivery Trends Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Trends</h2>
          <span className="text-sm text-gray-500">Last {timeRange}</span>
        </div>
        <MiniChart data={trendData} />
      </div>

      {/* Recent Deliveries */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
          <a href="/dashboard/deliveries" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all →
          </a>
        </div>
        {recentDeliveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No deliveries yet</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {recentDeliveries.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{d.id.slice(0, 12)}…</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-xs font-mono text-gray-700">
                      {d.event || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{d.attempt_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: 'bg-green-50 text-green-700 ring-green-600/20',
    failed: 'bg-red-50 text-red-700 ring-red-600/20',
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

export default function DashboardOverview() {
  return (
    <ErrorBoundary>
      <StatsContent />
    </ErrorBoundary>
  );
}
