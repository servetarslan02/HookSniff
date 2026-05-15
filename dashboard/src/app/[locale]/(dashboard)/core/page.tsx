'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const DashboardOverview = dynamic(() => import('../DashboardOverview').then(mod => ({ default: mod.DashboardOverview })), { ssr: false });
const EndpointsPage = dynamic(() => import('../endpoints/page'), { ssr: false });
const ApplicationsPage = dynamic(() => import('../applications/page'), { ssr: false });
const ApiKeysPage = dynamic(() => import('../api-keys/page'), { ssr: false });

export default function CorePage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'overview', label: t('dashboard', { defaultValue: 'Dashboard' }), icon: '📊', content: <DashboardOverview /> },
        { key: 'endpoints', label: t('endpoints', { defaultValue: 'Endpoints' }), icon: '🔗', content: <EndpointsPage /> },
        { key: 'applications', label: t('applications', { defaultValue: 'Applications' }), icon: '📁', content: <ApplicationsPage /> },
        { key: 'api-keys', label: t('apiKeys', { defaultValue: 'API Keys' }), icon: '🔑', content: <ApiKeysPage /> },
      ]}
    />
  );
}
