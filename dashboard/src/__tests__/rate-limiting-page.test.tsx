// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

const mockApiFetch = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
  },
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { default: RateLimitingPage } = await import('@/app/[locale]/dashboard/rate-limiting/page');

const MOCK_RATE_LIMITS = [
  { endpoint_id: 'ep_abc12345def', requests_per_second: 10, burst_size: 20, enabled: true },
  { endpoint_id: 'ep_xyz98765ghi', requests_per_second: 5, burst_size: 10, enabled: true },
];

describe('RateLimitingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    mockApiFetch.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(RateLimitingPage));
    const pulse = container.querySelector('.animate-pulse');
    expect(pulse).toBeTruthy();
  });

  it('renders the page title after loading', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      const h1s = container.querySelectorAll('h1');
      expect(Array.from(h1s).some(h => h.textContent?.includes('Rate Limiting'))).toBe(true);
    });
  });

  it('renders the page description after loading', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Monitor and configure rate limits');
    });
  });

  it('displays overview cards with stats', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Total Endpoints');
      expect(container.textContent).toContain('Avg Requests/sec');
      expect(container.textContent).toContain('Peak Requests/sec');
      expect(container.textContent).toContain('Throttled Requests');
    });
  });

  it('shows correct total endpoints count', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // Total endpoints = 2 (MOCK_RATE_LIMITS.length)
      const cards = container.querySelectorAll('.glass-card');
      const has2 = Array.from(cards).some(c => c.textContent?.includes('Total Endpoints') && c.textContent?.includes('2'));
      expect(has2).toBe(true);
    });
  });

  it('renders per-endpoint limits table', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      const ths = container.querySelectorAll('th');
      const headers = Array.from(ths).map(th => th.textContent);
      expect(headers).toContain('Endpoint');
      expect(headers).toContain('RPS');
      expect(headers).toContain('RPM');
      expect(headers).toContain('Burst');
    });
  });

  it('displays endpoint data in table', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      const tds = container.querySelectorAll('td');
      const tdTexts = Array.from(tds).map(td => td.textContent);
      expect(tdTexts).toContain('10');
      expect(tdTexts).toContain('5');
    });
  });

  it('shows empty state when no rate limits', async () => {
    mockApiFetch.mockResolvedValue([]);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(container.textContent).toContain('HookSniff automatically rate-limits');
    });
  });

  it('shows empty state features', async () => {
    mockApiFetch.mockResolvedValue([]);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(container.textContent).toContain('Auto Retry');
      expect(container.textContent).toContain('Per-Endpoint');
      expect(container.textContent).toContain('Alerts');
    });
  });

  it('renders how rate limiting works section', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(container.textContent).toContain('How Rate Limiting Works');
      expect(container.textContent).toContain('Token Bucket Algorithm');
      expect(container.textContent).toContain('Burst Handling');
      expect(container.textContent).toContain('Queue & Retry');
      expect(container.textContent).toContain('Per-Endpoint Config');
    });
  });

  it('handles API error gracefully', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      const pulse = container.querySelector('.animate-pulse');
      expect(pulse).toBeFalsy();
    });
  });

  it('calculates average RPS correctly', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // (10 + 5) / 2 = 7.5
      expect(container.textContent).toContain('7.5');
    });
  });

  it('calculates peak RPS correctly', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // max(10, 5) = 10.0
      expect(container.textContent).toContain('10.0');
    });
  });

  it('displays throttled count as 0 initially', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      const greenElements = container.querySelectorAll('.text-green-600');
      expect(greenElements.length).toBeGreaterThan(0);
    });
  });

  it('computes RPM from RPS', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      const tds = container.querySelectorAll('td');
      const tdTexts = Array.from(tds).map(td => td.textContent);
      expect(tdTexts).toContain('600');
      expect(tdTexts).toContain('300');
    });
  });

  it('fetches rate limits on mount with token', async () => {
    mockApiFetch.mockResolvedValue(MOCK_RATE_LIMITS);
    render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/rate-limits', { token: 'test-token' });
    });
  });
});
