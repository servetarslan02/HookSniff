'use client';

import { useEffect, useState } from 'react';
import { X } from '@/components/icons';

/**
 * OAuth callback page.
 *
 * After Google/GitHub OAuth, the backend redirects here:
 *  /auth/callback?token=eyJhbGciOiJIUzI1NiIs...
 *
 * Strategy: Store token in localStorage, then hard-redirect to /core.
 * This ensures a fresh page load where AuthProvider reads the token
 * from localStorage on mount and calls /auth/me to validate.
 *
 * We do NOT use router.replace() — client-side navigation can cause
 * race conditions with AuthProvider initialization.
 */
export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'processing' | 'error' | 'redirecting'>('processing');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');

    if (errorParam) {
      setError(
        errorParam === 'oauth_denied'
          ? 'OAuth login was cancelled.'
          : `Login failed: ${errorParam}`
      );
      setStatus('error');
      return;
    }

    const token = params.get('token');
    const refreshToken = params.get('refresh');

    if (token) {
      // Store tokens in localStorage
      try {
        localStorage.setItem('hooksniff_token', token);
        if (refreshToken) {
          localStorage.setItem('hooksniff_refresh', refreshToken);
        }
      } catch (e) {
        console.error('Failed to store token:', e);
        setError('Failed to save login token. Please try again.');
        setStatus('error');
        return;
      }

      // Verify the token works before redirecting
      const apiUrl = 'https://hooksniff-api-1046140057667.europe-west1.run.app';
      fetch(`${apiUrl}/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) {
            // Token is valid — hard redirect to /core
            // This causes a fresh page load where AuthProvider will
            // read the token from localStorage and call /auth/me
            setStatus('redirecting');
            // Clean URL params
            window.history.replaceState({}, '', '/auth/callback');
            // Hard redirect — NOT router.replace
            window.location.href = '/core';
          } else {
            // Token invalid — show error
            console.error('Token validation failed:', res.status);
            setError('Login token is invalid. Please try again.');
            setStatus('error');
          }
        })
        .catch((err) => {
          // Network error — still try redirect, token might work via cookie
          console.warn('Token verification network error, redirecting anyway:', err);
          setStatus('redirecting');
          window.history.replaceState({}, '', '/auth/callback');
          window.location.href = '/core';
        });
      return;
    }

    // No token in URL — check if we already have one in localStorage
    const existingToken = localStorage.getItem('hooksniff_token');
    if (existingToken) {
      // Already logged in from a previous attempt — just redirect
      setStatus('redirecting');
      window.location.href = '/core';
      return;
    }

    // No token anywhere — show error
    setError('No login token received. Please try logging in again.');
    setStatus('error');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="text-4xl mb-4">
            <X size={48} strokeWidth={1.5} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Login Failed
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => {
              window.location.href = '/login';
            }}
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
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {status === 'redirecting' ? 'Redirecting...' : 'Logging in...'}
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          {status === 'redirecting'
            ? 'Taking you to your dashboard...'
            : 'Verifying your login...'}
        </p>
      </div>
    </div>
  );
}
