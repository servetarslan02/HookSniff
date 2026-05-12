// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

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

const mockList = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockDeleteNotification = vi.fn();

vi.mock('@/lib/api', () => ({
  notificationsApi: {
    list: (...args: unknown[]) => mockList(...args),
    markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
    markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
    deleteNotification: (...args: unknown[]) => mockDeleteNotification(...args),
  },
}));

const { default: NotificationsPage } = await import('@/app/[locale]/[username]/notifications/page');

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'webhook_failed', title: 'Webhook Failed', message: 'Delivery to endpoint failed', read: false, created_at: '2024-06-01T10:00:00Z' },
  { id: 'n2', type: 'alert', title: 'Rate Limit Alert', message: 'Endpoint hitting rate limits', read: true, created_at: '2024-06-01T11:00:00Z' },
  { id: 'n3', type: 'system', title: 'System Update', message: 'New features available', read: false, created_at: '2024-06-01T12:00:00Z' },
  { id: 'n4', type: 'billing', title: 'Invoice Ready', message: 'Your invoice is ready', read: true, created_at: '2024-06-01T13:00:00Z' },
];

describe('NotificationsPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockList.mockResolvedValue({ notifications: MOCK_NOTIFICATIONS, total: 4 });
    mockMarkAsRead.mockResolvedValue({});
    mockMarkAllAsRead.mockResolvedValue({});
    mockDeleteNotification.mockResolvedValue({});
  });

  // === Initial State ===
  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('notifications.title');
    });
  });

  it('renders subtitle text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Stay updated on webhook events');
    });
  });

  it('renders Mark all as read button', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Mark all as read');
      expect(btn).toBeTruthy();
    });
  });

  // === Loading State ===
  it('shows loading indicator initially', () => {
    mockList.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('Loading notifications');
  });

  // === Empty State ===
  it('shows empty state when no notifications', async () => {
    mockList.mockResolvedValue({ notifications: [], total: 0 });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('notifications.noNotifications');
      expect(container.textContent).toContain('🔔');
    });
  });

  // === Notification List ===
  it('renders all notifications', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Webhook Failed');
      expect(container.textContent).toContain('Rate Limit Alert');
      expect(container.textContent).toContain('System Update');
      expect(container.textContent).toContain('Invoice Ready');
    });
  });

  it('renders notification messages', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Delivery to endpoint failed');
      expect(container.textContent).toContain('Endpoint hitting rate limits');
    });
  });

  it('renders type icons correctly', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('🔴'); // webhook_failed
      expect(container.textContent).toContain('⚠️'); // alert
      expect(container.textContent).toContain('🔔'); // system
      expect(container.textContent).toContain('💳'); // billing
    });
  });

  it('shows unread indicator for unread notifications', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      const dots = container.querySelectorAll('.bg-brand-500.rounded-full');
      expect(dots.length).toBe(2); // n1 and n3 are unread
    });
  });

  it('shows "Mark read" button only for unread notifications', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      const markReadBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Mark read');
      expect(markReadBtns.length).toBe(2); // n1 and n3
    });
  });

  it('shows "Delete" button for all notifications', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      const deleteBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Delete');
      expect(deleteBtns.length).toBe(4);
    });
  });

  it('renders timestamps', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('2024');
    });
  });

  it('renders type badges', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('webhook failed');
      expect(container.textContent).toContain('alert');
      expect(container.textContent).toContain('system');
      expect(container.textContent).toContain('billing');
    });
  });

  // === Type Filters ===
  it('renders type filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('All');
      expect(container.textContent).toContain('Webhook Failed');
      expect(container.textContent).toContain('Alerts');
      expect(container.textContent).toContain('System');
      expect(container.textContent).toContain('Billing');
    });
  });

  it('sends type filter to API', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Alerts');
    });
    const alertBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Alerts');
    await act(async () => {
      fireEvent.click(alertBtn!);
    });
    await waitFor(() => {
      const lastCall = mockList.mock.calls[mockList.mock.calls.length - 1][1];
      expect(lastCall.type).toBe('alert');
    });
  });

  // === Read Filters ===
  it('renders read filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      const btns = Array.from(container.querySelectorAll('button'));
      const texts = btns.map(b => b.textContent);
      expect(texts).toContain('All');
      expect(texts).toContain('Unread');
      expect(texts).toContain('Read');
    });
  });

  it('sends read filter to API', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Unread');
    });
    const unreadBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Unread');
    await act(async () => {
      fireEvent.click(unreadBtn!);
    });
    await waitFor(() => {
      const lastCall = mockList.mock.calls[mockList.mock.calls.length - 1][1];
      expect(lastCall.read).toBe(false);
    });
  });

  // === Actions ===
  it('marks single notification as read', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Mark read');
    });
    const markReadBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Mark read');
    await act(async () => {
      fireEvent.click(markReadBtn!);
    });
    expect(mockMarkAsRead).toHaveBeenCalledWith('test-token', 'n1');
  });

  it('marks all notifications as read', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Mark all as read');
    });
    const markAllBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Mark all as read');
    await act(async () => {
      fireEvent.click(markAllBtn!);
    });
    await waitFor(() => {
      expect(mockMarkAllAsRead).toHaveBeenCalledWith('test-token');
      expect(mockToast).toHaveBeenCalledWith('notifications.allReadSuccess', 'success');
    });
  });

  it('deletes notification on Delete click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Delete');
    });
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'Delete');
    await act(async () => {
      fireEvent.click(deleteBtns[0]);
    });
    await waitFor(() => {
      expect(mockDeleteNotification).toHaveBeenCalledWith('test-token', 'n1');
      expect(mockToast).toHaveBeenCalledWith('Notification deleted', 'success');
    });
  });

  // === Error Handling ===
  it('shows toast on fetch failure', async () => {
    mockList.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(React.createElement(NotificationsPage));
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to load notifications', 'error');
    });
  });

  it('shows toast on mark as read failure', async () => {
    mockMarkAsRead.mockRejectedValue(new Error('Failed'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Mark read');
    });
    const markReadBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Mark read');
    await act(async () => {
      fireEvent.click(markReadBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to mark as read', 'error');
    });
  });

  it('shows toast on mark all as read failure', async () => {
    mockMarkAllAsRead.mockRejectedValue(new Error('Failed'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Mark all as read');
    });
    const markAllBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Mark all as read');
    await act(async () => {
      fireEvent.click(markAllBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to mark all as read', 'error');
    });
  });

  it('shows toast on delete failure', async () => {
    mockDeleteNotification.mockRejectedValue(new Error('Failed'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Delete');
    });
    const deleteBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Delete');
    await act(async () => {
      fireEvent.click(deleteBtn!);
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Failed to delete notification', 'error');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('@/components/Toast', () => ({ useToast: () => ({ toast: mockToast }) }));
    vi.doMock('@/lib/api', () => ({
      notificationsApi: { list: mockList, markAsRead: mockMarkAsRead, markAllAsRead: mockMarkAllAsRead, deleteNotification: mockDeleteNotification },
    }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/notifications/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockList).not.toHaveBeenCalled();
  });

  // === Unread styling ===
  it('applies unread background styling', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(NotificationsPage)).container;
    });
    await waitFor(() => {
      const unreadItems = container.querySelectorAll('.bg-brand-50\\/30, .dark\\:bg-brand-500\\/5');
      expect(unreadItems.length).toBe(2);
    });
  });
});
