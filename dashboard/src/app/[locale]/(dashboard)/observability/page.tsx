'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const HealthPage = dynamic(() => import('../health/page'), { ssr: false });
const AlertsPage = dynamic(() => import('../alerts/page'), { ssr: false });
const AnalyticsPage = dynamic(() => import('../analytics/page'), { ssr: false });

export default function MonitoringPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'health', label: t('health', { defaultValue: 'Health' }), icon: '💓', content: <HealthPage /> },
        { key: 'alerts', label: t('alerts', { defaultValue: 'Alerts' }), icon: '🔔', content: <AlertsPage /> },
        { key: 'analytics', label: t('analytics', { defaultValue: 'Analytics' }), icon: '📈', content: <AnalyticsPage /> },
      ]}
    />
  );
}
