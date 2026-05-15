// ─────────────────────────────────────────────────────────────────
// useWebSocket + useRealtime Hook Tests
// WS connection, reconnect, fallback, event handling
// ─────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ── Mock WebSocket ─────────────────────────────────────────────
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  readyState = 0; // CONNECTING
  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  url: string;
  sent: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
    // Simulate async connect
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3; // CLOSED
    this.onclose?.(new CloseEvent('close', { code: 1000 }));
  }

  simulateMessage(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }

  simulateError() {
    this.onerror?.(new Event('error'));
  }

  simulateClose(code = 1000) {
    this.readyState = 3;
    this.onclose?.(new CloseEvent('close', { code }));
  }
}

// ── Mock store ─────────────────────────────────────────────────
vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'test-jwt-token' }),
}));

// ── Mock schemas ───────────────────────────────────────────────
vi.mock('@/schemas/api', () => ({
  WsEventSchema: {
    safeParse: (data: unknown) => {
      if (data && typeof data === 'object' && 'type' in data) {
        return { success: true, data };
      }
      return { success: false, error: new Error('Invalid') };
    },
  },
}));

describe('useWebSocket', () => {
  let originalWebSocket: typeof globalThis.WebSocket;

  beforeEach(() => {
    originalWebSocket = globalThis.WebSocket;
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    MockWebSocket.instances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    globalThis.WebSocket = originalWebSocket;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('connects on mount when token exists', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');

    renderHook(() => useWebSocket({ enabled: true }));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    expect(MockWebSocket.instances.length).toBe(1);
    expect(MockWebSocket.instances[0].url).toContain('token=');
  });

  it('does not connect when disabled', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');

    renderHook(() => useWebSocket({ enabled: false }));

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(MockWebSocket.instances.length).toBe(0);
  });

  it('calls onConnected when connection opens', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');
    const onConnected = vi.fn();

    renderHook(() => useWebSocket({ onConnected }));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    expect(onConnected).toHaveBeenCalledTimes(1);
  });

  it('calls onEvent when message received', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');
    const onEvent = vi.fn();

    renderHook(() => useWebSocket({ onEvent }));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateMessage({ type: 'delivery.created', ts: Date.now(), data: {} });
    });

    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it('handles ping messages', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');

    renderHook(() => useWebSocket({}));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const ws = MockWebSocket.instances[0];
    act(() => {
      ws.simulateMessage({ type: 'ping' });
    });

    expect(ws.sent.some((s) => s.includes('"type":"ping"'))).toBe(true);
  });

  it('handles server shutdown message', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');

    renderHook(() => useWebSocket({}));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const ws = MockWebSocket.instances[0];
    const closeSpy = vi.spyOn(ws, 'close');

    act(() => {
      ws.simulateMessage({ type: 'server_shutdown' });
    });

    expect(closeSpy).toHaveBeenCalled();
  });

  it('reconnects on close with exponential backoff', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');

    renderHook(() => useWebSocket({ maxReconnectAttempts: 3 }));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    expect(MockWebSocket.instances.length).toBe(1);

    // Simulate close
    act(() => {
      MockWebSocket.instances[0].simulateClose(1006);
    });

    // Wait for reconnect (1s backoff)
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(MockWebSocket.instances.length).toBe(2);
  });

  it('falls back after max reconnect attempts', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');

    const { result } = renderHook(() => useWebSocket({ maxReconnectAttempts: 2 }));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    // Close twice
    for (let i = 0; i < 2; i++) {
      act(() => {
        MockWebSocket.instances[MockWebSocket.instances.length - 1].simulateClose(1006);
      });
      await act(async () => {
        vi.advanceTimersByTime(35000);
      });
    }

    expect(result.current.state).toBe('fallback');
  });

  it('disconnect cleans up', async () => {
    const { useWebSocket } = await import('@/hooks/useWebSocket');

    const { result } = renderHook(() => useWebSocket({}));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const ws = MockWebSocket.instances[0];
    const closeSpy = vi.spyOn(ws, 'close');

    act(() => {
      result.current.disconnect();
    });

    expect(closeSpy).toHaveBeenCalled();
  });
});

describe('useRealtime', () => {
  let originalWebSocket: typeof globalThis.WebSocket;

  beforeEach(() => {
    originalWebSocket = globalThis.WebSocket;
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    MockWebSocket.instances = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    globalThis.WebSocket = originalWebSocket;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns connection state', async () => {
    const { useRealtime } = await import('@/hooks/useRealtime');

    const { result } = renderHook(() => useRealtime());

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    expect(result.current.connectionState).toBeDefined();
  });

  it('starts fallback polling when disconnected', async () => {
    const { useRealtime } = await import('@/hooks/useRealtime');

    // Don't connect (no open event)
    const { result } = renderHook(() => useRealtime());

    // State should be disconnected initially
    expect(result.current.connectionState).toBe('disconnected');
  });
});
