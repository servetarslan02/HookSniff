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
    <div className="max-w-3xl space-y-10">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* ── 1. Profile ── */}
      <section>
        <SectionLabel label={t('profile')} icon="👤" />
        <ProfileSection user={user} token={token} />
      </section>

      {/* ── 2. Security ── */}
      <section>
        <SectionLabel label={t('security') || 'Security'} icon="🔒" />
        <div className="space-y-4">
          <PasswordSection token={token} />
          <TwoFactorSection />
          <ApiKeySection apiKey={apiKey} />
        </div>
      </section>

      {/* ── 3. Preferences ── */}
      <section>
        <SectionLabel label={t('preferences') || 'Preferences'} icon="⚙️" />
        <div className="space-y-4">
          <NotificationSection />
          <PrivacyConsentSection />
        </div>
      </section>

      {/* ── 4. Danger Zone ── */}
      <section>
        <DangerZoneSection />
      </section>
    </div>
  );
}

function SectionLabel({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-base">{icon}</span>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</h2>
      <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700 ml-2" />
    </div>
  );
}
