'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';

export function PasswordSection({ token }: { token: string | null }) {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);
    try {
      const { api } = await import('@/lib/api');
      await api.put('/auth/password', { current_password: currentPassword, new_password: newPassword }, token ?? undefined);
      setPasswordSuccess(tc('success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (e: unknown) {
      setPasswordError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <span className="text-base">🔑</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('changePassword')}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">{t('changePasswordDesc')}</p>
        </div>
      </div>

      {passwordSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          <span className="text-base">✓</span> {passwordSuccess}
        </div>
      )}
      {passwordError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
          {passwordError}
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-3.5">
        <div>
          <label htmlFor="current-password" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('currentPassword')}</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('newPassword')}</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('confirmNewPassword')}</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500">{t('passwordMinLength')}</p>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={passwordSaving}
            className="px-5 py-2 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 shadow-sm"
          >
            {passwordSaving ? tc('saving') : t('changePassword')}
          </button>
        </div>
      </form>
    </div>
  );
}
