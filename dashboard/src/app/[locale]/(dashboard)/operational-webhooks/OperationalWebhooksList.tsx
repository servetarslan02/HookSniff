'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { operationalWebhooksApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ClipboardList, Inbox, Pencil, Trash2 } from 'lucide-react';

const OP_EVENTS = [
  { id: 'delivery.failed', label: 'Delivery Failed', desc: 'When a webhook delivery fails after all retries' },
  { id: 'endpoint.disabled', label: 'Endpoint Disabled', desc: 'When an endpoint is auto-disabled due to failures' },
];

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default function OperationalWebhooksList() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('opWebhooks');
  const tc = useTranslations('common');
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEvents, setNewEvents] = useState<string[]>(['delivery.failed', 'endpoint.disabled']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEvents, setEditEvents] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

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
    mutationFn: (data: { url: string; description?: string; event_types?: string[] }) =>
      operationalWebhooksApi.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['op-webhooks'] });
      setShowCreate(false); setNewUrl(''); setNewDesc(''); setNewEvents(['delivery.failed', 'endpoint.disabled']);
      toast(t('created'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { url?: string; description?: string; is_active?: boolean; event_types?: string[] } }) =>
      operationalWebhooksApi.update(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['op-webhooks'] });
      setEditTarget(null);
      toast(t('updated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => operationalWebhooksApi.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['op-webhooks'] });
      if (selectedId) setSelectedId(null);
      toast(t('deleted'), 'info');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const toggleEvent = (eventId: string, events: string[], setter: (v: string[]) => void) => {
    setter(events.includes(eventId) ? events.filter(e => e !== eventId) : [...events, eventId]);
  };

  const handleEdit = (ep: { id: string; url: string; description: string | null; event_types: string[] | null }) => {
    setEditTarget(ep.id);
    setEditUrl(ep.url);
    setEditDesc(ep.description ?? '');
    setEditEvents(ep.event_types ?? []);
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    updateMutation.mutate({
      id: editTarget,
      data: { url: editUrl, description: editDesc || undefined, event_types: editEvents.length > 0 ? editEvents : undefined },
    });
  };

  const handleToggle = (ep: { id: string; is_active: boolean }) => {
    updateMutation.mutate({ id: ep.id, data: { is_active: !ep.is_active } });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button onClick={() => { setShowCreate(true); setEditTarget(null); }} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          + {t('newEndpoint')}
        </button>
      </div>


      {/* Create form */}
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('createEndpoint')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">URL</label>
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com/webhooks"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('description')}</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder={t('descriptionPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('eventTypes')}</label>
            <div className="flex flex-wrap gap-2">
              {OP_EVENTS.map(ev => (
                <button key={ev.id} type="button" onClick={() => toggleEvent(ev.id, newEvents, setNewEvents)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition ${newEvents.includes(ev.id) ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300'}`}>
                  <div className="font-medium">{ev.label}</div>
                  <div className="text-xs opacity-70">{ev.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { if (newUrl.trim()) createMutation.mutate({ url: newUrl, description: newDesc || undefined, event_types: newEvents.length > 0 ? newEvents : undefined }); }}
              disabled={createMutation.isPending} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">
              {createMutation.isPending ? tc('creating') : t('create')}
            </button>
            <button onClick={() => setShowCreate(false)} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition">{tc('cancel')}</button>
          </div>
        </div>
      )}

      {/* Endpoints list */}
      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
        </div>
      ) : endpoints.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🪝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noEndpoints')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('noEndpointsDesc')}</p>
          <button onClick={() => setShowCreate(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
            + {t('newEndpoint')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {endpoints.map(ep => {
            const isEditing = editTarget === ep.id;
            return (
              <div key={ep.id} className={`glass-card p-5 transition ${selectedId === ep.id ? 'ring-2 ring-brand-500' : ''} ${isEditing ? 'ring-2 ring-brand-500' : ''}`}>
                <div className="cursor-pointer" onClick={() => !isEditing && setSelectedId(selectedId === ep.id ? null : ep.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm break-all">{ep.url}</h3>
                      {ep.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{ep.description}</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleToggle(ep); }}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 whitespace-nowrap ${ep.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {ep.is_active ? t('active') : t('inactive')}
                    </button>
                  </div>
                  {ep.event_types && ep.event_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ep.event_types.map(et => <span key={et} className="px-1.5 py-0.5 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded font-mono">{et}</span>)}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-2">{formatDate(ep.created_at)}</div>
                </div>

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <button onClick={() => handleEdit(ep)} title={t('edit')} className="text-gray-500 dark:text-slate-400 hover:text-brand-600 transition p-1.5 text-sm"><Pencil size={18} strokeWidth={1.75} /></button>
                  <button onClick={() => setDeleteTarget(ep.id)} title={t('delete')} className="text-gray-500 dark:text-slate-400 hover:text-red-600 transition p-1.5 text-sm"><Trash2 size={18} strokeWidth={1.75} /></button>
                  <button onClick={() => setSelectedId(selectedId === ep.id ? null : ep.id)} title={t('deliveries')}
                    className={`ml-auto text-xs px-2.5 py-1 rounded-lg transition ${selectedId === ep.id ? 'bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                    <ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" /> {t('deliveries')}
                  </button>
                </div>

                {/* Edit form inline */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">URL</label>
                      <input value={editUrl} onChange={e => setEditUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('description')}</label>
                      <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('eventTypes')}</label>
                      <div className="flex flex-wrap gap-2">
                        {OP_EVENTS.map(ev => (
                          <button key={ev.id} type="button" onClick={() => toggleEvent(ev.id, editEvents, setEditEvents)}
                            className={`px-2 py-1.5 rounded-lg border text-xs transition ${editEvents.includes(ev.id) ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400' : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400'}`}>
                            {ev.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleUpdate} disabled={updateMutation.isPending} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">{t('save')}</button>
                      <button onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delivery log */}
      {selectedId && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('deliveryLog')}</h3>
          </div>
          {deliveries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex justify-center mb-2 text-gray-400"><Inbox size={28} strokeWidth={1.5} /></div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('noDeliveries')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {deliveries.map(d => (
                <div key={d.id}>
                  <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
                    onClick={() => setExpandedDelivery(expandedDelivery === d.id ? null : d.id)}>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${d.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : d.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'}`}>
                        {d.status}
                      </span>
                      <span className="text-sm font-mono text-gray-700 dark:text-slate-300">{d.event_type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                      <span>{t('response')}: {d.response_status ?? '—'}</span>
                      <span>{t('attempts')}: {d.attempt_count}</span>
                      <span>{formatDate(d.created_at)}</span>
                      <span className="text-gray-400">{expandedDelivery === d.id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {expandedDelivery === d.id && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700">
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">{t('payload')}</label>
                      <pre className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono overflow-x-auto text-gray-800 dark:text-slate-300 max-h-48">
                        {JSON.stringify(d.payload, null, 2)}
                      </pre>
                      {d.delivered_at && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{t('deliveredAt')}: {formatDate(d.delivered_at)}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteEndpoint')}
        message={t('deleteConfirm')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
