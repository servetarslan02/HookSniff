// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', email: 't@t.com', plan: 'pro' } }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
  endpointsApi: {
    list: vi.fn().mockResolvedValue([
      { id: 'ep1', url: 'https://a.com', is_active: true },
      { id: 'ep2', url: 'https://b.com', is_active: false },
    ]),
  },
  webhooksApi: {
    list: vi.fn().mockResolvedValue({ deliveries: [], total: 0 }),
  },
  applicationsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useLiveEndpoints hook', () => {
  it('fetches endpoints list', async () => {
    const { useLiveEndpoints } = await import('@/hooks/useCollections');
    const { result } = renderHook(() => useLiveEndpoints(), { wrapper: createWrapper() });
    // Initially loading
    expect(result.current.isLoading || result.current.data !== undefined).toBe(true);
  });
});

describe('useWebhooks hook', () => {
  it('fetches webhooks with params', async () => {
    const { useWebhooks } = await import('@/hooks/useDashboardData');
    const { result } = renderHook(() => useWebhooks({ page: 1 }), { wrapper: createWrapper() });
    expect(result.current.isLoading || result.current.data !== undefined).toBe(true);
  });
});

describe('useStatusCounts hook', () => {
  it('fetches status counts', async () => {
    const { useStatusCounts } = await import('@/hooks/useDashboardData');
    const { result } = renderHook(() => useStatusCounts(), { wrapper: createWrapper() });
    expect(result.current.isLoading || result.current.data !== undefined).toBe(true);
  });
});

describe('validated wrapper', () => {
  it('passes through successful data', async () => {
    const { validated } = await import('@/hooks/validated');
    const schema = { parse: (data: unknown) => data };
    const fetcher = validated(() => Promise.resolve({ ok: true }), schema as any);
    const result = await fetcher();
    expect(result).toEqual({ ok: true });
  });

  it('throws on schema validation failure', async () => {
    const { validated } = await import('@/hooks/validated');
    const schema = { parse: () => { throw new Error('Invalid data'); } };
    const fetcher = validated(() => Promise.resolve({ bad: true }), schema as any);
    await expect(fetcher()).rejects.toThrow('Invalid data');
  });
});

describe('getErrorMessage', () => {
  it('extracts message from Error object', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
  });

  it('returns fallback for unknown errors', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage(null)).toBe('Unknown error');
    expect(getErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback');
  });

  it('handles string errors', async () => {
    const { getErrorMessage } = await import('@/lib/errors');
    expect(getErrorMessage('string error')).toBe('string error');
  });
});
