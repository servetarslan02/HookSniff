'use client';

import { useTranslations } from 'next-intl';
import type { Team, TeamMember } from '@/lib/api';

const ROLE_OPTIONS = ['admin', 'editor', 'viewer'] as const;

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',
};

const ROLE_ICONS: Record<string, string> = {
  admin: '🛡️',
  editor: '✏️',
  viewer: '👁️',
};

function roleLabel(t: ReturnType<typeof useTranslations>, role: string): string {
  const map: Record<string, string> = { admin: t('roleAdmin'), editor: t('roleEditor'), viewer: t('roleViewer') };
  return map[role] || role;
}

function MemberAvatar({ name, email }: { name?: string; email: string }) {
  const display = name || email;
  const initials = display
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-slate-500 dark:to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

function StatusDot({ online }: { online?: boolean }) {
  return (
    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
      online ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-slate-600'
    }`} />
  );
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

  const adminCount = members.filter((m) => m.role === 'admin').length;
  const editorCount = members.filter((m) => m.role === 'editor').length;
  const viewerCount = members.filter((m) => m.role === 'viewer').length;

  return (
    <div className="space-y-5">
      {/* Team Header Card */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-brand-50 to-transparent dark:from-brand-500/5 dark:to-transparent border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {team.name[0]?.toUpperCase() || 'T'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{team.name}</h3>
                {team.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{team.description}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onInvite}
              disabled={!canInvite}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 dark:hover:bg-brand-600 transition shadow-sm shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t('inviteBtn')}
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <span className="font-semibold text-gray-900 dark:text-white">{members.length}</span> {t('members')}
            </div>
            <div className="h-4 w-px bg-gray-200 dark:bg-slate-700" />
            <div className="flex items-center gap-3">
              {adminCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
                  🛡️ {adminCount} admin{adminCount > 1 ? 's' : ''}
                </span>
              )}
              {editorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  ✏️ {editorCount} editor{editorCount > 1 ? 's' : ''}
                </span>
              )}
              {viewerCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400">
                  👁️ {viewerCount} viewer{viewerCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Members List Card */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('members')}</h4>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{t('noMembers')}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">Invite team members to collaborate</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {members.map((m) => (
              <div
                key={m.id}
                className="group px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  <MemberAvatar name={m.name} email={m.email} />
                  <StatusDot online={m.joined_at !== null} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {m.name || m.email.split('@')[0]}
                    </p>
                    {m.role === 'admin' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
                        {t('roleAdmin')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{m.email}</p>
                  {m.joined_at && (
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                      {t('joinedPrefix')} {new Date(m.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select
                    value={m.role}
                    onChange={(e) => onRoleChange(m.id, e.target.value)}
                    disabled={!canChangeRole}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-brand-500 transition ${ROLE_STYLES[m.role] || ROLE_STYLES.viewer}`}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{ROLE_ICONS[r]} {roleLabel(t, r)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    disabled={!canRemove}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t('removeBtn')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
