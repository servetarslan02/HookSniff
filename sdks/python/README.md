# HookSniff Python SDK

Adapted from Svix SDK architecture for HookSniff webhook delivery platform.

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

# Send a webhook
from hooksniff.models import MessageIn
msg = hs.message.create(MessageIn(event="order.created", data={"id": "123"}))

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
| `hs.endpoint` | Endpoint CRUD, secrets, stats |
| `hs.message` | Send webhooks, list deliveries |
| `hs.message_attempt` | Delivery attempts |
| `hs.authentication` | Login, register, profile |
| `hs.event_type` | Event type management |
| `hs.statistics` | Analytics & stats |

## License

MIT
