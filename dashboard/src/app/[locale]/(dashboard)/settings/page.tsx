'use client';

import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { ApiKeySection } from './components/ApiKeySection';
import { NotificationSection } from './components/NotificationSection';
import { PrivacyConsentSection } from './components/PrivacyConsentSection';
import { DangerZoneSection } from './components/DangerZoneSection';
import { TwoFactorSection } from './components/TwoFactorSection';

export default function SettingsPage() {
  const { user, token, apiKey } = useAuth();
  const t = useTranslations('settings');

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      <ProfileSection user={user} token={token} />
      <PasswordSection token={token} />
      <TwoFactorSection />
      <ApiKeySection apiKey={apiKey} />
      <NotificationSection />
      <PrivacyConsentSection />
      <DangerZoneSection />
    </div>
  );
}
