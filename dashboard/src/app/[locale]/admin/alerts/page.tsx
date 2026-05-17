'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import { useState } from 'react';
import { useAdminAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert } from '@/hooks/useAdminData';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import type { AlertRuleAdmin } from '@/lib/api';

export default function AdminAlertsPage() {
  const t = useTranslations('admin');
  
  const CONDITIONS = [
    { value: 'failure_rate', label: t('conditionFailureRate'), icon: '📉' },
    { value: 'latency', label: t('conditionLatency'), icon: '⏱️' },
    { value: 'consecutive_failures', label: t('conditionConsecutive'), icon: '🔴' },
  ];

  const CHANNELS = [
    { value: 'email', label: t('channelEmail'), icon: '📧' },
    { value: 'slack', label: t('channelSlack'), icon: '💬' },
    { value: 'webhook', label: t('channelWebhook'), icon: '🔗' },
  ];

  const CONDITION_DEFAULTS: Record<string, number> = {
    failure_rate: 95,
    latency: 5000,
    consecutive_failures: 10,
  };
  const { toast } = useToast();

  // React Query hooks
  const { data: alerts = [], isLoading } = useAdminAlerts();
  const createMutation = useCreateAlert();
  const updateMutation = useUpdateAlert();
  const deleteMutation = useDeleteAlert();

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCondition, setFormCondition] = useState('failure_rate');
  const [formThreshold, setFormThreshold] = useState('10');
  const [formChannels, setFormChannels] = useState<string[]>(['email']);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'active') return a.is_active;
    if (filter === 'inactive') return !a.is_active;
    return true;
  });

  const activeCount = alerts.filter((a) => a.is_active).length;

  const resetForm = () => {
    setFormName('');
    setFormCondition('failure_rate');
    setFormThreshold('10');
    setFormChannels(['email']);
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (alert: AlertRuleAdmin) => {
    setFormName(alert.name);
    setFormCondition(alert.condition);
    setFormThreshold(alert.threshold.toString());
    setFormChannels(alert.channels);
    setEditingId(alert.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (saving) return;
    if (!formName.trim() || !formThreshold) return;
    if (formChannels.length === 0) { toast(t('selectChannel') || 'Select at least one channel', 'error'); return; }
    const threshold = parseInt(formThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      toast(t('invalidThreshold') || 'Threshold must be positive', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: { name: formName.trim(), condition: formCondition, threshold, channels: formChannels },
        });
        toast(t('alertUpdated') || t('alertUpdated'), 'success');
      } else {
        await createMutation.mutateAsync({
          name: formName.trim(),
          condition: formCondition,
          threshold,
          channels: formChannels,
        });
        toast(t('alertCreated') || t('alertCreated'), 'success');
      }
      resetForm();
    } catch {
      toast(t('alertSaveFailed') || t('alertSaveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (alert: AlertRuleAdmin) => {
    if (togglingId) return;
    setTogglingId(alert.id);
    try {
      await updateMutation.mutateAsync({ id: alert.id, data: { is_active: !alert.is_active } });
    } catch {
      toast(t('alertToggleFailed') || 'Failed to toggle alert', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('confirmDeleteAlert', { name }) || `Delete alert "${name}"?`)) return;
    setDeleting(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast(t('alertDeleted') || 'Alert deleted', 'success');
    } catch {
      toast(t('alertDeleteFailed') || 'Failed to delete alert', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const toggleChannel = (ch: string) => {
    setFormChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-48 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-64" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔔 {t('alerts') || 'Alerts'}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {activeCount} {t('activeAlerts') || 'active'} · {alerts.length} {t('total') || 'total'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          + {t('createAlert') || 'Create Alert'}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === f
                ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 font-medium'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? `📋 ${t('all') || 'All'}` : f === 'active' ? `✅ ${t('active') || 'Active'}` : `⏸️ ${t('inactive') || 'Inactive'}`}
            {f === 'all' && ` (${alerts.length})`}
            {f === 'active' && ` (${activeCount})`}
            {f === 'inactive' && ` (${alerts.length - activeCount})`}
          </button>
        ))}
      </div>

      {/* Create/Edit Form + Alert List — below the fold, lazy loaded */}
      <LazySection fallback={Skeletons.card} rootMargin={300}>
      {/* Create/Edit Form */}
      {showForm && (
        <div className="glass-card p-6 border-2 border-red-200 dark:border-red-500/30">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? `✏️ ${t('editAlert') || 'Edit Alert'}` : `➕ ${t('createAlert') || 'Create Alert'}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('alertName') || 'Alert Name'}</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t('alertNamePlaceholder') || 'e.g. High Failure Rate'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('condition') || 'Condition'}</label>
              <select
                value={formCondition}
                onChange={(e) => {
                  const newCondition = e.target.value;
                  setFormCondition(newCondition);
                  // Update threshold to a sensible default for the new condition
                  if (!editingId && CONDITION_DEFAULTS[newCondition]) {
                    setFormThreshold(CONDITION_DEFAULTS[newCondition].toString());
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('threshold') || 'Threshold'}</label>
              <input
                type="number"
                min="1"
                value={formThreshold}
                onChange={(e) => setFormThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('channels') || 'Notification Channels'}</label>
              <div className="flex gap-2 flex-wrap">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => toggleChannel(ch.value)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      formChannels.includes(ch.value)
                        ? 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400'
                        : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {ch.icon} {ch.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formName.trim() || formChannels.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {saving ? (t('saving') || 'Saving...') : editingId ? (t('update') || 'Update') : (t('create') || 'Create')}
            </button>
          </div>
        </div>
      )}

      {/* Alert List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const cond = CONDITIONS.find((c) => c.value === alert.condition);
            return (
              <div
                key={alert.id}
                className={`glass-card p-4 flex items-center justify-between gap-4 transition ${
                  !alert.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    alert.is_active ? 'bg-red-100 dark:bg-red-500/20' : 'bg-gray-100 dark:bg-slate-800'
                  }`}>
                    {cond?.icon || '🔔'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{alert.name}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        alert.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                      }`}>
                        {alert.is_active ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                      </span>
                      {!alert.customer_id && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                          🌐 {t('platform') || 'Platform'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {cond?.label || alert.condition} {t('threshold') || 'threshold'}: {alert.threshold}
                      {' · '}
                      {alert.channels.map((ch) => {
                        const chDef = CHANNELS.find((c) => c.value === ch);
                        return chDef ? chDef.icon + ' ' + chDef.label : ch;
                      }).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(alert)}
                    disabled={togglingId === alert.id}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.is_active
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    } ${togglingId === alert.id ? 'opacity-50 cursor-wait' : ''}`}
                    title={alert.is_active ? (t('deactivate') || 'Deactivate') : (t('activate') || 'Activate')}
                  >
                    {togglingId === alert.id ? '⏳' : alert.is_active ? '✅' : '⏸️'}
                  </button>
                  <button
                    onClick={() => openEdit(alert)}
                    className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title={t('edit') || 'Edit'}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id, alert.name)}
                    disabled={deleting === alert.id}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40"
                    title={t('delete') || 'Delete'}
                  >
                    {deleting === alert.id ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">🔔</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? (t('noAlerts') || 'No alerts configured') : (t('noFilteredAlerts') || `No ${filter} alerts`)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            {t('alertsDescription') || 'Set up alerts to get notified when important events happen.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              + {t('createFirstAlert') || 'Create Your First Alert'}
            </button>
          )}
        </div>
      )}
      </LazySection>
    </div>
  );
}
