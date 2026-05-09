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

const { default: HealthPage } = await import('@/app/[locale]/dashboard/health/page');

describe('HealthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 'ep1',
          url: 'https://example.com',
          description: 'Test endpoint',
          is_active: true,
          health_status: 'healthy',
          success_rate: 99.5,
          avg_response_ms: 120,
          p95_response_ms: 250,
          total_deliveries: 1000,
          successful: 995,
          failed: 5,
          consecutive_failures: 0,
          last_failure_at: null,
          uptime_24h: 99.9,
        },
      ]),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(HealthPage));
    });
  });

  it('fetches endpoint health data on mount', async () => {
    await act(async () => {
      render(React.createElement(HealthPage));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/endpoint-health'),
      expect.anything()
    );
  });

  it('displays health title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(HealthPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('title');
  });

  it('shows summary cards with healthy/degraded/unhealthy counts', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(HealthPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Healthy');
    expect(container!.textContent).toContain('Degraded');
    expect(container!.textContent).toContain('Unhealthy');
  });

  it('shows empty state when no endpoints', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(HealthPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('No endpoints yet');
  });
});
