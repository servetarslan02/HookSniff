// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
const { apiFetch, endpointsApi, webhooksApi, adminApi, statsApi, applicationsApi } = await import('../lib/api');

describe('apiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes GET request with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    });

    await apiFetch('/test', { token: 'test-token' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
        credentials: 'include',
      })
    );
  });

  it('makes POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    });

    await apiFetch('/test', { method: 'POST', body: { key: 'value' } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      })
    );
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: { message: 'Not found' } }),
    });

    await expect(apiFetch('/test')).rejects.toThrow('Not found');
  });

  it('throws timeout error on AbortError', async () => {
    mockFetch.mockRejectedValueOnce(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    await expect(apiFetch('/test')).rejects.toThrow('Request timed out');
  });

  it('throws generic error on unknown error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('parse error')),
    });

    await expect(apiFetch('/test')).rejects.toThrow('API error: 500');
  });

  it('handles 401 with token refresh', async () => {
    // First call returns 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Unauthorized' } }),
    });

    await expect(apiFetch('/test', { token: 'expired' })).rejects.toThrow();
  });

  it('sends custom headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/test', {
      token: 'tk',
      method: 'POST',
      body: { data: 1 },
    });

    const call = mockFetch.mock.calls[0];
    expect(call[1].headers['Content-Type']).toBe('application/json');
    expect(call[1].headers['Authorization']).toBe('Bearer tk');
  });
});

describe('endpointsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    await endpointsApi.list('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints'),
      expect.anything()
    );
  });

  it('create sends POST with data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'ep1' }),
    });
    await endpointsApi.create('token', { url: 'https://test.com' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('delete sends DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    await endpointsApi.delete('token', 'ep1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints/ep1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('update sends PUT request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'ep1' }),
    });
    await endpointsApi.update('token', 'ep1', { url: 'https://new.com' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints/ep1'),
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

describe('webhooksApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list with pagination params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0 }),
    });
    const result = await webhooksApi.list('token', { page: 2, status: 'delivered' });
    expect(result).toEqual({ deliveries: [], total: 0 });
  });

  it('create sends correct payload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'wh_1' }),
    });
    await webhooksApi.create('token', { endpoint_id: 'ep_1', data: {} });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/webhooks'),
      expect.objectContaining({ method: 'POST' })
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

  it('batchReplay sends array of ids', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ replayed: 3 }),
    });
    const result = await webhooksApi.batchReplay('token', ['d1', 'd2', 'd3']);
    expect(result.replayed).toBe(3);
  });
});

describe('adminApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getStats calls admin stats endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ total_users: 10 }),
    });
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
    await adminApi.listUsers('token', { page: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users'),
      expect.anything()
    );
  });

  it('getSettings calls settings endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ default_plan: 'developer' }),
    });
    await adminApi.getSettings('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/settings'),
      expect.anything()
    );
  });
});

describe('applicationsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    await applicationsApi.list('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/applications'),
      expect.anything()
    );
  });

  it('create sends POST with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'a1' }),
    });
    await applicationsApi.create('token', { name: 'Test App' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/applications'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
