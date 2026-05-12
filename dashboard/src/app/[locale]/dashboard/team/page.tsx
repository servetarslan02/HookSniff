'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { teamsApi, type Team, type TeamMember } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';

const ROLE_OPTIONS = ['owner', 'admin', 'member'] as const;

/** Map role key to i18n label */
function roleLabel(t: ReturnType<typeof useTranslations>, role: string): string {
  const map: Record<string, string> = { owner: t('roleOwner'), admin: t('roleAdmin'), member: t('roleMember') };
  return map[role] || role;
}

export default function TeamPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState('member');
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const t = useTranslations('team');
  const tc = useTranslations('common');
  const locale = useLocale();

  // Current user's role in the selected team
  const currentRole = members.find((m) => m.user_id === user?.id)?.role || 'member';
  const canInvite = currentRole === 'owner' || currentRole === 'admin';
  const canRemove = currentRole === 'owner' || currentRole === 'admin';
  const canChangeRole = currentRole === 'owner';

  const fetchTeams = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await teamsApi.list(token);
      setTeams(Array.isArray(data) ? data : []);
    } catch {
      toast(t("failedToLoadTeams"), "error");
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  const fetchMembers = useCallback(async (teamId: string) => {
    if (!token) return;
    try {
      const data = await teamsApi.listMembers(token, teamId);
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      toast(t("failedToLoadMembers"), "error");
    }
  }, [token, toast]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam.id);
  }, [selectedTeam, fetchMembers]);

  const handleCreate = async () => {
    if (!token || !createName.trim()) return;
    setCreating(true);
    try {
      await teamsApi.create(token, { name: createName.trim(), description: createDesc || undefined });
      toast(t('teamCreated'), 'success');
      setShowCreateModal(false);
      setCreateName('');
      setCreateDesc('');
      fetchTeams();
    } catch {
      toast(t("failedToCreateTeam"), "error");
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!token || !selectedTeam || !inviteEmail.trim()) return;
    setInviting(true);
    try {
      await teamsApi.inviteMember(token, selectedTeam.id, { email: inviteEmail.trim(), role: inviteRole });
      toast(t('invitationSent'), 'success');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      fetchMembers(selectedTeam.id);
    } catch {
      toast(t("failedToInvite"), "error");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemoveTarget(memberId);
  };

  const confirmRemoveMember = async () => {
    if (!token || !selectedTeam || !removeTarget) return;
    try {
      await teamsApi.removeMember(token, selectedTeam.id, removeTarget);
      toast(t('memberRemoved'), 'success');
      fetchMembers(selectedTeam.id);
    } catch {
      toast(t('removeFailed'), 'error');
    }
    setRemoveTarget(null);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!token || !selectedTeam) return;
    // Prevent owner from demoting themselves
    if (memberId === user?.id && newRole !== 'owner') {
      toast(t('cannotDemoteSelf'), 'error');
      return;
    }
    try {
      await teamsApi.updateRole(token, selectedTeam.id, memberId, newRole);
      toast(t('roleUpdated'), 'success');
      fetchMembers(selectedTeam.id);
    } catch {
      toast(t("failedToUpdateRole"), "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
        >
          {t('createTeam')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team List */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('yourTeams')}</h3>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-slate-400 animate-pulse text-sm">
              {t('loadingTeams')}
            </div>
          ) : teams.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t('noTeams')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                    selectedTeam?.id === team.id ? 'bg-brand-50 dark:bg-brand-500/10' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</p>
                  {team.description && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                      {team.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {t('membersCount', { count: team.member_count || 0 })} · {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Team Detail */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTeam.name}</h3>
                  {selectedTeam.description && (
                    <p className="text-sm text-gray-500 dark:text-slate-400">{selectedTeam.description}</p>
                  )}
                </div>
                <button type="button"
                  onClick={() => setShowInviteModal(true)} disabled={!canInvite}
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
                          onChange={(e) => handleRoleChange(m.id, e.target.value)} disabled={!canChangeRole}
                          className="px-3 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{roleLabel(t, r)}</option>
                          ))}
                        </select>
                        <button type="button"
                          onClick={() => handleRemoveMember(m.id)} disabled={!canRemove}
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
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-gray-500 dark:text-slate-400">
                {t('selectTeam')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('createTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('teamNameLabel')}</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={t('teamNamePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('descriptionLabel')}</label>
                <input
                  type="text"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder={t('descPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleCreate}
                disabled={!createName.trim() || creating}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
              >
                {creating ? tc('creating') : t('createTeamBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('inviteTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('emailLabel')}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('roleLabel')}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  {ROLE_OPTIONS.filter((r) => r !== 'owner').map((r) => (
                    <option key={r} value={r}>{roleLabel(t, r)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
              >
                {inviting ? tc('sending') : t('sendInvite')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HS-043: Remove member confirmation dialog */}
      <ConfirmDialog
        open={removeTarget !== null}
        title={t('removeMember')}
        message={t('removeConfirm')}
        variant="danger"
        onConfirm={confirmRemoveMember}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
