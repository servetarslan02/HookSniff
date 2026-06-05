import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const { teamsApi, notificationsApi, alertsApi } = await import('../lib/api-teams');

describe('teamsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls /teams', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
    await teamsApi.list('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams'), expect.anything());
  });

  it('create sends POST with name', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 't1' }) });
    await teamsApi.create('token', { name: 'Test Team' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams'), expect.objectContaining({ method: 'POST' }));
  });

  it('getDetail calls /teams/{id}', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 't1' }) });
    await teamsApi.getDetail('token', 't1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/t1'), expect.anything());
  });

  it('update sends PATCH', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 't1' }) });
    await teamsApi.update('token', 't1', { name: 'New Name' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/t1'), expect.objectContaining({ method: 'PATCH' }));
  });

  it('inviteMember sends POST to invite endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await teamsApi.inviteMember('token', 't1', { email: 'new@test.com', role: 'member' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/t1/invite'), expect.objectContaining({ method: 'POST' }));
  });

  it('removeMember sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await teamsApi.removeMember('token', 't1', 'm1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/t1/members/m1'), expect.objectContaining({ method: 'DELETE' }));
  });

  it('updateRole sends PUT with role', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await teamsApi.updateRole('token', 't1', 'm1', 'admin');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/t1/members/m1/role'), expect.objectContaining({ method: 'PUT' }));
  });

  it('delete sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ deleted: true }) });
    await teamsApi.delete('token', 't1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/t1'), expect.objectContaining({ method: 'DELETE' }));
  });

  it('leave sends POST to leave endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ left: true }) });
    await teamsApi.leave('token', 't1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/teams/t1/leave'), expect.objectContaining({ method: 'POST' }));
  });
});

describe('notificationsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls /notifications', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ notifications: [], total: 0 }) });
    await notificationsApi.list('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/notifications'), expect.anything());
  });

  it('getUnreadCount calls /notifications/unread-count', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ count: 5 }) });
    await notificationsApi.getUnreadCount('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/notifications/unread-count'), expect.anything());
  });

  it('markAsRead sends PUT', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await notificationsApi.markAsRead('token', 'n1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/notifications/n1/read'), expect.objectContaining({ method: 'PUT' }));
  });

  it('markAllAsRead sends PUT', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await notificationsApi.markAllAsRead('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/notifications/read-all'), expect.objectContaining({ method: 'PUT' }));
  });

  it('deleteNotification sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await notificationsApi.deleteNotification('token', 'n1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/notifications/n1'), expect.objectContaining({ method: 'DELETE' }));
  });
});

describe('alertsApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls /alerts', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });
    await alertsApi.list('token');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/alerts'), expect.anything());
  });

  it('create sends POST', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'a1' }) });
    await alertsApi.create('token', { name: 'Test Alert', condition: 'failure_rate', threshold: 10, channels: ['email'] });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/alerts'), expect.objectContaining({ method: 'POST' }));
  });

  it('update sends PUT', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'a1' }) });
    await alertsApi.update('token', 'a1', { threshold: 20 });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/alerts/a1'), expect.objectContaining({ method: 'PUT' }));
  });

  it('delete sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    await alertsApi.delete('token', 'a1');
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/alerts/a1'), expect.objectContaining({ method: 'DELETE' }));
  });
});
