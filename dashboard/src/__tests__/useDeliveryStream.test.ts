// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeliveryStream } from '@/hooks/useDeliveryStream';

// Mock fetch globally
const mockReader = {
  read: vi.fn(),
  releaseLock: vi.fn(),
};

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useDeliveryStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockReader.read.mockReset();
  });

  it('initializes with disconnected state', () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: false })
    );

    expect(result.current.connected).toBe(false);
    expect(result.current.deliveries).toEqual([]);
  });

  it('provides clearDeliveries function', () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: false })
    );

    expect(typeof result.current.clearDeliveries).toBe('function');
  });

  it('clearDeliveries resets deliveries array', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: false })
    );

    act(() => {
      result.current.clearDeliveries();
    });

    expect(result.current.deliveries).toEqual([]);
  });

  it('does not connect when enabled is false', () => {
    renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: false })
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not connect when token is empty', () => {
    renderHook(() =>
      useDeliveryStream({ token: '', enabled: true })
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('connects with correct URL and headers when enabled', async () => {
    // Make fetch hang so we can verify the call
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderHook(() =>
      useDeliveryStream({ token: 'my-token', enabled: true })
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/stream/deliveries');
    expect(options.headers.Authorization).toBe('Bearer my-token');
  });

  it('sets connected to false on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    // Wait for the fetch to reject
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.connected).toBe(false);
  });

  it('sets connected to false on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() =>
      useDeliveryStream({ token: 'test-token', enabled: true })
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.connected).toBe(false);
  });
});
