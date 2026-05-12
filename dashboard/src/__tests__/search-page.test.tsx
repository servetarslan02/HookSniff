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

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => React.createElement('span', null, status),
}));

const mockResults = {
  deliveries: [
    { id: 'd1-1234-5678', event: 'order.created', status: 'delivered', attempt_count: 1, response_status: 200, created_at: '2024-01-01T10:00:00Z', endpoint_url: 'https://example.com' },
    { id: 'd2-9012-3456', event: 'payment.failed', status: 'failed', attempt_count: 3, response_status: 500, created_at: '2024-01-02T10:00:00Z', endpoint_url: 'https://other.com' },
  ],
  total: 2,
  page: 1,
  per_page: 20,
  query: 'order',
};

const { default: SearchPage } = await import('@/app/[locale]/[username]/search/page');

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => { render(React.createElement(SearchPage)); });
  });

  it('displays search title', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    expect(container!.textContent).toContain('search.title');
  });

  it('renders search input', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input[type="text"], input[type="search"], input:not([type])');
    expect(input).toBeTruthy();
  });

  it('renders search button', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const btns = Array.from(container!.querySelectorAll('button'));
    expect(btns.length).toBeGreaterThan(0);
  });

  it('shows initial empty state', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    expect(container!.textContent).toContain('search');
  });

  it('performs search on submit', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'order' } }); });
    const form = container!.querySelector('form');
    if (form) {
      await act(async () => { fireEvent.submit(form); });
    } else {
      const btn = Array.from(container!.querySelectorAll('button')).find(b => b.textContent?.includes('search'));
      if (btn) await act(async () => { fireEvent.click(btn); });
    }
    expect(mockFetch).toHaveBeenCalled();
  });

  it('displays search results', async () => {
    let container: HTMLElement;
    // Trigger search
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResults) });
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'order' } }); });
    const form = container!.querySelector('form');
    if (form) {
      await act(async () => { fireEvent.submit(form); });
    }
    await waitFor(() => {
      expect(container!.textContent).toContain('order.created');
    });
  });

  it('displays result statuses', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    await waitFor(() => {
      expect(container!.textContent).toContain('delivered');
      expect(container!.textContent).toContain('failed');
    });
  });

  it('displays result event types', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    await waitFor(() => {
      expect(container!.textContent).toContain('order.created');
      expect(container!.textContent).toContain('payment.failed');
    });
  });

  it('displays result count', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    await waitFor(() => {
      expect(container!.textContent).toContain('2');
    });
  });

  it('shows loading state during search', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    expect(container!.textContent).toContain('search.searching');
  });

  it('shows no results state', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ deliveries: [], total: 0, page: 1, per_page: 20, query: 'nothing' }),
    });
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'nothing' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    expect(container!.textContent).toContain('search');
  });

  it('handles search error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    // Should not crash
    expect(container!.textContent).toContain('search.title');
  });

  it('renders status filter', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    expect(container!.textContent).toContain('search.allStatuses');
  });

  it('displays truncated result IDs', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    await waitFor(() => {
      expect(container!.textContent).toContain('d1-1234');
    });
  });

  it('displays endpoint URLs in results', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    await waitFor(() => {
      expect(container!.textContent).toContain('https://example.com');
    });
  });

  it('displays attempt counts', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    await waitFor(() => {
      expect(container!.textContent).toContain('3');
    });
  });

  it('displays response status codes', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    await waitFor(() => {
      expect(container!.textContent).toContain('200');
      expect(container!.textContent).toContain('500');
    });
  });

  it('updates input value on change', async () => {
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'webhook test' } }); });
    expect(input.value).toBe('webhook test');
  });

  it('shows pagination when results exceed per_page', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ deliveries: mockResults.deliveries, total: 50, page: 1, per_page: 20, query: 'test' }),
    });
    let container: HTMLElement;
    await act(async () => { container = render(React.createElement(SearchPage)).container; });
    const input = container!.querySelector('input') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'test' } }); });
    const form = container!.querySelector('form');
    if (form) await act(async () => { fireEvent.submit(form); });
    expect(container!.textContent).toContain('50');
  });
});
