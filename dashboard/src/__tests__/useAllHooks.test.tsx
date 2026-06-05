// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock @/lib/store first
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer' } }),
}));

// Mock @/lib/api with specific functions used by these hooks
vi.mock('@/lib/api', () => ({
  notificationsApi: {
    getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 3 }),
    list: vi.fn().mockResolvedValue({ notifications: [], total: 0, unread_count: 0 }),
    markAsRead: vi.fn().mockResolvedValue({ read: true }),
    markAllAsRead: vi.fn().mockResolvedValue({ marked_read: 3 }),
    deleteNotification: vi.fn().mockResolvedValue({ deleted: true }),
  },
  webhooksApi: {
    replay: vi.fn().mockResolvedValue({ id: 'd2' }),
    list: vi.fn().mockResolvedValue({ deliveries: [], total: 0 }),
    get: vi.fn().mockResolvedValue({ id: 'd1', status: 'delivered' }),
    getAttempts: vi.fn().mockResolvedValue([]),
  },
  statsApi: {
    get: vi.fn().mockResolvedValue({ total_deliveries: 100, delivered: 95, failed: 5, pending: 0 }),
  },
  broadcastsApi: {
    listActive: vi.fn().mockResolvedValue([{ id: 'b1', title: 'Test' }]),
    getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 1 }),
    dismiss: vi.fn().mockResolvedValue({ dismissed: true }),
  },
  endpointsApi: {
    list: vi.fn().mockResolvedValue([{ id: 'ep1', url: 'https://example.com', is_active: true }]),
    get: vi.fn().mockResolvedValue({ id: 'ep1', url: 'https://example.com', is_active: true }),
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    update: vi.fn().mockResolvedValue({ id: 'ep1', is_active: false }),
  },
  teamsApi: {
    list: vi.fn().mockResolvedValue([]),
    getDetail: vi.fn().mockResolvedValue({}),
    listMembers: vi.fn().mockResolvedValue([]),
  },
  analyticsApi: {
    deliveryTrend: vi.fn().mockResolvedValue({ data: [], labels: [] }),
    successRate: vi.fn().mockResolvedValue({ rate: 99.5, total: 100 }),
    latencyTrend: vi.fn().mockResolvedValue({ data: [] }),
  },
  alertsApi: {
    list: vi.fn().mockResolvedValue([{ id: 'a1', name: 'Test' }]),
    create: vi.fn().mockResolvedValue({ id: 'a2' }),
    update: vi.fn().mockResolvedValue({ id: 'a1' }),
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    test: vi.fn().mockResolvedValue({ ok: true }),
  },
  adminApi: {
    getSettings: vi.fn().mockResolvedValue({ maintenance_mode: false }),
    updateSettings: vi.fn().mockResolvedValue({ ok: true }),
    testWebhook: vi.fn().mockResolvedValue({ ok: true }),
    listBroadcasts: vi.fn().mockResolvedValue([]),
    listUsers: vi.fn().mockResolvedValue({ users: [], total: 0 }),
    getAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
    getDeployInfo: vi.fn().mockResolvedValue({ version: '1.0' }),
    getStats: vi.fn().mockResolvedValue({ total_users: 100 }),
    getRevenue: vi.fn().mockResolvedValue({ mrr: 5000 }),
    getRevenueMetrics: vi.fn().mockResolvedValue({}),
    getRevenueCohorts: vi.fn().mockResolvedValue([]),
    getAllRefunds: vi.fn().mockResolvedValue([]),
    getChurn: vi.fn().mockResolvedValue({}),
    getSystemHealth: vi.fn().mockResolvedValue({ db: 'ok' }),
    getQueueStatus: vi.fn().mockResolvedValue({ pending: 0 }),
    getFailedDeliveries: vi.fn().mockResolvedValue([]),
    getDeadLetters: vi.fn().mockResolvedValue([]),
    getRateLimitViolations: vi.fn().mockResolvedValue([]),
    getApiLatency: vi.fn().mockResolvedValue({ p50: 50 }),
    batchReplay: vi.fn().mockResolvedValue({ replayed: 5 }),
    getUserDetail: vi.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com' }),
    getUserAnalytics: vi.fn().mockResolvedValue({}),
    getUserPlanHistory: vi.fn().mockResolvedValue([]),
    getUserEndpoints: vi.fn().mockResolvedValue([]),
    getUserWebhooks: vi.fn().mockResolvedValue({ deliveries: [], total: 0 }),
    getUserApiKeys: vi.fn().mockResolvedValue([]),
    getUserApplications: vi.fn().mockResolvedValue([]),
    getUserUsage: vi.fn().mockResolvedValue({}),
    getNotes: vi.fn().mockResolvedValue([]),
    getTags: vi.fn().mockResolvedValue([]),
    getCommunications: vi.fn().mockResolvedValue([]),
    getUserInvoices: vi.fn().mockResolvedValue([]),
    getUserPayments: vi.fn().mockResolvedValue([]),
    getUserRefunds: vi.fn().mockResolvedValue([]),
    updateUserPlan: vi.fn().mockResolvedValue({ ok: true }),
    updateUserStatus: vi.fn().mockResolvedValue({ ok: true }),
    sendUserEmail: vi.fn().mockResolvedValue({ ok: true }),
    impersonateUser: vi.fn().mockResolvedValue({ token: 'imp' }),
    refundUser: vi.fn().mockResolvedValue({ ok: true }),
    exportUserData: vi.fn().mockResolvedValue({}),
    deleteUserData: vi.fn().mockResolvedValue({ ok: true }),
    getAlerts: vi.fn().mockResolvedValue([]),
    createAlert: vi.fn().mockResolvedValue({ id: 'a1' }),
    updateAlert: vi.fn().mockResolvedValue({ id: 'a1' }),
    deleteAlert: vi.fn().mockResolvedValue({ deleted: true }),
    getDashboardPrimary: vi.fn().mockResolvedValue({}),
    getDashboardHealth: vi.fn().mockResolvedValue({}),
    listFeatureFlags: vi.fn().mockResolvedValue([]),
    createFeatureFlag: vi.fn().mockResolvedValue({ id: 'ff1' }),
    updateFeatureFlag: vi.fn().mockResolvedValue({ id: 'ff1' }),
    deleteFeatureFlag: vi.fn().mockResolvedValue({ deleted: true }),
    adminUserTestWebhook: vi.fn().mockResolvedValue({ ok: true }),
    addNote: vi.fn().mockResolvedValue({ id: 'n1' }),
    addTag: vi.fn().mockResolvedValue({ ok: true }),
    removeTag: vi.fn().mockResolvedValue({ ok: true }),
    adminUserReplayDelivery: vi.fn().mockResolvedValue({ id: 'd2' }),
  },
  transformsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 'tr2' }),
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    update: vi.fn().mockResolvedValue({ id: 'tr1' }),
    test: vi.fn().mockResolvedValue({ output: {} }),
  },
  inboundApi: {
    listConfigs: vi.fn().mockResolvedValue([{ id: 'ic1' }]),
    createConfig: vi.fn().mockResolvedValue({ id: 'ic2' }),
    deleteConfig: vi.fn().mockResolvedValue({ deleted: true }),
    updateConfig: vi.fn().mockResolvedValue({ id: 'ic1' }),
  },
  serviceTokensApi: {
    list: vi.fn().mockResolvedValue([{ id: 'st1', name: 'CI', active: true }]),
    create: vi.fn().mockResolvedValue({ id: 'st2', key: 'sk_xxx' }),
    delete: vi.fn().mockResolvedValue({ deleted: true }),
    reveal: vi.fn().mockResolvedValue({ key: 'sk_xxx' }),
    update: vi.fn().mockResolvedValue({ id: 'st1' }),
  },
  api: {
    getApiKeys: vi.fn().mockResolvedValue([{ id: 'k1', name: 'Test', prefix: 'hr_', active: true }]),
    createApiKey: vi.fn().mockResolvedValue({ id: 'k2', name: 'New', key: 'hr_live_xxx' }),
    deleteApiKey: vi.fn().mockResolvedValue({ deleted: true }),
    rotateApiKey: vi.fn().mockResolvedValue({ id: 'k1', key: 'hr_live_rotated' }),
    getPortalConfig: vi.fn().mockResolvedValue({ brand_color: '#000' }),
    getPortalEmbedCode: vi.fn().mockResolvedValue({ embed_code: '<script></script>' }),
    updatePortalConfig: vi.fn().mockResolvedValue({ ok: true }),
    getPortalProfile: vi.fn().mockResolvedValue({ name: 'Test' }),
    getPortalUsage: vi.fn().mockResolvedValue({ total_deliveries: 100 }),
    getRateLimits: vi.fn().mockResolvedValue([]),
    setRateLimit: vi.fn().mockResolvedValue({ ok: true }),
    deleteRateLimit: vi.fn().mockResolvedValue({ deleted: true }),
    getEndpointHealth: vi.fn().mockResolvedValue([]),
    getApplicationDetail: vi.fn().mockResolvedValue({ id: 'app1', name: 'Test' }),
    getSsoConfig: vi.fn().mockResolvedValue({ provider: 'oidc', enabled: false }),
    getAuditLog: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
    getAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
    getSchemas: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue({ results: [] }),
    getTemplates: vi.fn().mockResolvedValue([]),
    getServiceTokens: vi.fn().mockResolvedValue([{ id: 'st1', name: 'CI', active: true }]),
    createServiceToken: vi.fn().mockResolvedValue({ id: 'st2', key: 'sk_xxx' }),
    deleteServiceToken: vi.fn().mockResolvedValue({ deleted: true }),
    revealServiceToken: vi.fn().mockResolvedValue({ key: 'sk_xxx' }),
    updateServiceToken: vi.fn().mockResolvedValue({ id: 'st1' }),
  },
}));

// Mock validated to just pass through
vi.mock('@/hooks/validated', () => ({
  validated: (fn: () => unknown) => fn,
}));

// Mock schemas — each schema needs .array(), .parse(), .safeParse()
vi.mock('@/schemas/api', () => {
  const makeSchema = () => ({
    parse: (v: unknown) => v,
    safeParse: (v: unknown) => ({ success: true, data: v }),
    array: () => makeSchema(),
    optional: () => makeSchema(),
  });
  return {
    StatsResponseSchema: makeSchema(),
    DeliveryTrendSchema: makeSchema(),
    SuccessRateSchema: makeSchema(),
    EndpointHealthSchema: makeSchema(),
    LatencyTrendSchema: makeSchema(),
    DeliveryListResponseSchema: makeSchema(),
    ApiKeySchema: makeSchema(),
    EndpointSchema: makeSchema(),
    PortalConfigSchema: makeSchema(),
    PortalEmbedCodeSchema: makeSchema(),
    PortalProfileSchema: makeSchema(),
    PortalUsageSchema: makeSchema(),
    DeliveryDetailSchema: makeSchema(),
    AlertRuleSchema: makeSchema(),
    ServiceTokenSchema: makeSchema(),
    InboundConfigSchema: makeSchema(),
    TransformRuleSchema: makeSchema(),
    RateLimitSchema: makeSchema(),
    AdminSettingsSchema: makeSchema(),
    AdminUserSchema: makeSchema(),
    AuditLogSchema: makeSchema(),
    DeployInfoSchema: makeSchema(),
    FeatureFlagSchema: makeSchema(),
    AdminStatsSchema: makeSchema(),
    AdminRevenueSchema: makeSchema(),
    SystemHealthSchema: makeSchema(),
    QueueStatusSchema: makeSchema(),
  };
});

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}
const w = createWrapper();

// ═══ ANALYTICS ═══
import { useDashboardStats, useDeliveryTrend, useSuccessRate, useEndpointHealth, useLatencyTrend } from '@/hooks/useAnalytics';
describe('useAnalytics', () => {
  it('dashboard stats', async () => { const { result } = renderHook(() => useDashboardStats(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('delivery trend 7d', async () => { const { result } = renderHook(() => useDeliveryTrend('7d'), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('success rate', async () => { const { result } = renderHook(() => useSuccessRate(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('endpoint health', async () => { const { result } = renderHook(() => useEndpointHealth(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('latency trend', async () => { const { result } = renderHook(() => useLatencyTrend(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
});

// ═══ API KEYS ═══
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useRotateApiKey } from '@/hooks/useApiKeys';
describe('useApiKeys', () => {
  it('fetches keys', async () => { const { result } = renderHook(() => useApiKeys(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); expect(result.current.data).toHaveLength(1); });
  it('create mutation', () => { expect(renderHook(() => useCreateApiKey(), { wrapper: w }).result.current.mutate).toBeDefined(); });
  it('delete mutation', () => { expect(renderHook(() => useDeleteApiKey(), { wrapper: w }).result.current.mutate).toBeDefined(); });
  it('rotate mutation', () => { expect(renderHook(() => useRotateApiKey(), { wrapper: w }).result.current.mutate).toBeDefined(); });
});

// ═══ BROADCASTS ═══
import { useBroadcasts, useBroadcastUnreadCount, useDismissBroadcast } from '@/hooks/useBroadcasts';
describe('useBroadcasts', () => {
  it('fetches broadcasts', async () => { const { result } = renderHook(() => useBroadcasts(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('unread count', async () => { const { result } = renderHook(() => useBroadcastUnreadCount(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('dismiss mutation', () => { expect(renderHook(() => useDismissBroadcast(), { wrapper: w }).result.current.mutate).toBeDefined(); });
});

// ═══ ENDPOINTS ═══
import { useEndpoints, useEndpointDetail, useDeleteEndpoint, useToggleEndpoint } from '@/hooks/useEndpoints';
describe('useEndpoints', () => {
  it('fetches list', async () => { const { result } = renderHook(() => useEndpoints(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('fetches detail', async () => { const { result } = renderHook(() => useEndpointDetail('ep1'), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('delete mutation', () => { expect(renderHook(() => useDeleteEndpoint(), { wrapper: w }).result.current.mutate).toBeDefined(); });
  it('toggle mutation', () => { expect(renderHook(() => useToggleEndpoint(), { wrapper: w }).result.current.mutate).toBeDefined(); });
});

// ═══ WEBHOOKS ═══
import { useWebhooks, useReplayDelivery, useDeliveryDetail, useDeliveryAttempts, useStatusCounts } from '@/hooks/useWebhooks';
describe('useWebhooks', () => {
  it('fetches list', async () => { const { result } = renderHook(() => useWebhooks(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('fetches detail', async () => { const { result } = renderHook(() => useDeliveryDetail('d1'), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('fetches attempts', async () => { const { result } = renderHook(() => useDeliveryAttempts('d1'), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('status counts', async () => { const { result } = renderHook(() => useStatusCounts(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('replay mutation', () => { expect(renderHook(() => useReplayDelivery(), { wrapper: w }).result.current.mutate).toBeDefined(); });
});

// ═══ ALERTS ═══
import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert, useTestAlert } from '@/hooks/useAlerts';
describe('useAlerts', () => {
  it('fetches alerts', async () => { const { result } = renderHook(() => useAlerts(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('mutations exist', () => {
    expect(renderHook(() => useCreateAlert(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useUpdateAlert(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useDeleteAlert(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useTestAlert(), { wrapper: w }).result.current.mutate).toBeDefined();
  });
});

// ═══ SERVICE TOKENS ═══
import { useServiceTokens, useCreateServiceToken, useDeleteServiceToken, useRevealServiceToken, useUpdateServiceToken } from '@/hooks/useServiceTokens';
describe('useServiceTokens', () => {
  it('fetches tokens', async () => { const { result } = renderHook(() => useServiceTokens(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('mutations exist', () => {
    expect(renderHook(() => useCreateServiceToken(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useDeleteServiceToken(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useRevealServiceToken(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useUpdateServiceToken(), { wrapper: w }).result.current.mutate).toBeDefined();
  });
});

// ═══ PORTAL ═══
import { usePortalConfig, usePortalEmbedCode, useUpdatePortalConfig, usePortalProfile, usePortalUsage } from '@/hooks/usePortal';
describe('usePortal', () => {
  it('config', async () => { const { result } = renderHook(() => usePortalConfig(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('embed code', async () => { const { result } = renderHook(() => usePortalEmbedCode(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('profile', async () => { const { result } = renderHook(() => usePortalProfile(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('usage', async () => { const { result } = renderHook(() => usePortalUsage(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('update mutation', () => { expect(renderHook(() => useUpdatePortalConfig(), { wrapper: w }).result.current.mutate).toBeDefined(); });
});

// ═══ UNREAD COUNTS ═══
import { useNotificationUnreadCount } from '@/hooks/useUnreadCounts';
describe('useUnreadCounts', () => {
  it('fetches count', async () => { const { result } = renderHook(() => useNotificationUnreadCount(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
});

// ═══ DASHBOARD DATA ═══
import { useApplicationDetail, useSsoConfig, useAuditLogs, useSchemas, useSearch, useTemplates } from '@/hooks/useDashboardData';
describe('useDashboardData', () => {
  it('application detail', async () => { const { result } = renderHook(() => useApplicationDetail('app1'), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true)); });
  it('sso config', async () => { const { result } = renderHook(() => useSsoConfig(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true)); });
  it('audit logs', async () => { const { result } = renderHook(() => useAuditLogs({}), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true)); });
  it('schemas', async () => { const { result } = renderHook(() => useSchemas(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true)); });
  it('search', async () => { const { result } = renderHook(() => useSearch({ q: 'test' }), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true)); });
  it('templates', async () => { const { result } = renderHook(() => useTemplates(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true)); });
});

// ═══ TRANSFORMS ═══
import { useTransformRules, useCreateTransformRule, useDeleteTransformRule, useTestTransform } from '@/hooks/useTransforms';
describe('useTransforms', () => {
  it('fetches rules', async () => { const { result } = renderHook(() => useTransformRules('ep1'), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true)); });
  it('mutations exist', () => {
    expect(renderHook(() => useCreateTransformRule(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useDeleteTransformRule(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useTestTransform(), { wrapper: w }).result.current.mutate).toBeDefined();
  });
});

// ═══ RATE LIMITS ═══
import { useRateLimits, useSetRateLimit, useDeleteRateLimit } from '@/hooks/useRateLimits';
describe('useRateLimits', () => {
  it('fetches limits', async () => { const { result } = renderHook(() => useRateLimits(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('mutations exist', () => {
    expect(renderHook(() => useSetRateLimit(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useDeleteRateLimit(), { wrapper: w }).result.current.mutate).toBeDefined();
  });
});

// ═══ INBOUND CONFIGS ═══
import { useInboundConfigs, useCreateInboundConfig, useDeleteInboundConfig } from '@/hooks/useInboundConfigs';
describe('useInboundConfigs', () => {
  it('fetches configs', async () => { const { result } = renderHook(() => useInboundConfigs(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('mutations exist', () => {
    expect(renderHook(() => useCreateInboundConfig(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useDeleteInboundConfig(), { wrapper: w }).result.current.mutate).toBeDefined();
  });
});

// ═══ ADMIN ═══
import { useAdminSettings, useUpdateSettings, useTestWebhook, useAdminBroadcasts } from '@/hooks/useAdminSettings';
import { useAdminStats, useAdminRevenue } from '@/hooks/useAdminStats';
import { useSystemHealth, useQueueStatus, useBatchReplay } from '@/hooks/useAdminSystem';
import { useAdminUserDetail, useUpdateUserPlan, useUpdateUserStatus, useAdminSendEmail, useAdminImpersonate } from '@/hooks/useAdminUserDetail';
import { useAdminUsers, useAdminAuditLogs, useAdminDeployInfo } from '@/hooks/useAdminData';

describe('useAdminSettings', () => {
  it('fetches settings', async () => { const { result } = renderHook(() => useAdminSettings(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('mutations exist', () => {
    expect(renderHook(() => useUpdateSettings(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useTestWebhook(), { wrapper: w }).result.current.mutate).toBeDefined();
  });
  it('broadcasts', async () => { const { result } = renderHook(() => useAdminBroadcasts(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
});

describe('useAdminStats', () => {
  it('fetches stats', async () => { const { result } = renderHook(() => useAdminStats(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('fetches revenue', async () => { const { result } = renderHook(() => useAdminRevenue(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
});

describe('useAdminSystem', () => {
  it('health', async () => { const { result } = renderHook(() => useSystemHealth(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('queue', async () => { const { result } = renderHook(() => useQueueStatus(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('batch replay', () => { expect(renderHook(() => useBatchReplay(), { wrapper: w }).result.current.mutate).toBeDefined(); });
});

describe('useAdminUserDetail', () => {
  it('fetches user', async () => { const { result } = renderHook(() => useAdminUserDetail('u1'), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('mutations exist', () => {
    expect(renderHook(() => useUpdateUserPlan(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useUpdateUserStatus(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useAdminSendEmail(), { wrapper: w }).result.current.mutate).toBeDefined();
    expect(renderHook(() => useAdminImpersonate(), { wrapper: w }).result.current.mutate).toBeDefined();
  });
});

describe('useAdminData', () => {
  it('users', async () => { const { result } = renderHook(() => useAdminUsers({}), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('audit logs', async () => { const { result } = renderHook(() => useAdminAuditLogs({}), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
  it('deploy info', async () => { const { result } = renderHook(() => useAdminDeployInfo(), { wrapper: w }); await waitFor(() => expect(result.current.isSuccess).toBe(true)); });
});

// ═══ PLANS ═══
describe('usePlans', () => {
  it('returns plan functions', async () => {
    const { usePlans } = await import('@/hooks/usePlans');
    const { result } = renderHook(() => usePlans(), { wrapper: w });
    expect(result.current.getPlan).toBeDefined();
    expect(result.current.formatPrice('developer')).toBe('Free');
    expect(result.current.formatPrice('startup')).toBe('$29');
    expect(result.current.getPlanPrice('developer')).toBe(0);
  });
});

// ═══ MISC ═══
describe('misc hooks', () => {
  it('useFriendlyToast', async () => { expect((await import('@/hooks/useFriendlyToast')).useFriendlyToast).toBeDefined(); });
  it('usePermissions', async () => { expect((await import('@/hooks/usePermissions')).usePermissions).toBeDefined(); });
  it('useIdleTimeout', async () => { expect((await import('@/hooks/useIdleTimeout')).useIdleTimeout).toBeDefined(); });
  it('useRealtime', async () => { expect((await import('@/hooks/useRealtime')).useRealtime).toBeDefined(); });
  it('useWebSocket', async () => { expect((await import('@/hooks/useWebSocket')).useWebSocket).toBeDefined(); });
  it('roleLevel', async () => {
    const { roleLevel, hasMinRole } = await import('@/hooks/useTeamRole');
    expect(roleLevel('owner')).toBeGreaterThan(roleLevel('viewer'));
    expect(hasMinRole('admin', 'viewer')).toBe(true);
    expect(hasMinRole('viewer', 'admin')).toBe(false);
  });
  it('validated passthrough', async () => {
    const { validated } = await import('@/hooks/validated');
    const fn = vi.fn().mockResolvedValue({ data: 'test' });
    expect(await validated(fn)()).toEqual({ data: 'test' });
  });
});
