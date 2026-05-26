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

// ── Endpoints ──
export function useLiveEndpoints() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const collection = useMemo(
    () => (token ? createEndpointsCollection(token, queryClient) : null),
    [token, queryClient]
  );

  const { data, isLoading, error } = useLiveQuery((q) =>
    collection ? q.from({ endpoint: collection }) : q.from({ endpoint: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.endpoint) ?? [],
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
    collection ? q.from({ delivery: collection }) : q.from({ delivery: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.delivery) ?? [],
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
    collection ? q.from({ team: collection }) : q.from({ team: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.team) ?? [],
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
    collection ? q.from({ key: collection }) : q.from({ key: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.key) ?? [],
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
    collection ? q.from({ notification: collection }) : q.from({ notification: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.notification) ?? [],
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
    collection ? q.from({ alert: collection }) : q.from({ alert: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.alert) ?? [],
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
    collection ? q.from({ token: collection }) : q.from({ token: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.token) ?? [],
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
    collection ? q.from({ transform: collection }) : q.from({ transform: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.transform) ?? [],
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
    collection ? q.from({ app: collection }) : q.from({ app: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.app) ?? [],
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
    collection ? q.from({ config: collection }) : q.from({ config: [] as Record<string, unknown>[] })
  );

  return {
    data: data?.map((d: Record<string, unknown>) => d.config) ?? [],
    isLoading: !token || isLoading,
    error,
  };
}
