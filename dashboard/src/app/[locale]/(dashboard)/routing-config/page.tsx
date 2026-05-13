'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const RetryPolicyPage = dynamic(() => import('../retry-policy/page'), { ssr: false });
const RoutingPage = dynamic(() => import('../routing/page'), { ssr: false });
const CustomDomainPage = dynamic(() => import('../custom-domain/page'), { ssr: false });

export default function RoutingConfigPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'retry-policy', label: t('retryPolicy', { defaultValue: 'Retry Policy' }), icon: '🔁', content: <RetryPolicyPage /> },
        { key: 'routing', label: t('routing', { defaultValue: 'Routing' }), icon: '🔀', content: <RoutingPage /> },
        { key: 'custom-domain', label: t('customDomain', { defaultValue: 'Custom Domain' }), icon: '🌐', content: <CustomDomainPage /> },
      ]}
    />
  );
}
