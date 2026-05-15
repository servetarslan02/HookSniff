'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsApi, webhooksApi, analyticsApi, statsApi, type Endpoint, type RetryPolicyConfig } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  EndpointSchema,
  DeliveryListResponseSchema,
  StatsResponseSchema,
  DeliveryTrendSchema,
  SuccessRateSchema,
  type EndpointValidated,
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

export function useUpdateEndpoint() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Endpoint> & { retry_policy?: RetryPolicyConfig };
    }) => endpointsApi.update(token!, id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['endpoint', id] });
      const previous = queryClient.getQueryData(['endpoint', id]);
      queryClient.setQueryData(['endpoint', id], (old: unknown) => ({
        ...(old as Record<string, unknown>),
        ...data,
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
    },
  });
}

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
