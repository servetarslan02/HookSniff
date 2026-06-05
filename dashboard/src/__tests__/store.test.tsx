// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from './test-utils';
import { act, fireEvent } from '@testing-library/react';
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

let localStorageStore: Record<string, string> = {};

vi.mock('@/lib/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...mod,
    startProactiveRefresh: vi.fn(),
    stopProactiveRefresh: vi.fn(),
    setTokenRefreshCallback: vi.fn(),
  };
});

// Helper component
function AuthConsumer({ onReady }: { onReady?: (auth: any) => void }) {
  const auth = useAuth();
  React.useEffect(() => { onReady?.(auth); }, [auth, onReady]);
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

  it('provides auth context without crashing', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(
        <AuthProvider><AuthConsumer /></AuthProvider>,
        { withIntl: false }
      );
      container = result.container;
      await new Promise(r => setTimeout(r, 0));
    });
    expect(container!).toBeTruthy();
  });

  it('restores user from localStorage on mount', async () => {
    const storedUser = { id: '1', email: 'cached@test.com', plan: 'pro' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ user: storedUser }));
    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(
        <AuthProvider><AuthConsumer /></AuthProvider>,
        { withIntl: false }
      );
      container = result.container;
      await new Promise(r => setTimeout(r, 100));
    });

    const userEl = container!.querySelector('[data-testid="user"]');
    expect(userEl?.textContent).toBe('cached@test.com');
  });

  it('calls login endpoint on login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        token: 'jwt',
        customer: { id: '1', email: 'new@test.com', name: 'New', plan: 'free' },
      }),
    });

    let authRef: any;
    await act(async () => {
      renderWithProviders(
        <AuthProvider><AuthConsumer onReady={a => { authRef = a; }} /></AuthProvider>,
        { withIntl: false }
      );
      await new Promise(r => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef.login('new@test.com', 'password123');
    });

    const loginCall = mockFetch.mock.calls.find(
      (c: any[]) => c[0]?.includes('/auth/login')
    );
    expect(loginCall).toBeTruthy();
    expect(loginCall![1].method).toBe('POST');
  });

  it('throws on failed login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }),
    });

    let authRef: any;
    await act(async () => {
      renderWithProviders(
        <AuthProvider><AuthConsumer onReady={a => { authRef = a; }} /></AuthProvider>,
        { withIntl: false }
      );
      await new Promise(r => setTimeout(r, 0));
    });

    await expect(authRef.login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('clears user on logout', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(
        <AuthProvider><AuthConsumer /></AuthProvider>,
        { withIntl: false }
      );
      container = result.container;
      await new Promise(r => setTimeout(r, 0));
    });

    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise(r => setTimeout(r, 0));
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hooksniff_user');
  });

  it('calls register endpoint on register', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        token: 'jwt-new',
        customer: { id: '2', email: 'reg@test.com', name: 'Reg', plan: 'free' },
      }),
    });

    let authRef: any;
    await act(async () => {
      renderWithProviders(
        <AuthProvider><AuthConsumer onReady={a => { authRef = a; }} /></AuthProvider>,
        { withIntl: false }
      );
      await new Promise(r => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef.register('reg@test.com', 'pass123', 'Reg');
    });

    const registerCall = mockFetch.mock.calls.find(
      (c: any[]) => c[0]?.includes('/auth/register')
    );
    expect(registerCall).toBeTruthy();
    expect(registerCall![1].method).toBe('POST');
    const body = JSON.parse(registerCall![1].body);
    expect(body.email).toBe('reg@test.com');
    expect(body.name).toBe('Reg');
  });

  it('throws on failed register', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: { message: 'Email already exists' } }),
    });

    let authRef: any;
    await act(async () => {
      renderWithProviders(
        <AuthProvider><AuthConsumer onReady={a => { authRef = a; }} /></AuthProvider>,
        { withIntl: false }
      );
      await new Promise(r => setTimeout(r, 0));
    });

    await expect(authRef.register('dup@test.com', 'pass')).rejects.toThrow('Email already exists');
  });

  it('setApiKey stores key in state', async () => {
    let authRef: any;
    await act(async () => {
      renderWithProviders(
        <AuthProvider><AuthConsumer onReady={a => { authRef = a; }} /></AuthProvider>,
        { withIntl: false }
      );
      await new Promise(r => setTimeout(r, 0));
    });

    act(() => {
      authRef.setApiKey('sk_test_123');
    });

    expect(authRef.apiKey).toBe('sk_test_123');
  });

  it('login stores token in localStorage', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        token: 'jwt-stored',
        customer: { id: '3', email: 'stored@test.com', plan: 'pro' },
      }),
    });

    let authRef: any;
    await act(async () => {
      renderWithProviders(
        <AuthProvider><AuthConsumer onReady={a => { authRef = a; }} /></AuthProvider>,
        { withIntl: false }
      );
      await new Promise(r => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef.login('stored@test.com', 'pass');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('hooksniff_token', 'jwt-stored');
  });

  it('verify2fa calls 2FA endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        token: 'jwt-2fa',
        customer: { id: '4', email: '2fa@test.com', plan: 'pro' },
      }),
    });

    let authRef: any;
    await act(async () => {
      renderWithProviders(
        <AuthProvider><AuthConsumer onReady={a => { authRef = a; }} /></AuthProvider>,
        { withIntl: false }
      );
      await new Promise(r => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef.verify2fa('temp-token', '123456');
    });

    const twoFaCall = mockFetch.mock.calls.find(
      (c: any[]) => c[0]?.includes('/auth/2fa/verify') || c[0]?.includes('/2fa')
    );
    expect(twoFaCall).toBeTruthy();
  });

  it('logout clears token from localStorage', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = renderWithProviders(
        <AuthProvider><AuthConsumer /></AuthProvider>,
        { withIntl: false }
      );
      container = result.container;
      await new Promise(r => setTimeout(r, 0));
    });

    mockFetch.mockResolvedValueOnce({ ok: true });

    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        b => b.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise(r => setTimeout(r, 0));
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hooksniff_token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hooksniff_user');
  });
});
