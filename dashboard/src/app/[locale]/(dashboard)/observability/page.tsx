'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const LogsPage = dynamic(() => import('../logs/page'), { ssr: false });
const HealthPage = dynamic(() => import('../health/page'), { ssr: false });
const AlertsPage = dynamic(() => import('../alerts/page'), { ssr: false });
const AnalyticsPage = dynamic(() => import('../analytics/page'), { ssr: false });

export default function MonitoringPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'logs', label: t('logs', { defaultValue: 'Logs' }), icon: '📋', content: <LogsPage /> },
        { key: 'health', label: t('health', { defaultValue: 'Health' }), icon: '💓', content: <HealthPage /> },
        { key: 'alerts', label: t('alerts', { defaultValue: 'Alerts' }), icon: '🔔', content: <AlertsPage /> },
        { key: 'analytics', label: t('analytics', { defaultValue: 'Analytics' }), icon: '📈', content: <AnalyticsPage /> },
      ]}
    />
  );
}
