'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getErrorMessage } from '@/lib/errors';
import { CheckCircle2, Lock, Check, Mail, User, Shield, Crown, Camera } from 'lucide-react';

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
  const [showPasswordConfirm, _setShowPasswordConfirm] = useState(false);
  const [emailPassword, setEmailPassword] = useState('');
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
      setProfileSuccess(t('emailChangeCodeSent') || 'A verification code has been sent to your new email address.');
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
  const planLabel = (user?.plan || 'developer').charAt(0).toUpperCase() + (user?.plan || 'developer').slice(1);

  return (
    <div className="space-y-6">
      {/* ── Profile Header Card ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Gradient Banner */}
        <div className="h-28 bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white dark:ring-slate-800 shadow-xl">
                {(profileName || user?.email || 'U')[0].toUpperCase()}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title={t('changeAvatar') || 'Change avatar'}
              >
                <Camera size={13} strokeWidth={1.75} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Name + Email */}
            <div className="flex-1 min-w-0 pb-0.5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>

            {/* Plan Badge */}
            <div className="flex items-center gap-2 pb-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-500/10 dark:to-purple-500/10 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/20">
                <Crown size={13} strokeWidth={1.75} />
                {planLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success / Error Messages ── */}
      {profileSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
            <Check size={16} strokeWidth={1.75} className="text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-green-700 dark:text-green-400">{profileSuccess}</p>
        </div>
      )}
      {profileError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <Shield size={16} strokeWidth={1.75} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-red-700 dark:text-red-400">{profileError}</p>
        </div>
      )}

      {/* ── Profile Form ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} strokeWidth={1.75} className="text-gray-400 dark:text-slate-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">{t('personalInfo') || 'Personal Information'}</h3>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Name Field */}
          <div>
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
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          {/* Password confirmation for email change */}
          {showPasswordConfirm && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                <Lock size={16} strokeWidth={1.75} className="inline mr-1" />
                {t('emailChangePasswordRequired') || 'Changing your email requires password confirmation.'}
              </p>
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder={t('enterPassword') || 'Enter your password'}
                className="w-full px-4 py-2.5 text-sm border border-amber-300 dark:border-amber-500/30 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition mb-3"
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

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 shadow-sm"
            >
              {profileSaving ? tc('saving') : tc('save')}
            </button>
          </div>
        </form>
      </div>

      {/* ── Email Change Section ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail size={16} strokeWidth={1.75} className="text-gray-400 dark:text-slate-500" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">{t('emailAddress')}</h3>
        </div>

        {emailChangeStep === 'done' ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={16} strokeWidth={1.75} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-green-700 dark:text-green-400">{t('emailChangedSuccess') || 'Email changed successfully'}</span>
          </div>
        ) : emailChangeStep === 'code-sent' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <Mail size={16} strokeWidth={1.75} className="text-blue-600 dark:text-blue-400" />
              </div>
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
              className="w-full px-4 py-3.5 text-center text-2xl font-mono tracking-[0.5em] border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
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
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                <Shield size={12} strokeWidth={1.75} /> {t('invalidEmail') || 'Please enter a valid email address.'}
              </p>
            )}
            {emailChanged && emailValid && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Lock size={12} strokeWidth={1.75} /> {t('emailChangeNotice') || 'A verification code will be sent to the new email address.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
