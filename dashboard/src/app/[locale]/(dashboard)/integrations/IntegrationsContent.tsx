'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { integrationsApi, connectorsApi, endpointsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

function formatDuration(ms: number | null) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const PROVIDER_ICONS: Record<string, string> = {
  stripe: '💳',
  shopify: '🛒',
  github: '🐙',
  slack: '💬',
  twilio: '📞',
  discord: '🎮',
  linear: '📐',
  notion: '📝',
};

const HEALTH_COLORS: Record<string, string> = {
  healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  failing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  filtered: 'bg-gray-100 text-gray-600',
};

export default function IntegrationsContent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'events' | 'stats'>('overview');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formConnectorConfig, setFormConnectorConfig] = useState('');
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formEventFilter, setFormEventFilter] = useState('');

  // Event filter for detail view
  const [eventStatusFilter, setEventStatusFilter] = useState('');

  // Queries
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.list(token!),
    enabled: !!token,
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['connector-configs'],
    queryFn: () => connectorsApi.listConfigs(token!),
    enabled: !!token,
  });

  const { data: endpoints = [] } = useQuery({
    queryKey: ['endpoints'],
    queryFn: () => endpointsApi.list(token!),
    enabled: !!token,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['integration-events', selectedId, eventStatusFilter],
    queryFn: () => integrationsApi.listEvents(token!, selectedId!, { status: eventStatusFilter || undefined }),
    enabled: !!token && !!selectedId && tab === 'events',
  });

  const { data: stats } = useQuery({
    queryKey: ['integration-stats', selectedId],
    queryFn: () => integrationsApi.getStats(token!, selectedId!),
    enabled: !!token && !!selectedId && tab === 'stats',
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; connector_config_id: string; endpoint_id: string; event_filter?: string[] }) =>
      integrationsApi.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      resetForm();
      toast('Integration created', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setSelectedId(null);
      toast('Integration deleted', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      integrationsApi.update(token!, id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast('Integration updated', 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.test(token!, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integration-events'] });
      toast(`Test event sent: ${data.event_id}`, 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const resetForm = () => {
    setShowCreate(false);
    setFormName('');
    setFormDesc('');
    setFormConnectorConfig('');
    setFormEndpoint('');
    setFormEventFilter('');
  };

  const selected = integrations.find((i) => i.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connect external services to your endpoints — route events automatically
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          + New Integration
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Create Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Stripe → Production Endpoint"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Connector Configuration</label>
              <select
                value={formConnectorConfig}
                onChange={(e) => setFormConnectorConfig(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select connector...</option>
                {configs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {PROVIDER_ICONS[c.connector_name] || '🔌'} {c.connector_display_name} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Endpoint</label>
              <select
                value={formEndpoint}
                onChange={(e) => setFormEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select endpoint...</option>
                {endpoints.map((ep: any) => (
                  <option key={ep.id} value={ep.id}>{ep.url || ep.name || ep.id}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Filter <span className="text-gray-400 font-normal">(comma-separated, empty = all events)</span>
            </label>
            <input
              value={formEventFilter}
              onChange={(e) => setFormEventFilter(e.target.value)}
              placeholder="e.g. payment_intent.succeeded, charge.failed"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!formName.trim() || !formConnectorConfig || !formEndpoint) {
                  toast('Fill in all required fields', 'error');
                  return;
                }
                const filter = formEventFilter
                  ? formEventFilter.split(',').map((s) => s.trim()).filter(Boolean)
                  : undefined;
                createMutation.mutate({
                  name: formName,
                  description: formDesc || undefined,
                  connector_config_id: formConnectorConfig,
                  endpoint_id: formEndpoint,
                  event_filter: filter,
                });
              }}
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Integration'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Integrations List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading integrations...</div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No integrations yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Connect a connector to an endpoint to start routing events
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((ig) => (
            <div
              key={ig.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-md transition ${
                selectedId === ig.id
                  ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => {
                setSelectedId(selectedId === ig.id ? null : ig.id);
                setTab('overview');
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PROVIDER_ICONS[ig.connector_name] || '🔌'}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{ig.name}</h3>
                    <span className="text-xs text-gray-500">
                      {ig.connector_display_name} → endpoint
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${HEALTH_COLORS[ig.health_status] || HEALTH_COLORS.new}`}>
                  {ig.health_status}
                </span>
              </div>

              {ig.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{ig.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>{ig.total_deliveries} deliveries</span>
                <span>·</span>
                <span>{ig.total_failures} failures</span>
                <span>·</span>
                <span className={ig.enabled ? 'text-green-600' : 'text-gray-400'}>
                  {ig.enabled ? 'enabled' : 'disabled'}
                </span>
              </div>

              {ig.event_filter && ig.event_filter.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {ig.event_filter.slice(0, 3).map((ev) => (
                    <span key={ev} className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {ev}
                    </span>
                  ))}
                  {ig.event_filter.length > 3 && (
                    <span className="px-1.5 py-0.5 text-xs text-gray-400">+{ig.event_filter.length - 3}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">{formatDate(ig.last_triggered_at)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMutation.mutate({ id: ig.id, enabled: !ig.enabled });
                    }}
                    className={`text-xs ${ig.enabled ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                  >
                    {ig.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this integration?')) deleteMutation.mutate(ig.id);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['overview', 'events', 'stats'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-medium capitalize transition ${
                  tab === t
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Status</span>
                    <div className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${HEALTH_COLORS[selected.health_status]}`}>
                      {selected.health_status}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Connector</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.connector_display_name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Deliveries</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.total_deliveries}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Failure Rate</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selected.total_deliveries > 0
                        ? `${((selected.total_failures / selected.total_deliveries) * 100).toFixed(1)}%`
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Last Triggered</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selected.last_triggered_at)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Last Success</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selected.last_success_at)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Last Failure</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selected.last_failure_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => testMutation.mutate(selected.id)}
                    disabled={testMutation.isPending || !selected.enabled}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {testMutation.isPending ? 'Sending...' : '🧪 Test Integration'}
                  </button>
                  <button
                    onClick={() => toggleMutation.mutate({ id: selected.id, enabled: !selected.enabled })}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      selected.enabled
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selected.enabled ? '⏸ Disable' : '▶ Enable'}
                  </button>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {tab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <select
                    value={eventStatusFilter}
                    onChange={(e) => setEventStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="filtered">Filtered</option>
                  </select>
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['integration-events', selectedId] })}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800"
                  >
                    ↻ Refresh
                  </button>
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No events found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-2 pr-4">Event</th>
                          <th className="pb-2 pr-4">Status</th>
                          <th className="pb-2 pr-4">Attempts</th>
                          <th className="pb-2 pr-4">Duration</th>
                          <th className="pb-2 pr-4">Error</th>
                          <th className="pb-2">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {events.map((ev) => (
                          <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-2 pr-4">
                              <span className="font-mono text-xs">{ev.event_type}</span>
                            </td>
                            <td className="py-2 pr-4">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[ev.status] || ''}`}>
                                {ev.status}
                              </span>
                            </td>
                            <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{ev.attempts}</td>
                            <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{formatDuration(ev.duration_ms)}</td>
                            <td className="py-2 pr-4 text-red-500 text-xs max-w-[200px] truncate">{ev.error_message || '—'}</td>
                            <td className="py-2 text-gray-500 text-xs">{formatDate(ev.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {tab === 'stats' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <span className="text-xs text-gray-500">Total Events</span>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_events}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <span className="text-xs text-green-600">Delivered</span>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.delivered}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <span className="text-xs text-red-600">Failed</span>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.failed}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <span className="text-xs text-blue-600">Success Rate</span>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.success_rate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <span className="text-xs text-gray-500">Pending</span>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <span className="text-xs text-gray-500">Filtered</span>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.filtered}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <span className="text-xs text-gray-500">Avg Duration</span>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatDuration(stats.avg_duration_ms)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <span className="text-xs text-gray-500">Last 24h</span>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {stats.last_24h_events} <span className="text-sm text-red-500">({stats.last_24h_failures} failed)</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
