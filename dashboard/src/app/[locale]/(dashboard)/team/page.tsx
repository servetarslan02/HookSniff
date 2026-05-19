'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  useTeams,
  useTeamMembers,
  useCreateTeam,
  useInviteTeamMember,
  useRemoveTeamMember,
  useUpdateTeamMemberRole,
  useAcceptTeamInvite,
} from '@/hooks/useDashboardData';
import { TeamList } from './components/TeamList';
import { TeamDetail } from './components/TeamDetail';
import { CreateTeamModal } from './components/CreateTeamModal';
import { InviteMemberModal } from './components/InviteMemberModal';

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('team');
  const searchParams = useSearchParams();

  const { data: teams = [], isLoading: loading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const { data: members = [] } = useTeamMembers(selectedTeamId);

  const createTeamMutation = useCreateTeam();
  const inviteMemberMutation = useInviteTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();
  const acceptInviteMutation = useAcceptTeamInvite();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;

  // Auto-accept invite if invite_token is in URL
  useEffect(() => {
    const inviteToken = searchParams.get('invite_token');
    if (!inviteToken) return;
    if (acceptInviteMutation.isPending) return;
    acceptInviteMutation.mutate(inviteToken, {
      onSuccess: (result) => {
        toast(t('inviteAccepted', { role: result.role }) || `Invite accepted! Joined team as ${result.role}`, 'success');
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : (t('inviteAcceptFailed') || 'Failed to accept invite');
        toast(msg, 'error');
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('invite_token')]);

  const currentRole = members.find((m) => m.customer_id === user?.id)?.role || 'viewer';
  const canInvite = currentRole === 'admin';
  const canRemove = currentRole === 'admin';
  const canChangeRole = currentRole === 'admin';

  const handleCreate = async (name: string) => {
    try {
      await createTeamMutation.mutateAsync({ name });
      toast(t('teamCreated'), 'success');
      setShowCreateModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('failedToCreateTeam');
      toast(msg, 'error');
    }
  };

  const handleInvite = async (email: string, role: string) => {
    if (!selectedTeamId) return;
    try {
      await inviteMemberMutation.mutateAsync({ teamId: selectedTeamId, data: { email, role } });
      toast(t('invitationSent'), 'success');
      setShowInviteModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('failedToInvite');
      toast(msg, 'error');
    }
  };

  const confirmRemoveMember = async () => {
    if (!selectedTeamId || !removeTarget) return;
    try {
      await removeMemberMutation.mutateAsync({ teamId: selectedTeamId, memberId: removeTarget });
      toast(t('memberRemoved'), 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('removeFailed');
      toast(msg, 'error');
    }
    setRemoveTarget(null);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!selectedTeamId) return;
    if (memberId === user?.id && newRole !== 'admin') {
      toast(t('cannotDemoteSelf'), 'error');
      return;
    }
    try {
      await updateRoleMutation.mutateAsync({ teamId: selectedTeamId, memberId, role: newRole });
      toast(t('roleUpdated'), 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('failedToUpdateRole');
      toast(msg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 dark:hover:bg-brand-600 transition shadow-sm shadow-brand-500/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('createTeam')}
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeamList
          teams={teams}
          loading={loading}
          selectedTeamId={selectedTeam?.id}
          onSelect={(team) => setSelectedTeamId(team?.id ?? null)}
        />

        <div className="lg:col-span-2">
          {selectedTeam ? (
            <TeamDetail
              team={selectedTeam}
              members={members}
              canInvite={canInvite}
              canRemove={canRemove}
              canChangeRole={canChangeRole}
              onInvite={() => setShowInviteModal(true)}
              onRemoveMember={setRemoveTarget}
              onRoleChange={handleRoleChange}
            />
          ) : (
            <div className="glass-card p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('selectTeam')}</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500 max-w-xs mx-auto">
                Select a team from the list to view members, manage roles, and send invitations
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateTeamModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />

      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />

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
