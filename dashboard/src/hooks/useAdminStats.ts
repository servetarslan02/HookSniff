'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  AdminStatsSchema,
  RevenueSchema,
  RevenueMetricsSchema,
  RevenueCohortsResponseSchema,
  RefundsResponseSchema,
  type AdminStatsValidated,
  type RevenueValidated,
} from '@/schemas/api';

// ── Admin Stats ──
export function useAdminStats() {
  const { token } = useAuth();
  return useQuery<AdminStatsValidated>({
    queryKey: ['admin', 'stats'],
    queryFn: validated(() => adminApi.getStats(token!), AdminStatsSchema),
    enabled: !!token,
    staleTime: 30_000,
  });
}

// ── Admin Revenue ──
export function useAdminRevenue() {
  const { token } = useAuth();
  return useQuery<RevenueValidated>({
    queryKey: ['admin', 'revenue'],
    queryFn: validated(() => adminApi.getRevenue(token!), RevenueSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Admin Revenue Metrics ──
export function useAdminRevenueMetrics() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'revenue-metrics'],
    queryFn: validated(() => adminApi.getRevenueMetrics(token!), RevenueMetricsSchema),
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── Admin Revenue Cohorts ──
export function useAdminRevenueCohorts(months?: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'revenue-cohorts', months ?? 12],
    queryFn: validated(() => adminApi.getRevenueCohorts(token!, months ?? 12), RevenueCohortsResponseSchema),
    enabled: !!token && months !== undefined,
    staleTime: 60_000,
  });
}

// ── Admin All Refunds ──
export function useAdminRefunds(params?: { per_page?: number }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'refunds', params],
    queryFn: validated(() => adminApi.getAllRefunds(token!, params), RefundsResponseSchema),
    enabled: !!token && !!params,
    staleTime: 30_000,
  });
}

// ── Admin Churn Users ──
export function useAdminChurn(enabled = true) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'churn'],
    queryFn: async () => {
      const data = await adminApi.getChurn(token!);
      return data?.users ?? [];
    },
    enabled: !!token && enabled,
    staleTime: 60_000,
  });
}
