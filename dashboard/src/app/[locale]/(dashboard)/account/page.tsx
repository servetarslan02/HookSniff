'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      ))}
    </div>
  </div>
);

const TeamPage = dynamic(() => import('../team/page'), { ssr: false, loading: () => tabSkeleton });
const NotificationsPage = dynamic(() => import('../notifications/page'), { ssr: false, loading: () => tabSkeleton });
const BillingPage = dynamic(() => import('../billing/page'), { ssr: false, loading: () => tabSkeleton });
const SettingsPage = dynamic(() => import('../settings/page'), { ssr: false, loading: () => tabSkeleton });
const PortalManagePage = dynamic(() => import('../portal-manage/page'), { ssr: false, loading: () => tabSkeleton });

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
