'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { messagePollerApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString();
}

export default function MessagePollerPage() {
  const t = useTranslations('messagePoller');
  const { token } = useAuth();
  const { toast } = useToast();
  const [consumerId, setConsumerId] = useState('default');
  const [limit, setLimit] = useState(50);
  const [eventType, setEventType] = useState('');
  const [includePayload, setIncludePayload] = useState(true);

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
      refetch();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const seekMutation = useMutation({
    mutationFn: (messageId: string) =>
      messagePollerApi.seek(token!, { consumer_id: consumerId, message_id: messageId }),
    onSuccess: () => {
      toast(t('cursorSeeked'), 'success');
      refetch();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      {/* Config Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-3 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{t('pollConfig')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('consumerId')}</label>
            <input
              value={consumerId}
              onChange={e => setConsumerId(e.target.value)}
              placeholder={t('consumerPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('limit')}</label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(Math.min(200, Math.max(1, Number(e.target.value))))}
              min={1}
              max={200}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('eventType')}</label>
            <input
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              placeholder={t('eventTypePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePayload}
                onChange={e => setIncludePayload(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('includePayload')}</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isFetching ? t('polling') : t('poll')}
          </button>
        </div>
      </div>

      {/* Cursor Info */}
      {data?.cursor && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('cursorPosition')}</h4>
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>{t('consumer')}: <code className="font-mono">{data.cursor.consumer_id}</code></span>
            <span>{t('lastMessage')}: <code className="font-mono">{data.cursor.last_message_id ?? '—'}</code></span>
            <span>{t('sequence')}: <code className="font-mono">{data.cursor.last_sequence_num}</code></span>
            <span>{t('done')}: <code className="font-mono">{data.done ? t('yes') : t('no')}</code></span>
          </div>
        </div>
      )}

      {/* Messages */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('loading')}</div>
      ) : !data || data.messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('noMessages')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {data?.done ? t('allCaughtUp') : t('pollToFetch')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('id')}</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('event')}</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">{t('status')}</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">{t('attempts')}</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">{t('response')}</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">{t('created')}</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.messages.map(msg => (
                <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white max-w-[120px] truncate">
                    {msg.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {msg.event_type ? (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                        {msg.event_type}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      msg.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      msg.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{msg.attempt_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{msg.response_status ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(msg.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => commitMutation.mutate(msg.id)}
                        disabled={commitMutation.isPending}
                        className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      >
                        {t('commit')}
                      </button>
                      <button
                        onClick={() => seekMutation.mutate(msg.id)}
                        disabled={seekMutation.isPending}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {t('seek')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payload Preview */}
      {includePayload && data?.messages.some(m => m.payload) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('payloadPreview')}</h4>
          <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto max-h-48">
            {JSON.stringify(data.messages[0]?.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
