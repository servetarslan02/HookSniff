"""
HookRelay Python SDK - Enterprise webhook delivery service client.
"""

from .client import HookRelayClient
from .models import (
    Endpoint,
    Delivery,
    DeliveryAttempt,
    DeliveryList,
    BatchResult,
    Stats,
    AiStatus,
    AiEvent,
    RiskScore,
    AiAction,
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
    HookRelayError,
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

__version__ = "0.3.0"
__all__ = [
    "HookRelayClient",
    # Models
    "Endpoint",
    "Delivery",
    "DeliveryAttempt",
    "DeliveryList",
    "BatchResult",
    "Stats",
    "AiStatus",
    "AiEvent",
    "RiskScore",
    "AiAction",
    # Webhook payload types
    "OrderCreatedPayload",
    "OrderCompletedPayload",
    "PaymentFailedPayload",
    "PaymentSucceededPayload",
    "UserRegisteredPayload",
    "UserUpdatedPayload",
    "InvoiceCreatedPayload",
    # Exceptions
    "HookRelayError",
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
