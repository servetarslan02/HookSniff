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
    getPortalConfig: vi.fn().mockResolvedValue({ brand_color: '#000', logo_url: '' }),
    getPortalEmbedCode: vi.fn().mockResolvedValue({ embed_code: '<script>...</script>' }),
    updatePortalConfig: vi.fn().mockResolvedValue({ ok: true }),
    getPortalProfile: vi.fn().mockResolvedValue({ name: 'Test', company: 'TestCo' }),
    getPortalUsage: vi.fn().mockResolvedValue({ total_deliveries: 100 }),
    getApplicationDetail: vi.fn().mockResolvedValue({ id: 'app1', name: 'Test App' }),
    getSsoConfig: vi.fn().mockResolvedValue({ provider: 'oidc', enabled: false }),
    getAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
    getSchemas: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue({ results: [] }),
    getTemplates: vi.fn().mockResolvedValue([]),
    getDashboardStats: vi.fn().mockResolvedValue({ total_deliveries: 100 }),
    getAdminAlerts: vi.fn().mockResolvedValue([]),
    getAdminSettings: vi.fn().mockResolvedValue({ maintenance_mode: false }),
    getAdminUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
    getDeployInfo: vi.fn().mockResolvedValue({ version: '1.0' }),
  },
  notificationsApi: { getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 0 }) },
  webhooksApi: { replay: vi.fn().mockResolvedValue({}) },
  PortalConfigSchema: {},
  PortalEmbedCodeSchema: {},
  PortalProfileSchema: {},
  PortalUsageSchema: {},
}));

vi.mock('@/hooks/validated', () => ({
  validated: (fn: () => unknown) => fn,
}));

import { usePortalConfig, usePortalEmbedCode, useUpdatePortalConfig, usePortalProfile, usePortalUsage } from '@/hooks/usePortal';
import { useNotificationUnreadCount } from '@/hooks/useUnreadCounts';
import { useDashboardData } from '@/hooks/useDashboardData';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('usePortal', () => {
  it('fetches portal config', async () => {
    const { result } = renderHook(() => usePortalConfig(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches embed code', async () => {
    const { result } = renderHook(() => usePortalEmbedCode(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('update mutation exists', () => {
    const { result } = renderHook(() => useUpdatePortalConfig(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('fetches portal profile', async () => {
    const { result } = renderHook(() => usePortalProfile(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches portal usage', async () => {
    const { result } = renderHook(() => usePortalUsage(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useUnreadCounts', () => {
  it('fetches unread count', async () => {
    const { result } = renderHook(() => useNotificationUnreadCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.unread_count).toBe(0);
  });
});

describe('usePlans', () => {
  it('usePlans hook exports', async () => {
    const { usePlans } = await import('@/hooks/usePlans');
    expect(usePlans).toBeDefined();
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    expect(result.current.getPlan).toBeDefined();
    expect(result.current.getPlanPrice).toBeDefined();
    expect(result.current.formatPrice).toBeDefined();
  });

  it('formatPrice returns Free for developer', async () => {
    const { usePlans } = await import('@/hooks/usePlans');
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    expect(result.current.formatPrice('developer')).toBe('Free');
  });

  it('formatPrice returns price for startup', async () => {
    const { usePlans } = await import('@/hooks/usePlans');
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    expect(result.current.formatPrice('startup')).toBe('$29');
  });

  it('getPlanPrice returns 0 for developer', async () => {
    const { usePlans } = await import('@/hooks/usePlans');
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    expect(result.current.getPlanPrice('developer')).toBe(0);
  });

  it('getPlanPrice returns yearly price', async () => {
    const { usePlans } = await import('@/hooks/usePlans');
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    expect(result.current.getPlanPrice('startup', true)).toBe(278);
  });
});

describe('useDebouncedSearch', () => {
  it('returns initial value', async () => {
    const { useDebouncedSearch } = await import('@/hooks/useDebouncedSearch');
    const { result } = renderHook(() => useDebouncedSearch('test'));
    expect(result.current.input).toBe('test');
  });

  it('reset clears input', async () => {
    const { useDebouncedSearch } = await import('@/hooks/useDebouncedSearch');
    const { result } = renderHook(() => useDebouncedSearch('hello'));
    result.current.reset();
    expect(result.current.input).toBe('');
  });

  it('handleChange updates input', async () => {
    const { useDebouncedSearch } = await import('@/hooks/useDebouncedSearch');
    const { result } = renderHook(() => useDebouncedSearch());
    result.current.handleChange({ target: { value: 'new' } } as React.ChangeEvent<HTMLInputElement>);
    expect(result.current.input).toBe('new');
  });
});

describe('useFriendlyToast', () => {
  it('exports function', async () => {
    const mod = await import('@/hooks/useFriendlyToast');
    expect(mod.useFriendlyToast).toBeDefined();
  });
});

describe('usePermissions', () => {
  it('exports function', async () => {
    const mod = await import('@/hooks/usePermissions');
    expect(mod.usePermissions).toBeDefined();
  });
});

describe('useIdleTimeout', () => {
  it('exports function', async () => {
    const mod = await import('@/hooks/useIdleTimeout');
    expect(mod.useIdleTimeout).toBeDefined();
  });
});

describe('useTeamRole', () => {
  it('exports roleLevel and hasMinRole', async () => {
    const mod = await import('@/hooks/useTeamRole');
    expect(mod.roleLevel).toBeDefined();
    expect(mod.hasMinRole).toBeDefined();
  });

  it('roleLevel returns correct levels', async () => {
    const { roleLevel } = await import('@/hooks/useTeamRole');
    expect(roleLevel('owner')).toBeGreaterThan(roleLevel('admin'));
    expect(roleLevel('admin')).toBeGreaterThan(roleLevel('developer'));
    expect(roleLevel('developer')).toBeGreaterThan(roleLevel('viewer'));
  });

  it('hasMinRole checks role hierarchy', async () => {
    const { hasMinRole } = await import('@/hooks/useTeamRole');
    expect(hasMinRole('admin', 'viewer')).toBe(true);
    expect(hasMinRole('viewer', 'admin')).toBe(false);
    expect(hasMinRole('owner', 'admin')).toBe(true);
  });
});

describe('useRealtime', () => {
  it('exports function', async () => {
    const mod = await import('@/hooks/useRealtime');
    expect(mod.useRealtime).toBeDefined();
  });
});

describe('useWebSocket', () => {
  it('exports function', async () => {
    const mod = await import('@/hooks/useWebSocket');
    expect(mod.useWebSocket).toBeDefined();
  });
});

describe('validated', () => {
  it('returns function that calls wrapped function', async () => {
    const { validated } = await import('@/hooks/validated');
    const fn = vi.fn().mockResolvedValue({ data: 'test' });
    const validatedFn = validated(fn, {});
    const result = await validatedFn();
    expect(result).toEqual({ data: 'test' });
  });
});
