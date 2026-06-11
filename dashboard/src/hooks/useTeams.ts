'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi, type Team, type TeamMember } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useFriendlyToast } from './useFriendlyToast';

// ── Teams ──
export function useTeams() {
  const { token } = useAuth();
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const data = await teamsApi.list(token!);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!token,
    staleTime: 120_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useTeamMembers(teamId: string | null) {
  const { token } = useAuth();
  return useQuery<TeamMember[]>({
    queryKey: ['teams', teamId, 'members'],
    queryFn: async () => {
      const data = await teamsApi.listMembers(token!, teamId!);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!token && !!teamId,
    staleTime: 180_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useTeamDetail(teamId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['teams', teamId, 'detail'],
    queryFn: () => teamsApi.getDetail(token!, teamId!),
    enabled: !!token && !!teamId,
    staleTime: 180_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (data: { name: string }) => teamsApi.create(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => showError(err),
  });
}

export function useUpdateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { name?: string; description?: string } }) =>
      teamsApi.update(token!, teamId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => showError(err),
  });
}

export function useInviteTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { email: string; role: string } }) =>
      teamsApi.inviteMember(token!, teamId, data),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
    onError: (err) => showError(err),
  });
}

export function useRemoveTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      teamsApi.removeMember(token!, teamId, memberId),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
    onError: (err) => showError(err),
  });
}

export function useUpdateTeamMemberRole() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: ({ teamId, memberId, role }: { teamId: string; memberId: string; role: string }) =>
      teamsApi.updateRole(token!, teamId, memberId, role),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
    onError: (err) => showError(err),
  });
}

export function useAcceptTeamInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (inviteToken: string) => teamsApi.acceptInvite(token!, inviteToken),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => showError(err),
  });
}

export function useDeleteTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (teamId: string) => teamsApi.delete(token!, teamId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => showError(err),
  });
}

export function useLeaveTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (teamId: string) => teamsApi.leave(token!, teamId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err) => showError(err),
  });
}

export function useTransferOwnership() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) =>
      teamsApi.transferOwnership(token!, teamId, newOwnerId),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
    onError: (err) => showError(err),
  });
}

export function useRevokeInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (inviteId: string) => teamsApi.revokeInvite(token!, inviteId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'], exact: false });
    },
    onError: (err) => showError(err),
  });
}

export function useResendInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { showError } = useFriendlyToast();
  return useMutation({
    mutationFn: (inviteId: string) => teamsApi.resendInvite(token!, inviteId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'], exact: false });
    },
    onError: (err) => showError(err),
  });
}
