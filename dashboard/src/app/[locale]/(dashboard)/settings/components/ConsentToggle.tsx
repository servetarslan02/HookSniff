'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { getErrorMessage } from '@/lib/errors';
import { useTranslations } from 'next-intl';

export function ConsentToggle({
  consentKey,
  storageKey,
}: {
  consentKey: string;
  storageKey: string;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('settings');
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const val = localStorage.getItem(storageKey);
    // BUG FIX: Support both "accepted"/"rejected" (CookieConsent banner) and "true"/"false" (legacy)
    return val === 'true' || val === 'accepted';
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial consent state from backend
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    import('@/lib/api').then(({ apiFetch }) => {
      apiFetch<{ consents: Record<string, boolean> }>('/auth/consent', { token })
        .then((data) => {
          if (cancelled) return;
          const serverValue = data.consents?.[consentKey];
          if (serverValue !== undefined) {
            // BUG FIX: Backend stores true/false, normalize to accepted/rejected
            const consentStr = serverValue ? 'accepted' : 'rejected';
            setEnabled(serverValue);
            localStorage.setItem(storageKey, consentStr);
          }
        })
        .catch(() => {
          // Fallback to localStorage value (already set in useState)
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => { cancelled = true; };
  }, [token, consentKey, storageKey]);

  const handleToggle = async () => {
    const newValue = !enabled;
    const prevValue = enabled;
    setEnabled(newValue);
    // BUG FIX: Use "accepted"/"rejected" to match CookieConsent banner format
    const consentValue = newValue ? 'accepted' : 'rejected';
    localStorage.setItem(storageKey, consentValue);

    // Update cookie (also set legacy "true"/"false" for backward compat)
    if (newValue) {
      document.cookie = `${consentKey}=accepted; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax; Secure`;
    } else {
      document.cookie = `${consentKey}=; path=/; max-age=0`;
    }

    // Persist to backend
    if (token) {
      try {
        const { apiFetch } = await import('@/lib/api');
        await apiFetch('/auth/consent', {
          method: 'POST',
          body: { key: consentKey, value: newValue },
          token,
        });
      } catch (err) {
        // Revert on failure
        setEnabled(prevValue);
        // BUG FIX: Use consistent format for revert
        localStorage.setItem(storageKey, prevValue ? 'accepted' : 'rejected');
        toast(getErrorMessage(err, t('failedToUpdateConsent')), 'error');
      }
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={loading}
      onClick={handleToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-brand-600 dark:bg-brand-500' : 'bg-gray-300 dark:bg-slate-600'
      } ${loading ? 'opacity-60 cursor-wait' : ''}`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
