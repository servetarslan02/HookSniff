---
sidebar_position: 2
---

# Python Quick Start

## Installation

```bash
pip install hooksniff
```

## Setup

```python
from hooksniff import HookSniff

# Initialize client
hs = HookSniff(api_key="sk_live_your_api_key")

# Or with options
hs = HookSniff(
    api_key="sk_live_your_api_key",
    base_url="https://hooksniff-api-1046140057667.europe-west1.run.app",
    timeout=30000,
    num_retries=2,
)
```

## Endpoints

```python
# List all endpoints
endpoints = hs.endpoints.list()

# Create an endpoint
endpoint = hs.endpoints.create(
    url="https://example.com/webhook",
    description="My webhook endpoint",
    rate_limit=100,
)

# Get a specific endpoint
details = hs.endpoints.get(endpoint.id)

# Update an endpoint
updated = hs.endpoints.update(endpoint.id, url="https://new-url.com/webhook")

# Delete an endpoint
hs.endpoints.delete(endpoint.id)

# Rotate signing secret
key = hs.endpoints.rotate_secret(endpoint.id)
```

## Webhooks

```python
# Send a webhook
delivery = hs.webhooks.send(
    endpoint_id=endpoint.id,
    event_type="order.created",
    data={"order_id": "12345", "amount": 99.99},
)

# List deliveries
deliveries = hs.webhooks.list(status="delivered", page=1)

# Replay a delivery
hs.webhooks.replay(delivery.id)

# Batch send
batch = hs.webhooks.batch(
    endpoint_id=endpoint.id,
    events=[
        {"event_type": "order.created", "data": {"order_id": "1"}},
        {"event_type": "order.created", "data": {"order_id": "2"}},
    ],
)
```

## Webhook Verification

```python
from hooksniff import Webhook

webhook = Webhook(signing_secret="whsec_your_signing_secret")

# In your endpoint handler
def handle_webhook(request):
    try:
        payload = webhook.verify(
            request.body,
            headers={
                "webhook-id": request.headers["webhook-id"],
                "webhook-timestamp": request.headers["webhook-timestamp"],
                "webhook-signature": request.headers["webhook-signature"],
            },
        )
        # Payload is verified — process it
        print("Received event:", payload)
        return {"status": "ok"}
    except Exception:
        return {"status": "unauthorized"}, 401
```

## Other Resources

```python
# Auth
hs.auth.register(email="user@example.com", password="pass")
hs.auth.login(email="user@example.com", password="pass")

# API Keys
keys = hs.api_keys.list()
new_key = hs.api_keys.create(name="Production")

# Analytics
stats = hs.analytics.stats()
trends = hs.analytics.trends(period="7d")

# Billing
plans = hs.billing.plans()
hs.billing.upgrade(plan="pro")

# Teams
members = hs.teams.members()
hs.teams.invite(email="colleague@example.com", role="member")

# Alerts
rules = hs.alerts.list()
hs.alerts.create(
    name="High failure rate",
    condition="failure_rate > 10%",
    endpoint_id=endpoint.id,
)

# Search
results = hs.search.query(query="order.created", filters={"status": "failed"})

# Health
health = hs.health.check()
```

## Error Handling

```python
from hooksniff import HookSniff, ApiException

try:
    hs.endpoints.get("nonexistent")
except ApiException as e:
    print(f"API Error {e.status_code}: {e.message}")
except Exception as e:
    print(f"Network error: {e}")
```
