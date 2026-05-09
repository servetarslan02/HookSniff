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
  useAuth: () => ({ token: 'test-token', user: { name: 'Test', email: 'test@test.com', plan: 'free' }, apiKey: 'sk_test_123', logout: vi.fn() }),
}));

const mockToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
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

  it('displays page title', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('admin.platformSettings');
  });

  it('displays subtitle description', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Configure platform-wide defaults and limits');
  });

  it('renders General section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('admin.general');
  });

  it('renders maintenance mode toggle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('admin.maintenanceMode');
    expect(container!.textContent).toContain('admin.maintenanceDesc');
  });

  it('renders signup enabled toggle', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('admin.signupsEnabled');
    expect(container!.textContent).toContain('admin.signupsDesc');
  });

  it('renders default plan select with options', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Default Plan');
    const selects = container!.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(1);
    const planSelect = selects[0] as HTMLSelectElement;
    expect(planSelect.options.length).toBe(2);
    expect(planSelect.options[0].value).toBe('free');
    expect(planSelect.options[1].value).toBe('pro');
  });

  it('changes default plan select value', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const selects = container!.querySelectorAll('select');
    const planSelect = selects[0] as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(planSelect, { target: { value: 'pro' } });
    });
    expect(planSelect.value).toBe('pro');
  });

  it('renders Plan Limits section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('admin.planLimits');
    expect(container!.textContent).toContain('admin.freePlan');
    expect(container!.textContent).toContain('admin.proPlan');
  });

  it('renders all free plan inputs with default values', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('Max Endpoints');
    expect(container!.textContent).toContain('Max Webhooks/Month');
    expect(container!.textContent).toContain('Rate Limit (req/min)');
    expect(container!.textContent).toContain('Retention (days)');
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    // 8 plan inputs (4 free + 4 pro) + 1 retry = 9
    expect(numberInputs.length).toBe(9);
  });

  it('has correct default values for free plan', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    // Free plan: max_endpoints=5, max_webhooks=1000, rate_limit=100, retention=7
    expect((numberInputs[0] as HTMLInputElement).value).toBe('5');
    expect((numberInputs[1] as HTMLInputElement).value).toBe('1000');
    expect((numberInputs[2] as HTMLInputElement).value).toBe('100');
    expect((numberInputs[3] as HTMLInputElement).value).toBe('7');
  });

  it('has correct default values for pro plan', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    // Pro plan: max_endpoints=50, max_webhooks=50000, rate_limit=1000, retention=30
    expect((numberInputs[4] as HTMLInputElement).value).toBe('50');
    expect((numberInputs[5] as HTMLInputElement).value).toBe('50000');
    expect((numberInputs[6] as HTMLInputElement).value).toBe('1000');
    expect((numberInputs[7] as HTMLInputElement).value).toBe('30');
  });

  it('changes free plan max endpoints', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    await act(async () => {
      fireEvent.change(numberInputs[0], { target: { value: '10' } });
    });
    expect((numberInputs[0] as HTMLInputElement).value).toBe('10');
  });

  it('changes pro plan max webhooks', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    await act(async () => {
      fireEvent.change(numberInputs[5], { target: { value: '100000' } });
    });
    expect((numberInputs[5] as HTMLInputElement).value).toBe('100000');
  });

  it('renders Retry Settings section', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('admin.retrySettings');
    expect(container!.textContent).toContain('Max Retry Attempts');
    expect(container!.textContent).toContain('admin.retryDesc');
  });

  it('has correct default retry max attempts', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    // Last input is retry_max_attempts
    const retryInput = numberInputs[numberInputs.length - 1] as HTMLInputElement;
    expect(retryInput.value).toBe('3');
  });

  it('changes retry max attempts', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    const retryInput = numberInputs[numberInputs.length - 1] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(retryInput, { target: { value: '5' } });
    });
    expect(retryInput.value).toBe('5');
  });

  it('renders save button', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    expect(container!.textContent).toContain('admin.saveSettings');
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    expect(saveBtn).toBeTruthy();
  });

  it('calls PUT /admin/settings on save', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/settings'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('sends correct settings body on save', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody).toEqual({
      default_plan: 'free',
      max_endpoints_free: 5,
      max_endpoints_pro: 50,
      max_webhooks_free: 1000,
      max_webhooks_pro: 50000,
      rate_limit_free: 100,
      rate_limit_pro: 1000,
      retry_max_attempts: 3,
      retention_days_free: 7,
      retention_days_pro: 30,
      maintenance_mode: false,
      signup_enabled: true,
    });
  });

  it('shows success toast on save success', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
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
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    expect(mockToast).toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  it('shows error toast on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    expect(mockToast).toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  it('toggles maintenance mode', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const toggleButtons = container!.querySelectorAll('button.rounded-full');
    expect(toggleButtons.length).toBe(2);
    // Initial state: maintenance_mode = false (bg-gray-300 class)
    await act(async () => {
      fireEvent.click(toggleButtons[0]);
    });
    // After toggle, save to verify the value changed
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.maintenance_mode).toBe(true);
  });

  it('toggles signup enabled', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const toggleButtons = container!.querySelectorAll('button.rounded-full');
    await act(async () => {
      fireEvent.click(toggleButtons[1]);
    });
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.signup_enabled).toBe(false);
  });

  it('shows saving state while saving', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    expect(container!.textContent).toContain('common.saving');
  });

  it('uses NEXT_PUBLIC_API_URL env var for API endpoint', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/v1';
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const buttons = container!.querySelectorAll('button');
    const saveBtn = Array.from(buttons).find(b => b.textContent?.includes('saveSettings'));
    await act(async () => {
      fireEvent.click(saveBtn!);
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/admin/settings',
      expect.anything()
    );
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it('handles parseInt fallback to 0 for invalid number input', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    await act(async () => {
      fireEvent.change(numberInputs[0], { target: { value: '' } });
    });
    // parseInt('') || 0 → 0, so the value becomes '0'
    expect((numberInputs[0] as HTMLInputElement).value).toBe('0');
  });

  it('renders retry input with min/max attributes', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(React.createElement(AdminSettingsPage));
      container = result.container;
    });
    const numberInputs = container!.querySelectorAll('input[type="number"]');
    const retryInput = numberInputs[numberInputs.length - 1] as HTMLInputElement;
    expect(retryInput.min).toBe('0');
    expect(retryInput.max).toBe('10');
  });
});
