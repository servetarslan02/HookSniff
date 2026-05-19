'use client';

import { useTranslations } from 'next-intl';
import { Database, Inbox, AlertTriangle, Circle } from 'lucide-react';

interface QueueStatusData {
  pending?: number;
  processing?: number;
  failed?: number;
  total?: number;
  failed_last_hour?: number;
  oldest_pending_at?: string | null;
}

interface QueueStatusProps {
  queueStatus: QueueStatusData | undefined;
  dbSize: string | undefined;
  queueDetail?: { pending?: number; processing?: number; failed_last_hour?: number };
  recentErrors?: Array<{ id?: string; event?: string; error?: string; created_at?: string }>;
  locale: string;
}

export default function QueueStatusSection({ queueStatus, dbSize, queueDetail, recentErrors, locale }: QueueStatusProps) {
  const t = useTranslations('admin');

  return (
    <>
      {/* DB Size + Queue Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dbSize && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2"><Database size={18} strokeWidth={1.75} className="inline mr-1" />{t('databaseSize') || 'Database Size'}</h2>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{dbSize}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('currentDbUsage') || 'Current database usage'}</p>
          </div>
        )}
        {queueDetail && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2"><Inbox size={18} strokeWidth={1.75} className="inline mr-1" />{t('queueDetails') || 'Queue Details'}</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t('pending') || 'Pending'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{queueDetail.pending ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t('processing') || 'Processing'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{queueDetail.processing ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{t('failedLastHour') || 'Failed (1h)'}</span>
                <span className={`font-medium ${(queueDetail.failed_last_hour ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {queueDetail.failed_last_hour ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Error Logs */}
      {recentErrors && recentErrors.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><Circle size={18} strokeWidth={1.75} className="inline mr-1 text-red-500 fill-red-500" />{t('recentErrors') || 'Recent Errors'}</h2>
          </div>
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {recentErrors.map((err) => (
              <div key={err.id} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{err.event || '—'}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{err.error || 'Unknown error'}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(err.created_at ?? "").toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Status */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><Inbox size={18} strokeWidth={1.75} className="inline mr-1" />{t('queueStatus') || 'Queue Status'}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('queueStatusDesc') || 'Webhook delivery queue depth'}</p>
          </div>
        </div>
        {queueStatus ? (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t('queuePending'), value: queueStatus.pending, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
                { label: t('queueProcessing'), value: queueStatus.processing, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: t('queueFailed'), value: queueStatus.failed, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
                { label: t('queueTotal'), value: queueStatus.total, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-50 dark:bg-slate-800' },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-4 ${item.bg}`}>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{item.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${item.color}`}>{(item.value ?? 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
            {(queueStatus.failed_last_hour ?? 0) > 0 && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400"><AlertTriangle size={14} strokeWidth={1.75} className="inline mr-0.5" />{t('failedInLastHour', { count: queueStatus.failed_last_hour ?? 0 })}</p>
            )}
            {queueStatus.oldest_pending_at && (
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{t('oldestPending')}: {new Date(queueStatus.oldest_pending_at).toLocaleString()}</p>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">{t('noData') || 'No data'}</div>
        )}
      </div>
    </>
  );
}
