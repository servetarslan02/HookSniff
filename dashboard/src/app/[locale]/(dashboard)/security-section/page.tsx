'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const RateLimitingPage = dynamic(() => import('../rate-limiting/page'), { ssr: false });
const AuditLogPage = dynamic(() => import('../audit-log/page'), { ssr: false });
const SsoPage = dynamic(() => import('../sso/page'), { ssr: false });

export default function SecuritySectionPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'rate-limiting', label: t('rateLimiting', { defaultValue: 'Rate Limiting' }), icon: '⏱️', content: <RateLimitingPage /> },
        { key: 'audit-log', label: t('auditLog', { defaultValue: 'Audit Log' }), icon: '📜', content: <AuditLogPage /> },
        { key: 'sso', label: t('sso', { defaultValue: 'SSO' }), icon: '🔒', content: <SsoPage /> },
      ]}
    />
  );
}
