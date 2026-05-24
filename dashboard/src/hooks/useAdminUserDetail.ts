'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, webhooksApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  AdminUserDetailSchema,
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

// ════════════════════════════════════════════════════════════════
// Admin User Detail Page — Queries
// ════════════════════════════════════════════════════════════════

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

export function useAdminImpersonate() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (userId: string) => adminApi.impersonateUser(token!, userId),
  });
}

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

export function useAdminGdprExport() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (userId: string) => adminApi.exportUserData(token!, userId),
  });
}

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

export function useAdminUserTestWebhook() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ userId, data }: {
      userId: string;
      data: { endpoint_url: string; event_type?: string; payload: Record<string, unknown> };
    }) => adminApi.adminUserTestWebhook(token!, userId, data),
  });
}

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
