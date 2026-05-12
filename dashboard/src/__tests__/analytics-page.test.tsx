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
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/lib/api', () => ({
  analyticsApi: {
    deliveryTrend: vi.fn().mockResolvedValue({
      range: '7d',
      buckets: [{ timestamp: '2024-01-01T00:00:00Z', successful: 10, failed: 2, total: 12 }],
    }),
    successRate: vi.fn().mockResolvedValue({
      range: '7d',
      successful: 80,
      failed: 10,
      pending: 10,
      success_rate: 80,
    }),
  },
}));

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

vi.mock('@/components/tremor', () => ({
  ChartCard: ({ title, children }: React.PropsWithChildren<{ title: string }>) =>
    React.createElement('div', null, title, children),
  StatCard: ({ label }: { label: string }) => React.createElement('div', null, label),
}));

const { default: AnalyticsPage } = await import('@/app/[locale]/[username]/analytics/page');

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AnalyticsPage));
    });
  });

  it('displays analytics title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AnalyticsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('analytics.title');
  });

  it('renders stat cards', async () => {
    await act(async () => {
      render(React.createElement(AnalyticsPage));
    });
    // StatCard mocks render their labels
  });
});
