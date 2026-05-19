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
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Banner */}
      <div className="h-20 bg-linear-to-r from-brand-500 via-purple-500 to-pink-500" />

      {/* Avatar + Info */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-10 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white dark:ring-slate-800 shadow-lg">
            {(profileName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="pb-1">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</div>
          </div>
          <div className="ml-auto pb-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20">
              {user?.plan || 'developer'}
            </span>
          </div>
        </div>

        {/* Success / Error */}
        {profileSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            <span className="text-base">✓</span> {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
            {profileError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                {t('displayName')}
              </label>
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                {t('emailAddress')}
              </label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 shadow-sm"
            >
              {profileSaving ? tc('saving') : tc('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
