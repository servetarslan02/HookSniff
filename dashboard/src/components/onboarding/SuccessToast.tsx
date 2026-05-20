'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, PartyPopper } from '@/components/icons';

export function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
 const t = useTranslations('onboarding');
 const tc = useTranslations('common');
 useEffect(() => {
  const timer = setTimeout(onClose, 5000);
  return () => clearTimeout(timer);
 }, [onClose]);

 return (
  <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
   <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm">
    <span className="text-green-200"><PartyPopper size={24} strokeWidth={1.75} /></span>
    <div>
     <div className="font-semibold text-sm">{t('successTitle')}</div>
     <div className="text-sm opacity-90">{message}</div>
    </div>
    <button onClick={onClose} aria-label={tc('close')} className="ml-4 text-white/70 hover:text-white transition"><X size={18} strokeWidth={1.75} /></button>
   </div>
  </div>
 );
}
