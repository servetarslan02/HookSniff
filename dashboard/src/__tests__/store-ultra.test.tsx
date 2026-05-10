// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act, fireEvent, waitFor, cleanup } from '@testing-library/react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
    removeItem: vi.fn((k: string) => { delete store[k]; }),
    clear: vi.fn(() => { store = {}; }),
    get store() { return store; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

const { AuthProvider, useAuth } = await import('@/lib/store');

function AuthConsumer() {
  const { user, token, apiKey, isLoading, login, register, logout, setApiKey } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    try { await login('test@test.com', 'pass'); } catch (e: any) { setError(e.message); }
  };
  const handleRegister = async () => {
    try { await register('new@test.com', 'pass', 'New'); } catch (e: any) { setError(e.message); }
  };

  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="apiKey">{apiKey ?? 'null'}</span>
      <span data-testid="isLoading">{String(isLoading)}</span>
      {error && <span data-testid="error">{error}</span>}
      <button onClick={handleLogin}>login</button>
      <button onClick={handleRegister}>register</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => setApiKey('key_123')}>setApiKey</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe('store-ultra: AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children without crashing', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId } = renderWithAuth();
    expect(getByTestId('isLoading').textContent).toBe('true');
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));
  });

  it('starts in loading state', () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId } = renderWithAuth();
    expect(getByTestId('isLoading').textContent).toBe('true');
  });

  it('calls /auth/me on mount', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    renderWithAuth();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/me'), expect.anything());
    });
  });

  it('restores user from localStorage', async () => {
    // Set mock AFTER clearAllMocks
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ user: { id: 'u1', email: 'stored@test.com', name: 'Stored', plan: 'free' } }));
    // /auth/me succeeds so user is kept (not cleared by 401)
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'u1', email: 'stored@test.com', name: 'Stored', plan: 'free' }) });
    const { getByTestId } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));
    const user = JSON.parse(getByTestId('user').textContent!);
    expect(user.email).toBe('stored@test.com');
  });

  it('sets user from /auth/me response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'u1', email: 'me@test.com', name: 'Me', plan: 'pro', is_admin: true }) });
    const { getByTestId } = renderWithAuth();
    await waitFor(() => {
      const user = JSON.parse(getByTestId('user').textContent!);
      expect(user.email).toBe('me@test.com');
      expect(user.is_admin).toBe(true);
    });
  });

  it('sets token to cookie when session verified', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'u1', email: 't@t.com', plan: 'free' }) });
    const { getByTestId } = renderWithAuth();
    await waitFor(() => expect(getByTestId('token').textContent).toBe('cookie'));
  });

  it('clears user when /auth/me returns 401', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId } = renderWithAuth();
    await waitFor(() => {
      expect(getByTestId('user').textContent).toBe('null');
      expect(getByTestId('token').textContent).toBe('null');
    });
  });

  it('clears user on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { getByTestId } = renderWithAuth();
    await waitFor(() => expect(getByTestId('user').textContent).toBe('null'));
  });

  it('handles corrupted localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('not-json{{{');
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('hooksniff_user');
  });

  it('login sends POST to /auth/login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ customer: { id: 'u1', email: 'test@test.com', name: 'Test', plan: 'free', api_key: 'key_abc' } }) });
    await act(async () => { fireEvent.click(getByText('login')); });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.objectContaining({ method: 'POST' }));
  });

  it('login sets user on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ customer: { id: 'u1', email: 'test@test.com', name: 'Test', plan: 'pro', api_key: 'key' } }) });
    await act(async () => { fireEvent.click(getByText('login')); });

    await waitFor(() => {
      const user = JSON.parse(getByTestId('user').textContent!);
      expect(user.email).toBe('test@test.com');
      expect(user.plan).toBe('pro');
    });
  });

  it('login shows error on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText, findByTestId } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }) });
    await act(async () => { fireEvent.click(getByText('login')); });

    const errorEl = await findByTestId('error');
    expect(errorEl.textContent).toContain('Invalid credentials');
  });

  it('login shows generic error when no message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText, findByTestId } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) });
    await act(async () => { fireEvent.click(getByText('login')); });

    const errorEl = await findByTestId('error');
    expect(errorEl.textContent).toBeTruthy();
  });

  it('register sends POST to /auth/register', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ customer: { id: 'u2', email: 'new@test.com', name: 'New', plan: 'free' } }) });
    await act(async () => { fireEvent.click(getByText('register')); });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/register'), expect.objectContaining({ method: 'POST' }));
  });

  it('register shows error on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText, findByTestId } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 409, json: () => Promise.resolve({ error: { message: 'Email already exists' } }) });
    await act(async () => { fireEvent.click(getByText('register')); });

    const errorEl = await findByTestId('error');
    expect(errorEl.textContent).toContain('Email already exists');
  });

  it('setApiKey sets key in memory', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    await act(async () => { fireEvent.click(getByText('setApiKey')); });
    expect(getByTestId('apiKey').textContent).toBe('key_123');
  });

  it('useAuth throws outside AuthProvider', () => {
    function BadConsumer() { useAuth(); return null; }
    expect(() => render(<BadConsumer />)).toThrow('useAuth must be used within AuthProvider');
  });

  it('persists user to localStorage on login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });
    const { getByTestId, getByText } = renderWithAuth();
    await waitFor(() => expect(getByTestId('isLoading').textContent).toBe('false'));

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ customer: { id: 'u1', email: 'test@test.com', name: 'Test', plan: 'free' } }) });
    await act(async () => { fireEvent.click(getByText('login')); });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('hooksniff_user', expect.stringContaining('test@test.com'));
    });
  });
});
