'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { X } from '@/components/icons';

/**
 * OAuth callback page.
 *
 * After Google/GitHub OAuth, the backend redirects here:
 *  /auth/callback?token=eyJhbGciOiJIUzI1NiIs...
 *
 * The backend already set the HttpOnly auth cookie before redirecting.
 * We just need to verify the session and redirect to dashboard.
 */
export default function AuthCallbackPage() {
 const router = useRouter();
 const t = useTranslations('error');
 const [error, setError] = useState<string | null>(null);
 const [status, setStatus] = useState<'processing' | 'error' | 'redirecting'>('processing');

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const errorParam = params.get('error');

  if (errorParam) {
   const msg = errorParam === 'oauth_denied' ? t('oauthCancelled') : t('loginFailedMessage', { error: errorParam });
   setError(msg);
   setStatus('error');
   return;
  }

  // Check if token is passed in URL (from OAuth callback)
  const token = params.get('token');
  const refreshToken = params.get('refresh');

  if (token) {
   // Store token in localStorage for the frontend API client
   try {
    localStorage.setItem('hooksniff_token', token);
    if (refreshToken) localStorage.setItem('hooksniff_refresh', refreshToken);
   } catch (e) {
    console.error('Failed to store token:', e);
   }
   // Clean URL and redirect
   window.history.replaceState({}, '', '/auth/callback');
   setStatus('redirecting');
   // Small delay to ensure localStorage is flushed
   setTimeout(() => {
    router.replace('/core');
   }, 100);
   return;
  }

  // Fallback: verify session via /auth/me (cookie might be set by backend)
  setStatus('processing');
  fetch('/api/v1/auth/me', { credentials: 'include' })
   .then(async (res) => {
    if (res.ok) {
     // Session is valid — redirect to dashboard
     setStatus('redirecting');
     router.replace('/core');
    } else {
     // Try direct API call as last resort
     const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hooksniff-api-1046140057667.europe-west1.run.app';
     try {
      const directRes = await fetch(`${apiUrl}/v1/auth/me`, {
       credentials: 'include',
       headers: { 'Accept': 'application/json' },
      });
      if (directRes.ok) {
       setStatus('redirecting');
       router.replace('/core');
       return;
      }
     } catch { /* ignore */ }
     setError(t('authFailed'));
     setStatus('error');
    }
   })
   .catch(() => {
    setError(t('networkError'));
    setStatus('error');
   });
 }, [router, t]);

 if (error) {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
    <div className="glass-card p-8 max-w-md text-center">
     <div className="text-4xl mb-4"><X size={48} strokeWidth={1.5} className="text-red-500" /></div>
     <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("loginFailed")}</h1>
     <p className="text-gray-500 dark:text-slate-400 mb-6">{error}</p>
     <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
      URL: {typeof window !== 'undefined' ? window.location.href : ''}
     </p>
     <button
      onClick={() => router.push('/login')}
      className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
     >
      {t('backToLogin')}
     </button>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
   <div className="glass-card p-8 max-w-md text-center">
    <div className="animate-spin w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
     {status === 'redirecting' ? (t('redirecting') || 'Redirecting...') : (t('loggingIn') || 'Logging in...')}
    </h1>
    <p className="text-gray-500 dark:text-slate-400">
     {status === 'processing' ? 'Verifying your session...' : 'Taking you to your dashboard...'}
    </p>
   </div>
  </div>
 );
}
