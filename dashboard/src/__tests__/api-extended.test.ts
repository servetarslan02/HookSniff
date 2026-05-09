import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
const {
  apiFetch,
  endpointsApi,
  webhooksApi,
  authApi,
  statsApi,
  adminApi,
  teamsApi,
  notificationsApi,
  billingApi,
  analyticsApi,
  api,
} = await import('../lib/api');

describe('api generic client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });
  });

  it('api.get wraps response in { data }', async () => {
    const result = await api.get('/test', 'token');
    expect(result).toEqual({ data: { data: 'test' } });
  });

  it('api.post sends POST request', async () => {
    await api.post('/test', { key: 'value' }, 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ key: 'value' }) })
    );
  });

  it('api.put sends PUT request', async () => {
    await api.put('/test', { key: 'value' }, 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('api.delete sends DELETE request', async () => {
    await api.delete('/test', 'token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('endpointsApi extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'ep1' }),
    });
  });

  it('update sends PUT request with data', async () => {
    await endpointsApi.update('token', 'ep1', { url: 'https://new.com' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints/ep1'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ url: 'https://new.com' }) })
    );
  });

  it('updateRetryPolicy sends PUT to retry-policy endpoint', async () => {
    const policy = { max_attempts: 5, backoff: 'exponential' as const, initial_delay_secs: 1, max_delay_secs: 60 };
    await endpointsApi.updateRetryPolicy('token', 'ep1', policy);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints/ep1/retry-policy'),
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('webhooksApi extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0 }),
    });
  });

  it('get fetches single webhook by id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'd1', status: 'delivered' }),
    });
    await webhooksApi.get('token', 'd1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/webhooks/d1'),
      expect.anything()
    );
  });

  it('getAttempts fetches attempts for a delivery', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    await webhooksApi.getAttempts('token', 'd1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/webhooks/d1/attempts'),
      expect.anything()
    );
  });

  it('replay sends POST to replay endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'd1' }),
    });
    await webhooksApi.replay('token', 'd1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/webhooks/d1/replay'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('batch sends POST to batch endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deliveries: [] }),
    });
    await webhooksApi.batch('token', { webhooks: [{ endpoint_id: 'ep1', data: {} }] });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/webhooks/batch'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it('getStats calls admin stats endpoint', async () => {
    await adminApi.getStats('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/stats'),
      expect.anything()
    );
  });

  it('listUsers calls admin users endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: [], total: 0 }),
    });
    await adminApi.listUsers('token', { page: 1, search: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users'),
      expect.anything()
    );
  });

  it('getUserDetail calls specific user endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: {}, endpoints: [] }),
    });
    await adminApi.getUserDetail('token', 'u1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users/u1'),
      expect.anything()
    );
  });

  it('updateUserPlan sends PUT request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await adminApi.updateUserPlan('token', 'u1', 'pro');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users/u1/plan'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('updateUserStatus sends PUT request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await adminApi.updateUserStatus('token', 'u1', 'banned');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users/u1/status'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('getRevenue calls admin revenue endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ mrr: 1000 }),
    });
    await adminApi.getRevenue('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/revenue'),
      expect.anything()
    );
  });
});

describe('teamsApi extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it('get fetches single team', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 't1', name: 'Team 1' }),
    });
    await teamsApi.get('token', 't1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/teams/t1'),
      expect.anything()
    );
  });

  it('inviteMember sends POST with email and role', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await teamsApi.inviteMember('token', 't1', { email: 'new@test.com', role: 'member' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/teams/t1/members'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('removeMember sends DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await teamsApi.removeMember('token', 't1', 'm1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/teams/t1/members/m1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('updateRole sends PUT request with role', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await teamsApi.updateRole('token', 't1', 'm1', 'admin');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/teams/t1/members/m1/role'),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ role: 'admin' }) })
    );
  });
});

describe('notificationsApi extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ notifications: [], total: 0 }),
    });
  });

  it('getUnreadCount calls unread-count endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ count: 5 }),
    });
    await notificationsApi.getUnreadCount('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/unread-count'),
      expect.anything()
    );
  });

  it('markAsRead sends PUT to read endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await notificationsApi.markAsRead('token', 'n1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/n1/read'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('markAllAsRead sends PUT to read-all endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await notificationsApi.markAllAsRead('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/read-all'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('deleteNotification sends DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    await notificationsApi.deleteNotification('token', 'n1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/notifications/n1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('list supports pagination and filters', async () => {
    await notificationsApi.list('token', { page: 2, type: 'webhook_failed', read: false });
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('page=2');
    expect(callUrl).toContain('type=webhook_failed');
    expect(callUrl).toContain('read=false');
  });
});

describe('billingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getInvoices calls billing invoices endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    await billingApi.getInvoices('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/billing/invoices'),
      expect.anything()
    );
  });
});

describe('analyticsApi extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it('deliveryTrend passes range parameter', async () => {
    await analyticsApi.deliveryTrend('token', '7d');
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('/analytics/deliveries');
    expect(callUrl).toContain('range=7d');
  });

  it('successRate passes range parameter', async () => {
    await analyticsApi.successRate('token', '30d');
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('/analytics/success-rate');
    expect(callUrl).toContain('range=30d');
  });

  it('latencyTrend passes range parameter', async () => {
    await analyticsApi.latencyTrend('token', '24h');
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('/analytics/latency');
    expect(callUrl).toContain('range=24h');
  });

  it('deliveryTrend defaults to 24h range', async () => {
    await analyticsApi.deliveryTrend('token');
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('range=24h');
  });
});
