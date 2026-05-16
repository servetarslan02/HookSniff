'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { webhooksApi, type Delivery } from '@/lib/api';
import { useWebhooks, useReplayDelivery } from '@/hooks/useDashboardData';
import { useDeliveryStream } from '@/hooks/useDeliveryStream';
import { useIsFeatureEnabled } from '@/hooks/useAdminData';
import { VirtualTable } from '@/components/VirtualTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations } from 'next-intl';

export default function DeliveriesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bulkReplayEnabled = useIsFeatureEnabled('bulk_replay');

  // URL-driven state — page and filter survive refresh
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const filter = searchParams.get('status') || 'all';

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || value === '1') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [searchParams, router, pathname]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [replayTarget, setReplayTarget] = useState<Delivery | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchReplaying, setBatchReplaying] = useState(false);
  const t = useTranslations('deliveries');
  const tc = useTranslations('common');
  const perPage = 20;

  // React Query — replaces fetchData + useState + useEffect
  const { data, isLoading, error: queryError, refetch } = useWebhooks({
    page,
    status: filter === 'all' ? undefined : filter,
  });
  const replayMutation = useReplayDelivery();

  const deliveries = data?.deliveries ?? [];
  const total = data?.total ?? 0;
  const loading = isLoading;
  const error = queryError ? (getErrorMessage(queryError, tc('unknownError')) || tc('failedToLoadDeliveries')) : '';

  // SSE stream — real-time delivery updates as secondary data source
  const { connected: sseConnected, deliveries: sseDeliveries } = useDeliveryStream({
    token: token || '',
    enabled: !!token,
  });

  // Merge SSE deliveries into the main list (deduplicate by id)
  const mergedDeliveries = useMemo(() => {
    if (sseDeliveries.length === 0) return deliveries;
    const existingIds = new Set(deliveries.map((d) => d.id));
    const newFromSse = sseDeliveries
      .filter((sse) => !existingIds.has(sse.id))
      .map((sse) => ({
        id: sse.id,
        endpoint_id: sse.endpoint_id,
        event: sse.event,
        status: sse.status,
        attempt_count: sse.attempts,
        response_status: undefined,
        created_at: sse.created_at,
      } as Delivery));
    return [...newFromSse, ...deliveries];
  }, [deliveries, sseDeliveries]);

  const handleReplay = async () => {
    if (!replayTarget) return;
    setReplaying(true);
    try {
      await replayMutation.mutateAsync(replayTarget.id);
      toast(t('replaySuccess'), 'success');
      setReplayTarget(null);
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')) || tc('replayFailed'), 'error');
    } finally {
      setReplaying(false);
      setReplayTarget(null);
    }
  };

  const filtered = mergedDeliveries.filter((d) =>
    !search || d.event?.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search)
  );

  const totalPages = Math.ceil(total / perPage);
  const isSearching = search.length > 0;

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
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((d) => d.id)));
    }
  };

  const handleBatchReplay = async () => {
    if (!token || selectedIds.size === 0) return;
    setBatchReplaying(true);
    try {
      const result = await webhooksApi.batchReplay(token, Array.from(selectedIds));
      toast(`Replayed ${result.replayed || selectedIds.size} deliveries`, 'success');
      setSelectedIds(new Set());
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setBatchReplaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
            {sseConnected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-3 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 w-full sm:w-auto"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: t('filterAll') },
          { key: 'delivered', label: t('filterDelivered') },
          { key: 'failed', label: t('filterFailed') },
          { key: 'pending', label: t('filterPending') },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('page');
              if (f.key === 'all') params.delete('status');
              else params.set('status', f.key);
              const qs = params.toString();
              router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f.key
                ? 'bg-gray-900 text-white'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button type="button" onClick={() => refetch()} className="bg-brand-600 dark:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition">
            {tc('retry')}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-500 animate-pulse">{t('loadingDeliveries')}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-500">
            {isSearching ? t('noResults', { search }) : t('empty')}
          </div>
        ) : (
          <>
            {/* Batch Replay Bar — only shown when bulk_replay flag is enabled */}
            {bulkReplayEnabled && selectedIds.size > 0 && (
              <div className="px-6 py-3 flex items-center gap-3 bg-brand-50 dark:bg-brand-500/10 border-b border-brand-200 dark:border-brand-500/20">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('selectedCount', { count: selectedIds.size })}</span>
                <button
                  type="button"
                  onClick={handleBatchReplay}
                  disabled={batchReplaying}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {batchReplaying ? t('batchReplaying') : t('batchReplay', { count: selectedIds.size })}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  {t('clearSelection')}
                </button>
              </div>
            )}

            <VirtualTable
              data={filtered}
              estimateSize={64}
              header={
                <div className={`grid ${bulkReplayEnabled ? 'grid-cols-[40px_120px_minmax(150px,1fr)_100px_80px_80px_160px_110px]' : 'grid-cols-[120px_minmax(150px,1fr)_100px_80px_80px_160px_110px]'} bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50`}>
                  {bulkReplayEnabled && (
                    <div className="px-3 py-3 flex items-center">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedIds.size === filtered.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                        aria-label={t('selectAll')}
                      />
                    </div>
                  )}
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center">ID</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center">{t('event')}</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center">{t('status')}</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:flex items-center">{t('attempts')}</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:flex items-center">{t('response')}</div>
                  <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center">{t('time')}</div>
                  <div className="px-6 py-3 flex items-center" />
                </div>
              }
              renderRow={(d) => (
                <div
                  key={d.id}
                  className={`grid ${bulkReplayEnabled ? 'grid-cols-[40px_120px_minmax(150px,1fr)_100px_80px_80px_160px_110px]' : 'grid-cols-[120px_minmax(150px,1fr)_100px_80px_80px_160px_110px]'} hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer border-b border-gray-200/50 dark:border-slate-700/50 ${selectedIds.has(d.id) ? 'bg-brand-50/50 dark:bg-brand-500/5' : ''}`}
                  tabIndex={0}
                  role="link"
                  aria-label={`Delivery ${d.id.slice(0, 12)}`}
                  onClick={() => router.push(`/deliveries/${d.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/deliveries/${d.id}`); } }}
                >
                  {bulkReplayEnabled && (
                    <div className="px-3 py-4 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(d.id)}
                        onChange={(e) => toggleSelect(d.id, e as unknown as React.MouseEvent)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                        aria-label={`Select ${d.id.slice(0, 12)}`}
                      />
                    </div>
                  )}
                  <div className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400 flex items-center">{d.id.slice(0, 12)}…</div>
                  <div className="px-6 py-4 flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">
                      {d.event || '—'}
                    </span>
                  </div>
                  <div className="px-6 py-4 flex items-center">
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 hidden md:flex items-center">{d.attempt_count}</div>
                  <div className="px-6 py-4 hidden md:flex items-center">
                    {d.response_status ? (
                      <span className={`text-sm font-mono ${d.response_status < 400 ? 'text-green-600' : 'text-red-600'}`}>
                        {d.response_status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-slate-500">—</span>
                    )}
                  </div>
                  <div className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 flex items-center">
                    {new Date(d.created_at).toLocaleString()}
                  </div>
                  <div className="px-6 py-4 flex items-center">
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); router.push(`/deliveries/${d.id}`); }}
                      className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:text-brand-300 text-sm font-medium"
                    >
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
              )}
              emptyState={
                <div className="p-12 text-center text-gray-500 dark:text-slate-500">
                  {isSearching ? t('noResults', { search }) : t('empty')}
                </div>
              }
            />

            {/* Pagination */}
            {total > perPage && !isSearching && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  {tc('showing', { from: (page - 1) * perPage + 1, to: Math.min(page * perPage, total), total })}
                </span>
                <nav aria-label={tc('pagination')} className="flex gap-2">
                  <button type="button"
                    onClick={() => setParam('page', String(Math.max(1, page - 1)))}
                    disabled={page === 1}
                    aria-label={tc('previous')}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition"
                  >
                    {tc('previous')}
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400" aria-live="polite">{tc('pageOf', { page, totalPages })}</span>
                  <button type="button"
                    onClick={() => setParam('page', String(Math.min(totalPages, page + 1)))}
                    disabled={page >= totalPages}
                    aria-label={tc('next')}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-950 transition"
                  >
                    {tc('next')}
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80dvh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('details')}</h3>
              <button type="button" onClick={() => setSelected(null)} aria-label={t("closeDetails")} className="text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:text-slate-400">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="ID" value={selected.id} mono />
              <DetailRow label={t("event")} value={selected.event || '—'} />
              <DetailRow label={t("endpoint")} value={selected.endpoint_id} mono />
              <DetailRow label={t("status")} value={selected.status} />
              <DetailRow label={t("attempts")} value={String(selected.attempt_count)} />
              <DetailRow label={t("httpStatus")} value={String(selected.response_status || '—')} />
              <DetailRow label={t("created")} value={new Date(selected.created_at).toLocaleString()} />

              {/* Attempts Timeline */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('deliveryAttempts')}</h4>
                <div className="space-y-3">
                  {Array.from({ length: selected.attempt_count }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('attemptN', { n: i + 1 })}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {i === selected.attempt_count - 1
                            ? selected.status === 'delivered' ? t('deliveredSuccessfully') : t('failedWillRetry')
                            : t('retriedBackoff')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500 dark:text-slate-400">{label}</span>
      <span className={`text-sm text-gray-900 dark:text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}


