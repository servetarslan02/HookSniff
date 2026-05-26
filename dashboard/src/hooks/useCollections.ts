'use client';

/**
 * Compatibility hooks for the previous TanStack DB live-query layer.
 *
 * The live-query implementation was expensive during route transitions and
 * caused prerender failures in Next's production build. Keep the public hook
 * names stable, but use React Query underneath for predictable caching.
 */

import { useQuery } from '@tanstack/react-query';
import {
  api,
  alertsApi,
  applicationsApi,
  endpointsApi,
  inboundApi,
  notificationsApi,
  teamsApi,
  transformsApi,
  webhooksApi,
} from '@/lib/api';
import type {
  AlertRule,
  ApiKeyResponse,
  Application,
  Delivery,
  Endpoint,
  InboundConfig,
  Notification,
  ServiceTokenResponse,
  Team,
  TransformRule,
} from '@/lib/api';
import { useAuth } from '@/lib/store';

function useTokenQuery<TData>(
  queryKey: readonly unknown[],
  queryFn: (token: string) => Promise<TData>,
  staleTime = 30_000
) {
  const { token } = useAuth();
  return useQuery<TData>({
    queryKey,
    queryFn: () => queryFn(token!),
    enabled: !!token,
    staleTime,
    placeholderData: (previous) => previous,
  });
}

export function useLiveEndpoints() {
  return useTokenQuery<Endpoint[]>(['endpoints'], async (token) => {
    const res = await endpointsApi.list(token);
    return Array.isArray(res) ? res : [];
  });
}

export function useLiveDeliveries(params?: { page?: number; status?: string }) {
  return useTokenQuery<Delivery[]>(['webhooks', params], async (token) => {
    const res = await webhooksApi.list(token, params);
    return res?.deliveries ?? [];
  }, 15_000);
}

export function useLiveTeams() {
  return useTokenQuery<Team[]>(['teams'], async (token) => {
    const res = await teamsApi.list(token);
    return Array.isArray(res) ? res : [];
  });
}

export function useLiveApiKeys() {
  return useTokenQuery<ApiKeyResponse[]>(['api-keys'], async (token) => {
    const res = await api.getApiKeys(token);
    return Array.isArray(res) ? res : [];
  }, 15_000);
}

export function useLiveNotifications() {
  return useTokenQuery<Notification[]>(['notifications'], async (token) => {
    const res = await notificationsApi.list(token);
    return Array.isArray(res) ? res : [];
  }, 15_000);
}

export function useLiveAlerts() {
  return useTokenQuery<AlertRule[]>(['alerts'], async (token) => {
    const res = await alertsApi.list(token);
    return Array.isArray(res) ? res : [];
  });
}

export function useLiveServiceTokens() {
  return useTokenQuery<ServiceTokenResponse[]>(['service-tokens'], async (token) => {
    const res = await api.getServiceTokens(token);
    return Array.isArray(res) ? res : [];
  });
}

export function useLiveTransforms(endpointId: string) {
  return useTokenQuery<TransformRule[]>(['transforms', endpointId], async (token) => {
    if (!endpointId) return [];
    const res = await transformsApi.list(token, endpointId);
    return Array.isArray(res) ? res : [];
  });
}

export function useLiveApplications() {
  return useTokenQuery<Application[]>(['applications'], async (token) => {
    const res = await applicationsApi.list(token);
    return Array.isArray(res) ? res : [];
  });
}

export function useLiveInboundConfigs() {
  return useTokenQuery<InboundConfig[]>(['inboundConfigs'], async (token) => {
    const res = await inboundApi.listConfigs(token);
    return Array.isArray(res) ? res : [];
  });
}
