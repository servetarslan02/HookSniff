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
import os

hs = HookSniff(api_key=os.environ["HOOKSNIFF_API_KEY"])
```

## Create an Endpoint

```python
endpoint = hs.endpoint.create(
    url="https://myapp.com/webhook",
    description="Order notifications",
    event_types=["order.created", "order.updated"],
)

print(f"Endpoint ID: {endpoint.id}")
print(f"Signing secret: {endpoint.secret}")  # → whsec_...
```

## Send a Webhook

```python
delivery = hs.message.create(
    endpoint_id=endpoint.id,
    event="order.created",
    data={"order_id": "ORD-12345", "amount": 99.99, "currency": "USD"},
)

print(f"Delivery ID: {delivery.id}")
print(f"Status: {delivery.status}")
```

## Verify Incoming Webhooks

```python
from hooksniff import Webhook

wh = Webhook("whsec_your_signing_secret")

# Flask handler
@app.route("/webhook", methods=["POST"])
def handle_webhook():
    try:
        payload = wh.verify(
            request.data,
            {
                "webhook-id": request.headers["webhook-id"],
                "webhook-timestamp": request.headers["webhook-timestamp"],
                "webhook-signature": request.headers["webhook-signature"],
            },
        )
        print(f"Event: {payload['event']}")
        return "", 200
    except Exception:
        return "Invalid signature", 401
```

## List Deliveries

```python
# Single page
deliveries = hs.message_attempt.list_by_endpoint(
    endpoint_id=endpoint.id,
    limit=20,
)
for attempt in deliveries.data:
    print(f"{attempt.id}: {attempt.response_status_code}")

# Auto-paginate
for attempt in hs.message_attempt.list_by_endpoint_iterator(endpoint_id=endpoint.id):
    print(attempt.id, attempt.response_status_code)
```

## Other Resources

```python
# Authentication
hs.authentication.register(email="user@example.com", password="pass")
hs.authentication.login(email="user@example.com", password="pass")

# API Keys
keys = hs.api_key.list()
new_key = hs.api_key.create(name="Production")

# Analytics
stats = hs.analytics.delivery_trend(period="7d")

# Billing
hs.billing.upgrade(plan="pro")

# Search
results = hs.search.query(query="order.created")
```

## Error Handling

```python
from hooksniff.exceptions import HttpError, ValidationError

try:
    hs.endpoint.get("nonexistent")
except HttpError as e:
    print(f"HTTP {e.status_code}: {e.message}")
except ValidationError as e:
    print(f"Validation failed: {e.errors}")
```
