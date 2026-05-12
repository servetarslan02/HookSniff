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

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn().mockResolvedValue([]),
}));

const { default: RoutingPage } = await import('@/app/[locale]/[username]/routing/page');

describe('RoutingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { apiFetch } = await import('@/lib/api');
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    await act(async () => {
      render(React.createElement(RoutingPage));
    });
  });

  it('displays routing title', async () => {
    const { apiFetch } = await import('@/lib/api');
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Routing');
  });

  it('shows empty state when no endpoints', async () => {
    const { apiFetch } = await import('@/lib/api');
    (apiFetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(RoutingPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No endpoints configured yet');
  });
});
