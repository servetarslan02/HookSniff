// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

// Mock @/i18n/navigation
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement('a', props, children),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

// Mock @/lib/store
vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    setApiKey: vi.fn(),
  }),
}));

// Mock @/lib/api
const mockStatsApiGet = vi.fn().mockResolvedValue({
  total_deliveries: 100,
  delivered: 80,
  failed: 10,
  pending: 10,
  success_rate: 80,
  endpoints_count: 5,
});
const mockWebhooksApiList = vi.fn().mockResolvedValue({
  deliveries: [
    { id: 'd1', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01' },
  ],
  total: 1,
  page: 1,
  per_page: 20,
});
const mockAnalyticsApiDeliveryTrend = vi.fn().mockResolvedValue({
  range: '24h',
  buckets: [{ timestamp: '2024-01-01T00:00:00Z', successful: 10, failed: 2, total: 12 }],
});
const mockAnalyticsApiSuccessRate = vi.fn().mockResolvedValue({
  range: '24h',
  successful: 80,
  failed: 10,
  pending: 10,
  success_rate: 80,
});

vi.mock('@/lib/api', () => ({
  statsApi: { get: mockStatsApiGet },
  webhooksApi: { list: mockWebhooksApiList },
  analyticsApi: {
    deliveryTrend: mockAnalyticsApiDeliveryTrend,
    successRate: mockAnalyticsApiSuccessRate,
  },
}));

// Mock recharts
vi.mock('recharts', () => ({
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => React.createElement('div', null, children),
  PieChart: ({ children }: React.PropsWithChildren) => React.createElement('div', null, children),
  Pie: () => null,
  Cell: () => null,
  AreaChart: ({ children }: React.PropsWithChildren) => React.createElement('div', null, children),
  Area: () => null,
  Legend: () => null,
}));

// Mock components
vi.mock('@/components/Onboarding', () => ({
  Onboarding: () => React.createElement('div', null, 'Onboarding'),
}));
vi.mock('@/components/tremor', () => ({
  StatCard: ({ label }: { label: string }) => React.createElement('div', null, label),
  ChartCard: ({ title, children }: React.PropsWithChildren<{ title: string }>) =>
    React.createElement('div', null, title, children),
  StatusBadge: ({ status }: { status: string }) => React.createElement('span', null, status),
}));

// Import component after mocks
const { default: DashboardOverview } = await import('@/app/[locale]/[username]/page');

describe('DashboardOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatsApiGet.mockResolvedValue({
      total_deliveries: 100,
      delivered: 80,
      failed: 10,
      pending: 10,
      success_rate: 80,
      endpoints_count: 5,
    });
    mockWebhooksApiList.mockResolvedValue({
      deliveries: [
        { id: 'd1', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01' },
      ],
      total: 1,
      page: 1,
      per_page: 20,
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(DashboardOverview));
    });
    expect(mockStatsApiGet).toHaveBeenCalled();
  });

  it('fetches stats on mount', async () => {
    await act(async () => {
      render(React.createElement(DashboardOverview));
    });
    expect(mockStatsApiGet).toHaveBeenCalledWith('test-token');
    expect(mockWebhooksApiList).toHaveBeenCalledWith('test-token', { page: 1 });
  });

  it('renders stat cards after loading', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    // StatCard mocks render their labels
    expect(container!.textContent).toContain('stats.totalDeliveries');
    expect(container!.textContent).toContain('delivered');
    expect(container!.textContent).toContain('failed');
  });

  it('renders time range selector', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    expect(container!.textContent).toContain('timeRange.24h');
    expect(container!.textContent).toContain('timeRange.7d');
    expect(container!.textContent).toContain('timeRange.30d');
  });

  it('renders recent deliveries section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    expect(container!.textContent).toContain('recentDeliveries');
  });

  it('handles API errors gracefully', async () => {
    mockStatsApiGet.mockRejectedValueOnce(new Error('Network error'));
    mockWebhooksApiList.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(React.createElement(DashboardOverview));
    });
    // Should not throw
  });
});
