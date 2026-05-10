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
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && (url === '/api/status' || url.endsWith('/status') || url.endsWith('/status.json'))) {
        return Promise.resolve({
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
      }
      if (typeof url === 'string' && url.includes('status-history')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (typeof url === 'string' && url.includes('incidents')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (typeof url === 'string' && url.includes('maintenance')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
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
    expect(container!.textContent).toContain('System Status');
  });

  it('displays status subtitle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Real-time monitoring');
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
    expect(container!.textContent).toContain('All Systems Operational');
  });

  it('renders components section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Components');
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
    expect(container!.textContent).toContain('Last 30 days');
  });

  it('renders incident history section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Incident History');
    expect(container!.textContent).toContain('No incidents in the past 30 days');
  });

  it('shows API unreachable banner when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(StatusPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Major Outage Detected');
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
