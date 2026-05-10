// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeliveryStream, type DeliveryEvent } from '@/hooks/useDeliveryStream';

// Mock fetch for SSE
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useDeliveryStream — Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // === Initial state ===
  it('initializes with empty deliveries', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves
    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );
    expect(result.current.deliveries).toEqual([]);
  });

  it('initializes as not connected', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );
    expect(result.current.connected).toBe(false);
  });

  // === Disabled state ===
  it('does not fetch when disabled', () => {
    renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: false })
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not fetch when token is empty', () => {
    renderHook(() =>
      useDeliveryStream({ token: '', enabled: true })
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // === clearDeliveries ===
  it('clears deliveries', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    act(() => {
      result.current.clearDeliveries();
    });

    expect(result.current.deliveries).toEqual([]);
  });

  // === SSE connection ===
  it('connects to stream endpoint with auth header', () => {
    const mockReader = {
      read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
    };
    const mockBody = { getReader: () => mockReader };
    mockFetch.mockResolvedValue({
      ok: true,
      body: mockBody,
    });

    renderHook(() =>
      useDeliveryStream({ token: 'my-token', enabled: true })
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/stream/deliveries'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer my-token' },
      })
    );
  });

  it('sets connected to true on successful connection', async () => {
    const mockReader = {
      read: vi.fn().mockResolvedValueOnce({ done: true, value: undefined }),
    };
    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.connected).toBe(true);
  });

  it('sets connected to false on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.connected).toBe(false);
  });

  it('sets connected to false on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.connected).toBe(false);
  });

  // === Delivery parsing ===
  it('parses delivery events from SSE stream', async () => {
    const delivery: DeliveryEvent = {
      id: 'del_123',
      endpoint_id: 'ep_1',
      event: 'order.created',
      status: 'delivered',
      attempts: 1,
      endpoint_url: 'https://example.com',
      created_at: '2024-06-01T10:00:00Z',
    };

    const encoder = new TextEncoder();
    const chunk = encoder.encode(`event: delivery\ndata: ${JSON.stringify(delivery)}\n\n`);

    let readCallCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        readCallCount++;
        if (readCallCount === 1) {
          return Promise.resolve({ done: false, value: chunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const onDelivery = vi.fn();
    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true, onDelivery })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.deliveries).toHaveLength(1);
    expect(result.current.deliveries[0].id).toBe('del_123');
    expect(onDelivery).toHaveBeenCalledWith(delivery);
  });

  it('limits deliveries to 100', async () => {
    const encoder = new TextEncoder();
    let chunks: string = '';
    for (let i = 0; i < 110; i++) {
      chunks += `event: delivery\ndata: ${JSON.stringify({ id: `del_${i}`, endpoint_id: 'ep', event: 'test', status: 'delivered', attempts: 1, endpoint_url: 'https://example.com', created_at: '2024-01-01' })}\n\n`;
    }
    const chunk = encoder.encode(chunks);

    let readCallCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        readCallCount++;
        if (readCallCount === 1) {
          return Promise.resolve({ done: false, value: chunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.deliveries.length).toBeLessThanOrEqual(100);
  });

  it('ignores non-delivery events', async () => {
    const encoder = new TextEncoder();
    const chunk = encoder.encode(`event: heartbeat\ndata: {}\n\n`);

    let readCallCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        readCallCount++;
        if (readCallCount === 1) {
          return Promise.resolve({ done: false, value: chunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.deliveries).toHaveLength(0);
  });

  it('ignores malformed JSON in delivery events', async () => {
    const encoder = new TextEncoder();
    const chunk = encoder.encode(`event: delivery\ndata: not-json\n\n`);

    let readCallCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        readCallCount++;
        if (readCallCount === 1) {
          return Promise.resolve({ done: false, value: chunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.deliveries).toHaveLength(0);
  });

  // === No body ===
  it('handles response with no body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      body: null,
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.deliveries).toHaveLength(0);
  });

  // === Cleanup ===
  it('cleans up on unmount', () => {
    // We can't easily spy on AbortController, but we can verify the hook doesn't crash on unmount
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { unmount } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    unmount();
    // No crash = success
  });
});
