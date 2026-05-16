'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, webhooksApi, type PlatformSettings } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  AdminStatsSchema,
  RevenueSchema,
  AuditLogResponseSchema,
  FeatureFlagsResponseSchema,
  DeployInfoSchema,
  AdminUsersResponseSchema,
  AdminUserDetailSchema,
  SystemHealthSchema,
  QueueStatusSchema,
  RevenueMetricsSchema,
  RevenueCohortsResponseSchema,
  RefundsResponseSchema,
  PlatformSettingsSchema,
  FailedDeliveriesResponseSchema,
  DeadLettersResponseSchema,
  RateLimitViolationsResponseSchema,
  ApiLatencyResponseSchema,
  type AdminStatsValidated,
  type RevenueValidated,
  type DeployInfoValidated,
  type SystemHealthValidated,
} from '@/schemas/api';
import type { AlertRuleAdmin } from '@/lib/api';

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
  created_after?: string;
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
export function useAdminRevenueCohorts(months = 12) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'revenue-cohorts', months],
    queryFn: validated(() => adminApi.getRevenueCohorts(token!, months), RevenueCohortsResponseSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Admin All Refunds ──
export function useAdminRefunds(params?: { per_page?: number }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'refunds', params],
    queryFn: validated(() => adminApi.getAllRefunds(token!, params), RefundsResponseSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Admin Churn Users ──
export function useAdminChurn() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'churn'],
    queryFn: async () => {
      const data = await adminApi.getChurn(token!);
      return data?.users ?? [];
    },
    enabled: !!token,
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

// ── System Health ──
export function useSystemHealth() {
  const { token } = useAuth();
  return useQuery<SystemHealthValidated>({
    queryKey: ['admin', 'system-health'],
    queryFn: async () => {
      const data = await adminApi.getSystemHealth(token!);
      return SystemHealthSchema.parse(data);
    },
    enabled: !!token,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

// ── Queue Status ──
export function useQueueStatus() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'queue-status'],
    queryFn: validated(() => adminApi.getQueueStatus(token!), QueueStatusSchema),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Failed Deliveries ──
export function useFailedDeliveries(params?: { limit?: number; since?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'failed-deliveries', params],
    queryFn: validated(() => adminApi.getFailedDeliveries(token!, params), FailedDeliveriesResponseSchema),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Dead Letters ──
export function useDeadLetters(params?: { limit?: number }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'dead-letters', params],
    queryFn: validated(() => adminApi.getDeadLetters(token!, params), DeadLettersResponseSchema),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Rate Limit Violations ──
export function useRateLimitViolations(params?: { limit?: number }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'rate-limit-violations', params],
    queryFn: validated(() => adminApi.getRateLimitViolations(token!, params), RateLimitViolationsResponseSchema),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── API Latency ──
export function useApiLatency(params?: { period?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'api-latency', params],
    queryFn: validated(() => adminApi.getApiLatency(token!, params), ApiLatencyResponseSchema),
    enabled: !!token,
    staleTime: 30_000,
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

// ── Batch Replay Mutation ──
export function useBatchReplay() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => webhooksApi.batchReplay(token!, ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'failed-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dead-letters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue-status'] });
    },
  });
}
