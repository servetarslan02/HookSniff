'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, Pencil, Shield } from '@/components/icons';

const ROLE_OPTIONS = ['admin', 'editor', 'viewer'] as const;

const ROLE_META: Record<string, { icon: React.ReactNode; desc: string; style: string }> = {
  admin: { icon: <Shield size={16} strokeWidth={1.75} />, desc: 'Full access to manage team and settings', style: 'border-purple-200 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/5' },
  editor: { icon: <Pencil size={16} strokeWidth={1.75} />, desc: 'Can create and edit resources', style: 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5' },
  viewer: { icon: <Eye size={16} strokeWidth={1.75} />, desc: 'Read-only access to view resources', style: 'border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-700/30' },
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('inviteTitle')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Send an invitation to join this team</p>
        </div>

        <div className="px-6 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              {t('emailLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                autoFocus
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t('roleLabel')}
            </label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((r) => {
                const meta = ROLE_META[r];
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${meta.style} border-brand-300 dark:border-brand-500/40 ring-1 ring-brand-200 dark:ring-brand-500/20`
                        : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg">{meta.icon}</span>
                    <div className="text-left flex-1">
                      <p className={`text-sm font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>
                        {roleLabel(t, r)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{meta.desc}</p>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 mt-4 bg-gray-50 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-gray-100 dark:border-slate-700/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition"
          >
            {tc('cancel')}
          </button>
          <button
            type="button"
            onClick={handleInvite}
            disabled={!email.trim() || inviting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {inviting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {inviting ? tc('sending') : t('sendInvite')}
          </button>
        </div>
      </div>
    </div>
  );
}
