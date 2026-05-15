'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
  </div>
);

const PlaygroundPage = dynamic(() => import('../playground/page'), { ssr: false, loading: () => tabSkeleton });
const SignatureVerifierPage = dynamic(() => import('../signature-verifier/page'), { ssr: false, loading: () => tabSkeleton });
const ApiImporterPage = dynamic(() => import('../api-importer/page'), { ssr: false, loading: () => tabSkeleton });
const WebhookBuilderPage = dynamic(() => import('../webhook-builder/page'), { ssr: false, loading: () => tabSkeleton });

export default function DevToolsPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'playground', label: t('playground', { defaultValue: 'Playground' }), icon: '🧪', content: <PlaygroundPage /> },
        { key: 'signature', label: t('signatureTool', { defaultValue: 'Signature Tool' }), icon: '🔐', content: <SignatureVerifierPage /> },
        { key: 'webhook-builder', label: t('webhookBuilder', { defaultValue: 'Webhook Builder' }), icon: '🔧', content: <WebhookBuilderPage /> },
        { key: 'api-importer', label: t('apiImporter', { defaultValue: 'API Importer' }), icon: '📥', content: <ApiImporterPage /> },
      ]}
    />
  );
}
