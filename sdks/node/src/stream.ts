/**
 * Server-Sent Events (SSE) client for HookSniff real-time event streaming.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // Listen for real-time events
 * const stream = hs.stream.subscribe({
 *   eventTypes: ["order.created", "order.updated"],
 *   onEvent: (event) => {
 *     console.log("New event:", event.eventType, event.data);
 *   },
 *   onError: (error) => {
 *     console.error("Stream error:", error);
 *   },
 * });
 *
 * // Stop listening
 * stream.close();
 * ```
 */

export interface StreamOptions {
  /** Event types to subscribe to (omit for all events) */
  eventTypes?: string[];
  /** Called for each incoming event */
  onEvent: (event: StreamEvent) => void;
  /** Called on connection error */
  onError?: (error: Error) => void;
  /** Called when connection opens */
  onOpen?: () => void;
  /** Called when connection closes */
  onClose?: () => void;
  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;
  /** Reconnect delay in ms (default: 1000) */
  reconnectDelayMs?: number;
  /** Maximum reconnect attempts (default: 10) */
  maxReconnectAttempts?: number;
}

export interface StreamEvent {
  /** Event type (e.g., "message.created") */
  eventType: string;
  /** Event data payload */
  data: Record<string, unknown>;
  /** Event ID for deduplication */
  id?: string;
  /** ISO 8601 timestamp */
  timestamp?: string;
}

export interface StreamSubscription {
  /** Close the SSE connection */
  close: () => void;
  /** Whether the connection is currently open */
  isConnected: () => boolean;
}

/**
 * Subscribe to real-time events via Server-Sent Events (SSE).
 *
 * @param ctx - The request context (base URL, token, etc.)
 * @param options - Stream configuration
 * @returns A subscription object to manage the connection
 */
export function subscribeToStream(
  ctx: { baseUrl: string; token: string; timeout?: number },
  options: StreamOptions
): StreamSubscription {
  const {
    eventTypes,
    onEvent,
    onError,
    onOpen,
    onClose,
    autoReconnect = true,
    reconnectDelayMs = 1000,
    maxReconnectAttempts = 10,
  } = options;

  let eventSource: EventSource | null = null;
  let connected = false;
  let reconnectAttempts = 0;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function buildUrl(): string {
    const url = new URL(`${ctx.baseUrl}/api/v1/stream`);
    if (eventTypes?.length) {
      url.searchParams.set("event_types", eventTypes.join(","));
    }
    return url.toString();
  }

  function connect(): void {
    if (closed) return;

    const url = buildUrl();

    // Use native EventSource if available, otherwise fetch-based fallback
    if (typeof EventSource !== "undefined") {
      connectEventSource(url);
    } else {
      connectFetch(url);
    }
  }

  function connectEventSource(url: string): void {
    eventSource = new EventSource(url, {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
      },
    } as any);

    eventSource.onopen = () => {
      connected = true;
      reconnectAttempts = 0;
      onOpen?.();
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const parsed: StreamEvent = JSON.parse(event.data);
        onEvent(parsed);
      } catch (e) {
        // If JSON parsing fails, pass raw data
        onEvent({
          eventType: "unknown",
          data: { raw: event.data },
          id: event.lastEventId,
        });
      }
    };

    eventSource.onerror = () => {
      connected = false;
      eventSource?.close();
      eventSource = null;

      if (autoReconnect && !closed && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = reconnectDelayMs * Math.pow(2, reconnectAttempts - 1);
        reconnectTimeout = setTimeout(connect, delay);
      } else {
        onClose?.();
      }
    };
  }

  async function connectFetch(url: string): Promise<void> {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        signal: ctx.timeout ? AbortSignal.timeout(ctx.timeout) : undefined,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      connected = true;
      reconnectAttempts = 0;
      onOpen?.();

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (!closed) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed: StreamEvent = JSON.parse(data);
              onEvent(parsed);
            } catch {
              onEvent({
                eventType: "unknown",
                data: { raw: data },
              });
            }
          } else if (line.startsWith("event: ")) {
            // Event type prefix — will be combined with next data line
          } else if (line.startsWith("id: ")) {
            // Event ID
          } else if (line.startsWith("retry: ")) {
            // Reconnect interval suggestion
          }
        }
      }

      connected = false;
      if (autoReconnect && !closed && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = reconnectDelayMs * Math.pow(2, reconnectAttempts - 1);
        reconnectTimeout = setTimeout(connect, delay);
      } else {
        onClose?.();
      }
    } catch (error) {
      connected = false;
      onError?.(error as Error);

      if (autoReconnect && !closed && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = reconnectDelayMs * Math.pow(2, reconnectAttempts - 1);
        reconnectTimeout = setTimeout(connect, delay);
      } else {
        onClose?.();
      }
    }
  }

  // Start connection
  connect();

  return {
    close: () => {
      closed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      connected = false;
      onClose?.();
    },
    isConnected: () => connected,
  };
}
