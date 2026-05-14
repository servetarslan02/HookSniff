'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { teamsApi, type Team, type TeamMember } from '@/lib/api';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TeamList } from './components/TeamList';
import { TeamDetail } from './components/TeamDetail';
import { CreateTeamModal } from './components/CreateTeamModal';
import { InviteMemberModal } from './components/InviteMemberModal';

export default function TeamPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const t = useTranslations('team');

  const currentRole = members.find((m) => m.customer_id === user?.id)?.role || 'viewer';
  const canInvite = currentRole === 'admin';
  const canRemove = currentRole === 'admin';
  const canChangeRole = currentRole === 'admin';

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
  }, [token, toast, t]);

  const fetchMembers = useCallback(async (teamId: string) => {
    if (!token) return;
    try {
      const data = await teamsApi.listMembers(token, teamId);
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      toast(t("failedToLoadMembers"), "error");
    }
  }, [token, toast, t]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);
  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam.id);
  }, [selectedTeam, fetchMembers]);

  const handleCreate = async (name: string) => {
    if (!token) return;
    try {
      await teamsApi.create(token, { name });
      toast(t('teamCreated'), 'success');
      fetchTeams();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('failedToCreateTeam');
      toast(msg, 'error');
    }
  };

  const handleInvite = async (email: string, role: string) => {
    if (!token || !selectedTeam) return;
    try {
      await teamsApi.inviteMember(token, selectedTeam.id, { email, role });
      toast(t('invitationSent'), 'success');
      fetchMembers(selectedTeam.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('failedToInvite');
      toast(msg, 'error');
    }
  };

  const confirmRemoveMember = async () => {
    if (!token || !selectedTeam || !removeTarget) return;
    try {
      await teamsApi.removeMember(token, selectedTeam.id, removeTarget);
      toast(t('memberRemoved'), 'success');
      fetchMembers(selectedTeam.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('removeFailed');
      toast(msg, 'error');
    }
    setRemoveTarget(null);
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!token || !selectedTeam) return;
    if (memberId === user?.id && newRole !== 'admin') {
      toast(t('cannotDemoteSelf'), 'error');
      return;
    }
    try {
      await teamsApi.updateRole(token, selectedTeam.id, memberId, newRole);
      toast(t('roleUpdated'), 'success');
      fetchMembers(selectedTeam.id);
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
        <TeamList
          teams={teams}
          loading={loading}
          selectedTeamId={selectedTeam?.id}
          onSelect={setSelectedTeam}
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
