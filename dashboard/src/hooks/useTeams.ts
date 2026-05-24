'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi, type Team, type TeamMember } from '@/lib/api';
import { useAuth } from '@/lib/store';

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
    staleTime: 30_000,
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
    staleTime: 15_000,
  });
}

export function useTeamDetail(teamId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['teams', teamId, 'detail'],
    queryFn: () => teamsApi.getDetail(token!, teamId!),
    enabled: !!token && !!teamId,
    staleTime: 15_000,
  });
}

export function useCreateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => teamsApi.create(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { name?: string; description?: string } }) =>
      teamsApi.update(token!, teamId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useInviteTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { email: string; role: string } }) =>
      teamsApi.inviteMember(token!, teamId, data),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useRemoveTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      teamsApi.removeMember(token!, teamId, memberId),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, memberId, role }: { teamId: string; memberId: string; role: string }) =>
      teamsApi.updateRole(token!, teamId, memberId, role),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useAcceptTeamInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteToken: string) => teamsApi.acceptInvite(token!, inviteToken),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useDeleteTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => teamsApi.delete(token!, teamId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useLeaveTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => teamsApi.leave(token!, teamId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useTransferOwnership() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) =>
      teamsApi.transferOwnership(token!, teamId, newOwnerId),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useRevokeInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => teamsApi.revokeInvite(token!, inviteId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'], exact: false });
    },
  });
}

export function useResendInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => teamsApi.resendInvite(token!, inviteId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'], exact: false });
    },
  });
}
