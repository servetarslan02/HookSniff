// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'a@b.com' } }),
}));

vi.mock('@/hooks/validated', () => ({
  validated: (fetcher: () => Promise<any>, _schema: any) => fetcher,
}));

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    list: vi.fn().mockResolvedValue({ deliveries: [{ id: 'd1', status: 'delivered' }], total: 1, page: 1, per_page: 20 }),
    replay: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({ id: 'd1', status: 'delivered' }),
    getAttempts: vi.fn().mockResolvedValue([{ id: 'a1' }]),
  },
  statsApi: {
    get: vi.fn().mockResolvedValue({ total_deliveries: 100, delivered: 90, failed: 5, pending: 5 }),
  },
  endpointsApi: {
    list: vi.fn().mockResolvedValue([{ id: 'ep1', url: 'https://test.com' }]),
    get: vi.fn().mockResolvedValue({ id: 'ep1', url: 'https://test.com', is_active: true, created_at: '2026-01-01T00:00:00Z' }),
    create: vi.fn().mockResolvedValue({ id: 'ep2' }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
  api: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    getAuditLog: vi.fn().mockResolvedValue({ entries: [], has_more: false }),
    getApiKeys: vi.fn().mockResolvedValue([]),
    getRateLimits: vi.fn().mockResolvedValue([]),
    getServiceTokens: vi.fn().mockResolvedValue([]),
    getPortalConfig: vi.fn().mockResolvedValue({}),
    getSchemas: vi.fn().mockResolvedValue({ schemas: [] }),
    getTemplates: vi.fn().mockResolvedValue({ templates: [] }),
  },
  apiFetch: vi.fn().mockResolvedValue({}),
  // Re-exported from api-teams via api.ts
  teamsApi: {
    list: vi.fn().mockResolvedValue([{ id: 't1', name: 'Team 1' }]),
    getDetail: vi.fn().mockResolvedValue({ id: 't1', members: [] }),
    listMembers: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 't2' }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    inviteMember: vi.fn().mockResolvedValue({ success: true }),
    removeMember: vi.fn().mockResolvedValue({ success: true }),
    updateRole: vi.fn().mockResolvedValue({ success: true }),
    acceptInvite: vi.fn().mockResolvedValue({ team_id: 't1' }),
    leave: vi.fn().mockResolvedValue({ left: true }),
    transferOwnership: vi.fn().mockResolvedValue({ transferred: true }),
    revokeInvite: vi.fn().mockResolvedValue({ revoked: true }),
    resendInvite: vi.fn().mockResolvedValue({ id: 'inv1' }),
  },
  notificationsApi: {
    list: vi.fn().mockResolvedValue({ notifications: [], total: 0 }),
    getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 0 }),
    markAsRead: vi.fn().mockResolvedValue({ success: true }),
    markAllAsRead: vi.fn().mockResolvedValue({ success: true }),
    deleteNotification: vi.fn().mockResolvedValue({ success: true }),
  },
  broadcastsApi: {
    listActive: vi.fn().mockResolvedValue([]),
    dismiss: vi.fn().mockResolvedValue({ dismissed: true }),
    getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 0 }),
  },
  alertsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 'a1' }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    test: vi.fn().mockResolvedValue({ success: true }),
  },
  inboundApi: {
    listConfigs: vi.fn().mockResolvedValue([]),
    createConfig: vi.fn().mockResolvedValue({ id: 'ic1' }),
    updateConfig: vi.fn().mockResolvedValue({}),
    deleteConfig: vi.fn().mockResolvedValue({}),
  },
  // Re-exported from api-misc via api.ts
  twoFactorApi: {
    enable: vi.fn().mockResolvedValue({ secret: 'abc', qr_code: 'data:...' }),
    verify: vi.fn().mockResolvedValue({ token: 'jwt', customer: { id: '1', email: 'a@b.com', plan: 'pro' } }),
    disable: vi.fn().mockResolvedValue({ success: true }),
    getStatus: vi.fn().mockResolvedValue({ enabled: false }),
  },
  analyticsApi: {
    deliveryTrend: vi.fn().mockResolvedValue({ buckets: [] }),
    successRate: vi.fn().mockResolvedValue({ success_rate: 99 }),
    latencyTrend: vi.fn().mockResolvedValue({ p50: 100 }),
  },
  transformsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 't1' }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    test: vi.fn().mockResolvedValue({}),
  },
  billingApiExtended: {
    getUsage: vi.fn().mockResolvedValue({}),
    getSubscription: vi.fn().mockResolvedValue({ plan: 'pro', status: 'active', payment_provider: 'polar', webhook_limit: 10000, endpoint_limit: 50, retention_days: 30, monthly_price_cents: 2900, cancel_at_period_end: false, billing_period: 'monthly' }),
    upgrade: vi.fn().mockResolvedValue({}),
    getInvoices: vi.fn().mockResolvedValue([]),
    openPortal: vi.fn().mockResolvedValue({ url: 'https://...' }),
    requestRefund: vi.fn().mockResolvedValue({}),
    pause: vi.fn().mockResolvedValue({}),
    resume: vi.fn().mockResolvedValue({}),
    getOverageSettings: vi.fn().mockResolvedValue({}),
    updateOverageSettings: vi.fn().mockResolvedValue({}),
  },
  ssoApi: {
    testSso: vi.fn().mockResolvedValue({ valid: true }),
    deleteSso: vi.fn().mockResolvedValue({ deleted: true }),
    getLoginUrl: vi.fn().mockReturnValue('/v1/sso/login'),
  },
  // Re-exported from api-integrations via api.ts
  connectorsApi: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({}),
    listConfigs: vi.fn().mockResolvedValue([]),
  },
  integrationsApi: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({}),
  },
  streamApi: {
    listChannels: vi.fn().mockResolvedValue([]),
    getChannel: vi.fn().mockResolvedValue({}),
  },
  // Re-exported from api-admin via api.ts
  adminApi: {
    getSystemHealth: vi.fn().mockResolvedValue({ api: { status: 'healthy' } }),
    getStats: vi.fn().mockResolvedValue({ total_users: 100 }),
    listUsers: vi.fn().mockResolvedValue({ users: [], total: 0, page: 1, per_page: 20 }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useWebhooks', () => {
  it('fetches webhooks list', async () => {
    const { useWebhooks } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useWebhooks(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('fetches with page and status params', async () => {
    const { useWebhooks } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useWebhooks({ page: 2, status: 'failed' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('calls webhooksApi.list with token', async () => {
    const { webhooksApi } = await import('@/lib/api');
    vi.mocked(webhooksApi.list).mockClear();
    const { useWebhooks } = await import('@/hooks/useWebhooks');
    renderHook(() => useWebhooks(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(webhooksApi.list).toHaveBeenCalledWith('test-token', undefined);
    });
  });
});

describe('useDeliveryDetail', () => {
  it('fetches delivery by id', async () => {
    const { useDeliveryDetail } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useDeliveryDetail('d1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('d1');
  });
});

describe('useDeliveryAttempts', () => {
  it('fetches attempts for delivery', async () => {
    const { useDeliveryAttempts } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useDeliveryAttempts('d1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useStatusCounts', () => {
  it('fetches status counts from stats', async () => {
    const { useStatusCounts } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useStatusCounts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.all).toBe(100);
  });
});

describe('useReplayDelivery', () => {
  it('returns mutation object', async () => {
    const { useReplayDelivery } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useReplayDelivery(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('calls webhooksApi.replay on mutate', async () => {
    const { webhooksApi } = await import('@/lib/api');
    vi.mocked(webhooksApi.replay).mockClear();
    const { useReplayDelivery } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useReplayDelivery(), { wrapper: createWrapper() });
    result.current.mutate('d1');
    await waitFor(() => {
      expect(webhooksApi.replay).toHaveBeenCalledWith('test-token', 'd1');
    });
  });
});

describe('useEndpoints', () => {
  it('fetches endpoints list', async () => {
    const { useEndpoints } = await import('@/hooks/useEndpoints');
    const { result } = renderHook(() => useEndpoints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('calls endpointsApi.list with token', async () => {
    const { endpointsApi } = await import('@/lib/api');
    vi.mocked(endpointsApi.list).mockClear();
    const { useEndpoints } = await import('@/hooks/useEndpoints');
    renderHook(() => useEndpoints(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(endpointsApi.list).toHaveBeenCalledWith('test-token');
    });
  });
});

describe('useTeamRole', () => {
  it('returns role info', async () => {
    const { useTeamRole } = await import('@/hooks/useTeamRole');
    const { result } = renderHook(() => useTeamRole('t1'), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });

  it('returns role level function', async () => {
    const { roleLevel, hasMinRole } = await import('@/hooks/useTeamRole');
    expect(typeof roleLevel).toBe('function');
    expect(typeof hasMinRole).toBe('function');
    expect(roleLevel('owner')).toBeGreaterThan(roleLevel('member'));
  });
});

describe('usePlans', () => {
  it('fetches plans', async () => {
    const { usePlans } = await import('@/hooks/usePlans');
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe('usePortal', () => {
  it('fetches portal config', async () => {
    const { usePortalConfig } = await import('@/hooks/usePortal');
    const { result } = renderHook(() => usePortalConfig(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRateLimits', () => {
  it('fetches rate limits', async () => {
    const { useRateLimits } = await import('@/hooks/useRateLimits');
    const { result } = renderHook(() => useRateLimits(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useApiKeys', () => {
  it('fetches API keys', async () => {
    const { useApiKeys } = await import('@/hooks/useApiKeys');
    const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useServiceTokens', () => {
  it('fetches service tokens', async () => {
    const { useServiceTokens } = await import('@/hooks/useServiceTokens');
    const { result } = renderHook(() => useServiceTokens(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCollections', () => {
  it('fetches live endpoints', async () => {
    const { useLiveEndpoints } = await import('@/hooks/useCollections');
    const { result } = renderHook(() => useLiveEndpoints(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches live deliveries', async () => {
    const { useLiveDeliveries } = await import('@/hooks/useCollections');
    const { result } = renderHook(() => useLiveDeliveries(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDashboardData', () => {
  it('fetches audit logs', async () => {
    const { useAuditLogs } = await import('@/hooks/useDashboardData');
    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches schemas', async () => {
    const { useSchemas } = await import('@/hooks/useDashboardData');
    const { result } = renderHook(() => useSchemas(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches templates', async () => {
    const { useTemplates } = await import('@/hooks/useDashboardData');
    const { result } = renderHook(() => useTemplates(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useRealtime', () => {
  it('returns realtime object', async () => {
    const { useRealtime } = await import('@/hooks/useRealtime');
    const { result } = renderHook(() => useRealtime(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe('useWebSocket', () => {
  it('returns websocket object', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');
    const { result } = renderHook(() => useWebSocket(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe('usePermissions', () => {
  it('returns permissions object', async () => {
    const { usePermissions } = await import('@/hooks/usePermissions');
    const { result } = renderHook(() => usePermissions('t1'), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

describe('useAlerts', () => {
  it('fetches alerts list', async () => {
    const { useAlerts } = await import('@/hooks/useAlerts');
    const { result } = renderHook(() => useAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('calls alertsApi.list with token', async () => {
    const { alertsApi } = await import('@/lib/api');
    vi.mocked(alertsApi.list).mockClear();
    const { useAlerts } = await import('@/hooks/useAlerts');
    renderHook(() => useAlerts(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(alertsApi.list).toHaveBeenCalledWith('test-token');
    });
  });
});

describe('useBroadcasts', () => {
  it('fetches active broadcasts', async () => {
    const { useBroadcasts } = await import('@/hooks/useBroadcasts');
    const { result } = renderHook(() => useBroadcasts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('calls broadcastsApi.listActive with token', async () => {
    const { broadcastsApi } = await import('@/lib/api');
    vi.mocked(broadcastsApi.listActive).mockClear();
    const { useBroadcasts } = await import('@/hooks/useBroadcasts');
    renderHook(() => useBroadcasts(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(broadcastsApi.listActive).toHaveBeenCalledWith('test-token', undefined);
    });
  });
});

describe('useNotifications', () => {
  it('fetches notifications', async () => {
    const { useNotifications } = await import('@/hooks/useNotifications');
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('calls notificationsApi.list with token', async () => {
    const { notificationsApi } = await import('@/lib/api');
    vi.mocked(notificationsApi.list).mockClear();
    const { useNotifications } = await import('@/hooks/useNotifications');
    renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(notificationsApi.list).toHaveBeenCalledWith('test-token', undefined);
    });
  });
});

describe('useUnreadCounts', () => {
  it('fetches unread notification count', async () => {
    const { useNotificationUnreadCount } = await import('@/hooks/useUnreadCounts');
    const { result } = renderHook(() => useNotificationUnreadCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useTeams', () => {
  it('fetches teams list', async () => {
    const { useTeams } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAnalytics', () => {
  it('fetches delivery trend', async () => {
    const { useDeliveryTrend } = await import('@/hooks/useAnalytics');
    const { result } = renderHook(() => useDeliveryTrend('7d'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches success rate', async () => {
    const { useSuccessRate } = await import('@/hooks/useAnalytics');
    const { result } = renderHook(() => useSuccessRate('24h'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches latency trend', async () => {
    const { useLatencyTrend } = await import('@/hooks/useAnalytics');
    const { result } = renderHook(() => useLatencyTrend('24h'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('calls analyticsApi.deliveryTrend with token and range', async () => {
    const { analyticsApi } = await import('@/lib/api');
    vi.mocked(analyticsApi.deliveryTrend).mockClear();
    const { useDeliveryTrend } = await import('@/hooks/useAnalytics');
    renderHook(() => useDeliveryTrend('30d'), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(analyticsApi.deliveryTrend).toHaveBeenCalledWith('test-token', '30d');
    });
  });
});

describe('useBilling', () => {
  it('fetches subscription', async () => {
    const { useBillingSubscription } = await import('@/hooks/useBilling');
    const { result } = renderHook(() => useBillingSubscription(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useTransforms', () => {
  it('fetches transforms for endpoint', async () => {
    const { useTransformRules } = await import('@/hooks/useTransforms');
    const { result } = renderHook(() => useTransformRules('ep1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useInboundConfigs', () => {
  it('fetches inbound configs', async () => {
    const { useInboundConfigs } = await import('@/hooks/useInboundConfigs');
    const { result } = renderHook(() => useInboundConfigs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCollections (extended)', () => {
  it('fetches live teams', async () => {
    const { useLiveTeams } = await import('@/hooks/useCollections');
    const { result } = renderHook(() => useLiveTeams(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches live alerts', async () => {
    const { useLiveAlerts } = await import('@/hooks/useCollections');
    const { result } = renderHook(() => useLiveAlerts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches live notifications', async () => {
    const { useLiveNotifications } = await import('@/hooks/useCollections');
    const { result } = renderHook(() => useLiveNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches live service tokens', async () => {
    const { useLiveServiceTokens } = await import('@/hooks/useCollections');
    const { result } = renderHook(() => useLiveServiceTokens(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

// ── useTeams (extended) ──
describe('useTeams (extended)', () => {
  it('fetches team members', async () => {
    const { useTeamMembers } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useTeamMembers('t1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('fetches team detail', async () => {
    const { useTeamDetail } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useTeamDetail('t1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useCreateTeam returns mutation', async () => {
    const { useCreateTeam } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useCreateTeam(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useCreateTeam calls teamsApi.create on mutate', async () => {
    const { teamsApi } = await import('@/lib/api');
    vi.mocked(teamsApi.create).mockClear();
    const { useCreateTeam } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useCreateTeam(), { wrapper: createWrapper() });
    result.current.mutate({ name: 'New Team' });
    await waitFor(() => {
      expect(teamsApi.create).toHaveBeenCalledWith('test-token', { name: 'New Team' });
    });
  });

  it('useUpdateTeam returns mutation', async () => {
    const { useUpdateTeam } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useUpdateTeam(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useInviteTeamMember returns mutation', async () => {
    const { useInviteTeamMember } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useInviteTeamMember(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useRemoveTeamMember returns mutation', async () => {
    const { useRemoveTeamMember } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useRemoveTeamMember(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useUpdateTeamMemberRole returns mutation', async () => {
    const { useUpdateTeamMemberRole } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useUpdateTeamMemberRole(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useAcceptTeamInvite returns mutation', async () => {
    const { useAcceptTeamInvite } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useAcceptTeamInvite(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteTeam returns mutation', async () => {
    const { useDeleteTeam } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useDeleteTeam(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteTeam calls teamsApi.delete on mutate', async () => {
    const { teamsApi } = await import('@/lib/api');
    vi.mocked(teamsApi.delete).mockClear();
    const { useDeleteTeam } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useDeleteTeam(), { wrapper: createWrapper() });
    result.current.mutate('t1');
    await waitFor(() => {
      expect(teamsApi.delete).toHaveBeenCalledWith('test-token', 't1');
    });
  });

  it('useLeaveTeam returns mutation', async () => {
    const { useLeaveTeam } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useLeaveTeam(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useTransferOwnership returns mutation', async () => {
    const { useTransferOwnership } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useTransferOwnership(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useRevokeInvite returns mutation', async () => {
    const { useRevokeInvite } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useRevokeInvite(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useResendInvite returns mutation', async () => {
    const { useResendInvite } = await import('@/hooks/useTeams');
    const { result } = renderHook(() => useResendInvite(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

// ── useEndpoints (extended) ──
describe('useEndpoints (extended)', () => {
  it('fetches endpoint detail', async () => {
    const { useEndpointDetail } = await import('@/hooks/useEndpoints');
    const { result } = renderHook(() => useEndpointDetail('ep1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useDeleteEndpoint returns mutation', async () => {
    const { useDeleteEndpoint } = await import('@/hooks/useEndpoints');
    const { result } = renderHook(() => useDeleteEndpoint(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useToggleEndpoint returns mutation', async () => {
    const { useToggleEndpoint } = await import('@/hooks/useEndpoints');
    const { result } = renderHook(() => useToggleEndpoint(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

// ── useAlerts (extended) ──
describe('useAlerts (extended)', () => {
  it('useCreateAlert returns mutation', async () => {
    const { useCreateAlert } = await import('@/hooks/useAlerts');
    const { result } = renderHook(() => useCreateAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useUpdateAlert returns mutation', async () => {
    const { useUpdateAlert } = await import('@/hooks/useAlerts');
    const { result } = renderHook(() => useUpdateAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteAlert returns mutation', async () => {
    const { useDeleteAlert } = await import('@/hooks/useAlerts');
    const { result } = renderHook(() => useDeleteAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useTestAlert returns mutation', async () => {
    const { useTestAlert } = await import('@/hooks/useAlerts');
    const { result } = renderHook(() => useTestAlert(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

// ── useWebhooks (extended) ──
describe('useWebhooks (extended)', () => {
  it('useCreateWebhook returns mutation', async () => {
    const { useCreateWebhook } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useCreateWebhook(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useDeliveryLogs fetches logs', async () => {
    const { useDeliveryLogs } = await import('@/hooks/useWebhooks');
    const { result } = renderHook(() => useDeliveryLogs({ page: 1 }), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});

// ── useNotifications (extended) ──
describe('useNotifications (extended)', () => {
  it('useMarkNotificationAsRead returns mutation', async () => {
    const { useMarkNotificationAsRead } = await import('@/hooks/useNotifications');
    const { result } = renderHook(() => useMarkNotificationAsRead(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useMarkAllNotificationsAsRead returns mutation', async () => {
    const { useMarkAllNotificationsAsRead } = await import('@/hooks/useNotifications');
    const { result } = renderHook(() => useMarkAllNotificationsAsRead(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useDeleteNotification returns mutation', async () => {
    const { useDeleteNotification } = await import('@/hooks/useNotifications');
    const { result } = renderHook(() => useDeleteNotification(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

// ── useBroadcasts (extended) ──
describe('useBroadcasts (extended)', () => {
  it('useDismissBroadcast returns mutation', async () => {
    const { useDismissBroadcast } = await import('@/hooks/useBroadcasts');
    const { result } = renderHook(() => useDismissBroadcast(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('useBroadcastUnreadCount fetches count', async () => {
    const { useBroadcastUnreadCount } = await import('@/hooks/useBroadcasts');
    const { result } = renderHook(() => useBroadcastUnreadCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
