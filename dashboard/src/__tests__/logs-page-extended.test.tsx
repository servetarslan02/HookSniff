// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();
const mockPush = vi.fn();
const mockWebhooksList = vi.fn();

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
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', email: 'test@test.com' } }),
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
  },
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

const { default: LogsPage } = await import('@/app/[locale]/[username]/logs/page');

const mockDeliveries = [
  { id: 'del_001aaaabbbbccccdd', event: 'order.created', status: 'delivered', attempt_count: 1, response_status: 200, endpoint_id: 'ep_001aaaabbbb', created_at: '2024-06-01T10:00:00Z' },
  { id: 'del_002aaaabbbbccccdd', event: 'payment.completed', status: 'failed', attempt_count: 3, response_status: 500, endpoint_id: 'ep_002aaaabbbb', created_at: '2024-06-01T11:00:00Z' },
  { id: 'del_003aaaabbbbccccdd', event: 'user.created', status: 'pending', attempt_count: 0, response_status: null, endpoint_id: 'ep_001aaaabbbb', created_at: '2024-06-01T12:00:00Z' },
];

const mockApiResponse = {
  deliveries: mockDeliveries,
  total: 3,
};

describe('LogsPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockWebhooksList.mockResolvedValue(mockApiResponse);
  });

  // === Render ===
  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(LogsPage));
    });
  });

  it('calls webhooksApi.list with token on mount', async () => {
    await act(async () => {
      render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledWith('test-token', { page: 1, status: undefined });
    });
  });

  // === Title ===
  it('displays page title', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('logs.title');
    });
  });

  it('displays subtitle text', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Full delivery history');
    });
  });

  // === Log list rendering ===
  it('renders delivery IDs (truncated)', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001a');
    });
  });

  it('renders event names', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
      expect(container.textContent).toContain('payment.completed');
      expect(container.textContent).toContain('user.created');
    });
  });

  it('renders endpoint IDs (truncated)', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('ep_001a');
    });
  });

  it('renders attempt counts', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      // attempt_count values: 1, 3, 0
      expect(container.textContent).toContain('3');
    });
  });

  it('renders response status codes', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('200');
      expect(container.textContent).toContain('500');
    });
  });

  it('renders dash for null response status', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const dashes = container.querySelectorAll('.text-gray-400');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // === Status badge rendering ===
  it('renders status badges for each delivery', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('renders delivered status badge', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      const texts = Array.from(badges).map((b) => b.textContent);
      expect(texts).toContain('delivered');
    });
  });

  it('renders failed status badge', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      const texts = Array.from(badges).map((b) => b.textContent);
      expect(texts).toContain('failed');
    });
  });

  it('renders pending status badge', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      const texts = Array.from(badges).map((b) => b.textContent);
      expect(texts).toContain('pending');
    });
  });

  // === Response status color coding ===
  it('renders green for 2xx response', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const green = container.querySelector('.text-green-600');
      expect(green).toBeTruthy();
      expect(green?.textContent).toBe('200');
    });
  });

  it('renders red for 5xx response', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const red = container.querySelector('.text-red-600');
      expect(red).toBeTruthy();
      expect(red?.textContent).toBe('500');
    });
  });

  // === Timestamp formatting ===
  it('formats timestamps in table rows', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      // toLocaleString with month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
      // Should contain formatted date parts
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);
      // Each row should have a time cell with non-empty content
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        const lastCell = cells[cells.length - 1];
        expect(lastCell?.textContent?.trim()).not.toBe('');
      });
    });
  });

  // === Search functionality ===
  it('renders search input', () => {
    const { container } = render(React.createElement(LogsPage));
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('filters by search term matching event', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'payment' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('payment.completed');
      expect(container.textContent).not.toContain('order.created');
      expect(container.textContent).not.toContain('user.created');
    });
  });

  it('filters by search term matching id', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'del_002' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('payment.completed');
      expect(container.textContent).not.toContain('order.created');
    });
  });

  it('filters by search term matching endpoint_id', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'ep_002' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('payment.completed');
      expect(container.textContent).not.toContain('order.created');
    });
  });

  it('is case-insensitive in search', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'PAYMENT' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('payment.completed');
    });
  });

  it('shows empty state when search has no matches', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'nonexistent_xyz_12345' } });
    });

    await waitFor(() => {
      expect(container.textContent).toContain('logs.noLogsSearch');
    });
  });

  // === Filtering by status ===
  it('renders status filter tabs', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('All');
      expect(container.textContent).toContain('Delivered');
      expect(container.textContent).toContain('Failed');
      expect(container.textContent).toContain('Pending');
    });
  });

  it('sends status=delivered when Delivered tab clicked', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Delivered');
    });

    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Delivered')
    );

    await act(async () => {
      fireEvent.click(btn!);
    });

    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', {
      page: 1,
      status: 'delivered',
    });
  });

  it('sends status=failed when Failed tab clicked', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Failed');
    });

    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Failed')
    );

    await act(async () => {
      fireEvent.click(btn!);
    });

    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', {
      page: 1,
      status: 'failed',
    });
  });

  it('sends status=pending when Pending tab clicked', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Pending');
    });

    const btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Pending')
    );

    await act(async () => {
      fireEvent.click(btn!);
    });

    expect(mockWebhooksList).toHaveBeenCalledWith('test-token', {
      page: 1,
      status: 'pending',
    });
  });

  it('sends status=undefined when All tab clicked', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Failed');
    });

    // Click a specific filter first
    const failedBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Failed')
    );
    await act(async () => {
      fireEvent.click(failedBtn!);
    });

    // Then click All (first button in the filter row)
    const allBtn = container.querySelector('.flex.flex-wrap.gap-2 button:first-child') as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(allBtn);
    });

    expect(mockWebhooksList).toHaveBeenLastCalledWith('test-token', {
      page: 1,
      status: undefined,
    });
  });

  it('resets page to 1 when filter changes', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Failed');
    });

    const failedBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Failed')
    );
    await act(async () => {
      fireEvent.click(failedBtn!);
    });

    expect(mockWebhooksList).toHaveBeenLastCalledWith('test-token', {
      page: 1,
      status: 'failed',
    });
  });

  it('shows status counts in filter tabs', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      // Count badges show numbers for filtered statuses
      // delivered=1, failed=1, pending=1
      const spans = container.querySelectorAll('button span');
      const countTexts = Array.from(spans)
        .map((s) => s.textContent?.trim())
        .filter((t) => t && /^\d+$/.test(t));
      expect(countTexts.length).toBeGreaterThanOrEqual(3);
    });
  });

  // === Pagination ===
  it('does not show pagination when total <= perPage', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    // total=3, perPage=20 → no pagination
    expect(container.textContent).not.toContain('Previous');
    expect(container.textContent).not.toContain('Next');
  });

  it('shows pagination when total > perPage', async () => {
    const manyDeliveries = Array.from({ length: 25 }, (_, i) => ({
      id: `del_${String(i).padStart(16, '0')}`,
      event: `event.${i}`,
      status: 'delivered',
      attempt_count: 1,
      response_status: 200,
      endpoint_id: `ep_${String(i).padStart(10, '0')}`,
      created_at: '2024-06-01T10:00:00Z',
    }));

    mockWebhooksList.mockResolvedValue({ deliveries: manyDeliveries.slice(0, 20), total: 25 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Previous');
      expect(container.textContent).toContain('Next');
    });
  });

  it('shows correct pagination range text', async () => {
    const manyDeliveries = Array.from({ length: 25 }, (_, i) => ({
      id: `del_${String(i).padStart(16, '0')}`,
      event: `event.${i}`,
      status: 'delivered',
      attempt_count: 1,
      response_status: 200,
      endpoint_id: `ep_${String(i).padStart(10, '0')}`,
      created_at: '2024-06-01T10:00:00Z',
    }));

    mockWebhooksList.mockResolvedValue({ deliveries: manyDeliveries.slice(0, 20), total: 25 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Showing 1–20 of 25');
      expect(container.textContent).toContain('Page 1 of 2');
    });
  });

  it('disables Previous button on page 1', async () => {
    const manyDeliveries = Array.from({ length: 25 }, (_, i) => ({
      id: `del_${String(i).padStart(16, '0')}`,
      event: `event.${i}`,
      status: 'delivered',
      attempt_count: 1,
      response_status: 200,
      endpoint_id: `ep_${String(i).padStart(10, '0')}`,
      created_at: '2024-06-01T10:00:00Z',
    }));

    mockWebhooksList.mockResolvedValue({ deliveries: manyDeliveries.slice(0, 20), total: 25 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const prevBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Previous')
      );
      expect(prevBtn?.disabled).toBe(true);
    });
  });

  it('navigates to next page on Next click', async () => {
    const manyDeliveries = Array.from({ length: 25 }, (_, i) => ({
      id: `del_${String(i).padStart(16, '0')}`,
      event: `event.${i}`,
      status: 'delivered',
      attempt_count: 1,
      response_status: 200,
      endpoint_id: `ep_${String(i).padStart(10, '0')}`,
      created_at: '2024-06-01T10:00:00Z',
    }));

    mockWebhooksList.mockResolvedValue({ deliveries: manyDeliveries.slice(0, 20), total: 25 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Next');
    });

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Next')
    );

    await act(async () => {
      fireEvent.click(nextBtn!);
    });

    expect(mockWebhooksList).toHaveBeenLastCalledWith('test-token', {
      page: 2,
      status: undefined,
    });
  });

  it('navigates to previous page on Previous click', async () => {
    const manyDeliveries = Array.from({ length: 25 }, (_, i) => ({
      id: `del_${String(i).padStart(16, '0')}`,
      event: `event.${i}`,
      status: 'delivered',
      attempt_count: 1,
      response_status: 200,
      endpoint_id: `ep_${String(i).padStart(10, '0')}`,
      created_at: '2024-06-01T10:00:00Z',
    }));

    // First render page 1
    mockWebhooksList.mockResolvedValue({ deliveries: manyDeliveries.slice(0, 20), total: 25 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Next');
    });

    // Go to page 2
    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Next')
    );
    await act(async () => {
      fireEvent.click(nextBtn!);
    });

    // Now mock page 2 response
    mockWebhooksList.mockResolvedValue({ deliveries: manyDeliveries.slice(20, 25), total: 25 });

    // Click Previous
    await waitFor(() => {
      const prevBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Previous')
      );
      expect(prevBtn).toBeTruthy();
    });

    const prevBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Previous')
    );
    await act(async () => {
      fireEvent.click(prevBtn!);
    });

    // Should have called with page=1 again
    expect(mockWebhooksList).toHaveBeenLastCalledWith('test-token', {
      page: 1,
      status: undefined,
    });
  });

  it('disables Next button on last page', async () => {
    const manyDeliveries = Array.from({ length: 25 }, (_, i) => ({
      id: `del_${String(i).padStart(16, '0')}`,
      event: `event.${i}`,
      status: 'delivered',
      attempt_count: 1,
      response_status: 200,
      endpoint_id: `ep_${String(i).padStart(10, '0')}`,
      created_at: '2024-06-01T10:00:00Z',
    }));

    // Mock being on page 2 (last page)
    mockWebhooksList.mockResolvedValue({ deliveries: manyDeliveries.slice(20, 25), total: 25 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Next');
    });

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Next')
    );

    // On page 1, go to page 2 first
    await act(async () => {
      fireEvent.click(nextBtn!);
    });

    // After page navigation, Next should be disabled on page 2
    await waitFor(() => {
      const nextBtnAfter = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Next')
      );
      expect(nextBtnAfter?.disabled).toBe(true);
    });
  });

  // === Log detail expansion (modal) ===
  it('opens detail modal on row click', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    // Modal should show delivery details
    await waitFor(() => {
      expect(container.textContent).toContain('logs.deliveryDetails');
    });
  });

  it('shows all detail rows in modal', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('logs.deliveryId');
      expect(container.textContent).toContain('Event');
      expect(container.textContent).toContain('Endpoint');
      expect(container.textContent).toContain('Status');
      expect(container.textContent).toContain('Attempts');
      expect(container.textContent).toContain('logs.httpResponse');
      expect(container.textContent).toContain('Created');
    });
  });

  it('shows full delivery ID in modal', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    await waitFor(() => {
      // Full ID should be visible (not truncated)
      expect(container.textContent).toContain('del_001aaaabbbbccccdd');
    });
  });

  it('shows attempt timeline in modal', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('payment.completed');
    });

    // Click the failed delivery (attempt_count=3)
    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[1]);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Attempt 1');
      expect(container.textContent).toContain('Attempt 2');
      expect(container.textContent).toContain('Attempt 3');
    });
  });

  it('closes modal on close button click', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('logs.deliveryDetails');
    });

    // Click the ✕ close button
    const closeBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === '✕'
    );
    await act(async () => {
      fireEvent.click(closeBtn!);
    });

    await waitFor(() => {
      // Modal detail rows should be gone
      expect(container.textContent).not.toContain('logs.deliveryId');
    });
  });

  it('closes modal on backdrop click', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('logs.deliveryDetails');
    });

    // Click the backdrop (the fixed overlay div)
    const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/40');
    if (backdrop) {
      await act(async () => {
        fireEvent.click(backdrop);
      });
    }

    await waitFor(() => {
      expect(container.textContent).not.toContain('logs.deliveryId');
    });
  });

  it('closes modal on Close button in footer', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('logs.deliveryDetails');
    });

    // Click the "Close" button in modal footer
    const closeFooterBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Close'
    );
    await act(async () => {
      fireEvent.click(closeFooterBtn!);
    });

    await waitFor(() => {
      expect(container.textContent).not.toContain('logs.deliveryId');
    });
  });

  it('shows formatted created_at in modal', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('del_001');
    });

    const rows = container.querySelectorAll('tbody tr');
    await act(async () => {
      fireEvent.click(rows[0]);
    });

    await waitFor(() => {
      // toLocaleString() should produce a formatted date
      expect(container.textContent).toContain('2024');
    });
  });

  // === Empty state ===
  it('shows empty state when no deliveries', async () => {
    mockWebhooksList.mockResolvedValue({ deliveries: [], total: 0 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('logs.noLogs');
    });
  });

  it('shows emoji in empty state', async () => {
    mockWebhooksList.mockResolvedValue({ deliveries: [], total: 0 });

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('📭');
    });
  });

  // === Loading state ===
  it('shows loading state while fetching', () => {
    mockWebhooksList.mockReturnValue(new Promise(() => {})); // never resolves

    const { container } = render(React.createElement(LogsPage));
    expect(container.textContent).toContain('Loading logs');
  });

  it('shows spinner in loading state', () => {
    mockWebhooksList.mockReturnValue(new Promise(() => {}));

    const { container } = render(React.createElement(LogsPage));
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  // === Error handling ===
  it('shows error message on fetch failure', async () => {
    mockWebhooksList.mockRejectedValue(new Error('Network error'));

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Network error');
    });
  });

  it('shows error emoji', async () => {
    mockWebhooksList.mockRejectedValue(new Error('Fail'));

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('⚠️');
    });
  });

  it('shows retry button on error', async () => {
    mockWebhooksList.mockRejectedValue(new Error('Fail'));

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Retry');
    });
  });

  it('retries fetch on retry button click', async () => {
    mockWebhooksList.mockRejectedValueOnce(new Error('Fail'));

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Retry');
    });

    // Now mock success
    mockWebhooksList.mockResolvedValue(mockApiResponse);

    const retryBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Retry')
    );

    await act(async () => {
      fireEvent.click(retryBtn!);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });
  });

  it('shows fallback error message for non-Error throws', async () => {
    mockWebhooksList.mockRejectedValue('string error');

    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Unknown error');
    });
  });

  // === Refresh button ===
  it('renders refresh button', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Refresh');
    });
  });

  it('re-fetches data on refresh click', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });

    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(1);
    });

    const callsBefore = mockWebhooksList.mock.calls.length;

    const refreshBtn = container.querySelector('button:last-child') as HTMLButtonElement;
    expect(refreshBtn).toBeTruthy();
    expect(refreshBtn.textContent).toContain('Refresh');

    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    expect(mockWebhooksList.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  // === Auto-refresh ===
  it('renders auto-refresh toggle button', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('common.autoRefresh');
    });
  });

  it('toggles auto-refresh on click', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('common.autoRefresh');
    });

    const autoRefreshBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('common.autoRefresh')
    );

    await act(async () => {
      fireEvent.click(autoRefreshBtn!);
    });

    // After toggle, should show "live" text
    await waitFor(() => {
      expect(container.textContent).toContain('common.live');
    });
  });

  it('auto-refreshes every 5 seconds when enabled', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(1);
    });

    // Enable auto-refresh
    const autoRefreshBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('common.autoRefresh')
    );
    await act(async () => {
      fireEvent.click(autoRefreshBtn!);
    });

    // Advance timer by 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(2);
    });

    // Advance another 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(3);
    });
    vi.useRealTimers();
  });

  it('stops auto-refresh when toggled off', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(1);
    });

    // Enable auto-refresh
    const autoRefreshBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('common.autoRefresh')
    );
    await act(async () => {
      fireEvent.click(autoRefreshBtn!);
    });

    // Advance 5 seconds — should trigger refresh
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    await waitFor(() => {
      expect(mockWebhooksList).toHaveBeenCalledTimes(2);
    });

    // Disable auto-refresh
    const liveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('common.live')
    );
    await act(async () => {
      fireEvent.click(liveBtn!);
    });

    const callsAfterDisable = mockWebhooksList.mock.calls.length;

    // Advance 10 seconds — should NOT trigger more refreshes
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockWebhooksList).toHaveBeenCalledTimes(callsAfterDisable);
    vi.useRealTimers();
  });

  // === No token ===
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
        list: (...args: any[]) => mockWebhooksList(...args),
      },
    }));
    vi.doMock('@/components/StatusBadge', () => ({
      StatusBadge: ({ status }: any) => React.createElement('span', { 'data-testid': 'status-badge' }, status),
    }));
    vi.doMock('@/components/Toast', () => ({
      useToast: () => ({ toast: mockToast }),
    }));

    const { default: LogsPageNoToken } = await import('@/app/[locale]/[username]/logs/page');

    await act(async () => {
      render(React.createElement(LogsPageNoToken));
    });

    expect(mockWebhooksList).not.toHaveBeenCalled();
  });

  // === Table headers ===
  it('renders all table column headers', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const headers = container.querySelectorAll('th');
      const headerTexts = Array.from(headers).map((h) => h.textContent?.trim());
      expect(headerTexts).toContain('ID');
      expect(headerTexts).toContain('Event');
      expect(headerTexts).toContain('Endpoint');
      expect(headerTexts).toContain('Status');
      expect(headerTexts).toContain('Time');
    });
  });

  // === Attempt count indicator ===
  it('shows amber dot for deliveries with attempt_count > 1', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      const amberDots = container.querySelectorAll('.bg-amber-400');
      // del_002 has attempt_count=3 > 1
      expect(amberDots.length).toBeGreaterThanOrEqual(1);
    });
  });

  // === Search clears and shows all ===
  it('shows all deliveries when search is cleared', async () => {
    const { container } = await act(async () => {
      return render(React.createElement(LogsPage));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
    });

    const input = container.querySelector('input[type="text"]') as HTMLInputElement;

    // Type something
    await act(async () => {
      fireEvent.change(input, { target: { value: 'payment' } });
    });
    await waitFor(() => {
      expect(container.textContent).not.toContain('order.created');
    });

    // Clear search
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
      expect(container.textContent).toContain('payment.completed');
      expect(container.textContent).toContain('user.created');
    });
  });
});
