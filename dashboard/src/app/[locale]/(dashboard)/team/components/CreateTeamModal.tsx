'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function CreateTeamModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const t = useTranslations('team');
  const tc = useTranslations('common');
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await onCreate(name.trim());
      setName('');
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with gradient accent */}
        <div className="px-6 pt-6 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('createTitle')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Set up a new team for your organization</p>
        </div>

        <div className="px-6 pb-2">
          <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t('teamNameLabel')}
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('teamNamePlaceholder')}
            autoFocus
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-gray-100 dark:border-slate-700/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition"
          >
            {tc('cancel')}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition shadow-sm shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {creating ? tc('creating') : t('createTeamBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
