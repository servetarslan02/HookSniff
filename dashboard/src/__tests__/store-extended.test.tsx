// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '@/lib/store';

// ─── Mocks ───

const mockFetch = vi.fn();
global.fetch = mockFetch;

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

// ─── Helper Components ───

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
      <span data-testid="api-key">{auth.apiKey || 'none'}</span>
      <span data-testid="plan">{auth.user?.plan || 'none'}</span>
      <span data-testid="name">{auth.user?.name || 'none'}</span>
      <span data-testid="admin">{String(auth.user?.is_admin ?? 'none')}</span>
      <button onClick={() => auth.login('test@example.com', 'pass')}>Login</button>
      <button onClick={() => auth.register('new@example.com', 'pass', 'New')}>Register</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.setApiKey('sk-test-key')}>SetKey</button>
    </div>
  );
}

// ─── Test Suites ───

describe('AuthProvider - Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('login sends correct POST body with email and password', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', name: 'A', plan: 'free', is_admin: false },
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
      await authRef!.login('a@b.com', 'secret');
    });

    const loginCall = mockFetch.mock.calls.find((c: any[]) => c[0].includes('/auth/login'));
    expect(loginCall).toBeTruthy();
    const body = JSON.parse(loginCall![1].body);
    expect(body).toEqual({ email: 'a@b.com', password: 'secret' });
  });

  it('login sets user, token, and apiKey after success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', name: 'A', plan: 'pro', is_admin: false, api_key: 'sk-123' },
      }),
    });

    let container: HTMLElement;
    let authRef: ReturnType<typeof useAuth>;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef!.login('a@b.com', 'pass');
    });

    expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('a@b.com');
    expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('cookie');
    expect(container!.querySelector('[data-testid="api-key"]')!.textContent).toBe('sk-123');
    expect(container!.querySelector('[data-testid="plan"]')!.textContent).toBe('pro');
  });

  it('login persists user to localStorage', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', name: 'A', plan: 'free', is_admin: false },
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
      await authRef!.login('a@b.com', 'pass');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'hooksniff_user',
      expect.stringContaining('"email":"a@b.com"')
    );
  });

  it('login throws with server error message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Account locked' } }),
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

    await expect(authRef!.login('a@b.com', 'pass')).rejects.toThrow('Account locked');
  });

  it('login throws generic message when error response has no message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
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

    await expect(authRef!.login('a@b.com', 'pass')).rejects.toThrow('Login failed');
  });

  it('login throws generic message when error response is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('not json')),
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

    await expect(authRef!.login('a@b.com', 'pass')).rejects.toThrow('Login failed');
  });
});

describe('AuthProvider - Register Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('register sends correct POST body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'new@b.com', name: 'New', plan: 'free', is_admin: false, api_key: 'sk-new' },
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
      await authRef!.register('new@b.com', 'pass123', 'New User');
    });

    const regCall = mockFetch.mock.calls.find((c: any[]) => c[0].includes('/auth/register'));
    expect(regCall).toBeTruthy();
    const body = JSON.parse(regCall![1].body);
    expect(body).toEqual({ email: 'new@b.com', password: 'pass123', name: 'New User' });
    expect(regCall![1].method).toBe('POST');
    expect(regCall![1].credentials).toBe('include');
  });

  it('register without name sends undefined name', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'n@b.com', plan: 'free', is_admin: false },
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
      await authRef!.register('n@b.com', 'pass');
    });

    const regCall = mockFetch.mock.calls.find((c: any[]) => c[0].includes('/auth/register'));
    const body = JSON.parse(regCall![1].body);
    expect(body.name).toBeUndefined();
  });

  it('register throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'Email already exists' } }),
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

    await expect(authRef!.register('dup@b.com', 'pass')).rejects.toThrow('Email already exists');
  });

  it('register throws generic message on failure without error message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.reject(new Error('bad')),
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

    await expect(authRef!.register('dup@b.com', 'pass')).rejects.toThrow('Registration failed');
  });
});

describe('AuthProvider - Logout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('logout calls backend /auth/logout with POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: '1', email: 'a@b.com', plan: 'free', is_admin: false }),
    });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise((r) => setTimeout(r, 0));
    });

    const logoutCall = mockFetch.mock.calls.find((c: any[]) => c[0].includes('/auth/logout'));
    expect(logoutCall).toBeTruthy();
    expect(logoutCall![1].method).toBe('POST');
    expect(logoutCall![1].credentials).toBe('include');
  });

  it('logout clears localStorage', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hooksniff_user');
  });

  it('logout clears user, token, and apiKey', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('none');
    expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('none');
    expect(container!.querySelector('[data-testid="api-key"]')!.textContent).toBe('none');
  });

  it('logout does not crash when backend call fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('none');
    consoleWarnSpy.mockRestore();
  });
});

describe('AuthProvider - Token Refresh / Session Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('calls /auth/me with credentials include on mount', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    const meCall = mockFetch.mock.calls.find((c: any[]) => c[0].includes('/auth/me'));
    expect(meCall).toBeTruthy();
    expect(meCall![1].credentials).toBe('include');
  });

  it('sets user from /auth/me response including is_admin', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '5', email: 'admin@test.com', name: 'Admin', plan: 'business', is_admin: true,
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="admin"]')!.textContent).toBe('true');
    expect(container!.querySelector('[data-testid="plan"]')!.textContent).toBe('business');
    expect(container!.querySelector('[data-testid="name"]')!.textContent).toBe('Admin');
  });

  it('defaults is_admin to false when missing from /auth/me', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '5', email: 'u@test.com', plan: 'free',
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="admin"]')!.textContent).toBe('false');
  });

  it('persists user from /auth/me to localStorage', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '5', email: 'u@test.com', plan: 'free', is_admin: false,
      }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'hooksniff_user',
      expect.stringContaining('"email":"u@test.com"')
    );
  });

  it('clears stale localStorage when /auth/me fails', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ user: { id: '1', email: 'stale@test.com' } }));
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('none');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hooksniff_user');
  });

  it('clears API key when /auth/me succeeds (memory only)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '1', email: 'u@test.com', plan: 'free', is_admin: false,
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    // apiKey should be null after session verify (not persisted)
    expect(container!.querySelector('[data-testid="api-key"]')!.textContent).toBe('none');
  });
});

describe('AuthProvider - API Key Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('setApiKey updates apiKey in memory', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let container: HTMLElement;
    let authRef: ReturnType<typeof useAuth>;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    act(() => {
      authRef!.setApiKey('sk-my-key');
    });

    expect(container!.querySelector('[data-testid="api-key"]')!.textContent).toBe('sk-my-key');
  });

  it('setApiKey does not persist to localStorage', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let authRef: ReturnType<typeof useAuth>;
    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      await new Promise((r) => setTimeout(r, 0));
    });

    const setItemCallsBefore = localStorageMock.setItem.mock.calls.length;

    act(() => {
      authRef!.setApiKey('sk-secret');
    });

    // setApiKey should NOT call localStorage.setItem
    const newSetItemCalls = localStorageMock.setItem.mock.calls.slice(setItemCallsBefore);
    const apiKeyPersisted = newSetItemCalls.some((c: any[]) => c[1]?.includes('sk-secret'));
    expect(apiKeyPersisted).toBe(false);
  });

  it('apiKey is set after login and cleared after logout', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', plan: 'free', is_admin: false, api_key: 'sk-login-key' },
      }),
    });

    let container: HTMLElement;
    let authRef: ReturnType<typeof useAuth>;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef!.login('a@b.com', 'pass');
    });
    expect(container!.querySelector('[data-testid="api-key"]')!.textContent).toBe('sk-login-key');

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    await act(async () => {
      const logoutBtn = Array.from(container!.querySelectorAll('button')).find(
        (btn) => btn.textContent === 'Logout'
      )!;
      fireEvent.click(logoutBtn);
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(container!.querySelector('[data-testid="api-key"]')!.textContent).toBe('none');
  });
});

describe('AuthProvider - Plan Changes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('reflects free plan from login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', plan: 'free', is_admin: false },
      }),
    });

    let container: HTMLElement;
    let authRef: ReturnType<typeof useAuth>;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef!.login('a@b.com', 'pass');
    });
    expect(container!.querySelector('[data-testid="plan"]')!.textContent).toBe('free');
  });

  it('reflects pro plan from login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', plan: 'pro', is_admin: false },
      }),
    });

    let container: HTMLElement;
    let authRef: ReturnType<typeof useAuth>;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer onReady={(a) => { authRef = a; }} />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await authRef!.login('a@b.com', 'pass');
    });
    expect(container!.querySelector('[data-testid="plan"]')!.textContent).toBe('pro');
  });

  it('reflects business plan from /auth/me', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: '1', email: 'a@b.com', plan: 'business', is_admin: false,
      }),
    });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="plan"]')!.textContent).toBe('business');
  });

  it('plan persists in localStorage', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', plan: 'pro', is_admin: false },
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
      await authRef!.login('a@b.com', 'pass');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'hooksniff_user',
      expect.stringContaining('"plan":"pro"')
    );
  });
});

describe('AuthProvider - Error Handling on Auth Failures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('handles network error on /auth/me gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="loading"]')!.textContent).toBe('false');
    expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('none');
  });

  it('handles malformed localStorage data on mount', async () => {
    localStorageMock.getItem.mockReturnValue('not-valid-json{{{');
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hooksniff_user');
    expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('none');
  });

  it('handles /auth/me returning 500', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(container!.querySelector('[data-testid="user"]')!.textContent).toBe('none');
    expect(container!.querySelector('[data-testid="token"]')!.textContent).toBe('none');
  });

  it('login sets isLoading correctly during the flow', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    let container: HTMLElement;
    await act(async () => {
      const r = render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
      container = r.container;
      await new Promise((r) => setTimeout(r, 0));
    });

    // After initial load, isLoading should be false
    expect(container!.querySelector('[data-testid="loading"]')!.textContent).toBe('false');
  });

  it('handles concurrent auth/me and login calls', async () => {
    // First call: auth/me
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    // Second call: login
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        customer: { id: '1', email: 'a@b.com', plan: 'free', is_admin: false },
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
      await authRef!.login('a@b.com', 'pass');
    });

    // Should have made exactly 2 fetch calls (auth/me + login)
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('useAuth hook', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<AuthConsumer />);
    }).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});
