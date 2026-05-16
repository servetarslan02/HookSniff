'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';

interface User {
  name?: string | null;
  email?: string | null;
  plan?: string | null;
}

export function ProfileSection({ user, token }: { user: User | null; token: string | null }) {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const { api } = await import('@/lib/api');
      await api.put('/auth/profile', { name: profileName, email: profileEmail }, token ?? undefined);
      setProfileSuccess(tc('success'));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setProfileSuccess(''), 3000);
    } catch (e: unknown) {
      setProfileError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('profile')}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('profileDesc')}</p>

      {profileSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-sm text-green-700 dark:text-green-400">
          ✓ {profileSuccess}
        </div>
      )}
      {profileError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
          {profileError}
        </div>
      )}

      <form onSubmit={handleProfileSave} className="space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {(profileName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Plan: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
                {user?.plan || 'developer'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('displayName')}</label>
          <input
            id="profile-name"
            type="text" autoComplete="name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('emailAddress')}</label>
          <input
            id="profile-email"
            type="email" autoComplete="email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="px-6 py-2.5 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60"
          >
            {profileSaving ? tc('saving') : tc('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
