import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const { adminApi } = await import('../lib/api');

describe('adminApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getStats calls /admin/stats', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ total_users: 10 }) });
    const result = await adminApi.getStats('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/stats'), expect.anything());
  });

  it('listUsers calls /admin/users with params', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [], total: 0 }) });
    await adminApi.listUsers('token', { page: 2, search: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users'), expect.anything());
  });

  it('getUserDetail calls /admin/users/{id}', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ user: {}, endpoints: [] }) });
    await adminApi.getUserDetail('token', 'u1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/u1'), expect.anything());
  });

  it('updateUserPlan sends PUT', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await adminApi.updateUserPlan('token', 'u1', 'pro');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/u1/plan'), expect.objectContaining({ method: 'PUT' }));
  });

  it('updateUserStatus sends PUT', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await adminApi.updateUserStatus('token', 'u1', 'banned');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/u1/status'), expect.objectContaining({ method: 'PUT' }));
  });

  it('getSettings calls /admin/settings', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ default_plan: 'developer' }) });
    await adminApi.getSettings('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/settings'), expect.anything());
  });

  it('updateSettings sends PUT', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'ok' }) });
    await adminApi.updateSettings('token', { maintenance_mode: false });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/settings'), expect.objectContaining({ method: 'PUT' }));
  });

  it('getSystemHealth calls /health', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: 'healthy' }) });
    await adminApi.getSystemHealth('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/health'), expect.anything());
  });

  it('getQueueStatus calls /admin/queue/status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ pending: 0 }) });
    await adminApi.getQueueStatus('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/queue/status'), expect.anything());
  });

  it('getFailedDeliveries calls /admin/deliveries/failed', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ deliveries: [], count: 0 }) });
    await adminApi.getFailedDeliveries('token', { limit: 10, since: '24h' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/deliveries/failed'), expect.anything());
  });

  it('getDeployInfo calls /admin/deploy-info', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ version: '1.0' }) });
    await adminApi.getDeployInfo('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/deploy-info'), expect.anything());
  });

  it('getRevenue calls /admin/revenue', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ mrr: 500 }) });
    await adminApi.getRevenue('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/admin/revenue'), expect.anything());
  });
});
