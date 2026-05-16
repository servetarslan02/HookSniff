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
  UserEndpointsResponseSchema,
  UserWebhooksResponseSchema,
  UserApiKeysResponseSchema,
  UserApplicationsResponseSchema,
  UserUsageResponseSchema,
  UserAnalyticsResponseSchema,
  UserPlanHistoryResponseSchema,
  NotesResponseSchema,
  TagsResponseSchema,
  CommunicationsResponseSchema,
  UserInvoicesResponseSchema,
  UserPaymentsResponseSchema,
  UserRefundsResponseSchema,
  DeliveryDetailResponseSchema,
  DeliveryAttemptResponseSchema,
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
      reason,
    }: {
      userId: string;
      status: 'active' | 'banned';
      reason?: string;
    }) => adminApi.updateUserStatus(token!, userId, status, reason),
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

// ── Feature Flag Mutations ──

export function useCreateFeatureFlag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      is_enabled?: boolean;
      rollout_percentage?: number;
      enabled_for_plans?: string[];
    }) => adminApi.createFeatureFlag(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
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
        description?: string;
        is_enabled?: boolean;
        rollout_percentage?: number;
        enabled_for_plans?: string[];
      };
    }) => adminApi.updateFeatureFlag(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
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
    },
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

// ════════════════════════════════════════════════════════════════
// Admin User Detail Page — Queries
// ════════════════════════════════════════════════════════════════

// ── User Analytics ──
export function useAdminUserAnalytics(userId: string, days = 30) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'analytics', days],
    queryFn: validated(
      () => adminApi.getUserAnalytics(token!, userId, days),
      UserAnalyticsResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 60_000,
  });
}

// ── User Plan History ──
export function useAdminUserPlanHistory(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'plan-history'],
    queryFn: validated(
      () => adminApi.getUserPlanHistory(token!, userId),
      UserPlanHistoryResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── User Endpoints ──
export function useAdminUserEndpoints(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'endpoints'],
    queryFn: validated(
      () => adminApi.getUserEndpoints(token!, userId),
      UserEndpointsResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── User Webhooks (paginated) ──
export function useAdminUserWebhooks(
  userId: string,
  params?: { page?: number; per_page?: number; status?: string; event_type?: string }
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'webhooks', params],
    queryFn: validated(
      () => adminApi.getUserWebhooks(token!, userId, params),
      UserWebhooksResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 15_000,
  });
}

// ── User API Keys ──
export function useAdminUserApiKeys(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'api-keys'],
    queryFn: validated(
      () => adminApi.getUserApiKeys(token!, userId),
      UserApiKeysResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── User Applications ──
export function useAdminUserApplications(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'applications'],
    queryFn: validated(
      () => adminApi.getUserApplications(token!, userId),
      UserApplicationsResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── User Usage ──
export function useAdminUserUsage(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'usage'],
    queryFn: validated(
      () => adminApi.getUserUsage(token!, userId),
      UserUsageResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── User Notes ──
export function useAdminUserNotes(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'notes'],
    queryFn: validated(
      () => adminApi.getNotes(token!, userId),
      NotesResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 15_000,
  });
}

// ── User Tags ──
export function useAdminUserTags(userId: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'tags'],
    queryFn: validated(
      () => adminApi.getTags(token!, userId),
      TagsResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 15_000,
  });
}

// ── User Communications (paginated) ──
export function useAdminUserCommunications(
  userId: string,
  params?: { page?: number; per_page?: number; type?: string }
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'communications', params],
    queryFn: validated(
      () => adminApi.getCommunications(token!, userId, params),
      CommunicationsResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 15_000,
  });
}

// ── User Invoices (paginated) ──
export function useAdminUserInvoices(
  userId: string,
  params?: { page?: number; per_page?: number; status?: string }
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'invoices', params],
    queryFn: validated(
      () => adminApi.getUserInvoices(token!, userId, params),
      UserInvoicesResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── User Payments ──
export function useAdminUserPayments(userId: string, perPage = 50) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'payments', perPage],
    queryFn: validated(
      () => adminApi.getUserPayments(token!, userId, { per_page: perPage }),
      UserPaymentsResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── User Refunds ──
export function useAdminUserRefunds(userId: string, perPage = 50) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', userId, 'refunds', perPage],
    queryFn: validated(
      () => adminApi.getUserRefunds(token!, userId, { per_page: perPage }),
      UserRefundsResponseSchema
    ),
    enabled: !!token && !!userId,
    staleTime: 30_000,
  });
}

// ── Delivery Detail (for modal) ──
export function useDeliveryDetail(deliveryId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'delivery', deliveryId],
    queryFn: validated(
      () => webhooksApi.get(token!, deliveryId!),
      DeliveryDetailResponseSchema
    ),
    enabled: !!token && !!deliveryId,
    staleTime: 10_000,
  });
}

// ── Delivery Attempts (for modal) ──
export function useDeliveryAttempts(deliveryId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'delivery', deliveryId, 'attempts'],
    queryFn: async () => {
      const data = await webhooksApi.getAttempts(token!, deliveryId!);
      return DeliveryAttemptResponseSchema.array().parse(data);
    },
    enabled: !!token && !!deliveryId,
    staleTime: 10_000,
  });
}

// ════════════════════════════════════════════════════════════════
// Admin User Detail Page — Mutations
// ════════════════════════════════════════════════════════════════

// ── Send Email to User ──
export function useAdminSendEmail() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, subject, body }: { userId: string; subject: string; body: string }) =>
      adminApi.sendUserEmail(token!, userId, subject, body),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'communications'] });
    },
  });
}

// ── Impersonate User ──
export function useAdminImpersonate() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (userId: string) => adminApi.impersonateUser(token!, userId),
  });
}

// ── Refund User ──
export function useAdminRefundUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, amountCents, reason, currency }: {
      userId: string; amountCents: number; reason: string; currency?: string;
    }) => adminApi.refundUser(token!, userId, amountCents, reason, currency),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'refunds'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'invoices'] });
    },
  });
}

// ── GDPR Export ──
export function useAdminGdprExport() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (userId: string) => adminApi.exportUserData(token!, userId),
  });
}

// ── GDPR Delete ──
export function useAdminGdprDelete() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminApi.deleteUserData(token!, userId, reason),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId] });
    },
  });
}

// ── Test Webhook (per-user) ──
export function useAdminUserTestWebhook() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ userId, data }: {
      userId: string;
      data: { endpoint_url: string; event_type?: string; payload: Record<string, unknown> };
    }) => adminApi.adminUserTestWebhook(token!, userId, data),
  });
}

// ── Add Note ──
export function useAdminAddNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, content }: { userId: string; content: string }) =>
      adminApi.addNote(token!, userId, content),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'notes'] });
    },
  });
}

// ── Add Tag ──
export function useAdminAddTag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tag }: { userId: string; tag: string }) =>
      adminApi.addTag(token!, userId, tag),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'tags'] });
    },
  });
}

// ── Remove Tag ──
export function useAdminRemoveTag() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tag }: { userId: string; tag: string }) =>
      adminApi.removeTag(token!, userId, tag),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'tags'] });
    },
  });
}

// ── Replay Delivery (per-user) ──
export function useAdminReplayDelivery() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, deliveryId }: { userId: string; deliveryId: string }) =>
      adminApi.adminUserReplayDelivery(token!, userId, deliveryId),
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId, 'webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', vars.userId] });
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
