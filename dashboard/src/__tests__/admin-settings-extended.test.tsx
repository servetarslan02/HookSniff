// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToast = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: '1', email: 'admin@test.com', plan: 'business', is_admin: true } }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: AdminSettingsPage } = await import('@/app/[locale]/admin/settings/page');

describe('AdminSettingsPage — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  // === Render ===
  it('renders without crashing', () => {
    render(React.createElement(AdminSettingsPage));
  });

  it('displays platform settings title', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.platformSettings');
  });

  it('renders description text', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Configure platform-wide defaults');
  });

  // === General section ===
  it('renders general section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.general');
  });

  it('renders maintenance mode toggle', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.maintenanceMode');
    expect(container.textContent).toContain('admin.maintenanceDesc');
  });

  it('renders signups enabled toggle', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.signupsEnabled');
    expect(container.textContent).toContain('admin.signupsDesc');
  });

  it('renders default plan select', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Default Plan');
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('default plan has free and pro options', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain('free');
    expect(options).toContain('pro');
  });

  it('default plan is initially free', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('free');
  });

  // === Toggle interactions ===
  it('toggles maintenance mode', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const buttons = container.querySelectorAll('button');
    // First toggle button is maintenance mode
    const maintenanceToggle = Array.from(buttons).find((b) => {
      const parent = b.closest('.flex.items-center.justify-between');
      return parent?.textContent?.includes('admin.maintenanceMode');
    });

    if (maintenanceToggle) {
      await act(async () => {
        fireEvent.click(maintenanceToggle);
      });
      // After click, maintenance mode should be enabled (red bg)
      expect(maintenanceToggle.className).toContain('bg-red-600');
    }
  });

  it('toggles signups enabled', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const buttons = container.querySelectorAll('button');
    const signupsToggle = Array.from(buttons).find((b) => {
      const parent = b.closest('.flex.items-center.justify-between');
      return parent?.textContent?.includes('admin.signupsEnabled');
    });

    if (signupsToggle) {
      await act(async () => {
        fireEvent.click(signupsToggle);
      });
      // After click, signups should be disabled (gray bg)
      expect(signupsToggle.className).toContain('bg-gray-300');
    }
  });

  // === Plan Limits section ===
  it('renders plan limits section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.planLimits');
  });

  it('renders free plan section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.freePlan');
  });

  it('renders pro plan section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.proPlan');
  });

  it('renders max endpoints inputs', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Max Endpoints');
  });

  it('renders max webhooks inputs', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Max Webhooks/Month');
  });

  it('renders rate limit inputs', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Rate Limit (req/min)');
  });

  it('renders retention inputs', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Retention (days)');
  });

  // === Number input interactions ===
  it('updates free max endpoints', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    // First number input should be max_endpoints_free
    if (numberInputs.length > 0) {
      await act(async () => {
        fireEvent.change(numberInputs[0], { target: { value: '10' } });
      });
      expect((numberInputs[0] as HTMLInputElement).value).toBe('10');
    }
  });

  it('updates free max webhooks', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    if (numberInputs.length > 1) {
      await act(async () => {
        fireEvent.change(numberInputs[1], { target: { value: '5000' } });
      });
      expect((numberInputs[1] as HTMLInputElement).value).toBe('5000');
    }
  });

  it('updates pro max endpoints', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    if (numberInputs.length > 4) {
      await act(async () => {
        fireEvent.change(numberInputs[4], { target: { value: '100' } });
      });
      expect((numberInputs[4] as HTMLInputElement).value).toBe('100');
    }
  });

  // === Default values ===
  it('has default max_endpoints_free of 5', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[0] as HTMLInputElement).value).toBe('5');
  });

  it('has default max_webhooks_free of 1000', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[1] as HTMLInputElement).value).toBe('1000');
  });

  it('has default rate_limit_free of 100', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[2] as HTMLInputElement).value).toBe('100');
  });

  it('has default retention_days_free of 7', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[3] as HTMLInputElement).value).toBe('7');
  });

  it('has default max_endpoints_pro of 50', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[4] as HTMLInputElement).value).toBe('50');
  });

  it('has default max_webhooks_pro of 50000', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[5] as HTMLInputElement).value).toBe('50000');
  });

  it('has default rate_limit_pro of 1000', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[6] as HTMLInputElement).value).toBe('1000');
  });

  it('has default retention_days_pro of 30', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    expect((numberInputs[7] as HTMLInputElement).value).toBe('30');
  });

  // === Retry settings section ===
  it('renders retry settings section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.retrySettings');
  });

  it('renders max retry attempts input', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Max Retry Attempts');
  });

  it('has default retry_max_attempts of 3', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    // Last number input is retry_max_attempts
    const retryInput = numberInputs[numberInputs.length - 1];
    expect((retryInput as HTMLInputElement).value).toBe('3');
  });

  it('updates retry max attempts', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    const retryInput = numberInputs[numberInputs.length - 1];
    await act(async () => {
      fireEvent.change(retryInput, { target: { value: '5' } });
    });
    expect((retryInput as HTMLInputElement).value).toBe('5');
  });

  it('renders retry description', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.retryDesc');
  });

  // === Save button ===
  it('renders save button', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.saveSettings');
  });

  it('calls API on save', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(AdminSettingsPage));

    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('admin.saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/settings'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('shows success toast after save', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(AdminSettingsPage));

    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('admin.saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(mockToast).toHaveBeenCalledWith('admin.settingsSaved', 'success');
  });

  it('shows error toast on save failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(AdminSettingsPage));

    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('admin.saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(mockToast).toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  it('shows saving state', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(AdminSettingsPage));

    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('admin.saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(container.textContent).toContain('common.saving');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('sends correct settings in request body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(AdminSettingsPage));

    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('admin.saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.default_plan).toBe('free');
    expect(body.max_endpoints_free).toBe(5);
    expect(body.maintenance_mode).toBe(false);
    expect(body.signup_enabled).toBe(true);
  });

  // === Change default plan ===
  it('changes default plan to pro', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(select, { target: { value: 'pro' } });
    });
    expect(select.value).toBe('pro');
  });

  // === Network error handling ===
  it('handles network error on save', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(React.createElement(AdminSettingsPage));

    const saveButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('admin.saveSettings')
    );

    await act(async () => {
      fireEvent.click(saveButton!);
    });

    expect(mockToast).toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  // === Parse zero value ===
  it('handles zero value input', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    await act(async () => {
      fireEvent.change(numberInputs[0], { target: { value: '0' } });
    });
    expect((numberInputs[0] as HTMLInputElement).value).toBe('0');
  });

  // === Parse invalid value ===
  it('handles NaN value input (defaults to 0)', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = container.querySelectorAll('input[type="number"]');
    await act(async () => {
      fireEvent.change(numberInputs[0], { target: { value: 'abc' } });
    });
    // parseInt('abc') || 0 = 0
    expect((numberInputs[0] as HTMLInputElement).value).toBe('0');
  });
});
