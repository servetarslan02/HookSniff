'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/store';
import { teamsApi } from '@/lib/api';

export type TeamRole = 'owner' | 'admin' | 'developer' | 'analyst' | 'viewer';

/**
 * Returns the user's role in a specific team.
 * If no teamId is provided, uses the first team (backward compatible).
 *
 * Hierarchy: owner > admin > developer > analyst > viewer
 */
export function useTeamRole(teamId?: string | null) {
  const { token, user } = useAuth();

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.list(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  // Use provided teamId, or fall back to first team
  const effectiveTeamId = teamId ?? teams?.[0]?.id ?? null;

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['teams', effectiveTeamId, 'members'],
    queryFn: () => teamsApi.listMembers(token!, effectiveTeamId!),
    enabled: !!token && !!effectiveTeamId,
    staleTime: 30_000,
  });

  const isLoading = teamsLoading || membersLoading;

  if (!effectiveTeamId || !user) {
    return { role: null as TeamRole | null, teamId: null, isLoading };
  }

  // Check if user is team owner (owner_id is already in teams list — no need for getDetail)
  const team = teams?.find((t) => t.id === effectiveTeamId);
  if (team?.owner_id === user.id) {
    return { role: 'owner' as TeamRole, teamId: effectiveTeamId, isLoading };
  }

  // Find user in members list
  const member = members?.find((m) => m.customer_id === user.id);

  // If user is not a member and not the owner, return null (no role)
  if (!member) {
    return { role: null as TeamRole | null, teamId: effectiveTeamId, isLoading };
  }

  const role = member.role as TeamRole;

  return { role, teamId: effectiveTeamId, isLoading };
}

/**
 * Returns the user's role in ALL their teams.
 * Useful for checking if user has a role in ANY team.
 */
export function useAllTeamRoles() {
  const { token, user } = useAuth();

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.list(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  const teamRoles: Array<{ teamId: string; role: TeamRole }> = [];

  if (teams && user) {
    for (const team of teams) {
      // We can't fetch all members here without additional queries
      // This is a lightweight version that returns team ownership info
      if (team.owner_id === user.id) {
        teamRoles.push({ teamId: team.id, role: 'owner' });
      }
    }
  }

  return { teamRoles, teams: teams ?? [] };
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
