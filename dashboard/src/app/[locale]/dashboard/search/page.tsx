'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface SearchResult {
  id: string;
  event: string | null;
  status: string;
  attempt_count: number;
  response_status: number | null;
  created_at: string;
  endpoint_url: string;
}

interface SearchResponse {
  deliveries: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  query: string;
}

export default function SearchPage() {
  const { token } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const t = useTranslations('search');

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (p = 1) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (status) params.set('status', status);
      params.set('page', p.toString());
      params.set('per_page', '20');

      const data = await apiFetch<SearchResponse>(`/search?${params}`, { token: token || undefined });
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('searchFailed'));
    } finally {
      setLoading(false);
    }
  }, [token, query, status, t]);

  // Debounce search on query/status change (300ms delay)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      search(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, status, search]);

  // Immediate search on page change (no debounce)
  useEffect(() => {
    search(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    search(1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Search and filter your webhook delivery logs.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="failed">{t('failed')}</option>
              <option value="pending">{t('pending')}</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{t('searching')}</div>
        ) : !results || results.deliveries.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">
            {query ? t('noResultsQuery') : t('enterQuery')}
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {results.total.toLocaleString()} result{results.total !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('event')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('endpoint')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('attempts')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                  {results.deliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                        onClick={() => router.push(`/${locale}/dashboard/deliveries?id=${d.id}`)}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                        {d.id.slice(0, 12)}…
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-mono text-gray-700 dark:text-slate-300">
                          {d.event || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-mono max-w-[200px] truncate">
                        {d.endpoint_url}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {d.attempt_count}
                        {d.response_status && (
                          <span className="ml-1 text-xs text-gray-500 dark:text-slate-400">
                            ({d.response_status})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                        {new Date(d.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {results.total > results.per_page && (
              <div className="px-6 py-4 border-t border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Page {page} of {Math.ceil(results.total / results.per_page)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(results.total / results.per_page)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
