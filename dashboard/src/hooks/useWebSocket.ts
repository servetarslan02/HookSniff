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

// Global singleton — prevent multiple WS connections across components
let globalWs: WebSocket | null = null;
let globalState: ConnectionState = 'disconnected';
let globalReconnectAttempts = 0;
let globalReconnectTimer: NodeJS.Timeout | null = null;
let globalListeners: Set<(state: ConnectionState) => void> = new Set();
let globalMessageListeners: Set<(event: WsEvent) => void> = new Set();
let globalLastSeq = 0;
let fallbackActive = false;
let globalTokenGetter: (() => string | null) | null = null;
let globalRefreshTimer: NodeJS.Timeout | null = null;

function notifyState(state: ConnectionState) {
  globalState = state;
  globalListeners.forEach(fn => fn(state));
}

function notifyEvent(event: WsEvent) {
  globalMessageListeners.forEach(fn => fn(event));
}

/** Refresh the JWT token via the API refresh endpoint */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/v1';
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.token) {
      // Update the store
      localStorage.setItem('hooksniff_token', data.token);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
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
  console.log(`[WS] Reconnecting in ${delay}ms (attempt ${globalReconnectAttempts}/${maxAttempts})`);
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

  console.log('[WS] Connecting to:', wsUrl.replace(/^(wss?:\/\/[^/]+).*/, '$1/...'));
  const ws = new WebSocket(fullUrl);
  globalWs = ws;

  ws.onopen = () => {
    console.log('[WS] Connected');
    globalReconnectAttempts = 0;
    fallbackActive = false;
    notifyState('connected');

    // Proactive token refresh — renew 2 min before expiry (token is 15min)
    // This prevents the connection from ever dropping due to token expiry
    if (globalRefreshTimer) clearTimeout(globalRefreshTimer);
    globalRefreshTimer = setTimeout(async () => {
      console.log('[WS] Proactive token refresh (before expiry)');
      const newToken = await refreshAccessToken();
      if (newToken && globalWs) {
        console.log('[WS] Token refreshed, reconnecting proactively');
        globalReconnectAttempts = 0;
        globalWs.close();
        connectGlobal(newToken, maxAttempts);
      }
    }, 13 * 60 * 1000); // 13 minutes (2 min before 15min expiry)
  };

  ws.onmessage = (event) => {
    try {
      const raw = JSON.parse(event.data);

      if (raw.type === 'server_shutdown') {
        console.log('[WS] Server shutting down, reconnecting...');
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
    console.log('[WS] Disconnected', {
      code: event.code,
      reason: event.reason || 'no reason',
      wasClean: event.wasClean,
      duration: `${connectDuration}ms`,
    });
    globalWs = null;

    // If connection lasted > 10s, it was a real connection that dropped
    // (likely token expiry). Try to refresh the token first.
    if (connectDuration > 10000 && globalTokenGetter) {
      console.log('[WS] Long-lived connection dropped, attempting token refresh...');
      const newToken = await refreshAccessToken();
      if (newToken) {
        console.log('[WS] Token refreshed, reconnecting with new token');
        globalReconnectAttempts = 0;
        connectGlobal(newToken, maxAttempts);
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
  if (globalRefreshTimer) {
    clearTimeout(globalRefreshTimer);
    globalRefreshTimer = null;
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

  // Store token getter for refresh
  useEffect(() => {
    globalTokenGetter = () => token;
  }, [token]);

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
        console.log('[WS] Network back online, reconnecting...');
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
