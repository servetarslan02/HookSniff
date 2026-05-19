'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';
import { Clock, Download, FileText, Inbox, RefreshCw, TriangleRight } from 'lucide-react';

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

const SchemasPage = dynamic(() => import('../schemas/page'), { ssr: false, loading: () => tabSkeleton });
const TemplatesPage = dynamic(() => import('../templates/page'), { ssr: false, loading: () => tabSkeleton });
const TransformsPage = dynamic(() => import('../transforms/page'), { ssr: false, loading: () => tabSkeleton });
const InboundPage = dynamic(() => import('../inbound/page'), { ssr: false, loading: () => tabSkeleton });
const OperationalWebhooksListPage = dynamic(() => import('./OperationalWebhooksList'), { ssr: false, loading: () => tabSkeleton });
const MessagePollerPage = dynamic(() => import('../message-poller/page'), { ssr: false, loading: () => tabSkeleton });
const BackgroundTasksPage = dynamic(() => import('../background-tasks/page'), { ssr: false, loading: () => tabSkeleton });

export default function OperationalWebhooksPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'schemas', label: t('schemas'), icon: <TriangleRight size={16} strokeWidth={1.75} />, content: () => <SchemasPage /> },
        { key: 'templates', label: t('templates'), icon: <FileText size={16} strokeWidth={1.75} />, content: () => <TemplatesPage /> },
        { key: 'transforms', label: t('transforms'), icon: <RefreshCw size={16} strokeWidth={1.75} />, content: () => <TransformsPage /> },
        { key: 'inbound', label: t('inboundWebhooks'), icon: <Download size={16} strokeWidth={1.75} />, content: () => <InboundPage /> },
        { key: 'operational', label: t('operationalWebhooks'), icon: '🪝', content: () => <OperationalWebhooksListPage /> },
        { key: 'poller', label: t('messagePoller'), icon: <Inbox size={16} strokeWidth={1.75} />, content: () => <MessagePollerPage /> },
        { key: 'tasks', label: t('backgroundTasks'), icon: <Clock size={16} strokeWidth={1.75} />, content: () => <BackgroundTasksPage /> },
      ]}
    />
  );
}
