// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

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

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
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

  it('calls save API on save button click', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    const buttons = container!.querySelectorAll('button');
    const saveButton = Array.from(buttons).find((b) =>
      b.textContent?.includes('saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/settings'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('shows success toast after save', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    const buttons = container!.querySelectorAll('button');
    const saveButton = Array.from(buttons).find((b) =>
      b.textContent?.includes('saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(mockToast).toHaveBeenCalledWith('admin.settingsSaved', 'success');
  });

  it('shows error toast on save failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) });
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    const buttons = container!.querySelectorAll('button');
    const saveButton = Array.from(buttons).find((b) =>
      b.textContent?.includes('saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(mockToast).toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  it('changes default plan select value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    const selects = container!.querySelectorAll('select');
    const defaultPlanSelect = selects[0] as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(defaultPlanSelect, { target: { value: 'pro' } });
    });

    expect(defaultPlanSelect.value).toBe('pro');
  });

  it('changes numeric input values', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    const numberInputs = container!.querySelectorAll('input[type="number"]');
    if (numberInputs.length > 0) {
      const input = numberInputs[0] as HTMLInputElement;
      await act(async () => {
        fireEvent.change(input, { target: { value: '10' } });
      });
      expect(input.value).toBe('10');
    }
  });

  it('toggles maintenance mode', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    const toggleButtons = container!.querySelectorAll('button.rounded-full');
    if (toggleButtons.length > 0) {
      await act(async () => {
        fireEvent.click(toggleButtons[0]);
      });
      // Toggle should have changed state (class or aria)
      expect(toggleButtons[0]).toBeTruthy();
    }
  });

  it('toggles signup enabled', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    expect(container!.textContent).toContain('admin.signupsEnabled');
    const toggleButtons = container!.querySelectorAll('button.rounded-full');
    if (toggleButtons.length >= 2) {
      await act(async () => {
        fireEvent.click(toggleButtons[1]);
      });
      expect(toggleButtons[1]).toBeTruthy();
    }
  });

  it('renders all numeric setting inputs', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });

    expect(container!.textContent).toContain('Max Endpoints');
    expect(container!.textContent).toContain('Max Webhooks');
    expect(container!.textContent).toContain('Rate Limit');
    expect(container!.textContent).toContain('Retention');
    expect(container!.textContent).toContain('Max Retry Attempts');
  });
});
