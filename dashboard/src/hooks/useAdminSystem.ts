'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, webhooksApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  SystemHealthSchema,
  QueueStatusSchema,
  FailedDeliveriesResponseSchema,
  DeadLettersResponseSchema,
  RateLimitViolationsResponseSchema,
  ApiLatencyResponseSchema,
  type SystemHealthValidated,
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

// ── System Health ──
export function useSystemHealth() {
  const { token } = useAuth();
  return useQuery<SystemHealthValidated>({
    queryKey: ['admin', 'system-health'],
    queryFn: async () => {
      const data = await adminApi.getSystemHealth(token!);
      return SystemHealthSchema.parse(data);
    },
    enabled: !!token,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

// ── Queue Status ──
export function useQueueStatus(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'queue-status'],
    queryFn: validated(() => adminApi.getQueueStatus(token!), QueueStatusSchema),
    enabled: !!token && enabled,
    staleTime: 15_000,
  });
}

// ── Failed Deliveries ──
export function useFailedDeliveries(params?: { limit?: number; since?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'failed-deliveries', params],
    queryFn: validated(() => adminApi.getFailedDeliveries(token!, params), FailedDeliveriesResponseSchema),
    enabled: !!token && !!params,
    staleTime: 15_000,
  });
}

// ── Dead Letters ──
export function useDeadLetters(params?: { limit?: number; since?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'dead-letters', params],
    queryFn: validated(() => adminApi.getDeadLetters(token!, params), DeadLettersResponseSchema),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// ── Rate Limit Violations ──
export function useRateLimitViolations(params?: { limit?: number; since?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'rate-limit-violations', params],
    queryFn: validated(() => adminApi.getRateLimitViolations(token!, params), RateLimitViolationsResponseSchema),
    enabled: !!token && !!params,
    staleTime: 15_000,
  });
}

// ── API Latency ──
export function useApiLatency(params?: { period?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'api-latency', params],
    queryFn: validated(() => adminApi.getApiLatency(token!, params), ApiLatencyResponseSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Batch Replay Mutation ──
export function useBatchReplay() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => webhooksApi.batchReplay(token!, ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'failed-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dead-letters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue-status'] });
    },
  });
}
