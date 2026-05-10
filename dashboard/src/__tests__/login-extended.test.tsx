// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockLogin = vi.fn();
const mockRegister = vi.fn();
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
    login: mockLogin,
    register: mockRegister,
  }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || 'md'}`),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const { default: LoginPage } = await import('@/app/[locale]/login/page');

describe('LoginPage - Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
    mockRegister.mockResolvedValue(undefined);
  });

  // === Login Form ===
  it('renders login form', () => {
    const { container } = render(React.createElement(LoginPage));
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('renders email input with type email', () => {
    const { container } = render(React.createElement(LoginPage));
    const input = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.required).toBe(true);
  });

  it('renders password input with type password', () => {
    const { container } = render(React.createElement(LoginPage));
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.required).toBe(true);
  });

  it('renders submit button', () => {
    const { container } = render(React.createElement(LoginPage));
    const button = container.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
    expect(button!.textContent).toContain('auth.signIn');
  });

  // === Input Changes ===
  it('allows typing in email field', () => {
    const { container } = render(React.createElement(LoginPage));
    const input = container.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'user@test.com' } });
    expect(input.value).toBe('user@test.com');
  });

  it('allows typing in password field', () => {
    const { container } = render(React.createElement(LoginPage));
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'mypassword' } });
    expect(input.value).toBe('mypassword');
  });

  // === Submit ===
  it('calls login on form submit', async () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123');
  });

  it('redirects to dashboard after successful login', async () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  // === Error Display ===
  it('displays error on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain('Invalid credentials');
  });

  it('displays error with red styling', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Server error'));
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    const errorDiv = container.querySelector('[class*="red"]');
    expect(errorDiv).toBeTruthy();
  });

  it('handles non-Error rejection', async () => {
    mockLogin.mockRejectedValueOnce('string error');
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain('Unknown error');
  });

  it('does not show error initially', () => {
    const { container } = render(React.createElement(LoginPage));
    const errorDiv = container.querySelector('[class*="red"]');
    expect(errorDiv).toBeNull();
  });

  // === Register Toggle ===
  it('shows sign up link in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.noAccount');
    expect(container.textContent).toContain('auth.signUp');
  });

  it('toggles to register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
    expect(container.textContent).toContain('auth.signupTitle');
    expect(container.textContent).toContain('auth.signupSubtitle');
  });

  it('shows name field in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).toBeTruthy();
    expect(container.textContent).toContain('auth.name');
  });

  it('hides name field in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).toBeNull();
  });

  it('shows create account button in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton!.textContent).toContain('auth.createAccount');
  });

  it('shows has account link in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
    expect(container.textContent).toContain('auth.hasAccount');
  });

  it('toggles back to login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
    expect(container.textContent).toContain('auth.signupTitle');

    const signInButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signIn')
    );
    act(() => { fireEvent.click(signInButton!); });
    expect(container.textContent).toContain('auth.loginTitle');
  });

  // === Register Submission ===
  it('calls register on submit in register mode', async () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockRegister).toHaveBeenCalledWith('john@test.com', 'securepass123', 'John Doe');
  });

  it('calls register without name when name is empty', async () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockRegister).toHaveBeenCalledWith('john@test.com', 'securepass123', undefined);
  });

  it('redirects to dashboard after successful register', async () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows error on register failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'));
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'existing@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain('Email already exists');
  });

  // === Loading State ===
  it('shows loading spinner during login', async () => {
    let resolveLogin: (value?: unknown) => void;
    mockLogin.mockReturnValueOnce(new Promise(r => { resolveLogin = r; }));

    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.querySelector('[data-testid="spinner"]')).toBeTruthy();

    await act(async () => { resolveLogin!(); });
  });

  it('disables submit button during loading', async () => {
    let resolveLogin: (value?: unknown) => void;
    mockLogin.mockReturnValueOnce(new Promise(r => { resolveLogin = r; }));

    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(submitButton.disabled).toBe(true);

    await act(async () => { resolveLogin!(); });
  });

  it('button has disabled opacity styling', async () => {
    let resolveLogin: (value?: unknown) => void;
    mockLogin.mockReturnValueOnce(new Promise(r => { resolveLogin = r; }));

    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(submitButton.className).toContain('disabled:opacity-60');

    await act(async () => { resolveLogin!(); });
  });

  // === Password Strength ===
  it('shows weak password strength in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => { fireEvent.change(passwordInput, { target: { value: 'abc' } }); });

    expect(container.textContent).toContain('Weak');
  });

  it('shows medium password strength', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => { fireEvent.change(passwordInput, { target: { value: 'Password1' } }); });

    expect(container.textContent).toContain('Medium');
  });

  it('shows strong password strength', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => { fireEvent.change(passwordInput, { target: { value: 'MyStr0ng!Pass' } }); });

    expect(container.textContent).toContain('Strong');
  });

  it('does not show password strength in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => { fireEvent.change(passwordInput, { target: { value: 'weak' } }); });

    expect(container.textContent).not.toContain('Weak');
    expect(container.textContent).not.toContain('Medium');
    expect(container.textContent).not.toContain('Strong');
  });

  it('renders password strength bars', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => { fireEvent.change(passwordInput, { target: { value: 'Test1234!' } }); });

    const bars = container.querySelectorAll('.rounded-full');
    expect(bars.length).toBeGreaterThanOrEqual(3);
  });

  // === Autocomplete ===
  it('email input has correct autocomplete', () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.autocomplete).toBe('email');
  });

  it('password has current-password autocomplete in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.autocomplete).toBe('current-password');
  });

  it('password has new-password autocomplete in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.autocomplete).toBe('new-password');
  });

  // === Password min length ===
  it('password input has minLength 8', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.minLength).toBe(8);
  });

  // === OAuth Buttons ===
  it('renders Google OAuth button', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('Google');
  });

  it('renders GitHub OAuth button', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('GitHub');
  });

  it('renders Or continue with separator', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('Or continue with');
  });

  // === Branding ===
  it('renders HookSniff branding', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('HookSniff');
  });

  it('renders LanguageSwitcher', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('LanguageSwitcher');
  });

  // === Name Input in Register Mode ===
  it('allows typing in name field', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    act(() => { fireEvent.change(nameInput, { target: { value: 'Jane Doe' } }); });
    expect(nameInput.value).toBe('Jane Doe');
  });

  // === Title display ===
  it('displays login title in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.loginTitle');
  });

  it('displays login subtitle in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.loginSubtitle');
  });

  it('displays signup title in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
    expect(container.textContent).toContain('auth.signupTitle');
  });

  it('displays signup subtitle in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
    expect(container.textContent).toContain('auth.signupSubtitle');
  });

  // === Labels ===
  it('renders email label', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.email');
  });

  it('renders password label', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.password');
  });

  // === Empty password strength ===
  it('does not show strength indicator for empty password in register', () => {
    const { container } = render(React.createElement(LoginPage));
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      b => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    // Empty password — strength should not be shown
    expect(container.textContent).not.toContain('Weak');
    expect(container.textContent).not.toContain('Medium');
    expect(container.textContent).not.toContain('Strong');
  });
});
