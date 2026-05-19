'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { getErrorMessage } from '@/lib/errors';

export function ConsentToggle({
  consentKey,
  storageKey,
}: {
  consentKey: string;
  storageKey: string;
}) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) === 'true';
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
            setEnabled(serverValue);
            localStorage.setItem(storageKey, String(serverValue));
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
    localStorage.setItem(storageKey, String(newValue));

    // Update cookie
    if (newValue) {
      document.cookie = `${storageKey}=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax; Secure`;
    } else {
      document.cookie = `${storageKey}=; path=/; max-age=0`;
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
        localStorage.setItem(storageKey, String(prevValue));
        toast(getErrorMessage(err, 'Failed to update consent'), 'error');
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
