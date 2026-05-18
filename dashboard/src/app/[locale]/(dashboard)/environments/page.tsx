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

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('createEnvironment')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('namePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('slug')}</label>
              <input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder={t('slugPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder={t('descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('color')}</label>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={createMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {createMutation.isPending ? t('creating') : t('create')}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800">{t('cancel')}</button>
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
