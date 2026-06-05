// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer' } }),
}));

vi.mock('@/lib/api', () => ({
  endpointsApi: {
    list: vi.fn().mockResolvedValue([{ id: 'ep1', url: 'https://example.com', is_active: true }]),
    get: vi.fn().mockResolvedValue({ id: 'ep1', url: 'https://example.com', is_active: true }),
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    update: vi.fn().mockResolvedValue({ id: 'ep1', is_active: false }),
  },
  EndpointSchema: {},
}));

vi.mock('@/hooks/validated', () => ({
  validated: (fn: () => unknown) => fn,
}));

import { useEndpoints, useEndpointDetail, useDeleteEndpoint, useToggleEndpoint } from '@/hooks/useEndpoints';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useEndpoints', () => {
  it('fetches endpoints list', async () => {
    const { result } = renderHook(() => useEndpoints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('fetches endpoint detail', async () => {
    const { result } = renderHook(() => useEndpointDetail('ep1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('ep1');
  });

  it('useDeleteEndpoint returns mutation', () => {
    const { result } = renderHook(() => useDeleteEndpoint(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useToggleEndpoint returns mutation', () => {
    const { result } = renderHook(() => useToggleEndpoint(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
