'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const TeamPage = dynamic(() => import('../team/page'), { ssr: false });
const NotificationsPage = dynamic(() => import('../notifications/page'), { ssr: false });
const ApplicationsPage = dynamic(() => import('../applications/page'), { ssr: false });

export default function TeamMgmtPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'team', label: t('team', { defaultValue: 'Team' }), icon: '👥', content: <TeamPage /> },
        { key: 'notifications', label: t('notifications', { defaultValue: 'Notifications' }), icon: '🔔', content: <NotificationsPage /> },
        { key: 'applications', label: t('applications', { defaultValue: 'Applications' }), icon: '📁', content: <ApplicationsPage /> },
      ]}
    />
  );
}
