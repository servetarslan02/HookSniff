# HookSniff Python SDK

Svix-style architecture adapted for HookSniff webhook delivery platform.

## Installation

```bash
pip install hooksniff
```

## Quick Start

```python
from hooksniff import HookSniff

hs = HookSniff("hooksniff_xxx")

# List endpoints
endpoints = hs.endpoint.list()

# Create endpoint
from hooksniff.models import EndpointIn
ep = hs.endpoint.create(EndpointIn(url="https://example.com/webhook"))

# Send a webhook
from hooksniff.models import MessageIn
msg = hs.message.create(MessageIn(
    event="order.created",
    data={"order_id": "12345"},
))

# Verify incoming webhook
from hooksniff import Webhook
wh = Webhook("whsec_...")
payload = wh.verify(raw_body, headers)
```

## Async Usage

```python
from hooksniff import HookSniffAsync

hs = HookSniffAsync("hooksniff_xxx")
endpoints = await hs.endpoint.list()
```

## Resources

| Resource | Description |
|----------|-------------|
| `hs.endpoint` | Endpoint CRUD, secrets, health |
| `hs.message` | Send webhooks, list deliveries |
| `hs.authentication` | Login, register, 2FA, profile |
| `hs.api_key` | API key management |
| `hs.team` | Team & member management |
| `hs.alert` | Alert rule management |
| `hs.analytics` | Stats, trends, success rates |
| `hs.billing` | Subscription, usage, invoices |
| `hs.health` | API health checks |
| `hs.search` | Search across resources |
| `hs.notification` | Notifications & preferences |
| `hs.admin` | Admin operations |

## Configuration

```python
from hooksniff import HookSniff, HookSniffOptions

hs = HookSniff(
    "hooksniff_xxx",
    options=HookSniffOptions(
        server_url="https://api.hooksniff.com",  # custom server
        timeout=30.0,                             # request timeout
        retry_schedule=[0.1, 0.2, 0.5],          # retry backoff
        debug=True,                               # debug logging
    ),
)
```

## License

MIT
