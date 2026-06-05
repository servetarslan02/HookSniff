// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer' } }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    getServiceTokens: vi.fn().mockResolvedValue([{ id: 'st1', name: 'CI Token', active: true }]),
    createServiceToken: vi.fn().mockResolvedValue({ id: 'st2', name: 'New', key: 'sk_xxx' }),
    deleteServiceToken: vi.fn().mockResolvedValue({ deleted: true }),
    revealServiceToken: vi.fn().mockResolvedValue({ key: 'sk_xxx' }),
    updateServiceToken: vi.fn().mockResolvedValue({ id: 'st1', name: 'Updated' }),
  },
}));

import { useServiceTokens, useCreateServiceToken, useDeleteServiceToken, useRevealServiceToken, useUpdateServiceToken } from '@/hooks/useServiceTokens';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useServiceTokens', () => {
  it('fetches service tokens', async () => {
    const { result } = renderHook(() => useServiceTokens(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('create mutation exists', () => {
    const { result } = renderHook(() => useCreateServiceToken(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('delete mutation exists', () => {
    const { result } = renderHook(() => useDeleteServiceToken(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('reveal mutation exists', () => {
    const { result } = renderHook(() => useRevealServiceToken(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('update mutation exists', () => {
    const { result } = renderHook(() => useUpdateServiceToken(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

// ── useTransforms ──
vi.mock('@/lib/api', () => ({
  api: {
    getTransformRules: vi.fn().mockResolvedValue([{ id: 'tr1', name: 'Filter' }]),
    createTransformRule: vi.fn().mockResolvedValue({ id: 'tr2' }),
    deleteTransformRule: vi.fn().mockResolvedValue({ deleted: true }),
    updateTransformRule: vi.fn().mockResolvedValue({ id: 'tr1' }),
    testTransform: vi.fn().mockResolvedValue({ output: {} }),
  },
}));

import { useTransformRules, useCreateTransformRule, useDeleteTransformRule, useTestTransform } from '@/hooks/useTransforms';

describe('useTransforms', () => {
  it('fetches transform rules', async () => {
    const { result } = renderHook(() => useTransformRules(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('create mutation exists', () => {
    const { result } = renderHook(() => useCreateTransformRule(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('delete mutation exists', () => {
    const { result } = renderHook(() => useDeleteTransformRule(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('test mutation exists', () => {
    const { result } = renderHook(() => useTestTransform(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

// ── useRateLimits ──
import { useRateLimits, useSetRateLimit, useDeleteRateLimit } from '@/hooks/useRateLimits';

describe('useRateLimits', () => {
  it('fetches rate limits', async () => {
    const { result } = renderHook(() => useRateLimits(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('set mutation exists', () => {
    const { result } = renderHook(() => useSetRateLimit(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('delete mutation exists', () => {
    const { result } = renderHook(() => useDeleteRateLimit(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});

// ── useInboundConfigs ──
import { useInboundConfigs, useCreateInboundConfig, useDeleteInboundConfig } from '@/hooks/useInboundConfigs';

describe('useInboundConfigs', () => {
  it('fetches inbound configs', async () => {
    const { result } = renderHook(() => useInboundConfigs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('create mutation exists', () => {
    const { result } = renderHook(() => useCreateInboundConfig(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });

  it('delete mutation exists', () => {
    const { result } = renderHook(() => useDeleteInboundConfig(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
