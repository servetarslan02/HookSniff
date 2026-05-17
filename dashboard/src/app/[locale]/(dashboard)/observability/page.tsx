'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      ))}
    </div>
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
  </div>
);

const HealthPage = dynamic(() => import('../health/page'), { ssr: false, loading: () => tabSkeleton });
const AlertsPage = dynamic(() => import('../alerts/page'), { ssr: false, loading: () => tabSkeleton });
const AnalyticsPage = dynamic(() => import('../analytics/page'), { ssr: false, loading: () => tabSkeleton });

export default function MonitoringPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'health', label: t('health'), icon: '💓', content: () => <HealthPage /> },
        { key: 'alerts', label: t('alerts'), icon: '🔔', content: () => <AlertsPage /> },
        { key: 'analytics', label: t('analytics'), icon: '📈', content: () => <AnalyticsPage /> },
      ]}
    />
  );
}
