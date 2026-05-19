'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import type { FeatureFlagValidated } from '@/schemas/api';
import { Flag } from 'lucide-react';
import {
  useAdminFeatureFlags,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
} from '@/hooks/useAdminData';

export default function FeatureFlagsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('featureFlags');
  const ta = useTranslations('admin');

  const { data, isLoading } = useAdminFeatureFlags();
  const flags = data?.flags ?? [];
  const createMutation = useCreateFeatureFlag();
  const updateMutation = useUpdateFeatureFlag();
  const deleteMutation = useDeleteFeatureFlag();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<FeatureFlagValidated | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeatureFlagValidated | null>(null);

  // Create form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEnabled, setNewEnabled] = useState(false);
  const [newRollout, setNewRollout] = useState(100);
  const [newPlans, setNewPlans] = useState<string[]>([]);

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEnabled, setEditEnabled] = useState(false);
  const [editRollout, setEditRollout] = useState(100);
  const [editPlans, setEditPlans] = useState<string[]>([]);

  const PLAN_OPTIONS = ['developer', 'startup', 'pro', 'enterprise'];

  /* ─── Create ─── */
  const handleCreate = async () => {
    if (!token || !newName.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: newName.trim(),
        description: newDesc || undefined,
        is_enabled: newEnabled,
        rollout_percentage: newRollout,
        enabled_for_plans: newPlans,
      });
      toast(t('created'), 'success');
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      setNewEnabled(false);
      setNewRollout(100);
      setNewPlans([]);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('createFailed'), 'error');
    }
  };

  /* ─── Edit ─── */
  const openEdit = (flag: FeatureFlagValidated) => {
    setEditTarget(flag);
    setEditName(flag.name);
    setEditDesc(flag.description || '');
    setEditEnabled(flag.is_enabled);
    setEditRollout(flag.rollout_percentage ?? 100);
    setEditPlans(flag.enabled_for_plans || []);
  };

  const handleSave = async () => {
    if (!token || !editTarget) return;
    try {
      await updateMutation.mutateAsync({
        id: editTarget.id,
        data: {
          name: editName,
          description: editDesc || undefined,
          is_enabled: editEnabled,
          rollout_percentage: editRollout,
          enabled_for_plans: editPlans,
        },
      });
      toast(t('updated'), 'success');
      setEditTarget(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : t('updateFailed'), 'error');
    }
  };

  /* ─── Quick Toggle ─── */
  const handleToggle = (flag: FeatureFlagValidated) => {
    if (!token) return;
    updateMutation.mutate(
      { id: flag.id, data: { is_enabled: !flag.is_enabled } },
      {
        onError: () => toast(t('updateFailed'), 'error'),
      },
    );
  };

  /* ─── Delete ─── */
  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast(t('deleted'), 'success');
      setDeleteTarget(null);
    } catch {
      toast(t('deleteFailed'), 'error');
    }
  };

  const togglePlan = (plan: string, plans: string[], setter: (p: string[]) => void) => {
    setter(plans.includes(plan) ? plans.filter((p) => p !== plan) : [...plans, plan]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"><Flag size={16} strokeWidth={1.75} className="inline mr-1" /> {t('pageTitle')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('pageDesc')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-brand-700 transition"
        >
          + {t('createFlag')}
        </button>
      </div>

      {/* Flags List — below the fold, lazy loaded */}
      <LazySection fallback={Skeletons.table()} rootMargin={300}>
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center animate-pulse text-gray-500 dark:text-slate-400">{t('loading')}</div>
        ) : flags.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">
            <span className="text-4xl mb-3 block"><Flag size={18} strokeWidth={1.75} /></span>
            <p>{t('emptyState')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {flags.map((flag) => (
              <div key={flag.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={flag.is_enabled}
                      onClick={() => handleToggle(flag)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                        flag.is_enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                        flag.is_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{flag.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          flag.is_enabled
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                        }`}>
                          {flag.is_enabled ? ta('flagActive') : ta('flagInactive')}
                        </span>
                      </div>
                      {flag.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">{flag.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Rollout */}
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{flag.rollout_percentage ?? 100}%</span>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{t('rollout')}</p>
                    </div>

                    {/* Plans */}
                    <div className="flex gap-1">
                      {flag.enabled_for_plans && flag.enabled_for_plans.length > 0 ? (
                        flag.enabled_for_plans.map((plan) => (
                          <span key={plan} className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                            {plan}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-slate-500">{t('allPlans')}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(flag)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">{t('editTitle')}</button>
                      <button type="button" onClick={() => setDeleteTarget(flag)} className="text-xs text-red-600 dark:text-red-400 hover:underline">{t('deleteTitle')}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </LazySection>

      {/* ─── Create Modal ─── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('name')} *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('namePlaceholder')} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('description')}</label>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder={t('descPlaceholder')} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('enabled')}</label>
                <button type="button" role="switch" aria-checked={newEnabled} onClick={() => setNewEnabled(!newEnabled)} className={`relative w-11 h-6 rounded-full transition-colors ${newEnabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${newEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('rolloutLabel', { pct: newRollout })}</label>
                <input type="range" min="0" max="100" value={newRollout} onChange={(e) => setNewRollout(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('plansLabel')}</label>
                <div className="flex gap-2 flex-wrap">
                  {PLAN_OPTIONS.map((plan) => (
                    <button key={plan} type="button" onClick={() => togglePlan(plan, newPlans, setNewPlans)} className={`px-3 py-1 rounded-full text-xs font-medium transition ${newPlans.includes(plan) ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{ta('cancel')}</button>
              <button type="button" onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50">{createMutation.isPending ? t('creating') : t('createFlag')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('editTitle')}: {editTarget.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('name')}</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('description')}</label>
                <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('enabled')}</label>
                <button type="button" role="switch" aria-checked={editEnabled} onClick={() => setEditEnabled(!editEnabled)} className={`relative w-11 h-6 rounded-full transition-colors ${editEnabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${editEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('rolloutLabel', { pct: editRollout })}</label>
                <input type="range" min="0" max="100" value={editRollout} onChange={(e) => setEditRollout(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('plansLabel')}</label>
                <div className="flex gap-2 flex-wrap">
                  {PLAN_OPTIONS.map((plan) => (
                    <button key={plan} type="button" onClick={() => togglePlan(plan, editPlans, setEditPlans)} className={`px-3 py-1 rounded-full text-xs font-medium transition ${editPlans.includes(plan) ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{ta('cancel')}</button>
              <button type="button" onClick={handleSave} disabled={updateMutation.isPending} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50">{updateMutation.isPending ? t('saving') : ta('save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('deleteTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {t('deleteConfirm', { name: deleteTarget.name })}
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">{ta('cancel')}</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">{ta('delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
