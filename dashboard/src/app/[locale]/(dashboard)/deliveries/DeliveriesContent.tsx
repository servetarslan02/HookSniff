'use client';

import { getErrorMessage } from '@/lib/errors';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { webhooksApi } from '@/lib/api';
import { useWebhooks, useReplayDelivery, useSearch, useDeliveryAttempts, useStatusCounts } from '@/hooks/useDashboardData';
import { useLiveEndpoints } from '@/hooks/useCollections';
import { useDeliveryStream } from '@/hooks/useDeliveryStream';
import { useIsFeatureEnabled } from '@/hooks/useAdminData';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import ConfirmDialog from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations } from 'next-intl';
import { RoleGuard } from '@/components/RoleGuard';
import { VirtualTable } from '@/components/VirtualTable';
import { AlertTriangle, Check, CheckCircle2, ClipboardList, Clock, Inbox, Package, X, XCircle } from '@/components/icons';

type StatusFilter = 'all' | 'delivered' | 'failed' | 'pending';

export default function DeliveriesContent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bulkReplayEnabled = useIsFeatureEnabled('bulk_replay');

  // ── URL-driven state ──
  const filter = (searchParams.get('status') || 'all') as StatusFilter;

  // ── Search state (Concurrent Features — useDeferredValue) ──
  const { input: searchInput, deferredValue: debouncedSearch, handleChange: setSearchInput, isStale: _isStale } = useDebouncedSearch();

  // ── Auto-refresh state (from Logs page) ──
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allDeliveriesAcc, setAllDeliveriesAcc] = useState<DisplayDelivery[]>([]);
  const prevFilterRef = useRef(`${filter}-${debouncedSearch}`);

  // ── Replay state (from Deliveries page) ──
  const [replayTarget, setReplayTarget] = useState<DisplayDelivery | null>(null);
  const [replaying, setReplaying] = useState(false);
  const replayMutation = useReplayDelivery();

  // ── Batch replay state (from Deliveries page) ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchReplaying, setBatchReplaying] = useState(false);

  // ── Detail modal state (from Logs page) ──
  const [selectedDelivery, setSelectedDelivery] = useState<DisplayDelivery | null>(null);
  const { data: attempts = [], isLoading: attemptsLoading } = useDeliveryAttempts(selectedDelivery?.id ?? '');

  // ── i18n ──
  const t = useTranslations('deliveries');
  const tc = useTranslations('common');
  const tl = useTranslations('logs');
  const ts = useTranslations('search');

  // ── Data: main list (from Deliveries page — useWebhooks) ──
  const { data, isLoading, error: queryError, refetch } = useWebhooks({
    page: currentPage,
    status: filter === 'all' ? undefined : filter,
  });

  // Auto-refresh: refetch every 30s when toggle is on
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => refetch(), 30_000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // ── Data: endpoints (for resolving endpoint_id → URL) ──
  const { data: endpointsList } = useLiveEndpoints();
  const endpointUrlMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (endpointsList) {
      for (const ep of endpointsList) {
        map[ep.id] = ep.url;
      }
    }
    return map;
  }, [endpointsList]);

  // ── Data: status counts (single API call, 60s staleTime) ──
  const { data: statusCountData } = useStatusCounts();
  const statusCounts = {
    all: statusCountData?.all ?? 0,
    delivered: statusCountData?.delivered ?? 0,
    failed: statusCountData?.failed ?? 0,
    pending: statusCountData?.pending ?? 0,
  };

  // ── Data: SSE stream (from Deliveries page) ──
  const { connected: sseConnected, deliveries: sseDeliveries } = useDeliveryStream({
    token: token || '',
    enabled: !!token,
  });

  // ── Data: server-side search (from Search page) ──
  const { data: searchResults, isLoading: searchLoading } = useSearch({
    q: debouncedSearch || undefined,
    status: filter !== 'all' ? filter : undefined,
    page: currentPage,
    per_page: 20,
  });

  // ── Determine which data source to use ──
  const isSearching = debouncedSearch.length > 0;

  type DisplayDelivery = { id: string; endpoint_id?: string; endpoint_url?: string; event?: string | null; status: string; attempt_count: number; response_status?: number; created_at: string };

  const deliveries: DisplayDelivery[] = useMemo(() => {
    if (isSearching) {
      // Server-side search results (SearchResult has endpoint_url, not endpoint_id)
      return (searchResults?.deliveries ?? []) as DisplayDelivery[];
    }
    // Merge SSE into main list, resolve endpoint_id → URL from cached endpoints
    const mainDeliveries: DisplayDelivery[] = (data?.deliveries ?? []).map((d: Record<string, unknown>) => ({
      ...d,
      endpoint_url: endpointUrlMap[d.endpoint_id as string] || undefined,
    })) as DisplayDelivery[];
    if (sseDeliveries.length === 0) return mainDeliveries;
    const existingIds = new Set(mainDeliveries.map((d) => d.id));
    const newFromSse = sseDeliveries
      .filter((sse) => !existingIds.has(sse.id))
      .map((sse) => ({
        id: sse.id,
        endpoint_id: sse.endpoint_id,
        endpoint_url: endpointUrlMap[sse.endpoint_id] || undefined,
        event: sse.event,
        status: sse.status,
        attempt_count: sse.attempts,
        response_status: undefined,
        created_at: sse.created_at,
      }));
    return [...newFromSse, ...mainDeliveries];
  }, [isSearching, searchResults, data, sseDeliveries, endpointUrlMap]);

  const total = isSearching ? (searchResults?.total ?? 0) : (data?.total ?? 0);
  const loading = isSearching ? searchLoading : isLoading;
  const error = queryError ? (getErrorMessage(queryError, tc('unknownError')) || tc('failedToLoadDeliveries')) : '';

  // Accumulate deliveries across pages
  useEffect(() => {
    const filterKey = `${filter}-${debouncedSearch}`;
    if (filterKey !== prevFilterRef.current) {
      setAllDeliveriesAcc(deliveries);
      setCurrentPage(1);
      prevFilterRef.current = filterKey;
    } else if (currentPage === 1) {
      setAllDeliveriesAcc(deliveries);
    } else if (deliveries.length > 0) {
      setAllDeliveriesAcc((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const newItems = deliveries.filter((d) => !existingIds.has(d.id));
        return [...prev, ...newItems];
      });
    }
  }, [deliveries, currentPage, filter, debouncedSearch]);

  const hasMore = allDeliveriesAcc.length < total;
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) setCurrentPage((p) => p + 1);
  }, [loading, hasMore]);

  // IntersectionObserver for infinite scroll — auto-load on scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          handleLoadMore();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, handleLoadMore]);

  // ── Replay handlers ──
  const handleReplay = async () => {
    if (!replayTarget) return;
    setReplaying(true);
    try {
      await replayMutation.mutateAsync(replayTarget.id);
      toast(t('replaySuccess'), 'success');
      setReplayTarget(null);
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')) || t('replayFailed'), 'error');
    } finally {
      setReplaying(false);
      setReplayTarget(null);
    }
  };

  const handleBatchReplay = async () => {
    if (!token || selectedIds.size === 0) return;
    setBatchReplaying(true);
    try {
      const result = await webhooksApi.batchReplay(token, Array.from(selectedIds));
      toast(t('batchReplaySuccess', { count: result.replayed || selectedIds.size }) || `Replayed ${result.replayed || selectedIds.size} deliveries`, 'success');
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setBatchReplaying(false);
    }
  };

  // ── Detail modal handler ──
  const openDetailModal = (d: DisplayDelivery) => {
    setSelectedDelivery(d);
  };

  // ── Selection handlers ──
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === deliveries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(deliveries.map((d) => d.id)));
    }
  };


  // ── Status filter tabs (unified: tabs with counts, like Logs) ──
  const statusFilters: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: t('filterAll'), icon: <ClipboardList size={16} strokeWidth={1.75} /> },
    { key: 'delivered', label: t('filterDelivered'), icon: <CheckCircle2 size={16} strokeWidth={1.75} /> },
    { key: 'failed', label: t('filterFailed'), icon: <XCircle size={16} strokeWidth={1.75} /> },
    { key: 'pending', label: t('filterPending'), icon: <Clock size={16} strokeWidth={1.75} /> },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
            {sseConnected && !autoRefresh && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {tc('connected')}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Auto-refresh toggle (from Logs) */}
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 shadow-sm transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {tc('refresh')}
          </button>
        </div>
      </div>

      {/* ─── Search bar ─── */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchInput}
          onChange={setSearchInput}
          placeholder={ts('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        />
      </div>

      {/* ─── Status filter tabs with counts (from Logs) ─── */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('page');
              if (f.key === 'all') params.delete('status');
              else params.set('status', f.key);
              const qs = params.toString();
              router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f.key
                ? 'bg-gray-900 dark:bg-brand-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
            {f.key !== 'all' && (
              <span
                title={`${statusCounts[f.key]} total`}
                className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === f.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-800'
                }`}
              >
                {statusCounts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Error state ─── */}
      {error && (
        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-3"><AlertTriangle size={18} strokeWidth={1.75} /></div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button type="button"
            onClick={() => refetch()}
            className="bg-brand-600 dark:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
          >
            {tc('retry')}
          </button>
        </div>
      )}

      {/* ─── Table ─── */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-500">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('loadingDeliveries')}
            </div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-3 text-gray-400"><Inbox size={36} strokeWidth={1.5} /></div>
            <p className="text-gray-500 dark:text-slate-500">
              {isSearching ? ts('noResultsQuery') : t('empty')}
            </p>
          </div>
        ) : (
          <>
            {/* Batch Replay Bar */}
            {bulkReplayEnabled && selectedIds.size > 0 && (
              <div className="px-6 py-3 flex items-center gap-3 bg-brand-50 dark:bg-brand-500/10 border-b border-brand-200 dark:border-brand-500/20">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('selectedCount', { count: selectedIds.size })}</span>
                <RoleGuard require="canManageWebhooks">
                  <button type="button" onClick={handleBatchReplay} disabled={batchReplaying} className="px-4 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition disabled:opacity-50">
                    {batchReplaying ? t('batchReplaying') : t('batchReplay', { count: selectedIds.size })}
                  </button>
                </RoleGuard>
                <button type="button" onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">
                  {t('clearSelection')}
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <VirtualTable
                data={allDeliveriesAcc}
                estimateSize={56}
                header={
                  <div className="flex bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50 min-w-[760px]">
                    {bulkReplayEnabled && (
                      <div className="w-[36px] shrink-0 px-2 py-3">
                        <input type="checkbox" checked={deliveries.length > 0 && selectedIds.size === deliveries.length} onChange={toggleSelectAll} className="w-4 h-4 rounded-sm text-brand-600 focus:ring-brand-500" aria-label={t('selectAll')} />
                      </div>
                    )}
                    <div className="w-[160px] shrink-0 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">ID</div>
                    <div className="w-[150px] shrink-0 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('event')}</div>
                    <div className="w-[110px] shrink-0 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('status')}</div>
                    <div className="w-[70px] shrink-0 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:block">{t('attempts')}</div>
                    <div className="w-[70px] shrink-0 px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:block">{t('response')}</div>
                    <div className="flex-1 min-w-[140px] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('time')}</div>
                    <div className="w-[110px] shrink-0 px-3 py-3" />
                  </div>
                }
                renderRow={(d) => (
                  <div
                    className={`flex hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer border-b border-gray-200/50 dark:border-slate-700/50 min-w-[760px] ${selectedIds.has(d.id) ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''}`}
                    onClick={() => router.push(`/deliveries/${d.id}`)}
                  >
                    {bulkReplayEnabled && (
                      <div className="w-[36px] shrink-0 px-2 py-3">
                        <input type="checkbox" checked={selectedIds.has(d.id)} onChange={(e) => toggleSelect(d.id, e as unknown as React.MouseEvent)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 rounded-sm text-brand-600 focus:ring-brand-500" aria-label={`Select ${d.id.slice(0, 12)}`} />
                      </div>
                    )}
                    <div className="w-[160px] shrink-0 px-3 py-3 text-xs sm:text-sm font-mono text-gray-600 dark:text-slate-400 overflow-hidden text-ellipsis">{d.id.slice(0, 12)}…</div>
                    <div className="w-[150px] shrink-0 px-3 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">{d.event || '—'}</span>
                    </div>
                    <div className="w-[110px] shrink-0 px-3 py-3"><StatusBadge status={d.status} /></div>
                    <div className="w-[70px] shrink-0 px-3 py-3 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hidden md:flex items-center">
                      <div className="flex items-center gap-1.5">
                        {d.attempt_count > 1 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        {d.attempt_count}
                      </div>
                    </div>
                    <div className="w-[70px] shrink-0 px-3 py-3 text-xs sm:text-sm text-gray-600 dark:text-slate-400 hidden md:flex items-center">
                      {d.response_status ? (
                        <span className={`text-xs sm:text-sm font-mono font-medium ${
                          d.response_status < 300 ? 'text-green-600 dark:text-green-400'
                            : d.response_status < 400 ? 'text-blue-600 dark:text-blue-400'
                            : d.response_status < 500 ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>{d.response_status}</span>
                      ) : <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-500">—</span>}
                    </div>
                    <div className="flex-1 min-w-[140px] px-3 py-3 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                      {new Date(d.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="w-[110px] shrink-0 px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={(e) => { e.stopPropagation(); openDetailModal(d); }} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition" title={tl('deliveryDetails')}>
                          <Package size={16} strokeWidth={1.75} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); router.push(`/deliveries/${d.id}`); }} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:text-brand-300 text-sm font-medium transition">
                          {t('viewDetails')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* ─── Infinite Scroll sentinel ─── */}
            {hasMore && (
              <div ref={sentinelRef} className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-sm">{tc('loading')}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Detail Modal (from Logs — attempt timeline) ─── */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => setSelectedDelivery(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-3 sm:mx-4 max-h-[80dvh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{tl('deliveryDetails')}</h3>
              <button type="button"
                onClick={() => setSelectedDelivery(null)}
                aria-label={tc('close')}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label={tl('deliveryId')} value={selectedDelivery.id} mono />
              <DetailRow label={tl('event')} value={selectedDelivery.event || '—'} />
              <DetailRow label={tl('endpoint')} value={selectedDelivery.endpoint_url || selectedDelivery.endpoint_id} mono />
              <DetailRow
                label={tl('status')}
                value={<StatusBadge status={selectedDelivery.status} />}
              />
              <DetailRow label={tl('attempts')} value={String(selectedDelivery.attempt_count)} />
              <DetailRow label={tl('httpResponse')} value={String(selectedDelivery.response_status || '—')} mono />
              <DetailRow label={tl('created')} value={new Date(selectedDelivery.created_at).toLocaleString()} />

              {/* Attempts Timeline */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{tl('deliveryAttempts')}</h4>
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
                            {tl('attempt')} {a.attempt_number}
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
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-between">
              <button type="button"
                onClick={() => {
                  router.push(`/deliveries/${selectedDelivery.id}`);
                  setSelectedDelivery(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition"
              >
                {t('viewDetails')} →
              </button>
              <button type="button"
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Replay Confirm Dialog ─── */}
      <ConfirmDialog
        open={!!replayTarget}
        title={t('replayTitle')}
        message={t('replayConfirm', { id: replayTarget?.id.slice(0, 10) ?? '' })}
        confirmLabel={t('replay')}
        onConfirm={handleReplay}
        onCancel={() => setReplayTarget(null)}
        loading={replaying}
      />
    </div>
  );
}

/* ─── Helper ─── */
function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">{label}</span>
      <span className={`text-sm text-gray-900 dark:text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
