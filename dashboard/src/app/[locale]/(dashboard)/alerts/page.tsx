'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import type { AlertRule } from '@/lib/api';
import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert, useTestAlert } from '@/hooks/useDashboardData';

const CHANNEL_ICONS: Record<string, string> = {
  slack: '💬',
  email: '📧',
  webhook: '🔗',
};

export default function AlertsPage() {
  const t = useTranslations('alerts');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: alerts = [], isLoading: loading } = useAlerts();
  const createAlertMutation = useCreateAlert();
  const updateAlertMutation = useUpdateAlert();
  const deleteAlertMutation = useDeleteAlert();
  const testAlertMutation = useTestAlert();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<AlertRule | null>(null);
  const [editForm, setEditForm] = useState({ name: '', condition: 'failure_rate', threshold: 10, channels: ['email'] as string[] });
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    condition: 'failure_rate',
    threshold: 10,
    channels: ['email'] as string[],
  });

  const conditionLabel = (condition: string, threshold: number) => {
    const suffix = condition === 'failure_rate' ? '%' : condition === 'latency' ? 'ms' : '';
    const labels: Record<string, string> = {
      failure_rate: t('conditionFailureRate'),
      latency: t('conditionLatency'),
      consecutive_failures: t('conditionConsecutive'),
    };
    return `${labels[condition] || condition} ${threshold}${suffix}`;
  };

  const createAlert = async () => {
    if (!token) return;
    try {
      await createAlertMutation.mutateAsync(form);
      setShowCreate(false);
      setForm({ name: '', condition: 'failure_rate', threshold: 10, channels: ['email'] });
    } catch (err) {
      toast(err instanceof Error ? err.message : t('createFailed'), 'error');
    }
  };

  const confirmDeleteAlert = async () => {
    if (!deleteId) return;
    try {
      await deleteAlertMutation.mutateAsync(deleteId);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('deleteFailed'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const testAlert = async (id: string) => {
    try {
      await testAlertMutation.mutateAsync(id);
      toast(t('testSent'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('testFailed'), 'error');
    }
  };

  const toggleAlert = async (alert: AlertRule) => {
    if (!token) return;
    setTogglingId(alert.id);
    try {
      await updateAlertMutation.mutateAsync({ id: alert.id, data: { is_active: !alert.is_active } });
      toast(alert.is_active ? t('alertPaused') : t('alertActivated'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('toggleFailed'), 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const openEdit = (alert: AlertRule) => {
    setEditTarget(alert);
    setEditForm({ name: alert.name, condition: alert.condition, threshold: alert.threshold, channels: [...alert.channels] });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      await updateAlertMutation.mutateAsync({ id: editTarget.id, data: editForm });
      toast(t('alertUpdated'), 'success');
      setEditTarget(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('updateFailed'), 'error');
    }
  };

  const resetForm = () => {
    setShowCreate(false);
    setForm({ name: '', condition: 'failure_rate', threshold: 10, channels: ['email'] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          + {t('newAlert')}
        </button>
      </div>


      {/* Create Alert Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={resetForm} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('createTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('createDesc')}</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="alert-name" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                <input id="alert-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('namePlaceholder')} autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label htmlFor="alert-condition" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('condition')}</label>
                <select id="alert-condition" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="failure_rate">{t('conditions.failureRate')}</option>
                  <option value="latency">{t('conditions.latency')}</option>
                  <option value="consecutive_failures">{t('conditions.consecutiveFailures')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="alert-threshold" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('threshold')}</label>
                <input id="alert-threshold" type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('channels')}</label>
                <div className="flex gap-2">
                  {['slack', 'email', 'webhook'].map(ch => (
                    <button key={ch} type="button" onClick={() => setForm({ ...form, channels: form.channels.includes(ch) ? form.channels.filter(c => c !== ch) : [...form.channels, ch] })}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${form.channels.includes(ch) ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-600'}`}>
                      {CHANNEL_ICONS[ch]} {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={resetForm} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
              <button type="button" onClick={createAlert} disabled={createAlertMutation.isPending || !form.name}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60">
                {createAlertMutation.isPending ? tc('creating') : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert List */}
      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">{tc('loading')}</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('empty')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('emptyDesc')}</p>
          <button onClick={() => setShowCreate(true)} className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
            + {t('newAlert')}
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {alerts.map(alert => (
              <div key={alert.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{alert.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${alert.is_active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                      {alert.is_active ? t('active') : t('paused')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {conditionLabel(alert.condition, alert.threshold)} · {alert.channels.map(ch => CHANNEL_ICONS[ch] || ch).join(' ')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" role="switch" aria-checked={alert.is_active} onClick={() => toggleAlert(alert)} disabled={togglingId === alert.id}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${alert.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'} ${togglingId === alert.id ? 'opacity-60' : ''}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${alert.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <button type="button" onClick={() => openEdit(alert)} className="px-3 py-1.5 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 border border-brand-300 dark:border-brand-500/30 rounded-lg transition">{t('edit')}</button>
                  <button type="button" onClick={() => testAlert(alert.id)} className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg transition">{t('test')}</button>
                  <button type="button" onClick={() => setDeleteId(alert.id)} className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-500/30 rounded-lg transition">{t('delete')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title={t('deleteTitle')} message={t('deleteConfirm')} confirmLabel={t('delete')} variant="danger" onConfirm={confirmDeleteAlert} onCancel={() => setDeleteId(null)} />

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('editAlert')}: {editTarget.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('condition')}</label>
                <select value={editForm.condition} onChange={e => setEditForm({ ...editForm, condition: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
                  <option value="failure_rate">{t('conditions.failureRate')}</option>
                  <option value="latency">{t('conditions.latency')}</option>
                  <option value="consecutive_failures">{t('conditions.consecutiveFailures')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('threshold')}</label>
                <input type="number" value={editForm.threshold} onChange={e => setEditForm({ ...editForm, threshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('channels')}</label>
                <div className="flex gap-2">
                  {['slack', 'email', 'webhook'].map(ch => (
                    <button key={ch} type="button" onClick={() => setEditForm({ ...editForm, channels: editForm.channels.includes(ch) ? editForm.channels.filter(c => c !== ch) : [...editForm.channels, ch] })}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${editForm.channels.includes(ch) ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-600'}`}>
                      {CHANNEL_ICONS[ch]} {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{tc('cancel')}</button>
              <button type="button" onClick={handleSaveEdit} disabled={updateAlertMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50">
                {updateAlertMutation.isPending ? tc('saving') : tc('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
