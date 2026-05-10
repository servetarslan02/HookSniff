// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

// ─── Mocks ───
const mockPush = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', plan: 'pro' },
  }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/ConfirmDialog', () => ({
  default: ({ open, title, message, confirmLabel, onConfirm, onCancel, loading }: any) => {
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'confirm-dialog' },
      React.createElement('span', null, title),
      React.createElement('span', null, message),
      React.createElement('button', { onClick: onConfirm, disabled: loading }, confirmLabel),
      React.createElement('button', { onClick: onCancel }, 'Cancel'),
    );
  },
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) =>
    React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

const mockWebhooksList = vi.fn();
const mockWebhooksReplay = vi.fn();

vi.mock('@/lib/api', () => ({
  webhooksApi: {
    list: mockWebhooksList,
    replay: mockWebhooksReplay,
  },
}));

const { default: DeliveriesPage } = await import('@/app/[locale]/dashboard/deliveries/page');

const MOCK_DELIVERIES = [
  { id: 'd123456789012', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01T10:00:00Z', response_status: 200 },
  { id: 'd223456789012', endpoint_id: 'ep2', event: 'payment.failed', status: 'failed', attempt_count: 3, created_at: '2024-01-02T11:00:00Z', response_status: 500 },
  { id: 'd323456789012', endpoint_id: 'ep1', event: 'user.registered', status: 'pending', attempt_count: 0, created_at: '2024-01-03T12:00:00Z' },
  { id: 'd423456789012', endpoint_id: 'ep3', event: 'invoice.paid', status: 'delivered', attempt_count: 2, created_at: '2024-01-04T13:00:00Z', response_status: 201 },
  { id: 'd523456789012', endpoint_id: 'ep2', event: 'order.cancelled', status: 'failed', attempt_count: 1, created_at: '2024-01-05T14:00:00Z', response_status: 400 },
];

const MOCK_PAGED = {
  deliveries: MOCK_DELIVERIES,
  total: MOCK_DELIVERIES.length,
  page: 1,
  per_page: 20,
};

describe('DeliveriesPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhooksList.mockResolvedValue(MOCK_PAGED);
    mockWebhooksReplay.mockResolvedValue({});
  });

  // === Detail Modal ===
  it('does not show modal initially', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('tbody tr').length).toBe(5);
    });
    // Modal should not be visible
    expect(container!.querySelector('.fixed.inset-0.z-50')).toBeNull();
  });

  // === Replay ===
  it('confirm dialog is not visible initially', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });
    // Confirm dialog should not be visible initially
    expect(container!.querySelectorAll('[data-testid="confirm-dialog"]').length).toBe(0);
  });

  // === Response Status Colors ===
  it('renders green text for 2xx response codes', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      const greenCodes = container!.querySelectorAll('.text-green-600');
      expect(greenCodes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders red text for 4xx/5xx response codes', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      const redCodes = container!.querySelectorAll('.text-red-600');
      expect(redCodes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows dash for missing response_status', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      const dashes = container!.querySelectorAll('.text-gray-400');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({
      useAuth: () => ({ token: null, user: null }),
    }));
    vi.doMock('next-intl', () => ({
      useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
    }));
    vi.doMock('@/i18n/navigation', () => ({
      useRouter: () => ({ push: mockPush }),
      Link: ({ children, ...props }: any) => React.createElement('a', props, children),
    }));
    vi.doMock('@/lib/errors', () => ({
      getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
    }));
    vi.doMock('@/lib/api', () => ({
      webhooksApi: {
        list: mockWebhooksList,
        replay: mockWebhooksReplay,
      },
    }));
    vi.doMock('@/components/StatusBadge', () => ({
      StatusBadge: ({ status }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
    }));
    vi.doMock('@/components/Toast', () => ({
      useToast: () => ({ toast: mockToast }),
    }));
    vi.doMock('@/components/ConfirmDialog', () => ({
      default: () => null,
    }));

    const { default: PageNoToken } = await import('@/app/[locale]/dashboard/deliveries/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockWebhooksList).not.toHaveBeenCalled();
  });

  // === Multiple pages of deliveries ===
  it('handles empty deliveries list', async () => {
    mockWebhooksList.mockResolvedValueOnce({ deliveries: [], total: 0, page: 1, per_page: 20 });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('deliveries.empty');
    });
  });

  it('handles API error on fetch', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Timeout'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Timeout');
      expect(container!.textContent).toContain('Retry');
    });
  });

  it('retries on Retry button click', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Retry');
    });
    mockWebhooksList.mockResolvedValueOnce(MOCK_PAGED);
    const retryBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Retry');
    await act(async () => {
      fireEvent.click(retryBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(2);
    });
  });

  // === Search edge cases ===
  it('search filters by partial event name', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('tbody tr').length).toBe(5);
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await waitFor(() => {
      const rows = container!.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2); // order.created and order.cancelled
    });
  });

  it('search is case insensitive', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'PAYMENT' } });
    });
    await waitFor(() => {
      const rows = container!.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(container!.textContent).toContain('payment.failed');
    });
  });

  // === Pagination edge cases ===
  it('shows pagination info with correct range', async () => {
    mockWebhooksList.mockResolvedValue({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Showing 1–20 of 45');
      expect(container!.textContent).toContain('Page 1 of 3');
    });
  });

  it('disables Previous on first page', async () => {
    mockWebhooksList.mockResolvedValue({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      const prevBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'Previous');
      expect(prevBtn).toHaveProperty('disabled', true);
    });
  });

  // === View Details button ===
  it('View Details button navigates to delivery detail', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });
    const viewBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'View Details');
    expect(viewBtn).toBeTruthy();
    await act(async () => {
      fireEvent.click(viewBtn!);
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/deliveries/d123456789012');
  });

  // === Subtitle ===
  it('renders subtitle text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    expect(container!.textContent).toContain('deliveries.subtitle');
  });

  // === Search placeholder ===
  it('has correct search placeholder', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    const input = container!.querySelector('input[type="text"]');
    expect(input!.getAttribute('placeholder')).toBe('deliveries.searchPlaceholder');
  });

  // === Filter button styling ===
  it('All filter has active styling by default', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    const allBtn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent === 'All');
    expect(allBtn!.className).toContain('bg-gray-900');
  });

  // === Loading state ===
  it('shows loading indicator initially', async () => {
    mockWebhooksList.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    expect(container!.textContent).toContain('deliveries.loadingDeliveries');
  });

  // === Event display ===
  it('shows dash for deliveries without event', async () => {
    mockWebhooksList.mockResolvedValue({
      deliveries: [{ ...MOCK_DELIVERIES[0], event: null }],
      total: 1,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(DeliveriesPage)).container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('—');
    });
  });
});
