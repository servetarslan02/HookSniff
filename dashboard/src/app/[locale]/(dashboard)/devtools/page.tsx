'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const PlaygroundPage = dynamic(() => import('../playground/page'), { ssr: false });
const SignatureVerifierPage = dynamic(() => import('../signature-verifier/page'), { ssr: false });
const ApiImporterPage = dynamic(() => import('../api-importer/page'), { ssr: false });
const WebhookBuilderPage = dynamic(() => import('../webhook-builder/page'), { ssr: false });

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
