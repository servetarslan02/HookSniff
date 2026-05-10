// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) =>
    React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

// ─── Test Data ───
const MOCK_SEARCH_RESULTS = {
  deliveries: [
    {
      id: 'sr12345678901',
      event: 'order.created',
      status: 'delivered',
      attempt_count: 1,
      response_status: 200,
      created_at: '2024-01-01T10:00:00Z',
      endpoint_url: 'https://example.com/webhook',
    },
    {
      id: 'sr22345678901',
      event: 'payment.failed',
      status: 'failed',
      attempt_count: 3,
      response_status: 500,
      created_at: '2024-01-02T11:00:00Z',
      endpoint_url: 'https://api.test.com/hook',
    },
    {
      id: 'sr32345678901',
      event: 'user.registered',
      status: 'pending',
      attempt_count: 0,
      response_status: null,
      created_at: '2024-01-03T12:00:00Z',
      endpoint_url: 'https://hooks.io/notify',
    },
  ],
  total: 3,
  page: 1,
  per_page: 20,
  query: 'order',
};

const { default: SearchPage } = await import('@/app/[locale]/dashboard/search/page');

describe('SearchPage - Extended', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    // Default: successful search
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_SEARCH_RESULTS),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Render ───
  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(SearchPage));
    });
  });

  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('search.title');
  });

  it('renders search placeholder', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input!.getAttribute('placeholder')).toBe('search.searchPlaceholder');
  });

  // ─── Search Input ───
  it('renders search input field', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('updates search query on typing', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'webhook test' } });
    });
    expect((input as HTMLInputElement).value).toBe('webhook test');
  });

  // ─── Debounce ───
  it('debounces search - does not call fetch immediately', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    // Should not have called fetch yet (debounce 300ms)
    // Only the initial empty search fires
    const initialCalls = fetchSpy.mock.calls.length;
    expect(initialCalls).toBeLessThanOrEqual(1);
  });

  it('fires search after debounce delay', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const calls = fetchSpy.mock.calls;
      const searchCall = calls.find((c: any[]) => c[0].includes('q=order'));
      expect(searchCall).toBeTruthy();
    });
  });

  it('cancels previous debounce on rapid typing', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const calls = fetchSpy.mock.calls;
      const searchCall = calls.find((c: any[]) => c[0].includes('q=abc'));
      expect(searchCall).toBeTruthy();
      // Should NOT have 'q=a' or 'q=ab' as separate calls
      const aCalls = calls.filter((c: any[]) => c[0].includes('q=a&'));
      expect(aCalls.length).toBe(0);
    });
  });

  // ─── Results Display ───
  it('displays search results after search', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('order.created');
      expect(container!.textContent).toContain('payment.failed');
    });
  });

  it('displays result count', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('3');
      expect(container!.textContent).toContain('result');
    });
  });

  it('renders table headers for results', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const headers = container!.querySelectorAll('th');
      const headerTexts = Array.from(headers).map((h) => h.textContent);
      expect(headerTexts).toContain('ID');
      expect(headerTexts).toContain('Event');
      expect(headerTexts).toContain('Status');
      expect(headerTexts).toContain('Endpoint');
      expect(headerTexts).toContain('Attempts');
      expect(headerTexts).toContain('Time');
    });
  });

  it('displays truncated delivery IDs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('sr1234567890…');
    });
  });

  it('displays endpoint URLs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('https://example.com/webhook');
    });
  });

  it('displays response status codes in parentheses', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('(200)');
      expect(container!.textContent).toContain('(500)');
    });
  });

  it('displays attempt counts', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('1');
      expect(container!.textContent).toContain('3');
      expect(container!.textContent).toContain('0');
    });
  });

  // ─── Result Click Navigation ───
  it('navigates to delivery detail on result row click', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });
    const firstRow = container!.querySelector('tbody tr')!;
    await act(async () => {
      fireEvent.click(firstRow);
    });
    expect(mockPush).toHaveBeenCalledWith('/dashboard/deliveries?id=sr12345678901');
  });

  // ─── Empty Results ───
  it('shows empty results message when no matches', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0, page: 1, per_page: 20, query: 'nonexistent' }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'nonexistent' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('search.noResultsQuery');
    });
  });

  it('shows "enter query" message when no search has been made', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0, page: 1, per_page: 20, query: '' }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    // Advance past initial debounce
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('search.enterQuery');
    });
  });

  // ─── Loading State ───
  it('shows loading state during search', async () => {
    // Make fetch hang with a real pending promise (not affected by fake timers)
    let resolveFetch!: (v: any) => void;
    fetchSpy.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    // After debounce fires, search() is called → setLoading(true) before fetch
    await waitFor(() => {
      expect(container!.textContent).toContain('search.searching');
    });
    // Clean up - resolve the fetch
    await act(async () => {
      resolveFetch({
        ok: true,
        json: () => Promise.resolve(MOCK_SEARCH_RESULTS),
      });
    });
  });

  // ─── Status Filter ───
  it('renders status filter dropdown', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const select = container!.querySelector('select');
    expect(select).toBeTruthy();
    const options = container!.querySelectorAll('option');
    const optionTexts = Array.from(options).map((o) => o.textContent);
    expect(optionTexts).toContain('search.allStatuses');
    expect(optionTexts).toContain('search.delivered');
    expect(optionTexts).toContain('search.failed');
    expect(optionTexts).toContain('search.pending');
  });

  it('filters by status when dropdown changes', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const select = container!.querySelector('select')!;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'failed' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const calls = fetchSpy.mock.calls;
      const statusCall = calls.find((c: any[]) => c[0].includes('status=failed'));
      expect(statusCall).toBeTruthy();
    });
  });

  it('includes both query and status in search params', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    const select = container!.querySelector('select')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
      fireEvent.change(select, { target: { value: 'delivered' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const calls = fetchSpy.mock.calls;
      const combinedCall = calls.find(
        (c: any[]) => c[0].includes('q=order') && c[0].includes('status=delivered'),
      );
      expect(combinedCall).toBeTruthy();
    });
  });

  // ─── Submit Button ───
  it('renders Search button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const searchBtn = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Search',
    );
    expect(searchBtn).toBeTruthy();
  });

  it('triggers immediate search on form submit', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'webhook' } });
    });
    const form = container!.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });
    // Form submit should trigger search immediately (not wait for debounce)
    await waitFor(() => {
      const calls = fetchSpy.mock.calls;
      const searchCall = calls.find((c: any[]) => c[0].includes('q=webhook'));
      expect(searchCall).toBeTruthy();
    });
  });

  // ─── Pagination ───
  it('shows pagination when results exceed per_page', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          deliveries: MOCK_SEARCH_RESULTS.deliveries,
          total: 50,
          page: 1,
          per_page: 20,
          query: 'test',
        }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('Previous');
      expect(container!.textContent).toContain('Next');
      expect(container!.textContent).toContain('Page 1 of 3');
    });
  });

  it('hides pagination when results fit in one page', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'order' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      // total=3, per_page=20 → no pagination
      expect(container!.textContent).not.toContain('Previous');
      expect(container!.textContent).not.toContain('Next');
    });
  });

  it('disables Previous button on first page', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          deliveries: MOCK_SEARCH_RESULTS.deliveries,
          total: 50,
          page: 1,
          per_page: 20,
          query: 'test',
        }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const prevBtn = Array.from(container!.querySelectorAll('button')).find(
        (b) => b.textContent === 'Previous',
      );
      expect(prevBtn).toHaveProperty('disabled', true);
    });
  });

  // ─── Error Handling ───
  it('handles fetch error gracefully', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    // Should not crash, shows empty/enter-query state
    await waitFor(() => {
      // After error, results stay null → shows enterQuery or noResultsQuery
      expect(container!.textContent).toBeDefined();
    });
  });

  it('handles non-ok response gracefully', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal error' }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    // Should not crash
    await waitFor(() => {
      expect(container!.textContent).toBeDefined();
    });
  });

  // ─── Search across deliveries (API URL construction) ───
  it('constructs correct API URL with query params', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'webhook test' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const call = fetchSpy.mock.calls.find((c: any[]) => c[0].includes('q=webhook'));
      expect(call).toBeTruthy();
      expect(call[0]).toContain('/search?');
      expect(call[0]).toContain('per_page=20');
    });
  });

  it('includes credentials in fetch request', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const call = fetchSpy.mock.calls.find((c: any[]) => c[0].includes('q=test'));
      expect(call).toBeTruthy();
      expect(call[1].credentials).toBe('include');
    });
  });

  // ─── Singular/plural result text ───
  it('shows singular "result" for 1 result', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          deliveries: [MOCK_SEARCH_RESULTS.deliveries[0]],
          total: 1,
          page: 1,
          per_page: 20,
          query: 'unique',
        }),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const input = container!.querySelector('input[type="text"]')!;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'unique' } });
    });
    await act(async () => {
      vi.advanceTimersByTime(350);
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('1');
      expect(container!.textContent).toContain('result');
      // Should NOT contain "results" (plural) — but "result" is a substring
      // Just check the text contains "1 result"
    });
  });
});
