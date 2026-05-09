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
  useAuth: () => ({
    token: 'test-token',
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: () => React.createElement('div', null, 'Loading'),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

const { default: LoginPage } = await import('@/app/[locale]/login/page');

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(React.createElement(LoginPage));
  });

  it('displays login title', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.loginTitle');
  });

  it('displays login subtitle', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.loginSubtitle');
  });

  it('renders email input', () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeTruthy();
  });

  it('renders password input', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
  });

  it('renders submit button', () => {
    const { container } = render(React.createElement(LoginPage));
    const button = container.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
    expect(button!.textContent).toContain('auth.signIn');
  });

  it('renders email label', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.email');
  });

  it('renders password label', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.password');
  });

  it('renders sign up link for new users', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.noAccount');
    expect(container.textContent).toContain('auth.signUp');
  });
});
