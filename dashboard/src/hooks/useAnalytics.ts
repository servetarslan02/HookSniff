'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi, statsApi, api } from '@/lib/api';
import type { EndpointHealthResponse } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  StatsResponseSchema,
  DeliveryTrendSchema,
  SuccessRateSchema,
  EndpointHealthSchema,
  LatencyTrendSchema,
  type StatsResponseValidated,
  type DeliveryTrendValidated,
  type SuccessRateValidated,
  type LatencyTrendValidated,
} from '@/schemas/api';

// ── Dashboard Stats ──
export function useDashboardStats() {
  const { token } = useAuth();
  return useQuery<StatsResponseValidated>({
    queryKey: ['stats'],
    queryFn: validated(() => statsApi.get(token!), StatsResponseSchema),
    enabled: !!token,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// ── Analytics: Delivery Trend ──
export function useDeliveryTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery<DeliveryTrendValidated>({
    queryKey: ['analytics', 'delivery-trend', range],
    queryFn: validated(
      () => analyticsApi.deliveryTrend(token!, range),
      DeliveryTrendSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// ── Analytics: Success Rate ──
export function useSuccessRate(range = '24h') {
  const { token } = useAuth();
  return useQuery<SuccessRateValidated>({
    queryKey: ['analytics', 'success-rate', range],
    queryFn: validated(
      () => analyticsApi.successRate(token!, range),
      SuccessRateSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// ── Endpoint Health ──
export function useEndpointHealth(range = '24h') {
  const { token } = useAuth();
  return useQuery<EndpointHealthResponse[]>({
    queryKey: ['endpoint-health', range],
    queryFn: validated(
      () => api.getEndpointHealth(token || undefined, range),
      EndpointHealthSchema.array()
    ),
    enabled: true,
    staleTime: 15_000,
    refetchInterval: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

// ── Latency Trend ──
export function useLatencyTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery<LatencyTrendValidated>({
    queryKey: ['latency-trend', range],
    queryFn: validated(
      () => analyticsApi.latencyTrend(token!, range),
      LatencyTrendSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
