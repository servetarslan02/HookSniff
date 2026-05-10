'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';

export function EmailVerificationBanner() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token || !user) return;
    const controller = new AbortController();
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
    fetch(`${API}/auth/me`, { credentials: 'include', signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setVerified(data.email_verified ?? true))
      .catch((err) => {
        if (err.name !== 'AbortError') setVerified(null); // Bilinmiyor durumu
      });
    return () => controller.abort();
  }, [token, user]);

  if (!user || dismissed || verified === null || verified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
      const res = await fetch(`${API}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        toast('Verification email sent! Check your inbox.', 'success');
      } else {
        toast('Failed to send. Try again later.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📧</span>
          <div>
            <div className="text-sm font-medium text-amber-800 dark:text-amber-400">
              Please verify your email address
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-500">
              We sent a verification link to <strong>{user.email}</strong>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResend}
            disabled={sending}
            className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Resend'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 transition p-1"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
