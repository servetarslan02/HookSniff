'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const LogsPage = dynamic(() => import('../logs/page'), { ssr: false });
const DeliveriesList = dynamic(() => import('./DeliveriesList'), { ssr: false });
const SearchPage = dynamic(() => import('../search/page'), { ssr: false });

export default function DeliveriesSectionPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'logs', label: t('logs', { defaultValue: 'Webhook Logs' }), icon: '📋', content: <LogsPage /> },
        { key: 'deliveries', label: t('deliveries', { defaultValue: 'Deliveries' }), icon: '📦', content: <DeliveriesList /> },
        { key: 'search', label: t('search', { defaultValue: 'Search' }), icon: '🔍', content: <SearchPage /> },
      ]}
    />
  );
}
