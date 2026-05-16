'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/lib/store';
import { WsEventSchema, type WsEvent } from '@/schemas/api';

interface UseWebSocketOptions {
  enabled?: boolean;
  onEvent?: (event: WsEvent) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  maxReconnectAttempts?: number;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'fallback';

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const [state, setState] = useState<ConnectionState>('disconnected');
  const lastSeqRef = useRef<number>(0);

  const {
    enabled = true,
    onEvent,
    onConnected,
    onDisconnected,
    maxReconnectAttempts = 10,
  } = options;

  const connect = useCallback(() => {
    if (!token || !enabled) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState('connecting');
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1').replace(/^http/, 'ws') + '/ws';
    const connectStart = Date.now();

    const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);

    ws.onopen = () => {
      console.log('[WS] Connected');
      setState('connected');
      reconnectAttempts.current = 0;
      onConnected?.();
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);

        // Server shutdown mesajı
        if (raw.type === 'server_shutdown') {
          console.log('[WS] Server shutting down, reconnecting...');
          ws.close();
          return;
        }

        // Ping mesajı — pong gönder
        if (raw.type === 'ping') {
          ws.send(JSON.stringify({ type: 'ping' }));
          return;
        }

        // Zod validation
        const parsed = WsEventSchema.safeParse(raw);
        if (!parsed.success) {
          // WsEvent formatında değilse, raw olarak işle
          if (raw.event_type && raw.payload) {
            onEvent?.(raw as WsEvent);
          }
          return;
        }

        // Sequence ordering — eski mesajları atla
        if (parsed.data.seq && parsed.data.seq <= lastSeqRef.current) {
          return;
        }
        if (parsed.data.seq) {
          lastSeqRef.current = parsed.data.seq;
        }

        onEvent?.(parsed.data);
      } catch {
        // Parse hatası — ignore
      }
    };

    ws.onclose = (event) => {
      const connectDuration = Date.now() - connectStart;
      console.log('[WS] Disconnected', event.code, event.reason, `(${connectDuration}ms)`);
      wsRef.current = null;
      onDisconnected?.();

      // Quick failure detection — if connection fails within 3s, it's likely
      // that WS is not supported (e.g. proxy, Cloud Run cold start).
      // Fall back to polling after 3 quick failures instead of 10.
      const isQuickFailure = connectDuration < 3000 && !event.wasClean;
      if (isQuickFailure) {
        reconnectAttempts.current += 2; // Fast-track to fallback
      }

      // Max reconnect attempts kontrolü
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.warn('[WS] Max reconnect attempts reached, falling back to polling');
        setState('fallback');
        return;
      }

      setState('disconnected');

      // Exponential backoff reconnect (1s → 2s → 4s → ... → 30s max)
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };

    wsRef.current = ws;
  }, [token, enabled, onEvent, onConnected, onDisconnected, maxReconnectAttempts]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      if (state === 'disconnected' || state === 'fallback') {
        console.log('[WS] Network back online, reconnecting...');
        reconnectAttempts.current = 0;
        connect();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [state, connect]);

  // Token refresh — reconnect when token changes
  useEffect(() => {
    if (token && wsRef.current?.readyState === WebSocket.OPEN) {
      // Token yenilendi → yeniden bağlan
      wsRef.current.close();
      reconnectAttempts.current = 0;
      connect();
    }
  }, [token, connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    wsRef.current?.close();
    wsRef.current = null;
    setState('disconnected');
  }, []);

  return { state, isConnected: state === 'connected', disconnect };
}
