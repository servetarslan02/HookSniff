# HookRelay Python SDK

Official Python client for the [HookRelay](https://hookrelay.dev) webhook delivery service.

## Installation

```bash
pip install hookrelay
```

Or install from source:

```bash
cd sdks/python
pip install -e .
```

## Quick Start

```python
from hookrelay import HookRelayClient

# Initialize client
client = HookRelayClient(api_key="hr_live_your_api_key_here")

# Create a webhook endpoint
endpoint = client.endpoints.create(
    url="https://myapp.com/webhook",
    description="Order notifications",
)
print(f"Endpoint created: {endpoint.id}")

# Send a webhook
delivery = client.webhooks.send(
    endpoint_id=endpoint.id,
    event="order.created",
    data={"order_id": "12345", "amount": 99.99},
)
print(f"Delivery queued: {delivery.id}, status: {delivery.status}")

# Check delivery status
status = client.webhooks.get(delivery.id)
print(f"Status: {status.status}, attempts: {status.attempt_count}")

# List deliveries
deliveries = client.webhooks.list(status="failed", page=1)
for d in deliveries.deliveries:
    print(f"  {d.id}: {d.status}")

# Replay a failed delivery
replayed = client.webhooks.replay(delivery.id)
print(f"Replay queued: {replayed.id}")
```

## Batch Webhooks

Send multiple webhooks in a single request (max 100):

```python
results = client.webhooks.batch([
    {
        "endpoint_id": "ep_1",
        "event": "order.created",
        "data": {"order_id": "12345"},
    },
    {
        "endpoint_id": "ep_2",
        "event": "payment.completed",
        "data": {"payment_id": "pay_67890"},
    },
])

print(f"Delivered: {len(results.deliveries)}")
print(f"Errors: {len(results.errors)}")
for err in results.errors:
    print(f"  Item {err['index']}: {err['error']}")
```

## Retry Policy

Configure custom retry behavior when creating endpoints:

```python
from hookrelay import HookRelayClient
from hookrelay.models import RetryPolicy

client = HookRelayClient(api_key="hr_live_...")

endpoint = client.endpoints.create(
    url="https://myapp.com/webhook",
    description="Critical notifications",
    retry_policy=RetryPolicy(
        max_attempts=5,
        backoff="exponential",
        initial_delay_secs=10,
        max_delay_secs=3600,
    ),
)
```

## Delivery Attempts

Inspect individual delivery attempts:

```python
attempts = client.webhooks.attempts(delivery.id)
for attempt in attempts:
    print(f"  Attempt {attempt.attempt_number}: status={attempt.status_code}, "
          f"duration={attempt.duration_ms}ms")
    if attempt.error_message:
        print(f"    Error: {attempt.error_message}")
```

## Export Logs

Export webhook logs as JSON or CSV:

```python
# JSON export
logs = client.webhooks.export(format="json", status="failed")

# CSV export
csv_data = client.webhooks.export(format="csv", date_from="2024-01-01")
with open("webhooks.csv", "w") as f:
    f.write(csv_data)
```

## Signature Verification

Verify incoming webhook signatures in your handler:

```python
from hookrelay import verify_signature

# In your webhook handler
def handle_webhook(request):
    payload = request.body.decode("utf-8")
    signature = request.headers.get("X-Hookrelay-Signature", "")
    secret = "whsec_your_endpoint_signing_secret"

    if not verify_signature(payload, signature, secret):
        return {"error": "Invalid signature"}, 401

    # Process the webhook
    data = json.loads(payload)
    print(f"Received event: {data['event']}")
    return {"received": True}, 200
```

## Error Handling

```python
from hookrelay import (
    HookRelayClient,
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ValidationError,
    PayloadTooLargeError,
)

client = HookRelayClient(api_key="hr_live_...")

try:
    delivery = client.webhooks.send(
        endpoint_id="nonexistent",
        data={"test": True},
    )
except AuthenticationError:
    print("Invalid API key")
except NotFoundError:
    print("Endpoint not found")
except RateLimitError:
    print("Rate limit exceeded - try again later")
except ValidationError as e:
    print(f"Invalid request: {e.message}")
except PayloadTooLargeError:
    print("Payload exceeds maximum size")
```

## API Reference

### `HookRelayClient(api_key, base_url="https://api.hookrelay.dev/v1", timeout=30)`

Main client class.

### `client.endpoints`

- `.create(url, description=None, retry_policy=None)` → `Endpoint`
- `.get(endpoint_id)` → `Endpoint`
- `.list()` → `List[Endpoint]`
- `.delete(endpoint_id)` → `bool`

### `client.webhooks`

- `.send(endpoint_id, event=None, data=None)` → `Delivery`
- `.get(delivery_id)` → `Delivery`
- `.list(status=None, page=1, per_page=20)` → `DeliveryList`
- `.replay(delivery_id)` → `Delivery`
- `.batch(webhooks)` → `BatchResult`
- `.attempts(delivery_id)` → `List[DeliveryAttempt]`
- `.export(format="json", status=None, date_from=None, date_to=None)` → `Any`

### `verify_signature(payload, signature, secret)` → `bool`

Verify a webhook signature using HMAC-SHA256.

## License

MIT
