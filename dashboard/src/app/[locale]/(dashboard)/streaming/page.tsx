'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { streamApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

const CHANNEL_TYPES = [
  { value: 'sse', icon: '📡', label: 'SSE (Server-Sent Events)' },
  { value: 'websocket', icon: '🔌', label: 'WebSocket' },
  { value: 'webhook', icon: '🪝', label: 'Webhook' },
];

export default function StreamingPage() {
  const t = useTranslations('streaming');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'messages' | 'subscriptions'>('overview');
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);

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
    mutationFn: ({ channelId, eventType, payload }: { channelId: string; eventType: string; payload: any }) =>
      streamApi.publish(token!, { channel_id: channelId, event_type: eventType, payload }),
    onSuccess: (data) => {
      toast(t('publishedTo', { count: data.delivered_to }), 'success');
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

  const resetForm = () => {
    setShowCreate(false);
    setFormName('');
    setFormDesc('');
    setFormType('sse');
    setFormFilter('');
  };

  const startLive = (channelId: string) => {
    if (isLive) return;
    setIsLive(true);
    setLiveEvents([]);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.hooksniff-1046140057667.europe-west1.run.app';
    const url = `${baseUrl}/v1/stream/channels/${channelId}/subscribe`;
    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener('connected', (e) => {
      setLiveEvents((prev) => [...prev, { type: 'connected', data: JSON.parse(e.data), time: new Date() }]);
    });

    es.addEventListener('heartbeat', () => {});

    es.onmessage = (e) => {
      setLiveEvents((prev) => [...prev, { type: 'event', data: JSON.parse(e.data), time: new Date() }]);
    };

    es.onerror = () => {
      setIsLive(false);
      es.close();
    };

    // Store for cleanup
    (window as any).__streamEs = es;
  };

  const stopLive = () => {
    const es = (window as any).__streamEs;
    if (es) es.close();
    setIsLive(false);
  };

  const selected = channels.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 sm:px-4 py-2 bg-indigo-600 text-white text-xs sm:text-sm rounded-lg hover:bg-indigo-700 transition"
        >
          {t('newChannel')}
        </button>
      </div>

      {/* Create Channel Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={resetForm} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('createChannel')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('createChannelDesc') || t('subtitle')}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('type')}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  >
                    {CHANNEL_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>{ct.icon} {ct.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('description')}</label>
                <input
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  {t('eventFilter')} <span className="normal-case tracking-normal font-normal text-gray-400">{t('eventFilterHint')}</span>
                </label>
                <input
                  value={formFilter}
                  onChange={(e) => setFormFilter(e.target.value)}
                  placeholder={t('eventFilterPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={resetForm} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (!formName.trim()) { toast(t('nameRequired'), 'error'); return; }
                  createMutation.mutate({
                    name: formName,
                    description: formDesc || undefined,
                    channel_type: formType,
                    event_filter: formFilter ? formFilter.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
                  });
                }}
                disabled={createMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60 shadow-sm"
              >
                {createMutation.isPending ? t('creating') : t('createChannelBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channels List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('loading')}</div>
      ) : channels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📡</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('noChannels')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('noChannelsDesc')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-5 cursor-pointer hover:shadow-md transition ${
                selectedId === ch.id
                  ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => { setSelectedId(selectedId === ch.id ? null : ch.id); setTab('overview'); }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ch.name}</h3>
                  <span className="text-xs text-gray-500">
                    {CHANNEL_TYPES.find((ct) => ct.value === ch.channel_type)?.icon} {ch.channel_type.toUpperCase()}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${ch.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {ch.enabled ? t('live') : t('off')}
                </span>
              </div>
              {ch.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{ch.description}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{ch.current_subscribers} {t('subscribers')}</span>
                <span>·</span>
                <span>{ch.total_messages} {t('messages')}</span>
              </div>
              {ch.event_filter && ch.event_filter.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {ch.event_filter.slice(0, 3).map((ev) => (
                    <span key={ev} className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">{ev}</span>
                  ))}
                  {ch.event_filter.length > 3 && <span className="px-1.5 py-0.5 text-xs text-gray-400">+{ch.event_filter.length - 3}</span>}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">{formatDate(ch.created_at)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMutation.mutate({ id: ch.id, enabled: !ch.enabled }); }}
                    className={`text-xs ${ch.enabled ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                  >
                    {ch.enabled ? t('disable') : t('enable')}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm(t('deleteConfirm'))) deleteMutation.mutate(ch.id); }}
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
      {selected && channelDetail && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['overview', 'messages', 'subscriptions'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-medium capitalize transition ${
                  tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">{t('type')}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.channel_type.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t('subscribers')}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.current_subscribers}/{selected.max_subscribers}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t('totalMessages')}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.total_messages}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t('status')}</span>
                    <p className={`text-sm font-medium ${selected.enabled ? 'text-green-600' : 'text-gray-400'}`}>{selected.enabled ? t('live') : t('disabled')}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {!isLive ? (
                    <button
                      onClick={() => startLive(selected.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      {t('startLive')}
                    </button>
                  ) : (
                    <button
                      onClick={stopLive}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      {t('stop')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const eventType = prompt(t('publishTest') + ':', 'test.event');
                      if (eventType) {
                        publishMutation.mutate({
                          channelId: selected.id,
                          eventType,
                          payload: { message: 'Test event', timestamp: new Date().toISOString() },
                        });
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    {t('publishTest')}
                  </button>
                </div>

                {/* Live Event Feed */}
                {isLive && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('liveEventFeed')}</h4>
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
                  <div className="text-center py-8 text-gray-500">{t('noMessagesYet')}</div>
                ) : (
                  <div className="space-y-2">
                    {channelDetail.recent_messages.map((msg) => (
                      <div key={msg.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{msg.event_type}</span>
                          <span className="text-xs text-gray-500">{formatDate(msg.created_at)}</span>
                        </div>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">{JSON.stringify(msg.payload, null, 2)}</pre>
                        <span className="text-xs text-gray-400 mt-1">{t('deliveredTo', { count: msg.delivered_count })}</span>
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
                  <div className="text-center py-8 text-gray-500">{t('noActiveSubscriptions')}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-2 pr-4">{t('type')}</th>
                          <th className="pb-2 pr-4">{t('client')}</th>
                          <th className="pb-2 pr-4">{t('messages')}</th>
                          <th className="pb-2 pr-4">{t('connected')}</th>
                          <th className="pb-2">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {subscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-2 pr-4">{sub.connection_type.toUpperCase()}</td>
                            <td className="py-2 pr-4 font-mono text-xs">{sub.client_id || '—'}</td>
                            <td className="py-2 pr-4">{sub.messages_sent}</td>
                            <td className="py-2 pr-4 text-xs">{formatDate(sub.connected_at)}</td>
                            <td className="py-2">
                              <button
                                onClick={() => disconnectMutation.mutate(sub.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                {t('disconnect')}
                              </button>
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
    </div>
  );
}
