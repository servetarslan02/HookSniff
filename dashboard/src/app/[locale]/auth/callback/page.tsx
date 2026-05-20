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

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const errorParam = params.get('error');

  if (errorParam) {
   setError(errorParam === 'oauth_denied' ? t('oauthCancelled') : t('loginFailedMessage', { error: errorParam }));
   return;
  }

  // Check if token is passed in URL (from OAuth callback)
  const token = params.get('token');
  const refresh = params.get('refresh');

  if (token) {
   // Set cookies on Vercel domain
   const cookieOpts = 'Path=/; HttpOnly; Secure; SameSite=Lax';
   document.cookie = `hooksniff_token=${token}; ${cookieOpts}; Max-Age=${24 * 60 * 60}`;
   if (refresh) {
    document.cookie = `hooksniff_refresh=${refresh}; ${cookieOpts}; Max-Age=${30 * 24 * 60 * 60}`;
   }
   // Clean URL and redirect
   window.history.replaceState({}, '', '/auth/callback');
   router.replace('/core');
   return;
  }

  // Fallback: verify session via /auth/me
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
  fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
   .then((res) => {
    if (res.ok) {
     // Session is valid — redirect to dashboard
     // The AuthProvider's mount effect will pick up the cookie
     router.replace('/core');
    } else {
     setError(t('authFailed'));
    }
   })
   .catch(() => {
    setError(t('networkError'));
   });
 }, [router, t]);

 if (error) {
  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
    <div className="glass-card p-8 max-w-md text-center">
     <div className="text-4xl mb-4"><X size={48} strokeWidth={1.5} className="text-red-500" /></div>
     <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("loginFailed")}</h1>
     <p className="text-gray-500 dark:text-slate-400 mb-6">{error}</p>
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
    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('loggingIn')}</h1>
    <p className="text-gray-500 dark:text-slate-400">{t("redirecting")}</p>
   </div>
  </div>
 );
}
