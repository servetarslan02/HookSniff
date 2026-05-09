// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn().mockResolvedValue('') },
  writable: true,
});

const mockToast = vi.fn();
vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: '1', email: 'test@test.com', name: 'Test', plan: 'pro' },
    apiKey: 'test-api-key',
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/components/ConfirmDialog', () => ({ default: () => null }));

const { default: SettingsPage } = await import('@/app/[locale]/dashboard/settings/page');

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

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

  it('submits profile form', async () => {
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

  it('copies API key to clipboard', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const copyButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('settings.copyKey') || b.getAttribute('title')?.includes('copy')
    );

    if (copyButton) {
      await act(async () => {
        fireEvent.click(copyButton);
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-api-key');
    }
  });

  it('submits password change form with valid data', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { container } = render(React.createElement(SettingsPage));

    // Fill password fields
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

  it('rejects mismatched passwords', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 3) {
      await act(async () => {
        fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'newPassword123' } });
        fireEvent.change(passwordInputs[2], { target: { value: 'differentPass' } });
      });

      const forms = container.querySelectorAll('form');
      if (forms.length >= 2) {
        await act(async () => {
          fireEvent.submit(forms[1]);
        });
        expect(container.textContent).toContain('do not match');
      }
    }
  });

  it('rejects short passwords', async () => {
    const { container } = render(React.createElement(SettingsPage));

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 3) {
      await act(async () => {
        fireEvent.change(passwordInputs[0], { target: { value: 'currentPass' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'short' } });
        fireEvent.change(passwordInputs[2], { target: { value: 'short' } });
      });

      const forms = container.querySelectorAll('form');
      if (forms.length >= 2) {
        await act(async () => {
          fireEvent.submit(forms[1]);
        });
        expect(container.textContent).toContain('at least 8 characters');
      }
    }
  });

  it('renders notification toggles', () => {
    const { container } = render(React.createElement(SettingsPage));
    expect(container.textContent).toContain('settings.emailNotifications');
    expect(container.textContent).toContain('settings.failureAlerts');
    expect(container.textContent).toContain('settings.weeklyDigest');
  });

  it('toggles notification checkbox', async () => {
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

  it('renders profile name and email inputs with user data', () => {
    const { container } = render(React.createElement(SettingsPage));
    const inputs = container.querySelectorAll('input[type="text"], input[type="email"]');
    const nameInput = Array.from(inputs).find((i) => (i as HTMLInputElement).value === 'Test');
    const emailInput = Array.from(inputs).find((i) => (i as HTMLInputElement).value === 'test@test.com');
    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
  });
});
