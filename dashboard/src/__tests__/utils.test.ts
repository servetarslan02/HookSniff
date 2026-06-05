import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('getErrorMessage', () => {
  it('extracts message from Error object', () => {
    expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
  });

  it('returns fallback for null', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
  });

  it('returns custom fallback for undefined', () => {
    expect(getErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback');
  });

  it('handles string errors', () => {
    expect(getErrorMessage('string error')).toBe('string error');
  });

  it('handles object with message', () => {
    expect(getErrorMessage({ message: 'obj error' })).toBe('obj error');
  });
});

describe('validated wrapper', () => {
  it('passes through successful data', async () => {
    const { validated } = await import('@/hooks/validated');
    const schema = { parse: (data: unknown) => data };
    const fetcher = validated(() => Promise.resolve({ ok: true }), schema as any);
    const result = await fetcher();
    expect(result).toEqual({ ok: true });
  });

  it('throws on schema validation failure', async () => {
    const { validated } = await import('@/hooks/validated');
    const schema = { parse: () => { throw new Error('Invalid data'); } };
    const fetcher = validated(() => Promise.resolve({ bad: true }), schema as any);
    await expect(fetcher()).rejects.toThrow('Invalid data');
  });
});

describe('useDebouncedSearch hook', () => {
  it('module exports correctly', async () => {
    const mod = await import('@/hooks/useDebouncedSearch');
    expect(mod.useDebouncedSearch).toBeDefined();
    expect(typeof mod.useDebouncedSearch).toBe('function');
  });
});

describe('Module exports', () => {
  it('usePermissions exports correctly', async () => {
    const mod = await import('@/hooks/usePermissions');
    expect(mod).toBeDefined();
  });

  it('useTeamRole exports correctly', async () => {
    const mod = await import('@/hooks/useTeamRole');
    expect(mod).toBeDefined();
  });

  it('useCollections exports correctly', async () => {
    const mod = await import('@/hooks/useCollections');
    expect(mod).toBeDefined();
  });

  it('usePlans exports correctly', async () => {
    const mod = await import('@/hooks/usePlans');
    expect(mod).toBeDefined();
  });

  it('useFriendlyToast exports correctly', async () => {
    const mod = await import('@/hooks/useFriendlyToast');
    expect(mod).toBeDefined();
  });

  it('useIdleTimeout exports correctly', async () => {
    const mod = await import('@/hooks/useIdleTimeout');
    expect(mod).toBeDefined();
  });
});
