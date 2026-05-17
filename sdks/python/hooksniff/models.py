"""
HookSniff SDK — API Models

Type definitions for the HookSniff API.
Generated from the OpenAPI spec, adapted for Python type hints.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional


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
    name: str | None = None


@dataclass
class LoginRequest:
    email: str
    password: str
    totp_code: str | None = None


@dataclass
class AuthResponse:
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict[str, Any]


@dataclass
class CustomerResponse:
    id: str
    email: str
    name: str | None
    plan: str
    is_verified: bool
    two_factor_enabled: bool
    created_at: str
    api_key_prefix: str
    webhook_count: int
    team_count: int


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
    backup_codes: list[str]


@dataclass
class UpdateProfileRequest:
    name: str | None = None


@dataclass
class ChangePasswordRequest:
    current_password: str
    new_password: str


# ─── Endpoints ─────────────────────────────────────────────────────

@dataclass
class Endpoint:
    id: str
    url: str
    description: str | None
    is_active: bool
    retry_policy: dict[str, Any]
    created_at: str
    allowed_ips: list[str] | None = None
    event_filter: list[str] | None = None
    custom_headers: dict[str, str] | None = None
    routing_strategy: str = "round-robin"
    fallback_url: str | None = None
    avg_response_ms: float = 0
    failure_streak: int = 0
    format: str = "standard"


@dataclass
class EndpointListResponse:
    data: list[Endpoint]
    iterator: str | None = None
    done: bool | None = None


@dataclass
class CreateEndpointRequest:
    url: str
    description: str | None = None
    is_active: bool | None = None
    retry_policy: dict[str, Any] | None = None
    allowed_ips: list[str] | None = None
    event_filter: list[str] | None = None
    custom_headers: dict[str, str] | None = None
    routing_strategy: str | None = None
    fallback_url: str | None = None
    format: str | None = None


@dataclass
class UpdateEndpointRequest:
    url: str | None = None
    description: str | None = None
    is_active: bool | None = None
    retry_policy: dict[str, Any] | None = None
    allowed_ips: list[str] | None = None
    event_filter: list[str] | None = None
    custom_headers: dict[str, str] | None = None
    routing_strategy: str | None = None
    fallback_url: str | None = None
    format: str | None = None


@dataclass
class RotateSecretResponse:
    secret: str
    rotated_at: str


# ─── Webhooks / Deliveries ─────────────────────────────────────────

@dataclass
class CreateWebhookRequest:
    endpoint_id: str
    event: str
    data: dict[str, Any]
    metadata: dict[str, str] | None = None


@dataclass
class BatchWebhookRequest:
    webhooks: list[CreateWebhookRequest]


@dataclass
class Delivery:
    id: str
    endpoint_id: str
    event: str
    status: str  # pending | processing | delivered | failed | retrying
    attempts: int
    max_attempts: int
    next_retry_at: str | None
    response_status: int | None
    response_body: str | None
    created_at: str
    delivered_at: str | None
    duration_ms: float | None
    payload_size: int


@dataclass
class DeliveryListResponse:
    data: list[Delivery]
    iterator: str | None = None
    done: bool | None = None


@dataclass
class BatchResult:
    id: str
    status: str
    error: str | None = None


@dataclass
class BatchResponse:
    results: list[BatchResult]
    success_count: int
    failure_count: int


@dataclass
class DeliveryAttempt:
    id: str
    delivery_id: str
    attempt_number: int
    status: str  # success | failed | timeout
    response_status: int | None
    response_body: str | None
    request_headers: dict[str, str] | None
    request_body: str | None
    duration_ms: float
    created_at: str
    error_message: str | None = None


@dataclass
class BatchReplayRequest:
    delivery_ids: list[str]


# ─── API Keys ──────────────────────────────────────────────────────

@dataclass
class ApiKeyInfo:
    id: str
    name: str
    prefix: str
    last_used_at: str | None
    created_at: str
    expires_at: str | None
    is_active: bool
    scopes: list[str]


@dataclass
class CreateApiKeyResponse:
    id: str
    key: str
    name: str
    prefix: str
    created_at: str


# ─── Teams ─────────────────────────────────────────────────────────

@dataclass
class Team:
    id: str
    name: str
    created_at: str
    member_count: int
    endpoint_count: int


@dataclass
class TeamMember:
    id: str
    user_id: str
    email: str
    name: str | None
    role: str  # owner | admin | member
    joined_at: str


@dataclass
class TeamInvite:
    id: str
    email: str
    role: str  # admin | member
    created_at: str
    expires_at: str


@dataclass
class TeamDetailResponse(Team):
    members: list[TeamMember] = field(default_factory=list)
    pending_invites: list[TeamInvite] = field(default_factory=list)


@dataclass
class CreateTeamRequest:
    name: str


@dataclass
class InviteRequest:
    email: str
    role: str = "member"


@dataclass
class ChangeRoleRequest:
    role: str  # admin | member


# ─── Alerts ────────────────────────────────────────────────────────

@dataclass
class AlertRule:
    id: str
    name: str
    condition: str
    threshold: float
    window_minutes: int
    is_active: bool
    notification_channels: list[str]
    created_at: str


@dataclass
class CreateAlertRequest:
    name: str
    condition: str
    threshold: float
    window_minutes: int
    notification_channels: list[str] | None = None


# ─── Notifications ─────────────────────────────────────────────────

@dataclass
class Notification:
    id: str
    type: str
    title: str
    message: str
    is_read: bool
    data: dict[str, Any] | None
    created_at: str


@dataclass
class NotificationListResponse:
    data: list[Notification]
    total: int
    unread_count: int


@dataclass
class RegisterDeviceRequest:
    token: str
    platform: str  # ios | android | web
    device_name: str | None = None


@dataclass
class DeviceTokenResponse:
    id: str
    token: str
    platform: str
    device_name: str | None
    created_at: str


# ─── Billing ───────────────────────────────────────────────────────

@dataclass
class SubscriptionResponse:
    plan: str
    status: str  # active | trialing | past_due | canceled | unpaid
    current_period_start: str
    current_period_end: str
    cancel_at_period_end: bool
    payment_provider: str | None
    portal_url: str | None
    limits: dict[str, Any]


@dataclass
class UpgradeRequest:
    plan: str
    payment_method: str | None = None


@dataclass
class UpgradeResponse:
    checkout_url: str
    session_id: str


@dataclass
class UsageResponse:
    period_start: str
    period_end: str
    deliveries_used: int
    deliveries_limit: int
    endpoints_used: int
    endpoints_limit: int
    overage: dict[str, Any]


@dataclass
class InvoiceResponse:
    id: str
    amount_cents: int
    currency: str
    status: str  # paid | open | void
    created_at: str
    pdf_url: str | None


# ─── Analytics ─────────────────────────────────────────────────────

@dataclass
class StatsResponse:
    total_deliveries: int
    success_rate: float
    avg_latency_ms: float
    active_endpoints: int
    period: str


@dataclass
class AnalyticsTrendPoint:
    date: str
    value: float


@dataclass
class AnalyticsTrendResponse:
    data: list[AnalyticsTrendPoint]
    metric: str
    period: str


@dataclass
class SuccessRateResponse:
    overall: float
    by_endpoint: list[dict[str, Any]]


@dataclass
class LatencyTrendResponse:
    data: list[AnalyticsTrendPoint]
    p50: float
    p95: float
    p99: float


@dataclass
class DeliveryTrendResponse:
    data: list[AnalyticsTrendPoint]
    total: int


# ─── Search ────────────────────────────────────────────────────────

@dataclass
class SearchResult:
    type: str
    id: str
    title: str
    description: str
    url: str
    score: float


# ─── Templates ─────────────────────────────────────────────────────

@dataclass
class WebhookTemplate:
    id: str
    name: str
    description: str
    event: str
    payload_schema: dict[str, Any]
    created_at: str


@dataclass
class ApplyTemplateRequest:
    endpoint_id: str
    template_id: str
    variables: dict[str, str] | None = None


@dataclass
class ApplyTemplateResponse:
    applied: bool
    template_id: str
    endpoint_id: str


# ─── Routing ───────────────────────────────────────────────────────

@dataclass
class RoutingInfo:
    strategy: str
    endpoints: list[dict[str, Any]]
    fallback_url: str | None


@dataclass
class UpdateRoutingRequest:
    strategy: str  # round-robin | latency | failover
    fallback_url: str | None = None


# ─── Endpoint Health ───────────────────────────────────────────────

@dataclass
class EndpointHealth:
    endpoint_id: str
    url: str
    status: str  # healthy | degraded | down
    uptime_percentage: float
    avg_response_ms: float
    last_success_at: str | None
    last_failure_at: str | None
    failure_streak: int
    recent_attempts: int
    recent_failures: int


# ─── Transforms ────────────────────────────────────────────────────

@dataclass
class TransformRule:
    id: str
    name: str
    source_event: str
    target_format: str
    expression: str
    is_active: bool
    created_at: str


@dataclass
class CreateTransformRuleRequest:
    name: str
    source_event: str
    target_format: str
    expression: str
    is_active: bool | None = None


# ─── Contact ───────────────────────────────────────────────────────

@dataclass
class ContactRequest:
    name: str
    email: str
    subject: str
    message: str


@dataclass
class ContactResponse:
    success: bool
    message: str


# ─── Misc ──────────────────────────────────────────────────────────

@dataclass
class OutboundIpsResponse:
    ips: list[str]


@dataclass
class SystemStatus:
    status: str  # operational | degraded | down
    version: str
    uptime_seconds: int
    database: str
    redis: str
    region: str


@dataclass
class NotificationPreferences:
    email_deliveries: bool
    email_failures: bool
    email_weekly_digest: bool
    push_deliveries: bool
    push_failures: bool


@dataclass
class UpdateNotificationPreferences:
    email_deliveries: bool | None = None
    email_failures: bool | None = None
    email_weekly_digest: bool | None = None
    push_deliveries: bool | None = None
    push_failures: bool | None = None


@dataclass
class PortalProfile:
    customer_id: str
    email: str
    name: str | None
    plan: str
    created_at: str


@dataclass
class TestWebhookRequest:
    endpoint_id: str
    event: str | None = None
    data: dict[str, Any] | None = None


@dataclass
class TestWebhookResponse:
    delivery_id: str
    status: str
    response_status: int
    duration_ms: float


# ─── Admin ─────────────────────────────────────────────────────────

@dataclass
class AdminAuditEntry:
    id: str
    action: str
    actor: str
    target_type: str
    target_id: str
    details: dict[str, Any] | None
    ip_address: str
    created_at: str


@dataclass
class AdminAuditLogResponse:
    data: list[AdminAuditEntry]
    total: int


@dataclass
class AdminRevenueEntry:
    date: str
    revenue_cents: int
    new_subscriptions: int
    cancellations: int
    mrr_cents: int


@dataclass
class AdminRevenueResponse:
    data: list[AdminRevenueEntry]
    total_revenue_cents: int
    mrr_cents: int


@dataclass
class AdminSystemStatus(SystemStatus):
    total_customers: int = 0
    total_endpoints: int = 0
    total_deliveries_today: int = 0
    queue_depth: int = 0


@dataclass
class BillingPortalResponse:
    url: str


# ─── Ordering ──────────────────────────────────────────────────────

Ordering = str  # "ascending" | "descending"
