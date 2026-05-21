'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';
import { Shuffle, Repeat, Package, Timer } from '@/components/icons';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg" />
      ))}
    </div>
  </div>
);

const RoutingPage = dynamic(() => import('../routing/page'), { ssr: false, loading: () => tabSkeleton });
const RetryPolicyPage = dynamic(() => import('../retry-policy/page'), { ssr: false, loading: () => tabSkeleton });
const EnvironmentsPage = dynamic(() => import('../environments/page'), { ssr: false, loading: () => tabSkeleton });
const RateLimitingPage = dynamic(() => import('../rate-limiting/page'), { ssr: false, loading: () => tabSkeleton });

export default function RoutingConfigPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'routing', label: t('routing'), icon: <Shuffle size={16} strokeWidth={1.75} />, content: () => <RoutingPage /> },
        { key: 'retry-policy', label: t('retryPolicy'), icon: <Repeat size={16} strokeWidth={1.75} />, content: () => <RetryPolicyPage /> },
        { key: 'environments', label: t('environments'), icon: <Package size={16} strokeWidth={1.75} />, content: () => <EnvironmentsPage /> },
        { key: 'rate-limiting', label: t('rateLimiting'), icon: <Timer size={16} strokeWidth={1.75} />, content: () => <RateLimitingPage /> },
      ]}
    />
  );
}
