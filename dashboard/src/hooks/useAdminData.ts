'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  AuditLogResponseSchema,
  DeployInfoSchema,
  AdminUsersResponseSchema,
  type DeployInfoValidated,
} from '@/schemas/api';

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
export {
  useAdminStats, useAdminRevenue, useAdminRevenueMetrics,
  useAdminRevenueCohorts, useAdminRefunds, useAdminChurn,
} from './useAdminStats';
export {
  useAdminFeatureFlags, useCreateFeatureFlag, useUpdateFeatureFlag,
  useDeleteFeatureFlag, useFeatureFlags, useIsFeatureEnabled,
  useAdminSettings, useUpdateSettings, useTestWebhook, useAdminBroadcasts,
} from './useAdminSettings';
export {
  useAdminAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert,
} from './useAdminAlerts';

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
