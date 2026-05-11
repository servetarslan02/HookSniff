"""
HookSniff Python SDK

Usage:
    from hooksniff import HookSniff

    hs = HookSniff(api_key="your-api-key")

    # List endpoints
    endpoints = hs.endpoints.list()

    # Send a webhook
    delivery = hs.webhooks.send({
        "endpoint_id": "ep_123",
        "event": "order.created",
        "data": {"order_id": "12345"}
    })

    # Verify incoming webhook signature
    from hooksniff import Webhook
    wh = Webhook("whsec_...")
    payload = wh.verify(raw_body, headers)
"""

from hooksniff.client import HookSniff
from hooksniff.webhook import Webhook, WebhookVerificationError

__version__ = "0.4.0"
__all__ = ["HookSniff", "Webhook", "WebhookVerificationError"]
