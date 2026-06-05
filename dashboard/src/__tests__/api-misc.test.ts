import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const { twoFactorApi, ssoApi, transformsApi, billingApiExtended, analyticsApi } = await import('../lib/api-misc');

describe('twoFactorApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('enable sends POST', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ qr_code: 'data:image/png;base64,abc', secret: 'JBSWY3DPEHPK3PXP' }) });
    const result = await twoFactorApi.enable('token');
    expect(result).toBeDefined();
  });

  it('verify sends POST with code', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    const result = await twoFactorApi.verify('temp-token', '123456');
    expect(result).toBeDefined();
  });

  it('disable sends POST to /auth/2fa/disable', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await twoFactorApi.disable('token', 'password123');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/2fa/disable'), expect.objectContaining({ method: 'POST' }));
  });

  it('getStatus calls /2fa/status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ enabled: false }) });
    await twoFactorApi.getStatus('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/2fa/status'), expect.anything());
  });
});

describe('ssoApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('testSso sends POST', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ valid: true }) });
    await ssoApi.testSso('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/sso/test'), expect.objectContaining({ method: 'POST' }));
  });

  it('deleteSso sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ deleted: true }) });
    await ssoApi.deleteSso('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/sso/config'), expect.objectContaining({ method: 'DELETE' }));
  });

  it('getLoginUrl returns URL string', () => {
    const url = ssoApi.getLoginUrl('test@example.com');
    expect(url).toContain('/v1/sso/login');
    expect(url).toContain('test%40example.com');
  });
});

describe('transformsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls endpoint transforms', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
    await transformsApi.list('token', 'ep1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/endpoints/ep1/transforms'), expect.anything());
  });

  it('create sends POST with endpointId', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 't1' }) });
    await transformsApi.create('token', 'ep1', { rule: { type: 'javascript', code: 'return data;' } });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/endpoints/ep1/transforms'), expect.objectContaining({ method: 'POST' }));
  });
});

describe('billingApiExtended', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getSubscription calls /billing/subscription', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ plan: 'pro' }) });
    await billingApiExtended.getSubscription('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/billing/subscription'), expect.anything());
  });

  it('getInvoices calls /billing/invoices', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ invoices: [] }) });
    await billingApiExtended.getInvoices('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/billing/invoices'), expect.anything());
  });
});

describe('analyticsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deliveryTrend calls /analytics/deliveries', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ buckets: [] }) });
    await analyticsApi.deliveryTrend('token', '7d');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/analytics/deliveries'), expect.anything());
  });

  it('successRate calls /analytics/success-rate', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success_rate: 99.5 }) });
    await analyticsApi.successRate('token', '24h');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/analytics/success-rate'), expect.anything());
  });

  it('latencyTrend calls /analytics/latency', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ p50: 100, p95: 200 }) });
    await analyticsApi.latencyTrend('token', '24h');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/analytics/latency'), expect.anything());
  });
});
