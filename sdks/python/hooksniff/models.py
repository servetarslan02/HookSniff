"""Data models for HookSniff SDK."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class RetryPolicy:
    """Retry policy configuration for webhook endpoints."""

    max_attempts: int = 3
    backoff: str = "exponential"  # exponential, linear, fixed
    initial_delay_secs: int = 10
    max_delay_secs: int = 3600

    def to_dict(self) -> Dict[str, Any]:
        return {
            "max_attempts": self.max_attempts,
            "backoff": self.backoff,
            "initial_delay_secs": self.initial_delay_secs,
            "max_delay_secs": self.max_delay_secs,
        }

    @classmethod
    def from_dict(cls, data: Optional[Dict[str, Any]]) -> Optional["RetryPolicy"]:
        if data is None:
            return None
        return cls(
            max_attempts=data.get("max_attempts", 3),
            backoff=data.get("backoff", "exponential"),
            initial_delay_secs=data.get("initial_delay_secs", 10),
            max_delay_secs=data.get("max_delay_secs", 3600),
        )


@dataclass
class Endpoint:
    """A webhook endpoint."""

    id: str
    url: str
    description: Optional[str] = None
    is_active: bool = True
    retry_policy: Optional[RetryPolicy] = None
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Endpoint":
        return cls(
            id=data["id"],
            url=data["url"],
            description=data.get("description"),
            is_active=data.get("is_active", True),
            retry_policy=RetryPolicy.from_dict(data.get("retry_policy")),
            created_at=_parse_datetime(data.get("created_at")),
        )


@dataclass
class Delivery:
    """A webhook delivery record."""

    id: str
    endpoint_id: str
    event: Optional[str] = None
    status: str = "pending"
    attempt_count: int = 0
    response_status: Optional[int] = None
    replay_count: int = 0
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Delivery":
        return cls(
            id=data["id"],
            endpoint_id=data["endpoint_id"],
            event=data.get("event"),
            status=data.get("status", "pending"),
            attempt_count=data.get("attempt_count", 0),
            response_status=data.get("response_status"),
            replay_count=data.get("replay_count", 0),
            created_at=_parse_datetime(data.get("created_at")),
        )


@dataclass
class DeliveryAttempt:
    """A single delivery attempt for a webhook."""

    id: str
    attempt_number: int
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    duration_ms: Optional[int] = None
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DeliveryAttempt":
        return cls(
            id=data["id"],
            attempt_number=data["attempt_number"],
            status_code=data.get("status_code"),
            response_body=data.get("response_body"),
            duration_ms=data.get("duration_ms"),
            error_message=data.get("error_message"),
            created_at=_parse_datetime(data.get("created_at")),
        )


@dataclass
class DeliveryList:
    """Paginated list of deliveries."""

    deliveries: List[Delivery]
    total: int
    page: int
    per_page: int

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DeliveryList":
        return cls(
            deliveries=[Delivery.from_dict(d) for d in data.get("deliveries", [])],
            total=data.get("total", 0),
            page=data.get("page", 1),
            per_page=data.get("per_page", 20),
        )


@dataclass
class BatchResult:
    """Result of a batch webhook submission."""

    deliveries: List[Delivery] = field(default_factory=list)
    errors: List[Dict[str, Any]] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BatchResult":
        return cls(
            deliveries=[Delivery.from_dict(d) for d in data.get("deliveries", [])],
            errors=data.get("errors", []),
        )


@dataclass
class Stats:
    """Delivery statistics."""

    total_deliveries: int
    delivered: int
    failed: int
    pending: int
    success_rate: float
    endpoints_count: int

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Stats":
        return cls(
            total_deliveries=data.get("total_deliveries", 0),
            delivered=data.get("delivered", 0),
            failed=data.get("failed", 0),
            pending=data.get("pending", 0),
            success_rate=data.get("success_rate", 0.0),
            endpoints_count=data.get("endpoints_count", 0),
        )


def _parse_datetime(value: Optional[str]) -> Optional[datetime]:
    """Parse ISO 8601 datetime string."""
    if value is None:
        return None
    try:
        # Handle both with and without timezone
        if value.endswith("Z"):
            value = value[:-1] + "+00:00"
        return datetime.fromisoformat(value)
    except (ValueError, AttributeError):
        return None


# --- AI Center Models ---

@dataclass
class AiStatus:
    """AI Center status."""

    active_events: int
    critical_events: int
    pending_actions: int
    blocked_items: int
    avg_risk_score: float
    high_risk_endpoints: int

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AiStatus":
        return cls(
            active_events=data.get("active_events", 0),
            critical_events=data.get("critical_events", 0),
            pending_actions=data.get("pending_actions", 0),
            blocked_items=data.get("blocked_items", 0),
            avg_risk_score=data.get("avg_risk_score", 0.0),
            high_risk_endpoints=data.get("high_risk_endpoints", 0),
        )


@dataclass
class AiEvent:
    """AI event record."""

    id: str
    event_type: str
    severity: str
    title: str
    description: Optional[str] = None
    action_taken: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    resolved: bool = False
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AiEvent":
        return cls(
            id=data["id"],
            event_type=data["event_type"],
            severity=data["severity"],
            title=data["title"],
            description=data.get("description"),
            action_taken=data.get("action_taken"),
            target_type=data.get("target_type"),
            target_id=data.get("target_id"),
            resolved=data.get("resolved", False),
            created_at=_parse_datetime(data.get("created_at")),
        )


@dataclass
class RiskScore:
    """Risk score for an endpoint."""

    id: str
    target_type: str
    target_id: str
    score: int
    factors: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RiskScore":
        return cls(
            id=data["id"],
            target_type=data["target_type"],
            target_id=data["target_id"],
            score=data["score"],
            factors=data.get("factors"),
            created_at=_parse_datetime(data.get("created_at")),
        )


@dataclass
class AiAction:
    """AI action record."""

    id: str
    action_type: str
    description: str
    status: str
    risk_level: str
    auto_approved: bool = False
    target_type: Optional[str] = None
    target_id: Optional[str] = None
    executed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AiAction":
        return cls(
            id=data["id"],
            action_type=data["action_type"],
            description=data["description"],
            status=data["status"],
            risk_level=data["risk_level"],
            auto_approved=data.get("auto_approved", False),
            target_type=data.get("target_type"),
            target_id=data.get("target_id"),
            executed_at=_parse_datetime(data.get("executed_at")),
            created_at=_parse_datetime(data.get("created_at")),
        )


# --- Webhook Payload Types ---


@dataclass
class OrderItem:
    """An item in an order."""

    sku: str
    name: str
    quantity: int
    unit_price: float


@dataclass
class OrderCustomer:
    """Customer info in an order event."""

    id: str
    email: str
    name: str


@dataclass
class OrderCreatedPayload:
    """Payload for order.created events."""

    order_id: str
    customer: OrderCustomer
    items: List[OrderItem]
    total: float
    currency: str
    shipping_method: str
    created_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OrderCreatedPayload":
        return cls(
            order_id=data["order_id"],
            customer=OrderCustomer(**data["customer"]),
            items=[OrderItem(**item) for item in data.get("items", [])],
            total=data["total"],
            currency=data.get("currency", "USD"),
            shipping_method=data.get("shipping_method", "standard"),
            created_at=data.get("created_at"),
        )


@dataclass
class OrderCompletedPayload:
    """Payload for order.completed events."""

    order_id: str
    status: str
    completed_at: Optional[str] = None
    total_charged: float = 0.0
    payment_method: str = ""

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OrderCompletedPayload":
        return cls(
            order_id=data["order_id"],
            status=data.get("status", "completed"),
            completed_at=data.get("completed_at"),
            total_charged=data.get("total_charged", 0.0),
            payment_method=data.get("payment_method", ""),
        )


@dataclass
class PaymentError:
    """Error details in a failed payment."""

    code: str
    message: str
    decline_code: Optional[str] = None


@dataclass
class PaymentFailedPayload:
    """Payload for payment.failed events."""

    payment_id: str
    order_id: str
    amount: float
    currency: str
    error: PaymentError
    customer_id: str
    attempted_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PaymentFailedPayload":
        return cls(
            payment_id=data["payment_id"],
            order_id=data["order_id"],
            amount=data["amount"],
            currency=data.get("currency", "USD"),
            error=PaymentError(**data["error"]),
            customer_id=data["customer_id"],
            attempted_at=data.get("attempted_at"),
        )


@dataclass
class PaymentSucceededPayload:
    """Payload for payment.succeeded events."""

    payment_id: str
    amount: float
    currency: str
    method: str
    card_brand: str
    card_last4: str
    receipt_url: Optional[str] = None
    paid_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PaymentSucceededPayload":
        return cls(
            payment_id=data["payment_id"],
            amount=data["amount"],
            currency=data.get("currency", "USD"),
            method=data.get("method", "card"),
            card_brand=data.get("card_brand", ""),
            card_last4=data.get("card_last4", ""),
            receipt_url=data.get("receipt_url"),
            paid_at=data.get("paid_at"),
        )


@dataclass
class UserRegisteredPayload:
    """Payload for user.registered events."""

    user_id: str
    email: str
    name: str
    plan: str
    source: str
    registered_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "UserRegisteredPayload":
        return cls(
            user_id=data["user_id"],
            email=data["email"],
            name=data["name"],
            plan=data.get("plan", "free"),
            source=data.get("source", "organic"),
            registered_at=data.get("registered_at"),
        )


@dataclass
class UserUpdatedPayload:
    """Payload for user.updated events."""

    user_id: str
    changes: Dict[str, Dict[str, Any]]
    updated_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "UserUpdatedPayload":
        return cls(
            user_id=data["user_id"],
            changes=data.get("changes", {}),
            updated_at=data.get("updated_at"),
        )


@dataclass
class InvoiceCreatedPayload:
    """Payload for invoice.created events."""

    invoice_id: str
    customer_id: str
    amount_due: float
    currency: str
    status: str
    period_start: Optional[str] = None
    period_end: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "InvoiceCreatedPayload":
        return cls(
            invoice_id=data["invoice_id"],
            customer_id=data["customer_id"],
            amount_due=data["amount_due"],
            currency=data.get("currency", "USD"),
            status=data.get("status", "open"),
            period_start=data.get("period_start"),
            period_end=data.get("period_end"),
        )
