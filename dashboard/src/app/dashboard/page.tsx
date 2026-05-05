'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface Stats {
  total_deliveries: number;
  delivered: number;
  failed: number;
  pending: number;
  success_rate: number;
  endpoints_count: number;
}

const mockStats: Stats = {
  total_deliveries: 12847,
  delivered: 12453,
  failed: 127,
  pending: 267,
  success_rate: 96.93,
  endpoints_count: 8,
};

export default function DashboardOverview() {
  const [stats] = useState<Stats>(mockStats);

  const statCards = [
    {
      name: 'Total Deliveries',
      value: stats.total_deliveries.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: '📦',
    },
    {
      name: 'Delivered',
      value: stats.delivered.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: '✅',
    },
    {
      name: 'Failed',
      value: stats.failed.toLocaleString(),
      change: '-23.1%',
      changeType: 'negative' as const,
      icon: '❌',
    },
    {
      name: 'Success Rate',
      value: `${stats.success_rate}%`,
      change: '+0.3%',
      changeType: 'positive' as const,
      icon: '📈',
    },
    {
      name: 'Pending',
      value: stats.pending.toLocaleString(),
      change: '',
      changeType: 'neutral' as const,
      icon: '⏳',
    },
    {
      name: 'Endpoints',
      value: stats.endpoints_count.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: '🔗',
    },
  ];

  const recentDeliveries = [
    { id: 'wh_001', event: 'order.created', endpoint: 'api.shopify.com', status: 'delivered', time: '2 min ago' },
    { id: 'wh_002', event: 'payment.completed', endpoint: 'stripe.webhook.io', status: 'delivered', time: '5 min ago' },
    { id: 'wh_003', event: 'user.signup', endpoint: 'slack.com/hooks', status: 'failed', time: '8 min ago' },
    { id: 'wh_004', event: 'invoice.paid', endpoint: 'quickbooks.api', status: 'delivered', time: '12 min ago' },
    { id: 'wh_005', event: 'order.shipped', endpoint: 'api.shopify.com', status: 'pending', time: '15 min ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              {stat.change && (
                <span
                  className={clsx(
                    'text-sm font-medium',
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {stat.change}
                </span>
              )}
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
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {recentDeliveries.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{d.id}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-xs font-mono text-gray-700">
                    {d.event}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{d.endpoint}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{d.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    delivered: 'bg-green-50 text-green-700 ring-green-600/20',
    failed: 'bg-red-50 text-red-700 ring-red-600/20',
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}
