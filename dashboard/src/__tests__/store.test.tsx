import { renderWithProviders } from './test-utils';
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '@/lib/store';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
let localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { localStorageStore = {}; }),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock proactive refresh (module-level timers)
vi.mock('@/lib/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...mod,
    startProactiveRefresh: vi.fn(),
    stopProactiveRefresh: vi.fn(),
    setTokenRefreshCallback: vi.fn(),
  };
});

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
    localStorageStore = {};
    localStorageMock.getItem.mockImplementation((key: string) => localStorageStore[key] || null);
    localStorageMock.setItem.mockImplementation((key: string, value: string) => { localStorageStore[key] = value; });
    localStorageMock.removeItem.mockImplementation((key: string) => { delete localStorageStore[key]; });
    mockFetch.mockReset();
  });

  it('useAuth throws outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderWithProviders(<AuthConsumer />);
    }).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });

  it('sets isLoading to false after mount', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(
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

    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = result.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    const userEl = container!.querySelector('[data-testid="user"]');
    expect(userEl?.textContent).toBe('cached@test.com');
  });

  it('sets user when auth/me succeeds', async () => {
    localStorageMock.setItem('hooksniff_token', 'saved-token');
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
      const result = renderWithProviders(
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
    expect(tokenEl?.textContent).toBe('saved-token');
  });

  it('clears user when auth/me fails and no stored user', async () => {
    localStorageMock.setItem('hooksniff_token', 'expired-token');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = result.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    const userEl = container!.querySelector('[data-testid="user"]');
    expect(userEl?.textContent).toBe('none');
  });

  it('login calls correct endpoint', async () => {
    // No saved token in localStorage, so no auth/me call on mount
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'jwt-token',
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
      renderWithProviders(
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
      const result = renderWithProviders(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = result.container;
      await new Promise((r) => setTimeout(r, 0));
    });

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
      json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }),
    });

    let authRef: ReturnType<typeof useAuth>;

    await act(async () => {
      renderWithProviders(
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

  it('verifies session by calling /auth/me on mount with token', async () => {
    localStorageMock.setItem('hooksniff_token', 'test-jwt');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    await act(async () => {
      renderWithProviders(
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
    expect(authMeCall![1].headers['Authorization']).toBe('Bearer test-jwt');
  });
});
