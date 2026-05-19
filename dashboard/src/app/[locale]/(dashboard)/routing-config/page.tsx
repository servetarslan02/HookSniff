'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg"} />
      ))}
    </div>
  </div>
);

const RoutingPage = dynamic(() => import('../routing/page'), { ssr: false, loading: () => tabSkeleton });
const RetryPolicyPage = dynamic(() => import('../retry-policy/page'), { ssr: false, loading: () => tabSkeleton });
const CustomDomainPage = dynamic(() => import('../custom-domain/page'), { ssr: false, loading: () => tabSkeleton });
const EnvironmentsPage = dynamic(() => import('../environments/page'), { ssr: false, loading: () => tabSkeleton });
const RateLimitingPage = dynamic(() => import('../rate-limiting/page'), { ssr: false, loading: () => tabSkeleton });

export default function RoutingConfigPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'routing', label: t('routing'), icon: '🔀', content: () => <RoutingPage /> },
        { key: 'retry-policy', label: t('retryPolicy'), icon: '🔁', content: () => <RetryPolicyPage /> },
        { key: 'custom-domain', label: t('customDomain'), icon: '🌐', content: () => <CustomDomainPage /> },
        { key: 'environments', label: t('environments'), icon: '🌐', content: () => <EnvironmentsPage /> },
        { key: 'rate-limiting', label: t('rateLimiting'), icon: '⏱️', content: () => <RateLimitingPage /> },
      ]}
    />
  );
}
