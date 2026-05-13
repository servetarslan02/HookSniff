'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const DashboardOverview = dynamic(() => import('../page'), { ssr: false });
const EndpointsPage = dynamic(() => import('../endpoints/page'), { ssr: false });
const DeliveriesPage = dynamic(() => import('../deliveries/page'), { ssr: false });
const SearchPage = dynamic(() => import('../search/page'), { ssr: false });

export default function CorePage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'overview', label: t('dashboard', { defaultValue: 'Dashboard' }), icon: '📊', content: <DashboardOverview /> },
        { key: 'endpoints', label: t('endpoints', { defaultValue: 'Endpoints' }), icon: '🔗', content: <EndpointsPage /> },
        { key: 'deliveries', label: t('deliveries', { defaultValue: 'Deliveries' }), icon: '📦', content: <DeliveriesPage /> },
        { key: 'search', label: t('search', { defaultValue: 'Search' }), icon: '🔍', content: <SearchPage /> },
      ]}
    />
  );
}
