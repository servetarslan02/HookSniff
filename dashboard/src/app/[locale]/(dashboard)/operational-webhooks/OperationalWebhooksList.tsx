'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { operationalWebhooksApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default function OperationalWebhooksList() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: endpoints = [], isLoading } = useQuery({
    queryKey: ['op-webhooks'],
    queryFn: () => operationalWebhooksApi.list(token!),
    enabled: !!token,
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ['op-webhooks', selectedId, 'deliveries'],
    queryFn: () => operationalWebhooksApi.listDeliveries(token!, selectedId!),
    enabled: !!token && !!selectedId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { url: string; description?: string }) =>
      operationalWebhooksApi.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['op-webhooks'] });
      setShowCreate(false); setNewUrl(''); setNewDesc('');
      toast('Webhook endpoint created', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => operationalWebhooksApi.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['op-webhooks'] });
      if (selectedId) setSelectedId(null);
      toast('Endpoint deleted', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Operational Webhooks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about system events (delivery failures, endpoint disabled, etc.)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          + New Endpoint
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Create Webhook Endpoint</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com/webhooks"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (newUrl.trim()) createMutation.mutate({ url: newUrl, description: newDesc || undefined }); }}
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : endpoints.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🪝</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No operational webhooks</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create an endpoint to receive system event notifications</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {endpoints.map(ep => (
            <div key={ep.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-md transition ${selectedId === ep.id ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-gray-700'}`}
              onClick={() => setSelectedId(selectedId === ep.id ? null : ep.id)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm break-all">{ep.url}</h3>
                  {ep.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ep.description}</p>}
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${ep.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {ep.is_active ? 'active' : 'inactive'}
                </span>
              </div>
              {ep.event_types && ep.event_types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {ep.event_types.map(et => <span key={et} className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">{et}</span>)}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">{formatDate(ep.created_at)}</span>
                <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(ep.id); }} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Log</h3>
          </div>
          {deliveries.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No deliveries yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {deliveries.map(d => (
                  <tr key={d.id}>
                    <td className="px-4 py-2 text-sm font-mono text-gray-900 dark:text-white">{d.event_type}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${d.status === 'success' ? 'bg-green-100 text-green-700' : d.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{d.response_status ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{d.attempt_count}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{formatDate(d.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
