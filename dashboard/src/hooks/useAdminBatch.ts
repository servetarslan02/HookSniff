'use client';

/**
 * Batched admin dashboard hook — reduces 8 separate API calls to 3 parallel groups.
 *
 * Group 1 (immediate): stats + revenue (above the fold)
 * Group 2 (deferred 300ms): queue + failed deliveries (health tab essentials)
 * Group 3 (deferred 500ms): audit logs + feature flags + deploy info + rate limits
 *
 * Each group shares a single useQueries call for parallel fetching.
 */

import { useQueries } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { validated } from './validated';
import {
  AdminStatsSchema,
  RevenueSchema,
  AuditLogResponseSchema,
  DeployInfoSchema,
} from '@/schemas/api';
import type {
  AdminStatsValidated,
  RevenueValidated,
  AuditLogResponseValidated,
  DeployInfoValidated,
} from '@/schemas/api';

// ── Group 1: Above-the-fold stats (immediate) ──
export function useAdminDashboardPrimary() {
  const { token } = useAuth();

  const results = useQueries({
    queries: [
      {
        queryKey: ['admin', 'stats'],
        queryFn: validated(() => adminApi.getStats(token!), AdminStatsSchema),
        enabled: !!token,
        staleTime: 120_000,
        placeholderData: (prev: AdminStatsValidated | undefined) => prev,
      },
      {
        queryKey: ['admin', 'revenue'],
        queryFn: validated(() => adminApi.getRevenue(token!), RevenueSchema),
        enabled: !!token,
        staleTime: 180_000,
        placeholderData: (prev: RevenueValidated | undefined) => prev,
      },
    ],
    combine: (results) => ({
      stats: results[0].data as AdminStatsValidated | undefined,
      revenue: results[1].data as RevenueValidated | undefined,
      isLoading: results.some((r) => r.isLoading),
      refetchStats: results[0].refetch,
      refetchRevenue: results[1].refetch,
    }),
  });

  return results;
}

// ── Group 2: Health essentials (deferred 300ms) ──
export function useAdminDashboardHealth(enabled = true) {
  const { token } = useAuth();

  const results = useQueries({
    queries: [
      {
        queryKey: ['admin', 'queue-status'],
        queryFn: async () => {
          const data = await adminApi.getQueueStatus(token!);
          return data;
        },
        enabled: !!token && enabled,
        staleTime: 180_000,
      },
      {
        queryKey: ['admin', 'failed-deliveries', { limit: 1 }],
        queryFn: async () => {
          const data = await adminApi.getFailedDeliveries(token!, { limit: 1 });
          return data;
        },
        enabled: !!token && enabled,
        staleTime: 180_000,
      },
    ],
    combine: (results) => ({
      queueStatus: results[0].data,
      failedDeliveries: results[1].data,
      isLoading: results.some((r) => r.isLoading),
      refetchQueue: results[0].refetch,
      refetchFailed: results[1].refetch,
    }),
  });

  return results;
}

// ── Group 3: Deferred detail data (deferred 500ms) ──
export function useAdminDashboardDeferred(enabled = true) {
  const { token } = useAuth();

  const results = useQueries({
    queries: [
      {
        queryKey: ['admin', 'audit-logs', { limit: 5 }],
        queryFn: validated(
          () => adminApi.getAuditLogs(token!, { limit: 5 }),
          AuditLogResponseSchema
        ),
        enabled: !!token && enabled,
        staleTime: 180_000,
      },
      {
        queryKey: ['admin', 'feature-flags'],
        queryFn: async () => {
          const data = await adminApi.listFeatureFlags(token!);
          return data;
        },
        enabled: !!token && enabled,
        staleTime: 180_000,
      },
      {
        queryKey: ['admin', 'deploy-info'],
        queryFn: validated(
          () => adminApi.getDeployInfo(token!),
          DeployInfoSchema
        ),
        enabled: !!token && enabled,
        staleTime: 5 * 60_000,
      },
      {
        queryKey: ['admin', 'rate-limit-violations', { limit: 1 }],
        queryFn: async () => {
          const data = await adminApi.getRateLimitViolations(token!, { limit: 1 });
          return data;
        },
        enabled: !!token && enabled,
        staleTime: 180_000,
      },
    ],
    combine: (results) => ({
      auditLogs: results[0].data as AuditLogResponseValidated | undefined,
      featureFlags: results[1].data as { flags: any[] } | undefined,
      deployInfo: results[2].data as DeployInfoValidated | undefined,
      rateLimitData: results[3].data,
      isLoading: results.some((r) => r.isLoading),
      refetchAuditLogs: results[0].refetch,
      refetchFeatureFlags: results[1].refetch,
      refetchDeployInfo: results[2].refetch,
      refetchRateLimit: results[3].refetch,
    }),
  });

  return results;
}
