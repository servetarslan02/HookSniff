'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { PlaygroundRequest } from '../types';

export function HistoryPanel({
  history,
  onSelect,
  onClear,
}: {
  history: PlaygroundRequest[];
  onSelect: (req: PlaygroundRequest) => void;
  onClear: () => void;
}) {
  const t = useTranslations('playground');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [confirmClear, setConfirmClear] = useState(false);

  if (history.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('requestHistory')}</h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">📜</div>
          <p className="text-xs text-gray-500 dark:text-slate-500">{t('noRequests')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('requestHistory')} ({history.length})</h3>
        {!confirmClear ? (
          <button type="button" onClick={() => setConfirmClear(true)}
            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 transition">
            {t('clear')}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-400">{t('confirmClear')}</span>
            <button type="button" onClick={() => { onClear(); setConfirmClear(false); }}
              className="text-xs text-red-600 font-medium hover:text-red-700 transition">{tc('yes')}</button>
            <button type="button" onClick={() => setConfirmClear(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 transition">{tc('no')}</button>
          </div>
        )}
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {history.map((req) => (
          <button
            key={req.id}
            onClick={() => onSelect(req)}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    req.method === 'GET'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : req.method === 'POST'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                        : req.method === 'DELETE'
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {req.method}
                </span>
                <span className="text-xs font-mono text-gray-600 dark:text-slate-400 truncate max-w-[140px]">
                  {req.path}
                </span>
              </div>
              <span
                className={`text-xs font-mono ${
                  req.status && req.status < 400
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {req.status ?? '—'}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 dark:text-slate-500 mt-1">
              {new Date(req.timestamp).toLocaleString(locale)} • {req.duration_ms}ms
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
