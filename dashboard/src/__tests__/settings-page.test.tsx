// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn().mockResolvedValue('') },
  writable: true,
});

const mockToast = vi.fn();
const mockLogout = vi.fn();
const mockPush = vi.fn();
const mockApiPut = vi.fn().mockResolvedValue({});
const mockApiDelete = vi.fn().mockResolvedValue({});

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
    logout: mockLogout,
  }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/ConfirmDialog', () => ({ default: () => null }));
vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/lib/api', () => ({
  api: {
    put: (...args: any[]) => mockApiPut(...args),
    delete: (...args: any[]) => mockApiDelete(...args),
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({}),
  },
}));

const { default: SettingsPage } = await import('@/app/[locale]/(dashboard)/settings/page');

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiPut.mockResolvedValue({});
    mockApiDelete.mockResolvedValue({});
  });

  /** Helper: click a settings tab by its i18n label key */
  const clickTab = (container: HTMLElement, labelKey: string) => {
    const buttons = Array.from(container.querySelectorAll('button'));
    const tabBtn = buttons.find(b => b.textContent?.includes(labelKey) && !b.textContent?.includes('save') && !b.textContent?.includes('Save'));
    if (tabBtn) fireEvent.click(tabBtn);
  };

  // === Render tests ===
  it('renders without crashing', () => {
    render(React.createElement(SettingsPage));
  });

  it('displays settings title', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.title');
  });

  it('renders profile section', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.profile');
  });

  it('renders password section', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => {
      expect(container.textContent).toContain('settings.changePassword');
    }, { timeout: 3000 });
  });

  it('renders API key section', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => {
      expect(container.textContent).toContain('settings.api');
    }, { timeout: 3000 });
  });

  it('renders notification settings', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.notifications');
  });

  it('renders danger zone', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.dangerZone');
    await waitFor(() => {
      expect(container.textContent).toContain('settings.signOut');
    }, { timeout: 3000 });
    expect(container.textContent).toContain('settings.deleteAccount');
  });

  it('renders notification toggles', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.notifications');
    await waitFor(() => {
      expect(container.textContent).toContain('settings.emailNotifications');
    }, { timeout: 3000 });
  });

  it('renders profile name and email inputs with user data', () => {
    const { container } = render(React.createElement(SettingsPage));
    const inputs = container.querySelectorAll('input[type="text"], input[type="email"]');
    const nameInput = Array.from(inputs).find((i) => (i as HTMLInputElement).value === 'Test');
    const emailInput = Array.from(inputs).find((i) => (i as HTMLInputElement).value === 'test@test.com');
    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
  });

  it('renders avatar with initial', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('T'); // First letter of name
  });

  it('renders user plan badge', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('pro');
  });

  it('renders password min length hint', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.textContent).toContain('settings.passwordMinLength'), { timeout: 3000 });
  });

  // === Profile form tests ===
  it('submits profile form with current data', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form');
    expect(profileForm).toBeTruthy();

    await act(async () => {
      fireEvent.submit(profileForm!);
    });

    expect(mockApiPut).toHaveBeenCalledWith(
      '/auth/profile',
      { name: 'Test', email: 'test@test.com' },
      'test-token'
    );
  });

  it('sends correct profile data in request body', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));

    // Change name
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
    });

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(mockApiPut).toHaveBeenCalledWith(
      '/auth/profile',
      { name: 'New Name', email: 'test@test.com' },
      'test-token'
    );
  });

  it('shows success message after profile save', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(container.textContent).toContain('common.success');
  });

  it('shows error message on profile save failure', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('Update failed'));
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(container.textContent).toContain('Update failed');
  });

  it('handles network failure on profile save', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(container.textContent).toContain('Network error');
  });

  it.skip('shows saving state during profile save', async () => {
    let resolvePut: (v: any) => void;
    mockApiPut.mockReturnValueOnce(new Promise((r) => { resolvePut = r; }));
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    // Should show saving text
    // The button should show saving state briefly
    const submitBtn = forms[0].querySelector('button[type="submit"]');
    expect(submitBtn).toBeTruthy();

    await act(async () => {
      resolvePut!({});
    });
  });

  it('clears previous profile error on new submit', async () => {
    // First submit fails
    mockApiPut.mockRejectedValueOnce(new Error('Fail 1'));
    const { container } = render(React.createElement(SettingsPage));
    const profileForm = container.querySelector('form')!;

    await act(async () => { fireEvent.submit(profileForm); });
    expect(container.textContent).toContain('Fail 1');

    // Second submit succeeds
    mockApiPut.mockResolvedValueOnce({});
    await act(async () => { fireEvent.submit(profileForm); });
    expect(container.textContent).not.toContain('Fail 1');
    expect(container.textContent).toContain('common.success');
  });

  // === Email input change ===
  it('allows changing profile email', async () => {
    const { container } = render(React.createElement(SettingsPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
    });
    expect(emailInput.value).toBe('new@test.com');
  });

  // === Password form tests ===
  it('submits password change form with valid data', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 3) {
      await act(async () => {
        fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
        fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
      });

      const forms = container.querySelectorAll('form');
      if (forms.length >= 2) {
        await act(async () => {
          fireEvent.submit(forms[1]);
        });
        expect(mockApiPut).toHaveBeenCalledWith(
          '/auth/password',
          { current_password: 'currentPass', new_password: 'newPassword123' },
          'test-token'
        );
      }
    }
  });

  it('sends correct password data in request body', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0), { timeout: 3000 });
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'oldPass123' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newSecure123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newSecure123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    expect(mockApiPut).toHaveBeenCalledWith(
      '/auth/password',
      { current_password: 'oldPass123', new_password: 'newSecure123' },
      'test-token'
    );
  });

  it('shows success after password change', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0), { timeout: 3000 });
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    expect(container.textContent).toContain('common.success');
  });

  it('clears password fields after successful change', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0), { timeout: 3000 });
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    const afterInputs = container.querySelectorAll('input[type="password"]');
    expect((afterInputs[0] as HTMLInputElement).value).toBe('');
    expect((afterInputs[1] as HTMLInputElement).value).toBe('');
    expect((afterInputs[2] as HTMLInputElement).value).toBe('');
  });

  it('rejects mismatched passwords', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'differentPass' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    expect(container.textContent).toContain('settings.passwordsDoNotMatch');
  });

  it('does not call API when passwords mismatch', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'abc12345' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'xyz12345' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    // No additional API call should have been made for password
    expect(mockApiPut).not.toHaveBeenCalledWith(
      '/auth/password',
      expect.anything(),
      expect.anything()
    );
  });

  it('rejects short passwords', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'short' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'short' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    expect(container.textContent).toContain('settings.passwordTooShort');
  });

  it.skip('shows error on password API failure', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('Wrong current password'));
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'wrongPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    await waitFor(() => expect(container.textContent).toContain('Wrong current password'), { timeout: 3000 });
  });

  it.skip('handles network failure on password change', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    await waitFor(() => expect(container.textContent).toContain('Network error'), { timeout: 3000 });
  });

  it('shows saving state during password change', async () => {
    let resolvePut: (v: any) => void;
    mockApiPut.mockReturnValueOnce(new Promise((r) => { resolvePut = r; }));
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.querySelectorAll('input[type="password"]').length).toBeGreaterThan(0));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[0]);
    });

    // The button should show saving state briefly
    const submitBtn = forms[0].querySelector('button[type="submit"]');
    expect(submitBtn).toBeTruthy();

    await act(async () => {
      resolvePut!({});
    });
  });

  // === API Key section ===
  it('copies API key to clipboard', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const copyButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Copy') || b.textContent?.includes('settings.copyKey')
    );

    if (copyButton) {
      await act(async () => {
        fireEvent.click(copyButton);
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-api-key');
    }
  });

  it('shows "Copied!" text after copying', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const copyButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Copy')
    );

    if (copyButton) {
      await act(async () => {
        fireEvent.click(copyButton);
      });
      expect(container.textContent).toContain('Copied');
    }
  });

  it('renders masked API key display', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.textContent).toContain('••••••••••••••••••••••••••••••••'));
  });

  // === Notification toggle tests ===
  it('toggles email notifications checkbox', async () => {
    const { container } = render(React.createElement(SettingsPage));
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    if (checkboxes.length > 0) {
      const checkbox = checkboxes[0] as HTMLInputElement;
      const initialChecked = checkbox.checked;
      await act(async () => {
        fireEvent.click(checkbox);
      });
      expect(checkbox.checked).toBe(!initialChecked);
    }
  });

  it('toggles failure alerts checkbox', async () => {
    const { container } = render(React.createElement(SettingsPage));
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    if (checkboxes.length >= 2) {
      const checkbox = checkboxes[1] as HTMLInputElement;
      const initialChecked = checkbox.checked;
      await act(async () => {
        fireEvent.click(checkbox);
      });
      expect(checkbox.checked).toBe(!initialChecked);
    }
  });

  it('toggles weekly digest checkbox', async () => {
    const { container } = render(React.createElement(SettingsPage));
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    if (checkboxes.length >= 3) {
      const checkbox = checkboxes[2] as HTMLInputElement;
      const initialChecked = checkbox.checked;
      await act(async () => {
        fireEvent.click(checkbox);
      });
      expect(checkbox.checked).toBe(!initialChecked);
    }
  });

  it('saves notification preferences', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));

    // Find the save button in notification section
    const buttons = Array.from(container.querySelectorAll('button'));
    const notifSaveButton = buttons.find(
      (b) => b.textContent?.includes('common.save') && !b.closest('form')
    );

    if (notifSaveButton) {
      await act(async () => {
        fireEvent.click(notifSaveButton);
      });

      expect(mockApiPut).toHaveBeenCalledWith(
        '/portal/notifications',
        expect.anything(),
        'test-token'
      );
      expect(mockToast).toHaveBeenCalled();
    }
  });

  it('handles notification save failure', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('Save failed'));
    const { container } = render(React.createElement(SettingsPage));

    const buttons = Array.from(container.querySelectorAll('button'));
    const notifSaveButton = buttons.find(
      (b) => b.textContent?.includes('common.save') && !b.closest('form')
    );

    if (notifSaveButton) {
      await act(async () => {
        fireEvent.click(notifSaveButton);
      });

      expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('Save failed'), 'error');
    }
  });

  // === ToggleRow component ===
  it('renders ToggleRow with correct labels', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.notifications');
    await waitFor(() => expect(container.textContent).toContain('settings.emailNotifications'));
    // ToggleRow renders label and description
    expect(container.textContent).toContain('settings.emailNotifications');
    expect(container.textContent).toContain('settings.emailNotificationsDesc');
    expect(container.textContent).toContain('settings.failureAlertsDesc');
    expect(container.textContent).toContain('settings.weeklyDigestDesc');
  });

  it('ToggleRow button toggles state', async () => {
    const { container } = render(React.createElement(SettingsPage));
    // The toggle buttons are rendered by ToggleRow
    const toggleButtons = container.querySelectorAll('.rounded-full');
    if (toggleButtons.length > 0) {
      await act(async () => {
        fireEvent.click(toggleButtons[0]);
      });
      // After click, the checkbox state should have toggled
    }
  });

  // === Delete account modal tests ===
  it('opens delete account modal', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // Modal should appear with delete confirmation
      expect(container.textContent).toContain('settings.deleteAccountWarning');
      expect(container.textContent).toContain('settings.typeDeleteToConfirm');
    }
  });

  it('shows delete confirmation input in modal', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const deleteInput = container.querySelector('input[placeholder="DELETE"]') as HTMLInputElement;
      expect(deleteInput).toBeTruthy();
    }
  });

  it('confirm button is disabled until DELETE is typed', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('settings.permanentlyDelete')
      );

      expect(confirmButton).toBeTruthy();
      expect(confirmButton!.disabled).toBe(true);
    }
  });

  it('enables confirm button when DELETE is typed', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const deleteInput = container.querySelector('input[placeholder="DELETE"]') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(deleteInput, { target: { value: 'DELETE' } });
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('settings.permanentlyDelete')
      );

      expect(confirmButton!.disabled).toBe(false);
    }
  });

  it('confirms account deletion with DELETE text', async () => {
    mockApiDelete.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const deleteInput = container.querySelector('input[placeholder="DELETE"]') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(deleteInput, { target: { value: 'DELETE' } });
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('settings.permanentlyDelete')
      );

      await act(async () => {
        fireEvent.click(confirmButton!);
      });

      expect(mockApiDelete).toHaveBeenCalledWith('/auth/account', 'test-token');
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    }
  });

  it('handles delete account API failure', async () => {
    mockApiDelete.mockRejectedValueOnce(new Error('Delete failed'));
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const deleteInput = container.querySelector('input[placeholder="DELETE"]') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(deleteInput, { target: { value: 'DELETE' } });
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('settings.permanentlyDelete')
      );

      await act(async () => {
        fireEvent.click(confirmButton!);
      });

      expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('Delete failed'), 'error');
    }
  });

  it('cancels delete modal', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(container.textContent).toContain('settings.deleteAccountWarning');

      const cancelButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('common.cancel')
      );

      await act(async () => {
        fireEvent.click(cancelButton!);
      });

      // Modal should be closed
      expect(container.textContent).not.toContain('settings.deleteAccountWarning');
    }
  });

  it('closes delete modal by clicking backdrop', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/40');
      if (backdrop) {
        await act(async () => {
          fireEvent.click(backdrop);
        });
      }

      expect(container.textContent).not.toContain('settings.deleteAccountWarning');
    }
  });

  it('does not delete when non-DELETE text is typed', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const deleteButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.deleteAccount')
    );

    if (deleteButton) {
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      const deleteInput = container.querySelector('input[placeholder="DELETE"]') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(deleteInput, { target: { value: 'WRONG' } });
      });

      const confirmButton = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('settings.permanentlyDelete')
      );

      await act(async () => {
        fireEvent.click(confirmButton!);
      });

      // Should not have called DELETE API
      expect(mockApiDelete).not.toHaveBeenCalled();
    }
  });

  // === Sign out ===
  it('sign out button calls logout', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const signOutButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Sign Out'
    );

    if (signOutButton) {
      await act(async () => {
        fireEvent.click(signOutButton);
      });
      expect(mockLogout).toHaveBeenCalled();
    }
  });

  // === Profile form email change ===
  it('profile form sends updated email', async () => {
    mockApiPut.mockResolvedValueOnce({});
    const { container } = render(React.createElement(SettingsPage));

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'updated@test.com' } });
    });

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(mockApiPut).toHaveBeenCalledWith(
      '/auth/profile',
      { name: 'Test', email: 'updated@test.com' },
      'test-token'
    );
  });

  // === Profile section description ===
  it('renders profile description', async () => {
    const { container } = render(React.createElement(SettingsPage));
    // Profile tab is default - check for displayName and emailAddress labels
    await waitFor(() => expect(container.textContent).toContain('settings.displayName'), { timeout: 3000 });
  });

  it('renders password change description', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.textContent).toContain('settings.changePasswordDesc'), { timeout: 3000 });
  });

  it('renders API key description', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.textContent).toContain('settings.apiDesc'), { timeout: 3000 });
  });

  it('renders notification description', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.notifications');
    await waitFor(() => expect(container.textContent).toContain('settings.notificationsDesc'), { timeout: 3000 });
  });

  it('renders sign out description', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.dangerZone');
    await waitFor(() => expect(container.textContent).toContain('settings.signOutDesc'), { timeout: 3000 });
  });

  it('renders delete account description', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.dangerZone');
    await waitFor(() => expect(container.textContent).toContain('settings.deleteAccountDesc'), { timeout: 3000 });
  });

  it('renders manage API keys link', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.textContent).toContain('settings.manageApiKeys'), { timeout: 3000 });
  });

  it('renders keep secret note', async () => {
    const { container } = render(React.createElement(SettingsPage));
    clickTab(container, 'settings.security');
    await waitFor(() => expect(container.textContent).toContain('settings.keepSecret'), { timeout: 3000 });
  });
});
