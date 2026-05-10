// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockApiFetch = vi.fn();
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: RateLimitingPage } = await import('@/app/[locale]/dashboard/rate-limiting/page');

describe('RateLimitingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    render(React.createElement(RateLimitingPage));
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders empty state when no data', async () => {
    mockApiFetch.mockResolvedValue([]);
    await act(async () => {
      render(React.createElement(RateLimitingPage));
    });
    expect(screen.getAllByText(/Rate Limiting/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Auto Retry').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Per-Endpoint').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alerts').length).toBeGreaterThan(0);
  });

  it('renders stats cards with data', async () => {
    mockApiFetch.mockResolvedValue([
      { endpoint_id: 'ep_001', requests_per_second: 10, burst_size: 20, enabled: true },
      { endpoint_id: 'ep_002', requests_per_second: 5, burst_size: 10, enabled: true },
    ]);
    await act(async () => {
      render(React.createElement(RateLimitingPage));
    });
    expect(screen.getAllByText('Total Endpoints').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Avg Requests/sec').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Peak Requests/sec').length).toBeGreaterThan(0);
  });

  it('renders per-endpoint limits table', async () => {
    mockApiFetch.mockResolvedValue([
      { endpoint_id: 'ep_001', requests_per_second: 10, burst_size: 20, enabled: true },
      { endpoint_id: 'ep_002', requests_per_second: 5, burst_size: 10, enabled: true },
    ]);
    await act(async () => {
      render(React.createElement(RateLimitingPage));
    });
    expect(screen.getAllByText('Per-Endpoint Limits').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Endpoint').length).toBeGreaterThan(0);
    expect(screen.getAllByText('RPS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('RPM').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Burst').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Queue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Throttled').length).toBeGreaterThan(0);
  });

  it('renders How Rate Limiting Works section', async () => {
    mockApiFetch.mockResolvedValue([]);
    await act(async () => {
      render(React.createElement(RateLimitingPage));
    });
    expect(screen.getAllByText('How Rate Limiting Works').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Token Bucket Algorithm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Burst Handling').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Queue & Retry').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Per-Endpoint Config').length).toBeGreaterThan(0);
  });

  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    await act(async () => {
      render(React.createElement(RateLimitingPage));
    });
    expect(screen.getAllByText(/Rate Limiting/).length).toBeGreaterThan(0);
  });

  it('renders with no token', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({
      useAuth: () => ({ token: null }),
    }));
    const { default: Page } = await import('@/app/[locale]/dashboard/rate-limiting/page');
    await act(async () => {
      render(React.createElement(Page));
    });
    expect(screen.getAllByText(/Rate Limiting/).length).toBeGreaterThan(0);
  });

  it('calculates avg_rps correctly with single endpoint', async () => {
    mockApiFetch.mockResolvedValue([
      { endpoint_id: 'ep_solo', requests_per_second: 15, burst_size: 30, enabled: true },
    ]);
    await act(async () => {
      render(React.createElement(RateLimitingPage));
    });
    expect(screen.getAllByText('15.0').length).toBeGreaterThan(0);
  });
});
