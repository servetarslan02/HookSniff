# HookSniff Node.js SDK

[![npm version](https://img.shields.io/npm/v/hooksniff-sdk.svg)](https://www.npmjs.com/package/hooksniff-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official TypeScript/Node.js client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

```bash
npm install hooksniff-sdk
```

## Quick Start

```typescript
import { EndpointsApi, WebhooksApi, HealthApi, ApiKeyAuth } from 'hooksniff-sdk';

// Configure authentication
const apiKey = new ApiKeyAuth('hr_live_your_api_key_here');

// Create an endpoint
const endpointsApi = new EndpointsApi();
endpointsApi.setDefaultAuthentication(apiKey);

const { body: endpoint } = await endpointsApi.endpointsPost({
  url: 'https://myapp.com/webhook',
  description: 'Order notifications',
});
console.log(`Endpoint created: ${endpoint.id}`);

// Send a webhook
const webhooksApi = new WebhooksApi();
webhooksApi.setDefaultAuthentication(apiKey);

const { body: delivery } = await webhooksApi.webhooksPost({
  endpointId: endpoint.id,
  event: 'order.created',
  data: { orderId: '12345', amount: 99.99 },
});
console.log(`Delivery queued: ${delivery.id}, status: ${delivery.status}`);
```

## Available APIs

Each API class maps to a group of endpoints:

| Class | Description |
|-------|-------------|
| `EndpointsApi` | Manage webhook destination endpoints |
| `WebhooksApi` | Send, list, replay, and export webhook deliveries |
| `AuthApi` | Registration, login, password reset, 2FA |
| `APIKeysApi` | Manage API keys |
| `AlertsApi` | Alert rules and notifications |
| `AnalyticsApi` | Delivery trends, success rates, latency metrics |
| `BillingApi` | Subscription, usage, invoices |
| `TeamsApi` | Team management and invitations |
| `NotificationsApi` | In-app notification management |
| `SchemasApi` | Event schema management |
| `SearchApi` | Search webhook deliveries |
| `HealthApi` | System status and endpoint health |
| `AdminApi` | Admin operations |
| `AuditLogApi` | Audit log access |
| `InboundApi` | Receive webhooks from external providers |
| `TemplatesApi` | Webhook templates |
| `RoutingApi` | Delivery routing configuration |
| `RateLimitsApi` | Rate limit management |
| `CustomDomainsApi` | Custom domain management |
| `CustomerPortalApi` | Customer portal operations |
| `DeliveryDetailsApi` | Detailed delivery information |
| `DevicesApi` | Push notification device tokens |
| `EmbedApi` | Embed widget configuration |
| `EventsApi` | Event management |
| `OAuthApi` | OAuth configuration |
| `OutboundIPsApi` | Outbound IP addresses |
| `PlaygroundApi` | API playground |
| `SimulatorApi` | Webhook simulator |
| `SSOApi` | SSO configuration |
| `StatsApi` | Account usage statistics |
| `StreamApi` | Real-time event streaming |
| `TransformsApi` | Transform rules |

## Usage Examples

### List Endpoints

```typescript
import { EndpointsApi, ApiKeyAuth } from 'hooksniff-sdk';

const endpointsApi = new EndpointsApi();
endpointsApi.setDefaultAuthentication(new ApiKeyAuth('hr_live_...'));

const { body: endpoints } = await endpointsApi.endpointsGet();
for (const ep of endpoints) {
  console.log(`  ${ep.id}: ${ep.url} (${ep.status})`);
}
```

### Send a Webhook

```typescript
import { WebhooksApi, ApiKeyAuth } from 'hooksniff-sdk';

const webhooksApi = new WebhooksApi();
webhooksApi.setDefaultAuthentication(new ApiKeyAuth('hr_live_...'));

const { body: delivery } = await webhooksApi.webhooksPost({
  endpointId: 'ep_abc123',
  event: 'order.created',
  data: { orderId: '12345', amount: 99.99 },
});
```

### Batch Webhooks

```typescript
const { body: result } = await webhooksApi.webhooksBatchPost({
  webhooks: [
    { endpointId: 'ep_1', event: 'order.created', data: { orderId: '12345' } },
    { endpointId: 'ep_2', event: 'payment.completed', data: { paymentId: 'pay_67890' } },
  ],
});
console.log(`Delivered: ${result.deliveries.length}, Errors: ${result.errors?.length}`);
```

### List Deliveries

```typescript
const { body: deliveries } = await webhooksApi.webhooksGet(
  1,       // page
  20,      // perPage
  'failed' // status filter
);
for (const d of deliveries.deliveries) {
  console.log(`  ${d.id}: ${d.status}`);
}
```

### Get Delivery Details

```typescript
const { body: delivery } = await webhooksApi.webhooksIdGet('dlv_abc123');
console.log(`Status: ${delivery.status}, Attempts: ${delivery.attemptCount}`);
```

### Replay a Delivery

```typescript
const { body: replayed } = await webhooksApi.webhooksIdReplayPost('dlv_abc123');
console.log(`Replay queued: ${replayed.id}`);
```

### Get Delivery Attempts

```typescript
const { body: attempts } = await webhooksApi.webhooksIdAttemptsGet('dlv_abc123');
for (const attempt of attempts) {
  console.log(`  Attempt ${attempt.attemptNumber}: ${attempt.statusCode} (${attempt.durationMs}ms)`);
}
```

### Export Logs

```typescript
const { body: csvData } = await webhooksApi.webhooksExportGet('7d');
// Returns CSV string
```

### Check System Health

```typescript
import { HealthApi } from 'hooksniff-sdk';

const healthApi = new HealthApi();
const { body: status } = await healthApi.statusGet();
console.log(`Overall: ${status.overallStatus}`);
for (const c of status.components) {
  console.log(`  ${c.name}: ${c.status}`);
}
```

## Configuration

Each API class accepts an optional `basePath` parameter:

```typescript
const api = new EndpointsApi('https://custom-api.example.com/v1');
```

Default base URL: `https://hooksniff-api-1046140057667.europe-west1.run.app/v1`

## Authentication

Use `ApiKeyAuth` to set your API key:

```typescript
import { ApiKeyAuth } from 'hooksniff-sdk';

const auth = new ApiKeyAuth('hr_live_your_api_key_here');

const api = new EndpointsApi();
api.setDefaultAuthentication(auth);
```

## Error Handling

The SDK throws `HttpError` for non-2xx responses:

```typescript
import { HttpError } from 'hooksniff-sdk';

try {
  const { body } = await endpointsApi.endpointsPost({ url: 'invalid' });
} catch (error) {
  if (error instanceof HttpError) {
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
  }
}
```

## TypeScript Support

Full type definitions are included. All request/response types are exported:

```typescript
import {
  Endpoint,
  CreateEndpointRequest,
  Delivery,
  DeliveryListResponse,
  DeliveryAttempt,
  BatchWebhookRequest,
  BatchResponse,
  AlertRule,
  SubscriptionResponse,
  // ... and 90+ more model types
} from 'hooksniff-sdk';
```

## License

MIT
