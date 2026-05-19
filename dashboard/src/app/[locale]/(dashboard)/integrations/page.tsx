'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';
import { Link2, Plug, Radio } from 'lucide-react';

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

const ConnectorsPage = dynamic(() => import('../connectors/page'), { ssr: false, loading: () => tabSkeleton });
const IntegrationsContent = dynamic(() => import('./IntegrationsContent'), { ssr: false, loading: () => tabSkeleton });
const StreamingPage = dynamic(() => import('../streaming/page'), { ssr: false, loading: () => tabSkeleton });

export default function IntegrationsPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'integrations', label: t('integrations'), icon: <Link2 size={16} strokeWidth={1.75} />, content: () => <IntegrationsContent /> },
        { key: 'connectors', label: t('connectors'), icon: <Plug size={16} strokeWidth={1.75} />, content: () => <ConnectorsPage /> },
        { key: 'streaming', label: t('streaming'), icon: <Radio size={16} strokeWidth={1.75} />, content: () => <StreamingPage /> },
      ]}
    />
  );
}
