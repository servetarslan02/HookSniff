'use client';

import { useTranslations } from 'next-intl';
import { ConsentToggle } from './ConsentToggle';

export function PrivacyConsentSection() {
  const t = useTranslations('settings');

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('privacyConsent')}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{t('cookieAnalytics')}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{t('cookieAnalyticsDesc')}</div>
          </div>
          <ConsentToggle consentKey="cookie_consent" storageKey="hooksniff_cookie_consent" />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{t('marketingEmails')}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{t('marketingEmailsDesc')}</div>
          </div>
          <ConsentToggle consentKey="marketing_consent" storageKey="hooksniff_marketing_consent" />
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          {t('consentWithdrawNote')}
        </p>
      </div>
    </div>
  );
}
