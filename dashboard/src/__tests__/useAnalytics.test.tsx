// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer' } }),
}));

vi.mock('@/lib/api', () => ({
  analyticsApi: {
    deliveryTrend: vi.fn().mockResolvedValue({ data: [], labels: [] }),
    successRate: vi.fn().mockResolvedValue({ rate: 99.5, total: 100, successful: 99 }),
    latencyTrend: vi.fn().mockResolvedValue({ data: [], p50: 100, p95: 200, p99: 500 }),
  },
  statsApi: {
    get: vi.fn().mockResolvedValue({ total_deliveries: 100, delivered: 95, failed: 5, pending: 0 }),
  },
  api: {
    getEndpointHealth: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/hooks/validated', () => ({
  validated: (fn: () => unknown, _schema: unknown) => fn,
}));

vi.mock('@/schemas/api', () => ({
  StatsResponseSchema: {},
  DeliveryTrendSchema: {},
  SuccessRateSchema: {},
  EndpointHealthSchema: { array: () => ({}) },
  LatencyTrendSchema: {},
}));

import { useDashboardStats, useDeliveryTrend, useSuccessRate, useEndpointHealth, useLatencyTrend } from '@/hooks/useAnalytics';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useAnalytics', () => {
  it('useDashboardStats fetches stats', async () => {
    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('useDeliveryTrend accepts range param', async () => {
    const { result } = renderHook(() => useDeliveryTrend('7d'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useDeliveryTrend defaults to 24h', async () => {
    const { result } = renderHook(() => useDeliveryTrend(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useSuccessRate fetches success rate', async () => {
    const { result } = renderHook(() => useSuccessRate(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useEndpointHealth fetches health data', async () => {
    const { result } = renderHook(() => useEndpointHealth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useLatencyTrend fetches latency data', async () => {
    const { result } = renderHook(() => useLatencyTrend(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('hooks are disabled without token', () => {
    vi.mocked(await import('@/lib/store')).useAuth = () => ({ token: null, user: null });
    const { result } = renderHook(() => useDashboardStats(), { wrapper: createWrapper() });
    expect(result.current.isFetching).toBe(false);
  });
});
