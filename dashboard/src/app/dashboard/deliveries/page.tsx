'use client';

import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { webhooksApi, endpointsApi, type Delivery, type Endpoint } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function DeliveriesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [replayTarget, setReplayTarget] = useState<Delivery | null>(null);
  const [replaying, setReplaying] = useState(false);
  const perPage = 20;

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await webhooksApi.list(token, {
        page,
        status: statusFilter || undefined,
      });
      setDeliveries(data.deliveries);
      setTotal(data.total);
    } catch (err: any) {
      toast(err.message || 'Failed to load deliveries', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReplay = async () => {
    if (!replayTarget || !token) return;
    setReplaying(true);
    try {
      await webhooksApi.create(token, {
        endpoint_id: replayTarget.endpoint_id,
        event: replayTarget.event,
        data: { replay: true, original_id: replayTarget.id },
      });
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event or ID..."
            className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No deliveries"
          description="Deliveries will appear here once you start sending webhooks."
        />
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'Event', 'Endpoint', 'Status', 'Attempts', 'HTTP', 'Created'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50/50 transition cursor-pointer"
                    onClick={() => setSelected(d)}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{d.id.slice(0, 10)}…</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-xs font-mono text-gray-700">
                        {d.event || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{d.endpoint_id.slice(0, 10)}…</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.attempt_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.response_status || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.created_at).toLocaleString()}</td>
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
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

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
      <span className={clsx('text-sm text-gray-900', mono && 'font-mono')}>{value}</span>
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
