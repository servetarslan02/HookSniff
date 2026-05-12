'use client';

import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { ApiKeySection } from './components/ApiKeySection';
import { NotificationSection } from './components/NotificationSection';
import { PrivacyConsentSection } from './components/PrivacyConsentSection';
import { DangerZoneSection } from './components/DangerZoneSection';

export default function SettingsPage() {
  const { user, token, apiKey } = useAuth();
  const t = useTranslations('settings');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>

      <ProfileSection user={user} token={token} />
      <PasswordSection token={token} />
      <ApiKeySection apiKey={apiKey} />
      <NotificationSection />
      <PrivacyConsentSection />
      <DangerZoneSection />
    </div>
  );
}
