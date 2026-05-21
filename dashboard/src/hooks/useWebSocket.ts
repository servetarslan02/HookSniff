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

const wsDebug = process.env.NODE_ENV === 'development' ? console.log : () => {};

// Global singleton — prevent multiple WS connections across components
let globalWs: WebSocket | null = null;
let globalState: ConnectionState = 'disconnected';
let globalReconnectAttempts = 0;
let globalReconnectTimer: NodeJS.Timeout | null = null;
const globalListeners: Set<(state: ConnectionState) => void> = new Set();
const globalMessageListeners: Set<(event: WsEvent) => void> = new Set();
let globalLastSeq = 0;
let fallbackActive = false;
let globalTokenGetter: (() => string | null) | null = null;

function notifyState(state: ConnectionState) {
  globalState = state;
  globalListeners.forEach(fn => fn(state));
}

function notifyEvent(event: WsEvent) {
  globalMessageListeners.forEach(fn => fn(event));
}

function scheduleReconnect(token: string, maxAttempts: number) {
  if (globalReconnectTimer) clearTimeout(globalReconnectTimer);

  if (globalReconnectAttempts >= maxAttempts) {
    console.warn('[WS] Max reconnect attempts reached, falling back to polling');
    notifyState('fallback');
    fallbackActive = true;
    return;
  }

  notifyState('disconnected');

  // Exponential backoff: 2s → 4s → 8s → 16s → 30s max
  const delay = Math.min(2000 * Math.pow(2, globalReconnectAttempts), 30000);
  globalReconnectAttempts++;
  wsDebug(`[WS] Reconnecting in ${delay}ms (attempt ${globalReconnectAttempts}/${maxAttempts})`);
  globalReconnectTimer = setTimeout(() => connectGlobal(token, maxAttempts), delay);
}

function connectGlobal(token: string, maxAttempts: number) {
  if (!token) return;
  if (globalWs) {
    globalWs.close();
    globalWs = null;
  }

  notifyState('connecting');
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1').replace(/^http/, 'ws') + '/ws';
  const fullUrl = `${wsUrl}?token=${encodeURIComponent(token)}`;
  const connectStart = Date.now();

  wsDebug('[WS] Connecting to:', wsUrl.replace(/^(wss?:\/\/[^/]+).*/, '$1/...'));
  const ws = new WebSocket(fullUrl);
  globalWs = ws;

  ws.onopen = () => {
    wsDebug('[WS] Connected');
    globalReconnectAttempts = 0;
    fallbackActive = false;
    notifyState('connected');
  };

  ws.onmessage = (event) => {
    try {
      const raw = JSON.parse(event.data);

      if (raw.type === 'server_shutdown') {
        wsDebug('[WS] Server shutting down, reconnecting...');
        ws.close();
        return;
      }

      if (raw.type === 'ping') {
        ws.send(JSON.stringify({ type: 'ping' }));
        return;
      }

      const parsed = WsEventSchema.safeParse(raw);
      if (!parsed.success) {
        if (raw.event_type && raw.payload) {
          notifyEvent(raw as WsEvent);
        }
        return;
      }

      if (parsed.data.seq && parsed.data.seq <= globalLastSeq) return;
      if (parsed.data.seq) globalLastSeq = parsed.data.seq;

      notifyEvent(parsed.data);
    } catch {
      // ignore
    }
  };

  ws.onclose = async (event) => {
    const connectDuration = Date.now() - connectStart;
    wsDebug('[WS] Disconnected', {
      code: event.code,
      reason: event.reason || 'no reason',
      wasClean: event.wasClean,
      duration: `${connectDuration}ms`,
    });
    globalWs = null;

    // HS-039: If connection lasted > 10s and dropped, token may have rotated.
    // Get the current token from the store (updated by proactive refresh).
    if (connectDuration > 10000 && globalTokenGetter) {
      const currentToken = globalTokenGetter();
      if (currentToken && currentToken !== token) {
        wsDebug('[WS] Token rotated by proactive refresh, reconnecting with new token');
        globalReconnectAttempts = 0;
        connectGlobal(currentToken, maxAttempts);
        return;
      }
    }

    // Quick failure detection — but only add +1 (not +2)
    const isQuickFailure = connectDuration < 3000 && !event.wasClean;
    if (isQuickFailure) {
      globalReconnectAttempts += 1;
    }

    scheduleReconnect(token, maxAttempts);
  };

  ws.onerror = () => {
    // onclose will fire after this
  };
}

function disconnectGlobal() {
  if (globalReconnectTimer) {
    clearTimeout(globalReconnectTimer);
    globalReconnectTimer = null;
  }
  if (globalWs) {
    globalWs.close();
    globalWs = null;
  }
  globalReconnectAttempts = 0;
  fallbackActive = false;
  notifyState('disconnected');
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { token } = useAuth();
  const [state, setState] = useState<ConnectionState>(globalState);
  const {
    enabled = true,
    onEvent,
    onConnected,
    onDisconnected,
    maxReconnectAttempts = 5,
  } = options;

  // Store token getter for reconnect-on-rotate
  useEffect(() => {
    globalTokenGetter = () => token;
  }, [token]);

  // When token changes (proactive refresh), reconnect WS with new token
  const prevTokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (token && prevTokenRef.current && token !== prevTokenRef.current && globalWs) {
      wsDebug('[WS] Token changed, reconnecting with new token');
      globalReconnectAttempts = 0;
      connectGlobal(token, maxReconnectAttempts);
    }
    prevTokenRef.current = token;
  }, [token, maxReconnectAttempts]);

  // Register state listener
  useEffect(() => {
    const handler = (s: ConnectionState) => setState(s);
    globalListeners.add(handler);
    setState(globalState); // Sync immediately
    return () => { globalListeners.delete(handler); };
  }, []);

  // Register message listener
  useEffect(() => {
    if (!onEvent) return;
    globalMessageListeners.add(onEvent);
    return () => { globalMessageListeners.delete(onEvent); };
  }, [onEvent]);

  // Track connected/disconnected callbacks
  const onConnectedRef = useRef(onConnected);
  onConnectedRef.current = onConnected;
  const onDisconnectedRef = useRef(onDisconnected);
  onDisconnectedRef.current = onDisconnected;

  // Start connection
  useEffect(() => {
    if (!token || !enabled) return;

    // Only connect if not already connected/connecting
    if (globalState === 'disconnected' || (globalState === 'fallback' && !fallbackActive)) {
      globalReconnectAttempts = 0;
      fallbackActive = false;
      connectGlobal(token, maxReconnectAttempts);
    }

    // If already connected, fire onConnected
    if (globalState === 'connected') {
      onConnectedRef.current?.();
    }

    return () => {
      // Don't disconnect on unmount — other components may be listening
    };
  }, [token, enabled, maxReconnectAttempts]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      if (globalState === 'disconnected' || globalState === 'fallback') {
        wsDebug('[WS] Network back online, reconnecting...');
        globalReconnectAttempts = 0;
        fallbackActive = false;
        if (token) connectGlobal(token, maxReconnectAttempts);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [token, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    disconnectGlobal();
  }, []);

  return { state, isConnected: state === 'connected', disconnect };
}
