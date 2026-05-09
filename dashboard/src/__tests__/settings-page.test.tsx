// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigator.clipboard
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
});
