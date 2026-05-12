'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { webhooksApi, type Delivery } from '@/lib/api';
import { useTranslations } from 'next-intl';

/* ─── Hook0-style: Basit tablo + filtre butonları ─── */

export default function DeliveriesPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const t = useTranslations('deliveries');
  const perPage = 20;

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await webhooksApi.list(token, {
        page,
        status: filter === 'all' ? undefined : filter,
      });
      setDeliveries(data.deliveries);
      setTotal(data.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-4">
      {/* ── Başlık + Filtreler ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <div className="flex gap-1">
          {['all', 'delivered', 'failed', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tablo ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 animate-pulse">{t('loadingDeliveries')}</div>
        ) : deliveries.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">{t('empty')}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">ID</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('event')}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('status')}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">{t('response')}</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                      onClick={() => router.push(`/deliveries/${d.id}`)}
                    >
                      <td className="px-5 py-3 font-mono text-gray-900 dark:text-gray-200">{d.id.slice(0, 8)}…</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {d.event || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          d.status === 'delivered' ? 'text-green-600 dark:text-green-400' :
                          d.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            d.status === 'delivered' ? 'bg-green-500' :
                            d.status === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}></span>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {d.response_status ? (
                          <span className={`font-mono text-xs ${d.response_status < 400 ? 'text-green-600' : 'text-red-600'}`}>
                            {d.response_status}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        {new Date(d.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
