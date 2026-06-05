// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 'u1', plan: 'developer' } }),
}));

vi.mock('@/lib/api', () => ({
  broadcastsApi: {
    listActive: vi.fn().mockResolvedValue([{ id: 'b1', title: 'Test', severity: 'info' }]),
    getUnreadCount: vi.fn().mockResolvedValue({ unread_count: 1 }),
    dismiss: vi.fn().mockResolvedValue({ dismissed: true }),
  },
}));

import { useBroadcasts, useBroadcastUnreadCount, useDismissBroadcast } from '@/hooks/useBroadcasts';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe('useBroadcasts', () => {
  it('fetches active broadcasts', async () => {
    const { result } = renderHook(() => useBroadcasts(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it('fetches unread count', async () => {
    const { result } = renderHook(() => useBroadcastUnreadCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.unread_count).toBe(1);
  });

  it('dismiss mutation returns mutation object', () => {
    const { result } = renderHook(() => useDismissBroadcast(), { wrapper: createWrapper() });
    expect(result.current.mutate).toBeDefined();
  });
});
