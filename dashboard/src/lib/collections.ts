'use client';

/**
 * TanStack DB Collections — Katman 14
 *
 * Wraps existing TanStack Query calls into reactive collections.
 * Live queries provide sub-millisecond updates.
 * Optimistic mutations with automatic rollback.
 */

import { createCollection } from '@tanstack/react-db';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { endpointsApi, webhooksApi, teamsApi, notificationsApi, alertsApi, transformsApi, inboundApi, api } from '@/lib/api';
import type { QueryClient } from '@tanstack/react-query';

// ── Endpoints Collection ──
export function createEndpointsCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['endpoints'],
      queryFn: async () => {
        const res = await endpointsApi.list(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}

// ── Deliveries Collection ──
export function createDeliveriesCollection(token: string, queryClient: QueryClient, params?: { page?: number; status?: string }) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['webhooks', params],
      queryFn: async () => {
        const res = await webhooksApi.list(token, params);
        return res?.deliveries ?? [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 15_000,
    })
  );
}

// ── Teams Collection ──
export function createTeamsCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['teams'],
      queryFn: async () => {
        const res = await teamsApi.list(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}

// ── API Keys Collection ──
export function createApiKeysCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['apiKeys'],
      queryFn: async () => {
        const { apiKeysApi } = await import('@/lib/api');
        const res = await apiKeysApi.list(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}

// ── Notifications Collection ──
export function createNotificationsCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['notifications'],
      queryFn: async () => {
        const res = await notificationsApi.list(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 15_000,
    })
  );
}

// ── Alerts Collection ──
export function createAlertsCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['alerts'],
      queryFn: async () => {
        const res = await alertsApi.list(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}

// ── Service Tokens Collection ──
export function createServiceTokensCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['service-tokens'],
      queryFn: async () => {
        const res = await api.getServiceTokens(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}

// ── Transforms Collection ──
export function createTransformsCollection(token: string, queryClient: QueryClient, endpointId: string) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['transforms', endpointId],
      queryFn: async () => {
        const res = await transformsApi.list(token, endpointId);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}

// ── Applications Collection ──
export function createApplicationsCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['applications'],
      queryFn: async () => {
        const { applicationsApi } = await import('@/lib/api');
        const res = await applicationsApi.list(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}

// ── Inbound Configs Collection ──
export function createInboundConfigsCollection(token: string, queryClient: QueryClient) {
  return createCollection(
    queryCollectionOptions({
      queryKey: ['inboundConfigs'],
      queryFn: async () => {
        const res = await inboundApi.listConfigs(token);
        return Array.isArray(res) ? res : [];
      },
      queryClient,
      getKey: (item: Record<string, unknown>) => item.id as string,
      staleTime: 30_000,
    })
  );
}
