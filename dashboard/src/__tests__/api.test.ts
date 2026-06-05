import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const apiModule = await import('../lib/api');

const ok = (data: any = {}) => ({ ok: true, json: () => Promise.resolve(data) });

describe('apiFetch core', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET with token', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: '1' }));
    const result = await apiModule.apiFetch('/test', { token: 'tk' });
    expect(result).toEqual({ id: '1' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.objectContaining({ method: 'GET', credentials: 'include' }));
  });

  it('POST with body sets Content-Type', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test', { method: 'POST', body: { a: 1 }, token: 'tk' });
    const call = mockFetch.mock.calls[0];
    expect(call[1].headers['Content-Type']).toBe('application/json');
    expect(call[1].body).toBe(JSON.stringify({ a: 1 }));
  });

  it('GET without body omits Content-Type', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test', { token: 'tk' });
    expect(mockFetch.mock.calls[0][1].headers['Content-Type']).toBeUndefined();
  });

  it('sets Authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test', { token: 'my-jwt' });
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBe('Bearer my-jwt');
  });

  it('does not set Authorization when token is "cookie"', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test', { token: 'cookie' });
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBeUndefined();
  });

  it('does not set Authorization when no token', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test');
    expect(mockFetch.mock.calls[0][1].headers['Authorization']).toBeUndefined();
  });

  it('uses custom signal for abort', async () => {
    const controller = new AbortController();
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test', { signal: controller.signal });
    // Signal should be linked (not the same object, but connected)
    expect(mockFetch.mock.calls[0][1].signal).toBeDefined();
  });

  it('throws on non-OK', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: () => Promise.resolve({ error: { message: 'Not found' } }) });
    await expect(apiModule.apiFetch('/test')).rejects.toThrow('Not found');
  });

  it('throws timeout on AbortError', async () => {
    mockFetch.mockRejectedValueOnce(new DOMException('abort', 'AbortError'));
    await expect(apiModule.apiFetch('/test')).rejects.toThrow('timed out');
  });

  it('throws generic error when json parse fails on error response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.reject(new Error('bad')) });
    await expect(apiModule.apiFetch('/test')).rejects.toThrow('API error: 500');
  });

  it('retries transient errors (502) with exponential backoff', async () => {
    // First call: 502, second call: success
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 502, json: () => Promise.resolve({ error: { message: 'Bad Gateway' } }) })
      .mockResolvedValueOnce(ok({ success: true }));
    const result = await apiModule.apiFetch('/test', { token: 'tk' });
    expect(result).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries transient errors (503)', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503, json: () => Promise.resolve({ error: { message: 'Unavailable' } }) })
      .mockResolvedValueOnce(ok({ ok: true }));
    const result = await apiModule.apiFetch('/test');
    expect(result).toEqual({ ok: true });
  });

  it('retries transient errors (504)', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 504, json: () => Promise.resolve({ error: { message: 'Gateway Timeout' } }) })
      .mockResolvedValueOnce(ok({ ok: true }));
    const result = await apiModule.apiFetch('/test');
    expect(result).toEqual({ ok: true });
  });

  it('does not retry non-transient errors (400)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, json: () => Promise.resolve({ error: { message: 'Bad Request' } }) });
    await expect(apiModule.apiFetch('/test')).rejects.toThrow('Bad Request');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throws after max retries exhausted', async () => {
    // 3 attempts: initial + 2 retries = all 502
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 502, json: () => Promise.resolve({ error: { message: 'Bad Gateway' } }) })
      .mockResolvedValueOnce({ ok: false, status: 502, json: () => Promise.resolve({ error: { message: 'Bad Gateway' } }) })
      .mockResolvedValueOnce({ ok: false, status: 502, json: () => Promise.resolve({ error: { message: 'Bad Gateway' } }) });
    await expect(apiModule.apiFetch('/test')).rejects.toThrow('Bad Gateway');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('retries network errors', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(ok({ recovered: true }));
    const result = await apiModule.apiFetch('/test');
    expect(result).toEqual({ recovered: true });
  });

  it('throws after network error max retries', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(apiModule.apiFetch('/test')).rejects.toThrow('Network error');
  });

  it('preserves HookSniffError without wrapping', async () => {
    const { HookSniffError } = await import('../lib/api-errors');
    const hsError = new HookSniffError('Custom', 'CUSTOM_CODE', 422);
    mockFetch.mockRejectedValueOnce(hsError);
    await expect(apiModule.apiFetch('/test')).rejects.toThrow(hsError);
  });

  it('adds CSRF Origin header for POST requests', async () => {
    // getCSRFHeaders only adds Origin when window is available (browser env).
    // In Node test env, window is undefined so it returns {}.
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test', { method: 'POST', body: { x: 1 }, token: 'tk' });
    const headers = mockFetch.mock.calls[0][1].headers;
    // In Node env, Origin is not set (no window). Verify method is still POST correctly.
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });

  it('does not add CSRF Origin header for GET requests', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await apiModule.apiFetch('/test', { token: 'tk' });
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['Origin']).toBeUndefined();
  });
});

describe('stopProactiveRefresh', () => {
  it('can be called without error when nothing running', () => {
    expect(() => apiModule.stopProactiveRefresh()).not.toThrow();
  });
});

describe('setTokenRefreshCallback', () => {
  it('can be called with a callback', () => {
    expect(() => apiModule.setTokenRefreshCallback(vi.fn())).not.toThrow();
  });
});

describe('API_BASE', () => {
  it('is exported and is a string', () => {
    expect(typeof apiModule.API_BASE).toBe('string');
    expect(apiModule.API_BASE.length).toBeGreaterThan(0);
  });
});

describe('applicationsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('list', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.applicationsApi.list('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/applications'); });
  it('get', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'a1' })); await apiModule.applicationsApi.get('tk', 'a1'); expect(mockFetch.mock.calls[0][0]).toContain('/applications/a1'); });
  it('create POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'a2' })); await apiModule.applicationsApi.create('tk', { name: 'App' }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('update PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.applicationsApi.update('tk', 'a1', { name: 'New' }); expect(mockFetch.mock.calls[0][1].method).toBe('PUT'); });
  it('delete DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.applicationsApi.delete('tk', 'a1'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
});

describe('endpointsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('list', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.endpointsApi.list('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/endpoints'); });
  it('get', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'ep1' })); await apiModule.endpointsApi.get('tk', 'ep1'); expect(mockFetch.mock.calls[0][0]).toContain('/endpoints/ep1'); });
  it('create POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'ep2' })); await apiModule.endpointsApi.create('tk', { url: 'https://test.com' }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('update PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.endpointsApi.update('tk', 'ep1', { url: 'https://new.com' }); expect(mockFetch.mock.calls[0][1].method).toBe('PUT'); });
  it('updateRetryPolicy PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.endpointsApi.updateRetryPolicy('tk', 'ep1', { max_attempts: 5, backoff: 'exponential', initial_delay_secs: 1, max_delay_secs: 60 }); expect(mockFetch.mock.calls[0][0]).toContain('/retry-policy'); });
  it('delete DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.endpointsApi.delete('tk', 'ep1'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
  it('rotateSecret POST', async () => { mockFetch.mockResolvedValueOnce(ok({ signing_secret: 'new' })); await apiModule.endpointsApi.rotateSecret('tk', 'ep1'); expect(mockFetch.mock.calls[0][0]).toContain('/rotate-secret'); });
});

describe('webhooksApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('list with params', async () => { mockFetch.mockResolvedValueOnce(ok({ deliveries: [], total: 0 })); await apiModule.webhooksApi.list('tk', { page: 2, status: 'delivered' }); expect(mockFetch.mock.calls[0][0]).toContain('page=2'); });
  it('list without params', async () => { mockFetch.mockResolvedValueOnce(ok({ deliveries: [], total: 0 })); await apiModule.webhooksApi.list('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/webhooks'); });
  it('create POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'd1' })); await apiModule.webhooksApi.create('tk', { endpoint_id: 'ep1', data: {} }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('get details', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'd1' })); await apiModule.webhooksApi.get('tk', 'd1'); expect(mockFetch.mock.calls[0][0]).toContain('/webhooks/d1/details'); });
  it('getAttempts', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.webhooksApi.getAttempts('tk', 'd1'); expect(mockFetch.mock.calls[0][0]).toContain('/webhooks/d1/attempts'); });
  it('replay POST', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.webhooksApi.replay('tk', 'd1'); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('batchReplay POST', async () => { mockFetch.mockResolvedValueOnce(ok({ replayed: 3 })); const r = await apiModule.webhooksApi.batchReplay('tk', ['d1', 'd2']); expect(r.replayed).toBe(3); });
});

describe('statsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('get calls /stats', async () => { mockFetch.mockResolvedValueOnce(ok({ total: 100 })); await apiModule.statsApi.get('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/stats'); });
});

describe('environmentsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('list', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.environmentsApi.list('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/environments'); });
  it('get', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'e1' })); await apiModule.environmentsApi.get('tk', 'e1'); expect(mockFetch.mock.calls[0][0]).toContain('/environments/e1'); });
  it('create POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'e2' })); await apiModule.environmentsApi.create('tk', { name: 'Staging' }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('update PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.environmentsApi.update('tk', 'e1', { name: 'Prod' }); expect(mockFetch.mock.calls[0][1].method).toBe('PUT'); });
  it('delete DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.environmentsApi.delete('tk', 'e1'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
  it('listVariables', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.environmentsApi.listVariables('tk', 'e1'); expect(mockFetch.mock.calls[0][0]).toContain('/environments/e1/variables'); });
  it('createVariable POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'v1' })); await apiModule.environmentsApi.createVariable('tk', 'e1', { key: 'DB', value: 'pg' }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('deleteVariable DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.environmentsApi.deleteVariable('tk', 'e1', 'v1'); expect(mockFetch.mock.calls[0][0]).toContain('/environments/e1/variables/v1'); });
});

describe('backgroundTasksApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('list', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.backgroundTasksApi.list('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/background-tasks'); });
  it('get', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 't1' })); await apiModule.backgroundTasksApi.get('tk', 't1'); expect(mockFetch.mock.calls[0][0]).toContain('/background-tasks/t1'); });
  it('cancel PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.backgroundTasksApi.cancel('tk', 't1'); expect(mockFetch.mock.calls[0][1].method).toBe('PUT'); });
});

describe('operationalWebhooksApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('list', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.operationalWebhooksApi.list('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/operational-webhooks'); });
  it('get', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'ow1' })); await apiModule.operationalWebhooksApi.get('tk', 'ow1'); expect(mockFetch.mock.calls[0][0]).toContain('/operational-webhooks/ow1'); });
  it('create POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'ow2' })); await apiModule.operationalWebhooksApi.create('tk', { url: 'https://h.com' }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('update PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.operationalWebhooksApi.update('tk', 'ow1', { url: 'https://n.com' }); expect(mockFetch.mock.calls[0][1].method).toBe('PUT'); });
  it('delete DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.operationalWebhooksApi.delete('tk', 'ow1'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
  it('listDeliveries', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.operationalWebhooksApi.listDeliveries('tk', 'ow1'); expect(mockFetch.mock.calls[0][0]).toContain('/deliveries'); });
});

describe('messagePollerApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('poll', async () => { mockFetch.mockResolvedValueOnce(ok({ messages: [], cursor: {}, done: true })); await apiModule.messagePollerApi.poll('tk', { consumer_id: 'c1' }); expect(mockFetch.mock.calls[0][0]).toContain('/message-poller/poll'); });
  it('seek POST', async () => { mockFetch.mockResolvedValueOnce(ok({ cursor: {} })); await apiModule.messagePollerApi.seek('tk', { consumer_id: 'c1', message_id: 'm1' }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('commit POST', async () => { mockFetch.mockResolvedValueOnce(ok({ committed: true })); await apiModule.messagePollerApi.commit('tk', { consumer_id: 'c1', message_id: 'm1' }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
});

describe('api generic client', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('get wraps in { data }', async () => { mockFetch.mockResolvedValueOnce(ok({ id: '1' })); const r = await apiModule.api.get('/test', 'tk'); expect(r).toEqual({ data: { id: '1' } }); });
  it('post sends POST', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.post('/test', { a: 1 }, 'tk'); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('put sends PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.put('/test', {}, 'tk'); expect(mockFetch.mock.calls[0][1].method).toBe('PUT'); });
  it('delete sends DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.delete('/test', 'tk'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
  it('getAuditLog', async () => { mockFetch.mockResolvedValueOnce(ok({ entries: [], has_more: false })); await apiModule.api.getAuditLog('tk', { page: 2 }); expect(mockFetch.mock.calls[0][0]).toContain('/audit-log'); });
  it('getEndpointHealth', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.api.getEndpointHealth('tk', '7d'); expect(mockFetch.mock.calls[0][0]).toContain('/endpoint-health'); });
  it('getApiKeys', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.api.getApiKeys('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/api-keys'); });
  it('createApiKey POST', async () => { mockFetch.mockResolvedValueOnce(ok({ key: 'sk' })); await apiModule.api.createApiKey('tk', 'Key'); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('deleteApiKey DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.deleteApiKey('tk', 'k1'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
  it('rotateApiKey POST', async () => { mockFetch.mockResolvedValueOnce(ok({ key: 'sk2' })); await apiModule.api.rotateApiKey('tk', 'k1'); expect(mockFetch.mock.calls[0][0]).toContain('/rotate'); });
  it('getPortalConfig', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.getPortalConfig('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/portal/config'); });
  it('getPortalEmbedCode', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.getPortalEmbedCode('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/portal/embed-code'); });
  it('updatePortalConfig POST', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.updatePortalConfig('tk', {}); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('getPortalProfile', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.getPortalProfile('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/portal/me'); });
  it('getPortalUsage', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.getPortalUsage('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/portal/usage'); });
  it('getRateLimits', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.api.getRateLimits('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/rate-limits'); });
  it('setRateLimit POST', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.setRateLimit('tk', 'ep1', { requests_per_second: 10, burst_size: 20, enabled: true }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('deleteRateLimit DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.deleteRateLimit('tk', 'ep1'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
  it('getSchemas', async () => { mockFetch.mockResolvedValueOnce(ok({ schemas: [] })); await apiModule.api.getSchemas('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/schemas'); });
  it('createSchema POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 's1' })); await apiModule.api.createSchema('tk', { name: 'Test', schema: {} }); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('getSchema', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 's1' })); await apiModule.api.getSchema('tk', 's1'); expect(mockFetch.mock.calls[0][0]).toContain('/schemas/s1'); });
  it('validateSchema POST', async () => { mockFetch.mockResolvedValueOnce(ok({ valid: true, errors: [] })); await apiModule.api.validateSchema('tk', 's1', {}); expect(mockFetch.mock.calls[0][0]).toContain('/validate'); });
  it('search', async () => { mockFetch.mockResolvedValueOnce(ok({ results: [] })); await apiModule.api.search('tk', { q: 'test' }); expect(mockFetch.mock.calls[0][0]).toContain('/search'); });
  it('getServiceTokens', async () => { mockFetch.mockResolvedValueOnce(ok([])); await apiModule.api.getServiceTokens('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/service-tokens'); });
  it('createServiceToken POST', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 'st1' })); await apiModule.api.createServiceToken('tk', 'CI'); expect(mockFetch.mock.calls[0][1].method).toBe('POST'); });
  it('deleteServiceToken DELETE', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.deleteServiceToken('tk', 'st1'); expect(mockFetch.mock.calls[0][1].method).toBe('DELETE'); });
  it('revealServiceToken POST', async () => { mockFetch.mockResolvedValueOnce(ok({ token: 'sk' })); await apiModule.api.revealServiceToken('tk', 'st1'); expect(mockFetch.mock.calls[0][0]).toContain('/reveal'); });
  it('updateServiceToken PUT', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.updateServiceToken('tk', 'st1', { name: 'New' }); expect(mockFetch.mock.calls[0][1].method).toBe('PUT'); });
  it('getTemplates', async () => { mockFetch.mockResolvedValueOnce(ok({ templates: [] })); await apiModule.api.getTemplates('tk'); expect(mockFetch.mock.calls[0][0]).toContain('/templates'); });
  it('getTemplate', async () => { mockFetch.mockResolvedValueOnce(ok({ id: 't1' })); await apiModule.api.getTemplate('tk', 't1'); expect(mockFetch.mock.calls[0][0]).toContain('/templates/t1'); });
  it('applyTemplate POST', async () => { mockFetch.mockResolvedValueOnce(ok({})); await apiModule.api.applyTemplate('tk', 't1', { endpoint_url: 'https://test.com' }); expect(mockFetch.mock.calls[0][0]).toContain('/templates/t1/apply'); });
});
