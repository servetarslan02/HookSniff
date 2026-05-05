'use client';

import { useState } from 'react';

interface Delivery {
  id: string;
  event: string;
  endpoint_url: string;
  status: 'delivered' | 'failed' | 'pending';
  attempt_count: number;
  response_status: number | null;
  created_at: string;
}

const mockDeliveries: Delivery[] = [
  { id: 'wh_a1b2c3', event: 'order.created', endpoint_url: 'https://api.shopify.com/webhooks', status: 'delivered', attempt_count: 1, response_status: 200, created_at: '2026-05-06 03:30' },
  { id: 'wh_d4e5f6', event: 'payment.completed', endpoint_url: 'https://stripe.webhook.io/receive', status: 'delivered', attempt_count: 1, response_status: 200, created_at: '2026-05-06 03:25' },
  { id: 'wh_g7h8i9', event: 'user.signup', endpoint_url: 'https://slack.com/hooks/T123', status: 'failed', attempt_count: 3, response_status: 500, created_at: '2026-05-06 03:20' },
  { id: 'wh_j0k1l2', event: 'invoice.paid', endpoint_url: 'https://quickbooks.api/webhook', status: 'delivered', attempt_count: 2, response_status: 200, created_at: '2026-05-06 03:15' },
  { id: 'wh_m3n4o5', event: 'order.shipped', endpoint_url: 'https://api.shopify.com/webhooks', status: 'pending', attempt_count: 0, response_status: null, created_at: '2026-05-06 03:10' },
  { id: 'wh_p6q7r8', event: 'user.login', endpoint_url: 'https://analytics.io/events', status: 'delivered', attempt_count: 1, response_status: 200, created_at: '2026-05-06 03:05' },
  { id: 'wh_s9t0u1', event: 'payment.failed', endpoint_url: 'https://stripe.webhook.io/receive', status: 'failed', attempt_count: 3, response_status: 502, created_at: '2026-05-06 03:00' },
];

export default function DeliveriesPage() {
  const [deliveries] = useState<Delivery[]>(mockDeliveries);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? deliveries : deliveries.filter((d) => d.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Deliveries</h2>
        <p className="text-sm text-gray-500 mt-1">Track all webhook deliveries and their status</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'delivered', 'failed', 'pending'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 text-xs opacity-75">
                ({deliveries.filter((d) => d.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50/50 transition cursor-pointer">
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{d.id}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-xs font-mono text-gray-700">
                    {d.event}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{d.endpoint_url}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{d.attempt_count}</td>
                <td className="px-6 py-4">
                  {d.response_status ? (
                    <span className={`text-sm font-mono ${d.response_status < 400 ? 'text-green-600' : 'text-red-600'}`}>
                      {d.response_status}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{d.created_at}</td>
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
