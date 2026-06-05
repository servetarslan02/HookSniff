import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const apiModule = await import('../lib/api');
const { connectorsApi, integrationsApi, streamApi } = await import('../lib/api-integrations');

const ok = (data: any = {}) => ({ ok: true, json: () => Promise.resolve(data) });

describe('connectorsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list GETs /connectors', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    const r = await connectorsApi.list('tk');
    expect(r).toEqual([]);
    expect(mockFetch.mock.calls[0][0]).toContain('/connectors');
  });

  it('get fetches single connector', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 'c1', name: 'slack' }));
    const r = await connectorsApi.get('tk', 'c1');
    expect(r.id).toBe('c1');
    expect(mockFetch.mock.calls[0][0]).toContain('/connectors/c1');
  });

  it('listConfigs fetches /connectors/configs', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await connectorsApi.listConfigs('tk');
    expect(mockFetch.mock.calls[0][0]).toContain('/connectors/configs');
  });

  it('getConfig fetches single config', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 'cfg1' }));
    await connectorsApi.getConfig('tk', 'cfg1');
    expect(mockFetch.mock.calls[0][0]).toContain('/connectors/configs/cfg1');
  });

  it('createConfig POSTs /connectors/configs', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 'cfg2' }));
    await connectorsApi.createConfig('tk', { connector_id: 'c1', name: 'My Slack' });
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    expect(mockFetch.mock.calls[0][0]).toContain('/connectors/configs');
  });

  it('updateConfig PUTs /connectors/configs/:id', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await connectorsApi.updateConfig('tk', 'cfg1', { name: 'Updated' });
    expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
    expect(mockFetch.mock.calls[0][0]).toContain('/connectors/configs/cfg1');
  });

  it('deleteConfig DELETEs /connectors/configs/:id', async () => {
    mockFetch.mockResolvedValueOnce(ok({ deleted: true }));
    const r = await connectorsApi.deleteConfig('tk', 'cfg1');
    expect(r.deleted).toBe(true);
    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
  });
});

describe('integrationsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list GETs /integrations', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await integrationsApi.list('tk');
    expect(mockFetch.mock.calls[0][0]).toContain('/integrations');
  });

  it('get fetches single integration', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 'i1' }));
    await integrationsApi.get('tk', 'i1');
    expect(mockFetch.mock.calls[0][0]).toContain('/integrations/i1');
  });

  it('create POSTs /integrations', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 'i2' }));
    await integrationsApi.create('tk', { name: 'Test', connector_config_id: 'cfg1', endpoint_id: 'ep1' });
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });

  it('update PUTs /integrations/:id', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await integrationsApi.update('tk', 'i1', { name: 'Updated' });
    expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
  });

  it('delete DELETEs /integrations/:id', async () => {
    mockFetch.mockResolvedValueOnce(ok({ deleted: true }));
    const r = await integrationsApi.delete('tk', 'i1');
    expect(r.deleted).toBe(true);
  });

  it('test POSTs /integrations/:id/test', async () => {
    mockFetch.mockResolvedValueOnce(ok({ success: true, event_id: 'e1', message: 'OK' }));
    const r = await integrationsApi.test('tk', 'i1');
    expect(r.success).toBe(true);
    expect(mockFetch.mock.calls[0][0]).toContain('/test');
  });

  it('listEvents without params', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await integrationsApi.listEvents('tk', 'i1');
    expect(mockFetch.mock.calls[0][0]).toContain('/integrations/i1/events');
  });

  it('listEvents with all params', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await integrationsApi.listEvents('tk', 'i1', { status: 'failed', event_type: 'order.created', limit: 10, offset: 20 });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('status=failed');
    expect(url).toContain('event_type=order.created');
    expect(url).toContain('limit=10');
    expect(url).toContain('offset=20');
  });

  it('listEvents with partial params', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await integrationsApi.listEvents('tk', 'i1', { status: 'pending' });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('status=pending');
    expect(url).not.toContain('event_type');
  });

  it('getStats GETs /integrations/:id/stats', async () => {
    mockFetch.mockResolvedValueOnce(ok({ total_events: 100 }));
    const r = await integrationsApi.getStats('tk', 'i1');
    expect(r.total_events).toBe(100);
    expect(mockFetch.mock.calls[0][0]).toContain('/integrations/i1/stats');
  });
});

describe('streamApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('listChannels GETs /stream/channels', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await streamApi.listChannels('tk');
    expect(mockFetch.mock.calls[0][0]).toContain('/stream/channels');
  });

  it('getChannel GETs /stream/channels/:id', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 'ch1' }));
    await streamApi.getChannel('tk', 'ch1');
    expect(mockFetch.mock.calls[0][0]).toContain('/stream/channels/ch1');
  });

  it('createChannel POSTs /stream/channels', async () => {
    mockFetch.mockResolvedValueOnce(ok({ id: 'ch2' }));
    await streamApi.createChannel('tk', { name: 'Orders' });
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });

  it('updateChannel PUTs /stream/channels/:id', async () => {
    mockFetch.mockResolvedValueOnce(ok({}));
    await streamApi.updateChannel('tk', 'ch1', { name: 'Updated' });
    expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
  });

  it('deleteChannel DELETEs /stream/channels/:id', async () => {
    mockFetch.mockResolvedValueOnce(ok({ deleted: true }));
    const r = await streamApi.deleteChannel('tk', 'ch1');
    expect(r.deleted).toBe(true);
  });

  it('listMessages without params', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await streamApi.listMessages('tk', 'ch1');
    expect(mockFetch.mock.calls[0][0]).toContain('/stream/channels/ch1/messages');
  });

  it('listMessages with params', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await streamApi.listMessages('tk', 'ch1', { event_type: 'order.created', limit: 50 });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('event_type=order.created');
    expect(url).toContain('limit=50');
  });

  it('listSubscriptions GETs /stream/subscriptions', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await streamApi.listSubscriptions('tk');
    expect(mockFetch.mock.calls[0][0]).toContain('/stream/subscriptions');
  });

  it('disconnectSubscription DELETEs subscription', async () => {
    mockFetch.mockResolvedValueOnce(ok({ disconnected: true }));
    const r = await streamApi.disconnectSubscription('tk', 'sub1');
    expect(r.disconnected).toBe(true);
  });

  it('publish POSTs /stream/publish', async () => {
    mockFetch.mockResolvedValueOnce(ok({ success: true, message_id: 'm1', delivered_to: 5 }));
    const r = await streamApi.publish('tk', { channel_id: 'ch1', event_type: 'test', payload: { data: 1 } });
    expect(r.success).toBe(true);
    expect(r.delivered_to).toBe(5);
    expect(mockFetch.mock.calls[0][1].method).toBe('POST');
  });
});
