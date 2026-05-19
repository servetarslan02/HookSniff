'use client';

import { useTranslations } from 'next-intl';
import { ConsentToggle } from './ConsentToggle';
import { Shield } from 'lucide-react';

export function PrivacyConsentSection() {
  const t = useTranslations('settings');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
          <span className="text-base"><Shield size={18} strokeWidth={1.75} /></span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('privacyConsent')}</h3>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-900 rounded-xl">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{t('cookieAnalytics')}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{t('cookieAnalyticsDesc')}</div>
          </div>
          <ConsentToggle consentKey="cookie_consent" storageKey="hooksniff_cookie_consent" />
        </div>
        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-900 rounded-xl">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{t('marketingEmails')}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{t('marketingEmailsDesc')}</div>
          </div>
          <ConsentToggle consentKey="marketing_consent" storageKey="hooksniff_marketing_consent" />
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 pt-1">
          {t('consentWithdrawNote')}
        </p>
      </div>
    </div>
  );
}
