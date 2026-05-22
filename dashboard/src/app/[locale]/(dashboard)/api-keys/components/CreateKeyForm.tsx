'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RoleGuard } from '@/components/RoleGuard';

export function CreateKeyForm({
  onCreate,
}: {
  onCreate: (name?: string) => Promise<void>;
}) {
  const t = useTranslations('apiKeys');
  const tc = useTranslations('common');
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await onCreate(keyName || undefined);
      setKeyName('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createNewKey')}</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder={t('keyNamePlaceholder')}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        />
        <RoleGuard require="canManageApiKeys">
          <button type="button"
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-3 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 whitespace-nowrap"
          >
          {creating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {tc('creating')}
            </span>
          ) : (
            t('createKey')
          )}
        </button>
        </RoleGuard>
      </div>
    </div>
  );
}
