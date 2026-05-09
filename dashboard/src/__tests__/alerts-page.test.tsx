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

vi.mock('@/components/ConfirmDialog', () => ({ default: () => null }));

const { default: AlertsPage } = await import('@/app/[locale]/dashboard/alerts/page');

describe('AlertsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 'a1', name: 'High failure rate', condition: 'failure_rate', threshold: 10, channels: ['email'], is_active: true, created_at: '2024-01-01' },
      ]),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AlertsPage));
    });
  });

  it('fetches alerts on mount', async () => {
    await act(async () => {
      render(React.createElement(AlertsPage));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts'),
      expect.anything()
    );
  });

  it('displays alerts title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('alerts.title');
  });

  it('shows empty state when no alerts', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No alert rules yet');
  });

  it('renders new alert button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AlertsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('alerts.newAlert');
  });
});
