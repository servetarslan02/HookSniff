# 🪝 HookSniff SDK — Node.js

Official Node.js/TypeScript SDK for [HookSniff](https://hooksniff.vercel.app) — reliable webhook delivery for developers.

[![npm version](https://img.shields.io/npm/v/hooksniff-sdk.svg)](https://www.npmjs.com/package/hooksniff-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Installation

```bash
npm install hooksniff-sdk
# or
yarn add hooksniff-sdk
```

## Quick Start

```typescript
import { HookSniff } from 'hooksniff-sdk';

const hs = new HookSniff('your-api-key');

// List endpoints
const { data } = await hs.endpoints.list();
console.log(data);

// Send a webhook
const delivery = await hs.webhooks.send({
  endpoint_id: 'ep_123',
  event: 'order.created',
  data: { order_id: '12345' },
});
console.log(delivery.id);
```

## Features

- ✅ **Type-safe** — Full TypeScript support
- ✅ **Auto-retry** — Exponential backoff with jitter on 5xx errors
- ✅ **Auto-idempotency** — POST requests get unique idempotency keys
- ✅ **Auto-pagination** — `for await` iteration over list endpoints
- ✅ **Webhook verification** — HMAC-SHA256, Standard Webhooks compatible
- ✅ **Zero dependencies** — Uses native `fetch` (Node 18+)
- ✅ **Custom fetch** — Bring your own fetch implementation

## Usage

### Authentication

```typescript
import { HookSniff } from 'hooksniff-sdk';

const hs = new HookSniff('hooksniff_xxx', {
  serverUrl: 'https://hooksniff-api-xxx.run.app', // optional
  requestTimeout: 30000, // 30s
  numRetries: 3,
});
```

### Endpoints

```typescript
// List endpoints
const { data: endpoints } = await hs.endpoints.list();

// Auto-paginate through ALL endpoints
for await (const ep of hs.endpoints.listAll()) {
  console.log(ep.url);
}

// Create endpoint
const ep = await hs.endpoints.create({
  url: 'https://example.com/webhook',
  description: 'Order notifications',
  event_filter: ['order.*'],
});

// Update endpoint
await hs.endpoints.update(ep.id, { is_active: false });

// Rotate secret
const { secret } = await hs.endpoints.rotateSecret(ep.id);

// Check health
const health = await hs.endpoints.health(ep.id);

// Delete endpoint
await hs.endpoints.delete(ep.id);
```

### Webhooks

```typescript
// Send a webhook
const delivery = await hs.webhooks.send({
  endpoint_id: 'ep_123',
  event: 'order.created',
  data: { order_id: '12345', total: 99.99 },
});

// Batch send
const result = await hs.webhooks.sendBatch({
  webhooks: [
    { endpoint_id: 'ep_123', event: 'order.created', data: { id: '1' } },
    { endpoint_id: 'ep_123', event: 'order.created', data: { id: '2' } },
  ],
});
console.log(`Sent: ${result.success_count}, Failed: ${result.failure_count}`);

// Get delivery details
const deliveryDetails = await hs.webhooks.getDelivery('dlv_xxx');

// List deliveries with auto-pagination
for await (const dlv of hs.webhooks.listAllDeliveries({ status: 'failed' })) {
  console.log(`${dlv.id}: ${dlv.status}`);
}

// Replay a delivery
await hs.webhooks.replay('dlv_xxx');

// Get delivery attempts
const attempts = await hs.webhooks.getAttempts('dlv_xxx');
```

### Verify Incoming Webhooks

```typescript
import { Webhook } from 'hooksniff-sdk';

const wh = new Webhook('whsec_base64...');

// In your webhook handler (Express example)
app.post('/webhook', (req, res) => {
  try {
    const payload = wh.verify(req.body, req.headers);
    console.log('Verified:', payload);
    res.status(200).send('OK');
  } catch (err) {
    res.status(400).send('Invalid signature');
  }
});
```

### Auth

```typescript
// Register
const { access_token } = await hs.auth.register({
  email: 'user@example.com',
  password: 'secure_password',
});

// Login
const auth = await hs.auth.login({
  email: 'user@example.com',
  password: 'secure_password',
});

// Get current user
const me = await hs.auth.me();

// 2FA
const { qr_code_url, backup_codes } = await hs.auth.enable2fa({ password: 'xxx' });
```

### Teams

```typescript
const teams = await hs.teams.list();
const team = await hs.teams.create({ name: 'Backend Team' });
await hs.teams.invite(team.id, { email: 'dev@example.com', role: 'member' });
```

### Billing

```typescript
const subscription = await hs.billing.subscription();
const usage = await hs.billing.usage();
const invoices = await hs.billing.invoices();
const { checkout_url } = await hs.billing.upgrade({ plan: 'pro' });
```

### Analytics

```typescript
const stats = await hs.analytics.stats({ range: '7d' });
const trends = await hs.analytics.deliveryTrends({ range: '30d' });
const successRate = await hs.analytics.successRate();
const latency = await hs.analytics.latency({ range: '24h' });
```

### Search

```typescript
const results = await hs.search.query({ q: 'order', type: 'endpoint' });
```

### Admin (requires admin API key)

```typescript
const status = await hs.admin.systemStatus();
const users = await hs.admin.listUsers({ plan: 'pro' });
const revenue = await hs.admin.revenue({ range: '30d' });
```

## Error Handling

```typescript
import { ApiException } from 'hooksniff-sdk';

try {
  await hs.endpoints.get('nonexistent');
} catch (err) {
  if (err instanceof ApiException) {
    console.log(err.code);     // 404
    console.log(err.body);     // { code: "not_found", detail: "..." }
    console.log(err.headers);  // response headers
  }
}
```

## Configuration Options

```typescript
const hs = new HookSniff('hooksniff_xxx', {
  // Custom API URL
  serverUrl: 'https://my-self-hosted.run.app',

  // Request timeout (ms)
  requestTimeout: 30000,

  // Retry on 5xx (default: 2)
  numRetries: 3,

  // Or custom retry schedule (ms per retry)
  retryScheduleInMs: [100, 500, 1000],

  // Custom fetch (for testing or proxies)
  fetch: myCustomFetch,
});
```

## Requirements

- Node.js 18+ (native `fetch` support)

## License

MIT — see [LICENSE](../../LICENSE)

Based on [Svix SDK](https://github.com/svix/svix-webhooks) architecture (MIT License).
