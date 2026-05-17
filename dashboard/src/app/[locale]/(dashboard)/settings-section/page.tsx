'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const SettingsPage = dynamic(() => import('../settings/page'), { ssr: false });
const ServiceTokensPage = dynamic(() => import('../service-tokens/page'), { ssr: false });

export default function SettingsSectionPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'settings', label: t('settings'), icon: '⚙️', content: () => <SettingsPage /> },
        { key: 'service-tokens', label: t('serviceTokens'), icon: '🎟️', content: () => <ServiceTokensPage /> },
      ]}
    />
  );
}
