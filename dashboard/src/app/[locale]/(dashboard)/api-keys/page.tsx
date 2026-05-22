'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useRotateApiKey } from '@/hooks/useDashboardData';
import { RoleGuard, ReadOnlyBadge } from '@/components/RoleGuard';

export default function ApiKeysPage() {
  const t = useTranslations('apiKeys');
  const tc = useTranslations('common');
  const { data: keys = [], isLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const deleteKey = useDeleteApiKey();
  const rotateKey = useRotateApiKey();

  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    createKey.mutate(newKeyName.trim(), {
      onSuccess: (data) => {
        setRevealedKey(data.key);
        setNewKeyName('');
      },
    });
  };

  const handleRotate = (id: string) => {
    rotateKey.mutate(id, {
      onSuccess: (data) => setRevealedKey(data.key),
    });
  };

  const handleDelete = (id: string) => {
    deleteKey.mutate(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        <ReadOnlyBadge />
      </div>

      {/* Create Key */}
      <RoleGuard require="canManageApiKeys">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createKey')}</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={t('keyNamePlaceholder')}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
            />
            <button
              onClick={handleCreate}
              disabled={createKey.isPending || !newKeyName.trim()}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {createKey.isPending ? tc('loading') : t('create')}
            </button>
          </div>
        </div>
      </RoleGuard>

      {/* Revealed Key Banner */}
      {revealedKey && (
        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4">
          <p className="text-sm text-green-800 dark:text-green-300 mb-2">{t('keyCreated')}</p>
          <code className="text-sm font-mono bg-green-100 dark:bg-green-500/20 px-3 py-1 rounded-sm select-all">{revealedKey}</code>
          <button onClick={() => setRevealedKey(null)} className="ml-3 text-sm text-green-700 dark:text-green-400 underline">{tc('close')}</button>
        </div>
      )}

      {/* Key List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400">{t('noKeys')}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {keys.map((key) => (
              <div key={key.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{key.name || t('unnamedKey')}</div>
                  <div className="text-xs font-mono text-gray-500 dark:text-slate-400 mt-1">{key.api_key_prefix}...</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {t('created')}: {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && ` · ${t('lastUsed')}: ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${key.is_active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                    {key.is_active ? tc('active') : tc('inactive')}
                  </span>
                  <RoleGuard require="canManageApiKeys">
                    <button onClick={() => handleRotate(key.id)} disabled={rotateKey.isPending} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">{t('rotate')}</button>
                    {deleteConfirm === key.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDelete(key.id)} disabled={deleteKey.isPending} className="text-sm text-red-600 hover:underline">{tc('confirm')}</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-sm text-gray-500 hover:underline">{tc('cancel')}</button>
                      </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(key.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline">{tc('delete')}</button>
                  )}
                  </RoleGuard>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
