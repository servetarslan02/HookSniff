'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { API_BASE, twoFactorApi, startProactiveRefresh, stopProactiveRefresh, setTokenRefreshCallback } from './api';

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  plan: 'developer' | 'startup' | 'pro' | 'enterprise';
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  apiKey: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  verify2fa: (tempToken: string, code: string, backupCode?: string) => Promise<User>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => void;
  setApiKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'hooksniff_user';

// Generate URL-friendly slug from name or email
function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

function setAuthCookie(_token: string) {
  // HS-039: Do NOT set a non-HttpOnly cookie with the same name as the server's HttpOnly cookie.
  // Two cookies named "hooksniff_token" cause unpredictable behavior.
  // The middleware reads the HttpOnly cookie set by the server.
  // The frontend uses localStorage + Authorization header for API calls.
  // This function is now a no-op kept for API compatibility.
}

function clearAuthCookie() {
  document.cookie = 'hooksniff_token=; path=/; max-age=0';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  // Keep ref in sync with state (for use in callbacks without re-renders)
  const updateToken = useCallback((newToken: string | null) => {
    setToken(newToken);
    tokenRef.current = newToken;
    if (newToken) {
      localStorage.setItem('hooksniff_token', newToken);
      setAuthCookie(newToken);
    }
  }, []);

  /**
   * HS-039: Start proactive token refresh for the current session.
   * Called after login or session restore. Renews token every 12 min.
   */
  const startSessionRefresh = useCallback(() => {
    startProactiveRefresh((newToken: string) => {
      updateToken(newToken);
    });
  }, [updateToken]);

  // HS-039: Register token sync callback for 401 handler in api.ts
  useEffect(() => {
    setTokenRefreshCallback((newToken: string) => {
      updateToken(newToken);
    });
  }, [updateToken]);

  // On mount: restore user info from localStorage, then verify session with backend
  useEffect(() => {
    // Restore user info from localStorage (NOT api_key — it's sensitive)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { user: u } = JSON.parse(stored);
        setUser(u);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    // Verify session by calling the backend directly
    const savedToken = localStorage.getItem('hooksniff_token');
    if (savedToken) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          // 401 = definitive auth failure → try refresh
          if (res.status === 401) {
            return fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            }).then((refreshRes) => {
              if (!refreshRes.ok) throw new Error('Refresh failed');
              return refreshRes.json();
            });
          }
          // Other errors (500, network, CORS) → don't clear auth, just use localStorage
          return null;
        })
        .then((data) => {
          if (data && data.token) {
            // Refresh returned a new token — use it
            updateToken(data.token);
            if (data.customer) {
              const u: User = {
                id: data.customer.id,
                email: data.customer.email,
                name: data.customer.name,
                username: toSlug(data.customer.email.split('@')[0]),
                plan: data.customer.plan,
                is_admin: data.customer.is_admin ?? false,
              };
              setUser(u);
              setApiKeyState(null);
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
            }
            startSessionRefresh();
          } else if (data && data.id) {
            // /auth/me returned valid user — session is good
            const username = toSlug(data.email.split('@')[0]);
            const u: User = {
              id: data.id,
              email: data.email,
              name: data.name,
              username,
              plan: data.plan,
              is_admin: data.is_admin ?? false,
            };
            setUser(u);
            setApiKeyState(null);
            updateToken(savedToken); // This sets cookie + localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
            startSessionRefresh();
          }
          // If data is null (non-401 error), keep localStorage user as-is
        })
        .catch(() => {
          // Only clear on definitive auth failure (401).
          // Network/CORS errors → keep the user from localStorage.
          setUser(null);
          updateToken(null);
          setApiKeyState(null);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('hooksniff_token');
          clearAuthCookie();
          stopProactiveRefresh();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    // Cleanup: stop refresh on unmount
    return () => stopProactiveRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persistAuth = useCallback((u: User, k?: string, authToken?: string) => {
    // Generate username slug from email prefix (unique per user)
    const slug = toSlug(u.email.split('@')[0]);
    const userWithUsername = { ...u, username: slug };
    setUser(userWithUsername);
    setApiKeyState(k || null); // Keep in memory only for one-time display
    if (authToken) {
      updateToken(authToken);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithUsername }));
    // HS-039: Start proactive refresh after login
    startSessionRefresh();
  }, [updateToken, startSessionRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    // Call backend directly — token comes from response body
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Login failed');
    }
    const data = await res.json();
    // 2FA required — throw a structured error so the login page can handle it
    if (data.requires_2fa) {
      const twoFaError = new Error('2FA required') as Error & { requires2fa: true; tempToken: string };
      twoFaError.requires2fa = true;
      twoFaError.tempToken = data.temp_token;
      throw twoFaError;
    }
    const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: (data.customer.plan || 'developer') as User['plan'], is_admin: data.customer.is_admin ?? false };
    persistAuth(u, data.customer.api_key, data.token);
    return u;
  }, [persistAuth]);

  const verify2fa = useCallback(async (tempToken: string, code: string, backupCode?: string) => {
    const data = await twoFactorApi.verify(tempToken, code, backupCode);
    const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: (data.customer.plan || 'developer') as User['plan'], is_admin: data.customer.is_admin ?? false };
    persistAuth(u, data.customer.api_key, data.token);
    return u;
  }, [persistAuth]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Registration failed');
    }
    const data = await res.json();
    // Backend returns { message } for email-verification flow (no auto-login)
    // or { token, customer } for direct registration
    if (data.customer) {
      const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: (data.customer.plan || 'developer') as User['plan'], is_admin: data.customer.is_admin ?? false };
      persistAuth(u, data.customer.api_key, data.token);
      return u;
    }
    // Email verification flow — return a minimal user object
    // The user must verify email and then log in
    return { id: '', email, name, plan: 'developer' as const, is_admin: false };
  }, [persistAuth]);

  const logout = useCallback(async () => {
    // Stop proactive refresh first
    stopProactiveRefresh();
    // Call backend logout to revoke refresh token
    const currentToken = tokenRef.current;
    if (currentToken) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` },
        credentials: 'include',
      }).catch(() => {}); // Fire-and-forget
    }
    setToken(null);
    tokenRef.current = null;
    setUser(null);
    setApiKeyState(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('hooksniff_token');
    clearAuthCookie();
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    // Don't persist API key in localStorage — memory only
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, apiKey, isLoading, login, verify2fa, register, logout, setApiKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
// deploy trigger Thu May 14 06:42:30 AM CST 2026
