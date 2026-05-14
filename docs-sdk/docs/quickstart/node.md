---
sidebar_position: 1
---

# Node.js Quick Start

## Installation

```bash
npm install hooksniff-sdk
```

## Setup

```javascript
const { HookSniff, Webhook } = require('hooksniff-sdk');

// Initialize client
const client = new HookSniff('sk_live_your_api_key');

// Or with options
const client = new HookSniff('sk_live_your_api_key', {
  baseUrl: 'https://hooksniff-api-1046140057667.europe-west1.run.app',
  timeout: 30000,
});
```

## Endpoints

```javascript
// List all endpoints
const endpoints = await client.endpoints.list();

// Create an endpoint
const endpoint = await client.endpoints.create({
  url: 'https://example.com/webhook',
  description: 'My webhook endpoint',
  rate_limit: 100,
});

// Get a specific endpoint
const details = await client.endpoints.get(endpoint.id);

// Update an endpoint
const updated = await client.endpoints.update(endpoint.id, {
  url: 'https://new-url.com/webhook',
});

// Delete an endpoint
await client.endpoints.delete(endpoint.id);

// Rotate signing secret
const { key } = await client.endpoints.rotateSecret(endpoint.id);
```

## Webhooks

```javascript
// Send a webhook
const delivery = await client.webhooks.send({
  endpoint_id: endpoint.id,
  event_type: 'order.created',
  data: { order_id: '12345', amount: 99.99 },
});

// List deliveries
const deliveries = await client.webhooks.list({
  status: 'delivered',
  page: 1,
});

// Replay a delivery
await client.webhooks.replay(delivery.id);

// Batch send
const batch = await client.webhooks.batch({
  endpoint_id: endpoint.id,
  events: [
    { event_type: 'order.created', data: { order_id: '1' } },
    { event_type: 'order.created', data: { order_id: '2' } },
  ],
});
```

## Webhook Verification

Verify incoming webhook signatures in your endpoint handler:

```javascript
const { Webhook } = require('hooksniff-sdk');

const webhook = new Webhook('whsec_your_signing_secret');

app.post('/webhook', (req, res) => {
  try {
    const payload = webhook.verify(req.body, {
      'webhook-id': req.headers['webhook-id'],
      'webhook-timestamp': req.headers['webhook-timestamp'],
      'webhook-signature': req.headers['webhook-signature'],
    });

    // Payload is verified — process it
    console.log('Received event:', payload);
    res.status(200).send('OK');
  } catch (err) {
    // Invalid signature
    res.status(401).send('Invalid signature');
  }
});
```

## Other Resources

```javascript
// Auth
await client.auth.register({ email: 'user@example.com', password: 'pass' });
await client.auth.login({ email: 'user@example.com', password: 'pass' });

// API Keys
const keys = await client.apiKeys.list();
const newKey = await client.apiKeys.create({ name: 'Production' });

// Analytics
const stats = await client.analytics.stats();
const trends = await client.analytics.trends({ period: '7d' });

// Billing
const plans = await client.billing.plans();
await client.billing.upgrade({ plan: 'pro' });

// Teams
const members = await client.teams.members();
await client.teams.invite({ email: 'colleague@example.com', role: 'member' });

// Alerts
const rules = await client.alerts.list();
await client.alerts.create({
  name: 'High failure rate',
  condition: 'failure_rate > 10%',
  endpoint_id: endpoint.id,
});

// Search
const results = await client.search.query({
  query: 'order.created',
  filters: { status: 'failed' },
});

// Health
const health = await client.health.check();
```

## Error Handling

```javascript
try {
  await client.endpoints.get('nonexistent');
} catch (err) {
  if (err.name === 'ApiException') {
    console.error(`API Error ${err.code}: ${err.body}`);
  } else {
    console.error('Network error:', err.message);
  }
}
```
