// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

const mockToast = vi.fn();
const mockPush = vi.fn();

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'webhook_failed',
    title: 'Webhook delivery failed',
    message: 'Failed to deliver to https://example.com/hook',
    read: false,
    link: '/deliveries/del-123',
    created_at: new Date(Date.now() - 300_000).toISOString(), // 5 min ago
  },
  {
    id: 'notif-2',
    type: 'alert',
    title: 'High failure rate detected',
    message: 'Failure rate exceeded 5% threshold',
    read: true,
    link: null,
    created_at: new Date(Date.now() - 3_600_000).toISOString(), // 1 hour ago
  },
  {
    id: 'notif-3',
    type: 'system',
    title: 'System maintenance scheduled',
    message: 'Maintenance window: Sunday 2am-4am UTC',
    read: false,
    link: null,
    created_at: new Date(Date.now() - 86_400_000).toISOString(), // 1 day ago
  },
];

const mockMutateAsync = vi.fn().mockResolvedValue({});
const mockRefetch = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (params) return `${key}:${JSON.stringify(params)}`;
    return key;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/en/notifications',
  Link: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/hooks/useDashboardData', () => ({
  useNotifications: vi.fn().mockImplementation(() => ({
    data: {
      notifications: MOCK_NOTIFICATIONS,
      total: 3,
      unread_count: 2,
      page: 1,
      per_page: 20,
    },
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
  useMarkNotificationAsRead: vi.fn().mockImplementation(() => ({
    mutateAsync: mockMutateAsync,
  })),
  useMarkAllNotificationsAsRead: vi.fn().mockImplementation(() => ({
    mutateAsync: mockMutateAsync,
  })),
  useDeleteNotification: vi.fn().mockImplementation(() => ({
    mutateAsync: mockMutateAsync,
  })),
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, message, onConfirm, onCancel }: any) =>
    open
      ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
          React.createElement('h3', null, title),
          React.createElement('p', null, message),
          React.createElement('button', { onClick: onConfirm }, 'Confirm'),
          React.createElement('button', { onClick: onCancel }, 'Cancel'),
        )
      : null,
}));

const { default: NotificationsPage } = await import('@/app/[locale]/(dashboard)/notifications/page');

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(React.createElement(NotificationsPage));
    expect(container).toBeTruthy();
  });

  it('renders page title', () => {
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('title');
  });

  it('renders all notification items', () => {
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('Webhook delivery failed');
    expect(container.textContent).toContain('High failure rate detected');
    expect(container.textContent).toContain('System maintenance scheduled');
  });

  it('shows unread badge indicator', () => {
    const { container } = render(React.createElement(NotificationsPage));
    const dots = container.querySelectorAll('.bg-brand-500');
    expect(dots.length).toBeGreaterThanOrEqual(2); // 2 unread notifications
  });

  it('shows unread count in header', () => {
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('2');
  });

  it('shows mark all read button when unread exist', () => {
    const { container } = render(React.createElement(NotificationsPage));
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('markAllRead'));
    expect(btn).toBeTruthy();
  });

  it('shows mark read button only for unread notifications', () => {
    const { container } = render(React.createElement(NotificationsPage));
    const markReadBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'markRead');
    expect(markReadBtns.length).toBe(2); // 2 unread
  });

  it('shows delete button for each notification', () => {
    const { container } = render(React.createElement(NotificationsPage));
    const deleteBtns = Array.from(container.querySelectorAll('button')).filter(b => b.textContent === 'delete');
    expect(deleteBtns.length).toBe(3);
  });

  it('shows type filter buttons', () => {
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('all');
    expect(container.textContent).toContain('webhookFailed');
    expect(container.textContent).toContain('alerts');
    expect(container.textContent).toContain('system');
    expect(container.textContent).toContain('billing');
  });

  it('shows read/unread filter buttons', () => {
    const { container } = render(React.createElement(NotificationsPage));
    const allBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'all');
    const unreadBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'unread');
    const readBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'read');
    expect(allBtn).toBeTruthy();
    expect(unreadBtn).toBeTruthy();
    expect(readBtn).toBeTruthy();
  });

  it('shows relative time', () => {
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('5m ago');
    expect(container.textContent).toContain('1h ago');
    expect(container.textContent).toContain('1d ago');
  });

  it('shows formatted type badge', () => {
    const { container } = render(React.createElement(NotificationsPage));
    expect(container.textContent).toContain('Webhook Failed');
    expect(container.textContent).toContain('Alert');
    expect(container.textContent).toContain('System');
  });

  it('shows view details link for notifications with link', () => {
    const { container } = render(React.createElement(NotificationsPage));
    const links = container.querySelectorAll('a[href="/deliveries/del-123"]');
    expect(links.length).toBe(1);
  });

  it('does not show view details for notifications without link', () => {
    const { container } = render(React.createElement(NotificationsPage));
    // The alert and system notifications have no link
    const viewDetailsLinks = Array.from(container.querySelectorAll('a')).filter(a => a.textContent?.includes('viewDetails'));
    expect(viewDetailsLinks.length).toBe(1); // only webhook_failed has link
  });

  it('opens delete confirmation dialog', () => {
    const { container } = render(React.createElement(NotificationsPage));
    const deleteBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'delete')!;
    fireEvent.click(deleteBtn);
    expect(container.textContent).toContain('deleteNotification');
    expect(container.textContent).toContain('deleteConfirm');
  });

  it('calls delete mutation on confirm', async () => {
    const { container } = render(React.createElement(NotificationsPage));
    const deleteBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'delete')!;
    fireEvent.click(deleteBtn);
    const confirmBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Confirm')!;
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  it('calls mark as read on click', async () => {
    const { container } = render(React.createElement(NotificationsPage));
    const markReadBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'markRead')!;
    fireEvent.click(markReadBtn);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('notif-1');
    });
  });

  it('calls mark all as read', async () => {
    const { container } = render(React.createElement(NotificationsPage));
    const markAllBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('markAllRead'))!;
    fireEvent.click(markAllBtn);
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith('allReadSuccess', 'success');
    });
  });
});
