'use client';

import { useState } from 'react';

interface Endpoint {
  id: string;
  url: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const mockEndpoints: Endpoint[] = [
  { id: 'ep_001', url: 'https://api.shopify.com/webhooks', description: 'Shopify order notifications', is_active: true, created_at: '2026-04-15' },
  { id: 'ep_002', url: 'https://stripe.webhook.io/receive', description: 'Stripe payment events', is_active: true, created_at: '2026-04-18' },
  { id: 'ep_003', url: 'https://slack.com/hooks/T123', description: 'Slack notifications', is_active: true, created_at: '2026-04-20' },
  { id: 'ep_004', url: 'https://quickbooks.api/webhook', description: 'QuickBooks sync', is_active: false, created_at: '2026-04-22' },
];

export default function EndpointsPage() {
  const [endpoints] = useState<Endpoint[]>(mockEndpoints);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Endpoints</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your webhook endpoints</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition"
        >
          + New Endpoint
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Endpoint</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                placeholder="https://myapp.com/webhook"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="Order notifications"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex gap-3">
              <button className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {endpoints.map((ep) => (
          <div key={ep.id} className="glass-card p-6 hover-lift">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">
                    {ep.id}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ep.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></span>
                  <span className="text-xs text-gray-500">
                    {ep.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm font-mono text-gray-900 mb-1">{ep.url}</div>
                <div className="text-sm text-gray-500">{ep.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-gray-600 transition p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-red-600 transition p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
