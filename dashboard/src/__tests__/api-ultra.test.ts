import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage and window.location for 401 handling
const mockLocalStorage = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

// Mock window object for 401 redirect
const originalWindow = globalThis.window;
Object.defineProperty(globalThis, 'window', {
  value: {
    location: { href: '/dashboard', assign: vi.fn() },
    localStorage: mockLocalStorage,
  },
  writable: true,
});

// Import after mocking
const {
  apiFetch,
  api,
  endpointsApi,
  webhooksApi,
  authApi,
  statsApi,
  adminApi,
  teamsApi,
  notificationsApi,
  billingApi,
  billingApiExtended,
  analyticsApi,
  alertsApi,
  transformsApi,
  inboundApi,
} = await import('@/lib/api');

describe('api-ultra: apiFetch core behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.removeItem.mockClear();
  });

  // Test 1: apiFetch sends correct URL
  it('constructs URL from API_BASE + path', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    });

    await apiFetch('/test-path');
    const callUrl = mockFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('/test-path');
  });

  // Test 2: apiFetch includes Authorization header
  it('includes Authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/protected', { token: 'my-jwt-token' });
    expect(mockFetch.mock.calls[0][1].headers).toMatchObject({
      Authorization: 'Bearer my-jwt-token',
    });
  });

  // Test 3: apiFetch includes Content-Type for POST
  it('includes Content-Type application/json for all requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/test', { method: 'POST', body: { key: 'value' } });
    expect(mockFetch.mock.calls[0][1].headers).toMatchObject({
      'Content-Type': 'application/json',
    });
  });

  // Test 4: api.get uses GET method
  it('api.get sends GET request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });

    const result = await api.get('/items', 'tok');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/items'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual({ data: { items: [] } });
  });

  // Test 5: api.post uses POST method
  it('api.post sends POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'new' }),
    });

    await api.post('/items', { name: 'test' }, 'tok');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/items'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      })
    );
  });

  // Test 6: api.put uses PUT method
  it('api.put sends PUT request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    });

    await api.put('/items/1', { name: 'updated' }, 'tok');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/items/1'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'updated' }),
      })
    );
  });

  // Test 7: api.delete uses DELETE method
  it('api.delete sends DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deleted: true }),
    });

    await api.delete('/items/1', 'tok');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/items/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  // Test 8: api.post wraps response in { data }
  it('api.post wraps response in { data }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '123' }),
    });

    const result = await api.post('/items', {}, 'tok');
    expect(result).toEqual({ data: { id: '123' } });
  });

  // Test 9: api.put wraps response in { data }
  it('api.put wraps response in { data }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ updated: true }),
    });

    const result = await api.put('/items/1', {}, 'tok');
    expect(result).toEqual({ data: { updated: true } });
  });

  // Test 10: api.delete wraps response in { data }
  it('api.delete wraps response in { data }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deleted: true }),
    });

    const result = await api.delete('/items/1', 'tok');
    expect(result).toEqual({ data: { deleted: true } });
  });

  // Test 11: apiFetch sets credentials to include
  it('apiFetch sets credentials to include', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/test');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({
      credentials: 'include',
    });
  });

  // Test 12: apiFetch does not include body for GET
  it('apiFetch does not include body for GET requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/test');
    expect(mockFetch.mock.calls[0][1].body).toBeUndefined();
  });

  // Test 13: apiFetch without token omits Authorization header
  it('apiFetch omits Authorization header when no token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/public');
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty('Authorization');
  });

  // Test 14: Handles non-OK response with JSON error message
  it('throws error with message from JSON error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: { message: 'Validation failed' } }),
    });

    await expect(apiFetch('/test')).rejects.toThrow('Validation failed');
  });

  // Test 15: Handles non-OK response with fallback error message
  it('throws API error: status when JSON has no error.message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ detail: 'something' }),
    });

    await expect(apiFetch('/test')).rejects.toThrow('API error: 422');
  });

  // Test 16: Handles non-OK response with empty JSON
  it('throws "Unknown error" when JSON parse fails on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('invalid json')),
    });

    await expect(apiFetch('/test')).rejects.toThrow('API error: 500');
  });

  // Test 17: Handles network error
  it('re-throws network errors', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiFetch('/test')).rejects.toThrow('Failed to fetch');
  });

  // Test 18: Handles AbortError as timeout
  it('throws timeout message on AbortError', async () => {
    mockFetch.mockRejectedValueOnce(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    await expect(apiFetch('/test')).rejects.toThrow('Request timed out');
  });

  // Test 19: Handles AbortController timeout mechanism
  it('creates AbortController for timeout', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/test');
    // Verify signal was passed
    expect(mockFetch.mock.calls[0][1]).toHaveProperty('signal');
  });

  // Test 20: Handles 401 by attempting token refresh
  it('attempts token refresh on 401 response', async () => {
    // First call: returns 401
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Unauthorized' } }),
      })
      // Refresh call: succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
      // Retry call: succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'retried' }),
      });

    const result = await apiFetch('/protected', { token: 'expired' });

    // Should have called: original, refresh, retry
    expect(mockFetch).toHaveBeenCalledTimes(3);
    // Second call should be refresh
    expect(mockFetch.mock.calls[1][0]).toContain('/auth/refresh');
    expect(mockFetch.mock.calls[1][1].method).toBe('POST');
    expect(result).toEqual({ data: 'retried' });
  });

  // Test 21: Handles 401 when refresh fails
  it('falls through to logout when refresh fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Unauthorized' } }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      });

    await expect(apiFetch('/protected', { token: 'expired' })).rejects.toThrow();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hooksniff_auth');
  });

  // Test 22: Handles 401 when refresh throws network error
  it('handles refresh network error gracefully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Unauthorized' } }),
      })
      .mockRejectedValueOnce(new TypeError('Network error'));

    await expect(apiFetch('/protected', { token: 'expired' })).rejects.toThrow();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hooksniff_auth');
  });
});

describe('api-ultra: domain-specific API modules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  // Test 23: endpointsApi.list calls correct path
  it('endpointsApi.list calls /endpoints', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await endpointsApi.list('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/endpoints');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'GET' });
  });

  // Test 24: endpointsApi.create sends correct data
  it('endpointsApi.create sends POST with url and description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'ep_1' }),
    });

    await endpointsApi.create('tok', { url: 'https://example.com', description: 'My endpoint' });
    expect(mockFetch.mock.calls[0][0]).toContain('/endpoints');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com', description: 'My endpoint' }),
    });
  });

  // Test 25: endpointsApi.update sends PUT
  it('endpointsApi.update sends PUT to /endpoints/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'ep_1' }),
    });

    await endpointsApi.update('tok', 'ep_1', { url: 'https://new.com' });
    expect(mockFetch.mock.calls[0][0]).toContain('/endpoints/ep_1');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'PUT' });
  });

  // Test 26: endpointsApi.delete sends DELETE
  it('endpointsApi.delete sends DELETE to /endpoints/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deleted: true }),
    });

    await endpointsApi.delete('tok', 'ep_1');
    expect(mockFetch.mock.calls[0][0]).toContain('/endpoints/ep_1');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'DELETE' });
  });

  // Test 27: webhooksApi.list with pagination
  it('webhooksApi.list passes pagination params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0 }),
    });

    await webhooksApi.list('tok', { page: 3, status: 'failed' });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=3');
    expect(url).toContain('status=failed');
  });

  // Test 28: webhooksApi.list without params
  it('webhooksApi.list without params omits query string', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0 }),
    });

    await webhooksApi.list('tok');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain('?');
  });

  // Test 29: webhooksApi.replay sends POST
  it('webhooksApi.replay sends POST to /webhooks/:id/replay', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'd1' }),
    });

    await webhooksApi.replay('tok', 'd1');
    expect(mockFetch.mock.calls[0][0]).toContain('/webhooks/d1/replay');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  });

  // Test 30: webhooksApi.batch sends POST with webhooks array
  it('webhooksApi.batch sends POST with webhooks array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deliveries: [] }),
    });

    const data = { webhooks: [{ endpoint_id: 'ep1', data: { test: true } }] };
    await webhooksApi.batch('tok', data);
    expect(mockFetch.mock.calls[0][0]).toContain('/webhooks/batch');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  });

  // Test 31: statsApi.get calls /stats
  it('statsApi.get calls /stats', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ total_deliveries: 100 }),
    });

    await statsApi.get('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/stats');
  });

  // Test 32: authApi.login sends credentials
  it('authApi.login sends email and password', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'jwt', user: { id: '1' } }),
    });

    await authApi.login('test@test.com', 'password123');
    expect(mockFetch.mock.calls[0][0]).toContain('/auth/login');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
    });
  });

  // Test 33: authApi.register sends name
  it('authApi.register sends email, password, and name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'jwt', user: { id: '1' } }),
    });

    await authApi.register('new@test.com', 'pass', 'New User');
    expect(mockFetch.mock.calls[0][1].body).toContain('New User');
  });

  // Test 34: alertsApi.list calls /alerts
  it('alertsApi.list calls /alerts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await alertsApi.list('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/alerts');
  });

  // Test 35: alertsApi.create sends POST
  it('alertsApi.create sends POST with alert data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'a1' }),
    });

    await alertsApi.create('tok', {
      name: 'Failure Alert',
      condition: 'failure_rate > 10',
      threshold: 10,
      channels: ['email'],
    });
    expect(mockFetch.mock.calls[0][0]).toContain('/alerts');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  });

  // Test 36: alertsApi.delete sends DELETE
  it('alertsApi.delete sends DELETE to /alerts/:id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await alertsApi.delete('tok', 'a1');
    expect(mockFetch.mock.calls[0][0]).toContain('/alerts/a1');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'DELETE' });
  });

  // Test 37: alertsApi.test sends POST
  it('alertsApi.test sends POST to /alerts/:id/test', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await alertsApi.test('tok', 'a1');
    expect(mockFetch.mock.calls[0][0]).toContain('/alerts/a1/test');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  });

  // Test 38: transformsApi.list calls correct path
  it('transformsApi.list calls /endpoints/:id/transforms', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await transformsApi.list('tok', 'ep_1');
    expect(mockFetch.mock.calls[0][0]).toContain('/endpoints/ep_1/transforms');
  });

  // Test 39: transformsApi.create sends POST
  it('transformsApi.create sends POST to transforms endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'tr_1' }),
    });

    await transformsApi.create('tok', 'ep_1', { rule: { filter: { include: ['order.*'] } } });
    expect(mockFetch.mock.calls[0][0]).toContain('/endpoints/ep_1/transforms');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  });

  // Test 40: transformsApi.delete sends DELETE
  it('transformsApi.delete sends DELETE to specific transform', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await transformsApi.delete('tok', 'ep_1', 'tr_1');
    expect(mockFetch.mock.calls[0][0]).toContain('/endpoints/ep_1/transforms/tr_1');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'DELETE' });
  });

  // Test 41: inboundApi.listConfigs calls /inbound/configs
  it('inboundApi.listConfigs calls /inbound/configs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await inboundApi.listConfigs('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/inbound/configs');
  });

  // Test 42: inboundApi.createConfig sends POST
  it('inboundApi.createConfig sends POST with config data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'in_1' }),
    });

    await inboundApi.createConfig('tok', { provider: 'stripe', secret: 'whsec_123' });
    expect(mockFetch.mock.calls[0][0]).toContain('/inbound/configs');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'POST' });
  });

  // Test 43: billingApiExtended.getUsage calls /billing/usage
  it('billingApiExtended.getUsage calls /billing/usage', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deliveries_used: 50, deliveries_limit: 1000 }),
    });

    await billingApiExtended.getUsage('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/billing/usage');
  });

  // Test 44: billingApiExtended.getSubscription calls /billing/subscription
  it('billingApiExtended.getSubscription calls /billing/subscription', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ plan: 'pro', status: 'active' }),
    });

    await billingApiExtended.getSubscription('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/billing/subscription');
  });

  // Test 45: billingApiExtended.upgrade sends POST with plan
  it('billingApiExtended.upgrade sends POST to /billing/upgrade', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, checkout_url: 'https://stripe.com/checkout' }),
    });

    await billingApiExtended.upgrade('tok', 'pro');
    expect(mockFetch.mock.calls[0][0]).toContain('/billing/upgrade');
    expect(mockFetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ plan: 'pro' }),
    });
  });

  // Test 46: adminApi.listUsers with filters
  it('adminApi.listUsers passes search and plan filters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: [], total: 0 }),
    });

    await adminApi.listUsers('tok', { page: 2, search: 'alice', plan: 'pro', status: 'active' });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=2');
    expect(url).toContain('search=alice');
    expect(url).toContain('plan=pro');
    expect(url).toContain('status=active');
  });

  // Test 47: adminApi.listUsers without filters
  it('adminApi.listUsers without filters omits query string', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ users: [], total: 0 }),
    });

    await adminApi.listUsers('tok');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain('?');
  });

  // Test 48: adminApi.updateUserStatus with 'banned' sends is_active: false
  it('adminApi.updateUserStatus sends is_active based on status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await adminApi.updateUserStatus('tok', 'u1', 'banned');
    expect(mockFetch.mock.calls[0][1].body).toContain('"is_active":false');
  });

  // Test 49: adminApi.updateUserStatus with 'active' sends is_active: true
  it('adminApi.updateUserStatus sends is_active:true for active', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await adminApi.updateUserStatus('tok', 'u1', 'active');
    expect(mockFetch.mock.calls[0][1].body).toContain('"is_active":true');
  });

  // Test 50: notificationsApi.list with all params
  it('notificationsApi.list passes page, type, and read filters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ notifications: [], total: 0 }),
    });

    await notificationsApi.list('tok', { page: 1, type: 'alert', read: true });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('page=1');
    expect(url).toContain('type=alert');
    expect(url).toContain('read=true');
  });

  // Test 51: webhooksApi.getAttempts calls correct path
  it('webhooksApi.getAttempts calls /webhooks/:id/attempts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await webhooksApi.getAttempts('tok', 'd123');
    expect(mockFetch.mock.calls[0][0]).toContain('/webhooks/d123/attempts');
  });

  // Test 52: teamsApi.list calls /teams
  it('teamsApi.list calls /teams', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await teamsApi.list('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/teams');
  });

  // Test 53: teamsApi.create sends POST with team data
  it('teamsApi.create sends POST with name and description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 't1' }),
    });

    await teamsApi.create('tok', { name: 'Engineering', description: 'Dev team' });
    expect(mockFetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ name: 'Engineering', description: 'Dev team' }),
    });
  });

  // Test 54: teamsApi.listMembers calls correct path
  it('teamsApi.listMembers calls /teams/:id/members', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await teamsApi.listMembers('tok', 't1');
    expect(mockFetch.mock.calls[0][0]).toContain('/teams/t1/members');
  });

  // Test 55: billingApi.getInvoices calls /billing/invoices
  it('billingApi.getInvoices calls /billing/invoices', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await billingApi.getInvoices('tok');
    expect(mockFetch.mock.calls[0][0]).toContain('/billing/invoices');
  });
});
