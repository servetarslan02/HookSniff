// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockPush = vi.fn();
const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) =>
    React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

const { default: SearchPage } = await import('@/app/[locale]/[username]/search/page');

const MOCK_RESULTS = {
  deliveries: [
    { id: 'srch_001aaaabbbbcccc', event: 'order.created', status: 'delivered', attempt_count: 1, response_status: 200, created_at: '2024-06-01T10:00:00Z', endpoint_url: 'https://api.example.com/webhook' },
    { id: 'srch_002aaaabbbbcccc', event: 'payment.failed', status: 'failed', attempt_count: 3, response_status: 500, created_at: '2024-06-02T11:00:00Z', endpoint_url: 'https://api.example.com/payments' },
  ],
  total: 2,
  page: 1,
  per_page: 20,
  query: 'order',
};

describe('SearchPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RESULTS),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // === Initial State ===
  it('renders page title', () => {
    const { container } = render(React.createElement(SearchPage));
    expect(container.textContent).toContain('search.title');
  });

  it('renders description text', () => {
    const { container } = render(React.createElement(SearchPage));
    expect(container.textContent).toContain('Search and filter your webhook delivery logs');
  });

  it('renders search input', () => {
    const { container } = render(React.createElement(SearchPage));
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input!.getAttribute('placeholder')).toBe('search.searchPlaceholder');
  });

  it('renders status filter select', () => {
    const { container } = render(React.createElement(SearchPage));
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
    const options = Array.from(select!.querySelectorAll('option'));
    expect(options.length).toBe(4); // all, delivered, failed, pending
  });

  it('renders search button', () => {
    const { container } = render(React.createElement(SearchPage));
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Search');
    expect(btn).toBeTruthy();
    expect(btn!.getAttribute('type')).toBe('submit');
  });

  // === Empty State ===
  it('shows searching text during initial fetch', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(SearchPage));
    expect(container.textContent).toContain('search.searching');
  });

  it('shows no results message when query returns empty', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ deliveries: [], total: 0, page: 1, per_page: 20, query: 'nothing' }) });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'nothing' } });
      vi.advanceTimersByTime(400);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('search.noResultsQuery');
    });
  });

  // === Search Execution ===
  it('calls search API on mount via debounce', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    // Initial search fires after debounce
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('debounces search input changes', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    // Wait for initial search
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    const callsBefore = mockFetch.mock.calls.length;
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'new query' } });
    });
    // Should not call immediately
    expect(mockFetch.mock.calls.length).toBe(callsBefore);
    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('calls search API with correct params', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      const lastCallUrl = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
      expect(lastCallUrl).toContain('q=order');
      expect(lastCallUrl).toContain('page=1');
      expect(lastCallUrl).toContain('per_page=20');
    });
  });

  it('includes status filter in search params', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const select = container.querySelector('select')!;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'failed' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      const callUrl = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
      expect(callUrl).toContain('status=failed');
    });
  });

  // === Results ===
  it('renders search results', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('order.created');
      expect(container.textContent).toContain('payment.failed');
    });
  });

  it('renders result count', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('2 result');
    });
  });

  it('renders truncated delivery IDs', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('srch_001aa');
    });
  });

  it('renders endpoint URLs', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('https://api.example.com/webhook');
    });
  });

  it('renders status badges', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      const badges = container.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBe(2);
    });
  });

  it('renders attempt count with response status', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('(200)');
      expect(container.textContent).toContain('(500)');
    });
  });

  // === Navigation ===
  it('navigates to delivery detail on row click', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(container.querySelectorAll('tbody tr').length).toBe(2);
    });
    const firstRow = container.querySelector('tbody tr')!;
    await act(async () => {
      fireEvent.click(firstRow);
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/deliveries?id=srch_001aaaabbbbcccc');
  });

  // === Pagination ===
  it('shows pagination when total > per_page', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        deliveries: MOCK_RESULTS.deliveries,
        total: 50,
        page: 1,
        per_page: 20,
        query: 'test',
      }),
    });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Previous');
      expect(container.textContent).toContain('Next');
      expect(container.textContent).toContain('Page 1 of 3');
    });
  });

  it('disables Previous on first page', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        deliveries: MOCK_RESULTS.deliveries,
        total: 50,
        page: 1,
        per_page: 20,
        query: 'test',
      }),
    });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      const prevBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Previous');
      expect(prevBtn).toHaveProperty('disabled', true);
    });
  });

  // === Form Submit ===
  it('triggers immediate search on form submit', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    const form = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  // === Table Headers ===
  it('renders table headers', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      vi.advanceTimersByTime(300);
    });
    await waitFor(() => {
      const headers = container.querySelectorAll('th');
      const texts = Array.from(headers).map(h => h.textContent);
      expect(texts).toContain('ID');
      expect(texts).toContain('Event');
      expect(texts).toContain('Status');
      expect(texts).toContain('Endpoint');
      expect(texts).toContain('Attempts');
      expect(texts).toContain('Time');
    });
  });

  // === Loading State ===
  it('shows loading text while searching', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
    });
    expect(container.textContent).toContain('search.searching');
  });

  // === Error Handling ===
  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(SearchPage)).container;
    });
    const input = container.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      vi.advanceTimersByTime(300);
    });
    // Should not crash
    expect(container.textContent).toContain('search.title');
  });

  // === No Token ===
  it('does not search when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
    vi.doMock('@/components/StatusBadge', () => ({ StatusBadge: ({ status }: any) => React.createElement('span', null, status) }));
    const { default: PageNoToken } = await import('@/app/[locale]/[username]/search/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
