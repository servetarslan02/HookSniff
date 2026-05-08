"""
HookSniff Python SDK - Enterprise webhook delivery service client.
"""

from .client import HookSniffClient
from .models import (
    Endpoint,
    Delivery,
    DeliveryAttempt,
    DeliveryList,
    BatchResult,
    Stats,
    RetryPolicy,
    OrderCreatedPayload,
    OrderCompletedPayload,
    PaymentFailedPayload,
    PaymentSucceededPayload,
    UserRegisteredPayload,
    UserUpdatedPayload,
    InvoiceCreatedPayload,
)
from .exceptions import (
    HookSniffError,
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    ValidationError,
    PayloadTooLargeError,
)
from .utils import verify_signature, verify_webhook_signature, WebhookHandler
from .verify import (
    WebhookEvent,
    WebhookVerifier,
    verify_webhook,
    verify_webhook_request,
)

__version__ = "0.1.0"
__all__ = [
    "HookSniffClient",
    # Models
    "Endpoint",
    "Delivery",
    "DeliveryAttempt",
    "DeliveryList",
    "BatchResult",
    "Stats",
    # Webhook payload types
    "OrderCreatedPayload",
    "OrderCompletedPayload",
    "PaymentFailedPayload",
    "PaymentSucceededPayload",
    "UserRegisteredPayload",
    "UserUpdatedPayload",
    "InvoiceCreatedPayload",
    # Exceptions
    "HookSniffError",
    "AuthenticationError",
    "NotFoundError",
    "RateLimitError",
    "ValidationError",
    "PayloadTooLargeError",
    # Legacy webhook verification (utils)
    "verify_signature",
    "verify_webhook_signature",
    "WebhookHandler",
    # Standard Webhooks verification (verify)
    "WebhookEvent",
    "WebhookVerifier",
    "verify_webhook",
    "verify_webhook_request",
]
