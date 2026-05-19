'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api, endpointsApi, webhooksApi, analyticsApi, statsApi,
  billingApiExtended, applicationsApi, alertsApi, teamsApi,
  transformsApi, inboundApi, notificationsApi, apiFetch,
  type AlertRule, type Team, type TeamMember,
  type DeliveryDetail, type DeliveryAttempt, type NotificationListResponse,
  type AuditLogEntryResponse, type EndpointHealthResponse,
  type ApiKeyResponse, type PortalConfigResponse, type PortalEmbedCodeResponse,
  type PortalProfileResponse, type PortalUsageResponse, type RateLimitResponse,
  type SchemaRegistryListResponse, type SearchResponseData,
  type ServiceTokenResponse, type TemplateListResponse,
} from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  EndpointSchema,
  DeliveryListResponseSchema,
  StatsResponseSchema,
  DeliveryTrendSchema,
  SuccessRateSchema,
  BillingUsageSchema,
  BillingSubscriptionSchema,
  OverageSettingsSchema,
  InvoiceSchema,
  ApplicationSchema,
  TransformRuleSchema,
  InboundConfigSchema,
  SsoConfigSchema,
  EndpointHealthSchema,
  LatencyTrendSchema,
  ApiKeySchema,
  PortalConfigSchema,
  PortalEmbedCodeSchema,
  PortalProfileSchema,
  PortalUsageSchema,
  RateLimitSchema,
  SchemaRegistryListSchema,
  ServiceTokenSchema,
  TemplateListSchema,
  type EndpointValidated,
  type BillingUsageValidated,
  type BillingSubscriptionValidated,
  type OverageSettingsValidated,
  type InvoiceValidated,
  type ApplicationValidated,
  type TransformRuleValidated,
  type InboundConfigValidated,
  type SsoConfigValidated,
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

// ── Endpoints ──
export function useEndpoints() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['endpoints'],
    queryFn: validated(() => endpointsApi.list(token!), EndpointSchema.array()),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Endpoint Detail ──
export function useEndpointDetail(id: string) {
  const { token } = useAuth();
  return useQuery<EndpointValidated>({
    queryKey: ['endpoint', id],
    queryFn: validated(() => endpointsApi.get(token!, id), EndpointSchema),
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

// ── Webhooks (Deliveries) ──
export function useWebhooks(params?: { page?: number; status?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['webhooks', params],
    queryFn: validated(
      () => webhooksApi.list(token!, params),
      DeliveryListResponseSchema
    ),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Dashboard Stats ──
export function useDashboardStats() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['stats'],
    queryFn: validated(() => statsApi.get(token!), StatsResponseSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Analytics: Delivery Trend ──
export function useDeliveryTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'delivery-trend', range],
    queryFn: validated(
      () => analyticsApi.deliveryTrend(token!, range),
      DeliveryTrendSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Analytics: Success Rate ──
export function useSuccessRate(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'success-rate', range],
    queryFn: validated(
      () => analyticsApi.successRate(token!, range),
      SuccessRateSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Mutations ──

export function useDeleteEndpoint() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => endpointsApi.delete(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
    },
  });
}

export function useToggleEndpoint() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      endpointsApi.update(token!, id, { is_active }),
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ['endpoint', id] });
      const previous = queryClient.getQueryData(['endpoint', id]);
      queryClient.setQueryData(['endpoint', id], (old: unknown) => ({
        ...(old as Record<string, unknown>),
        is_active,
      }));
      return { previous };
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['endpoint', id], context.previous);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['endpoint', id] });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useReplayDelivery() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.replay(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ── Billing Usage ──
export function useBillingUsage() {
  const { token } = useAuth();
  return useQuery<BillingUsageValidated>({
    queryKey: ['billing', 'usage'],
    queryFn: validated(() => billingApiExtended.getUsage(token!), BillingUsageSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Billing Invoices ──
export function useBillingInvoices() {
  const { token } = useAuth();
  return useQuery<InvoiceValidated[]>({
    queryKey: ['billing', 'invoices'],
    queryFn: validated(() => billingApiExtended.getInvoices(token!), InvoiceSchema.array()),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Billing Subscription ──
export function useBillingSubscription() {
  const { token } = useAuth();
  return useQuery<BillingSubscriptionValidated>({
    queryKey: ['billing', 'subscription'],
    queryFn: validated(() => billingApiExtended.getSubscription(token!), BillingSubscriptionSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Overage Settings ──
export function useOverageSettings() {
  const { token } = useAuth();
  return useQuery<OverageSettingsValidated>({
    queryKey: ['billing', 'overage'],
    queryFn: validated(() => billingApiExtended.getOverageSettings(token!), OverageSettingsSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Applications List ──
export function useApplications() {
  const { token } = useAuth();
  return useQuery<ApplicationValidated[]>({
    queryKey: ['applications'],
    queryFn: validated(() => applicationsApi.list(token!), ApplicationSchema.array()),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Application Detail (app + endpoints + deliveries) ──
export function useApplicationDetail(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const [app, allEndpoints, deliveriesResp] = await Promise.all([
        applicationsApi.get(token!, id),
        endpointsApi.list(token!).catch(() => []),
        webhooksApi.list(token!, { page: 1 }).catch(() => ({ deliveries: [] })),
      ]);
      const appEndpoints = allEndpoints.filter(
        (ep) => ep.application_id === app.id
      );
      const appEndpointIds = new Set(appEndpoints.map((ep) => ep.id));
      const appDeliveries = (deliveriesResp.deliveries || []).filter(
        (del) => appEndpointIds.has(del.endpoint_id)
      );
      return { app, endpoints: appEndpoints, deliveries: appDeliveries };
    },
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

// ── User Alerts ──
export function useAlerts() {
  const { token } = useAuth();
  return useQuery<AlertRule[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const data = await alertsApi.list(token!);
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
      alertsApi.create(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useUpdateAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; condition: string; threshold: number; channels: string[]; is_active: boolean }> }) =>
      alertsApi.update(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.delete(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useTestAlert() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => alertsApi.test(token!, id),
  });
}

// ── Teams ──
export function useTeams() {
  const { token } = useAuth();
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const data = await teamsApi.list(token!);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useTeamMembers(teamId: string | null) {
  const { token } = useAuth();
  return useQuery<TeamMember[]>({
    queryKey: ['teams', teamId, 'members'],
    queryFn: async () => {
      const data = await teamsApi.listMembers(token!, teamId!);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!token && !!teamId,
    staleTime: 15_000,
  });
}

export function useTeamDetail(teamId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['teams', teamId, 'detail'],
    queryFn: () => teamsApi.getDetail(token!, teamId!),
    enabled: !!token && !!teamId,
    staleTime: 15_000,
  });
}

export function useCreateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => teamsApi.create(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useUpdateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { name?: string; description?: string } }) =>
      teamsApi.update(token!, teamId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useInviteTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { email: string; role: string } }) =>
      teamsApi.inviteMember(token!, teamId, data),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useRemoveTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      teamsApi.removeMember(token!, teamId, memberId),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useUpdateTeamMemberRole() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, memberId, role }: { teamId: string; memberId: string; role: string }) =>
      teamsApi.updateRole(token!, teamId, memberId, role),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useAcceptTeamInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteToken: string) => teamsApi.acceptInvite(token!, inviteToken),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useDeleteTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => teamsApi.delete(token!, teamId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useLeaveTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => teamsApi.leave(token!, teamId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useTransferOwnership() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) =>
      teamsApi.transferOwnership(token!, teamId, newOwnerId),
    onSettled: (_data, _error, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useRevokeInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => teamsApi.revokeInvite(token!, inviteId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'], exact: false });
    },
  });
}

export function useResendInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => teamsApi.resendInvite(token!, inviteId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'], exact: false });
    },
  });
}

// ── Transform Rules ──
export function useTransformRules(endpointId: string) {
  const { token } = useAuth();
  return useQuery<TransformRuleValidated[]>({
    queryKey: ['transforms', endpointId],
    queryFn: validated(
      () => transformsApi.list(token!, endpointId),
      TransformRuleSchema.array()
    ),
    enabled: !!token && !!endpointId,
    staleTime: 15_000,
  });
}

export function useCreateTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, rule }: { endpointId: string; rule: TransformRuleValidated['rule_json'] }) =>
      transformsApi.create(token!, endpointId, { rule }),
    onSettled: (_data, _error, { endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] });
    },
  });
}

export function useDeleteTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, ruleId }: { endpointId: string; ruleId: string }) =>
      transformsApi.delete(token!, endpointId, ruleId),
    onSettled: (_data, _error, { endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] });
    },
  });
}

export function useUpdateTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, ruleId, rule }: { endpointId: string; ruleId: string; rule: TransformRuleValidated['rule_json'] }) =>
      transformsApi.update(token!, endpointId, ruleId, { rule }),
    onSettled: (_data, _error, { endpointId }) => {
      queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] });
    },
  });
}

export function useTestTransform() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ endpointId, payload, config }: { endpointId: string; payload: unknown; config: TransformRuleValidated['rule_json'] }) =>
      transformsApi.test(token!, endpointId, { payload, config }),
  });
}

// ── Inbound Configs ──
export function useInboundConfigs() {
  const { token } = useAuth();
  return useQuery<InboundConfigValidated[]>({
    queryKey: ['inbound-configs'],
    queryFn: validated(
      () => inboundApi.listConfigs(token!),
      InboundConfigSchema.array()
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { provider: string; endpoint_id?: string | null; secret: string }) =>
      inboundApi.createConfig(token!, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-configs'] });
    },
  });
}

export function useUpdateInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { secret?: string; endpoint_id?: string | null; enabled?: boolean } }) =>
      inboundApi.updateConfig(token!, id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-configs'] });
    },
  });
}

export function useDeleteInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      inboundApi.deleteConfig(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-configs'] });
    },
  });
}

// ── SSO Config ──
export function useSsoConfig(teamId?: string | null) {
  const { token } = useAuth();
  return useQuery<SsoConfigValidated>({
    queryKey: ['sso-config', teamId],
    queryFn: validated(
      () => apiFetch<SsoConfigValidated>(`/sso/config${teamId ? `?team_id=${teamId}` : ''}`, { token: token! }),
      SsoConfigSchema
    ),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Delivery Detail ──
export function useDeliveryDetail(id: string) {
  const { token } = useAuth();
  return useQuery<DeliveryDetail>({
    queryKey: ['delivery', id],
    queryFn: () => webhooksApi.get(token!, id),
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

// ── Delivery Attempts ──
export function useDeliveryAttempts(id: string) {
  const { token } = useAuth();
  return useQuery<DeliveryAttempt[]>({
    queryKey: ['delivery', id, 'attempts'],
    queryFn: async () => {
      try {
        return await webhooksApi.getAttempts(token!, id);
      } catch {
        return [] as DeliveryAttempt[];
      }
    },
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

// ── Delivery Logs (with status counts) ──
export function useDeliveryLogs(params: {
  page?: number;
  status?: string;
  refetchInterval?: number;
}) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['delivery-logs', params],
    queryFn: async () => {
      const [data, deliveredData, failedData, pendingData] = await Promise.all([
        webhooksApi.list(token!, {
          page: params.page,
          status: params.status === 'all' ? undefined : params.status,
        }),
        webhooksApi.list(token!, { page: 1, status: 'delivered' }).catch(() => ({ total: 0, deliveries: [] })),
        webhooksApi.list(token!, { page: 1, status: 'failed' }).catch(() => ({ total: 0, deliveries: [] })),
        webhooksApi.list(token!, { page: 1, status: 'pending' }).catch(() => ({ total: 0, deliveries: [] })),
      ]);
      return {
        deliveries: data.deliveries,
        total: data.total,
        statusCounts: {
          all: data.total,
          delivered: deliveredData.total,
          failed: failedData.total,
          pending: pendingData.total,
        },
      };
    },
    enabled: !!token,
    staleTime: 15_000,
    refetchInterval: params.refetchInterval ?? false,
  });
}

// ── Notifications ──
export function useNotifications(params?: {
  page?: number;
  type?: string;
  read?: boolean;
}) {
  const { token } = useAuth();
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', params],
    queryFn: () =>
      notificationsApi.list(token!, {
        page: params?.page,
        type: params?.type,
        read: params?.read,
      }),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Notification Mutations ──

export function useMarkNotificationAsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(token!, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: ['notifications'],
      });
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(token!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: ['notifications'],
      });
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.map((n) => ({ ...n, read: true })),
          };
        }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(token!, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: ['notifications'],
      });
      queryClient.setQueriesData<NotificationListResponse>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            notifications: old.notifications.filter((n) => n.id !== id),
            total: old.total - 1,
          };
        }
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useReplayWebhook() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.replay(token!, id),
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['delivery', id, 'attempts'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-logs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ── Audit Log ──
export function useAuditLogs(params?: { page?: number; limit?: number; action?: string }) {
  const { token } = useAuth();
  return useQuery<{ entries: AuditLogEntryResponse[]; has_more: boolean }>({
    queryKey: ['audit-log', params],
    queryFn: () => api.getAuditLog(token!, params),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Endpoint Health ──
export function useEndpointHealth() {
  const { token } = useAuth();
  return useQuery<EndpointHealthResponse[]>({
    queryKey: ['endpoint-health'],
    queryFn: validated(
      () => api.getEndpointHealth(token || undefined),
      EndpointHealthSchema.array()
    ),
    enabled: true,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ── Latency Trend ──
export function useLatencyTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['latency-trend', range],
    queryFn: validated(
      () => analyticsApi.latencyTrend(token!, range),
      LatencyTrendSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── API Keys ──
export function useApiKeys() {
  const { token } = useAuth();
  return useQuery<ApiKeyResponse[]>({
    queryKey: ['api-keys'],
    queryFn: validated(() => api.getApiKeys(token!), ApiKeySchema.array()),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useCreateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createApiKey(token!, name),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useDeleteApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteApiKey(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRotateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.rotateApiKey(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

// ── Portal ──
export function usePortalConfig() {
  const { token } = useAuth();
  return useQuery<PortalConfigResponse>({
    queryKey: ['portal-config'],
    queryFn: validated(() => api.getPortalConfig(token!), PortalConfigSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePortalEmbedCode() {
  const { token } = useAuth();
  return useQuery<PortalEmbedCodeResponse>({
    queryKey: ['portal-embed-code'],
    queryFn: validated(() => api.getPortalEmbedCode(token!), PortalEmbedCodeSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useUpdatePortalConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<PortalConfigResponse>) => api.updatePortalConfig(token!, config),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['portal-config'] }),
  });
}

export function usePortalProfile() {
  const { token } = useAuth();
  return useQuery<PortalProfileResponse>({
    queryKey: ['portal-profile'],
    queryFn: validated(() => api.getPortalProfile(token!), PortalProfileSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePortalUsage() {
  const { token } = useAuth();
  return useQuery<PortalUsageResponse>({
    queryKey: ['portal-usage'],
    queryFn: validated(() => api.getPortalUsage(token!), PortalUsageSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Rate Limits ──
export function useRateLimits() {
  const { token } = useAuth();
  return useQuery<RateLimitResponse[]>({
    queryKey: ['rate-limits'],
    queryFn: validated(() => api.getRateLimits(token!), RateLimitSchema.array()),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useSetRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ endpointId, config }: { endpointId: string; config: { requests_per_second: number; burst_size: number; enabled: boolean } }) =>
      api.setRateLimit(token!, endpointId, config),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
  });
}

export function useDeleteRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (endpointId: string) => api.deleteRateLimit(token!, endpointId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
  });
}

// ── Schemas ──
export function useSchemas() {
  const { token } = useAuth();
  return useQuery<SchemaRegistryListResponse>({
    queryKey: ['schemas'],
    queryFn: validated(() => api.getSchemas(token!), SchemaRegistryListSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Search ──
export function useSearch(params: { q?: string; status?: string; page?: number; per_page?: number }) {
  const { token } = useAuth();
  const enabled = !!token && (!!params.q || !!params.status);
  const searchParams: Record<string, string> = {};
  if (params.q) searchParams.q = params.q;
  if (params.status) searchParams.status = params.status;
  if (params.page) searchParams.page = params.page.toString();
  if (params.per_page) searchParams.per_page = params.per_page.toString();
  return useQuery<SearchResponseData>({
    queryKey: ['search', params],
    queryFn: () => api.search(token!, searchParams),
    enabled,
    staleTime: 10_000,
  });
}

// ── Service Tokens ──
export function useServiceTokens() {
  const { token } = useAuth();
  return useQuery<ServiceTokenResponse[]>({
    queryKey: ['service-tokens'],
    queryFn: validated(() => api.getServiceTokens(token!), ServiceTokenSchema.array()),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useCreateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createServiceToken(token!, name),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

export function useDeleteServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteServiceToken(token!, id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

export function useRevealServiceToken() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (id: string) => api.revealServiceToken(token!, id),
  });
}

export function useUpdateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; is_active?: boolean } }) =>
      api.updateServiceToken(token!, id, body),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

// ── Templates ──
export function useTemplates(industry?: string) {
  const { token } = useAuth();
  return useQuery<TemplateListResponse>({
    queryKey: ['templates', industry],
    queryFn: validated(() => api.getTemplates(token!, industry), TemplateListSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Create Webhook (for webhook-builder + webhooks/new) ──
export function useCreateWebhook() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { endpoint_id: string; event?: string; data: unknown }) =>
      webhooksApi.create(token!, body),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
