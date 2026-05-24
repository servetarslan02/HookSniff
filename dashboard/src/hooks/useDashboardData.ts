'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/store';
// Type-only imports — erased at build time, zero runtime cost
import type {
  AlertRule, Team, TeamMember,
  DeliveryDetail, DeliveryAttempt, NotificationListResponse,
  AuditLogEntryResponse, EndpointHealthResponse,
  ApiKeyResponse, PortalConfigResponse, PortalEmbedCodeResponse,
  PortalProfileResponse, PortalUsageResponse, RateLimitResponse,
  SchemaRegistryListResponse, SearchResponseData,
  ServiceTokenResponse, TemplateListResponse,
} from '@/lib/api';
import type {
  EndpointValidated,
  BillingUsageValidated,
  BillingSubscriptionValidated,
  OverageSettingsValidated,
  InvoiceValidated,
  ApplicationValidated,
  TransformRuleValidated,
  InboundConfigValidated,
  SsoConfigValidated,
} from '@/schemas/api';

// ── Lazy module loaders (cached after first call) ──
// These defer loading of api.ts (1367 lines) + schemas/api.ts (941 lines)
// until a query actually runs — AFTER initial page render (FCP).
let _api: typeof import('@//lib/api') | null = null;
let _schemas: typeof import('@/schemas/api') | null = null;

async function loadApi() {
  if (!_api) _api = await import('@/lib/api');
  return _api;
}
async function loadSchemas() {
  if (!_schemas) _schemas = await import('@/schemas/api');
  return _schemas;
}

// ── Schema-validated lazy fetcher ──
async function validatedLazy<T>(
  apiFn: () => Promise<unknown>,
  schemaFn: (schemas: NonNullable<typeof _schemas>) => { parse: (data: unknown) => T }
): Promise<T> {
  const schemas = await loadSchemas();
  const data = await apiFn();
  return schemaFn(schemas).parse(data);
}

// ══════════════════════════════════════════════════
// ENDPOINTS
// ══════════════════════════════════════════════════

export function useEndpoints() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['endpoints'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.endpointsApi.list(token!); },
      s => s.EndpointSchema.array()
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useEndpointDetail(id: string) {
  const { token } = useAuth();
  return useQuery<EndpointValidated>({
    queryKey: ['endpoint', id],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.endpointsApi.get(token!, id); },
      s => s.EndpointSchema
    ),
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

export function useDeleteEndpoint() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.endpointsApi.delete(token!, id); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['endpoints'] }),
  });
}

export function useToggleEndpoint() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const a = await loadApi();
      return a.endpointsApi.update(token!, id, { is_active });
    },
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ['endpoint', id] });
      await queryClient.cancelQueries({ queryKey: ['endpoints'] });
      const previousDetail = queryClient.getQueryData(['endpoint', id]);
      const previousList = queryClient.getQueryData(['endpoints']);
      queryClient.setQueryData(['endpoint', id], (old: unknown) => ({
        ...(old as Record<string, unknown>), is_active,
      }));
      queryClient.setQueryData(['endpoints'], (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((ep: Record<string, unknown>) => ep.id === id ? { ...ep, is_active } : ep);
      });
      return { previousDetail, previousList };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousDetail) queryClient.setQueryData(['endpoint', id], context.previousDetail);
      if (context?.previousList) queryClient.setQueryData(['endpoints'], context.previousList);
    },
    onSettled: (_d, _e, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['endpoint', id] });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// ══════════════════════════════════════════════════
// WEBHOOKS (DELIVERIES)
// ══════════════════════════════════════════════════

export function useWebhooks(params?: { page?: number; status?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['webhooks', params],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.webhooksApi.list(token!, params); },
      s => s.DeliveryListResponseSchema
    ),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useReplayDelivery() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.webhooksApi.replay(token!, id); },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useReplayWebhook() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.webhooksApi.replay(token!, id); },
    onSettled: (_d, _e, id) => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['delivery', id, 'attempts'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-logs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useCreateWebhook() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { endpoint_id: string; event?: string; data: unknown }) => {
      const a = await loadApi(); return a.webhooksApi.create(token!, body);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeliveryDetail(id: string) {
  const { token } = useAuth();
  return useQuery<DeliveryDetail>({
    queryKey: ['delivery', id],
    queryFn: async () => { const a = await loadApi(); return a.webhooksApi.get(token!, id); },
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

export function useDeliveryAttempts(id: string) {
  const { token } = useAuth();
  return useQuery<DeliveryAttempt[]>({
    queryKey: ['delivery', id, 'attempts'],
    queryFn: async () => {
      const a = await loadApi();
      try { return await a.webhooksApi.getAttempts(token!, id); }
      catch { return [] as DeliveryAttempt[]; }
    },
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

export function useDeliveryLogs(params: { page?: number; status?: string; refetchInterval?: number }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['delivery-logs', params],
    queryFn: async () => {
      const a = await loadApi();
      const [data, deliveredData, failedData, pendingData] = await Promise.all([
        a.webhooksApi.list(token!, { page: params.page, status: params.status === 'all' ? undefined : params.status }),
        a.webhooksApi.list(token!, { page: 1, status: 'delivered' }).catch(() => ({ total: 0, deliveries: [] })),
        a.webhooksApi.list(token!, { page: 1, status: 'failed' }).catch(() => ({ total: 0, deliveries: [] })),
        a.webhooksApi.list(token!, { page: 1, status: 'pending' }).catch(() => ({ total: 0, deliveries: [] })),
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

// ══════════════════════════════════════════════════
// STATS & ANALYTICS
// ══════════════════════════════════════════════════

export function useDashboardStats() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.statsApi.get(token!); },
      s => s.StatsResponseSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useDeliveryTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'delivery-trend', range],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.analyticsApi.deliveryTrend(token!, range); },
      s => s.DeliveryTrendSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useSuccessRate(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'success-rate', range],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.analyticsApi.successRate(token!, range); },
      s => s.SuccessRateSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useLatencyTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['latency-trend', range],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.analyticsApi.latencyTrend(token!, range); },
      s => s.LatencyTrendSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ══════════════════════════════════════════════════
// BILLING
// ══════════════════════════════════════════════════

export function useBillingUsage() {
  const { token } = useAuth();
  return useQuery<BillingUsageValidated>({
    queryKey: ['billing', 'usage'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.billingApiExtended.getUsage(token!); },
      s => s.BillingUsageSchema
    ),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useBillingInvoices() {
  const { token } = useAuth();
  return useQuery<InvoiceValidated[]>({
    queryKey: ['billing', 'invoices'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.billingApiExtended.getInvoices(token!); },
      s => s.InvoiceSchema.array()
    ),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useBillingSubscription() {
  const { token } = useAuth();
  return useQuery<BillingSubscriptionValidated>({
    queryKey: ['billing', 'subscription'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.billingApiExtended.getSubscription(token!); },
      s => s.BillingSubscriptionSchema
    ),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useOverageSettings() {
  const { token } = useAuth();
  return useQuery<OverageSettingsValidated>({
    queryKey: ['billing', 'overage'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.billingApiExtended.getOverageSettings(token!); },
      s => s.OverageSettingsSchema
    ),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ══════════════════════════════════════════════════
// APPLICATIONS
// ══════════════════════════════════════════════════

export function useApplications() {
  const { token } = useAuth();
  return useQuery<ApplicationValidated[]>({
    queryKey: ['applications'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.applicationsApi.list(token!); },
      s => s.ApplicationSchema.array()
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useApplicationDetail(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const a = await loadApi();
      const [app, allEndpoints, deliveriesResp] = await Promise.all([
        a.applicationsApi.get(token!, id),
        a.endpointsApi.list(token!).catch(() => []),
        a.webhooksApi.list(token!, { page: 1 }).catch(() => ({ deliveries: [] })),
      ]);
      const appEndpoints = allEndpoints.filter((ep) => ep.application_id === app.id);
      const appEndpointIds = new Set(appEndpoints.map((ep) => ep.id));
      const appDeliveries = (deliveriesResp.deliveries || []).filter((del) => appEndpointIds.has(del.endpoint_id));
      return { app, endpoints: appEndpoints, deliveries: appDeliveries };
    },
    enabled: !!token && !!id,
    staleTime: 15_000,
  });
}

// ══════════════════════════════════════════════════
// ALERTS
// ══════════════════════════════════════════════════

export function useAlerts() {
  const { token } = useAuth();
  return useQuery<AlertRule[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const a = await loadApi();
      const data = await a.alertsApi.list(token!);
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
    mutationFn: async (data: { name: string; condition: string; threshold: number; channels: string[] }) => {
      const a = await loadApi(); return a.alertsApi.create(token!, data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useUpdateAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; condition: string; threshold: number; channels: string[]; is_active: boolean }> }) => {
      const a = await loadApi(); return a.alertsApi.update(token!, id, data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useDeleteAlert() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.alertsApi.delete(token!, id); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useTestAlert() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.alertsApi.test(token!, id); },
  });
}

// ══════════════════════════════════════════════════
// TEAMS
// ══════════════════════════════════════════════════

export function useTeams() {
  const { token } = useAuth();
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const a = await loadApi();
      const data = await a.teamsApi.list(token!);
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
      const a = await loadApi();
      const data = await a.teamsApi.listMembers(token!, teamId!);
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
    queryFn: async () => { const a = await loadApi(); return a.teamsApi.getDetail(token!, teamId!); },
    enabled: !!token && !!teamId,
    staleTime: 15_000,
  });
}

export function useCreateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => { const a = await loadApi(); return a.teamsApi.create(token!, data); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useUpdateTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: { name?: string; description?: string } }) => {
      const a = await loadApi(); return a.teamsApi.update(token!, teamId, data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useInviteTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: { email: string; role: string } }) => {
      const a = await loadApi(); return a.teamsApi.inviteMember(token!, teamId, data);
    },
    onSettled: (_d, _e, { teamId }) => queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] }),
  });
}

export function useRemoveTeamMember() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
      const a = await loadApi(); return a.teamsApi.removeMember(token!, teamId, memberId);
    },
    onSettled: (_d, _e, { teamId }) => queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] }),
  });
}

export function useUpdateTeamMemberRole() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, memberId, role }: { teamId: string; memberId: string; role: string }) => {
      const a = await loadApi(); return a.teamsApi.updateRole(token!, teamId, memberId, role);
    },
    onSettled: (_d, _e, { teamId }) => queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] }),
  });
}

export function useAcceptTeamInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteToken: string) => { const a = await loadApi(); return a.teamsApi.acceptInvite(token!, inviteToken); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useDeleteTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => { const a = await loadApi(); return a.teamsApi.delete(token!, teamId); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useLeaveTeam() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => { const a = await loadApi(); return a.teamsApi.leave(token!, teamId); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
}

export function useTransferOwnership() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, newOwnerId }: { teamId: string; newOwnerId: string }) => {
      const a = await loadApi(); return a.teamsApi.transferOwnership(token!, teamId, newOwnerId);
    },
    onSettled: (_d, _e, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    },
  });
}

export function useRevokeInvite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: string) => { const a = await loadApi(); return a.teamsApi.revokeInvite(token!, inviteId); },
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
    mutationFn: async (inviteId: string) => { const a = await loadApi(); return a.teamsApi.resendInvite(token!, inviteId); },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams'], exact: false });
    },
  });
}

// ══════════════════════════════════════════════════
// TRANSFORM RULES
// ══════════════════════════════════════════════════

export function useTransformRules(endpointId: string) {
  const { token } = useAuth();
  return useQuery<TransformRuleValidated[]>({
    queryKey: ['transforms', endpointId],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.transformsApi.list(token!, endpointId); },
      s => s.TransformRuleSchema.array()
    ),
    enabled: !!token && !!endpointId,
    staleTime: 15_000,
  });
}

export function useCreateTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ endpointId, rule }: { endpointId: string; rule: TransformRuleValidated['rule_json'] }) => {
      const a = await loadApi(); return a.transformsApi.create(token!, endpointId, { rule });
    },
    onSettled: (_d, _e, { endpointId }) => queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] }),
  });
}

export function useDeleteTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ endpointId, ruleId }: { endpointId: string; ruleId: string }) => {
      const a = await loadApi(); return a.transformsApi.delete(token!, endpointId, ruleId);
    },
    onSettled: (_d, _e, { endpointId }) => queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] }),
  });
}

export function useUpdateTransformRule() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ endpointId, ruleId, rule }: { endpointId: string; ruleId: string; rule: TransformRuleValidated['rule_json'] }) => {
      const a = await loadApi(); return a.transformsApi.update(token!, endpointId, ruleId, { rule });
    },
    onSettled: (_d, _e, { endpointId }) => queryClient.invalidateQueries({ queryKey: ['transforms', endpointId] }),
  });
}

export function useTestTransform() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async ({ endpointId, payload, config }: { endpointId: string; payload: unknown; config: TransformRuleValidated['rule_json'] }) => {
      const a = await loadApi(); return a.transformsApi.test(token!, endpointId, { payload, config });
    },
  });
}

// ══════════════════════════════════════════════════
// INBOUND CONFIGS
// ══════════════════════════════════════════════════

export function useInboundConfigs() {
  const { token } = useAuth();
  return useQuery<InboundConfigValidated[]>({
    queryKey: ['inbound-configs'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.inboundApi.listConfigs(token!); },
      s => s.InboundConfigSchema.array()
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { provider: string; endpoint_id?: string | null; secret: string }) => {
      const a = await loadApi(); return a.inboundApi.createConfig(token!, data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbound-configs'] }),
  });
}

export function useUpdateInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { secret?: string; endpoint_id?: string | null; enabled?: boolean } }) => {
      const a = await loadApi(); return a.inboundApi.updateConfig(token!, id, data);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbound-configs'] }),
  });
}

export function useDeleteInboundConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.inboundApi.deleteConfig(token!, id); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbound-configs'] }),
  });
}

// ══════════════════════════════════════════════════
// SSO
// ══════════════════════════════════════════════════

export function useSsoConfig(teamId?: string | null) {
  const { token } = useAuth();
  return useQuery<SsoConfigValidated>({
    queryKey: ['sso-config', teamId],
    queryFn: async () => {
      const a = await loadApi();
      const schemas = await loadSchemas();
      const data = await a.apiFetch<SsoConfigValidated>(
        `/sso/config${teamId ? `?team_id=${teamId}` : ''}`, { token: token! }
      );
      return schemas.SsoConfigSchema.parse(data);
    },
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ══════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════

export function useNotifications(params?: { page?: number; type?: string; read?: boolean }) {
  const { token } = useAuth();
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const a = await loadApi();
      return a.notificationsApi.list(token!, { page: params?.page, type: params?.type, read: params?.read });
    },
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useMarkNotificationAsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.notificationsApi.markAsRead(token!, id); },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({ queryKey: ['notifications'] });
      queryClient.setQueriesData<NotificationListResponse>({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return { ...old, notifications: old.notifications.map((n) => n.id === id ? { ...n, read: true } : n) };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) { for (const [key, data] of context.previous) queryClient.setQueryData(key, data); }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsAsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => { const a = await loadApi(); return a.notificationsApi.markAllAsRead(token!); },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({ queryKey: ['notifications'] });
      queryClient.setQueriesData<NotificationListResponse>({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return { ...old, notifications: old.notifications.map((n) => ({ ...n, read: true })) };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) { for (const [key, data] of context.previous) queryClient.setQueryData(key, data); }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useDeleteNotification() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.notificationsApi.deleteNotification(token!, id); },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueriesData<NotificationListResponse>({ queryKey: ['notifications'] });
      queryClient.setQueriesData<NotificationListResponse>({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return { ...old, notifications: old.notifications.filter((n) => n.id !== id), total: old.total - 1 };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) { for (const [key, data] of context.previous) queryClient.setQueryData(key, data); }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ══════════════════════════════════════════════════
// AUDIT LOG
// ══════════════════════════════════════════════════

export function useAuditLogs(params?: { page?: number; limit?: number; action?: string }) {
  const { token } = useAuth();
  return useQuery<{ entries: AuditLogEntryResponse[]; has_more: boolean }>({
    queryKey: ['audit-log', params],
    queryFn: async () => { const a = await loadApi(); return a.api.getAuditLog(token!, params); },
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ══════════════════════════════════════════════════
// ENDPOINT HEALTH
// ══════════════════════════════════════════════════

export function useEndpointHealth(range = '24h') {
  const { token } = useAuth();
  return useQuery<EndpointHealthResponse[]>({
    queryKey: ['endpoint-health', range],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getEndpointHealth(token || undefined, range); },
      s => s.EndpointHealthSchema.array()
    ),
    enabled: true,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ══════════════════════════════════════════════════
// API KEYS
// ══════════════════════════════════════════════════

export function useApiKeys() {
  const { token } = useAuth();
  return useQuery<ApiKeyResponse[]>({
    queryKey: ['api-keys'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getApiKeys(token!); },
      s => s.ApiKeySchema.array()
    ),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useCreateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => { const a = await loadApi(); return a.api.createApiKey(token!, name); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useDeleteApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.api.deleteApiKey(token!, id); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRotateApiKey() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.api.rotateApiKey(token!, id); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

// ══════════════════════════════════════════════════
// PORTAL
// ══════════════════════════════════════════════════

export function usePortalConfig() {
  const { token } = useAuth();
  return useQuery<PortalConfigResponse>({
    queryKey: ['portal-config'],
    queryFn: async () => {
      const a = await loadApi();
      const schemas = await loadSchemas();
      const data = await a.api.getPortalConfig(token!);
      return schemas.PortalConfigSchema.parse(data) as PortalConfigResponse;
    },
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePortalEmbedCode() {
  const { token } = useAuth();
  return useQuery<PortalEmbedCodeResponse>({
    queryKey: ['portal-embed-code'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getPortalEmbedCode(token!); },
      s => s.PortalEmbedCodeSchema
    ),
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useUpdatePortalConfig() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: Partial<PortalConfigResponse>) => {
      const a = await loadApi(); return a.api.updatePortalConfig(token!, config);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['portal-config'] }),
  });
}

export function usePortalProfile() {
  const { token } = useAuth();
  return useQuery<PortalProfileResponse>({
    queryKey: ['portal-profile'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getPortalProfile(token!); },
      s => s.PortalProfileSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function usePortalUsage() {
  const { token } = useAuth();
  return useQuery<PortalUsageResponse>({
    queryKey: ['portal-usage'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getPortalUsage(token!); },
      s => s.PortalUsageSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ══════════════════════════════════════════════════
// RATE LIMITS
// ══════════════════════════════════════════════════

export function useRateLimits() {
  const { token } = useAuth();
  return useQuery<RateLimitResponse[]>({
    queryKey: ['rate-limits'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getRateLimits(token!); },
      s => s.RateLimitSchema.array()
    ),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useSetRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ endpointId, config }: { endpointId: string; config: { requests_per_second: number; burst_size: number; enabled: boolean } }) => {
      const a = await loadApi(); return a.api.setRateLimit(token!, endpointId, config);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
  });
}

export function useDeleteRateLimit() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (endpointId: string) => { const a = await loadApi(); return a.api.deleteRateLimit(token!, endpointId); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['rate-limits'] }),
  });
}

// ══════════════════════════════════════════════════
// SCHEMAS
// ══════════════════════════════════════════════════

export function useSchemas() {
  const { token } = useAuth();
  return useQuery<SchemaRegistryListResponse>({
    queryKey: ['schemas'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getSchemas(token!); },
      s => s.SchemaRegistryListSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ══════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════

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
    queryFn: async () => { const a = await loadApi(); return a.api.search(token!, searchParams); },
    enabled,
    staleTime: 10_000,
  });
}

// ══════════════════════════════════════════════════
// SERVICE TOKENS
// ══════════════════════════════════════════════════

export function useServiceTokens() {
  const { token } = useAuth();
  return useQuery<ServiceTokenResponse[]>({
    queryKey: ['service-tokens'],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getServiceTokens(token!); },
      s => s.ServiceTokenSchema.array()
    ),
    enabled: !!token,
    staleTime: 15_000,
  });
}

export function useCreateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => { const a = await loadApi(); return a.api.createServiceToken(token!, name); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

export function useDeleteServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.api.deleteServiceToken(token!, id); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

export function useRevealServiceToken() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => { const a = await loadApi(); return a.api.revealServiceToken(token!, id); },
  });
}

export function useUpdateServiceToken() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: { name?: string; is_active?: boolean } }) => {
      const a = await loadApi(); return a.api.updateServiceToken(token!, id, body);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['service-tokens'] }),
  });
}

// ══════════════════════════════════════════════════
// TEMPLATES
// ══════════════════════════════════════════════════

export function useTemplates(industry?: string) {
  const { token } = useAuth();
  return useQuery<TemplateListResponse>({
    queryKey: ['templates', industry],
    queryFn: () => validatedLazy(
      async () => { const a = await loadApi(); return a.api.getTemplates(token!, industry); },
      s => s.TemplateListSchema
    ),
    enabled: !!token,
    staleTime: 60_000,
  });
}
