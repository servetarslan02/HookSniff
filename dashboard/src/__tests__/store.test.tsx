// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '@/lib/store';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Helper component to expose auth context
function AuthConsumer({ onReady }: { onReady?: (auth: ReturnType<typeof useAuth>) => void }) {
  const auth = useAuth();
  React.useEffect(() => {
    onReady?.(auth);
  }, [auth, onReady]);
  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user?.email || 'none'}</span>
      <span data-testid="token">{auth.token || 'none'}</span>
      <button onClick={() => auth.login('test@example.com', 'pass')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('useAuth throws outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<AuthConsumer />);
    }).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });

  it('provides initial state with isLoading true', () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { container } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    const loadingEl = container.querySelector('[data-testid="loading"]');
    expect(loadingEl?.textContent).toBe('true');
  });

  it('sets isLoading to false after auth check', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = result.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    const loadingEl = container!.querySelector('[data-testid="loading"]');
    expect(loadingEl?.textContent).toBe('false');
  });

  it('restores user from localStorage on mount', async () => {
    const storedUser = { id: '1', email: 'cached@test.com', plan: 'pro' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ user: storedUser }));
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(localStorageMock.getItem).toHaveBeenCalledWith('hooksniff_user');
  });

  it('sets user when auth/me succeeds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '123',
          email: 'user@test.com',
          name: 'Test User',
          plan: 'pro',
          is_admin: false,
        }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = result.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    const userEl = container!.querySelector('[data-testid="user"]');
    expect(userEl?.textContent).toBe('user@test.com');
    const tokenEl = container!.querySelector('[data-testid="token"]');
    expect(tokenEl?.textContent).toBe('cookie');
  });

  it('clears user when auth/me fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = result.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    const userEl = container!.querySelector('[data-testid="user"]');
    expect(userEl?.textContent).toBe('none');
    const tokenEl = container!.querySelector('[data-testid="token"]');
    expect(tokenEl?.textContent).toBe('none');
  });

  it('login calls correct endpoint', async () => {
    // First mock for initial auth/me check
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    // Second mock for login
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          customer: {
            id: '456',
            email: 'new@test.com',
            name: 'New User',
            plan: 'free',
            is_admin: false,
          },
        }),
    });

    let authRef: ReturnType<typeof useAuth>;

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef!.login('new@test.com', 'password123');
    });

    const loginCall = mockFetch.mock.calls.find(
      (call: any[]) => call[0].includes('/auth/login')
    );
    expect(loginCall).toBeTruthy();
    expect(loginCall![1].method).toBe('POST');
    expect(loginCall![1].credentials).toBe('include');
  });

  it('logout clears user and token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '123',
          email: 'user@test.com',
          name: 'Test',
          plan: 'pro',
          is_admin: false,
        }),
    });

    let container: HTMLElement;
    await act(async () => {
      const result = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = result.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    // Now mock logout endpoint
    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise((r) => setTimeout(r, 0));
    });

    const userEl = container!.querySelector('[data-testid="user"]');
    expect(userEl?.textContent).toBe('none');
    const tokenEl = container!.querySelector('[data-testid="token"]');
    expect(tokenEl?.textContent).toBe('none');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hooksniff_user');
  });

  it('login throws on failed request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }),
    });

    let authRef: ReturnType<typeof useAuth>;

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    await expect(
      authRef!.login('bad@test.com', 'wrong')
    ).rejects.toThrow('Invalid credentials');
  });

  it('verifies session by calling /auth/me with credentials include', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    const authMeCall = mockFetch.mock.calls.find(
      (call: any[]) => call[0].includes('/auth/me')
    );
    expect(authMeCall).toBeTruthy();
    expect(authMeCall![1].credentials).toBe('include');
  });
});
