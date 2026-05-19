---
sidebar_position: 1
---

# Node.js Quick Start

## Installation

```bash
npm install hooksniff
```

## Setup

```typescript
import { HookSniff } from 'hooksniff';

// Initialize client
const hs = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY! });

// With custom options
const hs = new HookSniff({
  apiKey: process.env.HOOKSNIFF_API_KEY!,
  baseUrl: 'https://hooksniff-api-1046140057667.europe-west1.run.app',
  timeout: 30000,
});
```

## Create an Endpoint

```typescript
const endpoint = await hs.endpoint.create({
  url: 'https://myapp.com/webhook',
  description: 'Order notifications',
  event_types: ['order.created', 'order.updated'],
});

console.log('Endpoint ID:', endpoint.id);
console.log('Signing secret:', endpoint.secret); // → whsec_...
```

## Send a Webhook

```typescript
const delivery = await hs.message.create({
  endpoint_id: endpoint.id,
  event: 'order.created',
  data: {
    order_id: 'ORD-12345',
    amount: 99.99,
    currency: 'USD',
  },
});

console.log('Delivery ID:', delivery.id);
console.log('Status:', delivery.status);
```

## Verify Incoming Webhooks

```typescript
import { Webhook } from 'hooksniff';

const wh = new Webhook('whsec_your_signing_secret');

// Express handler
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id']!,
      'webhook-timestamp': req.headers['webhook-timestamp']!,
      'webhook-signature': req.headers['webhook-signature']!,
    });

    console.log('Event:', payload.event);
    console.log('Data:', payload.data);
    res.status(200).send('OK');
  } catch (err) {
    res.status(401).send('Invalid signature');
  }
});
```

## List Deliveries

```typescript
// Single page
const deliveries = await hs.message_attempt.list_by_endpoint({
  endpoint_id: endpoint.id,
  limit: 20,
});

for (const attempt of deliveries.data) {
  console.log(`${attempt.id}: ${attempt.response_status_code}`);
}

// Auto-paginate all
for await (const attempt of hs.message_attempt.listByEndpointIterator({
  endpoint_id: endpoint.id,
})) {
  console.log(attempt.id, attempt.response_status_code);
}
```

## Other Resources

```typescript
// Authentication
await hs.authentication.register({ email: 'user@example.com', password: 'pass' });
const login = await hs.authentication.login({ email: 'user@example.com', password: 'pass' });

// API Keys
const keys = await hs.apiKey.list();
const newKey = await hs.apiKey.create({ name: 'Production' });

// Analytics
const stats = await hs.analytics.delivery_trend({ period: '7d' });
const successRate = await hs.analytics.success_rate();

// Billing
const plans = await hs.billing.plans();
await hs.billing.upgrade({ plan: 'pro' });

// Teams
const members = await hs.team.list();
await hs.team.invite({ email: 'colleague@example.com', role: 'member' });

// Alerts
const rules = await hs.alert.list();
await hs.alert.create({
  name: 'High failure rate',
  condition: 'failure_rate > 10%',
  endpoint_id: endpoint.id,
});

// Search
const results = await hs.search.query({
  query: 'order.created',
  filters: { status: 'failed' },
});

// Streaming
const stream = hs.stream.subscribe({
  event_types: ['delivery.completed', 'delivery.failed'],
});
stream.on('event', (event) => {
  console.log(`[${event.event}]`, event.data);
});

// Health
const health = await hs.health.check();
```

## Error Handling

```typescript
import { HookSniff, HttpError, ValidationError } from 'hooksniff';

try {
  await hs.endpoint.get('nonexistent');
} catch (err) {
  if (err instanceof HttpError) {
    console.error(`HTTP ${err.statusCode}: ${err.message}`);
    if (err.statusCode === 429) {
      const retryAfter = err.headers['retry-after'];
      console.log(`Retry after ${retryAfter} seconds`);
    }
  } else if (err instanceof ValidationError) {
    console.error('Validation failed:', err.errors);
  } else {
    throw err;
  }
}
```
