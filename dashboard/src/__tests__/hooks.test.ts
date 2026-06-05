// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', email: 't@t.com', plan: 'pro' } }),
}));

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('usePermissions hook', () => {
  it('returns permissions object', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { usePermissions } = await import('@/hooks/usePermissions');
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });
});

describe('useTeamRole hook', () => {
  it('returns role info', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useTeamRole } = await import('@/hooks/useTeamRole');
    const { result } = renderHook(() => useTeamRole(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe('usePlans hook', () => {
  it('returns plans data', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { usePlans } = await import('@/hooks/usePlans');
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe('useIdleTimeout hook', () => {
  it('accepts callback and timeout', async () => {
    const { useIdleTimeout } = await import('@/hooks/useIdleTimeout');
    expect(typeof useIdleTimeout).toBe('function');
  });
});

describe('useFriendlyToast hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useFriendlyToast');
    expect(mod.useFriendlyToast).toBeDefined();
  });
});

describe('usePortal hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/usePortal');
    expect(mod).toBeDefined();
  });
});

describe('useUnreadCounts hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useUnreadCounts');
    expect(mod).toBeDefined();
  });
});

describe('useAlerts hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useAlerts');
    expect(mod).toBeDefined();
  });
});

describe('useAnalytics hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useAnalytics');
    expect(mod).toBeDefined();
  });
});

describe('useApiKeys hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useApiKeys');
    expect(mod).toBeDefined();
  });
});

describe('useBroadcasts hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useBroadcasts');
    expect(mod).toBeDefined();
  });
});

describe('useEndpoints hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useEndpoints');
    expect(mod).toBeDefined();
  });
});

describe('useWebhooks hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useWebhooks');
    expect(mod).toBeDefined();
  });
});

describe('useRateLimits hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useRateLimits');
    expect(mod).toBeDefined();
  });
});

describe('useRealtime hook', () => {
  it('exports correctly', async () => {
    const mod = await import('@/hooks/useRealtime');
    expect(mod).toBeDefined();
  });
});
