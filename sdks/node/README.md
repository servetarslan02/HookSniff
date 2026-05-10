# HookSniff Node.js SDK

[![npm version](https://img.shields.io/npm/v/@hooksniff/sdk.svg)](https://www.npmjs.com/package/@hooksniff/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official TypeScript/Node.js client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

```bash
npm install @hooksniff/sdk
```

Or install from source:

```bash
cd sdks/node
npm install
npm run build
```

## Quick Start

```typescript
import { HookSniff } from '@hooksniff/sdk';

// Initialize client
const client = new HookSniff({ apiKey: 'hr_live_your_api_key_here' });

// Create a webhook endpoint
const endpoint = await client.endpoints.create({
  url: 'https://myapp.com/webhook',
  description: 'Order notifications',
});
console.log(`Endpoint created: ${endpoint.id}`);

// Send a webhook
const delivery = await client.webhooks.send({
  endpointId: endpoint.id,
  event: 'order.created',
  data: { orderId: '12345', amount: 99.99 },
});
console.log(`Delivery queued: ${delivery.id}, status: ${delivery.status}`);

// Check delivery status
const status = await client.webhooks.get(delivery.id);
console.log(`Status: ${status.status}, attempts: ${status.attemptCount}`);

// List deliveries
const deliveries = await client.webhooks.list('failed', 1);
for (const d of deliveries.deliveries) {
  console.log(`  ${d.id}: ${d.status}`);
}

// Replay a failed delivery
const replayed = await client.webhooks.replay(delivery.id);
console.log(`Replay queued: ${replayed.id}`);
```

## Batch Webhooks

Send multiple webhooks in a single request (max 100):

```typescript
const results = await client.webhooks.batch([
  {
    endpointId: 'ep_1',
    event: 'order.created',
    data: { orderId: '12345' },
  },
  {
    endpointId: 'ep_2',
    event: 'payment.completed',
    data: { paymentId: 'pay_67890' },
  },
]);

console.log(`Delivered: ${results.deliveries.length}`);
console.log(`Errors: ${results.errors.length}`);
for (const err of results.errors) {
  console.log(`  Item ${err.index}: ${err.error}`);
}
```

## Retry Policy

Configure custom retry behavior when creating endpoints:

```typescript
const endpoint = await client.endpoints.create({
  url: 'https://myapp.com/webhook',
  description: 'Critical notifications',
  retryPolicy: {
    maxAttempts: 5,
    backoff: 'exponential',
    initialDelaySecs: 10,
    maxDelaySecs: 3600,
  },
});
```

## Delivery Attempts

Inspect individual delivery attempts:

```typescript
const attempts = await client.webhooks.attempts(delivery.id);
for (const attempt of attempts) {
  console.log(
    `  Attempt ${attempt.attemptNumber}: status=${attempt.statusCode}, ` +
    `duration=${attempt.durationMs}ms`
  );
  if (attempt.errorMessage) {
    console.log(`    Error: ${attempt.errorMessage}`);
  }
}
```

## Export Logs

Export webhook logs as JSON or CSV:

```typescript
// JSON export
const logs = await client.webhooks.export({ format: 'json', status: 'failed' });

// CSV export
const csvData = await client.webhooks.export({
  format: 'csv',
  dateFrom: '2024-01-01',
});
fs.writeFileSync('webhooks.csv', csvData as string);
```

## Signature Verification

Verify incoming webhook signatures in your handler:

```typescript
import { verifySignature } from '@hooksniff/sdk';
import express from 'express';

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const payload = req.body.toString();
  const signature = req.headers['x-hooksniff-signature'] as string;
  const secret = 'whsec_your_endpoint_signing_secret';

  if (!verifySignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const data = JSON.parse(payload);
  console.log(`Received event: ${data.event}`);
  res.json({ received: true });
});
```

## Error Handling

```typescript
import {
  HookSniff,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  PayloadTooLargeError,
} from '@hooksniff/sdk';

const client = new HookSniff({ apiKey: 'hr_live_...' });

try {
  const delivery = await client.webhooks.send({
    endpointId: 'nonexistent',
    data: { test: true },
  });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof NotFoundError) {
    console.log('Endpoint not found');
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded - try again later');
  } else if (error instanceof ValidationError) {
    console.log(`Invalid request: ${error.message}`);
  } else if (error instanceof PayloadTooLargeError) {
    console.log('Payload exceeds maximum size');
  }
}
```

## API Reference

### `new HookSniff(config)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | required | Your HookSniff API key |
| `baseUrl` | `string` | `https://hooksniff-api-1046140057667.europe-west1.run.app/v1` | API base URL |
| `timeout` | `number` | `30000` | Request timeout in ms |

### `client.endpoints`

- `.create(req)` → `Promise<Endpoint>`
- `.get(endpointId)` → `Promise<Endpoint>`
- `.list()` → `Promise<Endpoint[]>`
- `.delete(endpointId)` → `Promise<boolean>`

### `client.webhooks`

- `.send(req)` → `Promise<Delivery>`
- `.get(deliveryId)` → `Promise<Delivery>`
- `.list(status?, page?, perPage?)` → `Promise<DeliveryList>`
- `.replay(deliveryId)` → `Promise<Delivery>`
- `.batch(webhooks)` → `Promise<BatchResult>`
- `.attempts(deliveryId)` → `Promise<DeliveryAttempt[]>`
- `.export(options?)` → `Promise<Delivery[] | string>`

### `verifySignature(payload, signature, secret)` → `boolean`

Verify a webhook signature using HMAC-SHA256.

## License

MIT
