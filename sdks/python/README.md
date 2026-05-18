# HookSniff Python SDK

<p align="center">
  <a href="https://pypi.org/project/hooksniff/"><img src="https://img.shields.io/pypi/v/hooksniff.svg" alt="PyPI"></a>
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Python SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
pip install hooksniff
```

## Quick Start

```python
from hooksniff import HookSniff

client = HookSniff("hs_xxx")

# List endpoints
endpoints = client.endpoint.list()
print(endpoints)

# Create an endpoint
endpoint = client.endpoint.create(
    url="https://example.com/webhook",
    description="My endpoint",
)

# Send a webhook
message = client.message.create(
    event="order.created",
    data={"order_id": "123", "amount": 99.99},
)

# Get delivery attempts
attempts = client.message_attempt.list_by_msg(message.id)
```

## Webhook Verification

```python
from hooksniff import Webhook

wh = Webhook("whsec_xxx")

try:
    payload = wh.verify(raw_body, headers)
    # Payload is valid
    print(payload)
except Exception as err:
    # Invalid signature
    print(f"Verification failed: {err}")
```

## Error Handling

```python
from hooksniff import HookSniff
from hooksniff.exceptions import HookSniffError, NotFoundError

try:
    client.endpoint.get("invalid_id")
except NotFoundError:
    print("Endpoint not found")
except HookSniffError as err:
    print(f"Error: {err.code} — {err.message}")
```

## Configuration

```python
client = HookSniff(
    "hs_xxx",
    base_url="https://api.hooksniff.com/v1",  # optional
    timeout=30,                                 # seconds
    retries=3,                                  # auto-retry on 429/5xx
)
```

## Async Support

```python
import asyncio
from hooksniff import HookSniff

async def main():
    client = HookSniff("hs_xxx")
    endpoints = await client.endpoint.list()
    print(endpoints)

asyncio.run(main())
```

## Resources

| Resource | Methods |
|----------|---------|
| `endpoint` | `list`, `create`, `get`, `update`, `delete` |
| `message` | `create`, `list`, `get` |
| `message_attempt` | `list`, `list_by_msg`, `get`, `resend` |
| `authentication` | `dashboard_access` |
| `event_type` | `list` |
| `statistics` | `aggregate` |

## Links

- [Documentation](https://docs.hooksniff.com)
- [API Reference](https://api.hooksniff.com)
- [GitHub](https://github.com/servetarslan02/HookSniff)
