# HookSniff Python SDK

[![PyPI version](https://img.shields.io/pypi/v/hooksniff.svg)](https://pypi.org/project/hooksniff/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official Python client for the [HookSniff](https://hooksniff.vercel.app) webhook delivery service.

## Installation

```bash
pip install hooksniff
```

## Quick Start

```python
from hooksniff import EndpointsApi, WebhooksApi, HealthApi
from hooksniff.api_client import ApiClient
from hooksniff.configuration import Configuration

# Configure client
config = Configuration()
config.api_key['ApiKeyAuth'] = 'hr_live_your_api_key_here'
client = ApiClient(config)

# Create an endpoint
endpoints_api = EndpointsApi(client)
endpoint = endpoints_api.endpoints_post(
    url='https://myapp.com/webhook',
    description='Order notifications',
)
print(f"Endpoint created: {endpoint.id}")

# Send a webhook
webhooks_api = WebhooksApi(client)
delivery = webhooks_api.webhooks_post(
    endpoint_id=endpoint.id,
    event='order.created',
    data={'order_id': '12345', 'amount': 99.99},
)
print(f"Delivery queued: {delivery.id}, status: {delivery.status}")
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

```python
from hooksniff import EndpointsApi
from hooksniff.api_client import ApiClient
from hooksniff.configuration import Configuration

config = Configuration()
config.api_key['ApiKeyAuth'] = 'hr_live_...'
client = ApiClient(config)

endpoints_api = EndpointsApi(client)
endpoints = endpoints_api.endpoints_get()
for ep in endpoints:
    print(f"  {ep.id}: {ep.url} ({ep.status})")
```

### Send a Webhook

```python
from hooksniff import WebhooksApi

webhooks_api = WebhooksApi(client)
delivery = webhooks_api.webhooks_post(
    endpoint_id='ep_abc123',
    event='order.created',
    data={'order_id': '12345', 'amount': 99.99},
)
```

### Batch Webhooks

```python
result = webhooks_api.webhooks_batch_post(
    webhooks=[
        {'endpoint_id': 'ep_1', 'event': 'order.created', 'data': {'order_id': '12345'}},
        {'endpoint_id': 'ep_2', 'event': 'payment.completed', 'data': {'payment_id': 'pay_67890'}},
    ],
)
print(f"Delivered: {len(result.deliveries)}, Errors: {len(result.errors or [])}")
```

### List Deliveries

```python
deliveries = webhooks_api.webhooks_get(
    page=1,
    per_page=20,
    status='failed',
)
for d in deliveries.deliveries:
    print(f"  {d.id}: {d.status}")
```

### Get Delivery Details

```python
delivery = webhooks_api.webhooks_id_get('dlv_abc123')
print(f"Status: {delivery.status}, Attempts: {delivery.attempt_count}")
```

### Replay a Delivery

```python
replayed = webhooks_api.webhooks_id_replay_post('dlv_abc123')
print(f"Replay queued: {replayed.id}")
```

### Get Delivery Attempts

```python
attempts = webhooks_api.webhooks_id_attempts_get('dlv_abc123')
for attempt in attempts:
    print(f"  Attempt {attempt.attempt_number}: {attempt.status_code} ({attempt.duration_ms}ms)")
```

### Export Logs

```python
csv_data = webhooks_api.webhooks_export_get(range='7d')
# Returns CSV string
```

### Check System Health

```python
from hooksniff import HealthApi

health_api = HealthApi(client)
status = health_api.status_get()
print(f"Overall: {status.overall_status}")
for c in status.components:
    print(f"  {c.name}: {c.status}")
```

## Configuration

The default base URL is automatically set to:
`https://hooksniff-api-1046140057667.europe-west1.run.app/v1`

To use a custom API endpoint:

```python
config = Configuration()
config.host = 'https://custom-api.example.com/v1'
config.api_key['ApiKeyAuth'] = 'hr_live_...'
client = ApiClient(config)
```

## Authentication

Use API key authentication:

```python
config = Configuration()
config.api_key['ApiKeyAuth'] = 'hr_live_your_api_key_here'
client = ApiClient(config)
```

## Error Handling

The SDK throws `ApiException` for non-2xx responses:

```python
from hooksniff import ApiException

try:
    endpoints_api.endpoints_post(url='invalid')
except ApiException as e:
    print(f"HTTP {e.status}: {e.reason}")
    print(f"Body: {e.body}")
```

## Type Hints

Full type hints are included. All request/response types are exported:

```python
from hooksniff import (
    Endpoint,
    CreateEndpointRequest,
    Delivery,
    DeliveryListResponse,
    DeliveryAttempt,
    BatchWebhookRequest,
    BatchResponse,
    AlertRule,
    SubscriptionResponse,
    # ... and 90+ more model types
)
```

## License

MIT
