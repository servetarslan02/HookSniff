'use client';


import { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Delivery } from '@/lib/api';
import { useDeliveryLogs, useDeliveryAttempts } from '@/hooks/useDashboardData';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { StatusBadge } from '@/components/StatusBadge';
import { VirtualTable } from '@/components/VirtualTable';
import { LazySection, Skeletons } from '@/components/LazySection';
import { AlertTriangle, Check, CheckCircle2, ClipboardList, Clock, Inbox, X, XCircle } from '@/components/icons';

type StatusFilter = 'all' | 'delivered' | 'failed' | 'pending';

export function LogsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const filter = (searchParams.get('status') || 'all') as StatusFilter;
  const { input: search, deferredValue: debouncedSearch, handleChange: handleSearchChange, isStale } = useDebouncedSearch();
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const t = useTranslations('logs');
  const tc = useTranslations('common');
  const perPage = 20;

  // ── Delivery attempts (React Query) ──
  const { data: attempts = [], isLoading: attemptsLoading } = useDeliveryAttempts(selected?.id ?? '');

  const { data, isLoading, error, refetch } = useDeliveryLogs({
    page,
    status: filter === 'all' ? undefined : filter,
    refetchInterval: autoRefresh ? 5000 : undefined,
  });

  const deliveries = data?.deliveries ?? [];
  const total = data?.total ?? 0;
  const statusCounts = data?.statusCounts ?? { all: 0, delivered: 0, failed: 0, pending: 0 };

  const filtered = deliveries.filter(
    (d) =>
      !debouncedSearch ||
      d.event?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.id.includes(debouncedSearch) ||
      d.endpoint_id?.includes(debouncedSearch)
  );

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              autoRefresh
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {autoRefresh ? tc('live') : tc('autoRefresh')}
          </button>
          <button type="button"
            onClick={() => refetch()}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'delivered', 'failed', 'pending'] as StatusFilter[]).map((f) => {
          const icons: Record<StatusFilter, React.ReactNode> = {
            all: <ClipboardList size={16} strokeWidth={1.75} />,
            delivered: <CheckCircle2 size={16} strokeWidth={1.75} />,
            failed: <XCircle size={16} strokeWidth={1.75} />,
            pending: <Clock size={16} strokeWidth={1.75} />,
          };
          return (
            <button
              key={f}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('page');
                if (f === 'all') params.delete('status');
                else params.set('status', f);
                const qs = params.toString();
                router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? 'bg-gray-900 dark:bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{icons[f]}</span>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span
                  title={`${statusCounts[f]} total`}
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    filter === f ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-800'
                  }`}
                >
                  {statusCounts[f]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-3"><AlertTriangle size={18} strokeWidth={1.75} /></div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{error.message}</p>
          <button type="button"
            onClick={() => refetch()}
            className="bg-brand-600 dark:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <LazySection fallback={Skeletons.table()} rootMargin={300}>
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-500">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading logs...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-3 text-gray-400"><Inbox size={36} strokeWidth={1.5} /></div>
            <p className="text-gray-500 dark:text-slate-500">
              {debouncedSearch ? t('noLogsSearch') : t('noLogs')}
            </p>
          </div>
        ) : (
          <>
            <VirtualTable
              data={filtered}
              estimateSize={56}
              header={
                <div className="grid grid-cols-[80px_120px_minmax(100px,1fr)_90px_70px_80px_140px] bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
                  <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">ID</div>
                  <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Event</div>
                  <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block">Endpoint</div>
                  <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</div>
                  <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:block">Att.</div>
                  <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden lg:block">Resp</div>
                  <div className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Time</div>
                </div>
              }
              renderRow={(d) => (
                <div
                  className="grid grid-cols-[80px_120px_minmax(100px,1fr)_90px_70px_80px_140px] hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer border-b border-gray-200/50 dark:border-slate-700/50"
                  onClick={() => setSelected(d)}
                >
                  <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 8)}…</div>
                  <div className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">{d.event || '—'}</span>
                  </div>
                  <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-gray-500 dark:text-slate-500 hidden sm:flex items-center">{d.endpoint_id?.slice(0, 8)}…</div>
                  <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center"><StatusBadge status={d.status} /></div>
                  <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hidden md:flex items-center gap-1.5">
                    {d.attempt_count > 1 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {d.attempt_count}
                  </div>
                  <div className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:flex items-center">
                    {d.response_status ? (
                      <span className={`text-xs sm:text-sm font-mono font-medium ${d.response_status < 300 ? 'text-green-600 dark:text-green-400' : d.response_status < 400 ? 'text-blue-600 dark:text-blue-400' : d.response_status < 500 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{d.response_status}</span>
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-500">—</span>
                    )}
                  </div>
                  <div className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap flex items-center">
                    {new Date(d.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
              emptyState={
                <div className="p-12 text-center">
                  <div className="flex justify-center mb-3 text-gray-400"><Inbox size={36} strokeWidth={1.5} /></div>
                  <p className="text-gray-500 dark:text-slate-500">{search ? t('noLogsSearch') : t('noLogs')}</p>
                </div>
              }
            />

            {/* Pagination */}
            {total > perPage && (
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                  {tc('showing', { from: (page - 1) * perPage + 1, to: Math.min(page * perPage, total), total })}
                </span>
                <nav aria-label={tc('pagination')} className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(Math.max(1, page - 1)));
                      router.push(`${pathname}?${params.toString()}`, { scroll: false });
                    }}
                    disabled={page === 1}
                    aria-label={tc('previous')}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-gray-700 dark:text-slate-300 transition"
                  >
                    {tc('previous')}
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400" aria-live="polite">
                    {tc('pageOf', { page, totalPages })}
                  </span>
                  <button type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(Math.min(totalPages, page + 1)));
                      router.push(`${pathname}?${params.toString()}`, { scroll: false });
                    }}
                    disabled={page >= totalPages}
                    aria-label={tc('next')}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-gray-700 dark:text-slate-300 transition"
                  >
                    {tc('next')}
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      </LazySection>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-3 sm:mx-4 max-h-[80dvh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('deliveryDetails')}</h3>
              <button type="button"
                onClick={() => setSelected(null)}
                aria-label={tc('close')}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X size={16} strokeWidth={1.75} className="inline mr-1" /> </button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label={t('deliveryId')} value={selected.id} mono />
              <DetailRow label={t("event")} value={selected.event || '—'} />
              <DetailRow label={t("endpoint")} value={selected.endpoint_id} mono />
              <DetailRow
                label={t("status")}
                value={
                  <StatusBadge status={selected.status} />
                }
              />
              <DetailRow label={t("attempts")} value={String(selected.attempt_count)} />
              <DetailRow label={t('httpResponse')} value={String(selected.response_status || '—')} mono />
              <DetailRow label={t("created")} value={new Date(selected.created_at).toLocaleString()} />

              {/* Attempts Timeline */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('deliveryDetails')}</h4>
                <div className="space-y-3">
                  {attemptsLoading ? (
                    <p className="text-sm text-gray-500 dark:text-slate-400">{tc('loading')}</p>
                  ) : attempts.length > 0 ? (
                    attempts.map((a) => (
                      <div key={a.id} className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                            a.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t('attempt')} {a.attempt_number}
                            {a.status === 'delivered' && <Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom text-emerald-500" />}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            {a.response_status && (
                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                HTTP {a.response_status}
                              </span>
                            )}
                            {a.duration_ms !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                {a.duration_ms}ms
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {new Date(a.created_at).toLocaleString()}
                            </span>
                          </div>
                          {a.error_message && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1 truncate">{a.error_message}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">{tc('noResults')}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ─── */

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">{label}</span>
      <span className={`text-sm text-gray-900 dark:text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
