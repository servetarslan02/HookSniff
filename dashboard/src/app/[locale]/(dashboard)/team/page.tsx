'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { teamsApi, type Team, type TeamMember } from '@/lib/api';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';

/* ─── Hook0-style: Members ─── */

const ROLES = ['viewer', 'editor', 'admin'] as const;
type Role = (typeof ROLES)[number];

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'editor':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'viewer':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  }
}

export default function TeamPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const t = useTranslations('team');
  const tc = useTranslations('common');

  const currentMember = members.find((m) => m.user_id === user?.id);
  const currentRole = currentMember?.role || 'member';
  const canInvite = currentRole === 'owner' || currentRole === 'admin';

  const fetchTeams = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await teamsApi.list(token);
      const teamList = Array.isArray(data) ? data : [];
      if (teamList.length > 0 && !selectedTeam) {
        setSelectedTeam(teamList[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, selectedTeam]);

  const fetchMembers = useCallback(async (teamId: string) => {
    if (!token) return;
    try {
      const data = await teamsApi.listMembers(token, teamId);
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);
  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam.id);
  }, [selectedTeam, fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedTeam || !inviteEmail) return;
    setInviting(true);
    try {
      await teamsApi.inviteMember(token, selectedTeam.id, { email: inviteEmail, role: inviteRole });
      toast(t('invitationSent') || 'Invitation sent', 'success');
      setInviteEmail('');
      fetchMembers(selectedTeam.id);
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('unknownError'), 'error');
    } finally {
      setInviting(false);
    }
  };

  const confirmRemove = async () => {
    if (!token || !selectedTeam || !removeTarget) return;
    try {
      await teamsApi.removeMember(token, selectedTeam.id, removeTarget);
      toast(t('memberRemoved') || 'Member removed', 'success');
      fetchMembers(selectedTeam.id);
    } catch {
      toast(t('removeFailed') || 'Remove failed', 'error');
    }
    setRemoveTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Title ── */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('title') || 'Members'}
      </h1>

      {/* ── Invite a Member ── */}
      {canInvite && selectedTeam && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t('inviteMember') || 'Invite a member'}
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            {t('inviteDesc') || 'Invite other members to your organization and assign them a role.'}
          </p>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('emailPlaceholder') || 'Email address'}
              required
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`role${r.charAt(0).toUpperCase() + r.slice(1)}`) || r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 whitespace-nowrap"
            >
              {inviting ? (tc('sending') || 'Sending...') : (t('inviteBtn') || 'Invite member')}
            </button>
          </form>
        </div>
      )}

      {/* ── Members List ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t('membersTitle') || 'Members'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {t('membersDesc') || 'Manage who has access to this organization and their permissions.'}
          </p>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('noMembers') || 'No members yet. Invite someone!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">{t('nameLabel') || 'Name'}</th>
                  <th className="px-6 py-3">{t('emailLabel') || 'Email'}</th>
                  <th className="px-6 py-3">{t('roleLabel') || 'Role'}</th>
                  <th className="px-6 py-3 text-right">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {members.map((m) => {
                  const isCurrentUser = m.user_id === user?.id;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                            {(m.name || m.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {m.name || '—'}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs text-gray-400 dark:text-slate-500">
                              ({t('currentUser') || 'current user'})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600 dark:text-slate-400">{m.email}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadgeClass(m.role)}`}>
                          {t(`role${m.role.charAt(0).toUpperCase() + m.role.slice(1)}`) || m.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {m.role !== 'owner' && (
                          <button
                            type="button"
                            onClick={() => setRemoveTarget(m.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {tc('delete')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={!!removeTarget}
        title={t('removeMember') || 'Remove Member'}
        message={t('removeConfirm') || 'Are you sure you want to remove this member?'}
        confirmLabel={tc('delete')}
        variant="danger"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
