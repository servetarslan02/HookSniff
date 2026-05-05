'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { statsApi, webhooksApi, type StatsResponse, type Delivery } from '@/lib/api';

export default function DashboardOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const [statsData, deliveriesData] = await Promise.all([
          statsApi.get(token!).catch(() => null),
          webhooksApi.list(token!, { page: 1 }).catch(() => null),
        ]);
        if (statsData) setStats(statsData);
        if (deliveriesData) setRecentDeliveries(deliveriesData.deliveries.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Deliveries', value: stats?.total_deliveries?.toLocaleString() ?? '0', icon: '📦' },
    { name: 'Delivered', value: stats?.delivered?.toLocaleString() ?? '0', icon: '✅' },
    { name: 'Failed', value: stats?.failed?.toLocaleString() ?? '0', icon: '❌' },
    { name: 'Success Rate', value: stats ? `${stats.success_rate}%` : '0%', icon: '📈' },
    { name: 'Pending', value: stats?.pending?.toLocaleString() ?? '0', icon: '⏳' },
    { name: 'Endpoints', value: stats?.endpoints_count?.toString() ?? '0', icon: '🔗' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
          <a href="/dashboard/deliveries" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all →
          </a>
        </div>
        {recentDeliveries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No deliveries yet. Send your first webhook!
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(d.created_at).toLocaleString()}
                  </td>
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
