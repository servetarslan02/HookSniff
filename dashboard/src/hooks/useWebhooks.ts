'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhooksApi, type DeliveryDetail, type DeliveryAttempt } from '@/lib/api';
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
