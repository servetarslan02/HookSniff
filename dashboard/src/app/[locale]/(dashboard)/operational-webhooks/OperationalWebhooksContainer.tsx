'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
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

const InboundPage = dynamic(() => import('../inbound/page'), { ssr: false, loading: () => tabSkeleton });
const OperationalWebhooksListPage = dynamic(() => import('./OperationalWebhooksList'), { ssr: false, loading: () => tabSkeleton });
const MessagePollerPage = dynamic(() => import('../message-poller/page'), { ssr: false, loading: () => tabSkeleton });

export default function OperationalWebhooksPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'inbound', label: t('inboundWebhooks'), icon: '📥', content: () => <InboundPage /> },
        { key: 'operational', label: t('operationalWebhooks'), icon: '🪝', content: () => <OperationalWebhooksListPage /> },
        { key: 'poller', label: t('messagePoller'), icon: '📬', content: () => <MessagePollerPage /> },
      ]}
    />
  );
}
