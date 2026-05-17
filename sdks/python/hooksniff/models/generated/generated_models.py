"""
HookSniff SDK — Auto-generated from OpenAPI spec
DO NOT EDIT — regenerate with: python3 openapi-codegen.py python
Source: docs/openapi.yaml (170 schemas)
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Optional

@dataclass
class Adminalertrule:
    """Admin alert rule with customer info"""
    id: Uuid
    customer_id: Optional[Uuid] = None
    customer_email: Optional[str] = None
    name: str
    condition: str
    threshold: int
    channels: list[str]
    is_active: bool
    created_at: str

@dataclass
class Adminauditentry:
    """A single admin audit log entry"""
    id: Uuid
    customer_id: Uuid
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: Datetime

@dataclass
class Adminauditlogresponse:
    """Paginated admin audit log response"""
    entries: list[Adminauditentry]
    total: int
    page: int
    per_page: int

@dataclass
class Admincreatealertrequest:
    """Create a platform alert rule (admin)"""
    customer_id: Optional[Uuid] = None
    name: str
    condition: str
    threshold: int
    channels: list[str]

@dataclass
class Adminrevenueentry:
    """Monthly revenue data point"""
    date: str
    mrr: float
    new_subscriptions: int
    churns: int

@dataclass
class Adminrevenueresponse:
    """Revenue history for admin analytics"""
    data: list[Adminrevenueentry]
    total_mrr: float

@dataclass
class Adminsystemstatus:
    """System-level status for admin dashboard"""
    version: str
    uptime_seconds: int
    db_status: str
    redis_status: str
    queue_depth: int

@dataclass
class Admintestwebhookrequest:
    """Send a test HTTP POST to a URL (admin)"""
    endpoint_url: str
    event_type: Optional[str] = None
    payload: dict[str, Any]

@dataclass
class Admintestwebhookresponse:
    """Result of a test webhook delivery"""
    status_code: int
    response_body: str
    duration_ms: int

@dataclass
class Adminupdatealertrequest:
    """Update an alert rule (admin, all fields optional)"""
    name: Optional[str] = None
    condition: Optional[str] = None
    threshold: Optional[int] = None
    channels: Optional[list[str]] = None
    is_active: Optional[bool] = None

@dataclass
class Adminuserlistresponse:
    """Paginated list of users for admin management"""
    data: list[Usersummary]
    has_more: bool
    total: int

@dataclass
class Alertnotificationlistresponse:
    """Paginated list of alert notifications"""
    data: list[dict[str, Any]]
    has_more: bool
    total: int

@dataclass
class Alertrule:
    id: Uuid
    name: str
    condition: str
    threshold: int
    channels: list[str]
    is_active: bool
    created_at: Datetime

@dataclass
class Alertrulelistresponse:
    """Paginated list of alert rules"""
    data: list[Alertrule]
    has_more: bool
    total: int

@dataclass
class Analyticstrendpoint:
    """Single data point in a delivery trend"""
    date: str
    total: int
    successful: int
    failed: int
    avg_latency_ms: Optional[float] = None

@dataclass
class Analyticstrendresponse:
    """Delivery trend data over a time period"""
    data: list[Analyticstrendpoint]
    period: str

@dataclass
class Apikeyinfo:
    id: Uuid
    prefix: str
    created_at: Datetime
    last_used_at: Optional[str] = None
    is_active: bool

@dataclass
class Application:
    id: Optional[Uuid] = None
    customer_id: Optional[Uuid] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    endpoint_count: Optional[int] = None
    created_at: Optional[Datetime] = None
    updated_at: Optional[Datetime] = None

@dataclass
class Applytemplaterequest:
    endpoint_id: Uuid
    variables: Optional[dict[str, Any]] = None

@dataclass
class Applytemplateresponse:
    success: bool
    message: str

@dataclass
class Auditlogentry:
    """A single audit log record"""
    id: Uuid
    actor: str
    action: str
    resource_type: str
    resource_id: str
    timestamp: Datetime
    metadata: Optional[dict[str, Any]] = None

@dataclass
class Auditloglistresponse:
    """Paginated list of audit log entries"""
    data: list[Auditlogentry]
    has_more: bool
    total: int

@dataclass
class Authresponse:
    token: str
    customer: Customerresponse
    refresh_token: Optional[str] = None

@dataclass
class Batchreplayrequest:
    ids: list[Uuid]

@dataclass
class Batchresponse:
    deliveries: list[Delivery]
    errors: list[dict[str, Any]]

@dataclass
class Batchwebhookrequest:
    webhooks: list[Createwebhookrequest]

@dataclass
class Batchwebhookresponse:
    """Response for batch webhook delivery creation"""
    delivery_ids: list[Uuid]
    count: int

@dataclass
class Billingportalresponse:
    """URL for the customer billing portal"""
    url: str

@dataclass
class Cancelsubscriptionrequest:
    """Request to cancel current subscription"""
    reason: str

@dataclass
class Cancelsubscriptionresponse:
    """Result of subscription cancellation"""
    cancelled_at: Datetime
    ends_at: Datetime

@dataclass
class Changepasswordrequest:
    current_password: str
    new_password: str

@dataclass
class Changerolerequest:
    role: str

@dataclass
class Churnresponse:
    """Churn report with list of recently churned users"""
    users: list[Churneduser]

@dataclass
class Churneduser:
    """A user who churned (became inactive) recently"""
    id: Uuid
    email: str
    name: Optional[str] = None
    plan: str
    amount: float
    churn_date: Datetime

@dataclass
class Confirm2farequest:
    code: str

@dataclass
class Contactrequest:
    name: str
    email: str
    subject: str
    message: str

@dataclass
class Contactresponse:
    success: bool
    message: str

@dataclass
class Createalertrequest:
    name: str
    condition: str
    threshold: int
    channels: list[str]
    endpoint_id: Optional[Uuid] = None

@dataclass
class Createalertrulerequest:
    """Request to create a new alert rule"""
    name: str
    condition: str
    threshold: int
    channels: list[str]

@dataclass
class Createapikeyresponse:
    id: Uuid
    key: str
    prefix: str
    message: str

@dataclass
class Createcustomdomainrequest:
    """Register a new custom domain"""
    domain: str

@dataclass
class Createendpointrequest:
    url: str
    description: Optional[str] = None
    allowed_ips: Optional[list[str]] = None
    event_filter: Optional[list[str]] = None
    custom_headers: Optional[dict[str, Any]] = None
    retry_policy: Optional[Retrypolicy] = None
    routing_strategy: Optional[str] = None
    fallback_url: Optional[str] = None
    format: Optional[str] = None

@dataclass
class Createroutingrulerequest:
    """Create a new routing rule"""
    name: str
    conditions: dict[str, Any]
    transform: Optional[dict[str, Any]] = None
    target_endpoint_id: Uuid

@dataclass
class Createssoconfigrequest:
    """Create a new SSO configuration"""
    provider: str
    domain: str
    metadata_url: str

@dataclass
class Createteamrequest:
    name: str

@dataclass
class Createtransformrulerequest:
    name: str
    rule_type: str
    config: dict[str, Any]

@dataclass
class Createwebhookrequest:
    endpoint_id: Uuid
    event: Optional[str] = None
    data: dict[str, Any]

@dataclass
class Customdomain:
    """A custom domain configured for the account"""
    id: Uuid
    domain: str
    status: str
    verification_token: Optional[str] = None
    created_at: Datetime

@dataclass
class Customdomainlistresponse:
    """List of custom domains"""
    data: list[Customdomain]

@dataclass
class Customerresponse:
    id: Uuid
    email: str
    name: Optional[str] = None
    api_key: Optional[str] = None
    plan: str
    webhook_limit: int
    webhook_count: int
    is_admin: bool
    created_at: Datetime

@dataclass
class Dailydeliverycount:
    """Daily delivery count breakdown"""
    date: str
    total: int
    success: int
    failed: int

@dataclass
class Delivery:
    id: Uuid
    endpoint_id: Uuid
    event: Optional[str] = None
    status: str
    attempt_count: int
    response_status: Optional[int] = None
    replay_count: int
    created_at: Datetime

@dataclass
class Deliveryattempt:
    id: Uuid
    attempt_number: int
    status_code: Optional[int] = None
    response_body: Optional[str] = None
    duration_ms: Optional[int] = None
    error_message: Optional[str] = None
    created_at: Datetime

@dataclass
class Deliveryattemptlistresponse:
    """Paginated list of delivery attempts"""
    data: list[Deliveryattempt]
    has_more: bool
    total: int

@dataclass
class Deliverydetailresponse:
    """Full delivery detail including all retry attempts and endpoint info"""
    delivery: Delivery
    attempts: list[Deliveryattempt]
    endpoint: Optional[Endpoint] = None
    request_headers: Optional[dict[str, Any]] = None
    request_body: Optional[dict[str, Any]] = None
    response_headers: Optional[dict[str, Any]] = None

@dataclass
class Deliverylistresponse:
    deliveries: list[Delivery]
    total: int
    page: int
    per_page: int

@dataclass
class Deliverytrendresponse:
    range: str
    buckets: list[dict[str, Any]]

@dataclass
class Deployinfo:
    version: Optional[str] = None
    git_commit: Optional[str] = None
    build_time: Optional[str] = None
    environment: Optional[str] = None

@dataclass
class Devicelistresponse:
    """Paginated list of registered devices"""
    data: list[Devicetokenresponse]

@dataclass
class Devicetokenresponse:
    id: Uuid
    token: str
    platform: str
    created_at: Datetime

@dataclass
class Disable2farequest:
    password: str

@dataclass
class Domaindnsrecord:
    """A DNS record required for domain verification"""
    type: str
    name: str
    value: str
    status: str

@dataclass
class Embedconfig:
    """Configuration for embedded webhook dashboard"""
    allowed_origins: list[str]
    theme: Optional[dict[str, Any]] = None
    features: Optional[list[str]] = None

@dataclass
class Enable2farequest:
    password: str

@dataclass
class Enable2faresponse:
    """TOTP secret and QR code URL returned after enabling 2FA"""
    secret: str
    qr_url: str

@dataclass
class Endpoint:
    id: Uuid
    url: str
    description: Optional[str] = None
    is_active: bool
    retry_policy: Retrypolicy
    created_at: Datetime
    allowed_ips: Optional[list[str]] = None
    event_filter: Optional[list[str]] = None
    custom_headers: Optional[dict[str, Any]] = None
    routing_strategy: str
    fallback_url: Optional[str] = None
    avg_response_ms: int
    failure_streak: int
    format: str

@dataclass
class Endpointhealth:
    """Endpoint health metrics and status"""
    endpoint_id: Uuid
    is_healthy: bool
    failure_streak: Optional[int] = None
    avg_response_ms: Optional[int] = None
    last_failure_at: Optional[Datetime] = None
    success_rate: Optional[float] = None
    avg_latency_ms: Optional[float] = None
    last_delivery_at: Optional[Datetime] = None
    total_deliveries: Optional[int] = None
    failed_deliveries: Optional[int] = None

@dataclass
class Endpointlistresponse:
    """Paginated list of endpoints"""
    data: list[Endpoint]
    total: int
    has_more: bool

@dataclass
class Error:
    error: str

@dataclass
class Eventtype:
    """A registered event type in the system"""
    id: Uuid
    name: str
    description: Optional[str] = None
    schema_id: Optional[Uuid] = None

@dataclass
class Eventtypecount:
    """Event type occurrence count"""
    event: Optional[str] = None
    count: int

@dataclass
class Eventtypelistresponse:
    """Paginated list of event types"""
    data: list[Eventtype]
    has_more: bool
    total: int

@dataclass
class Exportdataresponse:
    """GDPR data export containing all user data"""
    user: Optional[Customerresponse] = None
    endpoints: Optional[list[Endpoint]] = None
    deliveries: Optional[list[Delivery]] = None
    teams: Optional[list[Team]] = None
    exported_at: Datetime

@dataclass
class Featureflag:
    id: Optional[Uuid] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    rollout_percentage: Optional[int] = None
    enabled_for_plans: Optional[list[str]] = None
    created_by: Optional[str] = None
    created_at: Optional[Datetime] = None
    updated_at: Optional[Datetime] = None

@dataclass
class Forgotpasswordrequest:
    email: str

@dataclass
class Inboundconfig:
    id: Optional[Uuid] = None
    customer_id: Optional[Uuid] = None
    provider: Optional[str] = None
    secret: Optional[str] = None
    endpoint_id: Optional[str] = None
    enabled: Optional[bool] = None
    created_at: Optional[Datetime] = None

@dataclass
class Inboundwebhookrequest:
    """Raw webhook payload received from an external provider (Stripe, GitHub, etc.)"""
    provider: str
    payload: dict[str, Any]
    headers: Optional[dict[str, Any]] = None

@dataclass
class Inboundwebhookresponse:
    """Result of processing an inbound webhook"""
    id: Uuid
    status: str
    endpoint_id: Uuid
    received_at: Datetime

@dataclass
class Invitememberrequest:
    """Invite a new member to a team"""
    email: str
    role: str

@dataclass
class Inviterequest:
    email: str
    role: Optional[str] = None

@dataclass
class Invoicelistresponse:
    """Paginated list of invoices"""
    data: list[Invoiceresponse]
    has_more: bool
    total: int

@dataclass
class Invoiceresponse:
    id: str
    amount_cents: int
    currency: str
    status: str
    created_at: Datetime

@dataclass
class Latencyresponse:
    """Latency percentile breakdown for deliveries"""
    p50: float
    p90: float
    p95: float
    p99: float
    period: str

@dataclass
class Latencytrendresponse:
    range: str
    buckets: list[dict[str, Any]]
    overall_avg_ms: float

@dataclass
class Loginrequest:
    email: str
    password: str

@dataclass
class Logoutrequest:
    """Optional request body for explicit refresh token invalidation"""
    refresh_token: str

@dataclass
class Notification:
    id: Uuid
    title: str
    body: str
    is_read: bool
    link: Optional[str] = None
    created_at: Datetime

@dataclass
class Notificationlistresponse:
    notifications: list[Notification]
    total: int
    unread_count: int

@dataclass
class Notificationpreferences:
    email_on_failure: bool
    email_on_dead_letter: bool
    email_on_success: bool
    slack_webhook_url: Optional[str] = None
    discord_webhook_url: Optional[str] = None
    webhook_url: Optional[str] = None

@dataclass
class Oauthcallbackrequest:
    """OAuth authorization callback parameters"""
    code: str
    state: str
    redirect_uri: Optional[str] = None

@dataclass
class Oauthloginredirect:
    """OAuth redirect information"""
    redirect_url: str

@dataclass
class Oauthprovider:
    """An available OAuth identity provider"""
    id: Uuid
    name: str
    client_id: str
    authorize_url: str
    token_url: str

@dataclass
class Oauthproviderlistresponse:
    """List of available OAuth providers"""
    data: list[Oauthprovider]

@dataclass
class Outboundipsresponse:
    """List of static outbound IP addresses for firewall whitelisting"""
    ips: list[str]

@dataclass
class Outboundipsresponse:
    ips: list[str]
    updated_at: str

@dataclass
class Paginatedusers:
    users: list[Usersummary]
    total: int
    page: int
    per_page: int

@dataclass
class Platformsettings:
    """Platform-wide configuration settings"""
    default_plan: str
    max_endpoints_free: int
    max_endpoints_pro: int
    max_webhooks_free: int
    max_webhooks_pro: int
    rate_limit_free: int
    rate_limit_pro: int
    retry_max_attempts: int
    retention_days_free: int
    retention_days_pro: int
    maintenance_mode: bool
    signup_enabled: bool
    plan_price_pro: float
    plan_price_business: float
    resend_api_key: Optional[str] = None
    email_sender: Optional[str] = None

@dataclass
class Playgroundtestrequest:
    """Test a webhook payload against an endpoint in sandbox"""
    endpoint_id: Uuid
    payload: dict[str, Any]
    headers: Optional[dict[str, Any]] = None

@dataclass
class Playgroundtestresponse:
    """Result of a playground test delivery"""
    status_code: int
    response_body: str
    latency_ms: int
    headers: Optional[dict[str, Any]] = None

@dataclass
class Portalconfig:
    """Customer-facing portal branding and configuration"""
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    custom_domain: Optional[str] = None
    webhook_events: Optional[list[str]] = None

@dataclass
class Portalprofile:
    id: Uuid
    email: str
    name: Optional[str] = None
    plan: str
    created_at: Datetime

@dataclass
class Portalsession:
    """Temporary session token for the customer portal"""
    token: str
    expires_at: Datetime
    url: str

@dataclass
class Ratelimitconfig:
    """Rate limiting configuration for an endpoint"""
    requests_per_second: int
    burst_size: int
    enabled: bool

@dataclass
class Ratelimitusage:
    """Current rate limit usage for an endpoint"""
    current_rps: float
    limit_rps: float
    remaining: float
    reset_at: Datetime

@dataclass
class Refreshtokenrequest:
    refresh_token: str

@dataclass
class Registerdevicerequest:
    token: str
    platform: Optional[str] = None

@dataclass
class Registerrequest:
    email: str
    password: Optional[str] = None
    name: Optional[str] = None

@dataclass
class Registerschemarequest:
    name: str
    schema: dict[str, Any]

@dataclass
class Replaydeliveryresponse:
    """Result of replaying a delivery"""
    message: str
    original_id: Uuid
    new_delivery_id: Uuid

@dataclass
class Resendverificationrequest:
    email: str

@dataclass
class Resetpasswordrequest:
    token: str
    new_password: str

@dataclass
class Retrypolicy:
    max_attempts: int
    backoff: str
    initial_delay_secs: int
    max_delay_secs: int

@dataclass
class Revenueresponse:
    """Full revenue analytics response"""
    monthly_revenue: list[dict[str, Any]]
    revenue_by_plan: list[dict[str, Any]]
    mrr: float
    churn_rate: float
    mrr_trend: float

@dataclass
class Rotatesecretresponse:
    """New signing secret after rotation"""
    secret: str

@dataclass
class Routinginfo:
    endpoint_id: Uuid
    routing_strategy: str
    fallback_url: Optional[str] = None
    avg_response_ms: int
    failure_streak: int
    is_healthy: bool

@dataclass
class Routingrulelistresponse:
    """List of routing rules"""
    data: list[dict[str, Any]]

@dataclass
class Ssoconfig:
    """Single Sign-On configuration (SAML or OIDC)"""
    provider: str
    domain: str
    entity_id: Optional[str] = None
    sso_url: Optional[str] = None
    certificate: Optional[str] = None

@dataclass
class Ssoconfiglistresponse:
    """List of SSO configurations for the account"""
    data: list[Ssoconfig]

@dataclass
class Schemalistresponse:
    """Paginated list of registered schemas"""
    data: list[Schemaresponse]
    has_more: bool
    total: int

@dataclass
class Schemaresponse:
    """A registered JSON Schema for event validation"""
    id: Uuid
    name: str
    version: int
    schema_json: dict[str, Any]
    created_at: Datetime

@dataclass
class Searchrequest:
    """Search request for webhook deliveries"""
    query: str
    filters: Optional[dict[str, Any]] = None
    page: Optional[int] = None
    per_page: Optional[int] = None

@dataclass
class Searchresponse:
    """Search results for webhook deliveries"""
    deliveries: list[Delivery]
    total: int
    page: int
    per_page: int
    has_more: Optional[bool] = None

@dataclass
class Searchresult:
    deliveries: list[Delivery]
    total: int

@dataclass
class Servicetoken:
    id: Optional[Uuid] = None
    name: Optional[str] = None
    token_prefix: Optional[str] = None
    created_at: Optional[Datetime] = None
    last_used_at: Optional[str] = None
    is_active: Optional[bool] = None

@dataclass
class Servicetokencreateresponse:
    id: Optional[Uuid] = None
    name: Optional[str] = None
    token: Optional[str] = None
    token_prefix: Optional[str] = None
    message: Optional[str] = None

@dataclass
class Simulatorrequest:
    """Send a simulated webhook event"""
    endpoint_id: Uuid
    event_type: str
    payload: dict[str, Any]
    delay_ms: Optional[int] = None

@dataclass
class Simulatorresponse:
    """Result of a simulated webhook delivery"""
    delivery_id: Uuid
    status: str
    latency_ms: int

@dataclass
class Statsresponse:
    total_deliveries: int
    successful_deliveries: int
    failed_deliveries: int
    total_endpoints: int
    active_endpoints: int
    plan: str
    webhook_limit: int
    webhook_count: int

@dataclass
class Streamparams:
    endpoint_id: Uuid
    status: str
    limit: int

@dataclass
class Subscriptionresponse:
    plan: str
    status: str
    payment_provider: str
    webhook_limit: int
    endpoint_limit: int
    retention_days: int
    monthly_price_cents: int

@dataclass
class Successrateresponse:
    range: str
    successful: int
    failed: int
    pending: int
    success_rate: float

@dataclass
class Systemstats:
    total_users: int
    active_users: int
    total_endpoints: int
    total_deliveries: int
    plan_breakdown: list[dict[str, Any]]

@dataclass
class Systemstatus:
    overall_status: str
    uptime_30d: float
    components: list[dict[str, Any]]
    checked_at: str

@dataclass
class Team:
    id: Uuid
    name: str
    created_at: Datetime

@dataclass
class Teamdetailresponse:
    team: Team
    members: list[Teammember]
    invites: list[Teaminvite]

@dataclass
class Teaminvite:
    id: Uuid
    email: str
    role: str
    created_at: Datetime

@dataclass
class Teamlistresponse:
    """Paginated list of teams"""
    data: list[Team]
    has_more: bool
    total: int

@dataclass
class Teammember:
    id: Uuid
    user_id: Uuid
    email: str
    name: Optional[str] = None
    role: str
    joined_at: Datetime

@dataclass
class Teammemberlistresponse:
    """List of members in a team"""
    data: list[Teammember]

@dataclass
class Templatelistresponse:
    """Paginated list of webhook payload templates"""
    data: list[Webhooktemplate]

@dataclass
class Testwebhookrequest:
    endpoint_id: Uuid
    payload: dict[str, Any]
    event: Optional[str] = None

@dataclass
class Testwebhookresponse:
    success: bool
    status_code: int
    duration_ms: int
    response_body: str

@dataclass
class Transformrule:
    id: Uuid
    endpoint_id: Uuid
    name: str
    rule_type: str
    config: Optional[dict[str, Any]] = None
    is_active: bool
    created_at: Datetime

@dataclass
class Transformrulelistresponse:
    """Paginated list of transform rules"""
    data: list[Transformrule]

@dataclass
class Twofactorrequiredresponse:
    requires_2fa: bool
    temp_token: str
    message: str

@dataclass
class Updatealertrulerequest:
    """Request to update an existing alert rule (all fields optional)"""
    name: str
    condition: str
    threshold: int
    channels: list[str]

@dataclass
class Updateendpointrequest:
    url: str
    description: str
    is_active: bool
    allowed_ips: list[str]
    event_filter: list[str]
    custom_headers: Optional[dict[str, Any]] = None
    retry_policy: Retrypolicy
    routing_strategy: str
    fallback_url: str
    format: str

@dataclass
class Updatenotificationpreferences:
    email_on_failure: bool
    email_on_dead_letter: bool
    email_on_success: bool
    slack_webhook_url: Optional[str] = None
    discord_webhook_url: Optional[str] = None
    webhook_url: Optional[str] = None

@dataclass
class Updateprofilerequest:
    name: str
    email: str

@dataclass
class Updateroutingrequest:
    routing_strategy: str
    fallback_url: str

@dataclass
class Updateroutingrulerequest:
    """Update an existing routing rule (all fields optional)"""
    name: str
    conditions: Optional[dict[str, Any]] = None
    transform: Optional[dict[str, Any]] = None

@dataclass
class Updatessoconfigrequest:
    """Update an SSO configuration (all fields optional)"""
    provider: str
    domain: str

@dataclass
class Updatesubscriptionrequest:
    """Request to change subscription plan"""
    plan: str
    proration: Optional[bool] = None

@dataclass
class Updateteamrequest:
    """Fields to update on a team (all optional)"""
    name: str
    description: str

@dataclass
class Updatetransformrulerequest:
    """Update an existing transform rule (all fields optional)"""
    name: str
    config: Optional[dict[str, Any]] = None

@dataclass
class Upgraderequest:
    plan: str
    provider: Optional[str] = None

@dataclass
class Upgraderesponse:
    checkout_url: Optional[str] = None
    provider: str
    message: str

@dataclass
class Usageresponse:
    plan: str
    period_start: Datetime
    period_end: Datetime
    webhooks_used: int
    webhooks_limit: int
    endpoints_used: int
    endpoints_limit: int

@dataclass
class Usagestatsresponse:
    """Account usage statistics summary"""
    endpoints_count: int
    deliveries_count: int
    teams_count: int
    storage_used_bytes: int

@dataclass
class Useranalytics:
    """User analytics data for admin view"""
    daily_deliveries: list[Dailydeliverycount]
    top_events: list[Eventtypecount]
    endpoint_health: list[Endpointhealth]

@dataclass
class Usersummary:
    id: Uuid
    email: str
    name: Optional[str] = None
    plan: str
    is_active: bool
    created_at: Datetime

@dataclass
class Validateeventrequest:
    event: dict[str, Any]

@dataclass
class Validateeventresponse:
    """Result of validating an event payload against a schema"""
    valid: bool
    errors: Optional[list[dict[str, Any]]] = None

@dataclass
class Verify2farequest:
    temp_token: str
    code: str

@dataclass
class Verifycustomdomainresponse:
    """Result of domain verification attempt"""
    status: str
    dns_records: list[Domaindnsrecord]

@dataclass
class Verifyemailrequest:
    token: str

@dataclass
class Webhookfilter:
    """Query parameters for filtering webhook deliveries"""
    status: str
    endpoint_id: Uuid
    event_type: str
    from_date: Datetime
    to_date: Datetime
    page: int
    per_page: int

@dataclass
class Webhooktemplate:
    id: str
    name: str
    description: str
    category: str
    payload_template: Optional[dict[str, Any]] = None
