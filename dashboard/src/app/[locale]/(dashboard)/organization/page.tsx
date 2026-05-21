'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';
import { useTeams } from '@/hooks/useDashboardData';
import { Users, ShieldCheck, ScrollText } from '@/components/icons';

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

const TeamPage = dynamic(() => import('../team/page'), { ssr: false, loading: () => tabSkeleton });
const SsoPage = dynamic(() => import('../sso/page'), { ssr: false, loading: () => tabSkeleton });
const AuditLogPage = dynamic(() => import('../audit-log/page'), { ssr: false, loading: () => tabSkeleton });

export default function OrganizationPage() {
  const t = useTranslations('nav');
  const { data: teams = [] } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  // Default to first team if none selected
  const activeTeamId = selectedTeamId || teams[0]?.id || '';

  return (
    <div className="space-y-6">
      <TabbedSection
        tabs={[
          { key: 'team', label: t('team'), icon: <Users size={16} strokeWidth={1.75} />, content: () => <TeamPage /> },
          { key: 'sso', label: t('sso'), icon: <ShieldCheck size={16} strokeWidth={1.75} />, content: () => <SsoPage teamId={activeTeamId} /> },
          { key: 'audit-log', label: t('auditLog'), icon: <ScrollText size={16} strokeWidth={1.75} />, content: () => <AuditLogPage /> },
        ]}
      />
    </div>
  );
}
