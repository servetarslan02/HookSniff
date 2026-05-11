# 🪝 HookSniff SDK — Node.js

Official Node.js SDK for [HookSniff](https://hooksniff.vercel.app) — reliable webhook delivery for developers.

## Installation

```bash
npm install hooksniff-sdk
```

**Requires Node.js 18+** (native `fetch` support, zero external dependencies)

## Quick Start

```typescript
import { HookSniff } from 'hooksniff-sdk';

const hs = new HookSniff({ apiKey: 'your-api-key' });

// List endpoints
const endpoints = await hs.endpoints.list();

// Create an endpoint
const endpoint = await hs.endpoints.create({
  url: 'https://your-app.com/webhook',
  description: 'Order notifications',
});

// Send a webhook
const delivery = await hs.webhooks.send({
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: { order_id: '12345', total: 99.99 },
});

// Get delivery status
const status = await hs.webhooks.get(delivery.id);
```

## Verify Incoming Webhooks

```typescript
import { Webhook } from 'hooksniff-sdk';

// In your webhook handler (Express, Fastify, etc.)
const wh = new Webhook('whsec_your_signing_secret');

app.post('/webhook', (req, res) => {
  try {
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id'],
      'webhook-timestamp': req.headers['webhook-timestamp'],
      'webhook-signature': req.headers['webhook-signature'],
    });

    // payload is verified and parsed
    console.log('Event:', payload.event);
    res.status(200).send('OK');
  } catch (err) {
    res.status(400).send('Invalid signature');
  }
});
```

## API Reference

### Authentication

```typescript
// Register
const auth = await hs.auth.register({
  email: 'you@example.com',
  password: 'secure-password',
});

// Login
const { token } = await hs.auth.login({
  email: 'you@example.com',
  password: 'secure-password',
});

// Enable 2FA
const setup = await hs.auth.enable2fa();
```

### Endpoints

```typescript
// List all endpoints
const endpoints = await hs.endpoints.list();

// Create endpoint
const ep = await hs.endpoints.create({
  url: 'https://app.com/webhook',
  description: 'My webhook endpoint',
  rate_limit: 100,
});

// Get, update, delete
const endpoint = await hs.endpoints.get('ep_123');
const updated = await hs.endpoints.update('ep_123', { url: 'https://new-url.com' });
await hs.endpoints.delete('ep_123');

// Rotate signing secret
const { key } = await hs.endpoints.rotateSecret('ep_123');
```

### Webhooks

```typescript
// Send single webhook
const delivery = await hs.webhooks.send({
  endpoint_id: 'ep_123',
  event: 'order.created',
  data: { order_id: '12345' },
});

// Send batch
const batch = await hs.webhooks.batch({
  endpoint_id: 'ep_123',
  events: [
    { event: 'order.created', data: { order_id: '1' } },
    { event: 'order.created', data: { order_id: '2' } },
  ],
});

// List deliveries
const { data, has_more } = await hs.webhooks.list({ limit: 20 });

// Replay a delivery
await hs.webhooks.replay('del_456');
```

### Analytics

```typescript
const trends = await hs.analytics.trends({ since: '2026-01-01' });
const rate = await hs.analytics.successRate();
const latency = await hs.analytics.latency();
```

### API Keys

```typescript
const keys = await hs.apiKeys.list();
const newKey = await hs.apiKeys.create({ name: 'CI/CD' });
await hs.apiKeys.delete('key_123');
```

### Billing

```typescript
const plan = await hs.billing.getPlan();
const { url } = await hs.billing.portal();
```

### Health

```typescript
const health = await hs.health.check();
console.log(health.status); // 'ok'
console.log(health.db.latency_ms); // 23
```

## Error Handling

```typescript
import { HookSniff, ApiException } from 'hooksniff-sdk';

try {
  await hs.webhooks.send({ endpoint_id: 'invalid', event: 'test', data: {} });
} catch (err) {
  if (err instanceof ApiException) {
    console.error(`API Error ${err.code}:`, err.body);
  }
}
```

## Options

```typescript
const hs = new HookSniff({
  apiKey: 'your-key',
  baseUrl: 'https://custom-api.example.com', // default: HookSniff production
  timeout: 10000,                             // default: 30000ms
  numRetries: 3,                              // default: 2
});
```

## Webhook Signature Verification

The `Webhook` class supports:
- **HMAC-SHA256** signatures (Standard Webhooks compliant)
- **`whsec_` prefixed secrets** (auto-detected)
- **Both header formats**: `webhook-id`/`svix-id`, `webhook-timestamp`/`svix-timestamp`, `webhook-signature`/`svix-signature`
- **Replay protection** (5-minute timestamp tolerance)
- **Multiple signatures** (comma-separated, for secret rotation)
- **Timing-safe comparison** (prevents timing attacks)

## License

MIT — see [LICENSE](../../LICENSE) for details.
