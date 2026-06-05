// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer', role: 'admin' } }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    getAdminAlerts: vi.fn().mockResolvedValue([]),
    createAlertRule: vi.fn().mockResolvedValue({ id: 'a1' }),
    updateAlertRule: vi.fn().mockResolvedValue({ id: 'a1' }),
    deleteAlertRule: vi.fn().mockResolvedValue({ deleted: true }),
    getAdminDashboardPrimary: vi.fn().mockResolvedValue({ users: 10, revenue: 1000 }),
    getAdminDashboardHealth: vi.fn().mockResolvedValue({ db: 'healthy', redis: 'healthy' }),
    getAdminDashboardDeferred: vi.fn().mockResolvedValue({}),
    getAdminUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
    getAdminAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
    getDeployInfo: vi.fn().mockResolvedValue({ version: '1.0' }),
    getFeatureFlags: vi.fn().mockResolvedValue([]),
    createFeatureFlag: vi.fn().mockResolvedValue({ id: 'ff1' }),
    updateFeatureFlag: vi.fn().mockResolvedValue({ id: 'ff1' }),
    deleteFeatureFlag: vi.fn().mockResolvedValue({ deleted: true }),
    getAdminSettings: vi.fn().mockResolvedValue({ maintenance_mode: false }),
    updateAdminSettings: vi.fn().mockResolvedValue({ ok: true }),
    testWebhook: vi.fn().mockResolvedValue({ ok: true }),
    getAdminBroadcasts: vi.fn().mockResolvedValue([]),
    getAdminStats: vi.fn().mockResolvedValue({ total_users: 100 }),
    getAdminRevenue: vi.fn().mockResolvedValue({ mrr: 5000 }),
    getRevenueMetrics: vi.fn().mockResolvedValue({}),
    getRevenueCohorts: vi.fn().mockResolvedValue([]),
    getRefunds: vi.fn().mockResolvedValue([]),
    getChurn: vi.fn().mockResolvedValue({}),
    getSystemHealth: vi.fn().mockResolvedValue({ db: 'ok' }),
    getQueueStatus: vi.fn().mockResolvedValue({ pending: 0 }),
    getFailedDeliveries: vi.fn().mockResolvedValue([]),
    getDeadLetters: vi.fn().mockResolvedValue([]),
    getRateLimitViolations: vi.fn().mockResolvedValue([]),
    getApiLatency: vi.fn().mockResolvedValue({ p50: 50 }),
    batchReplay: vi.fn().mockResolvedValue({ replayed: 5 }),
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
    adminImpersonate: vi.fn().mockResolvedValue({ token: 'impersonated' }),
    adminRefundUser: vi.fn().mockResolvedValue({ ok: true }),
    adminGdprExport: vi.fn().mockResolvedValue({}),
    adminGdprDelete: vi.fn().mockResolvedValue({ ok: true }),
    adminTestWebhook: vi.fn().mockResolvedValue({ ok: true }),
    adminAddNote: vi.fn().mockResolvedValue({ id: 'n1' }),
    adminAddTag: vi.fn().mockResolvedValue({ ok: true }),
    adminRemoveTag: vi.fn().mockResolvedValue({ ok: true }),
    adminReplayDelivery: vi.fn().mockResolvedValue({ id: 'd2' }),
  },
}));

import { useAdminAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert } from '@/hooks/useAdminAlerts';
import { useAdminDashboardPrimary, useAdminDashboardHealth } from '@/hooks/useAdminBatch';
import { useAdminUsers, useAdminAuditLogs, useAdminDeployInfo } from '@/hooks/useAdminData';
import { useAdminStats, useAdminRevenue } from '@/hooks/useAdminStats';
import { useSystemHealth, useQueueStatus, useBatchReplay } from '@/hooks/useAdminSystem';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useAdminAlerts', () => {
  it('fetches admin alerts', async () => {
    const { result } = renderHook(() => useAdminAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('create mutation exists', () => {
    const { result } = renderHook(() => useCreateAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('update mutation exists', () => {
    const { result } = renderHook(() => useUpdateAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('delete mutation exists', () => {
    const { result } = renderHook(() => useDeleteAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

describe('useAdminBatch', () => {
  it('fetches primary dashboard data', async () => {
    const { result } = renderHook(() => useAdminDashboardPrimary(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches health data', async () => {
    const { result } = renderHook(() => useAdminDashboardHealth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAdminData', () => {
  it('fetches users', async () => {
    const { result } = renderHook(() => useAdminUsers({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches audit logs', async () => {
    const { result } = renderHook(() => useAdminAuditLogs({}), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches deploy info', async () => {
    const { result } = renderHook(() => useAdminDeployInfo(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAdminStats', () => {
  it('fetches admin stats', async () => {
    const { result } = renderHook(() => useAdminStats(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches revenue', async () => {
    const { result } = renderHook(() => useAdminRevenue(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAdminSystem', () => {
  it('fetches system health', async () => {
    const { result } = renderHook(() => useSystemHealth(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches queue status', async () => {
    const { result } = renderHook(() => useQueueStatus(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('batch replay mutation exists', () => {
    const { result } = renderHook(() => useBatchReplay(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
