// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', email: 't@t.com', plan: 'pro' } }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn().mockResolvedValue({}),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('usePermissions hook', () => {
  it('returns permissions for pro user', async () => {
    const { usePermissions } = await import('@/hooks/usePermissions');
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });
});

describe('useDebouncedSearch hook', () => {
  it('returns search state with empty default', async () => {
    const { useDebouncedSearch } = await import('@/hooks/useDebouncedSearch');
    const { result } = renderHook(() => useDebouncedSearch(), { wrapper: createWrapper() });
    expect(result.current.input).toBe('');
    expect(result.current.deferredValue).toBe('');
    expect(result.current.isStale).toBe(false);
  });

  it('accepts initial value', async () => {
    const { useDebouncedSearch } = await import('@/hooks/useDebouncedSearch');
    const { result } = renderHook(() => useDebouncedSearch('initial'), { wrapper: createWrapper() });
    expect(result.current.input).toBe('initial');
  });

  it('has handleChange and reset functions', async () => {
    const { useDebouncedSearch } = await import('@/hooks/useDebouncedSearch');
    const { result } = renderHook(() => useDebouncedSearch(), { wrapper: createWrapper() });
    expect(typeof result.current.handleChange).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });
});

describe('useIdleTimeout hook', () => {
  it('accepts callback and timeout without error', async () => {
    const { useIdleTimeout } = await import('@/hooks/useIdleTimeout');
    const callback = vi.fn();
    // useIdleTimeout is a side-effect hook, just verify it doesn't throw
    expect(() => {
      renderHook(() => useIdleTimeout(callback, 60000), { wrapper: createWrapper() });
    }).not.toThrow();
  });
});

describe('useFriendlyToast hook', () => {
  it('returns toast function', async () => {
    const { useFriendlyToast } = await import('@/hooks/useFriendlyToast');
    const { result } = renderHook(() => useFriendlyToast(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe('useRealtime hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useRealtime');
    expect(mod).toBeDefined();
  });
});

describe('useAlerts hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useAlerts');
    expect(mod).toBeDefined();
  });
});

describe('usePortal hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/usePortal');
    expect(mod).toBeDefined();
  });
});

describe('usePlans hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/usePlans');
    expect(mod).toBeDefined();
  });
});
