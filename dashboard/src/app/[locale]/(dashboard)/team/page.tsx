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

  // React Query hooks for data fetching
  const { data: teams = [], isLoading: loading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const { data: members = [] } = useTeamMembers(selectedTeamId);

  // Mutations
  const createTeamMutation = useCreateTeam();
  const inviteMemberMutation = useInviteTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();
  const acceptInviteMutation = useAcceptTeamInvite();

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;

  // Auto-accept invite if invite_token is in URL
  useEffect(() => {
    const inviteToken = searchParams.get('invite_token');
    if (!inviteToken) return;
    acceptInviteMutation.mutate(inviteToken, {
      onSuccess: (result) => {
        toast(t('inviteAccepted') || `Invite accepted! Joined team as ${result.role}`, 'success');
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : (t('inviteAcceptFailed') || 'Failed to accept invite');
        toast(msg, 'error');
      },
    });
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-600 dark:bg-brand-500 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
        >
          {t('createTeam')}
        </button>
      </div>

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
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-gray-500 dark:text-slate-400">
                {t('selectTeam')}
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
