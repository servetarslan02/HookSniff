'use client';

import { useTranslations } from 'next-intl';
import type { Team, TeamMember } from '@/lib/api';

const ROLE_OPTIONS = ['owner', 'admin', 'member'] as const;

function roleLabel(t: ReturnType<typeof useTranslations>, role: string): string {
  const map: Record<string, string> = { owner: t('roleOwner'), admin: t('roleAdmin'), member: t('roleMember') };
  return map[role] || role;
}

export function TeamDetail({
  team,
  members,
  canInvite,
  canRemove,
  canChangeRole,
  onInvite,
  onRemoveMember,
  onRoleChange,
}: {
  team: Team;
  members: TeamMember[];
  canInvite: boolean;
  canRemove: boolean;
  canChangeRole: boolean;
  onInvite: () => void;
  onRemoveMember: (memberId: string) => void;
  onRoleChange: (memberId: string, newRole: string) => void;
}) {
  const t = useTranslations('team');

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-gray-500 dark:text-slate-400">{team.description}</p>
          )}
        </div>
        <button type="button"
          onClick={onInvite} disabled={!canInvite}
          className="px-3 py-2 bg-brand-600 dark:bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
        >
          {t('inviteBtn')}
        </button>
      </div>
      <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
        {members.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">
            {t('noMembers')}
          </div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {m.name || m.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{m.email}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {t('joinedPrefix')} {new Date(m.joined_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={m.role}
                  onChange={(e) => onRoleChange(m.id, e.target.value)} disabled={!canChangeRole}
                  className="px-3 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{roleLabel(t, r)}</option>
                  ))}
                </select>
                <button type="button"
                  onClick={() => onRemoveMember(m.id)} disabled={!canRemove}
                  className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition"
                >
                  {t('removeBtn')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
