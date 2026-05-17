'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const ApiKeysPage = dynamic(() => import('../api-keys/page'), { ssr: false });
const BillingPage = dynamic(() => import('../billing/page'), { ssr: false });

export default function BillingOverviewPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'api-keys', label: t('apiKeys'), icon: '🔑', content: () => <ApiKeysPage /> },
        { key: 'billing', label: t('billing'), icon: '💳', content: () => <BillingPage /> },
      ]}
    />
  );
}
