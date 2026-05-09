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
  StatCard: ({ title }: any) => React.createElement('div', { 'data-testid': 'stat-card' }, title),
}));

vi.mock('@/components/tremor/ChartCard', () => ({
  ChartCard: ({ title }: any) => React.createElement('div', { 'data-testid': 'chart-card' }, title),
}));

const { default: AdminSystemPage } = await import('@/app/[locale]/admin/system/page');

describe('AdminSystemPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          database: { status: 'healthy', latency_ms: 5 },
          redis: { status: 'connected', latency_ms: 2 },
          api: { status: 'ok', uptime_seconds: 86400 },
          queue: { pending: 0, processing: 0, failed: 0 },
        }),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AdminSystemPage));
    });
  });

  it('fetches system health on mount', async () => {
    await act(async () => {
      render(React.createElement(AdminSystemPage));
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('displays system title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('systemHealth');
  });

  it('shows loading state initially', async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSystemPage));
      container = result.container;
    });
    // During loading, the page shows skeleton cards (animate-pulse divs)
    const pulseElements = container!.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
