'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { webhooksApi, type Delivery } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';

type StatusFilter = 'all' | 'delivered' | 'failed' | 'pending';

export default function LogsPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const perPage = 20;

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await webhooksApi.list(token, {
        page,
        status: filter === 'all' ? undefined : filter,
      });
      setDeliveries(data.deliveries);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [token, page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const filtered = deliveries.filter(
    (d) =>
      !search ||
      d.event?.toLowerCase().includes(search.toLowerCase()) ||
      d.id.includes(search) ||
      d.endpoint_id?.includes(search)
  );

  const totalPages = Math.ceil(total / perPage);

  const statusCounts = {
    all: total,
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
    failed: deliveries.filter((d) => d.status === 'failed').length,
    pending: deliveries.filter((d) => d.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Webhook Logs</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Full delivery history with status and response details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              autoRefresh
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-500/30'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {autoRefresh ? 'Live' : 'Auto-refresh'}
          </button>
          <button
            onClick={fetchData}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, ID, or endpoint..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'delivered', 'failed', 'pending'] as StatusFilter[]).map((f) => {
          const icons: Record<StatusFilter, string> = {
            all: '📋',
            delivered: '✅',
            failed: '❌',
            pending: '⏳',
          };
          return (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? 'bg-gray-900 dark:bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{icons[f]}</span>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === f ? 'bg-white/20' : 'bg-gray-100 dark:bg-slate-800'
                }`}>
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
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-brand-600 dark:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400 dark:text-slate-500">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading logs...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 dark:text-slate-500">
              {search ? 'No logs match your search.' : 'No webhook logs yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Attempts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Response
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                  {filtered.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => setSelected(d)}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                        {d.id.slice(0, 10)}…
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">
                          {d.event || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-slate-500">
                        {d.endpoint_id?.slice(0, 8)}…
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          {d.attempt_count > 1 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                          {d.attempt_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {d.response_status ? (
                          <span
                            className={`text-sm font-mono font-medium ${
                              d.response_status < 300
                                ? 'text-green-600 dark:text-green-400'
                                : d.response_status < 400
                                ? 'text-blue-600 dark:text-blue-400'
                                : d.response_status < 500
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {d.response_status}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(d.created_at).toLocaleString('en', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > perPage && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-gray-700 dark:text-slate-300 transition"
                  >
                    ← Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-950 text-gray-700 dark:text-slate-300 transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="Delivery ID" value={selected.id} mono />
              <DetailRow label="Event" value={selected.event || '—'} />
              <DetailRow label="Endpoint" value={selected.endpoint_id} mono />
              <DetailRow
                label="Status"
                value={
                  <StatusBadge status={selected.status} />
                }
              />
              <DetailRow label="Attempts" value={String(selected.attempt_count)} />
              <DetailRow label="HTTP Response" value={String(selected.response_status || '—')} mono />
              <DetailRow label="Created" value={new Date(selected.created_at).toLocaleString()} />

              {/* Attempts Timeline */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Delivery Attempts</h4>
                <div className="space-y-3">
                  {Array.from({ length: selected.attempt_count }).map((_, i) => {
                    const isLast = i === selected.attempt_count - 1;
                    const isSuccess = selected.status === 'delivered';
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            isLast && isSuccess
                              ? 'bg-green-500'
                              : isLast && !isSuccess
                              ? 'bg-red-500'
                              : 'bg-amber-400'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Attempt {i + 1}
                            {isLast && isSuccess && ' ✓'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {isLast
                              ? isSuccess
                                ? 'Delivered successfully'
                                : 'Failed — will retry with backoff'
                              : 'Retried with exponential backoff'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button
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
