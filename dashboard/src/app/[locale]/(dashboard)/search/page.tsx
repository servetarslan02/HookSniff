'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { VirtualTable } from '@/components/VirtualTable';
import { useSearch } from '@/hooks/useDashboardData';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { StatusBadge } from '@/components/StatusBadge';

export default function SearchPage() {
  const router = useRouter();
  const t = useTranslations('search');
  const tc = useTranslations('common');

  const { input: query, deferredValue: debouncedQuery, handleChange: handleQueryChange } = useDebouncedSearch();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [allResults, setAllResults] = useState<any[]>([]);
  const prevQueryRef = useRef(`${debouncedQuery}-${status}`);

  const { data: results, isLoading } = useSearch({
    q: debouncedQuery || undefined,
    status: status || undefined,
    page,
    per_page: 20,
  });

  const deliveries = results?.deliveries ?? [];
  const total = results?.total ?? 0;

  // Accumulate results
  useEffect(() => {
    const queryKey = `${debouncedQuery}-${status}`;
    if (queryKey !== prevQueryRef.current) {
      setAllResults(deliveries);
      setPage(1);
      prevQueryRef.current = queryKey;
    } else if (page === 1) {
      setAllResults(deliveries);
    } else if (deliveries.length > 0) {
      setAllResults((prev) => {
        const existingIds = new Set(prev.map((d: any) => d.id));
        const newItems = deliveries.filter((d: any) => !existingIds.has(d.id));
        return [...prev, ...newItems];
      });
    }
  }, [deliveries, page, debouncedQuery, status]);

  const hasMore = allResults.length < total;
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) setPage((p) => p + 1);
  }, [isLoading, hasMore]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAllResults([]);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">Search and filter your webhook delivery logs.</p>
      </div>

      <form onSubmit={handleSearch} className="glass-card p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="md:col-span-2">
            <input type="text" value={query} onChange={handleQueryChange}
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition" />
          </div>
          <div>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              <option value="">{t('allStatuses')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="failed">{t('failed')}</option>
              <option value="pending">{t('pending')}</option>
            </select>
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-3 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition">Search</button>
          </div>
        </div>
      </form>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{t('searching')}</div>
        ) : allResults.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">
            {debouncedQuery || status ? t('noResultsQuery') : t('enterQuery')}
          </div>
        ) : (
          <>
            <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-200/50 dark:border-slate-700/50">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">{allResults.length.toLocaleString()} result{allResults.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <VirtualTable
                data={allResults}
                estimateSize={56}
                header={
                  <div className="grid grid-cols-[80px_120px_90px_minmax(120px,1fr)_80px_140px] bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('event')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('status')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden sm:block">{t('endpoint')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden md:block">{t('attempts')}</div>
                    <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase hidden lg:block">{t('time')}</div>
                  </div>
                }
                renderRow={(d) => (
                  <div className="grid grid-cols-[80px_120px_90px_minmax(120px,1fr)_80px_140px] hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer border-b border-gray-200/50 dark:border-slate-700/50" onClick={() => router.push(`/deliveries/${d.id}`)}>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 8)}…</div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center"><span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-mono text-gray-700 dark:text-slate-300">{d.event || '—'}</span></div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center"><StatusBadge status={d.status} /></div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-mono max-w-[200px] truncate hidden sm:flex items-center">{d.endpoint_url}</div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hidden md:flex items-center">{d.attempt_count}{d.response_status && <span className="ml-1 text-xs text-gray-500 dark:text-slate-400">({d.response_status})</span>}</div>
                    <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-slate-500 hidden lg:flex items-center">{new Date(d.created_at).toLocaleString()}</div>
                  </div>
                )}
              />
            </div>

            {hasMore && (
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200/50 dark:border-slate-700/50 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-brand-500 rounded-full animate-spin" />
                    <span className="text-sm">{tc('loading')}</span>
                  </div>
                ) : (
                  <button type="button" onClick={handleLoadMore}
                    className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                  >
                    {allResults.length}/{total} — {tc('loadMore') || 'Load more'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
