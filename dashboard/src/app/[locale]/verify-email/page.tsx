'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useToast } from '@/components/Toast';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
    fetch(`${API}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          toast('Email verified!', 'success');
        } else {
          const data = await res.json().catch(() => ({}));
          if (data.error?.message?.includes('expired')) {
            setStatus('expired');
            setMessage('This verification link has expired.');
          } else {
            setStatus('error');
            setMessage(data.error?.message || 'Verification failed.');
          }
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error. Please try again.');
      });
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl">
            🪝
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">HookSniff</span>
        </Link>

        <div className="glass-card p-8">
          {status === 'loading' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying your email...</h2>
              <p className="text-gray-500 dark:text-slate-400">Please wait.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6">{message}</p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
              >
                Go to Dashboard →
              </Link>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link Expired</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6">{message}</p>
              <button
                onClick={async () => {
                  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
                  await fetch(`${API}/auth/resend-verification`, { method: 'POST', credentials: 'include' });
                  toast('Verification email sent!', 'success');
                }}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
              >
                Resend Verification Email
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
              <p className="text-gray-500 dark:text-slate-400 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
              >
                Go to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
