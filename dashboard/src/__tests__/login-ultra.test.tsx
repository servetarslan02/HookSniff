// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockLogin = vi.fn().mockResolvedValue(undefined);
const mockRegister = vi.fn().mockResolvedValue(undefined);
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
    login: mockLogin,
    register: mockRegister,
    token: 'test-token',
    user: null,
  }),
}));

vi.mock('@/lib/errors', () => ({
  getErrorMessage: (err: unknown) => (err instanceof Error ? err.message : 'Unknown error'),
}));

vi.mock('@/components/Toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => React.createElement('div', null, 'LanguageSwitcher'),
}));

vi.mock('@/components/LoadingSpinner', () => ({
  default: ({ size }: { size?: string }) => React.createElement('div', { 'data-testid': 'spinner' }, `Loading ${size || ''}`),
}));

const { default: LoginPage } = await import('@/app/[locale]/login/page');

describe('LoginPage Ultra', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
    mockRegister.mockResolvedValue(undefined);
    mockPush.mockClear();
  });

  // Helper to enter register mode
  function enterRegisterMode(container: HTMLElement) {
    const signUpButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signUp')
    );
    act(() => { fireEvent.click(signUpButton!); });
  }

  // 1. Renders without crashing
  it('renders without crashing', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container).toBeTruthy();
  });

  // 2. Renders login title
  it('renders login title', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.loginTitle');
  });

  // 3. Renders email input
  it('renders email input', () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]');
    expect(emailInput).toBeTruthy();
  });

  // 4. Renders password input
  it('renders password input', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
  });

  // 5. Renders sign in button
  it('renders sign in button', () => {
    const { container } = render(React.createElement(LoginPage));
    const button = container.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
    expect(button!.textContent).toContain('auth.signIn');
  });

  // 6. Does not show name input in login mode
  it('does not show name input in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).toBeNull();
  });

  // 7. Switches to register mode
  it('switches to register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);
    expect(container.textContent).toContain('auth.signupTitle');
  });

  // 8. Shows name input in register mode
  it('shows name input in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);
    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).toBeTruthy();
  });

  // 9. Shows create account button in register mode
  it('shows create account button in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);
    const button = container.querySelector('button[type="submit"]');
    expect(button!.textContent).toContain('auth.createAccount');
  });

  // 10. Switches back to login mode
  it('switches back to login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);
    expect(container.textContent).toContain('auth.signupTitle');

    const signInButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('auth.signIn')
    );
    act(() => { fireEvent.click(signInButton!); });
    expect(container.textContent).toContain('auth.loginTitle');
  });

  // 11. Shows signup subtitle in register mode
  it('shows signup subtitle in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);
    expect(container.textContent).toContain('auth.signupSubtitle');
  });

  // 12. Shows login subtitle in login mode
  it('shows login subtitle in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.loginSubtitle');
  });

  // 13. Password strength: weak for short password
  it('password strength: weak for short password', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'abc' } });
    });

    expect(container.textContent).toContain('Weak');
  });

  // 14. Password strength: medium for moderate password
  it('password strength: medium for moderate password', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'Password1' } });
    });

    expect(container.textContent).toContain('Medium');
  });

  // 15. Password strength: strong for complex password
  it('password strength: strong for complex password', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'MyStr0ng!Pass' } });
    });

    expect(container.textContent).toContain('Strong');
  });

  // 16. Password strength bar shows correct colors
  it('password strength bar shows correct colors', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'abcdefgh' } }); // score=2: length>=8 + lowercase
    });

    // Weak should have red bar on first segment (score >= 2 triggers first bar)
    const redBar = container.querySelector('.bg-red-500');
    expect(redBar).toBeTruthy();

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'Password1' } });
    });

    // Medium should have yellow bar
    const yellowBar = container.querySelector('.bg-yellow-500');
    expect(yellowBar).toBeTruthy();

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'MyStr0ng!Pass' } });
    });

    // Strong should have green bar
    const greenBar = container.querySelector('.bg-green-500');
    expect(greenBar).toBeTruthy();
  });

  // 17. Password strength label changes
  it('password strength label changes', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'abc' } });
    });
    expect(container.textContent).toContain('Weak');

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'Password1' } });
    });
    expect(container.textContent).toContain('Medium');

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'MyStr0ng!Pass' } });
    });
    expect(container.textContent).toContain('Strong');
  });

  // 18. Shows error message on login failure
  it('shows error message on login failure', async () => {
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

  // 19. Error message disappears on new submit
  it('error message disappears on new submit', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { container } = render(React.createElement(LoginPage));

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    });

    // First submit fails
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(container.textContent).toContain('Invalid credentials');

    // Second submit should clear error (even if it will succeed)
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'correctpass' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    // Error from first submit should be gone
    expect(container.textContent).not.toContain('Invalid credentials');
  });

  // 20. Shows loading spinner during submit
  it('shows loading spinner during submit', async () => {
    let resolveLogin: () => void;
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

    expect(container.querySelector('[data-testid="spinner"]')).toBeTruthy();

    await act(async () => {
      resolveLogin!();
    });
  });

  // 21. Sign in button disabled during loading
  it('sign in button disabled during loading', async () => {
    let resolveLogin: () => void;
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

    const button = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await act(async () => {
      resolveLogin!();
    });
  });

  // 22. Renders Google OAuth button
  it('renders Google OAuth button', () => {
    const { container } = render(React.createElement(LoginPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const googleBtn = buttons.find(b => b.textContent?.includes('Google'));
    expect(googleBtn).toBeTruthy();
  });

  // 23. Renders GitHub OAuth button
  it('renders GitHub OAuth button', () => {
    const { container } = render(React.createElement(LoginPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const githubBtn = buttons.find(b => b.textContent?.includes('GitHub'));
    expect(githubBtn).toBeTruthy();
  });

  // 24. Google button has correct SVG
  it('Google button has correct SVG', () => {
    const { container } = render(React.createElement(LoginPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const googleBtn = buttons.find(b => b.textContent?.includes('Google'))!;
    const svg = googleBtn.querySelector('svg');
    expect(svg).toBeTruthy();
    // Google SVG has viewBox and contains colored paths
    expect(svg!.querySelector('path[fill="#4285F4"]')).toBeTruthy();
  });

  // 25. GitHub button has correct SVG
  it('GitHub button has correct SVG', () => {
    const { container } = render(React.createElement(LoginPage));
    const buttons = Array.from(container.querySelectorAll('button'));
    const githubBtn = buttons.find(b => b.textContent?.includes('GitHub'))!;
    const svg = githubBtn.querySelector('svg');
    expect(svg).toBeTruthy();
    // GitHub SVG has a path with d attribute containing the octicon path
    expect(svg!.querySelector('path')).toBeTruthy();
  });

  // 26. Shows "Or continue with" divider
  it('shows "Or continue with" divider', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('Or continue with');
  });

  // 27. Shows "Don't have an account?" in login mode
  it('shows "Don\'t have an account?" in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('auth.noAccount');
  });

  // 28. Shows "Already have an account?" in register mode
  it('shows "Already have an account?" in register mode', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);
    expect(container.textContent).toContain('auth.hasAccount');
  });

  // 29. HookSniff logo renders
  it('HookSniff logo renders', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('HookSniff');
  });

  // 30. Password input has minLength={8}
  it('password input has minLength={8}', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.minLength).toBe(8);
  });

  // 31. Email input has required attribute
  it('email input has required attribute', () => {
    const { container } = render(React.createElement(LoginPage));
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  // 32. Name input renders in register mode with placeholder
  it('name input renders in register mode with placeholder', () => {
    const { container } = render(React.createElement(LoginPage));
    enterRegisterMode(container);
    const nameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    // The placeholder is the translated key
    expect(nameInput.placeholder).toBeTruthy();
    expect(nameInput.placeholder).toContain('auth.namePlaceholder');
  });

  // 33. LanguageSwitcher is rendered
  it('LanguageSwitcher is rendered', () => {
    const { container } = render(React.createElement(LoginPage));
    expect(container.textContent).toContain('LanguageSwitcher');
  });

  // 34. Error message disappears on new submit (re-submit after error, new error replaces)
  it('new error replaces old error on subsequent failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('First error'));

    const { container } = render(React.createElement(LoginPage));

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrong1' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });
    expect(container.textContent).toContain('First error');

    // Second submit with different error
    mockLogin.mockRejectedValueOnce(new Error('Second error'));

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'wrong2' } });
    });

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(container.textContent).not.toContain('First error');
    expect(container.textContent).toContain('Second error');
  });

  // 35. Password strength not shown in login mode
  it('password strength not shown in login mode', () => {
    const { container } = render(React.createElement(LoginPage));
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
    });
    expect(container.textContent).not.toContain('Weak');
    expect(container.textContent).not.toContain('Medium');
    expect(container.textContent).not.toContain('Strong');
  });

  // 36. Login button shows spinner and text together
  it('login button shows spinner and text together during loading', async () => {
    let resolveLogin: () => void;
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

    const button = container.querySelector('button[type="submit"]')!;
    // Button should contain both spinner and sign-in text
    expect(button.querySelector('[data-testid="spinner"]')).toBeTruthy();
    expect(button.textContent).toContain('auth.signIn');

    await act(async () => {
      resolveLogin!();
    });
  });

  // 37. Logo link points to root
  it('logo link points to root', () => {
    const { container } = render(React.createElement(LoginPage));
    const logoLink = container.querySelector('a[href="/"]');
    expect(logoLink).toBeTruthy();
    expect(logoLink!.textContent).toContain('HookSniff');
  });
});
