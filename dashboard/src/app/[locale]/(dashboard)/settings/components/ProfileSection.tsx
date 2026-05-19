'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';
import { Lock, Check } from 'lucide-react';

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

  // Email change flow
  const [emailChangeStep, setEmailChangeStep] = useState<'idle' | 'code-sent' | 'done'>('idle');
  const [emailChangeCode, setEmailChangeCode] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeTimer, setEmailChangeTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Save name only
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const { api } = await import('@/lib/api');
      await api.put('/auth/profile', { name: profileName }, token ?? undefined);
      setProfileSuccess(tc('success'));
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setProfileSuccess(''), 3000);
    } catch (e: unknown) {
      setProfileError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setProfileSaving(false);
    }
  };

  // Step 1: Send code to new email
  const handleRequestEmailChange = async () => {
    const newEmail = profileEmail.toLowerCase().trim();
    if (!newEmail || newEmail === (user?.email || '').toLowerCase()) return;
    setProfileError('');
    setProfileSuccess('');
    setEmailChangeLoading(true);
    try {
      const { apiFetch } = await import('@/lib/api');
      await apiFetch('/auth/request-email-change', {
        method: 'POST',
        body: { new_email: newEmail },
        token: token ?? undefined,
      });
      setEmailChangeStep('code-sent');
      setEmailChangeTimer(900);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setEmailChangeTimer((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setProfileSuccess(t('emailChangeCodeSent') || 'A verification code has been sent to your new email address.');
    } catch (e: unknown) {
      setProfileError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Step 2: Verify code and change email
  const handleConfirmEmailChange = async () => {
    if (emailChangeCode.length !== 6) return;
    setProfileError('');
    setProfileSuccess('');
    setEmailChangeLoading(true);
    try {
      const { apiFetch } = await import('@/lib/api');
      const data = await apiFetch<{ new_email: string }>('/auth/confirm-email-change', {
        method: 'POST',
        body: { code: emailChangeCode },
        token: token ?? undefined,
      });
      setEmailChangeStep('done');
      setProfileSuccess(t('emailChangedSuccess') || `Email changed successfully to ${data.new_email}`);
      setProfileEmail(data.new_email);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } catch (e: unknown) {
      setProfileError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleCancelEmailChange = () => {
    setEmailChangeStep('idle');
    setEmailChangeCode('');
    setProfileEmail(user?.email || '');
    setProfileError('');
    setProfileSuccess('');
    if (intervalRef.current) clearInterval(intervalRef.current);
    setEmailChangeTimer(0);
  };

  const handleResendCode = async () => {
    setEmailChangeCode('');
    await handleRequestEmailChange();
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isValidEmail = (email: string): boolean => {
    const e = email.trim();
    if (!e || e.length > 254) return false;
    if (e.includes(' ') || e.includes('\t')) return false;
    const parts = e.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || local.length > 64) return false;
    if (!domain || !domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return false;
    return true;
  };

  const emailChanged = profileEmail.toLowerCase().trim() !== (user?.email || '').toLowerCase();
  const emailValid = isValidEmail(profileEmail);

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
            <Check size={16} strokeWidth={1.75} className="text-green-500" /> {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
            {profileError}
          </div>
        )}

        {/* Name Form */}
        <form onSubmit={handleProfileSave} className="space-y-4">
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

          {/* Password confirmation for email change */}
          {showPasswordConfirm && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                <Lock size={16} strokeWidth={1.75} className="inline mr-1" />
                {t('emailChangePasswordRequired') || 'Changing your email requires password confirmation. Your email will need to be verified again.'}
              </p>
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder={t('enterPassword') || 'Enter your password'}
                className="w-full px-3.5 py-2.5 text-sm border border-amber-300 dark:border-amber-500/30 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition mb-3"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancelEmailChange}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                >
                  {tc('cancel')}
                </button>
              </div>
            </div>
          )}


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

        {/* Email Change Section */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
          <label htmlFor="profile-email" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            {t('emailAddress')}
          </label>

          {emailChangeStep === 'done' ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
              <span className="text-base">✅</span>
              <span className="text-sm text-green-700 dark:text-green-400">{t('emailChangedSuccess') || 'Email changed successfully'}</span>
            </div>
          ) : emailChangeStep === 'code-sent' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <span className="text-base">📧</span>
                <span className="text-sm text-blue-700 dark:text-blue-400">
                  {t('codeSentTo') || 'Code sent to'} <strong>{profileEmail}</strong>
                  {emailChangeTimer > 0 && <span className="ml-2 text-xs opacity-70">({formatTimer(emailChangeTimer)})</span>}
                </span>
              </div>
              <input
                type="text"
                value={emailChangeCode}
                onChange={(e) => setEmailChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEmailChange}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                >
                  {tc('cancel')}
                </button>
                {emailChangeTimer === 0 && (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={emailChangeLoading}
                    className="flex-1 py-2.5 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-500/20 transition disabled:opacity-50"
                  >
                    {t('resendCode') || 'Resend Code'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirmEmailChange}
                  disabled={emailChangeLoading || emailChangeCode.length !== 6}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {emailChangeLoading ? tc('verifying') || 'Verifying...' : t('verifyCode') || 'Verify'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={handleRequestEmailChange}
                  disabled={emailChangeLoading || !emailChanged || !emailValid}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-40 whitespace-nowrap"
                >
                  {emailChangeLoading ? tc('sending') || 'Sending...' : t('changeEmail') || 'Change Email'}
                </button>
              </div>
              {emailChanged && !emailValid && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  {t('invalidEmail') || 'Please enter a valid email address.'}
                </p>
              )}
              {emailChanged && emailValid && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  🔒 {t('emailChangeNotice') || 'A verification code will be sent to the new email address.'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
