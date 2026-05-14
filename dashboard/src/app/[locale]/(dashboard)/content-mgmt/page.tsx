'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const TransformsPage = dynamic(() => import('../transforms/page'), { ssr: false });
const InboundPage = dynamic(() => import('../inbound/page'), { ssr: false });
const SchemasPage = dynamic(() => import('../schemas/page'), { ssr: false });
const TemplatesPage = dynamic(() => import('../templates/page'), { ssr: false });

export default function ContentMgmtPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'schemas', label: t('schemas', { defaultValue: 'Schemas' }), icon: '📐', content: <SchemasPage /> },
        { key: 'templates', label: t('templates', { defaultValue: 'Templates' }), icon: '📄', content: <TemplatesPage /> },
        { key: 'inbound', label: t('inbound', { defaultValue: 'Inbound' }), icon: '📨', content: <InboundPage /> },
        { key: 'transforms', label: t('transforms', { defaultValue: 'Transforms' }), icon: '🔄', content: <TransformsPage /> },
      ]}
    />
  );
}
