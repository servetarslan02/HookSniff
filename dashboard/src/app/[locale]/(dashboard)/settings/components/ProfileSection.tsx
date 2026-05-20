'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';
import { Check, Mail, Lock, Shield } from '@/components/icons';

interface User {
  name?: string | null;
  email?: string | null;
  plan?: string | null;
}

export function ProfileSection({ user, token }: { user: User | null; token: string | null }) {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [profileEmail, setProfileEmail] = useState(user?.email || '');
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
      setProfileSuccess(t('emailChangeCodeSent') || 'Verification code sent.');
    } catch (e: unknown) {
      setProfileError(getErrorMessage(e, tc('unknownError')));
    } finally {
      setEmailChangeLoading(false);
    }
  };

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
      setProfileSuccess(t('emailChangedSuccess') || `Email changed to ${data.new_email}`);
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
    <div className="space-y-5">
      {/* ── Toast ── */}
      {profileSuccess && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <Check size={15} strokeWidth={2} className="text-emerald-500 shrink-0" />
          <span className="text-sm text-emerald-700 dark:text-emerald-400">{profileSuccess}</span>
        </div>
      )}
      {profileError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <Shield size={15} strokeWidth={2} className="text-red-500 shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-400">{profileError}</span>
        </div>
      )}

      {/* ── Profile Card ── */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
        {/* Header row */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-slate-700/60">
          <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-slate-600 flex items-center justify-center text-white text-sm font-semibold">
            {(profileName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email}</div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wide bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
            {user?.plan || 'free'}
          </span>
        </div>

        {/* Name field */}
        <form onSubmit={handleProfileSave}>
          <div className="px-5 py-4">
            <label htmlFor="profile-name" className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">
              {t('displayName')}
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-gray-900 dark:focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700/60 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-4 py-1.5 bg-gray-900 dark:bg-slate-600 text-white rounded-lg text-xs font-medium hover:bg-gray-800 dark:hover:bg-slate-500 transition disabled:opacity-50"
            >
              {profileSaving ? tc('saving') : tc('save')}
            </button>
          </div>
        </form>
      </section>

      {/* ── Email Card ── */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <Mail size={14} strokeWidth={1.75} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('emailAddress')}</h3>
          </div>
        </div>

        <div className="px-5 py-4">
          {emailChangeStep === 'done' ? (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <Check size={15} strokeWidth={2} className="text-emerald-500" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400">{t('emailChangedSuccess') || 'Email changed'}</span>
            </div>
          ) : emailChangeStep === 'code-sent' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <Mail size={14} strokeWidth={1.75} className="text-blue-500" />
                <span className="text-xs text-blue-700 dark:text-blue-400">
                  {t('codeSentTo') || 'Code sent to'} <strong>{profileEmail}</strong>
                  {emailChangeTimer > 0 && <span className="ml-1 opacity-60">({formatTimer(emailChangeTimer)})</span>}
                </span>
              </div>
              <input
                type="text"
                value={emailChangeCode}
                onChange={(e) => setEmailChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-3 py-2.5 text-center text-lg font-mono tracking-[0.4em] border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-brand-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleCancelEmailChange}
                  className="flex-1 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                  {tc('cancel')}
                </button>
                {emailChangeTimer === 0 && (
                  <button type="button" onClick={handleResendCode} disabled={emailChangeLoading}
                    className="flex-1 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition disabled:opacity-50">
                    {t('resendCode') || 'Resend'}
                  </button>
                )}
                <button type="button" onClick={handleConfirmEmailChange} disabled={emailChangeLoading || emailChangeCode.length !== 6}
                  className="flex-1 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-slate-600 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-500 transition disabled:opacity-50">
                  {emailChangeLoading ? tc('verifying') || 'Verifying...' : t('verifyCode') || 'Verify'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-gray-900 dark:focus:ring-brand-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={handleRequestEmailChange}
                  disabled={emailChangeLoading || !emailChanged || !emailValid}
                  className="px-4 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-slate-600 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-500 transition disabled:opacity-40"
                >
                  {emailChangeLoading ? tc('sending') || 'Sending...' : t('changeEmail') || 'Change'}
                </button>
              </div>
              {emailChanged && !emailValid && (
                <p className="text-xs text-red-500 dark:text-red-400">{t('invalidEmail') || 'Invalid email.'}</p>
              )}
              {emailChanged && emailValid && (
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  <Lock size={11} className="inline mr-0.5 -mt-0.5" /> {t('emailChangeNotice') || 'Verification code will be sent.'}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
