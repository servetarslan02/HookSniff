// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

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
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const { default: AdminSettingsPage } = await import('@/app/[locale]/admin/settings/page');

describe('AdminSettingsPage — Ultra Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  // Helper to find the save button
  const getSaveButton = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('admin.saveSettings') || b.textContent?.includes('common.saving')
    );

  // Helper to get all toggle buttons (rounded-full)
  const getToggles = (container: HTMLElement) =>
    container.querySelectorAll('button.rounded-full');

  // Helper to get all number inputs
  const getNumberInputs = (container: HTMLElement) =>
    container.querySelectorAll('input[type="number"]');

  // === 1. Renders without crashing ===
  it('1. renders without crashing', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  // === 2. Displays platform settings title ===
  it('2. displays platform settings title', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.platformSettings');
  });

  // === 3. Renders maintenance mode toggle ===
  it('3. renders maintenance mode toggle', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.maintenanceMode');
    expect(container.textContent).toContain('admin.maintenanceDesc');
    const toggles = getToggles(container);
    expect(toggles.length).toBeGreaterThanOrEqual(2);
  });

  // === 4. Renders signups enabled toggle ===
  it('4. renders signups enabled toggle', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.signupsEnabled');
    expect(container.textContent).toContain('admin.signupsDesc');
  });

  // === 5. Toggles maintenance mode on click ===
  it('5. toggles maintenance mode on click', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const toggles = getToggles(container);
    const maintenanceToggle = toggles[0];

    // Initially off
    expect(maintenanceToggle.className).toContain('bg-gray-300');

    await act(async () => {
      fireEvent.click(maintenanceToggle);
    });

    // After click, should be on (red)
    expect(maintenanceToggle.className).toContain('bg-red-600');
  });

  // === 6. Toggles signups enabled on click ===
  it('6. toggles signups enabled on click', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const toggles = getToggles(container);
    const signupsToggle = toggles[1];

    // Initially on (green)
    expect(signupsToggle.className).toContain('bg-green-600');

    await act(async () => {
      fireEvent.click(signupsToggle);
    });

    // After click, should be off (gray)
    expect(signupsToggle.className).toContain('bg-gray-300');
  });

  // === 7. Maintenance toggle shows correct color (red when on, gray when off) ===
  it('7. maintenance toggle shows red when on, gray when off', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const toggles = getToggles(container);
    const toggle = toggles[0];

    // Initially off → gray
    expect(toggle.className).toContain('bg-gray-300');
    expect(toggle.className).not.toContain('bg-red-600');

    // Click to turn on → red
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.className).toContain('bg-red-600');
    expect(toggle.className).not.toContain('bg-gray-300');

    // Click again to turn off → gray
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.className).toContain('bg-gray-300');
    expect(toggle.className).not.toContain('bg-red-600');
  });

  // === 8. Signups toggle shows correct color (green when on, gray when off) ===
  it('8. signups toggle shows green when on, gray when off', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const toggles = getToggles(container);
    const toggle = toggles[1];

    // Initially on → green
    expect(toggle.className).toContain('bg-green-600');
    expect(toggle.className).not.toContain('bg-gray-300');

    // Click to turn off → gray
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.className).toContain('bg-gray-300');
    expect(toggle.className).not.toContain('bg-green-600');

    // Click again to turn on → green
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.className).toContain('bg-green-600');
    expect(toggle.className).not.toContain('bg-gray-300');
  });

  // === 9. Renders default plan select ===
  it('9. renders default plan select', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('Default Plan');
    const select = container.querySelector('select');
    expect(select).toBeTruthy();
  });

  // === 10. Changes default plan to pro ===
  it('10. changes default plan to pro', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('free');

    await act(async () => {
      fireEvent.change(select, { target: { value: 'pro' } });
    });

    expect(select.value).toBe('pro');
  });

  // === 11. Changes default plan back to free ===
  it('11. changes default plan back to free', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'pro' } });
    });
    expect(select.value).toBe('pro');

    await act(async () => {
      fireEvent.change(select, { target: { value: 'free' } });
    });
    expect(select.value).toBe('free');
  });

  // === 12. Renders free plan section ===
  it('12. renders free plan section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.freePlan');
  });

  // === 13. Renders pro plan section ===
  it('13. renders pro plan section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.proPlan');
  });

  // === 14. Renders all free plan inputs ===
  it('14. renders all free plan inputs (endpoints, webhooks, rate_limit, retention)', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = getNumberInputs(container);
    // 4 free + 4 pro + 1 retry = 9 total
    expect(numberInputs.length).toBe(9);
    // First 4 are free plan inputs
    expect((numberInputs[0] as HTMLInputElement).value).toBe('5');    // max_endpoints_free
    expect((numberInputs[1] as HTMLInputElement).value).toBe('1000'); // max_webhooks_free
    expect((numberInputs[2] as HTMLInputElement).value).toBe('100');  // rate_limit_free
    expect((numberInputs[3] as HTMLInputElement).value).toBe('7');    // retention_days_free
  });

  // === 15. Renders all pro plan inputs ===
  it('15. renders all pro plan inputs', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const numberInputs = getNumberInputs(container);
    expect((numberInputs[4] as HTMLInputElement).value).toBe('50');    // max_endpoints_pro
    expect((numberInputs[5] as HTMLInputElement).value).toBe('50000'); // max_webhooks_pro
    expect((numberInputs[6] as HTMLInputElement).value).toBe('1000');  // rate_limit_pro
    expect((numberInputs[7] as HTMLInputElement).value).toBe('30');    // retention_days_pro
  });

  // === 16. Changes free max endpoints value ===
  it('16. changes free max endpoints value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[0] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '20' } });
    });
    expect(input.value).toBe('20');
  });

  // === 17. Changes free max webhooks value ===
  it('17. changes free max webhooks value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[1] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '2000' } });
    });
    expect(input.value).toBe('2000');
  });

  // === 18. Changes free rate limit value ===
  it('18. changes free rate limit value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[2] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '200' } });
    });
    expect(input.value).toBe('200');
  });

  // === 19. Changes free retention days value ===
  it('19. changes free retention days value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[3] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '14' } });
    });
    expect(input.value).toBe('14');
  });

  // === 20. Changes pro max endpoints value ===
  it('20. changes pro max endpoints value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[4] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '100' } });
    });
    expect(input.value).toBe('100');
  });

  // === 21. Changes pro max webhooks value ===
  it('21. changes pro max webhooks value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[5] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '100000' } });
    });
    expect(input.value).toBe('100000');
  });

  // === 22. Changes pro rate limit value ===
  it('22. changes pro rate limit value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[6] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '2000' } });
    });
    expect(input.value).toBe('2000');
  });

  // === 23. Changes pro retention days value ===
  it('23. changes pro retention days value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[7] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '60' } });
    });
    expect(input.value).toBe('60');
  });

  // === 24. Renders retry settings section ===
  it('24. renders retry settings section', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.retrySettings');
    expect(container.textContent).toContain('Max Retry Attempts');
    expect(container.textContent).toContain('admin.retryDesc');
  });

  // === 25. Changes retry max attempts value ===
  it('25. changes retry max attempts value', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const retryInput = getNumberInputs(container)[8] as HTMLInputElement;
    expect(retryInput.value).toBe('3');
    await act(async () => {
      fireEvent.change(retryInput, { target: { value: '7' } });
    });
    expect(retryInput.value).toBe('7');
  });

  // === 26. Retry input has min/max attributes ===
  it('26. retry input has min/max attributes', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const retryInput = getNumberInputs(container)[8] as HTMLInputElement;
    expect(retryInput.getAttribute('min')).toBe('0');
    expect(retryInput.getAttribute('max')).toBe('10');
  });

  // === 27. Renders save button ===
  it('27. renders save button', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);
    expect(saveBtn).toBeTruthy();
    expect(saveBtn!.textContent).toContain('admin.saveSettings');
  });

  // === 28. Save button shows saving state ===
  it('28. save button shows saving state', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    expect(container.textContent).toContain('common.saving');

    // Resolve to clean up
    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  // === 29. Successful save shows toast ===
  it('29. successful save shows success toast', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    expect(mockToast).toHaveBeenCalledWith('admin.settingsSaved', 'success');
    expect(mockToast).not.toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  // === 30. Failed save shows error toast ===
  it('30. failed save shows error toast', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    expect(mockToast).toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  // === 31. Save sends correct data to API ===
  it('31. save sends correct data to API', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({
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

  // === 32. Save includes Authorization header with token ===
  it('32. save includes Authorization header with token', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer test-token');
    expect(headers['Content-Type']).toBe('application/json');
  });

  // === 33. Save uses PUT method ===
  it('33. save uses PUT method', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
  });

  // === 34. All numeric inputs default to correct values ===
  it('34. all numeric inputs default to correct values', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const inputs = getNumberInputs(container);
    const expectedValues = [
      '5',     // max_endpoints_free
      '1000',  // max_webhooks_free
      '100',   // rate_limit_free
      '7',     // retention_days_free
      '50',    // max_endpoints_pro
      '50000', // max_webhooks_pro
      '1000',  // rate_limit_pro
      '30',    // retention_days_pro
      '3',     // retry_max_attempts
    ];
    expect(inputs.length).toBe(expectedValues.length);
    inputs.forEach((input, i) => {
      expect((input as HTMLInputElement).value).toBe(expectedValues[i]);
    });
  });

  // === 35. Update function properly merges state (toggle + input change) ===
  it('35. update function properly merges state', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const toggles = getToggles(container);
    const numberInputs = getNumberInputs(container);

    // Toggle maintenance mode
    await act(async () => {
      fireEvent.click(toggles[0]);
    });
    // Change a number input
    await act(async () => {
      fireEvent.change(numberInputs[0], { target: { value: '99' } });
    });

    // Save and verify both changes are present
    const saveBtn = getSaveButton(container);
    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.maintenance_mode).toBe(true);
    expect(body.max_endpoints_free).toBe(99);
    // Other values should remain unchanged
    expect(body.signup_enabled).toBe(true);
    expect(body.max_webhooks_free).toBe(1000);
  });

  // === 36. Renders plan limits section header ===
  it('36. renders plan limits section header', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.planLimits');
  });

  // === 37. Renders retry settings section header ===
  it('37. renders retry settings section header', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.retrySettings');
  });

  // === 38. Renders free plan label ===
  it('38. renders free plan label', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.freePlan');
  });

  // === 39. Renders pro plan label ===
  it('39. renders pro plan label', () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    expect(container.textContent).toContain('admin.proPlan');
  });

  // === 40. Save button is disabled during save ===
  it('40. save button is disabled during save', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container) as HTMLButtonElement;

    expect(saveBtn.disabled).toBe(false);

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(saveBtn.disabled).toBe(true);

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });

    // After resolve, should be enabled again
    await waitFor(() => {
      expect(saveBtn.disabled).toBe(false);
    });
  });

  // === 41. Multiple saves don't duplicate API calls while saving ===
  it('41. multiple rapid saves do not duplicate API calls while saving', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container) as HTMLButtonElement;

    // First click triggers save
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second click while saving — button is disabled, so no extra call
    await act(async () => {
      fireEvent.click(saveBtn);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Resolve
    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  // === 42. Save button text changes during saving ===
  it('42. save button text changes during saving', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));

    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container) as HTMLButtonElement;

    // Before save: shows "saveSettings"
    expect(saveBtn.textContent).toContain('admin.saveSettings');
    expect(saveBtn.textContent).not.toContain('common.saving');

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // During save: shows "saving"
    expect(saveBtn.textContent).toContain('common.saving');
    expect(saveBtn.textContent).not.toContain('admin.saveSettings');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });

    // After save: back to "saveSettings"
    await waitFor(() => {
      expect(saveBtn.textContent).toContain('admin.saveSettings');
    });
  });

  // === Bonus tests ===

  it('handles network error on save', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    expect(mockToast).toHaveBeenCalledWith('Failed to save settings', 'error');
  });

  it('saves changed values after multiple input modifications', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const inputs = getNumberInputs(container);

    // Change several inputs
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: '15' } });
      fireEvent.change(inputs[4], { target: { value: '200' } });
      fireEvent.change(inputs[8], { target: { value: '5' } });
    });

    const saveBtn = getSaveButton(container);
    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.max_endpoints_free).toBe(15);
    expect(body.max_endpoints_pro).toBe(200);
    expect(body.retry_max_attempts).toBe(5);
  });

  it('maintains default plan in saved data', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const select = container.querySelector('select') as HTMLSelectElement;

    await act(async () => {
      fireEvent.change(select, { target: { value: 'pro' } });
    });

    const saveBtn = getSaveButton(container);
    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.default_plan).toBe('pro');
  });

  it('handles NaN input gracefully (defaults to 0)', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[0] as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });

    expect(input.value).toBe('0');
  });

  it('handles empty input gracefully (defaults to 0)', async () => {
    const { container } = render(React.createElement(AdminSettingsPage));
    const input = getNumberInputs(container)[0] as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });

    expect(input.value).toBe('0');
  });

  it('uses NEXT_PUBLIC_API_URL for API endpoint', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'https://custom-api.example.com/v2';

    const { container } = render(React.createElement(AdminSettingsPage));
    const saveBtn = getSaveButton(container);

    await act(async () => {
      fireEvent.click(saveBtn!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom-api.example.com/v2/admin/settings',
      expect.anything()
    );

    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });
});
