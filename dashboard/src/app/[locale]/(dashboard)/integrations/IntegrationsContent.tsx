'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { integrationsApi, connectorsApi, endpointsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CreditCard, ShoppingBag, GitBranch, MessageSquare, Pause, Phone, Play, Gamepad2, TriangleRight, FileText, Plug, Link2, Pencil, Trash2 } from '@/components/icons';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

function formatDuration(ms: number | null) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  stripe: <CreditCard size={16} strokeWidth={1.75} />,
  shopify: <ShoppingBag size={16} strokeWidth={1.75} />,
  github: <GitBranch size={16} strokeWidth={1.75} />,
  slack: <MessageSquare size={16} strokeWidth={1.75} />,
  twilio: <Phone size={16} strokeWidth={1.75} />,
  discord: <Gamepad2 size={16} strokeWidth={1.75} />,
  linear: <TriangleRight size={16} strokeWidth={1.75} />,
  notion: <FileText size={16} strokeWidth={1.75} />,
};

const HEALTH_COLORS: Record<string, string> = {
  healthy: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  failing: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  filtered: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',
};

export default function IntegrationsContent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('integrations');
  const tc = useTranslations('common');
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'events' | 'stats'>('overview');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);

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
      toast(t('created'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      integrationsApi.update(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setEditTarget(null);
      toast(t('updated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setSelectedId(null);
      toast(t('deleted'), 'info');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      integrationsApi.update(token!, id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast(t('updated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => integrationsApi.test(token!, id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integration-events'] });
      toast(`${t('testSent')}: ${data.event_id}`, 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const resetForm = () => {
    setShowCreate(false);
    setEditTarget(null);
    setFormName('');
    setFormDesc('');
    setFormConnectorConfig('');
    setFormEndpoint('');
    setFormEventFilter('');
  };

  const openEdit = (ig: typeof integrations[0]) => {
    setEditTarget(ig.id);
    setFormName(ig.name);
    setFormDesc(ig.description ?? '');
    setFormConnectorConfig(ig.connector_config_id);
    setFormEndpoint(ig.endpoint_id);
    setFormEventFilter(ig.event_filter?.join(', ') ?? '');
    setShowCreate(false);
  };

  const handleCreateOrUpdate = () => {
    if (!formName.trim() || !formConnectorConfig || !formEndpoint) {
      toast(t('fillRequired'), 'error');
      return;
    }
    const filter = formEventFilter ? formEventFilter.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const data = { name: formName, description: formDesc || undefined, connector_config_id: formConnectorConfig, endpoint_id: formEndpoint, event_filter: filter };

    if (editTarget) {
      updateMutation.mutate({ id: editTarget, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const selected = integrations.find(i => i.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          + {t('newIntegration')}
        </button>
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={resetForm} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{editTarget ? t('editIntegration') : t('newIntegration')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('connectConnectorToEndpoint')}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t('namePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('description')}</label>
                  <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder={t('optional')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('connectorConfig')}</label>
                <select value={formConnectorConfig} onChange={e => setFormConnectorConfig(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="">{t('selectConnector')}</option>
                  {configs.map(c => <option key={c.id} value={c.id}>{PROVIDER_ICONS[c.connector_name] || <Plug size={16} strokeWidth={1.75} />} {c.connector_display_name} — {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('targetEndpoint')}</label>
                <select value={formEndpoint} onChange={e => setFormEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="">{t('selectEndpoint')}</option>
                  {endpoints
                    .filter((ep: { url: string }) => ep.url.startsWith('http') && !ep.url.includes('#'))
                    .map((ep: { id: string; url: string; description?: string }) => {
                    const label = ep.description ? `${ep.description} (${ep.url})` : ep.url;
                    return <option key={ep.id} value={ep.id}>{label}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {t('eventFilter')} <span className="normal-case tracking-normal font-normal text-gray-400">{t('eventFilterHint')}</span>
                </label>
                <input value={formEventFilter} onChange={e => setFormEventFilter(e.target.value)} placeholder="payment_intent.succeeded, charge.failed"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={resetForm} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
              <button onClick={handleCreateOrUpdate} disabled={createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
                {(createMutation.isPending || updateMutation.isPending) ? tc('creating') : editTarget ? t('saveChanges') : t('createIntegration')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations List */}
      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
        </div>
      ) : integrations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Link2 size={48} strokeWidth={1.75} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noIntegrations')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('noIntegrationsDesc')}</p>
          <button onClick={() => setShowCreate(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
            + {t('newIntegration')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map(ig => (
            <div key={ig.id}
              className={`glass-card p-5 cursor-pointer hover:shadow-md transition ${selectedId === ig.id ? 'ring-2 ring-brand-500' : ''}`}
              onClick={() => { setSelectedId(selectedId === ig.id ? null : ig.id); setTab('overview'); }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{PROVIDER_ICONS[ig.connector_name] || <Plug size={20} strokeWidth={1.75} />}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{ig.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{ig.connector_display_name} → endpoint</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${HEALTH_COLORS[ig.health_status] || HEALTH_COLORS.new}`}>{ig.health_status}</span>
              </div>

              {ig.description && <p className="text-xs text-gray-500 dark:text-slate-400 mb-2 line-clamp-2">{ig.description}</p>}

              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-3">
                <span>{ig.total_deliveries} {t('deliveries')}</span>
                <span>·</span>
                <span>{ig.total_failures} {t('failures')}</span>
                <span>·</span>
                <span className={ig.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>{ig.enabled ? t('enabled') : t('disabled')}</span>
              </div>

              {ig.event_filter && ig.event_filter.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {ig.event_filter.slice(0, 3).map(ev => (
                    <span key={ev} className="px-1.5 py-0.5 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded font-mono">{ev}</span>
                  ))}
                  {ig.event_filter.length > 3 && <span className="px-1.5 py-0.5 text-xs text-gray-400">+{ig.event_filter.length - 3}</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-slate-400">{formatDate(ig.last_triggered_at)}</span>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); openEdit(ig); }} title={t('edit')} className="text-gray-500 dark:text-slate-400 hover:text-brand-600 transition p-1.5"><Pencil size={16} strokeWidth={1.75} /></button>
                  <button onClick={e => { e.stopPropagation(); toggleMutation.mutate({ id: ig.id, enabled: !ig.enabled }); }}
                    title={ig.enabled ? t('disable') : t('enable')}
                    className={`p-1.5 text-sm ${ig.enabled ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}>
                    {ig.enabled ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget(ig.id); }} title={t('delete')} className="text-gray-500 dark:text-slate-400 hover:text-red-600 transition p-1.5"><Trash2 size={16} strokeWidth={1.75} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="glass-card overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-slate-700">
            {(['overview', 'events', 'stats'] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={`px-6 py-3 text-sm font-medium capitalize transition ${tab === tabKey ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'}`}>
                {t(tabKey)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('status')}</span><div className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${HEALTH_COLORS[selected.health_status]}`}>{selected.health_status}</div></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('connector')}</span><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.connector_display_name}</p></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('totalDeliveries')}</span><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.total_deliveries}</p></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('failureRate')}</span><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.total_deliveries > 0 ? `${((selected.total_failures / selected.total_deliveries) * 100).toFixed(1)}%` : '—'}</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('lastTriggered')}</span><p className="text-sm text-gray-700 dark:text-slate-300">{formatDate(selected.last_triggered_at)}</p></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('lastSuccess')}</span><p className="text-sm text-gray-700 dark:text-slate-300">{formatDate(selected.last_success_at)}</p></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('lastFailure')}</span><p className="text-sm text-gray-700 dark:text-slate-300">{formatDate(selected.last_failure_at)}</p></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => testMutation.mutate(selected.id)} disabled={testMutation.isPending || !selected.enabled}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">
                    {testMutation.isPending ? t('sending') : t('testIntegration')}
                  </button>
                  <button onClick={() => toggleMutation.mutate({ id: selected.id, enabled: !selected.enabled })}
                    className={`px-4 py-2 rounded-lg text-sm ${selected.enabled ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400'}`}>
                    {selected.enabled ? t('disable') : t('enable')}
                  </button>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {tab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <select value={eventStatusFilter} onChange={e => setEventStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                    <option value="">{t('allStatuses')}</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="filtered">Filtered</option>
                  </select>
                  <button onClick={() => queryClient.invalidateQueries({ queryKey: ['integration-events', selectedId] })}
                    className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">↻ {t('refresh')}</button>
                </div>
                {events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-slate-400">{t('noEvents')}</div>
                ) : (
                  <div className="glass-card overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-xs text-gray-500 dark:text-slate-400 uppercase border-b border-gray-100 dark:border-slate-700">
                        <th className="px-4 py-3">{t('event')}</th><th className="px-4 py-3">{t('status')}</th><th className="px-4 py-3">{t('attempts')}</th><th className="px-4 py-3">{t('duration')}</th><th className="px-4 py-3">{t('error')}</th><th className="px-4 py-3">{t('time')}</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {events.map(ev => (
                          <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-2 font-mono text-xs">{ev.event_type}</td>
                            <td className="px-4 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[ev.status] || ''}`}>{ev.status}</span></td>
                            <td className="px-4 py-2 text-gray-600 dark:text-slate-400">{ev.attempts}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-slate-400">{formatDuration(ev.duration_ms)}</td>
                            <td className="px-4 py-2 text-red-500 text-xs max-w-[200px] truncate">{ev.error_message || '—'}</td>
                            <td className="px-4 py-2 text-xs text-gray-500 dark:text-slate-400">{formatDate(ev.created_at)}</td>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4"><span className="text-xs text-gray-500 dark:text-slate-400">{t('totalEvents')}</span><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_events}</p></div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10"><span className="text-xs text-green-600 dark:text-green-400">{t('delivered')}</span><p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.delivered}</p></div>
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10"><span className="text-xs text-red-600 dark:text-red-400">{t('failed')}</span><p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.failed}</p></div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10"><span className="text-xs text-blue-600 dark:text-blue-400">{t('successRate')}</span><p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.success_rate.toFixed(1)}%</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4"><span className="text-xs text-gray-500 dark:text-slate-400">{t('pending')}</span><p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p></div>
                  <div className="glass-card p-4"><span className="text-xs text-gray-500 dark:text-slate-400">{t('filtered')}</span><p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.filtered}</p></div>
                  <div className="glass-card p-4"><span className="text-xs text-gray-500 dark:text-slate-400">{t('avgDuration')}</span><p className="text-xl font-semibold text-gray-900 dark:text-white">{formatDuration(stats.avg_duration_ms)}</p></div>
                  <div className="glass-card p-4"><span className="text-xs text-gray-500 dark:text-slate-400">{t('last24h')}</span><p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.last_24h_events} <span className="text-sm text-red-500">({stats.last_24h_failures} {t('failed')})</span></p></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteIntegration')}
        message={t('deleteConfirm')}
        variant="danger"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
