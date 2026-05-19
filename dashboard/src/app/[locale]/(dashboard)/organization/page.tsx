'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';
import { useTeams } from '@/hooks/useDashboardData';
import { Users, ShieldCheck, ScrollText } from 'lucide-react';

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
      {/* Team selector */}
      {teams.length > 1 && (
        <div className="flex items-center gap-3">
          <label htmlFor="org-team-select" className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {t('organization')}:
          </label>
          <select
            id="org-team-select"
            value={activeTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      )}

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
