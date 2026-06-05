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
    getAlertRules: vi.fn().mockResolvedValue([{ id: 'a1', name: 'Test Alert', condition: 'failure_rate', threshold: 95 }]),
    createAlertRule: vi.fn().mockResolvedValue({ id: 'a2', name: 'New Alert' }),
    updateAlertRule: vi.fn().mockResolvedValue({ id: 'a1', name: 'Updated' }),
    deleteAlertRule: vi.fn().mockResolvedValue({ deleted: true }),
    testAlert: vi.fn().mockResolvedValue({ ok: true }),
  },
}));

import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert, useTestAlert } from '@/hooks/useAlerts';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useAlerts', () => {
  it('fetches alert rules', async () => {
    const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('create alert mutation exists', () => {
    const { result } = renderHook(() => useCreateAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('update alert mutation exists', () => {
    const { result } = renderHook(() => useUpdateAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('delete alert mutation exists', () => {
    const { result } = renderHook(() => useDeleteAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('test alert mutation exists', () => {
    const { result } = renderHook(() => useTestAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
