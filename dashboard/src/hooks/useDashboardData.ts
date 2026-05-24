'use client';

import { useQuery } from '@tanstack/react-query';
import {
  api, endpointsApi, webhooksApi,
  applicationsApi,
  apiFetch,
  type AuditLogEntryResponse,
  type SchemaRegistryListResponse, type SearchResponseData,
  type TemplateListResponse,
} from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  ApplicationSchema,
  SsoConfigSchema,
  SchemaRegistryListSchema,
  TemplateListSchema,
  type ApplicationValidated,
  type SsoConfigValidated,
} from '@/schemas/api';

// ── Re-exports ──
export {
  useTeams, useTeamMembers, useTeamDetail, useCreateTeam, useUpdateTeam,
  useInviteTeamMember, useRemoveTeamMember, useUpdateTeamMemberRole,
  useAcceptTeamInvite, useDeleteTeam, useLeaveTeam, useTransferOwnership,
  useRevokeInvite, useResendInvite,
} from './useTeams';
export {
  useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead,
  useDeleteNotification, useReplayWebhook,
} from './useNotifications';
export {
  useBillingUsage, useBillingInvoices, useBillingSubscription, useOverageSettings,
} from './useBilling';
export {
  useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert, useTestAlert,
} from './useAlerts';
export {
  useTransformRules, useCreateTransformRule, useDeleteTransformRule,
  useUpdateTransformRule, useTestTransform,
} from './useTransforms';
export {
  usePortalConfig, usePortalEmbedCode, useUpdatePortalConfig,
  usePortalProfile, usePortalUsage,
} from './usePortal';
export {
  useApiKeys, useCreateApiKey, useDeleteApiKey, useRotateApiKey,
} from './useApiKeys';
export {
  useServiceTokens, useCreateServiceToken, useDeleteServiceToken,
  useRevealServiceToken, useUpdateServiceToken,
} from './useServiceTokens';
export {
  useEndpoints, useEndpointDetail, useDeleteEndpoint, useToggleEndpoint,
} from './useEndpoints';
export {
  useDashboardStats, useDeliveryTrend, useSuccessRate,
  useEndpointHealth, useLatencyTrend,
} from './useAnalytics';
export {
  useWebhooks, useReplayDelivery, useDeliveryDetail,
  useDeliveryAttempts, useDeliveryLogs, useCreateWebhook,
} from './useWebhooks';
export {
  useInboundConfigs, useCreateInboundConfig, useUpdateInboundConfig,
  useDeleteInboundConfig,
} from './useInboundConfigs';
export {
  useRateLimits, useSetRateLimit, useDeleteRateLimit,
} from './useRateLimits';

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
