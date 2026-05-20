'use client';

import {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {useAuth} from '@/lib/store';
import {API_BASE} from '@/lib/api';
import {useToast} from '@/components/Toast';
import {Mail, X} from 'lucide-react';

export function EmailVerificationBanner() {
 const t = useTranslations('emailVerification');
 const tc = useTranslations('common');
 const {user, token} = useAuth();
 const {toast} = useToast();
 const [dismissed, setDismissed] = useState(false);
 const [sending, setSending] = useState(false);
 const [verified, setVerified] = useState<boolean | null>(null);

 useEffect(() => {
  if (!token || !user) return;
  const controller = new AbortController();
  fetch(`${API_BASE}/auth/me`, {credentials: 'include', signal: controller.signal})
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
   const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    credentials: 'include',
});
   if (res.ok) {
    toast(t('sent'), 'success');
} else {
    toast(t('failed'), 'error');
}
} catch {
   toast(t('networkError'), 'error');
} finally {
   setSending(false);
}
};

 return (
  <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6">
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
     <span className="text-xl"><Mail size={18} strokeWidth={1.75} /></span>
     <div>
      <div className="text-sm font-medium text-amber-800 dark:text-amber-400">
       {t('title')}
      </div>
      <div className="text-xs text-amber-600 dark:text-amber-500">
       {t('description')} <strong>{user.email}</strong>
      </div>
     </div>
    </div>
    <div className="flex items-center gap-2">
     <button
      onClick={handleResend}
      disabled={sending}
      className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
     >
      {sending ? t('sending') : t('resend')}
     </button>
     <button
      onClick={() => setDismissed(true)}
      aria-label={tc('close')}
      className="text-amber-400 hover:text-amber-600 transition p-1"
     >
      <X size={16} strokeWidth={1.75} className="inline mr-1" /> </button>
    </div>
   </div>
  </div>
 );
}
