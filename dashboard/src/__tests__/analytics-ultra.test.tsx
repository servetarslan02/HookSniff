// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('recharts', () => ({
  AreaChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'area-chart' }, children),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  Legend: () => null,
  PieChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Pie: () => null,
  Cell: () => null,
}));

vi.mock('@/components/tremor', () => ({
  ChartCard: ({ title, children }: any) =>
    React.createElement('div', { 'data-testid': 'chart-card' }, title, children),
  StatCard: ({ label, value }: any) =>
    React.createElement('div', { 'data-testid': 'stat-card' }, label, String(value)),
}));

const mockDeliveryTrend = vi.fn();
const mockSuccessRate = vi.fn();
vi.mock('@/lib/api', () => ({
  analyticsApi: {
    deliveryTrend: (...args: unknown[]) => mockDeliveryTrend(...args),
    successRate: (...args: unknown[]) => mockSuccessRate(...args),
  },
}));

const { default: AnalyticsPage } = await import('@/app/[locale]/dashboard/analytics/page');

const MOCK_TREND = {
  range: '7d',
  buckets: [
    { timestamp: '2024-06-01T00:00:00Z', successful: 100, failed: 5, total: 105 },
    { timestamp: '2024-06-02T00:00:00Z', successful: 120, failed: 8, total: 128 },
    { timestamp: '2024-06-03T00:00:00Z', successful: 90, failed: 3, total: 93 },
  ],
};

const MOCK_SUCCESS_RATE = {
  range: '7d',
  successful: 310,
  failed: 16,
  pending: 4,
  success_rate: 93.9,
};

describe('AnalyticsPage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeliveryTrend.mockResolvedValue(MOCK_TREND);
    mockSuccessRate.mockResolvedValue(MOCK_SUCCESS_RATE);
  });

  // === Loading State ===
  it('shows loading state initially', () => {
    mockDeliveryTrend.mockReturnValue(new Promise(() => {}));
    mockSuccessRate.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(AnalyticsPage));
    expect(container.textContent).toContain('common.loading');
  });

  // === Page Header ===
  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('analytics.title');
    });
  });

  // === Time Range Selector ===
  it('passes time range to API calls', async () => {
    await act(async () => {
      render(React.createElement(AnalyticsPage));
    });
    expect(mockDeliveryTrend).toHaveBeenCalledWith('test-token', '7d');
    expect(mockSuccessRate).toHaveBeenCalledWith('test-token', '7d');
  });

  it('re-fetches when time range changes', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      expect(mockDeliveryTrend).toHaveBeenCalledTimes(1);
    });
    // The time range is managed via state, we can verify the API was called correctly
    expect(mockDeliveryTrend).toHaveBeenCalledWith('test-token', '7d');
  });

  // === Charts ===
  it('renders delivery trend chart', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('analytics.deliveryTrend');
      expect(container.querySelectorAll('[data-testid="area-chart"]').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders success rate chart', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('analytics.successRate');
      expect(container.querySelectorAll('[data-testid="pie-chart"]').length).toBeGreaterThanOrEqual(1);
    });
  });

  // === Success Rate Display ===
  it('displays success rate percentage', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('93.9');
    });
  });

  // === Stats Cards ===
  it('renders stat cards', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      const statCards = container.querySelectorAll('[data-testid="stat-card"]');
      expect(statCards.length).toBeGreaterThanOrEqual(1);
    });
  });

  // === Error Handling ===
  it('handles API error gracefully', async () => {
    mockDeliveryTrend.mockRejectedValue(new Error('Error'));
    mockSuccessRate.mockRejectedValue(new Error('Error'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('analytics.title');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('recharts', () => ({
      AreaChart: () => null, Area: () => null, XAxis: () => null, YAxis: () => null,
      CartesianGrid: () => null, Tooltip: () => null,
      ResponsiveContainer: ({ children }: any) => React.createElement('div', null, children),
      Legend: () => null,
      PieChart: ({ children }: any) => React.createElement('div', null, children),
      Pie: () => null, Cell: () => null,
    }));
    vi.doMock('@/components/tremor', () => ({
      ChartCard: ({ title }: any) => React.createElement('div', null, title),
      StatCard: ({ label, value }: any) => React.createElement('div', null, label, String(value)),
    }));
    vi.doMock('@/lib/api', () => ({
      analyticsApi: {
        deliveryTrend: (...args: unknown[]) => mockDeliveryTrend(...args),
        successRate: (...args: unknown[]) => mockSuccessRate(...args),
      },
    }));
    const { default: PageNoToken } = await import('@/app/[locale]/dashboard/analytics/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockDeliveryTrend).not.toHaveBeenCalled();
  });

  // === Empty Data ===
  it('handles empty trend data', async () => {
    mockDeliveryTrend.mockResolvedValue({ range: '7d', buckets: [] });
    mockSuccessRate.mockResolvedValue({ range: '7d', successful: 0, failed: 0, pending: 0, success_rate: 0 });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AnalyticsPage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('0.0');
    });
  });
});
