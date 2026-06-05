// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual };
});

// Mock the apiFetch function
const mockApiFetch = vi.fn();
vi.mock('@/lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
}));

import { notificationsApi, broadcastsApi, teamsApi } from '@/lib/api-teams';

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({});
  });

  describe('list', () => {
    it('calls correct URL with no params', () => {
      notificationsApi.list('tok1');
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications', { token: 'tok1' });
    });

    it('appends page param', () => {
      notificationsApi.list('tok1', { page: 2 });
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications?page=2', { token: 'tok1' });
    });

    it('appends type param', () => {
      notificationsApi.list('tok1', { type: 'alert' });
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications?type=alert', { token: 'tok1' });
    });

    it('appends read=false param', () => {
      notificationsApi.list('tok1', { read: false });
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications?read=false', { token: 'tok1' });
    });

    it('appends multiple params', () => {
      notificationsApi.list('tok1', { page: 1, type: 'billing', read: true });
      const call = mockApiFetch.mock.calls[0][0];
      expect(call).toContain('page=1');
      expect(call).toContain('type=billing');
      expect(call).toContain('read=true');
    });
  });

  describe('getUnreadCount', () => {
    it('calls correct URL', () => {
      notificationsApi.getUnreadCount('tok1');
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications/unread-count', { token: 'tok1' });
    });
  });

  describe('markAsRead', () => {
    it('sends PUT with body {}', () => {
      notificationsApi.markAsRead('tok1', 'n123');
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications/n123/read', {
        method: 'PUT',
        token: 'tok1',
        body: {},
      });
    });
  });

  describe('markAllAsRead', () => {
    it('sends PUT to read-all', () => {
      notificationsApi.markAllAsRead('tok1');
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications/read-all', {
        method: 'PUT',
        token: 'tok1',
        body: {},
      });
    });
  });

  describe('deleteNotification', () => {
    it('sends DELETE with correct id', () => {
      notificationsApi.deleteNotification('tok1', 'n456');
      expect(mockApiFetch).toHaveBeenCalledWith('/notifications/n456', {
        method: 'DELETE',
        token: 'tok1',
      });
    });
  });
});

describe('broadcastsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({});
  });

  it('listActive without dismissed', () => {
    broadcastsApi.listActive('tok1');
    expect(mockApiFetch).toHaveBeenCalledWith('/broadcasts', { token: 'tok1' });
  });

  it('listActive with dismissed', () => {
    broadcastsApi.listActive('tok1', true);
    expect(mockApiFetch).toHaveBeenCalledWith('/broadcasts?include_dismissed=true', { token: 'tok1' });
  });

  it('dismiss sends POST', () => {
    broadcastsApi.dismiss('tok1', 'b1');
    expect(mockApiFetch).toHaveBeenCalledWith('/broadcasts/b1/dismiss', {
      method: 'POST',
      token: 'tok1',
    });
  });
});
