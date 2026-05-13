'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

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

function setUsernameCookie(_username: string) {
}

function clearUsernameCookie() {
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
    // Verify session by calling /auth/me (cookie is sent automatically)
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1' : 'http://localhost:3000/v1');
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
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
        setApiKeyState(null); // Don't persist API key in localStorage
        setToken('cookie'); // Indicates session is active via cookie
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u }));
        setUsernameCookie(username);
      })
      .catch(() => {
        // Not authenticated — clear stale data
        setUser(null);
        setToken(null);
        setApiKeyState(null);
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistAuth = useCallback((u: User, k?: string) => {
    // Generate username slug from email prefix (unique per user)
    const slug = toSlug(u.email.split('@')[0]);
    const userWithUsername = { ...u, username: slug };
    setUser(userWithUsername);
    setApiKeyState(k || null); // Keep in memory only for one-time display
    setToken('cookie'); // Token is in HttpOnly cookie
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithUsername }));
    setUsernameCookie(slug);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1' : 'http://localhost:3000/v1');
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Login failed');
    }
    const data = await res.json();
    const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: data.customer.plan, is_admin: data.customer.is_admin ?? false };
    persistAuth(u, data.customer.api_key);
    return u;
  }, [persistAuth]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1' : 'http://localhost:3000/v1');
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Registration failed');
    }
    const data = await res.json();
    const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: data.customer.plan, is_admin: data.customer.is_admin ?? false };
    persistAuth(u, data.customer.api_key);
    return u;
  }, [persistAuth]);

  const logout = useCallback(async () => {
    // Call backend logout to clear HttpOnly cookie
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1' : 'http://localhost:3000/v1');
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch((err) => console.warn('Logout request failed:', err)); // dev only
    setToken(null);
    setUser(null);
    setApiKeyState(null);
    localStorage.removeItem(STORAGE_KEY);
    clearUsernameCookie();
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
