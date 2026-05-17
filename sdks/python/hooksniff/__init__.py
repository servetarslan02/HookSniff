"""
HookSniff Python SDK

Svix-style architecture adapted for HookSniff.

Usage:
    from hooksniff import HookSniff, HookSniffOptions

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

    # Async usage
    from hooksniff import HookSniffAsync
    hs = HookSniffAsync("hooksniff_xxx")
    endpoints = await hs.endpoint.list()
"""

from .api.hooksniff import HookSniff, HookSniffAsync, HookSniffOptions, DEFAULT_SERVER_URL
from .webhooks import Webhook, WebhookVerificationError
from .exceptions import HttpError, HTTPValidationError

__version__ = "0.5.0"

__all__ = [
    "HookSniff",
    "HookSniffAsync",
    "HookSniffOptions",
    "DEFAULT_SERVER_URL",
    "Webhook",
    "WebhookVerificationError",
    "HttpError",
    "HTTPValidationError",
]
