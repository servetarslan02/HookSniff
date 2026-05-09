// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockNotificationsList = vi.fn().mockResolvedValue({
  notifications: [
    { id: 'n1', type: 'webhook_failed', title: 'Test notification', message: 'Test message', read: false, created_at: '2024-01-01' },
  ],
  total: 1,
  page: 1,
  per_page: 20,
});

vi.mock('@/lib/api', () => ({
  notificationsApi: {
    list: mockNotificationsList,
    markAsRead: vi.fn().mockResolvedValue({}),
    markAllAsRead: vi.fn().mockResolvedValue({}),
    deleteNotification: vi.fn().mockResolvedValue({}),
    getUnreadCount: vi.fn().mockResolvedValue({ count: 1 }),
  },
}));

const { default: NotificationsPage } = await import('@/app/[locale]/dashboard/notifications/page');

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationsList.mockResolvedValue({
      notifications: [
        { id: 'n1', type: 'webhook_failed', title: 'Test notification', message: 'Test message', read: false, created_at: '2024-01-01' },
      ],
      total: 1,
      page: 1,
      per_page: 20,
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(NotificationsPage));
    });
  });

  it('fetches notifications on mount', async () => {
    await act(async () => {
      render(React.createElement(NotificationsPage));
    });
    expect(mockNotificationsList).toHaveBeenCalledWith('test-token', expect.anything());
  });

  it('displays notifications title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(NotificationsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('notifications.title');
  });

  it('shows empty state when no notifications', async () => {
    mockNotificationsList.mockResolvedValueOnce({ notifications: [], total: 0, page: 1, per_page: 20 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(NotificationsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('notifications.noNotifications');
  });

  it('renders filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(NotificationsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('All');
    expect(container!.textContent).toContain('Webhook Failed');
    expect(container!.textContent).toContain('Alerts');
  });
});
