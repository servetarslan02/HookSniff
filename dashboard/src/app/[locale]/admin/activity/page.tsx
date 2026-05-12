'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi, type AuditLogEntry } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';

/* ─── Hook0-style Admin Activity Log: Basit tablo ─── */

export default function AdminActivityPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const t = useTranslations('admin');
  const locale = useLocale();
  const perPage = 20;

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs(token, {
        limit: perPage,
        offset: (page - 1) * perPage,
        action: filter || undefined,
      });
      setLogs(data.entries || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, page, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('activityLog') || 'Denetim Günlüğü'}</h2>
        <input
          type="text"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          placeholder={t('filterByAction') || 'Eylem filtrele...'}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent w-48"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 animate-pulse">{t('loading') || 'Yükleniyor...'}</div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t('noActivity') || 'Aktivite yok'}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('action') || 'Eylem'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('resource') || 'Kaynak'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('user') || 'Kullanıcı'}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('time') || 'Zaman'}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {entry.action.replace(/[._]/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {entry.resource_type}{entry.resource_id ? ` · ${entry.resource_id.slice(0, 8)}…` : ''}
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        {entry.customer_id?.slice(0, 8) || '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(entry.created_at).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > perPage && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} / {total}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
