// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'enterprise', role: 'admin' } }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    getAdminFeatureFlags: vi.fn().mockResolvedValue([]),
    createFeatureFlag: vi.fn().mockResolvedValue({ id: 'ff1' }),
    updateFeatureFlag: vi.fn().mockResolvedValue({ id: 'ff1' }),
    deleteFeatureFlag: vi.fn().mockResolvedValue({ deleted: true }),
    getFeatureFlags: vi.fn().mockResolvedValue([]),
    getAdminSettings: vi.fn().mockResolvedValue({ maintenance_mode: false }),
    updateAdminSettings: vi.fn().mockResolvedValue({ ok: true }),
    testWebhook: vi.fn().mockResolvedValue({ ok: true }),
    getAdminBroadcasts: vi.fn().mockResolvedValue([]),
    getAdminUserDetail: vi.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com' }),
    getAdminUserAnalytics: vi.fn().mockResolvedValue({}),
    getAdminUserPlanHistory: vi.fn().mockResolvedValue([]),
    getAdminUserEndpoints: vi.fn().mockResolvedValue([]),
    getAdminUserWebhooks: vi.fn().mockResolvedValue({ deliveries: [], total: 0 }),
    getAdminUserApiKeys: vi.fn().mockResolvedValue([]),
    getAdminUserApplications: vi.fn().mockResolvedValue([]),
    getAdminUserUsage: vi.fn().mockResolvedValue({}),
    getAdminUserNotes: vi.fn().mockResolvedValue([]),
    getAdminUserTags: vi.fn().mockResolvedValue([]),
    getAdminUserCommunications: vi.fn().mockResolvedValue([]),
    getAdminUserInvoices: vi.fn().mockResolvedValue([]),
    getAdminUserPayments: vi.fn().mockResolvedValue([]),
    getAdminUserRefunds: vi.fn().mockResolvedValue([]),
    getDeliveryDetail: vi.fn().mockResolvedValue({ id: 'd1' }),
    getDeliveryAttempts: vi.fn().mockResolvedValue([]),
    updateAdminUserPlan: vi.fn().mockResolvedValue({ ok: true }),
    updateAdminUserStatus: vi.fn().mockResolvedValue({ ok: true }),
    adminSendEmail: vi.fn().mockResolvedValue({ ok: true }),
    adminImpersonate: vi.fn().mockResolvedValue({ token: 'imp' }),
    adminRefundUser: vi.fn().mockResolvedValue({ ok: true }),
    adminGdprExport: vi.fn().mockResolvedValue({}),
    adminGdprDelete: vi.fn().mockResolvedValue({ ok: true }),
    adminTestWebhook: vi.fn().mockResolvedValue({ ok: true }),
    adminAddNote: vi.fn().mockResolvedValue({ id: 'n1' }),
    adminAddTag: vi.fn().mockResolvedValue({ ok: true }),
    adminRemoveTag: vi.fn().mockResolvedValue({ ok: true }),
    adminReplayDelivery: vi.fn().mockResolvedValue({ id: 'd2' }),
  },
  notificationsApi: { getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 0 }) },
  webhooksApi: {
    list: vi.fn().mockResolvedValue({ deliveries: [], total: 0 }),
    get: vi.fn().mockResolvedValue({ id: 'd1' }),
    getAttempts: vi.fn().mockResolvedValue([]),
    replay: vi.fn().mockResolvedValue({ id: 'd2' }),
  },
  endpointsApi: { list: vi.fn().mockResolvedValue([]), get: vi.fn().mockResolvedValue({ id: 'ep1' }) },
  teamsApi: { list: vi.fn().mockResolvedValue([]), listMembers: vi.fn().mockResolvedValue([]) },
  apiKeys: { list: vi.fn().mockResolvedValue([]) },
  broadcastsApi: { listActive: vi.fn().mockResolvedValue([]), getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 0 }) },
  alertsApi: { list: vi.fn().mockResolvedValue([]) },
  inboundApi: { listConfigs: vi.fn().mockResolvedValue([]) },
  serviceTokensApi: { list: vi.fn().mockResolvedValue([]) },
  transformsApi: { list: vi.fn().mockResolvedValue([]) },
  api2: { getApplications: vi.fn().mockResolvedValue([]) },
}));

import { useAdminSettings, useUpdateSettings, useTestWebhook, useAdminBroadcasts } from '@/hooks/useAdminSettings';
import { useAdminUserDetail, useUpdateUserPlan, useUpdateUserStatus, useAdminSendEmail, useAdminImpersonate } from '@/hooks/useAdminUserDetail';
import { useCollections } from '@/hooks/useCollections';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useAdminSettings', () => {
  it('fetches admin settings', async () => {
    const { result } = renderHook(() => useAdminSettings(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('update mutation exists', () => {
    const { result } = renderHook(() => useUpdateSettings(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('test webhook mutation exists', () => {
    const { result } = renderHook(() => useTestWebhook(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('fetches broadcasts', async () => {
    const { result } = renderHook(() => useAdminBroadcasts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAdminUserDetail', () => {
  it('fetches user detail', async () => {
    const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('update plan mutation exists', () => {
    const { result } = renderHook(() => useUpdateUserPlan(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('update status mutation exists', () => {
    const { result } = renderHook(() => useUpdateUserStatus(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('send email mutation exists', () => {
    const { result } = renderHook(() => useAdminSendEmail(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('impersonate mutation exists', () => {
    const { result } = renderHook(() => useAdminImpersonate(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

describe('useCollections', () => {
  it('exports function', async () => {
    const mod = await import('@/hooks/useCollections');
    expect(mod.useCollections).toBeDefined();
  });
});
