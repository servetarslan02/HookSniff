'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { teamsApi, type Team, type TeamMember } from '@/lib/api';
import { useTranslations } from 'next-intl';
import ConfirmDialog from '@/components/ConfirmDialog';

/* ─── Hook0-style: Members (Üyeler) ─── */

export default function TeamPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const t = useTranslations('team');
  const tc = useTranslations('common');

  const currentRole = members.find((m) => m.user_id === user?.id)?.role || 'member';
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
      toast(t('invitationSent') || 'Davet gönderildi', 'success');
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
      toast(t('memberRemoved') || 'Üye kaldırıldı', 'success');
      fetchMembers(selectedTeam.id);
    } catch {
      toast(t('removeFailed') || 'Kaldırma başarısız', 'error');
    }
    setRemoveTarget(null);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Başlık ── */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title') || 'Üyeler'}</h2>

      {/* ── Davet Formu (Hook0 gibi) ── */}
      {canInvite && selectedTeam && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('inviteMember') || 'Üye davet et'}</h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('emailPlaceholder') || 'ornek@email.com'}
              required
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            >
              <option value="member">{t('roleMember') || 'Üye'}</option>
              <option value="admin">{t('roleAdmin') || 'Yönetici'}</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            >
              {inviting ? (tc('sending') || 'Gönderiliyor...') : (t('invite') || 'Davet Et')}
            </button>
          </form>
        </div>
      )}

      {/* ── Üyeler Tablosu (Hook0 gibi) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {members.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('noMembers') || 'Henüz üye yok'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('nameLabel') || 'İsim'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('emailLabel') || 'E-posta'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('roleLabel') || 'Rol'}</th>
                  <th className="text-right px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('actions') || 'Eylemler'}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                          {(m.name || m.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">{m.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{m.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        m.role === 'owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        m.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {m.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(m.id)}
                          className="text-gray-400 hover:text-red-600 transition"
                          title={t('remove') || 'Kaldır'}
                        >
                          🗑
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        title={t('removeMember') || 'Üyeyi kaldır'}
        message={t('removeConfirm') || 'Bu üyeyi kaldırmak istediğinize emin misiniz?'}
        confirmLabel={t('remove') || 'Kaldır'}
        variant="danger"
        onConfirm={confirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
