'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const PortalCustomizePage = dynamic(() => import('../portal-customize/page'), { ssr: false });
const PortalManagePage = dynamic(() => import('../portal-manage/page'), { ssr: false });

export default function PortalSectionPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'customize', label: t('portalCustomize', { defaultValue: 'Customize' }), icon: '🎨', content: <PortalCustomizePage /> },
        { key: 'manage', label: t('portalManage', { defaultValue: 'Portal' }), icon: '🖼️', content: <PortalManagePage /> },
      ]}
    />
  );
}
