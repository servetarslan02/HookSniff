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

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockGetRevenue = vi.fn().mockResolvedValue({
  mrr: 500,
  monthly_revenue: [
    { month: '2024-01', revenue: 400 },
    { month: '2024-02', revenue: 500 },
  ],
  revenue_by_plan: [
    { plan: 'pro', revenue: 400, count: 8 },
    { plan: 'business', revenue: 100, count: 2 },
  ],
  churn_rate: 2.5,
});

vi.mock('@/lib/api', () => ({
  adminApi: {
    getRevenue: mockGetRevenue,
  },
}));

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Pie: () => React.createElement('div', null, 'Pie'),
  Cell: () => React.createElement('div', null, 'Cell'),
  BarChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  Bar: () => React.createElement('div', null, 'Bar'),
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => React.createElement('div', null, children),
}));

vi.mock('@/components/tremor/StatCard', () => ({
  StatCard: ({ label }: any) => React.createElement('div', { 'data-testid': 'stat-card' }, label),
}));

vi.mock('@/components/tremor/ChartCard', () => ({
  ChartCard: ({ title, children }: any) =>
    React.createElement('div', { 'data-testid': 'chart-card' }, title, children),
}));

const { default: AdminRevenuePage } = await import('@/app/[locale]/admin/revenue/page');

describe('AdminRevenuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRevenue.mockResolvedValue({
      mrr: 500,
      monthly_revenue: [
        { month: '2024-01', revenue: 400 },
        { month: '2024-02', revenue: 500 },
      ],
      revenue_by_plan: [
        { plan: 'pro', revenue: 400, count: 8 },
        { plan: 'business', revenue: 100, count: 2 },
      ],
      churn_rate: 2.5,
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AdminRevenuePage));
    });
  });

  it('fetches revenue on mount', async () => {
    await act(async () => {
      render(React.createElement(AdminRevenuePage));
    });
    expect(mockGetRevenue).toHaveBeenCalledWith('test-token');
  });

  it('displays revenue title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminRevenuePage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Revenue Dashboard');
  });

  it('shows loading state initially', async () => {
    mockGetRevenue.mockReturnValueOnce(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminRevenuePage));
      container = result.container;
    });
    expect(container!.textContent).toContain('revenue');
    expect(container!.textContent).toContain('loading');
  });
});
