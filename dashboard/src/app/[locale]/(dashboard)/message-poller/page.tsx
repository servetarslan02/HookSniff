'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { messagePollerApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Inbox } from 'lucide-react';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default function MessagePollerPage() {
  const t = useTranslations('messagePoller');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [consumerId, setConsumerId] = useState('default');
  const [limit, setLimit] = useState(50);
  const [eventType, setEventType] = useState('');
  const [includePayload, setIncludePayload] = useState(true);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [commitTarget, setCommitTarget] = useState<string | null>(null);
  const [seekTarget, setSeekTarget] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['message-poller', consumerId, limit, eventType, includePayload],
    queryFn: () =>
      messagePollerApi.poll(token!, {
        consumer_id: consumerId,
        limit,
        event_type: eventType || undefined,
        include_payload: includePayload,
      }),
    enabled: !!token && !!consumerId,
  });

  const commitMutation = useMutation({
    mutationFn: (messageId: string) =>
      messagePollerApi.commit(token!, { consumer_id: consumerId, message_id: messageId }),
    onSuccess: () => {
      toast(t('cursorCommitted'), 'success');
      queryClient.invalidateQueries({ queryKey: ['message-poller'] });
      refetch();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const seekMutation = useMutation({
    mutationFn: (messageId: string) =>
      messagePollerApi.seek(token!, { consumer_id: consumerId, message_id: messageId }),
    onSuccess: () => {
      toast(t('cursorSeeked'), 'success');
      queryClient.invalidateQueries({ queryKey: ['message-poller'] });
      refetch();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const handleCommit = () => {
    if (!commitTarget) return;
    commitMutation.mutate(commitTarget);
    setCommitTarget(null);
  };

  const handleSeek = () => {
    if (!seekTarget) return;
    seekMutation.mutate(seekTarget);
    setSeekTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>


      {/* Config Panel */}
      <div className="glass-card p-4 sm:p-6 space-y-3 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{t('pollConfig')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('consumerId')}</label>
            <input value={consumerId} onChange={e => setConsumerId(e.target.value)} placeholder={t('consumerPlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('limit')}</label>
            <input type="number" value={limit} onChange={e => setLimit(Math.min(200, Math.max(1, Number(e.target.value))))} min={1} max={200}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('eventType')}</label>
            <input value={eventType} onChange={e => setEventType(e.target.value)} placeholder={t('eventTypePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includePayload} onChange={e => setIncludePayload(e.target.checked)} className="w-4 h-4 text-brand-600 rounded" />
              <span className="text-sm text-gray-700 dark:text-slate-300">{t('includePayload')}</span>
            </label>
          </div>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">
          {isFetching ? t('polling') : t('poll')}
        </button>
      </div>

      {/* Cursor Info */}
      {data?.cursor && (
        <div className="glass-card p-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('cursorPosition')}</h4>
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <span>{t('consumer')}: <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{data.cursor.consumer_id}</code></span>
            <span>{t('lastMessage')}: <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{data.cursor.last_message_id ?? '—'}</code></span>
            <span>{t('sequence')}: <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{data.cursor.last_sequence_num}</code></span>
            <span>{t('done')}: <code className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{data.done ? t('yes') : t('no')}</code></span>
          </div>
        </div>
      )}

      {/* Messages */}
      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{t('loading')}</p>
        </div>
      ) : !data || data.messages.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4"><Inbox size={18} strokeWidth={1.75} /></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noMessages')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            {data?.done ? t('allCaughtUp') : t('pollToFetch')}
          </p>
          <button onClick={() => refetch()} disabled={isFetching}
            className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-50">
            {t('poll')}
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('messages')} ({data.messages.length})</h3>
            {data.done && <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full">{t('allCaughtUp')}</span>}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {data.messages.map(msg => (
              <div key={msg.id}>
                <div className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  onClick={() => setExpandedMsg(expandedMsg === msg.id ? null : msg.id)}>
                  {/* Status badge */}
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${
                    msg.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                    msg.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                  }`}>
                    {msg.status}
                  </span>

                  {/* Event type */}
                  {msg.event_type && (
                    <span className="px-2 py-0.5 text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 rounded font-mono">
                      {msg.event_type}
                    </span>
                  )}

                  {/* ID */}
                  <span className="text-xs font-mono text-gray-500 dark:text-slate-400 truncate max-w-[100px]">{msg.id}</span>

                  {/* Meta */}
                  <div className="ml-auto flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
                    <span>{t('attempts')}: {msg.attempt_count}</span>
                    {msg.response_status && <span>{msg.response_status}</span>}
                    <span>{formatDate(msg.created_at)}</span>
                    <span className="text-gray-400">{expandedMsg === msg.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedMsg === msg.id && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 space-y-3">
                    {/* Payload */}
                    {msg.payload && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('payload')}</label>
                        <pre className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono overflow-x-auto text-gray-800 dark:text-slate-300 max-h-48">
                          {JSON.stringify(msg.payload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setCommitTarget(msg.id); }}
                        className="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/20 transition">
                        {t('commit')}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setSeekTarget(msg.id); }}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/20 transition">
                        {t('seek')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commit confirmation */}
      <ConfirmDialog
        open={commitTarget !== null}
        title={t('commitTitle')}
        message={t('commitConfirm')}
        variant="default"
        onConfirm={handleCommit}
        onCancel={() => setCommitTarget(null)}
      />

      {/* Seek confirmation */}
      <ConfirmDialog
        open={seekTarget !== null}
        title={t('seekTitle')}
        message={t('seekConfirm')}
        variant="default"
        onConfirm={handleSeek}
        onCancel={() => setSeekTarget(null)}
      />
    </div>
  );
}
