'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { environmentsApi } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

export default function EnvironmentsPage() {
  const t = useTranslations('environments');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#22c55e');

  const { data: envs = [], isLoading } = useQuery({
    queryKey: ['environments'],
    queryFn: () => environmentsApi.list(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug?: string; description?: string; color?: string }) =>
      environmentsApi.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      setShowCreate(false);
      setNewName(''); setNewSlug(''); setNewDesc('');
      toast(t('environmentCreated'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => environmentsApi.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] });
      toast(t('environmentDeleted'), 'success');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName, slug: newSlug || undefined, description: newDesc || undefined, color: newColor });
  };

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

      {/* Create Environment Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('createEnvironment')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('subtitle')}</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center gap-3">
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-600" />
                  <input value={newColor} onChange={e => setNewColor(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowCreate(false); setNewName(''); setNewSlug(''); setNewDesc(''); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {t('cancel')}
              </button>
              <button onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()} className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60 shadow-sm">
                {createMutation.isPending ? t('creating') : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('loading')}</div>
      ) : envs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🌐</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('noEnvironments')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('noEnvironmentsDesc')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {envs.map(env => (
            <div key={env.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: env.color || '#6b7280' }} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{env.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{env.slug}</p>
                  </div>
                </div>
                {env.is_default && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">{t('default')}</span>
                )}
              </div>
              {env.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{env.description}</p>}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500">{env.variable_count ?? 0} {t('variables')}</span>
                <button onClick={() => deleteMutation.mutate(env.id)} className="text-xs text-red-500 hover:text-red-700">{t('delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
