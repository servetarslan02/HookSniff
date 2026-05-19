'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

const RateLimitingPage = dynamic(() => import('../rate-limiting/page'), { ssr: false, loading: () => tabSkeleton });

export default function SecuritySectionPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'rate-limiting', label: t('rateLimiting'), icon: <Clock size={16} strokeWidth={1.75} />, content: () => <RateLimitingPage /> },
      ]}
    />
  );
}
