// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

// ─── Mocks ───
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement('a', props, children),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
    isLoading: false,
  }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

// API mocks
const mockStatsApiGet = vi.fn();
const mockWebhooksApiList = vi.fn();
const mockAnalyticsApiDeliveryTrend = vi.fn();
const mockAnalyticsApiSuccessRate = vi.fn();

vi.mock('@/lib/api', () => ({
  statsApi: { get: mockStatsApiGet },
  webhooksApi: { list: mockWebhooksApiList },
  analyticsApi: {
    deliveryTrend: mockAnalyticsApiDeliveryTrend,
    successRate: mockAnalyticsApiSuccessRate,
  },
}));

// recharts mock
vi.mock('recharts', () => ({
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: React.PropsWithChildren) =>
    React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  PieChart: ({ children }: React.PropsWithChildren) =>
    React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Pie: () => null,
  Cell: () => null,
  AreaChart: ({ children }: React.PropsWithChildren) =>
    React.createElement('div', { 'data-testid': 'area-chart' }, children),
  Area: () => null,
  Legend: () => null,
}));

vi.mock('@/components/OnboardingWizard', () => ({
  OnboardingWizard: () => React.createElement('div', { 'data-testid': 'onboarding-wizard' }),
  SetupChecklist: () => React.createElement('div', { 'data-testid': 'setup-checklist' }),
}));

vi.mock('@/components/tremor', () => ({
  StatCard: ({ label, value, isPercent }: { label: string; value: React.ReactNode; isPercent?: boolean }) =>
    React.createElement('div', { 'data-testid': `stat-${label}` },
      React.createElement('span', null, label),
      React.createElement('span', null, typeof value === 'string' ? value : String(value)),
    ),
  ChartCard: ({ title, children }: React.PropsWithChildren<{ title: string }>) =>
    React.createElement('div', { 'data-testid': `chart-${title}` }, title, children),
  StatusBadge: ({ status }: { status: string }) =>
    React.createElement('span', { 'data-testid': 'status-badge' }, status),
}));

// ─── Test Data ───
const MOCK_STATS = {
  total_deliveries: 1542,
  delivered: 1400,
  failed: 92,
  pending: 50,
  success_rate: 90.8,
  endpoints_count: 12,
};

const MOCK_DELIVERIES = [
  { id: 'd123456789012', endpoint_id: 'ep1', event: 'order.created', status: 'delivered', attempt_count: 1, created_at: '2024-01-01T10:00:00Z', response_status: 200 },
  { id: 'd223456789012', endpoint_id: 'ep2', event: 'payment.failed', status: 'failed', attempt_count: 3, created_at: '2024-01-02T11:00:00Z', response_status: 500 },
  { id: 'd323456789012', endpoint_id: 'ep1', event: 'user.registered', status: 'pending', attempt_count: 0, created_at: '2024-01-03T12:00:00Z' },
  { id: 'd423456789012', endpoint_id: 'ep3', event: 'invoice.paid', status: 'delivered', attempt_count: 1, created_at: '2024-01-04T13:00:00Z', response_status: 201 },
  { id: 'd523456789012', endpoint_id: 'ep2', event: 'order.cancelled', status: 'delivered', attempt_count: 2, created_at: '2024-01-05T14:00:00Z', response_status: 200 },
];

const MOCK_TREND = {
  range: '24h',
  buckets: [
    { timestamp: '2024-01-01T00:00:00Z', successful: 10, failed: 2, total: 12 },
    { timestamp: '2024-01-01T06:00:00Z', successful: 15, failed: 1, total: 16 },
  ],
};

const MOCK_SUCCESS_RATE = {
  range: '24h',
  successful: 1400,
  failed: 92,
  pending: 50,
  success_rate: 90.8,
};

const { default: DashboardOverview } = await import('@/app/[locale]/dashboard/page');

describe('DashboardOverview - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockStatsApiGet.mockResolvedValue(MOCK_STATS);
    mockWebhooksApiList.mockResolvedValue({
      deliveries: MOCK_DELIVERIES,
      total: MOCK_DELIVERIES.length,
      page: 1,
      per_page: 20,
    });
    mockAnalyticsApiDeliveryTrend.mockResolvedValue(MOCK_TREND);
    mockAnalyticsApiSuccessRate.mockResolvedValue(MOCK_SUCCESS_RATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Loading State ───
  it('shows skeleton loading state before data loads', async () => {
    // Make all APIs hang
    mockStatsApiGet.mockReturnValueOnce(new Promise(() => {}));
    mockWebhooksApiList.mockReturnValueOnce(new Promise(() => {}));
    mockAnalyticsApiDeliveryTrend.mockReturnValueOnce(new Promise(() => {}));
    mockAnalyticsApiSuccessRate.mockReturnValueOnce(new Promise(() => {}));

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    // Should render skeleton shimmer cards
    expect(container!.querySelectorAll('.skeleton-shimmer').length).toBeGreaterThan(0);
  });

  it('hides skeleton after data loads', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.querySelectorAll('.skeleton-shimmer').length).toBe(0);
    });
  });

  // ─── Stats Cards ───
  it('renders all six stat cards', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('stats.totalDeliveries');
      expect(container!.textContent).toContain('delivered');
      expect(container!.textContent).toContain('failed');
      expect(container!.textContent).toContain('stats.successRate');
      expect(container!.textContent).toContain('pending');
      expect(container!.textContent).toContain('endpoints');
    });
  });

  it('displays correct stats labels', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      // Stats labels appear via StatCard mock
      expect(container!.textContent).toContain('stats.totalDeliveries');
      expect(container!.textContent).toContain('delivered');
      expect(container!.textContent).toContain('failed');
      expect(container!.textContent).toContain('stats.successRate');
      expect(container!.textContent).toContain('pending');
      expect(container!.textContent).toContain('endpoints');
    });
  });

  it('shows success rate as percentage value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('90.8');
    });
  });

  it('fetches stats with correct token', async () => {
    await act(async () => {
      render(React.createElement(DashboardOverview));
    });
    expect(mockStatsApiGet).toHaveBeenCalledWith('test-token');
  });

  it('fetches deliveries with page 1', async () => {
    await act(async () => {
      render(React.createElement(DashboardOverview));
    });
    expect(mockWebhooksApiList).toHaveBeenCalledWith('test-token', { page: 1 });
  });

  // ─── Time Range Selector ───
  it('renders time range selector buttons', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('timeRange.24h');
      expect(container!.textContent).toContain('timeRange.7d');
      expect(container!.textContent).toContain('timeRange.30d');
    });
  });

  it('changes time range when button clicked', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('timeRange.7d');
    });

    const btn7d = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('timeRange.7d'),
    );
    await act(async () => {
      fireEvent.click(btn7d!);
    });

    await waitFor(() => {
      expect(mockAnalyticsApiDeliveryTrend).toHaveBeenCalledWith('test-token', '7d');
      expect(mockAnalyticsApiSuccessRate).toHaveBeenCalledWith('test-token', '7d');
    });
  });

  it('defaults to 24h time range', async () => {
    await act(async () => {
      render(React.createElement(DashboardOverview));
    });
    // Default analytics calls should be with '24h'
    expect(mockAnalyticsApiDeliveryTrend).toHaveBeenCalledWith('test-token', '24h');
    expect(mockAnalyticsApiSuccessRate).toHaveBeenCalledWith('test-token', '24h');
  });

  // ─── Charts ───
  it('renders delivery trend chart', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('deliveryTrend');
      expect(container!.querySelectorAll('[data-testid="area-chart"]').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders success rate donut chart', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('successRate');
      expect(container!.querySelectorAll('[data-testid="pie-chart"]').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows chart loading state', async () => {
    mockAnalyticsApiDeliveryTrend.mockReturnValueOnce(new Promise(() => {}));
    mockAnalyticsApiSuccessRate.mockReturnValueOnce(new Promise(() => {}));

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    // Chart loading shows "loadingChart" text
    expect(container!.textContent).toContain('loadingChart');
  });

  it('shows no-data message when trend data has empty buckets', async () => {
    mockAnalyticsApiDeliveryTrend.mockResolvedValueOnce({ range: '24h', buckets: [] });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('noData');
    });
  });

  // ─── Recent Deliveries Table ───
  it('renders recent deliveries table', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('recentDeliveries');
      expect(container!.textContent).toContain('order.created');
      expect(container!.textContent).toContain('payment.failed');
    });
  });

  it('displays delivery IDs truncated', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('d12345678901…');
    });
  });

  it('renders table headers for recent deliveries', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      const headers = container!.querySelectorAll('th');
      const headerTexts = Array.from(headers).map((h) => h.textContent);
      expect(headerTexts).toContain('ID');
      expect(headerTexts).toContain('Event');
      expect(headerTexts).toContain('Status');
      expect(headerTexts).toContain('Attempts');
      expect(headerTexts).toContain('Time');
    });
  });

  it('renders status badges for deliveries', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      const badges = container!.querySelectorAll('[data-testid="status-badge"]');
      expect(badges.length).toBe(MOCK_DELIVERIES.length);
    });
  });

  it('shows "viewAll" link to deliveries page', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      const link = container!.querySelector('a[href="/dashboard/deliveries"]');
      expect(link).toBeTruthy();
      expect(link!.textContent).toContain('viewAll');
    });
  });

  it('limits recent deliveries to 5', async () => {
    // Provide 10 deliveries but dashboard should show only 5
    const tenDeliveries = Array.from({ length: 10 }, (_, i) => ({
      id: `d${String(i).padStart(11, '0')}`,
      endpoint_id: 'ep1',
      event: `event.${i}`,
      status: 'delivered',
      attempt_count: 1,
      created_at: '2024-01-01T10:00:00Z',
    }));
    mockWebhooksApiList.mockResolvedValueOnce({
      deliveries: tenDeliveries,
      total: 10,
      page: 1,
      per_page: 20,
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      const rows = container!.querySelectorAll('tbody tr');
      expect(rows.length).toBe(5);
    });
  });

  // ─── Empty Dashboard ───
  it('shows empty message when no deliveries', async () => {
    mockWebhooksApiList.mockResolvedValueOnce({
      deliveries: [],
      total: 0,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('noDeliveries');
    });
  });

  // ─── Activity Feed ───
  it('renders activity feed section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('liveActivity');
    });
  });

  it('shows auto-refresh indicator', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('autoRefresh5s');
    });
  });

  it('shows no-activity message when activity feed is empty', async () => {
    // webhooksApi.list returns empty for activity feed too
    mockWebhooksApiList.mockResolvedValue({
      deliveries: [],
      total: 0,
      page: 1,
      per_page: 20,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('noActivity');
    });
  });

  it('renders activity feed items with event names', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      // Activity feed shows deliveries
      expect(container!.textContent).toContain('order.created');
    });
  });

  // ─── Onboarding ───
  it('renders onboarding wizard and setup checklist', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    expect(container!.querySelectorAll('[data-testid="onboarding-wizard"]').length).toBe(1);
    expect(container!.querySelectorAll('[data-testid="setup-checklist"]').length).toBe(1);
  });

  // ─── Error Handling ───
  it('handles stats API error gracefully', async () => {
    mockStatsApiGet.mockRejectedValueOnce(new Error('Stats error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    // Should still render (no crash), with default 0 values
    await waitFor(() => {
      expect(container!.textContent).toContain('stats.totalDeliveries');
    });
  });

  it('handles deliveries API error gracefully', async () => {
    mockWebhooksApiList.mockRejectedValueOnce(new Error('List error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      // Should show empty deliveries / no deliveries
      expect(container!.textContent).toContain('noDeliveries');
    });
  });

  it('handles analytics API error gracefully', async () => {
    mockAnalyticsApiDeliveryTrend.mockRejectedValueOnce(new Error('Trend error'));
    mockAnalyticsApiSuccessRate.mockRejectedValueOnce(new Error('Rate error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    // Should still render charts area
    await waitFor(() => {
      expect(container!.textContent).toContain('deliveryTrend');
    });
  });

  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('title');
    });
  });

  // ─── Stats with zero values ───
  it('handles zero stats gracefully', async () => {
    mockStatsApiGet.mockResolvedValueOnce({
      total_deliveries: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
      success_rate: 0,
      endpoints_count: 0,
    });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(container!.textContent).toContain('stats.totalDeliveries');
    });
  });

  // ─── Refresh / Analytics reload on time range change ───
  it('refetches analytics when switching to 30d', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      container = result.container;
    });
    await waitFor(() => {
      expect(mockAnalyticsApiDeliveryTrend).toHaveBeenCalledTimes(1);
    });

    const btn30d = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('timeRange.30d'),
    );
    await act(async () => {
      fireEvent.click(btn30d!);
    });

    await waitFor(() => {
      expect(mockAnalyticsApiDeliveryTrend).toHaveBeenCalledWith('test-token', '30d');
    });
  });

  it('cleans up effect on unmount', async () => {
    let unmount: () => void;
    await act(async () => {
      const result = render(React.createElement(DashboardOverview));
      unmount = result.unmount;
    });
    // Should not throw on unmount
    await act(async () => {
      unmount!();
    });
  });
});
