'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FailedDelivery {
  id: string;
  customer_email?: string;
  endpoint_url?: string;
  event_type?: string;
  attempt_count: number;
  error_message?: string;
  response_status?: number;
  created_at: string;
}

interface FailedTableProps {
  failedDeliveries: FailedDelivery[];
  selectedFailed: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onBatchReplay: () => void;
  isReplaying: boolean;
}

export default function FailedTable({
  failedDeliveries,
  selectedFailed,
  onToggleSelect,
  onToggleSelectAll,
  onBatchReplay,
  isReplaying,
}: FailedTableProps) {
  const t = useTranslations('admin');

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">❌ {t('failedDeliveries') || 'Failed Deliveries'} (24h)</h2>
        {failedDeliveries.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedFailed.size > 0 && (
              <button
                onClick={onBatchReplay}
                disabled={isReplaying}
                className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {isReplaying ? (t('replaying') || 'Replaying...') : `↩ ${t('replaySelected') || 'Replay Selected'} (${selectedFailed.size})`}
              </button>
            )}
            <button
              onClick={onToggleSelectAll}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            >
              {selectedFailed.size === failedDeliveries.length ? (t('deselectAll') || 'Deselect All') : (t('selectAll') || 'Select All')}
            </button>
          </div>
        )}
      </div>
      {failedDeliveries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th scope="col" className="px-4 py-3 text-left"><input type="checkbox" checked={selectedFailed.size === failedDeliveries.length && failedDeliveries.length > 0} onChange={onToggleSelectAll} className="rounded-sm" /></th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('user') || 'User'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('endpoint') || 'Endpoint'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('event') || 'Event'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('attempts') || 'Attempts'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('error') || 'Error'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('time') || 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {failedDeliveries.map((d) => (
                <tr key={d.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${selectedFailed.has(d.id) ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : ''}`}>
                  <td className="px-4 py-3"><input type="checkbox" checked={selectedFailed.has(d.id)} onChange={() => onToggleSelect(d.id)} className="rounded-sm" /></td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{d.customer_email || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400 max-w-[200px] truncate">{d.endpoint_url || '—'}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">{d.event_type || '—'}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{d.attempt_count}</td>
                  <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400 max-w-[200px] truncate">{d.error_message || (d.response_status ? `HTTP ${d.response_status}` : '—')}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">✅ {t('noFailedDeliveries') || 'No failed deliveries in the last 24h'}</div>
      )}
    </div>
  );
}
