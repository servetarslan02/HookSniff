// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer' } }),
}));

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    list: vi.fn().mockResolvedValue({ deliveries: [], total: 0, page: 1 }),
    get: vi.fn().mockResolvedValue({ id: 'd1', status: 'delivered' }),
    getAttempts: vi.fn().mockResolvedValue([{ id: 'a1', status_code: 200 }]),
    replay: vi.fn().mockResolvedValue({ id: 'd2' }),
  },
  statsApi: {
    get: vi.fn().mockResolvedValue({ total_deliveries: 100, delivered: 95, failed: 5, pending: 0 }),
  },
  DeliveryListResponseSchema: {},
}));

vi.mock('@/hooks/validated', () => ({
  validated: (fn: () => unknown) => fn,
}));

import { useWebhooks, useReplayDelivery, useDeliveryDetail, useDeliveryAttempts, useStatusCounts } from '@/hooks/useWebhooks';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useWebhooks', () => {
  it('fetches webhook deliveries', async () => {
    const { result } = renderHook(() => useWebhooks(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches with page param', async () => {
    const { result } = renderHook(() => useWebhooks({ page: 2 }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches delivery detail', async () => {
    const { result } = renderHook(() => useDeliveryDetail('d1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches delivery attempts', async () => {
    const { result } = renderHook(() => useDeliveryAttempts('d1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches status counts', async () => {
    const { result } = renderHook(() => useStatusCounts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.delivered).toBe(95);
  });

  it('useReplayDelivery returns mutation', () => {
    const { result } = renderHook(() => useReplayDelivery(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
