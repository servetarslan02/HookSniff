'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE } from './api';

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

function setAuthCookie(token: string) {
  // Set cookie for middleware auth check — 7 day expiry
  // Secure flag: only sent over HTTPS. SameSite=Lax: CSRF protection.
  // Note: NOT HttpOnly — the frontend needs to read this for API calls.
  // The server also sets an HttpOnly cookie via auth_response_with_cookie.
  document.cookie = `hooksniff_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
}

function clearAuthCookie() {
  document.cookie = 'hooksniff_token=; path=/; max-age=0';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    // Verify session by calling /auth/me
    const savedToken = localStorage.getItem('hooksniff_token');
    if (savedToken) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${savedToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Not authenticated');
        })
        .then((data) => {
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
          setToken(savedToken);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
          setAuthCookie(savedToken);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          setApiKeyState(null);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('hooksniff_token');
          clearAuthCookie();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const persistAuth = useCallback((u: User, k?: string, authToken?: string) => {
    // Generate username slug from email prefix (unique per user)
    const slug = toSlug(u.email.split('@')[0]);
    const userWithUsername = { ...u, username: slug };
    setUser(userWithUsername);
    setApiKeyState(k || null); // Keep in memory only for one-time display
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('hooksniff_token', authToken);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithUsername }));
    if (authToken) setAuthCookie(authToken);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
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
    const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: data.customer.plan, is_admin: data.customer.is_admin ?? false };
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
      const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: data.customer.plan, is_admin: data.customer.is_admin ?? false };
      persistAuth(u, data.customer.api_key, data.token);
      return u;
    }
    // Email verification flow — return a minimal user object
    // The user must verify email and then log in
    return { id: '', email, name, plan: 'developer' as const, is_admin: false };
  }, [persistAuth]);

  const logout = useCallback(async () => {
    setToken(null);
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
    <AuthContext.Provider value={{ user, token, apiKey, isLoading, login, register, logout, setApiKey }}>
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
