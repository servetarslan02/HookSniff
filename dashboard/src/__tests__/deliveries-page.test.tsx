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
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { name: 'Test', email: 'test@test.com', plan: 'free' }, apiKey: 'sk_test_123', logout: vi.fn() }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

// Mock ConfirmDialog to render its content when open
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

const { default: DeliveriesPage } = await import('@/app/[locale]/[username]/deliveries/page');

const MOCK_DELIVERIES = [
  { id: 'd123456789012', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01T10:00:00Z', response_status: 200 },
  { id: 'd223456789012', endpoint_id: 'ep2', event: 'payment.failed', status: 'failed', attempt_count: 3, created_at: '2024-01-02T11:00:00Z', response_status: 500 },
  { id: 'd323456789012', endpoint_id: 'ep1', event: 'user.registered', status: 'pending', attempt_count: 0, created_at: '2024-01-03T12:00:00Z' },
];

const MOCK_PAGED_RESPONSE = {
  deliveries: MOCK_DELIVERIES,
  total: 3,
  page: 1,
  per_page: 20,
};

const MOCK_LARGE_RESPONSE = {
  deliveries: Array.from({ length: 20 }, (_, i) => ({
    id: `d${String(i).padStart(11, '0')}`,
    endpoint_id: 'ep1',
    event: 'order.created',
    status: 'delivered',
    attempt_count: 1,
    created_at: '2024-01-01T10:00:00Z',
    response_status: 200,
  })),
  total: 45,
  page: 1,
  per_page: 20,
};

describe('DeliveriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhooksList.mockResolvedValue(MOCK_PAGED_RESPONSE);
    mockWebhooksReplay.mockResolvedValue({});
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(DeliveriesPage));
    });
  });

  it('fetches deliveries on mount', async () => {
    await act(async () => {
      render(React.createElement(DeliveriesPage));
    });
    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 1 }));
  });

  it('displays deliveries title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('deliveries.title');
  });

  it('displays delivery data in table', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('order.created');
      expect(container!.textContent).toContain('payment.failed');
      expect(container!.textContent).toContain('user.registered');
    });
  });

  it('shows status badges for each delivery', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const badges = container!.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBe(3);
      expect(badges[0].textContent).toBe('delivered');
      expect(badges[1].textContent).toBe('failed');
      expect(badges[2].textContent).toBe('pending');
    });
  });

  it('displays attempt counts', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('1'); // attempt_count
      expect(container!.textContent).toContain('3');
    });
  });

  it('displays response status codes', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('200');
      expect(container!.textContent).toContain('500');
    });
  });

  it('shows empty state when no deliveries', async () => {
    mockWebhooksList.mockResolvedValueOnce({ deliveries: [], total: 0, page: 1, per_page: 20 });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('deliveries.empty');
    });
  });

  it('shows loading state', async () => {
    mockWebhooksList.mockReturnValueOnce(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('deliveries.loadingDeliveries');
  });

  it('renders filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('All');
    expect(container!.textContent).toContain('Delivered');
    expect(container!.textContent).toContain('Failed');
    expect(container!.textContent).toContain('Pending');
  });

  it('changes filter and refetches', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const failedBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent === 'Failed'
    );
    await act(async () => {
      fireEvent.click(failedBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({
        page: 1,
        status: 'failed',
      }));
    });
  });

  it('highlights active filter button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const allBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent === 'All'
    );
    expect(allBtn!.className).toContain('bg-gray-900');
  });

  it('resets page to 1 when filter changes', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    // Change filter
    const deliveredBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent === 'Delivered'
    );
    await act(async () => {
      fireEvent.click(deliveredBtn!);
    });
    await waitFor(() => {
      const lastCall = mockWebhooksList.mock.calls[mockWebhooksList.mock.calls.length - 1];
      expect(lastCall[1].page).toBe(1);
      expect(lastCall[1].status).toBe('delivered');
    });
  });

  it('renders search input', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"]');
    expect(searchInput).toBeTruthy();
  });

  it('filters deliveries by search term', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('order.created');
    });
    const searchInput = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'payment' } });
    });
    // Should filter client-side: only payment.failed visible
    expect(container!.textContent).toContain('payment.failed');
    expect(container!.textContent).not.toContain('order.created');
  });

  it('filters deliveries by event id', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('order.created');
    });
    const searchInput = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'd123456789012' } });
    });
    expect(container!.textContent).toContain('order.created');
  });

  it('shows pagination when total exceeds per_page', async () => {
    mockWebhooksList.mockResolvedValueOnce(MOCK_LARGE_RESPONSE);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Showing');
      expect(container!.textContent).toContain('of 45');
      expect(container!.textContent).toContain('Previous');
      expect(container!.textContent).toContain('Next');
    });
  });

  it('navigates to next page', async () => {
    mockWebhooksList.mockResolvedValueOnce(MOCK_LARGE_RESPONSE);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const nextBtn = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Next'
      );
      expect(nextBtn).toBeTruthy();
    });
    const nextBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent === 'Next'
    );
    await act(async () => {
      fireEvent.click(nextBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 2 }));
    });
  });

  it('navigates to previous page', async () => {
    // Start on page 2
    mockWebhooksList.mockResolvedValueOnce({
      ...MOCK_LARGE_RESPONSE,
      page: 2,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const prevBtn = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Previous'
      );
      expect(prevBtn).toBeTruthy();
    });
    // Reset mock for page 1 call
    mockWebhooksList.mockResolvedValueOnce(MOCK_LARGE_RESPONSE);
    const prevBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent === 'Previous'
    );
    await act(async () => {
      fireEvent.click(prevBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 1 }));
    });
  });

  it('disables previous button on first page', async () => {
    mockWebhooksList.mockResolvedValueOnce(MOCK_LARGE_RESPONSE);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const prevBtn = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Previous'
      );
      expect(prevBtn).toHaveProperty('disabled', true);
    });
  });

  it('disables next button on last page', async () => {
    // total=25, per_page=20 → 2 pages. Navigate to page 2 then check next is disabled.
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_LARGE_RESPONSE.deliveries.slice(0, 5),
      total: 25,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const nextBtn = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Next'
      );
      expect(nextBtn).toBeTruthy();
    });
    // Navigate to page 2
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_LARGE_RESPONSE.deliveries.slice(0, 5),
      total: 25,
      page: 2,
      per_page: 20,
    });
    const nextBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent === 'Next'
    );
    await act(async () => {
      fireEvent.click(nextBtn!);
    });
    await waitFor(() => {
      // On page 2 of 2, next should be disabled
      const nextBtnAfter = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Next'
      );
      expect(nextBtnAfter).toHaveProperty('disabled', true);
    });
  });

  it('hides pagination when total <= per_page', async () => {
    // Override the default mock to return total=5 (less than per_page=20)
    mockWebhooksList.mockReset();
    mockWebhooksList.mockResolvedValue({
      deliveries: MOCK_DELIVERIES.slice(0, 3),
      total: 5,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      // Pagination should NOT render when total <= perPage (20)
      expect(container!.textContent).not.toContain('Previous');
      expect(container!.textContent).not.toContain('Next');
    });
  });

  it('shows View Details button for each delivery', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const viewBtns = Array.from(container!.querySelectorAll('button')).filter(
        b => b.textContent === 'View Details'
      );
      expect(viewBtns.length).toBe(3);
    });
  });

  it('displays event tags', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const eventTags = container!.querySelectorAll('span.font-mono');
      const eventTexts = Array.from(eventTags).map(e => e.textContent);
      expect(eventTexts).toContain('order.created');
    });
  });

  it('displays truncated delivery IDs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      // IDs should be truncated with …
      expect(container!.textContent).toContain('…');
    });
  });

  it('handles fetch error', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Network error');
      expect(container!.textContent).toContain('Retry');
    });
  });

  it('retries on error', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const retryBtn = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Retry'
      );
      expect(retryBtn).toBeTruthy();
    });
    // Mock success for retry
    mockWebhooksList.mockResolvedValueOnce(MOCK_PAGED_RESPONSE);
    const retryBtn = Array.from(container!.querySelectorAll('button')).find(
      b => b.textContent === 'Retry'
    );
    await act(async () => {
      fireEvent.click(retryBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(2);
    });
  });

  it('displays green status for 2xx response', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const responseSpans = container!.querySelectorAll('.text-green-600');
      expect(responseSpans.length).toBeGreaterThanOrEqual(1);
      expect(responseSpans[0].textContent).toBe('200');
    });
  });

  it('displays red status for 5xx response', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const responseSpans = container!.querySelectorAll('.text-red-600');
      expect(responseSpans.length).toBeGreaterThanOrEqual(1);
      expect(responseSpans[0].textContent).toBe('500');
    });
  });

  it('renders table headers', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const headers = container!.querySelectorAll('th');
      expect(headers.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('shows dash for missing response_status', async () => {
    // d323456789012 has no response_status
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const dashes = container!.querySelectorAll('.text-gray-400');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays formatted timestamps', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      // Dates should be formatted
      expect(container!.textContent).toContain('2024');
    });
  });

  it('sends filter=all by default (no status param)', async () => {
    await act(async () => {
      render(React.createElement(DeliveriesPage));
    });
    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({
      page: 1,
      status: undefined,
    }));
  });

  it('renders subtitle text', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('deliveries.subtitle');
  });

  it('renders search placeholder', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const searchInput = container!.querySelector('input[type="text"]')!;
    expect(searchInput.getAttribute('placeholder')).toBe('deliveries.searchPlaceholder');
  });
});
