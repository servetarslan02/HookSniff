---
sidebar_position: 4
---

# Streaming & Rate Limiting

## Real-Time Streaming (SSE)

Stream delivery events in real-time using Server-Sent Events.

### Node.js

```typescript
const stream = hs.stream.subscribe({
  event_types: ['delivery.completed', 'delivery.failed'],
});

stream.on('event', (event) => {
  console.log(`[${event.event}]`, event.data);
});

stream.on('error', (err) => {
  console.error('Stream error:', err);
  // Auto-reconnects with backoff
});
```

### curl

```bash
curl -N https://hooksniff-api-1046140057667.europe-west1.run.app/v1/stream/deliveries \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Accept: text/event-stream"
```

### Event Types

| Event | When |
|-------|------|
| `delivery.completed` | Webhook delivered successfully (2xx) |
| `delivery.failed` | Delivery failed |
| `delivery.retrying` | Being retried |
| `endpoint.disabled` | Auto-disabled after failures |
| `endpoint.enabled` | Re-enabled |

## Rate Limiting

### Set Rate Limit

```bash
curl -X POST /v1/endpoints/EP_ID/rate-limit \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "token_bucket", "rate": 100, "period": 60}'
```

### Rate Limit Headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests per window |
| `X-RateLimit-Remaining` | Remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |
| `Retry-After` | Seconds to wait (on 429 only) |

### API Rate Limits by Plan

| Plan | Requests/min | Webhooks/day |
|------|-------------|-------------|
| Developer (Free) | 100 | 100 |
| Startup ($24/mo) | 500 | 30,000 |
| Pro ($49/mo) | 1,000 | 100,000 |
| Enterprise | Custom | Unlimited |
