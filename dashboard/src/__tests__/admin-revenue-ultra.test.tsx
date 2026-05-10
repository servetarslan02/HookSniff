// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';

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
  BarChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  PieChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Pie: () => null,
  Cell: () => null,
}));

vi.mock('@/components/tremor/StatCard', () => ({
  StatCard: ({ label, value }: any) =>
    React.createElement('div', { 'data-testid': 'stat-card' },
      React.createElement('span', null, label),
      React.createElement('span', null, String(value)),
    ),
}));

vi.mock('@/components/tremor/ChartCard', () => ({
  ChartCard: ({ title, children }: any) =>
    React.createElement('div', { 'data-testid': 'chart-card' }, title, children),
}));

const mockGetRevenue = vi.fn();
vi.mock('@/lib/api', () => ({
  adminApi: { getRevenue: (...args: unknown[]) => mockGetRevenue(...args) },
}));

const { default: AdminRevenuePage } = await import('@/app/[locale]/admin/revenue/page');

const MOCK_REVENUE = {
  mrr: 15000,
  churn_rate: 2.5,
  monthly_revenue: [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 13500 },
    { month: 'Mar', revenue: 15000 },
  ],
  revenue_by_plan: [
    { plan: 'free', revenue: 0, count: 500 },
    { plan: 'pro', revenue: 10000, count: 100 },
    { plan: 'business', revenue: 5000, count: 20 },
  ],
};

describe('AdminRevenuePage - Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRevenue.mockResolvedValue(MOCK_REVENUE);
  });

  // === Loading State ===
  it('shows loading state initially', () => {
    mockGetRevenue.mockReturnValue(new Promise(() => {}));
    const { container } = render(React.createElement(AdminRevenuePage));
    expect(container.textContent).toContain('common.loading');
  });

  // === Page Header ===
  it('renders page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Revenue Dashboard');
    });
  });

  it('renders description text', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Financial metrics');
    });
  });

  // === Stats Cards ===
  it('renders MRR stat card', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('admin.mrr');
      expect(container.textContent).toContain('$15,000');
    });
  });

  it('renders total revenue stat card', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('admin.totalRevenueLabel');
      // Total = 12000 + 13500 + 15000 = 40500
      expect(container.textContent).toContain('$40,500');
    });
  });

  it('renders churn rate stat card', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('admin.churnRate');
      expect(container.textContent).toContain('2.5');
    });
  });

  // === Charts ===
  it('renders monthly revenue chart', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('admin.monthlyRevenue');
      expect(container.querySelectorAll('[data-testid="bar-chart"]').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders revenue by plan section', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('admin.revenueByPlan');
      expect(container.querySelectorAll('[data-testid="pie-chart"]').length).toBeGreaterThanOrEqual(1);
    });
  });

  // === Plan Breakdown ===
  it('renders plan names in breakdown', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Free');
      expect(container.textContent).toContain('Pro');
      expect(container.textContent).toContain('Business');
    });
  });

  it('renders plan revenue values', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('$0'); // free
      expect(container.textContent).toContain('$10,000'); // pro
      expect(container.textContent).toContain('$5,000'); // business
    });
  });

  it('renders user counts per plan', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('500 users');
      expect(container.textContent).toContain('100 users');
      expect(container.textContent).toContain('20 users');
    });
  });

  // === Empty State ===
  it('shows no revenue message when plan data empty', async () => {
    mockGetRevenue.mockResolvedValue({ ...MOCK_REVENUE, revenue_by_plan: [] });
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('admin.noRevenue');
    });
  });

  it('handles null revenue data', async () => {
    mockGetRevenue.mockResolvedValue(null);
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      expect(container.textContent).toContain('$0');
    });
  });

  // === Error Handling ===
  it('handles API error gracefully', async () => {
    mockGetRevenue.mockRejectedValue(new Error('Unauthorized'));
    let container: HTMLElement;
    await act(async () => {
      container = render(React.createElement(AdminRevenuePage)).container;
    });
    await waitFor(() => {
      // Should still render with default values
      expect(container.textContent).toContain('Revenue Dashboard');
    });
  });

  // === No Token ===
  it('does not fetch when token is null', async () => {
    vi.resetModules();
    vi.doMock('@/lib/store', () => ({ useAuth: () => ({ token: null }) }));
    vi.doMock('next-intl', () => ({ useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key }));
    vi.doMock('@/i18n/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
    vi.doMock('recharts', () => ({
      BarChart: () => null, Bar: () => null, XAxis: () => null, YAxis: () => null,
      CartesianGrid: () => null, Tooltip: () => null,
      ResponsiveContainer: ({ children }: any) => React.createElement('div', null, children),
      PieChart: ({ children }: any) => React.createElement('div', null, children),
      Pie: () => null, Cell: () => null,
    }));
    vi.doMock('@/components/tremor/StatCard', () => ({
      StatCard: ({ label, value }: any) => React.createElement('div', null, label, String(value)),
    }));
    vi.doMock('@/components/tremor/ChartCard', () => ({
      ChartCard: ({ title, children }: any) => React.createElement('div', null, title, children),
    }));
    vi.doMock('@/lib/api', () => ({
      adminApi: { getRevenue: (...args: unknown[]) => mockGetRevenue(...args) },
    }));
    const { default: PageNoToken } = await import('@/app/[locale]/admin/revenue/page');
    await act(async () => {
      render(React.createElement(PageNoToken));
    });
    expect(mockGetRevenue).not.toHaveBeenCalled();
  });

  // === API Call ===
  it('calls adminApi.getRevenue with token', async () => {
    await act(async () => {
      render(React.createElement(AdminRevenuePage));
    });
    await waitFor(() => {
      expect(mockGetRevenue).toHaveBeenCalledWith('test-token');
    });
  });
});
