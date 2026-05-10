// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/store';

// Helper to test useAuth hook
function AuthConsumer() {
  const { user, token, apiKey, isLoading, login, register, logout, setApiKey } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <span data-testid="token">{token || 'null'}</span>
      <span data-testid="apiKey">{apiKey || 'null'}</span>
      <span data-testid="isLoading">{String(isLoading)}</span>
      <button onClick={() => login('test@test.com', 'pass123')} data-testid="login">Login</button>
      <button onClick={() => register('new@test.com', 'pass123', 'New')} data-testid="register">Register</button>
      <button onClick={logout} data-testid="logout">Logout</button>
      <button onClick={() => setApiKey('my-api-key')} data-testid="setApiKey">Set Key</button>
    </div>
  );
}

const mockFetch = vi.fn();
const originalFetch = global.fetch;

describe('AuthProvider + useAuth - Comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = mockFetch;
    // Default: /auth/me returns 401 (not authenticated)
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // === Initial State ===
  it('starts with loading state', () => {
    let container: HTMLElement;
    act(() => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    expect(container!.querySelector('[data-testid="isLoading"]')!.textContent).toBe('true');
  });

  it('sets isLoading to false after auth check', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="isLoading"]')!.textContent).toBe('false');
    });
  });

  it('has null user when not authenticated', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('null');
    });
  });

  it('has null token when not authenticated', async () => {
    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('null');
    });
  });

  // === Auth Me Verification ===
  it('calls /auth/me on mount', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('restores user from successful /auth/me', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'u1',
            email: 'test@test.com',
            name: 'Test User',
            plan: 'pro',
            is_admin: true,
          }),
        });
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      const user = JSON.parse(container!.querySelector('[data-testid="user"]')!.textContent!);
      expect(user.id).toBe('u1');
      expect(user.email).toBe('test@test.com');
      expect(user.name).toBe('Test User');
      expect(user.plan).toBe('pro');
      expect(user.is_admin).toBe(true);
    });
  });

  it('sets token to cookie when authenticated', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', email: 't@t.com', plan: 'free' }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('cookie');
    });
  });

  it('persists user to localStorage on successful auth', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', email: 't@t.com', plan: 'pro' }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('hooksniff_user')!);
      expect(stored.user.email).toBe('t@t.com');
    });
  });

  it('clears stale data when /auth/me fails', async () => {
    localStorage.setItem('hooksniff_user', JSON.stringify({ user: { id: 'old', email: 'old@t.com' } }));
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('null');
      expect(localStorage.getItem('hooksniff_user')).toBeNull();
    });
  });

  // === Login ===
  it('login calls API correctly', async () => {
    mockFetch.mockImplementation((url: string, opts?: any) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            customer: { id: 'u1', email: 'test@test.com', name: 'Test', plan: 'pro', api_key: 'key123' },
          }),
        });
      }
      if (url.includes('/auth/me')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="isLoading"]')!.textContent).toBe('false');
    });

    await act(async () => {
      fireEvent.click(container!.querySelector('[data-testid="login"]')!);
    });
    await waitFor(() => {
      const user = JSON.parse(container!.querySelector('[data-testid="user"]')!.textContent!);
      expect(user.email).toBe('test@test.com');
    });
  });

  it('login throws on failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }),
        });
      }
      if (url.includes('/auth/me')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: false });
    });

    // Create a wrapper that catches the login error
    function LoginErrorCatcher() {
      const { user, token, apiKey, isLoading, login, register, logout, setApiKey } = useAuth();
      const [loginError, setLoginError] = React.useState<string | null>(null);
      return (
        <div>
          <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
          <span data-testid="token">{token || 'null'}</span>
          <span data-testid="apiKey">{apiKey || 'null'}</span>
          <span data-testid="isLoading">{String(isLoading)}</span>
          <span data-testid="loginError">{loginError || 'none'}</span>
          <button onClick={async () => {
            try { await login('test@test.com', 'pass123'); } catch (e) { setLoginError((e as Error).message); }
          }} data-testid="login">Login</button>
          <button onClick={() => register('new@test.com', 'pass123', 'New')} data-testid="register">Register</button>
          <button onClick={logout} data-testid="logout">Logout</button>
          <button onClick={() => setApiKey('my-api-key')} data-testid="setApiKey">Set Key</button>
        </div>
      );
    }

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <LoginErrorCatcher />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="isLoading"]')!.textContent).toBe('false');
    });

    await act(async () => {
      fireEvent.click(container!.querySelector('[data-testid="login"]')!);
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="loginError"]')!.textContent).toBe('Invalid credentials');
    });
    consoleSpy.mockRestore();
  });

  // === Register ===
  it('register calls API correctly', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/register')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            customer: { id: 'u2', email: 'new@test.com', name: 'New', plan: 'free', api_key: 'newkey' },
          }),
        });
      }
      if (url.includes('/auth/me')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="isLoading"]')!.textContent).toBe('false');
    });

    await act(async () => {
      fireEvent.click(container!.querySelector('[data-testid="register"]')!);
    });
    await waitFor(() => {
      const user = JSON.parse(container!.querySelector('[data-testid="user"]')!.textContent!);
      expect(user.email).toBe('new@test.com');
    });
  });

  // === Logout ===
  it('logout clears user and token', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', email: 't@t.com', plan: 'pro' }),
        });
      }
      if (url.includes('/auth/logout')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('cookie');
    });

    await act(async () => {
      fireEvent.click(container!.querySelector('[data-testid="logout"]')!);
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('null');
      expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('null');
    });
  });

  it('logout clears localStorage', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', email: 't@t.com', plan: 'pro' }),
        });
      }
      if (url.includes('/auth/logout')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(localStorage.getItem('hooksniff_user')).not.toBeNull();
    });

    await act(async () => {
      fireEvent.click(container!.querySelector('[data-testid="logout"]')!);
    });
    await waitFor(() => {
      expect(localStorage.getItem('hooksniff_user')).toBeNull();
    });
  });

  it('logout calls backend API', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', email: 't@t.com', plan: 'pro' }),
        });
      }
      if (url.includes('/auth/logout')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('cookie');
    });

    await act(async () => {
      fireEvent.click(container!.querySelector('[data-testid="logout"]')!);
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout'),
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
  });

  // === API Key ===
  it('setApiKey sets key in memory', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="isLoading"]')!.textContent).toBe('false');
    });

    await act(async () => {
      fireEvent.click(container!.querySelector('[data-testid="setApiKey"]')!);
    });
    expect(container!.querySelector('[data-testid="apiKey"]')!.textContent).toBe('my-api-key');
  });

  // === Corrupt localStorage ===
  it('handles corrupt localStorage gracefully', async () => {
    localStorage.setItem('hooksniff_user', 'invalid-json{{{');
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('null');
      expect(localStorage.getItem('hooksniff_user')).toBeNull();
    });
  });

  // === useAuth outside provider ===
  it('throws error when useAuth used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(React.createElement(AuthConsumer))).toThrow('useAuth must be used within AuthProvider');
    spy.mockRestore();
  });

  // === Fetch error handling ===
  it('handles network error on /auth/me', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      expect(container!.querySelector('[data-testid="isLoading"]')!.textContent).toBe('false');
      expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('null');
    });
  });

  // === is_admin defaults ===
  it('defaults is_admin to false when not provided', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'u1', email: 't@t.com', plan: 'free' }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    let container: HTMLElement;
    await act(async () => {
      container = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      ).container;
    });
    await waitFor(() => {
      const user = JSON.parse(container!.querySelector('[data-testid="user"]')!.textContent!);
      expect(user.is_admin).toBe(false);
    });
  });
});
