'use client';

import { usePermissions, type Permissions } from '@/hooks/usePermissions';

type PermissionKey = keyof Permissions;

/**
 * Conditionally renders children based on team role permissions.
 *
 * @example
 * <RoleGuard require="canManageWebhooks">
 *   <button>Create Webhook</button>
 * </RoleGuard>
 *
 * <RoleGuard require="canManageTeam" fallback={<span>Read-only</span>}>
 *   <TeamSettings />
 * </RoleGuard>
 */
export function RoleGuard({
  require,
  children,
  fallback = null,
}: {
  require: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const perms = usePermissions();

  if (perms.isLoading) return null;

  const allowed = perms[require];
  return allowed ? <>{children}</> : <>{fallback}</>;
}

/**
 * Shows a read-only badge when user doesn't have write access.
 */
export function ReadOnlyBadge() {
  const { role, isLoading } = usePermissions();
  if (isLoading || !role || role === 'owner' || role === 'admin') return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
      👁️ Read-only
    </span>
  );
}
