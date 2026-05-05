"""Data models for HookRelay SDK."""

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
