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

const { default: AdminSettingsPage } = await import('@/app/[locale]/admin/settings/page');

describe('AdminSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(React.createElement(AdminSettingsPage));
    });
  });

  it('displays settings title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('platformSettings');
  });

  it('renders default plan setting', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Default Plan');
    const selects = container!.querySelectorAll('select');
    expect(selects.length).toBeGreaterThan(0);
    // Default plan select should have 'free' as value
    const defaultPlanSelect = Array.from(selects).find((s) =>
      Array.from(s.options).some((o) => o.value === 'free' && o.value === s.value)
    );
    expect(defaultPlanSelect).toBeTruthy();
  });

  it('renders maintenance mode toggle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('maintenanceMode');
    // The toggle is a button with rounded-full class
    const toggleButtons = container!.querySelectorAll('button.rounded-full');
    expect(toggleButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders save button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('saveSettings');
    const buttons = container!.querySelectorAll('button');
    const saveButton = Array.from(buttons).find((b) =>
      b.textContent?.includes('saveSettings')
    );
    expect(saveButton).toBeTruthy();
  });
});
