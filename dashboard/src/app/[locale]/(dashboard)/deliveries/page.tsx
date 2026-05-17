'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      ))}
    </div>
  </div>
);

const LogsPage = dynamic(() => import('../logs/page'), { ssr: false, loading: () => tabSkeleton });
const DeliveriesList = dynamic(() => import('./DeliveriesList'), { ssr: false, loading: () => tabSkeleton });
const SearchPage = dynamic(() => import('../search/page'), { ssr: false, loading: () => tabSkeleton });

export default function DeliveriesSectionPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'logs', label: t('logs'), icon: '📋', content: () => <LogsPage /> },
        { key: 'deliveries', label: t('deliveries'), icon: '📦', content: () => <DeliveriesList /> },
        { key: 'search', label: t('search'), icon: '🔍', content: () => <SearchPage /> },
      ]}
    />
  );
}
