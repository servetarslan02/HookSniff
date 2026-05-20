'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { API_BASE } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Mail } from '@/components/icons';

function ForgotPasswordContent() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error?.message || t('somethingWentWrong'));
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md page-enter">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl">
              🪝
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('forgotPasswordTitle')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('forgotPasswordSubtitle')}
          </p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4"><Mail size={48} strokeWidth={1.5} className="text-brand-600 dark:text-brand-400" /></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('resetEmailSent')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                {t('resetEmailSentDesc')}
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
              >
                {t('backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 dark:bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                {t('sendResetLink')}
              </button>
            </form>
          )}

          {!sent && (
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
              <Link href="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300">
                ← {t('backToLogin')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full" />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
