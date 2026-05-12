'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { alertsApi, type AlertRule } from '@/lib/api';

const CONDITION_LABELS: Record<string, string> = {
  failure_rate: 'Failure Rate >',
  latency: 'Avg Latency >',
  consecutive_failures: 'Consecutive Failures >',
};

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
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    condition: 'failure_rate',
    threshold: 10,
    channels: ['email'] as string[],
  });

  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const data = await alertsApi.list(token);
      setAlerts(data);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('fetchFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast, t]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const createAlert = async () => {
    if (!token) return;
    setCreating(true);
    try {
      await alertsApi.create(token, form);
      setShowCreate(false);
      setForm({ name: '', condition: 'failure_rate', threshold: 10, channels: ['email'] });
      fetchAlerts();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('createFailed'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const deleteAlert = (id: string) => {
    setDeleteId(id);
  };

  const confirmDeleteAlert = async () => {
    if (!deleteId || !token) return;
    try {
      await alertsApi.delete(token, deleteId);
      fetchAlerts();
    } catch (err) {
      toast(err instanceof Error ? err.message : t('deleteFailed'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const testAlert = async (id: string) => {
    if (!token) return;
    try {
      await alertsApi.test(token, id);
      toast(t('testSent'), 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : t('testFailed'), 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition"
        >
          {showCreate ? t('cancel') : t('newAlert')}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('namePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('condition')}</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="failure_rate">{t('conditions.failureRate')}</option>
                <option value="latency">{t('conditions.latency')}</option>
                <option value="consecutive_failures">{t('conditions.consecutiveFailures')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('threshold')}</label>
              <input
                type="number"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('channels')}</label>
              <div className="flex gap-2">
                {['slack', 'email', 'webhook'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      setForm({
                        ...form,
                        channels: form.channels.includes(ch)
                          ? form.channels.filter((c) => c !== ch)
                          : [...form.channels, ch],
                      });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      form.channels.includes(ch)
                        ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/30'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600'
                    }`}
                  >
                    {CHANNEL_ICONS[ch]} {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={createAlert}
              disabled={creating || !form.name}
              className="px-6 py-3 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60"
            >
              {creating ? tc('creating') : t('create')}
            </button>
          </div>
        </div>
      )}

      {/* Alert List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-500">{tc('loading')}</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-500">
            {t('empty')}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{alert.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      alert.is_active
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                    }`}>
                      {alert.is_active ? t('active') : t('paused')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {CONDITION_LABELS[alert.condition] || alert.condition} {alert.threshold}
                    {alert.condition === 'failure_rate' && '%'}
                    {alert.condition === 'latency' && 'ms'}
                    {' · '}
                    {alert.channels.map((ch) => CHANNEL_ICONS[ch] || ch).join(' ')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testAlert(alert.id)}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-slate-600 rounded-lg transition"
                  >
                    {t('test')}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-500/30 rounded-lg transition"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!deleteId}
        title={t('deleteTitle')}
        message={t('deleteConfirm')}
        confirmLabel={t('delete')}
        variant="danger"
        onConfirm={confirmDeleteAlert}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
