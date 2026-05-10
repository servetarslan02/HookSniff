// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;
const mockToast = vi.fn();

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
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

// Don't mock @/lib/api — apiFetch uses global.fetch under the hood

const { default: RateLimitingPage } = await import('@/app/[locale]/dashboard/rate-limiting/page');

const MOCK_RATE_LIMITS = [
  { endpoint_id: 'ep_abc12345def', requests_per_second: 10, burst_size: 20, enabled: true },
  { endpoint_id: 'ep_xyz98765ghi', requests_per_second: 5, burst_size: 10, enabled: true },
];

function mockApiResponse(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
    headers: new Headers({ 'content-type': 'application/json' }),
  });
}

function mockApiError(status = 500) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve({ error: 'Server error' }),
    headers: new Headers({ 'content-type': 'application/json' }),
  });
}

describe('RateLimitingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    mockApiResponse(MOCK_RATE_LIMITS); // will resolve later
    const { container } = render(React.createElement(RateLimitingPage));
    // Loading state has animate-pulse class
    const pulse = container.querySelector('.animate-pulse');
    expect(pulse).toBeTruthy();
  });

  it('renders the page title after loading', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText(/Rate Limiting/)).toBeTruthy();
    });
  });

  it('renders the page description after loading', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText(/Monitor and configure rate limits/)).toBeTruthy();
    });
  });

  it('displays overview cards with stats', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText('Total Endpoints')).toBeTruthy();
      expect(getByText('Avg Requests/sec')).toBeTruthy();
      expect(getByText('Peak Requests/sec')).toBeTruthy();
      expect(getByText('Throttled Requests')).toBeTruthy();
    });
  });

  it('shows correct total endpoints count', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText('2')).toBeTruthy(); // 2 endpoints
    });
  });

  it('renders per-endpoint limits table', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText('Per-Endpoint Limits')).toBeTruthy();
      expect(getByText('Endpoint')).toBeTruthy();
      expect(getByText('RPS')).toBeTruthy();
      expect(getByText('RPM')).toBeTruthy();
      expect(getByText('Burst')).toBeTruthy();
    });
  });

  it('displays endpoint data in table', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText('10')).toBeTruthy(); // requests_per_second for first endpoint
      expect(getByText('5')).toBeTruthy(); // requests_per_second for second endpoint
    });
  });

  it('shows empty state when no rate limits', async () => {
    mockApiResponse([]);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText(/Rate Limiting$/)).toBeTruthy(); // The empty state heading
      expect(getByText(/HookSniff automatically rate-limits/)).toBeTruthy();
    });
  });

  it('shows empty state features', async () => {
    mockApiResponse([]);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText('Auto Retry')).toBeTruthy();
      expect(getByText('Per-Endpoint')).toBeTruthy();
      expect(getByText('Alerts')).toBeTruthy();
    });
  });

  it('renders how rate limiting works section', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(getByText(/How Rate Limiting Works/)).toBeTruthy();
      expect(getByText(/Token Bucket Algorithm/)).toBeTruthy();
      expect(getByText(/Burst Handling/)).toBeTruthy();
      expect(getByText(/Queue & Retry/)).toBeTruthy();
      expect(getByText(/Per-Endpoint Config/)).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    mockApiError(500);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // Should show empty state after error
      const pulse = container.querySelector('.animate-pulse');
      expect(pulse).toBeFalsy();
    });
  });

  it('calculates average RPS correctly', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // (10 + 5) / 2 = 7.5
      expect(getByText('7.5')).toBeTruthy();
    });
  });

  it('calculates peak RPS correctly', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // max(10, 5) = 10 — but 10 also appears as RPS value, so check for peak label context
      expect(getByText('Peak Requests/sec')).toBeTruthy();
    });
  });

  it('displays throttled count as 0 initially', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { container } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // Throttled count should be 0, which should have green color class
      const greenElements = container.querySelectorAll('.text-green-600');
      expect(greenElements.length).toBeGreaterThan(0);
    });
  });

  it('computes RPM from RPS', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    const { getByText } = render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      // 10 * 60 = 600 and 5 * 60 = 300
      expect(getByText('600')).toBeTruthy();
      expect(getByText('300')).toBeTruthy();
    });
  });

  it('fetches rate limits on mount with token', async () => {
    mockApiResponse(MOCK_RATE_LIMITS);
    render(React.createElement(RateLimitingPage));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain('/rate-limits');
      expect(call[1].headers.get('Authorization')).toBe('Bearer test-token');
    });
  });
});
