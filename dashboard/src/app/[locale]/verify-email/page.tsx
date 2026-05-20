'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Clock , Check, X } from '@/components/icons';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useToast } from '@/components/Toast';
import { API_BASE } from '@/lib/api';

function VerifyEmailContent() {
  const t = useTranslations('error');
  const tv = useTranslations('verifyEmail');
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage(tv('noToken'));
      return;
    }

    fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          setMessage(tv('verified'));
          toast(tv('verified'), 'success');
        } else {
          const data = await res.json().catch(() => ({}));
          if (data.error?.message?.includes('expired')) {
            setStatus('expired');
            setMessage(t('linkExpired'));
          } else {
            setStatus('error');
            setMessage(data.error?.message || t('verificationFailed'));
          }
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage(tv('networkError'));
      });
  }, [searchParams, toast, t, tv]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl">
            🪝
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">HookSniff</span>
        </Link>

        <div className="glass-card p-8">
          {status === 'loading' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tv('verifying')}</h2>
              <p className="text-gray-500 dark:text-slate-400">{tv('pleaseWait')}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4"><Check size={48} strokeWidth={1.5} className="text-emerald-500" /></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tv('verified')}</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6">{message}</p>
              <Link
                href={"/"}
                className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
              >
                {tv('goToDashboard')}
              </Link>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="flex justify-center mb-4 text-amber-500"><Clock size={56} strokeWidth={1.5} /></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('linkExpired')}</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6">{message}</p>
              <button
                onClick={async () => {
                  await fetch(`${API_BASE}/auth/resend-verification`, { method: 'POST', credentials: 'include' });
                  toast(tv('resendEmail'), 'success');
                }}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
              >
                {tv('resendEmail')}
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4"><X size={48} strokeWidth={1.5} className="text-red-500" /></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('verificationFailed')}</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
              >
                {tv('goToLogin')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
