# Deep Review: WebSocket & Real-Time Features

**Reviewer:** Subagent (deep-ws-realtime)
**Date:** 2026-05-10
**Scope:** WebSocket gateway, SSE stream, frontend real-time hooks, worker event publishing

---

## Architecture Overview

HookSniff has **three separate real-time mechanisms** that are **not interconnected**:

| Layer | Mechanism | Status |
|-------|-----------|--------|
| **API** — WebSocket gateway | `api/src/ws/mod.rs` + `handler.rs` | ✅ Well-implemented but **NOT wired into routes** |
| **API** — SSE stream | `api/src/routes/stream.rs` | ✅ Working — DB-polling based |
| **API** — Events polling | `api/src/routes/events.rs` | ✅ Working — REST fallback |
| **Worker** — Event publishing | `worker/src/fanout.rs` | ❌ **No integration** with WS gateway |
| **Frontend** — `useDeliveryStream` | `dashboard/src/hooks/useDeliveryStream.ts` | ✅ Uses SSE via fetch + ReadableStream |
| **Frontend** — `NotificationCenter` | `dashboard/src/components/NotificationCenter.tsx` | ⚠️ Polling only (30s interval) |
| **Frontend** — `LiveRequestViewer` | `dashboard/src/app/[locale]/dashboard/playground/page.tsx` | ⚠️ Polling only (3s interval) |
| **Frontend** — Deliveries page | `dashboard/src/app/[locale]/dashboard/deliveries/page.tsx` | ❌ No real-time — manual refresh only |

---

## 1. WebSocket Implementation (api/src/ws/)

### 1.1 Connection Lifecycle — ✅ Solid

**Upgrade & Auth:**
- JWT authentication via `authenticate_ws_token()` — validates token, extracts `customer_id`
- Token validated at connection time only (see §5.2 for security concern)
- Connection registered with `WsGateway::add_connection()`

**Heartbeat:**
- Server sends `Ping` messages; client responds with `Pong`
- `last_heartbeat` timestamp tracked per connection
- Stale connections (no heartbeat in 5 min) cleaned by `cleanup_stale()`
- Config: 30s ping interval, 10s pong timeout

**Close:**
- Client-initiated `Close` message breaks the receive loop
- Server-side errors also break the loop
- `tokio::select!` on forward/receive tasks — whichever ends first triggers cleanup
- `remove_connection()` called on cleanup — proper resource release

**⚠️ Issue: No server-initiated ping.** The handler reads `Message::Ping`/`Pong` from the client but never *sends* pings itself. The `WsMessage::Ping` variant exists but is never dispatched by the forward task. The heartbeat mechanism relies entirely on the Axum WebSocket layer's built-in ping/pong, which is binary — not the JSON `{"type":"ping"}` protocol.

**Verdict:** Connection lifecycle is structurally sound but the heartbeat design has a gap.

### 1.2 Message Format & Protocol — ✅ Clean

```rust
#[serde(tag = "type", rename_all = "snake_case")]
pub enum WsMessage {
    Event(WsEvent),
    Ping { timestamp: i64 },
    Pong { timestamp: i64 },
    Subscribed { event_types: Vec<String> },
    Error { code: String, message: String },
    Connected { connection_id: String, server_time: DateTime<Utc> },
}
```

- Tagged union with `type` discriminator — idiomatic
- Client messages: `subscribe`, `unsubscribe`, `ping`
- Server messages: `event`, `ping`, `pong`, `subscribed`, `error`, `connected`
- Serialization: `serde_json` with `#[serde(tag = "type")]`

**⚠️ Issue:** `WsMessage::Error` is defined but **never sent** to clients. Invalid messages are logged server-side but the client receives no error feedback.

### 1.3 Room/Channel Subscription Model — ✅ Flexible

- Glob-style pattern matching: `order.*`, `*.created`, `payment.completed`
- Empty filters = receive all events (dangerous — see §5.4)
- `subscribe`/`unsubscribe` client messages update filters dynamically
- Filters are per-connection, not per-user

**⚠️ Issue:** No validation on subscription patterns. A client could subscribe to `*` and receive all events for their customer_id, which may be intentional but could cause bandwidth issues.

### 1.4 Reconnection Logic — ❌ Server-Side Gap

**Server:** No reconnection support. When a connection drops, all state is lost. There's no:
- Event sequence numbering
- Last-event-ID tracking
- Catch-up replay on reconnect
- Connection resume token

**Client:** The frontend `useDeliveryStream` uses SSE (not WebSocket), and SSE has built-in reconnection via `Last-Event-ID`. But the SSE implementation doesn't use it — it always starts from "now" or a provided `since` timestamp.

### 1.5 Message Ordering — ⚠️ Best-Effort

- Events broadcast via `tokio::sync::mpsc::UnboundedSender` — preserves order per connection
- But `broadcast_event()` iterates connections in `HashMap` order (non-deterministic)
- No sequence numbers — clients cannot detect gaps or reordering

### 1.6 Backpressure Handling — ❌ Missing

- Uses `UnboundedSender` for per-connection channels — **unbounded queue**
- If a slow client can't keep up, messages accumulate in memory indefinitely
- Rate limiter (`ConnectionRateLimiter`) only limits *outbound* message rate (100/min default) — doesn't prevent queue growth
- No mechanism to drop old messages or disconnect slow clients

**Risk:** A slow or stalled client could cause unbounded memory growth.

---

## 2. Server-Sent Events (SSE)

### 2.1 Implementation — `api/src/routes/stream.rs`

**How it works:**
1. Client connects to `GET /v1/stream/deliveries` with Bearer token
2. Server polls DB every 2 seconds for deliveries newer than `last_check`
3. New deliveries emitted as `event: delivery\ndata: {...}\n\n`
4. Heartbeat events emitted alongside deliveries
5. Axum's `Sse::new().keep_alive()` sends `ping` every 15s

**Strengths:**
- Simple, reliable — DB-polling means no message bus dependency
- `since` parameter for catch-up on reconnect
- Keep-alive prevents proxy timeouts

**Weaknesses:**
- 2-second polling latency (not truly real-time)
- DB query every 2 seconds per connected client — doesn't scale well
- No `Last-Event-ID` header support — can't resume from disconnect point
- No per-customer filtering in the keep-alive (all customers poll independently)

### 2.2 Frontend Consumption — `useDeliveryStream.ts`

**How it works:**
- Uses `fetch()` with `ReadableStream` instead of `EventSource` (to pass Authorization header)
- Parses SSE format manually: `event:` and `data:` lines
- Caps stored deliveries at 100 (FIFO)
- `onDelivery` callback for external consumers

**Issues:**
- **No reconnection logic.** If the fetch stream ends or errors, `connected` is set to `false` and that's it. No automatic retry, no exponential backoff.
- **No `Last-Event-ID`.** On reconnect, misses events that occurred during disconnect.
- **Buffer parsing is fragile.** The `buffer += decoder.decode(value, { stream: true })` approach works but has edge cases with multi-byte UTF-8 characters split across chunks.
- **Cleanup race.** The `connect` callback returns a cleanup function, but it's captured in a closure that may not fire correctly on fast re-renders.

### 2.3 Fallback — `api/src/routes/events.rs`

- `GET /v1/events` — REST polling endpoint with pagination, filtering, `since` parameter
- Good fallback for environments without SSE support
- Max 200 per page, proper pagination

---

## 3. Real-Time Data Consistency

### 3.1 WebSocket State vs DB — ⚠️ Can Diverge

- **WebSocket gateway** is entirely in-memory (`HashMap<String, WsConnection>`)
- **SSE stream** polls the DB directly
- **No bridge:** The worker processes deliveries and writes to DB, but never notifies the WebSocket gateway
- If a client is connected via WebSocket, they receive **nothing** because `broadcast_event()` is never called by any production code path

### 3.2 Missed Events on Reconnect — ❌ No Catch-Up

- **WebSocket:** No event history, no sequence numbers, no replay
- **SSE:** `since` parameter exists but is not used by the frontend on reconnect
- **Notifications:** Pure polling — 30-second interval means up to 30s of delay

### 3.3 Worker → Frontend Event Flow — ❌ Broken

The intended flow appears to be:
```
Webhook received → Worker processes → DB updated → SSE polls DB → Frontend updates
```

But the WebSocket path has no connection:
```
Webhook received → Worker processes → DB updated → ??? → WebSocket gateway (never notified)
```

The `WsGateway::broadcast_event()` method exists but is **never called** from any production code. The worker (`fanout.rs`, `main.rs`) has no reference to `WsGateway` or `broadcast_event`.

---

## 4. Connection Management

### 4.1 Max Connections Per User — ❌ Not Enforced

- No limit on connections per `customer_id`
- A single customer could open thousands of connections
- Each connection consumes: one `WsConnection` struct + one unbounded channel + spawned tasks

### 4.2 Idle Timeout — ⚠️ Partial

- Stale connections cleaned after 5 minutes of no heartbeat
- But "heartbeat" is only updated on `Ping`/`Pong` WebSocket frames — not on regular message activity
- No proactive idle timeout (e.g., close after 30 min of no *client messages*)

### 4.3 Memory Per Connection — ⚠️ Unbounded

Per connection:
- `WsConnection` struct (~200 bytes)
- `UnboundedSender`/`UnboundedReceiver` channel (unbounded)
- `ConnectionRateLimiter` timestamps Vec (grows then shrinks)
- Two spawned tokio tasks (forward + receive)
- WebSocket frame buffers (managed by Axum)

**Risk:** The unbounded channel is the main concern. A fast event producer + slow consumer = unbounded memory.

### 4.4 Cleanup on Logout — ❌ Not Implemented

- No API endpoint to close WebSocket connections on user logout
- Connections persist until client disconnects or 5-min stale cleanup
- No server-side session invalidation for WebSocket connections

---

## 5. Security

### 5.1 Auth on Connection — ✅ JWT Validated

- `authenticate_ws_token()` validates JWT at connection time
- Extracts `customer_id` from `sub` claim
- Standard `jsonwebtoken` validation with expiry check

### 5.2 Auth Per Message — ❌ Not Re-validated

- JWT validated only once at connection establishment
- If a user's token is revoked/expires after connection, the WebSocket stays active
- No per-message token re-validation
- No token refresh mechanism for long-lived connections

### 5.3 Channel Isolation — ⚠️ Partial

- Events filtered by `customer_id` in `broadcast_event()` — but wait, **this check is missing!**
- Looking at `broadcast_event()`:
  ```rust
  pub async fn broadcast_event(&self, event: WsEvent) {
      let connections = self.connections.read().await;
      for conn in connections.values() {
          if event_matches_filters(&event.event_type, &conn.event_filters) {
              // Sends to ALL matching connections, regardless of customer_id!
          }
      }
  }
  ```
- **Critical:** There's no `customer_id` check in `broadcast_event()`. If two customers have overlapping event filters, they could receive each other's events.
- The `WsEvent` struct has `endpoint_id` but no `customer_id` field for filtering.

### 5.4 Message Size Limiting — ⚠️ Configured but Not Enforced

- `WsHandlerConfig.max_message_size` is defined (64KB default)
- But it's **never checked** in `handle_connection()` or `handle_client_message()`
- Axum's WebSocket layer may have its own frame size limits, but the custom limit isn't applied

### 5.5 Subscription Abuse — ⚠️ No Limits

- No limit on number of subscriptions per connection
- No limit on subscription pattern complexity
- Empty filters = receive ALL events (could be a bandwidth attack vector)

---

## 6. Frontend Integration

### 6.1 Deliveries Page — ❌ No Real-Time

The deliveries page (`deliveries/page.tsx`) is **entirely manual refresh**:
- Fetches data via `webhooksApi.list()` on mount and filter/page change
- No SSE, no WebSocket, no polling
- User must refresh to see new deliveries
- **This is the main dashboard view and it's not real-time**

### 6.2 Playground Live Viewer — ⚠️ Polling

The `LiveRequestViewer` component:
- Polls `GET /v1/webhooks?page=1` every 3 seconds
- No authentication header sent (uses `credentials: 'include'` but no Bearer token)
- Shows 5 most recent deliveries
- No true real-time — 3s delay minimum

### 6.3 Notification Center — ⚠️ Polling

- Polls `GET /v1/notifications` every 30 seconds
- Also polls `/v1/notifications/unread-count`
- 30s delay for new notifications — feels sluggish
- No real-time push for critical alerts (e.g., webhook failures)

### 6.4 Error Handling

- `useDeliveryStream`: Sets `connected = false` on error, no retry
- `NotificationCenter`: Silently fails on fetch error — non-critical
- `LiveRequestViewer`: Silently ignores errors
- No global WebSocket/SSE error boundary or connection status indicator

### 6.5 Optimistic UI — ❌ Not Implemented

- No optimistic updates for any real-time feature
- All state updates come from server responses
- Mark-as-read in NotificationCenter does optimistic update (good)

### 6.6 Offline Handling — ❌ None

- No detection of network offline state
- No queue for actions taken while offline
- No reconnection strategy for any real-time channel

---

## 7. Critical Findings Summary

### 🔴 Critical (Must Fix)

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| C1 | **WebSocket gateway not wired into routes** | `api/src/ws/` vs `api/src/routes/mod.rs` | WebSocket feature is dead code — never accessible to clients |
| C2 | **No `customer_id` filtering in `broadcast_event()`** | `ws/mod.rs:153-171` | Cross-customer event leakage if gateway were active |
| C3 | **Worker never publishes to WebSocket gateway** | `worker/src/main.rs`, `fanout.rs` | Even if wired, WS clients would receive nothing |
| C4 | **Unbounded per-connection channels** | `ws/handler.rs:113` | Memory exhaustion under slow-client conditions |

### 🟡 High (Should Fix)

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| H1 | **SSE has no reconnection logic** | `useDeliveryStream.ts` | Connection loss = permanent disconnect until page refresh |
| H2 | **No `max_message_size` enforcement** | `ws/handler.rs` | Config exists but is never checked |
| H3 | **No per-user connection limit** | `ws/mod.rs` | Single user could exhaust server resources |
| H4 | **JWT not re-validated after connection** | `ws/handler.rs` | Revoked tokens remain valid for connection lifetime |
| H5 | **Deliveries page has no real-time updates** | `deliveries/page.tsx` | Primary dashboard view requires manual refresh |

### 🟢 Medium (Nice to Have)

| # | Finding | Location | Impact |
|---|---------|----------|--------|
| M1 | **No event sequence numbers** | `WsEvent` | Cannot detect gaps or implement catch-up |
| M2 | **Notifications poll at 30s interval** | `NotificationCenter.tsx` | Sluggish UX for critical alerts |
| M3 | **No `WsMessage::Error` sent to clients** | `ws/handler.rs` | Invalid messages silently ignored |
| M4 | **SSE polls DB every 2s per client** | `routes/stream.rs` | Doesn't scale past ~50 concurrent SSE clients |
| M5 | **No offline detection** | All frontend | No indication of connection state to users |

---

## 8. Recommendations

### Immediate (P0)

1. **Wire the WebSocket gateway into Axum routes** — Add a `/ws` upgrade endpoint in `routes/mod.rs` that calls `handle_connection()`
2. **Add `customer_id` to `WsEvent` and filter in `broadcast_event()`** — Prevent cross-tenant data leakage
3. **Bridge worker events to WebSocket gateway** — Use Redis pub/sub, NATS, or a shared broadcast channel between API and worker processes
4. **Switch to bounded channels** — Replace `mpsc::unbounded_channel` with `mpsc::channel(N)` and handle `SendError` by disconnecting slow clients

### Short-term (P1)

5. **Add SSE reconnection with exponential backoff** in `useDeliveryStream.ts`
6. **Enforce `max_message_size`** in `handle_connection()` — reject oversized frames
7. **Add per-user connection limit** — e.g., max 5 connections per `customer_id`
8. **Add real-time to deliveries page** — Either use SSE stream or add 5-second polling
9. **Implement `Last-Event-ID`** in SSE for resumable streams

### Long-term (P2)

10. **Replace DB-polling SSE with event-driven push** — Use Redis pub/sub or PostgreSQL LISTEN/NOTIFY
11. **Add connection status indicator** in the dashboard header
12. **Implement event replay** — Store recent events in Redis with sequence numbers for catch-up
13. **Token refresh for long-lived WebSocket connections** — Re-authenticate periodically

---

## 9. What's Working Well

- **SSE stream implementation** is clean and functional — the `async_stream::stream!` macro usage is idiomatic
- **JWT auth** is properly implemented with standard library
- **Glob pattern matching** for subscriptions is well-tested and correct
- **Rate limiter** design is solid (sliding window)
- **Connection cleanup** via `tokio::select!` is correct
- **REST fallback** (`/v1/events`) is a good design decision for compatibility
- **Frontend SSE hook** uses `fetch` + `ReadableStream` to pass auth headers — clever workaround for `EventSource` limitations
- **Test coverage** is good for the WS module (auth, rate limiting, pattern matching, serialization)
