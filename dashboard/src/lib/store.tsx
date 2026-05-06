'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'free' | 'pro' | 'business';
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  apiKey: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setApiKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hooksniff_auth');
    if (stored) {
      try {
        const { token: t, user: u, apiKey: k } = JSON.parse(stored);
        setToken(t);
        setUser(u);
        setApiKeyState(k);
      } catch {
        localStorage.removeItem('hooksniff_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const persistAuth = useCallback((t: string, u: User, k?: string) => {
    setToken(t);
    setUser(u);
    if (k) setApiKeyState(k);
    localStorage.setItem('hooksniff_auth', JSON.stringify({ token: t, user: u, apiKey: k || null }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
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
    persistAuth(data.token, u, data.customer.api_key);
  }, [persistAuth]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
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
    const u: User = { id: data.customer.id, email: data.customer.email, name: data.customer.name, plan: data.customer.plan, is_admin: data.customer.is_admin ?? false };
    persistAuth(data.token, u, data.customer.api_key);
  }, [persistAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setApiKeyState(null);
    localStorage.removeItem('hooksniff_auth');
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    const stored = localStorage.getItem('hooksniff_auth');
    if (stored) {
      const data = JSON.parse(stored);
      data.apiKey = key;
      localStorage.setItem('hooksniff_auth', JSON.stringify(data));
    }
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
