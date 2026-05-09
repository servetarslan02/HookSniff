// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => React.createElement('span', null, status),
}));

const { default: SearchPage } = await import('@/app/[locale]/dashboard/search/page');

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        deliveries: [],
        total: 0,
        page: 1,
        per_page: 20,
        query: '',
      }),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(SearchPage));
    });
  });

  it('displays search title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('title');
  });

  it('renders search form with input field', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const textInput = container!.querySelector('input[type="text"]');
    expect(textInput).toBeTruthy();
  });

  it('renders status filter', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    const select = container!.querySelector('select');
    expect(select).toBeTruthy();
    expect(container!.textContent).toContain('allStatuses');
  });

  it('shows search button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(SearchPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Search');
  });
});
