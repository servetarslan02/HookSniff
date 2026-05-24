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
} from '@/schemas/api';

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
  });
}

// ── Latency Trend ──
export function useLatencyTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['latency-trend', range],
    queryFn: validated(
      () => analyticsApi.latencyTrend(token!, range),
      LatencyTrendSchema
    ),
    enabled: !!token,
    staleTime: 30_000,
  });
}
