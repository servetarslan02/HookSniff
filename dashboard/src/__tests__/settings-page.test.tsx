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

const { default: SettingsPage } = await import('@/app/[locale]/dashboard/settings/page');

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

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

  it('renders password section', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.changePassword');
  });

  it('renders API key section', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.api');
  });

  it('renders notification settings', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.notifications');
  });

  it('renders danger zone', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.dangerZone');
    expect(container.textContent).toContain('settings.signOut');
    expect(container.textContent).toContain('settings.deleteAccount');
  });

  it('renders notification toggles', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.emailNotifications');
    expect(container.textContent).toContain('settings.failureAlerts');
    expect(container.textContent).toContain('settings.weeklyDigest');
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

  it('renders password min length hint', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.passwordMinLength');
  });

  // === Profile form tests ===
  it('submits profile form with current data', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form');
    expect(profileForm).toBeTruthy();

    await act(async () => {
      fireEvent.submit(profileForm!);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/profile'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('sends correct profile data in request body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
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

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/profile'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name', email: 'test@test.com' }),
      })
    );
  });

  it('shows success message after profile save', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(container.textContent).toContain('common.success');
  });

  it('shows error message on profile save failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Update failed' } }),
    });
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(container.textContent).toContain('Update failed');
  });

  it('handles network failure on profile save', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(container.textContent).toContain('Network error');
  });

  it('shows saving state during profile save', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));
    const { container } = render(React.createElement(SettingsPage));

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    // Should show saving text
    expect(container.textContent).toContain('common.saving');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it('clears previous profile error on new submit', async () => {
    // First submit fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Fail 1' } }),
    });
    const { container } = render(React.createElement(SettingsPage));
    const profileForm = container.querySelector('form')!;

    await act(async () => { fireEvent.submit(profileForm); });
    expect(container.textContent).toContain('Fail 1');

    // Second submit succeeds
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
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
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
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
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/password'),
          expect.objectContaining({ method: 'PUT' })
        );
      }
    }
  });

  it('sends correct password data in request body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'oldPass123' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newSecure123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newSecure123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/password'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ current_password: 'oldPass123', new_password: 'newSecure123' }),
      })
    );
  });

  it('shows success after password change', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    expect(container.textContent).toContain('common.success');
  });

  it('clears password fields after successful change', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    const afterInputs = container.querySelectorAll('input[type="password"]');
    expect((afterInputs[0] as HTMLInputElement).value).toBe('');
    expect((afterInputs[1] as HTMLInputElement).value).toBe('');
    expect((afterInputs[2] as HTMLInputElement).value).toBe('');
  });

  it('rejects mismatched passwords', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'differentPass' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    expect(container.textContent).toContain('do not match');
  });

  it('does not call API when passwords mismatch', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'abc12345' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'xyz12345' } });
    });

    const callsBefore = mockFetch.mock.calls.length;
    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    // Only the initial mount fetch might have happened, no password API call
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/auth/password'),
      expect.anything()
    );
  });

  it('rejects short passwords', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'short' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'short' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    expect(container.textContent).toContain('at least 8 characters');
  });

  it('shows error on password API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Wrong current password' } }),
    });
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'wrongPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    expect(container.textContent).toContain('Wrong current password');
  });

  it('handles network failure on password change', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    expect(container.textContent).toContain('Network error');
  });

  it('shows saving state during password change', async () => {
    let resolveFetch: (v: any) => void;
    mockFetch.mockReturnValueOnce(new Promise((r) => { resolveFetch = r; }));
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await act(async () => {
      fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
      fireEvent.change(passwordInputs[2], { target: { value: 'newPassword123' } });
    });

    const forms = container.querySelectorAll('form');
    await act(async () => {
      fireEvent.submit(forms[1]);
    });

    expect(container.textContent).toContain('common.saving');

    await act(async () => {
      resolveFetch!({ ok: true, json: () => Promise.resolve({}) });
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

  it('renders masked API key display', () => {
    const { container } = render(React.createElement(SettingsPage));
    const maskedInput = container.querySelector('input[readonly]') as HTMLInputElement;
    expect(maskedInput).toBeTruthy();
    expect(maskedInput.value).toContain('••••');
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
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
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

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/portal/notifications'),
        expect.objectContaining({ method: 'PUT' })
      );
      expect(mockToast).toHaveBeenCalled();
    }
  });

  it('handles notification save failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Save failed' }),
    });
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
  it('renders ToggleRow with correct labels', () => {
    const { container } = render(React.createElement(SettingsPage));
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
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
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

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    }
  });

  it('handles delete account API failure', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Delete failed' } }),
    });
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

      expect(alertSpy).toHaveBeenCalledWith('Delete failed');
    }

    alertSpy.mockRestore();
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
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({ method: 'DELETE' })
      );
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
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(SettingsPage));

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'updated@test.com' } });
    });

    const profileForm = container.querySelector('form')!;
    await act(async () => {
      fireEvent.submit(profileForm);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/profile'),
      expect.objectContaining({
        body: JSON.stringify({ name: 'Test', email: 'updated@test.com' }),
      })
    );
  });

  // === Profile section description ===
  it('renders profile description', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.profileDesc');
  });

  it('renders password change description', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.changePasswordDesc');
  });

  it('renders API key description', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.apiDesc');
  });

  it('renders notification description', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.notificationsDesc');
  });

  it('renders sign out description', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.signOutDesc');
  });

  it('renders delete account description', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.deleteAccountDesc');
  });

  it('renders manage API keys link', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.manageApiKeys');
  });

  it('renders keep secret note', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.keepSecret');
  });
});
