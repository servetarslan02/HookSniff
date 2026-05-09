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

const mockGetStats = vi.fn().mockResolvedValue({
  total_users: 10,
  total_endpoints: 50,
  total_deliveries: 1000,
  total_revenue: 5000,
  active_users_today: 3,
  users_by_plan: [
    { plan: 'free', count: 7 },
    { plan: 'pro', count: 3 },
  ],
  recent_signups: [],
});

vi.mock('@/lib/api', () => ({
  adminApi: {
    getStats: mockGetStats,
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

const { default: AdminOverviewPage } = await import('@/app/[locale]/admin/page');

describe('AdminOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStats.mockResolvedValue({
      total_users: 10,
      total_endpoints: 50,
      total_deliveries: 1000,
      total_revenue: 5000,
      active_users_today: 3,
      users_by_plan: [
        { plan: 'free', count: 7 },
        { plan: 'pro', count: 3 },
      ],
      recent_signups: [],
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AdminOverviewPage));
    });
  });

  it('fetches admin stats on mount', async () => {
    await act(async () => {
      render(React.createElement(AdminOverviewPage));
    });
    expect(mockGetStats).toHaveBeenCalledWith('test-token');
  });

  it('displays admin overview title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminOverviewPage));
      container = result.container;
    });
    // After loading, the page shows hardcoded "Admin Overview"
    expect(container!.textContent).toContain('Admin Overview');
  });

  it('shows loading state initially', async () => {
    mockGetStats.mockReturnValueOnce(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminOverviewPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('loadingDashboard');
  });

  it('shows stat cards after loading', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminOverviewPage));
      container = result.container;
    });
    const statCards = container!.querySelectorAll('[data-testid="stat-card"]');
    expect(statCards.length).toBe(4);
  });
});
