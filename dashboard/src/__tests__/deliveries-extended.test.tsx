// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockPush = vi.fn();
const mockWebhooksList = vi.fn();
const mockWebhooksReplay = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string, params?: any) => {
    if (params) return `${ns}.${key}:${JSON.stringify(params)}`;
    return ns ? `${ns}.${key}` : key;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    list: (...args: any[]) => mockWebhooksList(...args),
    replay: (...args: any[]) => mockWebhooksReplay(...args),
  },
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, onConfirm, onCancel }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('button', { onClick: onConfirm }, 'Confirm'),
      React.createElement('button', { onClick: onCancel }, 'Cancel')
    ) : null,
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status, size }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: DeliveriesPage } = await import('@/app/[locale]/dashboard/deliveries/page');

const mockDeliveries = {
  deliveries: [
    { id: 'del_001', event: 'order.created', status: 'delivered', attempt_count: 1, response_status: 200, endpoint_id: 'ep1', created_at: '2024-06-01T10:00:00Z' },
    { id: 'del_002', event: 'payment.completed', status: 'failed', attempt_count: 3, response_status: 500, endpoint_id: 'ep2', created_at: '2024-06-01T11:00:00Z' },
    { id: 'del_003', event: 'user.created', status: 'pending', attempt_count: 0, response_status: null, endpoint_id: 'ep1', created_at: '2024-06-01T12:00:00Z' },
  ],
  total: 3,
};

describe('DeliveriesPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhooksList.mockResolvedValue(mockDeliveries);
    mockWebhooksReplay.mockResolvedValue({});
  });

  // === Render ===
  it('renders without crashing', () => {
    render(React.createElement(DeliveriesPage));
  });

  it('displays title', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('deliveries.title');
    });
  });

  it('displays subtitle', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('deliveries.subtitle');
    });
  });

  // === Filter buttons ===
  it('renders filter buttons', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('All');
      expect(container.textContent).toContain('Delivered');
      expect(container.textContent).toContain('Failed');
      expect(container.textContent).toContain('Pending');
    });
  });

  it('filters by status on click', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Delivered');
    });

    const failedButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Failed')
    );

    await act(async () => {
      fireEvent.click(failedButton!);
    });

    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', {
      page: 1,
      status: 'failed',
    });
  });

  it('resets page to 1 when filter changes', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('All');
    });

    const pendingButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Pending')
    );

    await act(async () => {
      fireEvent.click(pendingButton!);
    });

    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', {
      page: 1,
      status: 'pending',
    });
  });

  // === Table ===
  it('renders delivery rows', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
      expect(container.textContent).toContain('order.created');
    });
  });

  it('renders event badges', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('payment.completed');
    });
  });

  it('renders status badges', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('renders attempt count', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('3'); // attempt_count for del_002
    });
  });

  it('renders response status codes', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('200');
      expect(container.textContent).toContain('500');
    });
  });

  it('renders timestamps', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      // Should contain formatted date
      expect(container.textContent).toContain('2024');
    });
  });

  // === Search ===
  it('renders search input', () => {
    const { container } = render(React.createElement(DeliveriesPage));
    const searchInput = container.querySelector('input[type="text"]');
    expect(searchInput).toBeTruthy();
  });

  it('filters by search term', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'payment' } });
    });

    // Should filter client-side
    await waitFor(() => {
      expect(container.textContent).toContain('payment.completed');
    });
  });

  // === Error state ===
  it('shows error state on fetch failure', async () => {
    mockWebhooksList.mockRejectedValue(new Error('Network error'));
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Network error');
    });
  });

  it('renders retry button on error', async () => {
    mockWebhooksList.mockRejectedValue(new Error('Fail'));
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Retry');
    });
  });

  // === Loading state ===
  it('shows loading state', () => {
    mockWebhooksList.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(DeliveriesPage));
    expect(container.textContent).toContain('deliveries.loadingDeliveries');
  });

  // === Empty state ===
  it('shows empty state', async () => {
    mockWebhooksList.mockResolvedValue({ deliveries: [], total: 0 });
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('deliveries.empty');
    });
  });

  // === Row click navigates ===
  it('navigates to delivery detail on row click', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard/deliveries/del_001');
  });

  // === View Details button ===
  it('renders View Details button for each row', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      const viewButtons = Array.from(container.querySelectorAll('button')).filter(
        (b) => b.textContent?.includes('View Details')
      );
      expect(viewButtons.length).toBe(3);
    });
  });

  // === Search empty results ===
  it('shows no results message for search with no matches', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'nonexistent_xyz' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('No results matching');
    });
  });

  // === All filter sends no status ===
  it('sends no status for All filter', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      expect(container.textContent).toContain('All');
    });

    const allButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('All')
    );

    await act(async () => {
      fireEvent.click(allButton!);
    });

    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', {
      page: 1,
      status: undefined,
    });
  });

  // === Green response status ===
  it('renders green color for 2xx status', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      const greenStatus = container.querySelector('.text-green-600');
      expect(greenStatus).toBeTruthy();
    });
  });

  // === Red response status ===
  it('renders red color for 5xx status', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      const redStatus = container.querySelector('.text-red-600');
      expect(redStatus).toBeTruthy();
    });
  });

  // === Dash for null response status ===
  it('renders dash for null response status', async () => {
    const { container } = render(React.createElement(DeliveriesPage));
    await waitFor(() => {
      // del_003 has null response_status
      const dashes = container.querySelectorAll('.text-gray-400');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });
});
