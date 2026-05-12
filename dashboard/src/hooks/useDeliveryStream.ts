'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface DeliveryEvent {
  id: string;
  endpoint_id: string;
  event: string | null;
  status: string;
  attempts: number;
  endpoint_url: string;
  created_at: string;
}

interface UseDeliveryStreamOptions {
  token: string;
  enabled?: boolean;
  onDelivery?: (delivery: DeliveryEvent) => void;
}

/**
 * Hook for real-time delivery updates via SSE.
 * Connects to GET /v1/stream/deliveries and listens for new deliveries.
 * Uses SSE (Server-Sent Events) which handles reconnection automatically.
 * For WebSocket connections, server-initiated ping would be needed (Item 333).
 */
export function useDeliveryStream({ token, enabled = true, onDelivery }: UseDeliveryStreamOptions) {
  const [connected, setConnected] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDeliveryRef = useRef(onDelivery);

  // Keep callback ref fresh
  onDeliveryRef.current = onDelivery;

  const connect = useCallback(() => {
    if (!token || !enabled) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
    const url = `${API_BASE}/stream/deliveries`;

    // EventSource doesn't support custom headers, so we use fetch with ReadableStream
    const controller = new AbortController();

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setConnected(true);

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let eventType = '';
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (eventType === 'delivery') {
                try {
                  const delivery: DeliveryEvent = JSON.parse(data);
                  setDeliveries((prev) => [delivery, ...prev].slice(0, 100));
                  onDeliveryRef.current?.(delivery);
                } catch {
                  // ignore parse errors
                }
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setConnected(false);
          // Auto-reconnect after 5s (Item 333)
          reconnectTimeoutRef.current = setTimeout(() => connect(), 5000);
        }
      });

    eventSourceRef.current = null; // We're using fetch, not EventSource
    return () => controller.abort();
  }, [token, enabled]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      setConnected(false);
    };
  }, [connect]);

  const clearDeliveries = useCallback(() => setDeliveries([]), []);

  return { connected, deliveries, clearDeliveries };
}
