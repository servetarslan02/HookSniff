<h1 align="center">
  <img width="120" src="https://avatars.githubusercontent.com/u/80175132?s=200&v=4" />
  <br>HookSniff Node.js SDK
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/hooksniff"><img src="https://img.shields.io/npm/v/hooksniff.svg" alt="NPM"></a>
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

TypeScript/Node.js SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
npm install hooksniff
```

## Quick Start

```typescript
import { HookSniff } from 'hooksniff';

const client = new HookSniff({ apiKey: 'hs_xxx' });

// List endpoints
const endpoints = await client.endpoint.list();
console.log(endpoints);

// Create an endpoint
const endpoint = await client.endpoint.create({
  url: 'https://example.com/webhook',
  description: 'My endpoint',
});

// Send a webhook
const message = await client.message.create({
  event: 'order.created',
  data: { orderId: '123', amount: 99.99 },
});

// Get delivery attempts
const attempts = await client.messageAttempt.listByMsg(message.id);
```

## Webhook Verification

```typescript
import { Webhook } from 'hooksniff';

const wh = new Webhook('whsec_xxx');

try {
  const payload = wh.verify(rawBody, {
    'hooksniff-id': headers['hooksniff-id'],
    'hooksniff-signature': headers['hooksniff-signature'],
    'hooksniff-timestamp': headers['hooksniff-timestamp'],
  });
  // Payload is valid
  console.log(payload);
} catch (err) {
  // Invalid signature
  console.error('Webhook verification failed:', err);
}
```

## Error Handling

```typescript
import { HookSniff, HookSniffError } from 'hooksniff';

try {
  await client.endpoint.get('invalid_id');
} catch (err) {
  if (err instanceof HookSniffError) {
    console.error(err.code);    // 'not_found'
    console.error(err.message); // 'Endpoint not found'
  }
}
```

## Configuration

```typescript
const client = new HookSniff({
  apiKey: 'hs_xxx',
  baseUrl: 'https://api.hooksniff.com/v1', // optional
  timeout: 30000,                            // ms
  retries: 3,                                // auto-retry on 429/5xx
});
```

## Resources

| Resource | Methods |
|----------|---------|
| `endpoint` | `list`, `create`, `get`, `update`, `delete` |
| `message` | `create`, `list`, `get` |
| `messageAttempt` | `list`, `listByMsg`, `get`, `resend` |
| `authentication` | `dashboardAccess` |
| `eventType` | `list` |
| `statistics` | `aggregate` |

## Links

- [Documentation](https://docs.hooksniff.com)
- [API Reference](https://api.hooksniff.com)
- [GitHub](https://github.com/servetarslan02/HookSniff)
