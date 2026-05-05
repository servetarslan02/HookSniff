'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { webhooksApi, type Delivery } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function DeliveriesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [replayTarget, setReplayTarget] = useState<Delivery | null>(null);
  const [replaying, setReplaying] = useState(false);
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
      setError(err.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }, [token, page, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReplay = async () => {
    if (!replayTarget || !token) return;
    setReplaying(true);
    try {
      await webhooksApi.replay(token, replayTarget.id);
      toast('Webhook replayed!', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Replay failed', 'error');
    } finally {
      setReplaying(false);
      setReplayTarget(null);
    }
  };

  const filtered = deliveries.filter((d) =>
    !search || d.event?.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search)
  );

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deliveries</h2>
          <p className="text-sm text-gray-500 mt-1">Track all webhook deliveries and their status</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by event or ID..."
          className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'delivered', 'failed', 'pending'].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={fetchData} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading deliveries...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No deliveries found.</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => setSelected(d)}>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{d.id.slice(0, 12)}…</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-xs font-mono text-gray-700">
                        {d.event || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.attempt_count}</td>
                    <td className="px-6 py-4">
                      {d.response_status ? (
                        <span className={`text-sm font-mono ${d.response_status < 400 ? 'text-green-600' : 'text-red-600'}`}>
                          {d.response_status}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {d.status === 'failed' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setReplayTarget(d); }}
                          className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                        >
                          Replay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > perPage && (
              <div className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
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
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Delivery Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <DetailRow label="ID" value={selected.id} mono />
              <DetailRow label="Event" value={selected.event || '—'} />
              <DetailRow label="Endpoint" value={selected.endpoint_id} mono />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Attempts" value={String(selected.attempt_count)} />
              <DetailRow label="HTTP Status" value={String(selected.response_status || '—')} />
              <DetailRow label="Created" value={new Date(selected.created_at).toLocaleString()} />

              {/* Attempts Timeline */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Delivery Attempts</h4>
                <div className="space-y-3">
                  {Array.from({ length: selected.attempt_count }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Attempt {i + 1}</p>
                        <p className="text-xs text-gray-500">
                          {i === selected.attempt_count - 1
                            ? selected.status === 'delivered' ? 'Delivered successfully' : 'Failed — will retry'
                            : 'Retried with exponential backoff'}
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
        title="Replay Webhook"
        message={`Replay delivery ${replayTarget?.id.slice(0, 10)}… to the same endpoint?`}
        confirmLabel="Replay"
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
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: 'bg-green-50 text-green-700 ring-green-600/20',
    failed: 'bg-red-50 text-red-700 ring-red-600/20',
    pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
