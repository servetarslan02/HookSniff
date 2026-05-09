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
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: StatusPage } = await import('@/app/[locale]/status/page');

describe('StatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        overall_status: 'operational',
        uptime_30d: 99.97,
        components: [
          { name: 'API', status: 'healthy', latency_ms: 45, description: 'REST API', last_checked: '2024-01-01T00:00:00Z' },
          { name: 'Database', status: 'healthy', latency_ms: 12, description: 'PostgreSQL', last_checked: '2024-01-01T00:00:00Z' },
          { name: 'Worker', status: 'healthy', latency_ms: 30, description: 'Delivery worker', last_checked: '2024-01-01T00:00:00Z' },
        ],
        checked_at: '2024-01-01T00:00:00Z',
      }),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(StatusPage));
    });
  });

  it('displays status title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('status.title');
  });

  it('displays status subtitle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('status.subtitle');
  });

  it('fetches status on mount', async () => {
    await act(async () => {
      render(React.createElement(StatusPage));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/status'),
      expect.anything()
    );
  });

  it('renders service status indicators', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('API');
    expect(container!.textContent).toContain('Database');
    expect(container!.textContent).toContain('Worker');
  });

  it('renders current status section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('status.currentStatus');
  });

  it('renders components section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('status.components');
  });

  it('renders uptime percentage', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('99.97%');
  });

  it('renders last 30 days label', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('status.last30Days');
  });

  it('renders incident history section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Incident History');
    expect(container!.textContent).toContain('status.noIncidents');
  });

  it('shows API unreachable banner when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('API server unreachable');
  });

  it('renders component latency values', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('45ms');
    expect(container!.textContent).toContain('12ms');
    expect(container!.textContent).toContain('30ms');
  });
});
