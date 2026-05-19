'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { API_BASE } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

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

function ResetPasswordContent() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    if (!token) {
      setStatus('error');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message || t('resetFailed'));
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  if (!token || status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4">
        <div className="w-full max-w-md text-center page-enter">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl">🪝</div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
          <div className="glass-card p-8">
            <div className="text-6xl mb-4"><X size={48} strokeWidth={1.5} className="text-red-500" /></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('invalidResetLink')}</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">{t('invalidResetLinkDesc')}</p>
            <Link href="/forgot-password" className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition">
              {t('requestNewLink')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4">
        <div className="w-full max-w-md text-center page-enter">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl">🪝</div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
          <div className="glass-card p-8">
            <div className="text-6xl mb-4"><Check size={48} strokeWidth={1.5} className="text-emerald-500" /></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('passwordResetSuccess')}</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">{t('passwordResetSuccessDesc')}</p>
            <Link href="/login" className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition">
              {t('goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md page-enter">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl">🪝</div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('resetPasswordTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('resetPasswordSubtitle')}</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('newPassword')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
                minLength={8}
                autoFocus
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.score >= i * 2 ? passwordStrength.color : 'bg-gray-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.score <= 2 ? 'text-red-500' : passwordStrength.score <= 4 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {passwordStrength.score <= 2 ? t('passwordWeak') : passwordStrength.score <= 4 ? t('passwordMedium') : t('passwordStrong')}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {t('resetPassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
