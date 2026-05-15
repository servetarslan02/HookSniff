'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      ))}
    </div>
    <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
  </div>
);

const DashboardOverview = dynamic(() => import('../DashboardOverview').then(mod => ({ default: mod.DashboardOverview })), { ssr: false, loading: () => tabSkeleton });
const EndpointsPage = dynamic(() => import('../endpoints/page'), { ssr: false, loading: () => tabSkeleton });
const ApplicationsPage = dynamic(() => import('../applications/page'), { ssr: false, loading: () => tabSkeleton });
const ApiKeysPage = dynamic(() => import('../api-keys/page'), { ssr: false, loading: () => tabSkeleton });

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
