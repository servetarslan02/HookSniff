'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { useRateLimits, useSetRateLimit, useDeleteRateLimit } from '@/hooks/useDashboardData';
import ConfirmDialog from '@/components/ConfirmDialog';
import { BarChart3, Bell, Pencil, RefreshCw, Trash2, Zap } from 'lucide-react';

export default function RateLimitingPage() {
  const t = useTranslations('rateLimiting');
  const tc = useTranslations('common');
  const { toast } = useToast();
  const { data: limits = [], isLoading } = useRateLimits();
  const setRateLimit = useSetRateLimit();
  const deleteRateLimit = useDeleteRateLimit();

  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editRps, setEditRps] = useState(10);
  const [editBurst, setEditBurst] = useState(20);
  const [editEnabled, setEditEnabled] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const stats = limits.length > 0 ? {
    total_endpoints: limits.length,
    total_throttled: 0,
    avg_rps: limits.reduce((acc, d) => acc + d.requests_per_second, 0) / limits.length,
    peak_rps: Math.max(...limits.map(d => d.requests_per_second)),
  } : null;

  const handleEdit = (endpointId: string) => {
    const limit = limits.find(l => l.endpoint_id === endpointId);
    if (limit) {
      setEditTarget(endpointId);
      setEditRps(limit.requests_per_second);
      setEditBurst(limit.burst_size);
      setEditEnabled(limit.enabled);
    }
  };

  const handleSave = async () => {
    if (!editTarget) return;
    try {
      await setRateLimit.mutateAsync({
        endpointId: editTarget,
        config: { requests_per_second: editRps, burst_size: editBurst, enabled: editEnabled },
      });
      toast(t('limitUpdated'), 'success');
      setEditTarget(null);
    } catch {
      toast(t('limitUpdateFailed'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRateLimit.mutateAsync(deleteTarget);
      toast(t('limitDeleted'), 'success');
      setDeleteTarget(null);
    } catch {
      toast(t('limitDeleteFailed'), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('totalEndpoints')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_endpoints}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('avgRequestsSec')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avg_rps.toFixed(1)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('peakRequestsSec')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.peak_rps.toFixed(1)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('throttledRequests')}</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_throttled}</div>
          </div>
        </div>
      )}

      {/* Add Rate Limit */}
      {!stats && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setEditTarget('__new__')}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition">
            {t('addRateLimit') || 'Add Rate Limit'}
          </button>
        </div>
      )}

      {limits.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('perEndpointLimits')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('endpoint')}</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('rps')}</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">{t('rpm')}</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('burst')}</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">{t('status')}</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {limits.map((limit) => (
                  <tr key={limit.endpoint_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4"><div className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs">{limit.endpoint_id.slice(0, 12)}...</div></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.requests_per_second}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.requests_per_second * 60}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.burst_size}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${limit.enabled ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {limit.enabled ? tc('active') : tc('inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(limit.endpoint_id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
                          <Pencil size={16} strokeWidth={1.75} className="inline mr-1" /> {t('editLimit')}
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(limit.endpoint_id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-medium">
                          <Trash2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t('deleteLimit')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!stats && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4"><Zap size={18} strokeWidth={1.75} /></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('emptyTitle')}</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-6">{t('emptyDesc')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center"><div className="text-2xl mb-2"><RefreshCw size={18} strokeWidth={1.75} /></div><div className="text-sm font-medium text-gray-900 dark:text-white">{t('autoRetry')}</div><div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('exponentialBackoff')}</div></div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center"><div className="text-2xl mb-2"><BarChart3 size={18} strokeWidth={1.75} /></div><div className="text-sm font-medium text-gray-900 dark:text-white">{t('perEndpoint')}</div><div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('customLimits')}</div></div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center"><div className="text-2xl mb-2"><Bell size={18} strokeWidth={1.75} /></div><div className="text-sm font-medium text-gray-900 dark:text-white">{t('alerts')}</div><div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('throttleNotifications')}</div></div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4"><Pencil size={16} strokeWidth={1.75} className="inline mr-1" /> {t('editLimit')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('requestsPerSecond')}</label>
                <input type="number" min={1} value={editRps} onChange={e => setEditRps(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('burstSize')}</label>
                <input type="number" min={1} value={editBurst} onChange={e => setEditBurst(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="rl-enabled" checked={editEnabled} onChange={e => setEditEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="rl-enabled" className="text-sm text-gray-700 dark:text-slate-300">{t('enabled')}</label>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setEditTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {tc('cancel')}
              </button>
              <button type="button" onClick={handleSave} disabled={setRateLimit.isPending}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                {setRateLimit.isPending ? tc('saving') : tc('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('deleteLimit')}
        message={t('deleteConfirm')}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
