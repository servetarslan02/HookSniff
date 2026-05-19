'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';
import { FileText, RefreshCw, TriangleRight } from 'lucide-react';

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

export default function ContentMgmtPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'schemas', label: t('schemas'), icon: <TriangleRight size={16} strokeWidth={1.75} />, content: () => <SchemasPage /> },
        { key: 'templates', label: t('templates'), icon: <FileText size={16} strokeWidth={1.75} />, content: () => <TemplatesPage /> },
        { key: 'transforms', label: t('transforms'), icon: <RefreshCw size={16} strokeWidth={1.75} />, content: () => <TransformsPage /> },
      ]}
    />
  );
}
