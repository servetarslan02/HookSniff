'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * OAuth callback page.
 *
 * After Google/GitHub OAuth, the backend redirects here:
 *   /auth/callback?token=eyJhbGciOiJIUzI1NiIs...
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
      setError(errorParam === 'oauth_denied' ? 'OAuth login was cancelled.' : `Login failed: ${errorParam}`);
      return;
    }

    // The backend already set the HttpOnly cookie.
    // Verify the session by calling /auth/me, then redirect.
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          // Session is valid — redirect to dashboard
          // The AuthProvider's mount effect will pick up the cookie
          router.replace('/dashboard');
        } else {
          setError('Authentication failed. Please try logging in again.');
        }
      })
      .catch(() => {
        setError('Network error. Please try again.');
      });
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("loginFailed")}</h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="animate-spin w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Logging you in...</h1>
        <p className="text-gray-500 dark:text-slate-400">{t("redirecting")}</p>
      </div>
    </div>
  );
}
