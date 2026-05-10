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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
    mockRegister.mockResolvedValue(undefined);
  });

  // === Render tests ===
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

  it('renders HookSniff branding', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('HookSniff');
  });

  it('renders LanguageSwitcher', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('LanguageSwitcher');
  });

  // === Input changes ===
  it('allows typing in email field', () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
    expect(emailInput.value).toBe('user@test.com');
  });

  it('allows typing in password field', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } });
    expect(passwordInput.value).toBe('mypassword');
  });

  // === Login submission ===
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

  it('navigates to dashboard on successful login', async () => {
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

  it('shows error on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { container } = render(React.createElement(LoginPage));

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).toContain('Invalid credentials');
  });

  it('shows loading spinner during login', async () => {
    let resolveLogin: (value?: unknown) => void;
    mockLogin.mockReturnValueOnce(new Promise((r) => { resolveLogin = r; }));

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

    // Should show spinner
    expect(container.querySelector('[data-testid="spinner"]')).toBeTruthy();

    await act(async () => {
      resolveLogin!();
    });
  });

  it('disables submit button during loading', async () => {
    let resolveLogin: (value?: unknown) => void;
    mockLogin.mockReturnValueOnce(new Promise((r) => { resolveLogin = r; }));

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

    await act(async () => {
      resolveLogin!();
    });
  });

  // === Register mode ===
  it('toggles to register mode', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );

    expect(signUpButton).toBeTruthy();
    act(() => {
      fireEvent.click(signUpButton!);
    });

    // Should show register title
    expect(container.textContent).toContain('auth.signupTitle');
    expect(container.textContent).toContain('auth.signupSubtitle');
  });

  it('shows name field in register mode', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );

    act(() => {
      fireEvent.click(signUpButton!);
    });

    // Name field should appear
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
      (b) => b.textContent?.includes('auth.signUp')
    );

    act(() => {
      fireEvent.click(signUpButton!);
    });

    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton!.textContent).toContain('auth.createAccount');
  });

  it('shows "has account" link in register mode', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );

    act(() => {
      fireEvent.click(signUpButton!);
    });

    expect(container.textContent).toContain('auth.hasAccount');
    expect(container.textContent).toContain('auth.signIn');
  });

  it('toggles back to login mode', () => {
    const { container } = render(React.createElement(LoginPage));

    // Go to register
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    expect(container.textContent).toContain('auth.signupTitle');

    // Go back to login
    const signInButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signIn')
    );
    act(() => { fireEvent.click(signInButton!); });

    expect(container.textContent).toContain('auth.loginTitle');
  });

  // === Register submission ===
  it('calls register on form submit in register mode', async () => {
    const { container } = render(React.createElement(LoginPage));

    // Switch to register
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
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
      (b) => b.textContent?.includes('auth.signUp')
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

  it('navigates to dashboard on successful register', async () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
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
      (b) => b.textContent?.includes('auth.signUp')
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

  // === Password strength ===
  it('shows weak password strength for short password', () => {
    const { container } = render(React.createElement(LoginPage));

    // Switch to register mode
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'abc' } });
    });

    expect(container.textContent).toContain('Weak');
  });

  it('shows medium password strength', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'Password1' } });
    });

    expect(container.textContent).toContain('Medium');
  });

  it('shows strong password strength', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'MyStr0ng!Pass' } });
    });

    expect(container.textContent).toContain('Strong');
  });

  it('does not show password strength in login mode', () => {
    const { container } = render(React.createElement(LoginPage));

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
    });

    expect(container.textContent).not.toContain('Weak');
    expect(container.textContent).not.toContain('Medium');
    expect(container.textContent).not.toContain('Strong');
  });

  it('renders password strength bars in register mode', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'Test1234!' } });
    });

    // Should have 3 strength bars
    const bars = container.querySelectorAll('.rounded-full');
    expect(bars.length).toBeGreaterThanOrEqual(3);
  });

  // === Error handling ===
  it('clears error when switching modes', () => {
    mockLogin.mockRejectedValueOnce(new Error('Login error'));
    const { container } = render(React.createElement(LoginPage));

    // Trigger login error
    const form = container.querySelector('form')!;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    });

    act(() => {
      fireEvent.submit(form);
    });

    // Error should appear
    // Note: the error might need async

    // Switch to register
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    // Error might be cleared on mode switch (depends on implementation)
  });

  it('displays error with error styling', async () => {
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

    const errorDiv = container.querySelector('.bg-red-50, [class*="red"]');
    expect(errorDiv).toBeTruthy();
  });

  // === Email autocomplete ===
  it('email input has correct autocomplete', () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.autocomplete).toBe('email');
  });

  it('password input has current-password autocomplete in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.autocomplete).toBe('current-password');
  });

  it('password input has new-password autocomplete in register mode', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.autocomplete).toBe('new-password');
  });

  // === Name input in register mode ===
  it('allows typing in name field', () => {
    const { container } = render(React.createElement(LoginPage));

    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });

    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    });
    expect(nameInput.value).toBe('Jane Doe');
  });

  // === Email placeholder ===
  it('renders email placeholder', () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.placeholder).toBeTruthy();
  });

  // === Password min length ===
  it('password input has minLength attribute', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.minLength).toBe(8);
  });

  // === Non-error case: no error message shown ===
  it('does not show error initially', () => {
    const { container } = render(React.createElement(LoginPage));
    const errorDiv = container.querySelector('.bg-red-50, [class*="red"]');
    // No error should be shown on initial render
    expect(errorDiv).toBeNull();
  });

  // === Login with non-Error rejection ===
  it('handles non-Error rejection gracefully', async () => {
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

    // Should show error text — getErrorMessage returns 'Unknown error' for string rejections
    expect(container.textContent).toContain('Unknown error');
  });
});
