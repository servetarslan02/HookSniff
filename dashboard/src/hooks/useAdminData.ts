'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  AdminStatsSchema,
  RevenueSchema,
  AuditLogResponseSchema,
  FeatureFlagsResponseSchema,
  DeployInfoSchema,
  AdminUsersResponseSchema,
  AdminUserDetailSchema,
  type AdminStatsValidated,
  type RevenueValidated,
  type DeployInfoValidated,
} from '@/schemas/api';

// ── Schema-validated fetcher wrapper ──
function validated<T>(
  fetcher: () => Promise<unknown>,
  schema: { parse: (data: unknown) => T }
): () => Promise<T> {
  return async () => {
    const data = await fetcher();
    return schema.parse(data);
  };
}

// ── Admin Stats ──
export function useAdminStats() {
  const { token } = useAuth();
  return useQuery<AdminStatsValidated>({
    queryKey: ['admin', 'stats'],
    queryFn: validated(() => adminApi.getStats(token!), AdminStatsSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Admin Revenue ──
export function useAdminRevenue() {
  const { token } = useAuth();
  return useQuery<RevenueValidated>({
    queryKey: ['admin', 'revenue'],
    queryFn: validated(() => adminApi.getRevenue(token!), RevenueSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Admin Audit Logs ──
export function useAdminAuditLogs(limit = 5) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'audit-logs', limit],
    queryFn: validated(
      () => adminApi.getAuditLogs(token!, { limit }),
      AuditLogResponseSchema
    ),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Admin Feature Flags ──
export function useAdminFeatureFlags() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: validated(
      () => adminApi.listFeatureFlags(token!),
      FeatureFlagsResponseSchema
    ),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

// ── Admin Deploy Info ──
export function useAdminDeployInfo() {
  const { token } = useAuth();
  return useQuery<DeployInfoValidated>({
    queryKey: ['admin', 'deploy-info'],
    queryFn: validated(() => adminApi.getDeployInfo(token!), DeployInfoSchema),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

// ── Admin Users List ──
export function useAdminUsers(params?: {
  page?: number;
  search?: string;
  plan?: string;
  status?: string;
}) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: validated(
      () => adminApi.listUsers(token!, params),
      AdminUsersResponseSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Admin User Detail ──
export function useAdminUserDetail(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: validated(
      () => adminApi.getUserDetail(token!, id),
      AdminUserDetailSchema
    ),
    enabled: !!token && !!id,
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useUpdateUserPlan() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, plan }: { userId: string; plan: string }) =>
      adminApi.updateUserPlan(token!, userId, plan),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateUserStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: 'active' | 'banned';
    }) => adminApi.updateUserStatus(token!, userId, status),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
