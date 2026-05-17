"""
HookSniff Python SDK

A clean, modern SDK for the HookSniff webhook delivery API.
Svix-style architecture adapted for HookSniff.

Usage:
    from hooksniff import HookSniff

    hs = HookSniff(api_key="hooksniff_xxx")

    # List endpoints
    endpoints = hs.endpoints.list()

    # Send a webhook
    delivery = hs.webhooks.send({
        "endpoint_id": "ep_123",
        "event": "order.created",
        "data": {"order_id": "12345"},
    })

    # Verify incoming webhook signature
    from hooksniff import Webhook
    wh = Webhook("whsec_...")
    payload = wh.verify(raw_body, headers)
"""

from .client import HookSniff
from .webhook import Webhook, WebhookVerificationError
from .exceptions import (
    HookSniffError,
    ApiException,
    RateLimitError,
    NotFoundException,
    ValidationException,
    UnauthorizedException,
    ForbiddenException,
    ServerException,
)
from .pagination import paginate, collect_all, Page
from .request import LIB_VERSION

__version__ = LIB_VERSION
__all__ = [
    "HookSniff",
    "Webhook",
    "WebhookVerificationError",
    "HookSniffError",
    "ApiException",
    "RateLimitError",
    "NotFoundException",
    "ValidationException",
    "UnauthorizedException",
    "ForbiddenException",
    "ServerException",
    "paginate",
    "collect_all",
    "Page",
]
