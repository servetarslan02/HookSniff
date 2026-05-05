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
    # Utilities
    "verify_signature",
    "verify_webhook_signature",
    "WebhookHandler",
]
