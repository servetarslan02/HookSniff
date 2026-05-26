'use client';

/**
 * TanStack DB Live Query Hooks — Katman 14
 *
 * Reactive data hooks using TanStack DB's live queries.
 * Sub-millisecond updates when data changes.
 * Drop-in replacement for existing useQuery hooks.
 */

import { useLiveQuery } from '@tanstack/react-db';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/store';
import {
  createEndpointsCollection,
  createDeliveriesCollection,
  createTeamsCollection,
  createApiKeysCollection,
  createNotificationsCollection,
  createAlertsCollection,
  createServiceTokensCollection,
  createTransformsCollection,
  createInboundConfigsCollection,
  createApplicationsCollection,
} from '@/lib/collections';

// ── Helper: safe map that filters undefined ──
function safeMap<T>(data: unknown[] | undefined, key: string): T[] {
  if (!data) return [];
  return data
    .map((d) => (d as Record<string, unknown>)?.[key])
    .filter((item): item is T => item != null && typeof item === 'object');
}

// ── Endpoints ──
export function useLiveEndpoints() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createEndpointsCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ endpoint: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'endpoint'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Deliveries ──
export function useLiveDeliveries(params?: { page?: number; status?: string }) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createDeliveriesCollection(token, queryClient, params) : null),
    [token, queryClient, params?.page, params?.status]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ delivery: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'delivery'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Teams ──
export function useLiveTeams() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createTeamsCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ team: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'team'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── API Keys ──
export function useLiveApiKeys() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createApiKeysCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ key: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'key'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Notifications ──
export function useLiveNotifications() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createNotificationsCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ notification: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'notification'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Alerts ──
export function useLiveAlerts() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createAlertsCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ alert: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'alert'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Service Tokens ──
export function useLiveServiceTokens() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createServiceTokensCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ token: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'token'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Transforms ──
export function useLiveTransforms(endpointId: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token && endpointId ? createTransformsCollection(token, queryClient, endpointId) : null),
    [token, queryClient, endpointId]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ transform: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'transform'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Applications ──
export function useLiveApplications() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createApplicationsCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ app: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'app'),
    isLoading: !token || isLoading,
    error,
  };
}

// ── Inbound Configs ──
export function useLiveInboundConfigs() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createInboundConfigsCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ config: collection }) : null
  );

  return {
    data: safeMap<Record<string, unknown>>(data, 'config'),
    isLoading: !token || isLoading,
    error,
  };
}
