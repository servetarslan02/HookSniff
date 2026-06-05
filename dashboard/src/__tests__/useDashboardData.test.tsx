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
    getApplicationDetail: vi.fn().mockResolvedValue({ id: 'app1', name: 'Test App' }),
    getSsoConfig: vi.fn().mockResolvedValue({ provider: 'oidc', enabled: false }),
    getAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
    getSchemas: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue({ results: [] }),
    getTemplates: vi.fn().mockResolvedValue([]),
    getApplication: vi.fn().mockResolvedValue({ id: 'app1', name: 'Test App' }),
    getTeamDetail: vi.fn().mockResolvedValue({ id: 't1', name: 'Test Team' }),
    getTeamMembers: vi.fn().mockResolvedValue([]),
    getTeamRoles: vi.fn().mockResolvedValue([]),
  },
}));

import { useApplicationDetail, useSsoConfig, useAuditLogs, useSchemas, useSearch, useTemplates } from '@/hooks/useDashboardData';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useDashboardData', () => {
  it('fetches application detail', async () => {
    const { result } = renderHook(() => useApplicationDetail('app1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches SSO config', async () => {
    const { result } = renderHook(() => useSsoConfig(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches audit logs', async () => {
    const { result } = renderHook(() => useAuditLogs({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches schemas', async () => {
    const { result } = renderHook(() => useSchemas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches search results', async () => {
    const { result } = renderHook(() => useSearch('test'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches templates', async () => {
    const { result } = renderHook(() => useTemplates(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
