'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/store';
import { streamApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

const CHANNEL_TYPES = [
  { value: 'sse', icon: '📡', label: 'SSE (Server-Sent Events)' },
  { value: 'websocket', icon: '🔌', label: 'WebSocket' },
  { value: 'webhook', icon: '🪝', label: 'Webhook' },
];

const MAX_LIVE_EVENTS = 100;

export default function StreamingPage() {
  const t = useTranslations('streaming');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'messages' | 'subscriptions'>('overview');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [publishEventType, setPublishEventType] = useState('test.event');
  const [publishPayload, setPublishPayload] = useState('{\n  "message": "Test event"\n}');

  // Live feed
  const [liveEvents, setLiveEvents] = useState<Array<{ type: string; data: unknown; time: Date }>>([]);
  const [isLive, setIsLive] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('sse');
  const [formFilter, setFormFilter] = useState('');

  // Queries
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['stream-channels'],
    queryFn: () => streamApi.listChannels(token!),
    enabled: !!token,
  });

  const { data: channelDetail } = useQuery({
    queryKey: ['stream-channel', selectedId],
    queryFn: () => streamApi.getChannel(token!, selectedId!),
    enabled: !!token && !!selectedId,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['stream-subscriptions'],
    queryFn: () => streamApi.listSubscriptions(token!),
    enabled: !!token && tab === 'subscriptions',
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; channel_type?: string; event_filter?: string[] }) =>
      streamApi.createChannel(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-channels'] });
      resetForm();
      toast(t('channelCreated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; event_filter?: string[]; enabled?: boolean } }) =>
      streamApi.updateChannel(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-channels'] });
      setEditTarget(null);
      toast(t('channelUpdated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => streamApi.deleteChannel(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-channels'] });
      setSelectedId(null);
      toast(t('channelDeleted'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      streamApi.updateChannel(token!, id, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-channels'] });
      toast(t('channelUpdated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const publishMutation = useMutation({
    mutationFn: ({ channelId, eventType, payload }: { channelId: string; eventType: string; payload: Record<string, unknown> }) =>
      streamApi.publish(token!, { channel_id: channelId, event_type: eventType, payload }),
    onSuccess: (data) => {
      toast(t('publishedTo', { count: data.delivered_to }), 'success');
      setShowPublish(false);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => streamApi.disconnectSubscription(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stream-subscriptions'] });
      toast(t('subscriptionDisconnected'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  const resetForm = () => {
    setShowCreate(false);
    setEditTarget(null);
    setFormName('');
    setFormDesc('');
    setFormType('sse');
    setFormFilter('');
  };

  const openEdit = (ch: typeof channels[0]) => {
    setEditTarget(ch.id);
    setFormName(ch.name);
    setFormDesc(ch.description ?? '');
    setFormType(ch.channel_type);
    setFormFilter(ch.event_filter?.join(', ') ?? '');
    setShowCreate(false);
  };

  const handleCreateOrUpdate = () => {
    if (!formName.trim()) { toast(t('nameRequired'), 'error'); return; }
    const filter = formFilter ? formFilter.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const data = { name: formName, description: formDesc || undefined, event_filter: filter };

    if (editTarget) {
      updateMutation.mutate({ id: editTarget, data });
    } else {
      createMutation.mutate({ ...data, channel_type: formType });
    }
  };

  const startLive = (channelId: string) => {
    if (isLive || esRef.current) return;
    setIsLive(true);
    setLiveEvents([]);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app';
    const url = `${baseUrl}/v1/stream/channels/${channelId}/subscribe`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.addEventListener('connected', (e) => {
      setLiveEvents(prev => [...prev.slice(-(MAX_LIVE_EVENTS - 1)), { type: 'connected', data: JSON.parse(e.data), time: new Date() }]);
    });

    es.addEventListener('heartbeat', () => {});

    es.onmessage = (e) => {
      setLiveEvents(prev => [...prev.slice(-(MAX_LIVE_EVENTS - 1)), { type: 'event', data: JSON.parse(e.data), time: new Date() }]);
    };

    es.onerror = () => {
      setIsLive(false);
      es.close();
      esRef.current = null;
    };
  };

  const stopLive = () => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setIsLive(false);
  };

  const handlePublish = () => {
    if (!selectedId) return;
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(publishPayload);
    } catch {
      toast(t('invalidJson'), 'error');
      return;
    }
    publishMutation.mutate({ channelId: selectedId, eventType: publishEventType, payload });
  };

  const selected = channels.find(c => c.id === selectedId);

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
          + {t('newChannel')}
        </button>
      </div>

      {/* How it works */}
      <div className="glass-card p-6 bg-linear-to-r from-brand-50 to-purple-50 dark:from-brand-500/5 dark:to-purple-500/5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('howItWorks')}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">{t('step1')}</span>
          <span>→</span>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">{t('step2')}</span>
          <span>→</span>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">{t('step3')}</span>
          <span>→</span>
          <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-xs">{t('step4')}</span>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={resetForm} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{editTarget ? t('editChannel') : t('createChannel')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('createChannelDesc')}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t('namePlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('type')}</label>
                  <select value={formType} onChange={e => setFormType(e.target.value)} disabled={!!editTarget}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm disabled:opacity-50">
                    {CHANNEL_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.icon} {ct.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('description')}</label>
                <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder={t('descriptionPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {t('eventFilter')} <span className="normal-case tracking-normal font-normal text-gray-400">{t('eventFilterHint')}</span>
                </label>
                <input value={formFilter} onChange={e => setFormFilter(e.target.value)} placeholder={t('eventFilterPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={resetForm} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
              <button onClick={handleCreateOrUpdate} disabled={createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
                {(createMutation.isPending || updateMutation.isPending) ? tc('creating') : editTarget ? t('saveChanges') : t('createChannelBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublish && selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowPublish(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('publishTest')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('publishDesc')}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('eventType')}</label>
                <input value={publishEventType} onChange={e => setPublishEventType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('payload')}</label>
                <textarea value={publishPayload} onChange={e => setPublishPayload(e.target.value)} rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowPublish(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
              <button onClick={handlePublish} disabled={publishMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                {publishMutation.isPending ? t('publishing') : t('publishBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channels List */}
      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">📡</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noChannels')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('noChannelsDesc')}</p>
          <button onClick={() => setShowCreate(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
            + {t('newChannel')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map(ch => (
            <div key={ch.id}
              className={`glass-card p-5 cursor-pointer hover:shadow-md transition ${selectedId === ch.id ? 'ring-2 ring-brand-500' : ''}`}
              onClick={() => { setSelectedId(selectedId === ch.id ? null : ch.id); setTab('overview'); stopLive(); }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ch.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {CHANNEL_TYPES.find(ct => ct.value === ch.channel_type)?.icon} {ch.channel_type.toUpperCase()}
                  </span>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleMutation.mutate({ id: ch.id, enabled: !ch.enabled }); }}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${ch.enabled ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {ch.enabled ? t('live') : t('off')}
                </button>
              </div>
              {ch.description && <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{ch.description}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                <span>{ch.current_subscribers} {t('subscribers')}</span>
                <span>·</span>
                <span>{ch.total_messages} {t('messages')}</span>
              </div>
              {ch.event_filter && ch.event_filter.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {ch.event_filter.slice(0, 3).map(ev => (
                    <span key={ev} className="px-1.5 py-0.5 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded font-mono">{ev}</span>
                  ))}
                  {ch.event_filter.length > 3 && <span className="px-1.5 py-0.5 text-xs text-gray-400">+{ch.event_filter.length - 3}</span>}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-slate-400">{formatDate(ch.created_at)}</span>
                <div className="flex gap-1">
                  <button onClick={e => { e.stopPropagation(); openEdit(ch); }} title={t('edit')} className="text-gray-500 dark:text-slate-400 hover:text-brand-600 transition p-1.5 text-sm">✏️</button>
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget(ch.id); }} title={t('delete')} className="text-gray-500 dark:text-slate-400 hover:text-red-600 transition p-1.5 text-sm">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && channelDetail && (
        <div className="glass-card overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-slate-700">
            {(['overview', 'messages', 'subscriptions'] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={`px-6 py-3 text-sm font-medium capitalize transition ${tab === tabKey ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'}`}>
                {t(tabKey === 'overview' ? 'overview' : tabKey === 'messages' ? 'messageTab' : 'subscriptions')}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('type')}</span><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.channel_type.toUpperCase()}</p></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('subscribers')}</span><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.current_subscribers}/{selected.max_subscribers}</p></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('totalMessages')}</span><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.total_messages}</p></div>
                  <div><span className="text-xs text-gray-500 dark:text-slate-400">{t('status')}</span><p className={`text-sm font-medium ${selected.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>{selected.enabled ? t('live') : t('disabled')}</p></div>
                </div>

                <div className="flex gap-2 pt-2">
                  {!isLive ? (
                    <button onClick={() => startLive(selected.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">{t('startLive')}</button>
                  ) : (
                    <button onClick={stopLive} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">{t('stop')}</button>
                  )}
                  <button onClick={() => setShowPublish(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">{t('publishTest')}</button>
                </div>

                {/* Live Event Feed */}
                {isLive && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('liveEventFeed')}</h4>
                      <span className="text-xs text-gray-500 dark:text-slate-400">{liveEvents.length} {t('events')}</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
                      {liveEvents.length === 0 ? (
                        <div className="text-gray-500">{t('waitingForEvents')}</div>
                      ) : (
                        liveEvents.map((ev, i) => (
                          <div key={i} className={`mb-1 ${ev.type === 'connected' ? 'text-green-400' : 'text-blue-300'}`}>
                            <span className="text-gray-500">{ev.time.toLocaleTimeString()}</span>{' '}
                            <span className="text-yellow-400">[{ev.type}]</span>{' '}
                            {JSON.stringify(ev.data)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {tab === 'messages' && (
              <div className="space-y-3">
                {channelDetail.recent_messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-slate-400">{t('noMessagesYet')}</div>
                ) : (
                  <div className="space-y-2">
                    {channelDetail.recent_messages.map(msg => (
                      <div key={msg.id} className="glass-card p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-brand-600 dark:text-brand-400">{msg.event_type}</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">{formatDate(msg.created_at)}</span>
                        </div>
                        <pre className="text-xs text-gray-600 dark:text-slate-400 overflow-x-auto">{JSON.stringify(msg.payload, null, 2)}</pre>
                        <span className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t('deliveredTo', { count: msg.delivered_count })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subscriptions */}
            {tab === 'subscriptions' && (
              <div className="space-y-3">
                {subscriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-slate-400">{t('noActiveSubscriptions')}</div>
                ) : (
                  <div className="glass-card overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-xs text-gray-500 dark:text-slate-400 uppercase border-b border-gray-100 dark:border-slate-700">
                        <th className="px-4 py-3">{t('type')}</th><th className="px-4 py-3">{t('client')}</th><th className="px-4 py-3">{t('messages')}</th><th className="px-4 py-3">{t('connected')}</th><th className="px-4 py-3">{t('actions')}</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {subscriptions.map(sub => (
                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-2">{sub.connection_type.toUpperCase()}</td>
                            <td className="px-4 py-2 font-mono text-xs">{sub.client_id || '—'}</td>
                            <td className="px-4 py-2">{sub.messages_sent}</td>
                            <td className="px-4 py-2 text-xs">{formatDate(sub.connected_at)}</td>
                            <td className="px-4 py-2">
                              <button onClick={() => disconnectMutation.mutate(sub.id)} className="text-xs text-red-500 hover:text-red-700">{t('disconnect')}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteChannel')}
        message={t('deleteConfirmMsg')}
        variant="danger"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
