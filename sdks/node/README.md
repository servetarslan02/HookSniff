# 🪝 HookSniff SDK — Node.js

Official Node.js SDK for [HookSniff](https://hooksniff.vercel.app) — reliable webhook delivery for developers.

## Installation

```bash
npm install hooksniff-sdk
```

**Requires Node.js 18+** (native `fetch` support, zero external dependencies)

---

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

---

## Pagination

List endpoints return pages. Use `listAll()` to iterate through **all** results automatically:

```typescript
// Iterate one by one (memory efficient)
for await (const delivery of hs.webhooks.listAll()) {
  console.log(delivery.id);
}

// Collect all into an array
const allDeliveries = await hs.webhooks.listAllArray();

// Limit results
for await (const ep of hs.endpoints.listAll({ maxItems: 100 })) {
  console.log(ep.url);
}

// Custom page size
for await (const rule of hs.alerts.listAllRules({ limit: 25 })) {
  console.log(rule.name);
}
```

**Available on all list endpoints:**
| Method | Returns |
|--------|---------|
| `hs.webhooks.listAll()` | `AsyncGenerator<DeliveryOutput>` |
| `hs.webhooks.listAllArray()` | `Promise<DeliveryOutput[]>` |
| `hs.endpoints.listAll()` | `AsyncGenerator<EndpointOutput>` |
| `hs.alerts.listAllRules()` | `AsyncGenerator<AlertRule>` |
| `hs.alerts.listAllNotifications()` | `AsyncGenerator<AlertNotification>` |
| `hs.apiKeys.listAll()` | `AsyncGenerator<ApiKeyOutput>` |
| `hs.teams.listAll()` | `AsyncGenerator<TeamMember>` |

---

## Verify Incoming Webhooks

```typescript
import { Webhook } from 'hooksniff-sdk';

const wh = new Webhook('whsec_your_signing_secret');

app.post('/webhook', (req, res) => {
  try {
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id'],
      'webhook-timestamp': req.headers['webhook-timestamp'],
      'webhook-signature': req.headers['webhook-signature'],
    });

    console.log('Event:', payload.event);
    res.status(200).send('OK');
  } catch (err) {
    res.status(400).send('Invalid signature');
  }
});
```

---

## API Reference

### Authentication

```typescript
const auth = await hs.auth.register({ email: 'you@example.com', password: 'secure-password' });
const { token } = await hs.auth.login({ email: 'you@example.com', password: 'secure-password' });
const setup = await hs.auth.enable2fa();
await hs.auth.verifyEmail('verification-token');
await hs.auth.forgotPassword('you@example.com');
const data = await hs.auth.exportData(); // GDPR
await hs.auth.deleteAccount();            // GDPR
```

### Endpoints

```typescript
const endpoints = await hs.endpoints.list();
const ep = await hs.endpoints.create({ url: 'https://app.com/webhook', description: 'My endpoint', rate_limit: 100 });
const endpoint = await hs.endpoints.get('ep_123');
const updated = await hs.endpoints.update('ep_123', { url: 'https://new-url.com' });
await hs.endpoints.delete('ep_123');
const { key } = await hs.endpoints.rotateSecret('ep_123');
```

### Webhooks

```typescript
const delivery = await hs.webhooks.send({
  endpoint_id: 'ep_123',
  event: 'order.created',
  data: { order_id: '12345' },
});

const batch = await hs.webhooks.batch({
  endpoint_id: 'ep_123',
  events: [
    { event: 'order.created', data: { order_id: '1' } },
    { event: 'order.created', data: { order_id: '2' } },
  ],
});

const { data, has_more } = await hs.webhooks.list({ limit: 20 });
const single = await hs.webhooks.get('dlv_456');
await hs.webhooks.replay('dlv_456');
```

### Analytics

```typescript
const trends = await hs.analytics.trends({ since: '2026-01-01', until: '2026-01-31' });
const rate = await hs.analytics.successRate();
const latency = await hs.analytics.latency();
```

### API Keys

```typescript
const keys = await hs.apiKeys.list();
const newKey = await hs.apiKeys.create({ name: 'CI/CD' });
const keyWithExpiry = await hs.apiKeys.create({ name: 'Temp', expires_at: '2026-12-31' });
await hs.apiKeys.delete('key_123');
```

### Alerts

```typescript
const rules = await hs.alerts.listRules();
const notifications = await hs.alerts.listNotifications({ limit: 10 });

// Iterate all notifications
for await (const notif of hs.alerts.listAllNotifications()) {
  console.log(notif.message);
}
```

### Teams

```typescript
const members = await hs.teams.list();
await hs.teams.invite('dev@example.com', 'developer');
await hs.teams.remove('member_123');
```

### Search

```typescript
const results = await hs.search.query('order.created', { limit: 10 });
```

### Billing

```typescript
const plan = await hs.billing.getPlan();
const { url } = await hs.billing.upgrade('pro');
const { url: portalUrl } = await hs.billing.portal();
```

### Health

```typescript
const health = await hs.health.check();
console.log(health.status);           // 'ok'
console.log(health.db.latency_ms);    // 23
console.log(health.queue.pending);    // 0
console.log(health.otel?.enabled);    // true
```

---

## Error Handling

```typescript
import { HookSniff, ApiException } from 'hooksniff-sdk';

try {
  await hs.webhooks.send({ endpoint_id: 'invalid', event: 'test', data: {} });
} catch (err) {
  if (err instanceof ApiException) {
    console.error(`API Error ${err.code} ${err.statusText}:`, err.body);
    console.error('Request ID:', err.headers['x-request-id']);
  }
}
```

---

## Options

```typescript
const hs = new HookSniff({
  apiKey: 'your-key',
  baseUrl: 'https://custom-api.example.com', // default: HookSniff production
  timeout: 10000,                             // default: 30000ms
  numRetries: 3,                              // default: 2
  fetch: customFetch,                         // default: globalThis.fetch
});
```

### Custom Fetch

Inject a custom `fetch` implementation for testing, proxies, or middleware:

```typescript
import { HookSniff } from 'hooksniff-sdk';

// Custom fetch with logging
const loggingFetch: typeof fetch = async (url, init) => {
  console.log(`→ ${init?.method} ${url}`);
  const response = await globalThis.fetch(url, init);
  console.log(`← ${response.status}`);
  return response;
};

const hs = new HookSniff({
  apiKey: 'your-key',
  fetch: loggingFetch,
});
```

### Idempotency Keys

POST requests automatically get a unique idempotency key. Override with your own:

```typescript
await hs.webhooks.send(
  { endpoint_id: 'ep_123', event: 'test', data: {} },
  'my-unique-key-123'  // custom idempotency key
);
```

---

## Webhook Signature Verification

The `Webhook` class supports:
- **HMAC-SHA256** signatures (Standard Webhooks compliant)
- **`whsec_` prefixed secrets** (auto-detected)
- **Both header formats**: `webhook-id`/`svix-id`, `webhook-timestamp`/`svix-timestamp`, `webhook-signature`/`svix-signature`
- **Replay protection** (5-minute timestamp tolerance)
- **Multiple signatures** (comma-separated, for secret rotation)
- **Timing-safe comparison** (prevents timing attacks)

---

## TypeScript Support

Full type definitions included. All models are exported:

```typescript
import type {
  EndpointOutput,
  DeliveryOutput,
  AlertRule,
  TeamMember,
  HealthOutput,
  ApiKeyOutput,
} from 'hooksniff-sdk';
```

---

## License

MIT — see [LICENSE](../../LICENSE) for details.
