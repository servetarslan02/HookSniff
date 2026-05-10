import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
const { apiFetch, endpointsApi, webhooksApi, authApi, statsApi } = await import('../lib/api');

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
          'Content-Type': 'application/json',
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
});

describe('endpointsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it('calls list endpoint', async () => {
    await endpointsApi.list('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('calls create endpoint with POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'ep_1' }),
    });

    await endpointsApi.create('token', { url: 'https://example.com' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('calls delete endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deleted: true }),
    });

    await endpointsApi.delete('token', 'ep_1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoints/ep_1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('webhooksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls list with pagination params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0 }),
    });

    await webhooksApi.list('token', { page: 2, status: 'delivered' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.anything()
    );
  });

  it('calls create webhook', async () => {
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
});

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls login endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'jwt', user: { id: '1' } }),
    });

    await authApi.login('test@test.com', 'password');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('calls register endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'jwt', user: { id: '1' } }),
    });

    await authApi.register('test@test.com', 'password', 'Test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('statsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls stats endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ total_deliveries: 100 }),
    });

    await statsApi.get('token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/stats'),
      expect.anything()
    );
  });
});
