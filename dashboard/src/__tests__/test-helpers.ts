// @vitest-environment jsdom
import { vi } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Universal mock: any function access returns a mock that resolves with {}
export function createUniversalApiMock() {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(target, prop) {
      if (typeof prop === 'symbol') return undefined;
      if (!target[prop]) {
        // Return a function that returns empty object/array
        const fn = vi.fn().mockResolvedValue({});
        target[prop] = fn;
      }
      return target[prop];
    },
  };
  return new Proxy({}, handler);
}

export function mockAuth(token = 'test-token', user = { id: 'u1', plan: 'developer' }) {
  vi.mock('@/lib/store', () => ({
    useAuth: () => ({ token, user }),
  }));
}

export function mockApi(overrides: Record<string, unknown> = {}) {
  vi.mock('@/lib/api', () => {
    const handler: ProxyHandler<Record<string, unknown>> = {
      get(target, prop) {
        if (typeof prop === 'symbol') return undefined;
        if (prop in target) return target[prop];
        // For known API modules, return nested proxy
        const nested = new Proxy({}, {
          get(_, p) {
            if (typeof p === 'symbol') return undefined;
            if (p === 'array') return () => ({});
            return vi.fn().mockResolvedValue({});
          }
        });
        target[prop] = nested;
        return nested;
      },
    };
    return new Proxy(overrides, handler);
  });
}

export function mockValidated() {
  vi.mock('@/hooks/validated', () => ({
    validated: (fn: () => unknown) => fn,
  }));
  vi.mock('@/schemas/api', () => new Proxy({}, {
    get(_, prop) {
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'array') return () => ({});
      if (prop === 'parse') return (v: unknown) => v;
      if (prop === 'safeParse') return (v: unknown) => ({ success: true, data: v });
      return {};
    },
  }));
}

export function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}
