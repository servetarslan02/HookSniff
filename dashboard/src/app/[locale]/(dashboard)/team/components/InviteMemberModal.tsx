'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const ROLE_OPTIONS = ['admin', 'editor', 'viewer'] as const;

function roleLabel(t: ReturnType<typeof useTranslations>, role: string): string {
  const map: Record<string, string> = { admin: t('roleAdmin'), editor: t('roleEditor'), viewer: t('roleViewer') };
  return map[role] || role;
}

export function InviteMemberModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => Promise<void>;
}) {
  const t = useTranslations('team');
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);

  if (!open) return null;

  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    try {
      await onInvite(email.trim(), role);
      setEmail('');
      setRole('viewer');
      onClose();
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inviteTitle')}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('emailLabel')}</label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('roleLabel')}</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{roleLabel(t, r)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {tc('cancel')}
          </button>
          <button type="button"
            onClick={handleInvite}
            disabled={!email.trim() || inviting}
            className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
          >
            {inviting ? tc('sending') : t('sendInvite')}
          </button>
        </div>
      </div>
    </div>
  );
}
