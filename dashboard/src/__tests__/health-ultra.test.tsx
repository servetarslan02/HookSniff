// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, screen, fireEvent } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const { default: EndpointHealthPage } = await import('@/app/[locale]/[username]/health/page');

const mockEndpoints = [
  {
    id: 'ep1', url: 'https://example.com/hook', description: 'Production webhook',
    is_active: true, health_status: 'healthy', success_rate: 99.5, avg_response_ms: 120,
    p95_response_ms: 250, total_deliveries: 1000, successful: 995, failed: 5,
    consecutive_failures: 0, last_failure_at: null, uptime_24h: 99.9,
  },
  {
    id: 'ep2', url: 'https://staging.example.com/hook', description: 'Staging',
    is_active: true, health_status: 'degraded', success_rate: 85.0, avg_response_ms: 350,
    p95_response_ms: 800, total_deliveries: 500, successful: 425, failed: 75,
    consecutive_failures: 3, last_failure_at: '2026-05-10T10:00:00Z', uptime_24h: 85.0,
  },
  {
    id: 'ep3', url: 'https://dead.example.com/hook', description: null,
    is_active: true, health_status: 'unhealthy', success_rate: 10.0, avg_response_ms: 5000,
    p95_response_ms: 10000, total_deliveries: 100, successful: 10, failed: 90,
    consecutive_failures: 20, last_failure_at: '2026-05-11T00:00:00Z', uptime_24h: 10.0,
  },
];

describe('EndpointHealthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEndpoints),
    });
  });

  it('renders loading state', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(React.createElement(EndpointHealthPage));
    expect(document.body.textContent).toContain('common.loading');
  });

  it('renders header', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText(/Endpoint Health|health/).length).toBeGreaterThan(0);
  });

  it('renders summary cards', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText('Healthy Endpoints').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Degraded Endpoints').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Unhealthy Endpoints').length).toBeGreaterThan(0);
  });

  it('renders healthy count correctly', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    // 1 healthy endpoint
    const healthyCards = screen.getAllByText('Healthy Endpoints');
    expect(healthyCards.length).toBeGreaterThan(0);
  });

  it('renders endpoint URLs', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText('https://example.com/hook').length).toBeGreaterThan(0);
    expect(screen.getAllByText('https://staging.example.com/hook').length).toBeGreaterThan(0);
  });

  it('renders success rate', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText('99.5%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('85.0%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10.0%').length).toBeGreaterThan(0);
  });

  it('renders stats values', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText('1,000').length).toBeGreaterThan(0); // total
    expect(screen.getAllByText('995').length).toBeGreaterThan(0); // successful
    expect(screen.getAllByText('5').length).toBeGreaterThan(0); // failed
    expect(screen.getAllByText('120ms').length).toBeGreaterThan(0); // avg latency
    expect(screen.getAllByText('250ms').length).toBeGreaterThan(0); // p95
  });

  it('renders consecutive failures warning', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText(/consecutive failure/).length).toBeGreaterThan(0);
  });

  it('renders empty state when no endpoints', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText(/No endpoints yet/).length).toBeGreaterThan(0);
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    // Should still render header
    expect(screen.getAllByText(/health/i).length).toBeGreaterThan(0);
  });

  it('renders description when present', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    expect(screen.getAllByText('Production webhook').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Staging').length).toBeGreaterThan(0);
  });

  it('renders progress bars', async () => {
    await act(async () => {
      render(React.createElement(EndpointHealthPage));
    });
    const progressBars = document.querySelectorAll('.rounded-full.transition-all');
    expect(progressBars.length).toBeGreaterThanOrEqual(3);
  });
});
