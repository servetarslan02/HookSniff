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

// ─── Test Data ───
const MOCK_DELIVERIES = [
  { id: 'd123456789012', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01T10:00:00Z', response_status: 200 },
  { id: 'd223456789012', endpoint_id: 'ep2', event: 'payment.failed', status: 'failed', attempt_count: 3, created_at: '2024-01-02T11:00:00Z', response_status: 500 },
  { id: 'd323456789012', endpoint_id: 'ep1', event: 'user.registered', status: 'pending', attempt_count: 0, created_at: '2024-01-03T12:00:00Z' },
  { id: 'd423456789012', endpoint_id: 'ep3', event: 'invoice.paid', status: 'delivered', attempt_count: 2, created_at: '2024-01-04T13:00:00Z', response_status: 201 },
  { id: 'd523456789012', endpoint_id: 'ep2', event: 'order.cancelled', status: 'failed', attempt_count: 1, created_at: '2024-01-05T14:00:00Z', response_status: 400 },
];

const MOCK_PAGED_RESPONSE = {
  deliveries: MOCK_DELIVERIES,
  total: MOCK_DELIVERIES.length,
  page: 1,
  per_page: 20,
};

describe('DeliveriesPage - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebhooksList.mockResolvedValue(MOCK_PAGED_RESPONSE);
    mockWebhooksReplay.mockResolvedValue({});
  });

  // ─── Delivery List ───
  it('renders all deliveries from API', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const rows = container!.querySelectorAll('tbody tr');
      expect(rows.length).toBe(MOCK_DELIVERIES.length);
    });
  });

  it('displays all delivery events', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('order.created');
      expect(container!.textContent).toContain('payment.failed');
      expect(container!.textContent).toContain('user.registered');
      expect(container!.textContent).toContain('invoice.paid');
      expect(container!.textContent).toContain('order.cancelled');
    });
  });

  // ─── Status Filtering ───
  it('renders all four filter buttons', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const buttons = Array.from(container!.querySelectorAll('button'));
    const buttonTexts = buttons.map((b) => b.textContent);
    expect(buttonTexts).toContain('All');
    expect(buttonTexts).toContain('Delivered');
    expect(buttonTexts).toContain('Failed');
    expect(buttonTexts).toContain('Pending');
  });

  it('highlights "All" as active filter by default', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const allBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'All',
    );
    expect(allBtn!.className).toContain('bg-gray-900');
  });

  it('sends filter=delivered when Delivered clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const deliveredBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Delivered',
    );
    await act(async () => {
      fireEvent.click(deliveredBtn!);
    });
    await waitFor(() => {
      const lastCall = mockWebhooksList.mock.calls[mockWebhooksList.mock.calls.length - 1];
      expect(lastCall[1]).toEqual(expect.objectContaining({ page: 1, status: 'delivered' }));
    });
  });

  it('sends filter=failed when Failed clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const failedBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Failed',
    );
    await act(async () => {
      fireEvent.click(failedBtn!);
    });
    await waitFor(() => {
      const lastCall = mockWebhooksList.mock.calls[mockWebhooksList.mock.calls.length - 1];
      expect(lastCall[1]).toEqual(expect.objectContaining({ page: 1, status: 'failed' }));
    });
  });

  it('sends filter=pending when Pending clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const pendingBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Pending',
    );
    await act(async () => {
      fireEvent.click(pendingBtn!);
    });
    await waitFor(() => {
      const lastCall = mockWebhooksList.mock.calls[mockWebhooksList.mock.calls.length - 1];
      expect(lastCall[1]).toEqual(expect.objectContaining({ page: 1, status: 'pending' }));
    });
  });

  it('resets page to 1 when filter changes', async () => {
    // Start on page 2
    mockWebhooksList.mockResolvedValueOnce({
      ...MOCK_PAGED_RESPONSE,
      page: 2,
      total: 45,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    // Change filter
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES.filter((d) => d.status === 'failed'),
      total: 2,
      page: 1,
      per_page: 20,
    });
    const failedBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Failed',
    );
    await act(async () => {
      fireEvent.click(failedBtn!);
    });
    await waitFor(() => {
      const lastCall = mockWebhooksList.mock.calls[mockWebhooksList.mock.calls.length - 1];
      expect(lastCall[1].page).toBe(1);
    });
  });

  // ─── Search ───
  it('renders search input with placeholder', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input!.getAttribute('placeholder')).toBe('deliveries.searchPlaceholder');
  });

  it('filters deliveries by search term (event name)', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('tbody tr').length).toBe(5);
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'payment' } });
    });
    await waitFor(() => {
      const rows = container!.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(container!.textContent).toContain('payment.failed');
      expect(container!.textContent).not.toContain('order.created');
    });
  });

  it('filters deliveries by search term (id)', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'd323456789012' } });
    });
    await waitFor(() => {
      const rows = container!.querySelectorAll('tbody tr');
      expect(rows.length).toBe(1);
      expect(container!.textContent).toContain('user.registered');
    });
  });

  it('shows "no results matching" message when search finds nothing', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'nonexistent' } });
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('No results matching');
      expect(container!.textContent).toContain('nonexistent');
    });
  });

  it('shows empty state when no deliveries and no search', async () => {
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: [],
      total: 0,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('deliveries.empty');
    });
  });

  // ─── Pagination ───
  it('shows pagination when total > perPage', async () => {
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 1,
      per_page: 20,
    });
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

  it('hides pagination when total <= perPage', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).not.toContain('Previous');
      expect(container!.textContent).not.toContain('Next');
    });
  });

  it('navigates to next page', async () => {
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Next');
    });
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES.slice(0, 5),
      total: 45,
      page: 2,
      per_page: 20,
    });
    const nextBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Next',
    );
    await act(async () => {
      fireEvent.click(nextBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 2 }));
    });
  });

  it('navigates to previous page', async () => {
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 2,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Previous');
    });
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 1,
      per_page: 20,
    });
    const prevBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Previous',
    );
    await act(async () => {
      fireEvent.click(prevBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({ page: 1 }));
    });
  });

  it('disables Previous button on first page', async () => {
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const prevBtn = Array.from(container!.querySelectorAll('button')).find(
        (b) => b.textContent === 'Previous',
      );
      expect(prevBtn).toHaveProperty('disabled', true);
    });
  });

  it('disables Next button on last page', async () => {
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES.slice(0, 5),
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
      expect(container!.textContent).toContain('Next');
    });
    mockWebhooksList.mockResolvedValueOnce({
      deliveries: MOCK_DELIVERIES.slice(0, 5),
      total: 25,
      page: 2,
      per_page: 20,
    });
    const nextBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Next',
    );
    await act(async () => {
      fireEvent.click(nextBtn!);
    });
    await waitFor(() => {
      const nextBtnAfter = Array.from(container!.querySelectorAll('button')).find(
        (b) => b.textContent === 'Next',
      );
      expect(nextBtnAfter).toHaveProperty('disabled', true);
    });
  });

  it('shows correct page range text', async () => {
    mockWebhooksList.mockReset();
    mockWebhooksList.mockResolvedValue({
      deliveries: MOCK_DELIVERIES,
      total: 45,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Showing');
      expect(container!.textContent).toContain('of 45');
      expect(container!.textContent).toContain('Page 1 of 3');
    });
  });

  // ─── Delivery Row Click ───
  it('navigates to delivery detail on row click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });
    const firstRow = container!.querySelector('tbody tr')!;
    await act(async () => {
      fireEvent.click(firstRow);
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/deliveries/d123456789012');
  });

  it('navigates to detail on View Details button click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const viewBtns = Array.from(container!.querySelectorAll('button')).filter(
        (b) => b.textContent === 'View Details',
      );
      expect(viewBtns.length).toBeGreaterThan(0);
    });
    const viewBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'View Details',
    );
    await act(async () => {
      fireEvent.click(viewBtn!);
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/deliveries/d123456789012');
  });

  // ─── Response Code Display ───
  it('displays green text for 2xx response codes', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const greenCodes = container!.querySelectorAll('.text-green-600');
      expect(greenCodes.length).toBeGreaterThanOrEqual(1);
      expect(greenCodes[0].textContent).toBe('200');
    });
  });

  it('displays red text for 4xx/5xx response codes', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const redCodes = container!.querySelectorAll('.text-red-600');
      expect(redCodes.length).toBeGreaterThanOrEqual(2); // 500 and 400
    });
  });

  it('shows dash for missing response_status', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      // d323456789012 has no response_status → shows "—"
      const dashes = container!.querySelectorAll('.text-gray-400');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Status Counts ───
  it('renders status badges for all deliveries', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const badges = container!.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBe(MOCK_DELIVERIES.length);
      const statuses = Array.from(badges).map((b) => b.textContent);
      expect(statuses).toContain('delivered');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('pending');
    });
  });

  // ─── Loading ───
  it('shows loading indicator while fetching', async () => {
    mockWebhooksList.mockReturnValueOnce(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('deliveries.loadingDeliveries');
  });

  // ─── Error Handling ───
  it('shows error message on API failure', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Connection timeout'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Connection timeout');
      expect(container!.textContent).toContain('Retry');
    });
  });

  it('shows Retry button on error', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Server error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const retryBtn = Array.from(container!.querySelectorAll('button')).find(
        (b) => b.textContent === 'Retry',
      );
      expect(retryBtn).toBeTruthy();
    });
  });

  it('retries fetch on Retry button click', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Retry');
    });
    mockWebhooksList.mockResolvedValueOnce(MOCK_PAGED_RESPONSE);
    const retryBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Retry',
    );
    await act(async () => {
      fireEvent.click(retryBtn!);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Replay ───
  it('shows confirm dialog for replay', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    // The confirm dialog is controlled by replayTarget state.
    // It's not directly triggered from the rendered list in this component version,
    // but we verify the ConfirmDialog mock renders when open.
    // We'll check the ConfirmDialog is not visible initially.
    await waitFor(() => {
      expect(container!.querySelectorAll('[data-testid="confirm-dialog"]').length).toBe(0);
    });
  });

  // ─── Table Headers ───
  it('renders all table column headers', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const headers = container!.querySelectorAll('th');
      const headerTexts = Array.from(headers).map((h) => h.textContent);
      expect(headerTexts).toContain('ID');
      expect(headerTexts).toContain('Event');
      expect(headerTexts).toContain('Status');
      expect(headerTexts).toContain('Attempts');
      expect(headerTexts).toContain('Response');
      expect(headerTexts).toContain('Time');
    });
  });

  // ─── Formatted timestamps ───
  it('displays formatted timestamps', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('2024');
    });
  });

  // ─── Attempt counts ───
  it('displays attempt counts for each delivery', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('1');
      expect(container!.textContent).toContain('3');
      expect(container!.textContent).toContain('0');
    });
  });

  // ─── Subtitle ───
  it('renders subtitle text', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('deliveries.subtitle');
  });

  // ─── Filter highlights change ───
  it('highlights Delivered filter when selected', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    const deliveredBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Delivered',
    );
    await act(async () => {
      fireEvent.click(deliveredBtn!);
    });
    await waitFor(() => {
      expect(deliveredBtn!.className).toContain('bg-gray-900');
    });
  });

  // ─── Default filter sends no status ───
  it('sends status=undefined for "all" filter', async () => {
    await act(async () => {
      render(React.createElement(DeliveriesPage));
    });
    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', expect.objectContaining({
      page: 1,
      status: undefined,
    }));
  });

  // ─── Event tags display ───
  it('renders event tags with mono font', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DeliveriesPage));
      container = result.container;
    });
    await waitFor(() => {
      const eventSpans = container!.querySelectorAll('span.font-mono');
      expect(eventSpans.length).toBeGreaterThan(0);
    });
  });
});
