# HookSniff Python SDK

Official Python SDK for the [HookSniff](https://github.com/servetarslan02/HookSniff) webhook delivery API.

## Installation

```bash
pip install hooksniff
```

## Quick Start

```python
from hooksniff import HookSniff

# Initialize client
hs = HookSniff(api_key="hooksniff_xxx")

# List endpoints
endpoints = hs.endpoints.list()
for ep in endpoints["data"]:
    print(ep["url"])

# Auto-paginate through all endpoints
for ep in hs.endpoints.list_all():
    print(ep["url"])

# Create an endpoint
endpoint = hs.endpoints.create({
    "url": "https://example.com/webhook",
    "description": "My endpoint",
})

# Send a webhook
delivery = hs.webhooks.send({
    "endpoint_id": endpoint["id"],
    "event": "order.created",
    "data": {"order_id": "12345", "total": 99.99},
})

# Send batch webhooks
result = hs.webhooks.send_batch({
    "webhooks": [
        {"endpoint_id": "ep_1", "event": "order.created", "data": {"id": "1"}},
        {"endpoint_id": "ep_2", "event": "order.created", "data": {"id": "2"}},
    ],
})

# Get delivery status
delivery = hs.webhooks.get_delivery("dlv_xxx")
print(delivery["status"])
```

## Webhook Verification

Verify incoming webhook signatures (Standard Webhooks HMAC-SHA256):

```python
from hooksniff import Webhook, WebhookVerificationError

wh = Webhook("whsec_base64encoded...")

try:
    payload = wh.verify(raw_body, headers)
    # payload is the parsed JSON dict
    print(payload["event"])
except WebhookVerificationError as e:
    print(f"Invalid webhook: {e}")
```

## Authentication

```python
# Register
hs.auth.register(email="user@example.com", password="secure_password")

# Login
response = hs.auth.login(email="user@example.com", password="secure_password")
# Use the token: response["access_token"]

# Get profile
profile = hs.auth.get_profile()

# Enable 2FA
enable_resp = hs.auth.enable_2fa(password="secure_password")
print(enable_resp["qr_code_url"])  # Scan with authenticator app
hs.auth.confirm_2fa(code="123456")
```

## Teams

```python
# Create team
team = hs.teams.create(name="Engineering")

# Invite member
hs.teams.invite(team["id"], email="colleague@example.com", role="member")

# List teams
teams = hs.teams.list()
```

## Billing

```python
# Get subscription
sub = hs.billing.get_subscription()

# Get usage
usage = hs.billing.get_usage()

# Upgrade plan
checkout = hs.billing.upgrade(plan="pro")
print(checkout["checkout_url"])
```

## Analytics

```python
# Get stats
stats = hs.analytics.get_stats(period="30d")

# Get success rate
rate = hs.analytics.get_success_rate()

# Get latency trends
latency = hs.analytics.get_latency(period="7d")
```

## Search

```python
results = hs.search.search(query="order", type="endpoint")
```

## Error Handling

```python
from hooksniff import (
    HookSniffError,
    ApiException,
    RateLimitError,
    NotFoundException,
    ValidationException,
    UnauthorizedException,
)

try:
    hs.endpoints.get("nonexistent")
except NotFoundException:
    print("Endpoint not found")
except RateLimitError as e:
    print(f"Rate limited, retry after {e.retry_after}s")
except UnauthorizedException:
    print("Invalid API key")
except ApiException as e:
    print(f"API error {e.status_code}: {e.body}")
```

## Debug Mode

```python
hs = HookSniff(api_key="hooksniff_xxx", debug=True)
# Logs request/response to stdout
```

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `api_key` | *required* | Your HookSniff API key |
| `server_url` | Production URL | API base URL |
| `timeout` | `30.0` | Request timeout in seconds |
| `num_retries` | `2` | Retries on 5xx errors |
| `debug` | `False` | Enable debug logging |

## License

MIT
