'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg"} />
      ))}
    </div>
  </div>
);

const NotificationsPage = dynamic(() => import('../notifications/page'), { ssr: false, loading: () => tabSkeleton });
const SettingsPage = dynamic(() => import('../settings/page'), { ssr: false, loading: () => tabSkeleton });
const PortalCustomizePage = dynamic(() => import('../portal-customize/page'), { ssr: false, loading: () => tabSkeleton });
const PortalManagePage = dynamic(() => import('../portal-manage/page'), { ssr: false, loading: () => tabSkeleton });

export default function AccountPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'settings', label: t('settings'), icon: '⚙️', content: () => <SettingsPage /> },
        { key: 'notifications', label: t('notifications'), icon: '🔔', content: () => <NotificationsPage /> },
        { key: 'portal-customize', label: t('portalCustomize'), icon: '🎨', content: () => <PortalCustomizePage /> },
        { key: 'portal-manage', label: t('portalManage'), icon: '🖼️', content: () => <PortalManagePage /> },
      ]}
    />
  );
}
