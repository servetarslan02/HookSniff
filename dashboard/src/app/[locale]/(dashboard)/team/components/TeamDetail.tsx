'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Team, TeamMember } from '@/lib/api';
import { AlertTriangle, Check, ClipboardList, Clock, Eye, Link2, Pencil, Shield, User, X } from 'lucide-react';

const ROLE_OPTIONS = ['admin', 'editor', 'viewer'] as const;

const ROLE_STYLES: Record<string, React.ReactNode> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield size={16} strokeWidth={1.75} />,
  editor: <Pencil size={16} strokeWidth={1.75} />,
  viewer: <Eye size={16} strokeWidth={1.75} />,
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
  invites,
  canInvite,
  canRemove,
  canChangeRole,
  isOwner,
  onInvite,
  onRemoveMember,
  onRoleChange,
  onDeleteTeam,
  onLeaveTeam,
  onTransferOwnership,
  onRevokeInvite,
  onResendInvite,
  onUpdateTeam,
  lastInviteLink,
  onCopyLink,
}: {
  team: Team;
  members: TeamMember[];
  invites: Array<{ id: string; email: string; role: string; expires_at: string; created_at: string }>;
  canInvite: boolean;
  canRemove: boolean;
  canChangeRole: boolean;
  isOwner: boolean;
  onInvite: () => void;
  onRemoveMember: (memberId: string) => void;
  onRoleChange: (memberId: string, newRole: string) => void;
  onDeleteTeam: () => void;
  onLeaveTeam: () => void;
  onTransferOwnership: () => void;
  onRevokeInvite: (inviteId: string) => void;
  onResendInvite: (inviteId: string) => void;
  onUpdateTeam: (data: { name?: string; description?: string }) => void;
  lastInviteLink: string | null;
  onCopyLink: () => void;
}) {
  const t = useTranslations('team');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(team.name);
  const [dismissedInvite, setDismissedInvite] = useState(false);

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
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="px-2 py-1 text-lg font-bold border border-brand-300 dark:border-brand-500 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && nameValue.trim()) {
                          onUpdateTeam({ name: nameValue.trim() });
                          setEditingName(false);
                        }
                        if (e.key === 'Escape') {
                          setNameValue(team.name);
                          setEditingName(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (nameValue.trim()) {
                          onUpdateTeam({ name: nameValue.trim() });
                          setEditingName(false);
                        }
                      }}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded"
                    ><Check size={18} strokeWidth={1.75} /></button>
                    <button
                      type="button"
                      onClick={() => { setNameValue(team.name); setEditingName(false); }}
                      className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                    ><X size={18} strokeWidth={1.75} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{team.name}</h3>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="p-1 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                        title={t('editName') || 'Edit name'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
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

          {/* Team Actions */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200/50 dark:border-slate-700/50">
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={onTransferOwnership}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  {t('transferOwnership') || 'Transfer'}
                </button>
                <button
                  type="button"
                  onClick={onDeleteTeam}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('deleteTeam') || 'Delete'}
                </button>
              </>
            )}
            {!isOwner && (
              <button
                type="button"
                onClick={onLeaveTeam}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('leaveTeam') || 'Leave'}
              </button>
            )}
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
                  <Shield size={16} strokeWidth={1.75} className="inline mr-1" /> {adminCount} admin{adminCount > 1 ? 's' : ''}
                </span>
              )}
              {editorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  <Pencil size={16} strokeWidth={1.75} className="inline mr-1" /> {editorCount} editor{editorCount > 1 ? 's' : ''}
                </span>
              )}
              {viewerCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400">
                  <Eye size={16} strokeWidth={1.75} className="inline mr-1" /> {viewerCount} viewer{viewerCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {/* Plan limit warning */}
          {members.length >= 5 && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <span className="text-xs"><AlertTriangle size={18} strokeWidth={1.75} /></span>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {members.length >= 20
                  ? (t('nearMemberLimit') || 'You\'re approaching the team member limit. Upgrade your plan for more members.')
                  : (t('teamGrowing') || `Team has ${members.length} members. Consider upgrading for more capacity.`)}
              </p>
            </div>
          )}
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
              <span className="text-2xl"><User size={18} strokeWidth={1.75} /></span>
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
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      m.role === 'admin' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/15' :
                      m.role === 'editor' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/15' :
                      'text-gray-500 bg-gray-100 dark:text-slate-400 dark:bg-slate-700'
                    }`}>
                      {ROLE_ICONS[m.role]} {roleLabel(t, m.role)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{m.email}</p>
                  {m.joined_at && (
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                      {t('joinedPrefix')} {new Date(m.joined_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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

      {/* Last Invite Link Banner */}
      {lastInviteLink && !dismissedInvite && (
        <div className="glass-card p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 relative">
          <button
            type="button"
            onClick={() => setDismissedInvite(true)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-brand-600 dark:text-brand-400"><Link2 size={18} strokeWidth={1.75} /></span>
            <p className="text-sm font-medium text-brand-800 dark:text-brand-300">{t('inviteLinkReady') || 'Invite link ready!'}</p>
          </div>
          <p className="text-xs text-brand-600 dark:text-brand-400 mb-2">{t('shareInviteLink') || 'Share this link with the invited person. They need to log in first, then the invite will be accepted automatically.'}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono text-gray-800 dark:text-slate-200 break-all border border-brand-200 dark:border-brand-500/20">{lastInviteLink}</code>
            <button
              type="button"
              onClick={onCopyLink}
              className="px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition"
            ><ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" /> {t('copy') || 'Copy'}</button>
          </div>
        </div>
      )}

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{t('pendingInvites') || 'Pending Invites'}</h4>
            <span className="text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{invites.length}</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {invites.map((inv) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(inv.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              const isExpiringSoon = daysLeft <= 2;
              return (
                <div key={inv.id} className="group px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm shrink-0">
                    <Clock size={16} strokeWidth={1.75} className="inline mr-1" /> </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        inv.role === 'admin' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/15' :
                        inv.role === 'editor' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/15' :
                        'text-gray-500 bg-gray-100 dark:text-slate-400 dark:bg-slate-700'
                      }`}>
                        {ROLE_ICONS[inv.role] || <Eye size={16} strokeWidth={1.75} />} {inv.role}
                      </span>
                      <span className={`text-xs ${isExpiringSoon ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-slate-500'}`}>
                        {daysLeft === 0 ? (t('expiresToday') || 'Expires today') : (t('expiresInDays') || `${daysLeft}d left`)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onResendInvite(inv.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition opacity-0 group-hover:opacity-100"
                    title={t('resendInvite') || 'Resend invite'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRevokeInvite(inv.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                    title={t('revokeInvite') || 'Revoke invite'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
