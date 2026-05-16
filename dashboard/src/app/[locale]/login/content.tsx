'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState } from 'react';
import { useRouter, Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

function getPasswordStrength(pw: string): { score: number; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, color: 'bg-red-500' };
  if (score <= 4) return { score, color: 'bg-yellow-500' };
  return { score, color: 'bg-green-500' };
}

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const passwordStrength = mode === 'register' ? getPasswordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && !consentChecked) {
      setError(t('consentRequired'));
      return;
    }
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(email, password);
      } else {
        user = await register(email, password, name || undefined);
        // Email verification flow — user needs to verify before login
        if (user && !user.id) {
          setSuccess(t('verifyEmailSent') || 'A verification email has been sent. Please check your inbox and verify your email before logging in.');
          setLoading(false);
          return;
        }
      }
      const redirectTo = searchParams.get('redirect') || (user?.is_admin ? '/admin' : '/core');
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(getErrorMessage(err, tc('unknownError')) || tc('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md page-enter">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl">
              🪝
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? t('loginTitle') : t('signupTitle')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {mode === 'login' ? t('loginSubtitle') : t('signupSubtitle')}
          </p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm border border-green-200 dark:border-green-500/20">
              ✉️ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
              {mode === 'login' && (
                <div className="mt-2 text-right">
                  <Link href="/forgot-password" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
                    {t('forgotPassword')}
                  </Link>
                </div>
              )}
              {passwordStrength && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength.score >= i * 2 ? passwordStrength.color : 'bg-gray-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.score <= 2 ? 'text-red-500' :
                    passwordStrength.score <= 4 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {passwordStrength.score <= 2 ? t('passwordWeak') :
                     passwordStrength.score <= 4 ? t('passwordMedium') : t('passwordStrong')}
                  </p>
                </div>
              )}
            </div>
            {mode === 'register' && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm border-gray-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-600 dark:text-slate-400">
                  {t('consentPrefix')}{' '}
                  <Link href="/terms" className="text-brand-600 dark:text-brand-400 hover:underline">{t('consentTerms')}</Link>
                  {' '}{t('consentAnd')}{' '}
                  <Link href="/privacy" className="text-brand-600 dark:text-brand-400 hover:underline">{t('consentPrivacy')}</Link>
                </label>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 flex items-center justify-center gap-2 btn-ripple"
            >
              {loading && <LoadingSpinner size="sm" />}
              {mode === 'login' ? t('signIn') : t('createAccount')}
            </button>
          </form>

          {/* OAuth Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">{t('orContinueWith')}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
                  window.location.href = `${API}/oauth/google`;
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
                  window.location.href = `${API}/oauth/github`;
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                {t('noAccount')}{' '}
                <button onClick={() => { setMode('register'); setConsentChecked(false); }} className="text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300">
                  {t('signUp')}
                </button>
              </>
            ) : (
              <>
                {t('hasAccount')}{' '}
                <button onClick={() => setMode('login')} className="text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300">
                  {t('signIn')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPageContent() {
  return <LoginForm />;
}
