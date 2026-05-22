'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/store';
import { teamsApi } from '@/lib/api';

export type TeamRole = 'owner' | 'admin' | 'developer' | 'analyst' | 'viewer';

/**
 * Returns the user's role in their first (active) team.
 * Hierarchy: owner > admin > developer > analyst > viewer
 */
export function useTeamRole() {
  const { token, user } = useAuth();

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.list(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  const teamId = teams?.[0]?.id ?? null;

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => teamsApi.listMembers(token!, teamId!),
    enabled: !!token && !!teamId,
    staleTime: 30_000,
  });

  const { data: teamDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['teams', teamId, 'detail'],
    queryFn: () => teamsApi.getDetail(token!, teamId!),
    enabled: !!token && !!teamId,
    staleTime: 30_000,
  });

  const isLoading = membersLoading || detailLoading;

  if (!teamId || !user) {
    return { role: null as TeamRole | null, teamId: null, isLoading };
  }

  // Check if user is team owner
  if (teamDetail?.owner_id === user.id) {
    return { role: 'owner' as TeamRole, teamId, isLoading };
  }

  // Find user in members list
  const member = members?.find((m) => m.customer_id === user.id);
  const role = (member?.role ?? 'viewer') as TeamRole;

  return { role, teamId, isLoading };
}

/** Role hierarchy level (higher = more access) */
export function roleLevel(role: TeamRole): number {
  const levels: Record<TeamRole, number> = {
    owner: 50,
    admin: 40,
    developer: 30,
    analyst: 20,
    viewer: 10,
  };
  return levels[role] ?? 0;
}

/** Check if role meets minimum requirement */
export function hasMinRole(userRole: TeamRole | null, minRole: TeamRole): boolean {
  if (!userRole) return false;
  return roleLevel(userRole) >= roleLevel(minRole);
}
