"""
HookSniff SDK — API Models

Type definitions for the HookSniff API.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from datetime import datetime


# ─── Common ────────────────────────────────────────────────────────

@dataclass
class RetryPolicy:
    max_retries: int
    initial_delay_ms: int
    max_delay_ms: int
    backoff_multiplier: float


# ─── Auth ──────────────────────────────────────────────────────────

@dataclass
class RegisterRequest:
    email: str
    password: str
    name: Optional[str] = None


@dataclass
class LoginRequest:
    email: str
    password: str
    totp_code: Optional[str] = None


@dataclass
class AuthResponse:
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: Dict[str, Any]


@dataclass
class CustomerResponse:
    id: str
    email: str
    name: Optional[str] = None
    plan: str = ""
    is_verified: bool = False
    two_factor_enabled: bool = False
    created_at: str = ""
    api_key_prefix: str = ""
    webhook_count: int = 0
    team_count: int = 0


@dataclass
class ForgotPasswordRequest:
    email: str


@dataclass
class ResetPasswordRequest:
    token: str
    new_password: str


@dataclass
class VerifyEmailRequest:
    token: str


@dataclass
class RefreshTokenRequest:
    refresh_token: str


@dataclass
class Enable2faResponse:
    secret: str
    qr_code_url: str
    backup_codes: List[str] = field(default_factory=list)


@dataclass
class UpdateProfileRequest:
    name: Optional[str] = None


@dataclass
class ChangePasswordRequest:
    current_password: str
    new_password: str


# ─── Endpoints ─────────────────────────────────────────────────────

@dataclass
class EndpointIn:
    url: str
    description: Optional[str] = None
    is_active: Optional[bool] = None
    retry_policy: Optional[Dict[str, Any]] = None
    allowed_ips: Optional[List[str]] = None
    event_filter: Optional[List[str]] = None
    custom_headers: Optional[Dict[str, str]] = None
    routing_strategy: Optional[str] = None
    fallback_url: Optional[str] = None
    format: Optional[str] = None


@dataclass
class EndpointUpdate:
    url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    retry_policy: Optional[Dict[str, Any]] = None
    allowed_ips: Optional[List[str]] = None
    event_filter: Optional[List[str]] = None
    custom_headers: Optional[Dict[str, str]] = None
    routing_strategy: Optional[str] = None
    fallback_url: Optional[str] = None
    format: Optional[str] = None


@dataclass
class EndpointOut:
    id: str
    url: str
    description: Optional[str] = None
    is_active: bool = True
    retry_policy: Dict[str, Any] = field(default_factory=dict)
    created_at: str = ""
    allowed_ips: Optional[List[str]] = None
    event_filter: Optional[List[str]] = None
    custom_headers: Optional[Dict[str, str]] = None
    routing_strategy: str = "round-robin"
    fallback_url: Optional[str] = None
    avg_response_ms: float = 0
    failure_streak: int = 0
    format: str = "standard"


@dataclass
class EndpointSecretOut:
    secret: str
    rotated_at: str = ""


@dataclass
class EndpointStats:
    total_deliveries: int = 0
    successful: int = 0
    failed: int = 0
    success_rate: float = 0.0


@dataclass
class EndpointHealth:
    endpoint_id: str = ""
    url: str = ""
    status: str = "healthy"
    uptime_percentage: float = 100.0
    avg_response_ms: float = 0.0
    last_success_at: Optional[str] = None
    last_failure_at: Optional[str] = None
    failure_streak: int = 0
    recent_attempts: int = 0
    recent_failures: int = 0


@dataclass
class ListResponseEndpointOut:
    data: List[EndpointOut] = field(default_factory=list)
    iterator: Optional[str] = None
    done: Optional[bool] = None


# ─── Webhooks / Messages ───────────────────────────────────────────

@dataclass
class MessageIn:
    event: str
    data: Dict[str, Any] = field(default_factory=dict)
    endpoint_id: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None


@dataclass
class MessageOut:
    id: str
    event: str
    data: Dict[str, Any] = field(default_factory=dict)
    metadata: Optional[Dict[str, str]] = None
    created_at: str = ""


@dataclass
class BatchMessageIn:
    messages: List[MessageIn] = field(default_factory=list)


@dataclass
class BatchMessageResponse:
    results: List[Dict[str, Any]] = field(default_factory=list)
    success_count: int = 0
    failure_count: int = 0


@dataclass
class ListResponseMessageOut:
    data: List[MessageOut] = field(default_factory=list)
    iterator: Optional[str] = None
    done: Optional[bool] = None


# ─── Message Attempts / Deliveries ─────────────────────────────────

@dataclass
class MessageAttemptOut:
    id: str
    message_id: str
    endpoint_id: str
    status: str = ""
    response_status: Optional[int] = None
    response_body: Optional[str] = None
    duration_ms: float = 0
    created_at: str = ""
    error_message: Optional[str] = None


@dataclass
class ListResponseMessageAttemptOut:
    data: List[MessageAttemptOut] = field(default_factory=list)
    iterator: Optional[str] = None
    done: Optional[bool] = None


# ─── API Keys ──────────────────────────────────────────────────────

@dataclass
class ApiTokenOut:
    id: str
    name: str
    prefix: str = ""
    last_used_at: Optional[str] = None
    created_at: str = ""
    expires_at: Optional[str] = None
    is_active: bool = True
    scopes: List[str] = field(default_factory=list)


@dataclass
class ApiTokenCreateOut(ApiTokenOut):
    key: str = ""


# ─── Teams ─────────────────────────────────────────────────────────

@dataclass
class TeamOut:
    id: str
    name: str
    created_at: str = ""
    member_count: int = 0
    endpoint_count: int = 0


@dataclass
class TeamMemberOut:
    id: str
    user_id: str
    email: str
    name: Optional[str] = None
    role: str = "member"
    joined_at: str = ""


@dataclass
class TeamInviteOut:
    id: str
    email: str
    role: str = "member"
    created_at: str = ""
    expires_at: str = ""


@dataclass
class TeamDetailOut(TeamOut):
    members: List[TeamMemberOut] = field(default_factory=list)
    pending_invites: List[TeamInviteOut] = field(default_factory=list)


@dataclass
class TeamIn:
    name: str


@dataclass
class TeamInviteIn:
    email: str
    role: str = "member"


@dataclass
class TeamRoleUpdate:
    role: str


# ─── Alerts ────────────────────────────────────────────────────────

@dataclass
class AlertRuleOut:
    id: str
    name: str
    condition: str
    threshold: float = 0.0
    window_minutes: int = 0
    is_active: bool = True
    notification_channels: List[str] = field(default_factory=list)
    created_at: str = ""


@dataclass
class AlertRuleIn:
    name: str
    condition: str
    threshold: float
    window_minutes: int
    notification_channels: Optional[List[str]] = None


# ─── Notifications ─────────────────────────────────────────────────

@dataclass
class NotificationOut:
    id: str
    type: str
    title: str
    message: str
    is_read: bool = False
    data: Optional[Dict[str, Any]] = None
    created_at: str = ""


@dataclass
class NotificationListResponse:
    data: List[NotificationOut] = field(default_factory=list)
    total: int = 0
    unread_count: int = 0


@dataclass
class DeviceTokenIn:
    token: str
    platform: str
    device_name: Optional[str] = None


@dataclass
class DeviceTokenOut:
    id: str
    token: str
    platform: str
    device_name: Optional[str] = None
    created_at: str = ""


@dataclass
class NotificationPreferences:
    email_deliveries: bool = True
    email_failures: bool = True
    email_weekly_digest: bool = True
    push_deliveries: bool = False
    push_failures: bool = True


@dataclass
class NotificationPreferencesUpdate:
    email_deliveries: Optional[bool] = None
    email_failures: Optional[bool] = None
    email_weekly_digest: Optional[bool] = None
    push_deliveries: Optional[bool] = None
    push_failures: Optional[bool] = None


# ─── Billing ───────────────────────────────────────────────────────

@dataclass
class SubscriptionOut:
    plan: str
    status: str = ""
    current_period_start: str = ""
    current_period_end: str = ""
    cancel_at_period_end: bool = False
    payment_provider: Optional[str] = None
    portal_url: Optional[str] = None
    limits: Dict[str, Any] = field(default_factory=dict)


@dataclass
class UpgradeRequest:
    plan: str
    payment_method: Optional[str] = None


@dataclass
class UpgradeResponse:
    checkout_url: str = ""
    session_id: str = ""


@dataclass
class UsageOut:
    period_start: str = ""
    period_end: str = ""
    deliveries_used: int = 0
    deliveries_limit: int = 0
    endpoints_used: int = 0
    endpoints_limit: int = 0
    overage: Dict[str, Any] = field(default_factory=dict)


@dataclass
class InvoiceOut:
    id: str
    amount_cents: int = 0
    currency: str = "usd"
    status: str = ""
    created_at: str = ""
    pdf_url: Optional[str] = None


@dataclass
class BillingPortalResponse:
    url: str = ""


# ─── Analytics ─────────────────────────────────────────────────────

@dataclass
class StatsResponse:
    total_deliveries: int = 0
    success_rate: float = 0.0
    avg_latency_ms: float = 0.0
    active_endpoints: int = 0
    period: str = ""


@dataclass
class TrendPoint:
    date: str
    value: float = 0.0


@dataclass
class TrendResponse:
    data: List[TrendPoint] = field(default_factory=list)
    metric: str = ""
    period: str = ""


@dataclass
class SuccessRateResponse:
    overall: float = 0.0
    by_endpoint: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class LatencyResponse:
    data: List[TrendPoint] = field(default_factory=list)
    p50: float = 0.0
    p95: float = 0.0
    p99: float = 0.0


@dataclass
class DeliveryTrendResponse:
    data: List[TrendPoint] = field(default_factory=list)
    total: int = 0


# ─── Search ────────────────────────────────────────────────────────

@dataclass
class SearchResult:
    type: str
    id: str
    title: str
    description: str = ""
    url: str = ""
    score: float = 0.0


# ─── Health ────────────────────────────────────────────────────────

@dataclass
class HealthCheck:
    status: str = ""
    version: str = ""
    uptime_seconds: int = 0
    database: str = ""
    redis: str = ""
    region: str = ""


@dataclass
class SystemStatus:
    status: str = ""
    version: str = ""
    uptime_seconds: int = 0
    total_customers: int = 0
    total_endpoints: int = 0
    total_deliveries_today: int = 0
    queue_depth: int = 0


# ─── Admin ─────────────────────────────────────────────────────────

@dataclass
class AdminAuditEntry:
    id: str
    action: str
    actor: str
    target_type: str
    target_id: str
    details: Optional[Dict[str, Any]] = None
    ip_address: str = ""
    created_at: str = ""


@dataclass
class AdminAuditLogResponse:
    data: List[AdminAuditEntry] = field(default_factory=list)
    total: int = 0


@dataclass
class AdminRevenueEntry:
    date: str
    revenue_cents: int = 0
    new_subscriptions: int = 0
    cancellations: int = 0
    mrr_cents: int = 0


@dataclass
class AdminRevenueResponse:
    data: List[AdminRevenueEntry] = field(default_factory=list)
    total_revenue_cents: int = 0
    mrr_cents: int = 0


# ─── Ordering ──────────────────────────────────────────────────────

Ordering = str  # "ascending" | "descending"
