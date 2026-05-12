// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const mockNotificationsList = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

vi.mock('@/lib/api', () => ({
  notificationsApi: {
    list: (...args: any[]) => mockNotificationsList(...args),
    markAsRead: (...args: any[]) => mockMarkAsRead(...args),
    markAllAsRead: (...args: any[]) => mockMarkAllAsRead(...args),
    deleteNotification: (...args: any[]) => mockDeleteNotification(...args),
  },
}));

const mockNotifs = [
  { id: 'n1', type: 'webhook_failed', title: 'Webhook failed', message: 'Endpoint returned 500', read: false, created_at: '2024-01-01T10:00:00Z' },
  { id: 'n2', type: 'alert', title: 'Alert triggered', message: 'Failure rate above 10%', read: true, created_at: '2024-01-02T10:00:00Z' },
  { id: 'n3', type: 'system', title: 'System update', message: 'Scheduled maintenance', read: false, created_at: '2024-01-03T10:00:00Z' },
  { id: 'n4', type: 'billing', title: 'Invoice ready', message: 'Your invoice is ready', read: true, created_at: '2024-01-04T10:00:00Z' },
];

const { default: NotificationsPage } = await import('@/app/[locale]/[username]/notifications/page');

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationsList.mockResolvedValue({ notifications: mockNotifs, total: 4 });
    mockMarkAsRead.mockResolvedValue({});
    mockMarkAllAsRead.mockResolvedValue({});
    mockDeleteNotification.mockResolvedValue({});
  });

  it('renders without crashing', async () => {
    await act(async () => { render(React.createElement(NotificationsPage)); });
  });

  it('fetches notifications on mount', async () => {
    await act(async () => { render(React.createElement(NotificationsPage)); });
    expect(mockNotificationsList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 1 }));
  });

  it('displays title', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('notifications.title');
  });

  it('displays notification titles', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('Webhook failed');
    expect(container!.textContent).toContain('Alert triggered');
    expect(container!.textContent).toContain('System update');
  });

  it('displays notification messages', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('Endpoint returned 500');
  });

  it('shows unread indicator for unread notifications', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const unreadDots = container!.querySelectorAll('.bg-brand-500');
    expect(unreadDots.length).toBeGreaterThanOrEqual(2);
  });

  it('shows empty state', async () => {
    mockNotificationsList.mockResolvedValueOnce({ notifications: [], total: 0 });
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('notifications.noNotifications');
  });

  it('shows loading state', () => {
    mockNotificationsList.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('Loading notifications');
  });

  it('renders type filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('All');
    expect(container!.textContent).toContain('Webhook Failed');
    expect(container!.textContent).toContain('Alerts');
    expect(container!.textContent).toContain('System');
    expect(container!.textContent).toContain('Billing');
  });

  it('renders read filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('Unread');
    expect(container!.textContent).toContain('Read');
  });

  it('filters by type when type button clicked', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const alertBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Alerts');
    await act(async () => { fireEvent.click(alertBtn!); });
    expect(mockNotificationsList).toHaveBeenCalledWith('test-token', expect.objectContaining({ type: 'alert' }));
  });

  it('filters by read status', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const unreadBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Unread');
    await act(async () => { fireEvent.click(unreadBtn!); });
    expect(mockNotificationsList).toHaveBeenCalledWith('test-token', expect.objectContaining({ read: false }));
  });

  it('marks single notification as read', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const markReadBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Mark read');
    if (markReadBtn) {
      await act(async () => { fireEvent.click(markReadBtn); });
      expect(mockMarkAsRead).toHaveBeenCalledWith('test-token', 'n1');
    }
  });

  it('marks all notifications as read', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const markAllBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Mark all'));
    await act(async () => { fireEvent.click(markAllBtn!); });
    expect(mockMarkAllAsRead).toHaveBeenCalledWith('test-token');
  });

  it('shows toast after marking all as read', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const markAllBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Mark all'));
    await act(async () => { fireEvent.click(markAllBtn!); });
    expect(mockToast).toHaveBeenCalledWith('notifications.allReadSuccess', 'success');
  });

  it('deletes a notification', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const deleteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Delete');
    if (deleteBtn) {
      await act(async () => { fireEvent.click(deleteBtn); });
      expect(mockDeleteNotification).toHaveBeenCalledWith('test-token', 'n1');
    }
  });

  it('removes deleted notification from list', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('Webhook failed');
    const deleteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Delete');
    if (deleteBtn) {
      await act(async () => { fireEvent.click(deleteBtn); });
      await waitFor(() => { expect(container!.textContent).not.toContain('Webhook failed'); });
    }
  });

  it('shows pagination when total > perPage', async () => {
    mockNotificationsList.mockResolvedValueOnce({ notifications: mockNotifs, total: 50 });
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('Page 1');
    expect(container!.textContent).toContain('Next');
  });

  it('handles fetch error', async () => {
    mockNotificationsList.mockRejectedValueOnce(new Error('Network error'));
    await act(async () => { render(React.createElement(NotificationsPage)); });
    expect(mockToast).toHaveBeenCalledWith('Failed to load notifications', 'error');
  });

  it('handles mark as read error', async () => {
    mockMarkAsRead.mockRejectedValueOnce(new Error('API error'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const markReadBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Mark read');
    if (markReadBtn) {
      await act(async () => { fireEvent.click(markReadBtn); });
      expect(mockToast).toHaveBeenCalledWith('Failed to mark as read', 'error');
    }
  });

  it('handles delete error', async () => {
    mockDeleteNotification.mockRejectedValueOnce(new Error('API error'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const deleteBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Delete');
    if (deleteBtn) {
      await act(async () => { fireEvent.click(deleteBtn); });
      expect(mockToast).toHaveBeenCalledWith('Failed to delete notification', 'error');
    }
  });

  it('renders Mark all as read button', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('Mark all'));
    expect(btn).toBeTruthy();
  });

  it('displays notification type badges', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(NotificationsPage)).container; });
    expect(container!.textContent).toContain('webhook failed');
    expect(container!.textContent).toContain('alert');
    expect(container!.textContent).toContain('system');
  });
});
