'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhooksApi, statsApi, type DeliveryDetail, type DeliveryAttempt } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import { DeliveryListResponseSchema } from '@/schemas/api';

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
    placeholderData: (previousData) => previousData,
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
      queryClient.invalidateQueries({ queryKey: ['status-counts'] });
    },
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
    placeholderData: (previousData) => previousData,
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
    placeholderData: (previousData) => previousData,
  });
}

// ── Status Counts (single API call instead of 4!) ──
export function useStatusCounts() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['status-counts'],
    queryFn: async () => {
      const stats = await statsApi.get(token!);
      return {
        all: stats.total_deliveries,
        delivered: stats.delivered,
        failed: stats.failed,
        pending: stats.pending,
      };
    },
    enabled: !!token,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

// ── Delivery Logs (with status counts) ──
// Optimized: uses separate status-counts queries cached at 60s
export function useDeliveryLogs(params: {
  page?: number;
  status?: string;
  refetchInterval?: number;
}) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['delivery-logs', params],
    queryFn: async () => {
      const data = await webhooksApi.list(token!, {
        page: params.page,
        status: params.status === 'all' ? undefined : params.status,
      });
      return {
        deliveries: data.deliveries,
        total: data.total,
      };
    },
    enabled: !!token,
    staleTime: 15_000,
    refetchInterval: params.refetchInterval ?? false,
    placeholderData: (previousData) => previousData,
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
      queryClient.invalidateQueries({ queryKey: ['status-counts'] });
    },
  });
}
