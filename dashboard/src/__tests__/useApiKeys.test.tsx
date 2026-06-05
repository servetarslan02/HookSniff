// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer' } }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    getApiKeys: vi.fn().mockResolvedValue([{ id: 'k1', name: 'Test Key', prefix: 'hr_', active: true }]),
    createApiKey: vi.fn().mockResolvedValue({ id: 'k2', name: 'New Key', key: 'hr_live_xxx' }),
    deleteApiKey: vi.fn().mockResolvedValue({ deleted: true }),
    rotateApiKey: vi.fn().mockResolvedValue({ id: 'k1', key: 'hr_live_rotated' }),
  },
  ApiKeySchema: { array: () => ({}) },
}));

vi.mock('@/hooks/validated', () => ({
  validated: (fn: () => unknown) => fn,
}));

import { useApiKeys, useCreateApiKey, useDeleteApiKey, useRotateApiKey } from '@/hooks/useApiKeys';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useApiKeys', () => {
  it('fetches API keys', async () => {
    const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('useCreateApiKey returns mutation', () => {
    const { result } = renderHook(() => useCreateApiKey(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteApiKey returns mutation', () => {
    const { result } = renderHook(() => useDeleteApiKey(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useRotateApiKey returns mutation', () => {
    const { result } = renderHook(() => useRotateApiKey(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
