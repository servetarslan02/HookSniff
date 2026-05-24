'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type PlatformSettings } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  AdminStatsSchema,
  RevenueSchema,
  AuditLogResponseSchema,
  FeatureFlagsResponseSchema,
  DeployInfoSchema,
  AdminUsersResponseSchema,
  RevenueMetricsSchema,
  RevenueCohortsResponseSchema,
  RefundsResponseSchema,
  PlatformSettingsSchema,
  type AdminStatsValidated,
  type RevenueValidated,
  type DeployInfoValidated,
} from '@/schemas/api';
import type { AlertRuleAdmin } from '@/lib/api';

// ── Re-exports ──
export {
  useAdminUserDetail, useAdminUserAnalytics, useAdminUserPlanHistory,
  useAdminUserEndpoints, useAdminUserWebhooks, useAdminUserApiKeys,
  useAdminUserApplications, useAdminUserUsage, useAdminUserNotes,
  useAdminUserTags, useAdminUserCommunications, useAdminUserInvoices,
  useAdminUserPayments, useAdminUserRefunds, useDeliveryDetail, useDeliveryAttempts,
  useUpdateUserPlan, useUpdateUserStatus,
  useAdminSendEmail, useAdminImpersonate, useAdminRefundUser,
  useAdminGdprExport, useAdminGdprDelete, useAdminUserTestWebhook,
  useAdminAddNote, useAdminAddTag, useAdminRemoveTag, useAdminReplayDelivery,
} from './useAdminUserDetail';
export {
  useSystemHealth, useQueueStatus, useFailedDeliveries, useDeadLetters,
  useRateLimitViolations, useApiLatency, useBatchReplay,
} from './useAdminSystem';

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
export function useAdminAuditLogs(params?: {
  limit?: number;
  offset?: number;
  action?: string;
}) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: validated(
      () => adminApi.getAuditLogs(token!, params),
      AuditLogResponseSchema
    ),
    enabled: !!token && !!params,
    staleTime: 15_000,
  });
}

// ── Admin Feature Flags ──
export function useAdminFeatureFlags(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: validated(
      () => adminApi.listFeatureFlags(token!),
      FeatureFlagsResponseSchema
    ),
    enabled: !!token && enabled,
    staleTime: 30_000,
  });
}

// ── Admin Deploy Info ──
export function useAdminDeployInfo(enabled = true) {
  const { token } = useAuth();
  return useQuery<DeployInfoValidated>({
    queryKey: ['admin', 'deploy-info'],
    queryFn: validated(() => adminApi.getDeployInfo(token!), DeployInfoSchema),
    enabled: !!token && enabled,
    staleTime: 5 * 60_000,
  });
}

// ── Admin Users List ──
export function useAdminUsers(params?: {
  page?: number;
  search?: string;
  plan?: string;
  status?: string;
  created_after?: string;
  sort_field?: string;
  sort_dir?: string;
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

// ── Admin Alerts ──
export function useAdminAlerts() {
  const { token } = useAuth();
  return useQuery<AlertRuleAdmin[]>({
    queryKey: ['admin', 'alerts'],
    queryFn: async () => {
      const data = await adminApi.listAlerts(token!);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; condition: string; threshold: number; channels: string[] }) =>
      adminApi.createAlert(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useUpdateAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertRuleAdmin> }) =>
      adminApi.updateAlert(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAlert(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

// ── Admin Revenue Metrics ──
export function useAdminRevenueMetrics() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'revenue-metrics'],
    queryFn: validated(() => adminApi.getRevenueMetrics(token!), RevenueMetricsSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Admin Revenue Cohorts ──
export function useAdminRevenueCohorts(months?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'revenue-cohorts', months ?? 12],
    queryFn: validated(() => adminApi.getRevenueCohorts(token!, months ?? 12), RevenueCohortsResponseSchema),
    enabled: !!token && months !== undefined,
    staleTime: 60_000,
  });
}

// ── Admin All Refunds ──
export function useAdminRefunds(params?: { per_page?: number }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'refunds', params],
    queryFn: validated(() => adminApi.getAllRefunds(token!, params), RefundsResponseSchema),
    enabled: !!token && !!params,
    staleTime: 30_000,
  });
}

// ── Admin Churn Users ──
export function useAdminChurn(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'churn'],
    queryFn: async () => {
      const data = await adminApi.getChurn(token!);
      return data?.users ?? [];
    },
    enabled: !!token && enabled,
    staleTime: 60_000,
  });
}

// ── Admin Platform Settings ──
export function useAdminSettings() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: validated(() => adminApi.getSettings(token!), PlatformSettingsSchema),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettings() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PlatformSettings>) => adminApi.updateSettings(token!, data as PlatformSettings),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

// ── Test Webhook Mutation ──
export function useTestWebhook() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (data: { endpoint_url: string; event_type: string; payload: Record<string, unknown> }) =>
      adminApi.testWebhook(token!, data),
  });
}

// ── Feature Flag Mutations ──

export function useCreateFeatureFlag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string | null;
      is_enabled?: boolean;
      rollout_percentage?: number;
      enabled_for_plans?: string[];
    }) => adminApi.createFeatureFlag(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

export function useUpdateFeatureFlag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string | null;
        is_enabled?: boolean;
        rollout_percentage?: number;
        enabled_for_plans?: string[];
      };
    }) => adminApi.updateFeatureFlag(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

export function useDeleteFeatureFlag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deleteFeatureFlag(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

// ════════════════════════════════════════════════════════════════
// Public Feature Flags — no auth required
// ════════════════════════════════════════════════════════════════

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const res = await fetch('/api/v1/feature-flags');
      if (!res.ok) return { enabled_flags: [] as string[] };
      return res.json() as Promise<{ enabled_flags: string[] }>;
    },
    staleTime: 60_000,
  });
}

export function useIsFeatureEnabled(flagName: string): boolean {
  const { data } = useFeatureFlags();
  return data?.enabled_flags?.includes(flagName) ?? false;
}

// ── Admin Broadcasts ──
export function useAdminBroadcasts(params?: { is_active?: string; broadcast_type?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'broadcasts', params],
    queryFn: async () => {
      const qs: Record<string, string> = { per_page: '100' };
      if (params?.is_active) qs.is_active = params.is_active;
      if (params?.broadcast_type) qs.broadcast_type = params.broadcast_type;
      return adminApi.listBroadcasts(token!, qs);
    },
    enabled: !!token,
    staleTime: 30_000,
  });
}
