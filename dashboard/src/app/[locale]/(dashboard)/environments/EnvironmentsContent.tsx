'use client';


import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { environmentsApi, type EnvironmentOut } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Globe, Lock } from '@/components/icons';

export function EnvironmentsContent() {
  const t = useTranslations('environments');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#22c55e');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Edit modal state
  const [editingEnv, setEditingEnv] = useState<EnvironmentOut | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIsDefault, setEditIsDefault] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<EnvironmentOut | null>(null);

  // Variables panel state
  const [varsTarget, setVarsTarget] = useState<EnvironmentOut | null>(null);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [newVarSecret, setNewVarSecret] = useState(false);

  const { data: envs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['environments'],
    queryFn: () => environmentsApi.list(token!),
    enabled: !!token,
  });

  // Variables query (only when varsTarget is set)
  const { data: variables = [], isLoading: varsLoading } = useQuery({
    queryKey: ['environment-variables', varsTarget?.id],
    queryFn: () => environmentsApi.listVariables(token!, varsTarget!.id),
    enabled: !!token && !!varsTarget,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug?: string; description?: string; color?: string; is_default?: boolean }) =>
      environmentsApi.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      resetCreateForm();
      toast(t('environmentCreated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; color?: string; is_default?: boolean } }) =>
      environmentsApi.update(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setEditingEnv(null);
      toast(t('environmentUpdated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => environmentsApi.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setDeleteTarget(null);
      if (varsTarget?.id === deleteTarget?.id) setVarsTarget(null);
      toast(t('environmentDeleted'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const createVarMutation = useMutation({
    mutationFn: (data: { key: string; value: string; is_secret?: boolean }) =>
      environmentsApi.createVariable(token!, varsTarget!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environment-variables', varsTarget?.id] });
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setNewVarKey(''); setNewVarValue(''); setNewVarSecret(false);
      toast(t('variableCreated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteVarMutation = useMutation({
    mutationFn: (varId: string) => environmentsApi.deleteVariable(token!, varsTarget!.id, varId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environment-variables', varsTarget?.id] });
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      toast(t('variableDeleted'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const resetCreateForm = () => {
    setShowCreate(false);
    setNewName(''); setNewSlug(''); setNewDesc(''); setNewColor('#22c55e'); setNewIsDefault(false);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      name: newName,
      slug: newSlug || undefined,
      description: newDesc || undefined,
      color: newColor,
      is_default: newIsDefault || undefined,
    });
  };

  const openEdit = (env: EnvironmentOut) => {
    setEditingEnv(env);
    setEditName(env.name);
    setEditDesc(env.description || '');
    setEditColor(env.color || '#6b7280');
    setEditIsDefault(env.is_default);
  };

  const handleUpdate = () => {
    if (!editingEnv || !editName.trim()) return;
    updateMutation.mutate({
      id: editingEnv.id,
      data: { name: editName, description: editDesc || undefined, color: editColor, is_default: editIsDefault },
    });
  };

  const handleCreateVar = () => {
    if (!newVarKey.trim() || !varsTarget) return;
    createVarMutation.mutate({ key: newVarKey, value: newVarValue, is_secret: newVarSecret });
  };

  const ENV_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          {t('newEnvironment')}
        </button>
      </div>

      {/* ── Loading Skeleton ── */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-slate-700" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
              </div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* ── Error State ── */}
      {!isLoading && error && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <span className="text-lg"><AlertTriangle size={18} strokeWidth={1.75} /></span>
            <div>
              <p className="font-medium">{t('loadError')}</p>
              <button type="button" onClick={() => refetch()} className="text-sm text-brand-600 dark:text-brand-400 hover:underline mt-1">
                {t('retry')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !error && envs.length === 0 && (
        <div className="glass-card p-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-3"><Globe size={18} strokeWidth={1.75} /></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('noEnvironments')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">{t('noEnvironmentsDesc')}</p>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
              {t('newEnvironment')}
            </button>
          </div>
        </div>
      )}

      {/* ── Environment Cards ── */}
      {!isLoading && !error && envs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {envs.map(env => (
            <div key={env.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: env.color || '#6b7280' }} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{env.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{env.slug}</p>
                  </div>
                </div>
                {env.is_default && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full shrink-0">{t('default')}</span>
                )}
              </div>
              {env.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{env.description}</p>}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setVarsTarget(env)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  {env.variable_count ?? 0} {t('variables')}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(env)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-slate-300">
                    {t('edit')}
                  </button>
                  <button onClick={() => setDeleteTarget(env)} className="text-xs text-red-500 hover:text-red-700">
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Environment Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={resetCreateForm} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('createEnvironment')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('subtitle')}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('namePlaceholder')} autoFocus
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('slug')}</label>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder={t('slugPlaceholder')}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-mono placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('description')}</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('color')}</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ENV_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-lg border-2 transition ${newColor === c ? 'border-brand-600 scale-110' : 'border-transparent hover:border-gray-300'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-600" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newIsDefault} onChange={e => setNewIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">{t('setAsDefault')}</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={resetCreateForm} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {t('cancel')}
              </button>
              <button onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()} className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60 shadow-sm">
                {createMutation.isPending ? t('creating') : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Environment Modal ── */}
      {editingEnv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setEditingEnv(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('editEnvironment')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{editingEnv.slug}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('name')}</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('description')}</label>
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder={t('descriptionPlaceholder')}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{t('color')}</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ENV_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setEditColor(c)}
                      className={`w-8 h-8 rounded-lg border-2 transition ${editColor === c ? 'border-brand-600 scale-110' : 'border-transparent hover:border-gray-300'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-600" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editIsDefault} onChange={e => setEditIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">{t('setAsDefault')}</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingEnv(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {t('cancel')}
              </button>
              <button onClick={handleUpdate} disabled={updateMutation.isPending || !editName.trim()} className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60 shadow-sm">
                {updateMutation.isPending ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('confirmDeleteTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
              {t('confirmDeleteDesc')} <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>?
            </p>
            {deleteTarget.is_default && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-4"><AlertTriangle size={16} strokeWidth={1.75} className="inline mr-1" /> {t('deleteDefaultWarning')}</p>
            )}
            {!deleteTarget.is_default && <div className="mb-4" />}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {t('cancel')}
              </button>
              <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 shadow-sm">
                {deleteMutation.isPending ? t('deleting') : t('confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Variables Panel (Slide-over) ── */}
      {varsTarget && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setVarsTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('variables')}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{varsTarget.name} ({varsTarget.slug})</p>
              </div>
              <button onClick={() => setVarsTarget(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Add Variable Form */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('addVariable')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input value={newVarKey} onChange={e => setNewVarKey(e.target.value)} placeholder={t('varKeyPlaceholder')}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
                  <input value={newVarValue} onChange={e => setNewVarValue(e.target.value)} placeholder={t('varValuePlaceholder')} type={newVarSecret ? 'password' : 'text'}
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newVarSecret} onChange={e => setNewVarSecret(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                    <span className="text-xs text-gray-600 dark:text-slate-400">{t('secret')}</span>
                  </label>
                  <button onClick={handleCreateVar} disabled={createVarMutation.isPending || !newVarKey.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition disabled:opacity-60">
                    {createVarMutation.isPending ? t('adding') : t('addVariableBtn')}
                  </button>
                </div>
              </div>

              {/* Variables List */}
              {varsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-12 bg-gray-100 dark:bg-slate-700 rounded-lg" />
                  ))}
                </div>
              ) : variables.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                  <p className="text-sm">{t('noVariables')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {variables.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg group">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{v.key}</span>
                          {v.is_secret && (
                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded"><Lock size={18} strokeWidth={1.75} /></span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-gray-500 dark:text-slate-400 truncate block">
                          {v.is_secret ? '••••••••' : v.value}
                        </span>
                      </div>
                      <button onClick={() => deleteVarMutation.mutate(v.id)} disabled={deleteVarMutation.isPending}
                        className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition ml-2 shrink-0">
                        {t('delete')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
