'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const TeamPage = dynamic(() => import('../team/page'), { ssr: false });
const NotificationsPage = dynamic(() => import('../notifications/page'), { ssr: false });
const BillingPage = dynamic(() => import('../billing/page'), { ssr: false });
const SettingsPage = dynamic(() => import('../settings/page'), { ssr: false });
const PortalManagePage = dynamic(() => import('../portal-manage/page'), { ssr: false });

export default function AccountPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'team', label: t('team', { defaultValue: 'Team' }), icon: '👥', content: <TeamPage /> },
        { key: 'notifications', label: t('notifications', { defaultValue: 'Notifications' }), icon: '🔔', content: <NotificationsPage /> },
        { key: 'billing', label: t('billing', { defaultValue: 'Billing' }), icon: '💳', content: <BillingPage /> },
        { key: 'settings', label: t('settings', { defaultValue: 'Settings' }), icon: '⚙️', content: <SettingsPage /> },
        { key: 'portal', label: t('portal', { defaultValue: 'Portal' }), icon: '🖼️', content: <PortalManagePage /> },
      ]}
    />
  );
}
