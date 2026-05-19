# HookSniff Quick Start Guide

Get started with HookSniff in 5 minutes.

## 1. Get Your API Key

1. Sign up at [hooksniff.com](https://hooksniff.com)
2. Go to **Settings → API Keys**
3. Create a new API key (starts with `hr_live_`)

## 2. Install SDK

Choose your language:

```bash
# Node.js / TypeScript
npm install hooksniff

# Python
pip install hooksniff

# Go
go get github.com/servetarslan02/hooksniff-go

# Rust
cargo add hooksniff

# Ruby
gem install hooksniff

# PHP
composer require hooksniff/hooksniff

# C#
dotnet add package HookSniff
```

## 3. Create an Endpoint

An endpoint is where HookSniff delivers your webhooks.

```python
from hooksniff import HookSniff

client = HookSniff("hr_live_xxx")

endpoint = client.endpoint.create(
    url="https://your-app.com/webhook",
    description="Order notifications",
)
print(f"Endpoint created: {endpoint.id}")
```

## 4. Send a Webhook

```python
message = client.message.create(
    event="order.created",
    data={
        "order_id": "ORD-123",
        "amount": 99.99,
        "currency": "USD",
    },
)
print(f"Message sent: {message.id}")
```

## 5. Verify Incoming Webhooks

When your app receives a webhook from HookSniff, verify its signature:

```python
from hooksniff import Webhook

wh = Webhook("whsec_xxx")  # Get from endpoint settings

try:
    payload = wh.verify(request.body, request.headers)
    # ✅ Valid — process the webhook
    print(f"Event: {payload['event']}")
    print(f"Data: {payload['data']}")
except Exception:
    # ❌ Invalid — reject
    return 403
```

## 6. Check Delivery Status

```python
# Get delivery attempts for a message
attempts = client.message_attempt.list_by_msg(message.id)
for attempt in attempts:
    print(f"Status: {attempt.response_status_code}")
    print(f"Duration: {attempt.duration_ms}ms")
```

## Next Steps

- [API Reference](https://api.hooksniff.com) — Full endpoint documentation
- [SDK Reference](../sdks/README.md) — Language-specific guides
- [Webhook Security](security.md) — Best practices
- [Examples](../examples/) — Code samples

## Common Patterns

### Retry Failed Deliveries

```python
# Resend a failed attempt
client.message_attempt.resend(message_id, attempt_id)
```

### List All Endpoints

```python
endpoints = client.endpoint.list()
for ep in endpoints:
    print(f"{ep.url} — {ep.description}")
```

### Filter by Event Type

```python
messages = client.message.list(event_types=["order.created", "order.updated"])
```

### Pagination

```python
# Auto-pagination (all SDKs support this)
for endpoint in client.endpoint.list_iterator():
    print(endpoint.url)
```
