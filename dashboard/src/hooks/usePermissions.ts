'use client';

import { useTeamRole, type TeamRole } from './useTeamRole';

export interface Permissions {
  /** Can manage team members, roles, invites */
  canManageTeam: boolean;
  /** Can create/edit/delete webhooks, endpoints */
  canManageWebhooks: boolean;
  /** Can manage API keys, service tokens */
  canManageApiKeys: boolean;
  /** Can manage integrations, connectors */
  canManageIntegrations: boolean;
  /** Can manage alerts */
  canManageAlerts: boolean;
  /** Can manage billing, subscriptions */
  canManageBilling: boolean;
  /** Can manage custom domains */
  canManageDomains: boolean;
  /** Can manage applications */
  canManageApplications: boolean;
  /** Can manage operational webhooks */
  canManageOperationalWebhooks: boolean;
  /** Can manage background tasks */
  canManageBackgroundTasks: boolean;
  /** Can manage transforms, routing */
  canManageRouting: boolean;
  /** Can manage rate limits */
  canManageRateLimits: boolean;
  /** Can view observability data */
  canViewObservability: boolean;
  /** Can view devtools */
  canViewDevtools: boolean;
  /** Can manage settings */
  canManageSettings: boolean;
  /** Is team owner */
  isOwner: boolean;
  /** Is admin or owner */
  isAdmin: boolean;
  /** Current role */
  role: TeamRole | null;
  /** Team ID */
  teamId: string | null;
  /** Still loading */
  isLoading: boolean;
}

/**
 * Maps team role to granular permissions.
 *
 * Backend mapping (from api/src/routes/teams.rs):
 * - require_team_admin: admin + owner
 * - require_role("developer"): developer + admin + owner
 * - require_role("analyst"): analyst + developer + admin + owner
 * - require_team_member: all roles
 */
export function usePermissions(): Permissions {
  const { role, teamId, isLoading } = useTeamRole();

  const isAdmin = role === 'owner' || role === 'admin';
  const isDeveloper = isAdmin || role === 'developer';
  const isAnalyst = isDeveloper || role === 'analyst';
  const isAnyMember = !!role;

  return {
    // Admin-only (require_team_admin in backend)
    canManageTeam: isAdmin,
    canManageWebhooks: isAdmin,
    canManageApiKeys: isAdmin,
    canManageIntegrations: isAdmin,
    canManageAlerts: isAdmin,
    canManageBilling: isAdmin,
    canManageDomains: isAdmin,
    canManageApplications: isAdmin,
    canManageOperationalWebhooks: isAdmin,
    canManageBackgroundTasks: isAdmin,
    canManageRouting: isAdmin,
    canManageRateLimits: isAdmin,

    // Developer+ (require_role("developer") in backend)
    canViewDevtools: isDeveloper,

    // Analyst+ (require_role("analyst") in backend — read access)
    canViewObservability: isAnalyst,

    // All members
    canManageSettings: isAnyMember,

    // Meta
    isOwner: role === 'owner',
    isAdmin,
    role,
    teamId,
    isLoading,
  };
}
