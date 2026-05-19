'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg"} />
      ))}
    </div>
  </div>
);

const TeamPage = dynamic(() => import('../team/page'), { ssr: false, loading: () => tabSkeleton });
const SsoPage = dynamic(() => import('../sso/page'), { ssr: false, loading: () => tabSkeleton });
const AuditLogPage = dynamic(() => import('../audit-log/page'), { ssr: false, loading: () => tabSkeleton });

export default function OrganizationPage() {
  const t = useTranslations('nav');

  return (
    <TabbedSection
      tabs={[
        { key: 'team', label: t('team'), icon: '👥', content: () => <TeamPage /> },
        { key: 'sso', label: t('sso'), icon: '🔐', content: () => <SsoPage /> },
        { key: 'audit-log', label: t('auditLog'), icon: '📜', content: () => <AuditLogPage /> },
      ]}
    />
  );
}
