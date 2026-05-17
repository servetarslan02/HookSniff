export type Datetime = string;

export type Uuid = string;
// ═══════════════════════════════════════════════════════════
// HookSniff SDK — Auto-generated from OpenAPI spec
// DO NOT EDIT — regenerate with: python3 openapi-codegen.py node
// Source: docs/openapi.yaml (170 schemas)
// ═══════════════════════════════════════════════════════════

/** Admin alert rule with customer info */
export interface Adminalertrule {
  id: Uuid;
  customer_id?: Uuid;
  customer_email?: string;
  name: string;
  condition: 'failure_rate' | 'latency' | 'consecutive_failures';
  threshold: number;
  channels: 'slack' | 'email' | 'webhook'[];
  is_active: boolean;
  created_at: string;
}

/** A single admin audit log entry */
export interface Adminauditentry {
  id: Uuid;
  customer_id: Uuid;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: Datetime;
}

/** Paginated admin audit log response */
export interface Adminauditlogresponse {
  entries: Adminauditentry[];
  total: number;
  page: number;
  per_page: number;
}

/** Create a platform alert rule (admin) */
export interface Admincreatealertrequest {
  customer_id?: Uuid;
  name: string;
  condition: 'failure_rate' | 'latency' | 'consecutive_failures';
  threshold: number;
  channels: 'slack' | 'email' | 'webhook'[];
}

/** Monthly revenue data point */
export interface Adminrevenueentry {
  date: string;
  /** Monthly recurring revenue in dollars */
  mrr: number;
  new_subscriptions: number;
  churns: number;
}

/** Revenue history for admin analytics */
export interface Adminrevenueresponse {
  data: Adminrevenueentry[];
  /** Current total MRR across all subscriptions */
  total_mrr: number;
}

/** System-level status for admin dashboard */
export interface Adminsystemstatus {
  version: string;
  uptime_seconds: number;
  db_status: 'healthy' | 'degraded' | 'down';
  redis_status: 'healthy' | 'degraded' | 'down';
  /** Number of pending jobs in the delivery queue */
  queue_depth: number;
}

/** Send a test HTTP POST to a URL (admin) */
export interface Admintestwebhookrequest {
  endpoint_url: string;
  event_type?: string;
  payload: Record<string, unknown>;
}

/** Result of a test webhook delivery */
export interface Admintestwebhookresponse {
  status_code: number;
  response_body: string;
  duration_ms: number;
}

/** Update an alert rule (admin, all fields optional) */
export interface Adminupdatealertrequest {
  name?: string;
  condition?: 'failure_rate' | 'latency' | 'consecutive_failures';
  threshold?: number;
  channels?: 'slack' | 'email' | 'webhook'[];
  is_active?: boolean;
}

/** Paginated list of users for admin management */
export interface Adminuserlistresponse {
  data: Usersummary[];
  has_more: boolean;
  total: number;
}

/** Paginated list of alert notifications */
export interface Alertnotificationlistresponse {
  data: Record<string, unknown>[];
  has_more: boolean;
  total: number;
}

export interface Alertrule {
  id: Uuid;
  name: string;
  condition: 'failure_rate' | 'latency' | 'consecutive_failures';
  threshold: number;
  channels: 'slack' | 'email' | 'webhook'[];
  is_active: boolean;
  created_at: Datetime;
}

/** Paginated list of alert rules */
export interface Alertrulelistresponse {
  data: Alertrule[];
  has_more: boolean;
  total: number;
}

/** Single data point in a delivery trend */
export interface Analyticstrendpoint {
  /** Date of the data point */
  date: string;
  /** Total deliveries on this date */
  total: number;
  /** Successfully delivered on this date */
  successful: number;
  /** Failed deliveries on this date */
  failed: number;
  /** Average delivery latency in milliseconds */
  avg_latency_ms?: number;
}

/** Delivery trend data over a time period */
export interface Analyticstrendresponse {
  /** Array of trend data points */
  data: Analyticstrendpoint[];
  /** Time range of the data */
  period: '24h' | '7d' | '30d';
}

export interface Apikeyinfo {
  id: Uuid;
  /** Masked key prefix (e.g. "hs_abc1...") */
  prefix: string;
  created_at: Datetime;
  last_used_at?: string;
  is_active: boolean;
}

export interface Application {
  id?: Uuid;
  customer_id?: Uuid;
  name?: string;
  description?: string;
  is_active?: boolean;
  endpoint_count?: number;
  created_at?: Datetime;
  updated_at?: Datetime;
}

export interface Applytemplaterequest {
  endpoint_id: Uuid;
  variables?: Record<string, unknown>;
}

export interface Applytemplateresponse {
  success: boolean;
  message: string;
}

/** A single audit log record */
export interface Auditlogentry {
  id: Uuid;
  /** Who performed the action (user id or email) */
  actor: string;
  /** The action taken (e.g. endpoint.create, team.invite) */
  action: string;
  /** Type of resource affected (endpoint, team, api_key, etc.) */
  resource_type: string;
  /** ID of the affected resource */
  resource_id: string;
  timestamp: Datetime;
  /** Additional context (old_value, new_value, ip, etc.) */
  metadata?: Record<string, unknown>;
}

/** Paginated list of audit log entries */
export interface Auditloglistresponse {
  data: Auditlogentry[];
  has_more: boolean;
  total: number;
}

export interface Authresponse {
  /** JWT access token */
  token: string;
  customer: Customerresponse;
  /** Refresh token (when applicable) */
  refresh_token?: string;
}

export interface Batchreplayrequest {
  ids: Uuid[];
}

export interface Batchresponse {
  deliveries: Delivery[];
  errors: Record<string, unknown>[];
}

export interface Batchwebhookrequest {
  webhooks: Createwebhookrequest[];
}

/** Response for batch webhook delivery creation */
export interface Batchwebhookresponse {
  /** List of created delivery IDs */
  delivery_ids: Uuid[];
  /** Number of deliveries created */
  count: number;
}

/** URL for the customer billing portal */
export interface Billingportalresponse {
  /** Stripe billing portal URL */
  url: string;
}

/** Request to cancel current subscription */
export interface Cancelsubscriptionrequest {
  /** Optional reason for cancellation */
  reason: string;
}

/** Result of subscription cancellation */
export interface Cancelsubscriptionresponse {
  cancelled_at: Datetime;
  /** Date when access ends (end of billing period) */
  ends_at: Datetime;
}

export interface Changepasswordrequest {
  current_password: string;
  new_password: string;
}

export interface Changerolerequest {
  role: 'admin' | 'member' | 'viewer';
}

/** Churn report with list of recently churned users */
export interface Churnresponse {
  users: Churneduser[];
}

/** A user who churned (became inactive) recently */
export interface Churneduser {
  id: Uuid;
  email: string;
  name?: string;
  plan: string;
  amount: number;
  churn_date: Datetime;
}

export interface Confirm2farequest {
  code: string;
}

export interface Contactrequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Contactresponse {
  success: boolean;
  message: string;
}

export interface Createalertrequest {
  name: string;
  condition: 'failure_rate' | 'latency' | 'consecutive_failures';
  threshold: number;
  channels: string[];
  endpoint_id?: Uuid;
}

/** Request to create a new alert rule */
export interface Createalertrulerequest {
  /** Human-readable alert name */
  name: string;
  /** Condition that triggers the alert */
  condition: 'failure_rate' | 'latency' | 'consecutive_failures';
  /** Threshold value for the condition */
  threshold: number;
  /** Notification channels to alert on */
  channels: 'slack' | 'email' | 'webhook'[];
}

export interface Createapikeyresponse {
  id: Uuid;
  /** Full API key — only shown once */
  key: string;
  prefix: string;
  message: string;
}

/** Register a new custom domain */
export interface Createcustomdomainrequest {
  /** Fully qualified domain name to register */
  domain: string;
}

export interface Createendpointrequest {
  url: string;
  description?: string;
  allowed_ips?: string[];
  event_filter?: string[];
  custom_headers?: Record<string, unknown>;
  retry_policy?: Retrypolicy;
  routing_strategy?: 'round-robin' | 'latency' | 'failover';
  fallback_url?: string;
  format?: 'standard' | 'cloudevents';
}

/** Create a new routing rule */
export interface Createroutingrulerequest {
  name: string;
  /** Conditions that trigger this rule (e.g. event_type, header match) */
  conditions: Record<string, unknown>;
  /** Optional payload transformation config */
  transform?: Record<string, unknown>;
  target_endpoint_id: Uuid;
}

/** Create a new SSO configuration */
export interface Createssoconfigrequest {
  provider: 'saml' | 'oidc';
  domain: string;
  /** URL to SAML metadata or OIDC discovery document */
  metadata_url: string;
}

export interface Createteamrequest {
  name: string;
}

export interface Createtransformrulerequest {
  name: string;
  rule_type: string;
  config: Record<string, unknown>;
}

export interface Createwebhookrequest {
  endpoint_id: Uuid;
  /** Event type (e.g. "order.created") */
  event?: string;
  /** Webhook payload */
  data: Record<string, unknown>;
}

/** A custom domain configured for the account */
export interface Customdomain {
  id: Uuid;
  /** The custom domain (e.g. webhooks.example.com) */
  domain: string;
  status: 'pending' | 'verifying' | 'verified' | 'failed';
  /** TXT record value to prove domain ownership */
  verification_token?: string;
  created_at: Datetime;
}

/** List of custom domains */
export interface Customdomainlistresponse {
  data: Customdomain[];
}

export interface Customerresponse {
  id: Uuid;
  email: string;
  name?: string;
  /** Only returned on registration */
  api_key?: string;
  plan: 'free' | 'pro' | 'business';
  webhook_limit: number;
  webhook_count: number;
  is_admin: boolean;
  created_at: Datetime;
}

/** Daily delivery count breakdown */
export interface Dailydeliverycount {
  date: string;
  total: number;
  success: number;
  failed: number;
}

export interface Delivery {
  id: Uuid;
  endpoint_id: Uuid;
  event?: string;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  attempt_count: number;
  response_status?: number;
  replay_count: number;
  created_at: Datetime;
}

export interface Deliveryattempt {
  id: Uuid;
  attempt_number: number;
  status_code?: number;
  response_body?: string;
  duration_ms?: number;
  error_message?: string;
  created_at: Datetime;
}

/** Paginated list of delivery attempts */
export interface Deliveryattemptlistresponse {
  data: Deliveryattempt[];
  has_more: boolean;
  total: number;
}

/** Full delivery detail including all retry attempts and endpoint info */
export interface Deliverydetailresponse {
  delivery: Delivery;
  attempts: Deliveryattempt[];
  endpoint?: Endpoint;
  /** Original request headers sent with the delivery */
  request_headers?: Record<string, unknown>;
  /** Original request body sent with the delivery */
  request_body?: Record<string, unknown>;
  /** Response headers received from the endpoint */
  response_headers?: Record<string, unknown>;
}

export interface Deliverylistresponse {
  deliveries: Delivery[];
  total: number;
  page: number;
  per_page: number;
}

export interface Deliverytrendresponse {
  range: string;
  buckets: Record<string, unknown>[];
}

export interface Deployinfo {
  /** Semantic version from Cargo.toml */
  version?: string;
  /** Git SHA of the deployed commit */
  git_commit?: string;
  /** ISO 8601 build timestamp */
  build_time?: string;
  /** Deployment environment (production, staging, etc.) */
  environment?: string;
}

/** Paginated list of registered devices */
export interface Devicelistresponse {
  data: Devicetokenresponse[];
}

export interface Devicetokenresponse {
  id: Uuid;
  token: string;
  platform: string;
  created_at: Datetime;
}

export interface Disable2farequest {
  password: string;
}

/** A DNS record required for domain verification */
export interface Domaindnsrecord {
  type: 'TXT' | 'CNAME' | 'A';
  /** DNS record name/host */
  name: string;
  /** DNS record value */
  value: string;
  status: 'pending' | 'verified' | 'failed';
}

/** Configuration for embedded webhook dashboard */
export interface Embedconfig {
  /** CORS origins allowed to load the embed */
  allowed_origins: string[];
  /** Visual customization for the embed */
  theme?: Record<string, unknown>;
  /** Enabled features (e.g. [deliveries, endpoints, playground]) */
  features?: string[];
}

export interface Enable2farequest {
  password: string;
}

/** TOTP secret and QR code URL returned after enabling 2FA */
export interface Enable2faresponse {
  /** TOTP secret key */
  secret: string;
  /** QR code provisioning URL */
  qr_url: string;
}

export interface Endpoint {
  id: Uuid;
  url: string;
  description?: string;
  is_active: boolean;
  retry_policy: Retrypolicy;
  created_at: Datetime;
  /** CIDR blocks or exact IPs */
  allowed_ips?: string[];
  /** Wildcard patterns (e.g. "order.*") */
  event_filter?: string[];
  custom_headers?: Record<string, unknown>;
  routing_strategy: 'round-robin' | 'latency' | 'failover';
  fallback_url?: string;
  avg_response_ms: number;
  failure_streak: number;
  format: 'standard' | 'cloudevents';
}

/** Endpoint health metrics and status */
export interface Endpointhealth {
  endpoint_id: Uuid;
  is_healthy: boolean;
  failure_streak?: number;
  avg_response_ms?: number;
  last_failure_at?: Datetime;
  /** Success rate as a fraction (0.0–1.0) */
  success_rate?: number;
  /** Average delivery latency in milliseconds */
  avg_latency_ms?: number;
  last_delivery_at?: Datetime;
  total_deliveries?: number;
  failed_deliveries?: number;
}

/** Paginated list of endpoints */
export interface Endpointlistresponse {
  data: Endpoint[];
  total: number;
  has_more: boolean;
}

export interface Error {
  /** Human-readable error message */
  error: string;
}

/** A registered event type in the system */
export interface Eventtype {
  id: Uuid;
  /** Event type identifier (e.g. order.created) */
  name: string;
  description?: string;
  /** Associated JSON Schema for payload validation */
  schema_id?: Uuid;
}

/** Event type occurrence count */
export interface Eventtypecount {
  event?: string;
  count: number;
}

/** Paginated list of event types */
export interface Eventtypelistresponse {
  data: Eventtype[];
  has_more: boolean;
  total: number;
}

/** GDPR data export containing all user data */
export interface Exportdataresponse {
  user?: Customerresponse;
  endpoints?: Endpoint[];
  deliveries?: Delivery[];
  teams?: Team[];
  exported_at: Datetime;
}

export interface Featureflag {
  id?: Uuid;
  name?: string;
  description?: string;
  is_enabled?: boolean;
  rollout_percentage?: number;
  enabled_for_plans?: string[];
  created_by?: string;
  created_at?: Datetime;
  updated_at?: Datetime;
}

export interface Forgotpasswordrequest {
  email: string;
}

export interface Inboundconfig {
  id?: Uuid;
  customer_id?: Uuid;
  /** Provider name (stripe, github, shopify, generic) */
  provider?: string;
  /** Webhook signing secret */
  secret?: string;
  endpoint_id?: string;
  enabled?: boolean;
  created_at?: Datetime;
}

/** Raw webhook payload received from an external provider (Stripe, GitHub, etc.) */
export interface Inboundwebhookrequest {
  /** Provider name (e.g. stripe, github, shopify) */
  provider: string;
  /** Raw webhook payload body */
  payload: Record<string, unknown>;
  /** HTTP headers from the incoming webhook request */
  headers?: Record<string, unknown>;
}

/** Result of processing an inbound webhook */
export interface Inboundwebhookresponse {
  id: Uuid;
  /** Processing status of the inbound webhook */
  status: 'accepted' | 'rejected' | 'processing';
  /** The endpoint this webhook was routed to */
  endpoint_id: Uuid;
  received_at: Datetime;
}

/** Invite a new member to a team */
export interface Invitememberrequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface Inviterequest {
  email: string;
  role?: 'admin' | 'member' | 'viewer';
}

/** Paginated list of invoices */
export interface Invoicelistresponse {
  data: Invoiceresponse[];
  has_more: boolean;
  total: number;
}

export interface Invoiceresponse {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: Datetime;
}

/** Latency percentile breakdown for deliveries */
export interface Latencyresponse {
  /** 50th percentile (median) latency in ms */
  p50: number;
  /** 90th percentile latency in ms */
  p90: number;
  /** 95th percentile latency in ms */
  p95: number;
  /** 99th percentile latency in ms */
  p99: number;
  /** Time range of the data */
  period: '24h' | '7d' | '30d';
}

export interface Latencytrendresponse {
  range: string;
  buckets: Record<string, unknown>[];
  overall_avg_ms: number;
}

export interface Loginrequest {
  email: string;
  password: string;
}

/** Optional request body for explicit refresh token invalidation */
export interface Logoutrequest {
  /** Refresh token to invalidate */
  refresh_token: string;
}

export interface Notification {
  id: Uuid;
  title: string;
  body: string;
  is_read: boolean;
  link?: string;
  created_at: Datetime;
}

export interface Notificationlistresponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface Notificationpreferences {
  email_on_failure: boolean;
  email_on_dead_letter: boolean;
  email_on_success: boolean;
  slack_webhook_url?: string;
  discord_webhook_url?: string;
  webhook_url?: string;
}

/** OAuth authorization callback parameters */
export interface Oauthcallbackrequest {
  /** Authorization code from the provider */
  code: string;
  /** CSRF state token */
  state: string;
  redirect_uri?: string;
}

/** OAuth redirect information */
export interface Oauthloginredirect {
  redirect_url: string;
}

/** An available OAuth identity provider */
export interface Oauthprovider {
  id: Uuid;
  /** Provider identifier (e.g. google, github) */
  name: string;
  client_id: string;
  authorize_url: string;
  token_url: string;
}

/** List of available OAuth providers */
export interface Oauthproviderlistresponse {
  data: Oauthprovider[];
}

/** List of static outbound IP addresses for firewall whitelisting */
export interface Outboundipsresponse {
  /** IPv4 and IPv6 addresses used for outbound requests */
  ips: string[];
}

export interface Outboundipsresponse {
  ips: string[];
  updated_at: string;
}

export interface Paginatedusers {
  users: Usersummary[];
  total: number;
  page: number;
  per_page: number;
}

/** Platform-wide configuration settings */
export interface Platformsettings {
  default_plan: string;
  max_endpoints_free: number;
  max_endpoints_pro: number;
  max_webhooks_free: number;
  max_webhooks_pro: number;
  rate_limit_free: number;
  rate_limit_pro: number;
  retry_max_attempts: number;
  retention_days_free: number;
  retention_days_pro: number;
  maintenance_mode: boolean;
  signup_enabled: boolean;
  plan_price_pro: number;
  plan_price_business: number;
  resend_api_key?: string;
  email_sender?: string;
}

/** Test a webhook payload against an endpoint in sandbox */
export interface Playgroundtestrequest {
  endpoint_id: Uuid;
  /** The payload to send */
  payload: Record<string, unknown>;
  /** Custom headers to include with the request */
  headers?: Record<string, unknown>;
}

/** Result of a playground test delivery */
export interface Playgroundtestresponse {
  /** HTTP status code returned by the endpoint */
  status_code: number;
  /** Raw response body from the endpoint */
  response_body: string;
  latency_ms: number;
  /** Response headers from the endpoint */
  headers?: Record<string, unknown>;
}

/** Customer-facing portal branding and configuration */
export interface Portalconfig {
  logo_url?: string;
  /** Hex color code (e.g. */
  primary_color?: string;
  custom_domain?: string;
  /** Event types to expose in the portal */
  webhook_events?: string[];
}

export interface Portalprofile {
  id: Uuid;
  email: string;
  name?: string;
  plan: string;
  created_at: Datetime;
}

/** Temporary session token for the customer portal */
export interface Portalsession {
  token: string;
  expires_at: Datetime;
  /** Full URL to the portal with session token */
  url: string;
}

/** Rate limiting configuration for an endpoint */
export interface Ratelimitconfig {
  /** Maximum requests per second allowed */
  requests_per_second: number;
  /** Maximum burst above steady-state rate */
  burst_size: number;
  enabled: boolean;
}

/** Current rate limit usage for an endpoint */
export interface Ratelimitusage {
  /** Current requests per second being consumed */
  current_rps: number;
  /** Configured requests per second limit */
  limit_rps: number;
  /** Remaining capacity */
  remaining: number;
  reset_at: Datetime;
}

export interface Refreshtokenrequest {
  refresh_token: string;
}

export interface Registerdevicerequest {
  /** FCM device token */
  token: string;
  platform?: 'android' | 'ios' | 'web';
}

export interface Registerrequest {
  email: string;
  password?: string;
  name?: string;
}

export interface Registerschemarequest {
  name: string;
  /** JSON Schema document */
  schema: Record<string, unknown>;
}

/** Result of replaying a delivery */
export interface Replaydeliveryresponse {
  message: string;
  original_id: Uuid;
  new_delivery_id: Uuid;
}

export interface Resendverificationrequest {
  email: string;
}

export interface Resetpasswordrequest {
  token: string;
  new_password: string;
}

export interface Retrypolicy {
  max_attempts: number;
  backoff: 'exponential' | 'linear' | 'fixed';
  initial_delay_secs: number;
  max_delay_secs: number;
}

/** Full revenue analytics response */
export interface Revenueresponse {
  monthly_revenue: Record<string, unknown>[];
  revenue_by_plan: Record<string, unknown>[];
  mrr: number;
  churn_rate: number;
  mrr_trend: number;
}

/** New signing secret after rotation */
export interface Rotatesecretresponse {
  /** New endpoint signing secret */
  secret: string;
}

export interface Routinginfo {
  endpoint_id: Uuid;
  routing_strategy: string;
  fallback_url?: string;
  avg_response_ms: number;
  failure_streak: number;
  is_healthy: boolean;
}

/** List of routing rules */
export interface Routingrulelistresponse {
  data: Record<string, unknown>[];
}

/** Single Sign-On configuration (SAML or OIDC) */
export interface Ssoconfig {
  provider: 'saml' | 'oidc';
  /** Email domain for SSO routing */
  domain: string;
  /** SAML entity ID or OIDC issuer */
  entity_id?: string;
  sso_url?: string;
  /** PEM-encoded X.509 certificate (SAML) */
  certificate?: string;
}

/** List of SSO configurations for the account */
export interface Ssoconfiglistresponse {
  data: Ssoconfig[];
}

/** Paginated list of registered schemas */
export interface Schemalistresponse {
  data: Schemaresponse[];
  has_more: boolean;
  total: number;
}

/** A registered JSON Schema for event validation */
export interface Schemaresponse {
  id: Uuid;
  name: string;
  version: number;
  /** The JSON Schema document */
  schema_json: Record<string, unknown>;
  created_at: Datetime;
}

/** Search request for webhook deliveries */
export interface Searchrequest {
  /** Search query string */
  query: string;
  /** Additional filters (status, endpoint_id, etc.) */
  filters?: Record<string, unknown>;
  page?: number;
  per_page?: number;
}

/** Search results for webhook deliveries */
export interface Searchresponse {
  deliveries: Delivery[];
  total: number;
  page: number;
  per_page: number;
  has_more?: boolean;
}

export interface Searchresult {
  deliveries: Delivery[];
  total: number;
}

export interface Servicetoken {
  id?: Uuid;
  name?: string;
  /** Token prefix (first 24 chars + ...) */
  token_prefix?: string;
  created_at?: Datetime;
  last_used_at?: string;
  is_active?: boolean;
}

export interface Servicetokencreateresponse {
  id?: Uuid;
  name?: string;
  /** Full token value (only shown once) */
  token?: string;
  token_prefix?: string;
  message?: string;
}

/** Send a simulated webhook event */
export interface Simulatorrequest {
  endpoint_id: Uuid;
  /** Event type to simulate (e.g. order.created) */
  event_type: string;
  /** The webhook payload to deliver */
  payload: Record<string, unknown>;
  /** Artificial delay before delivery (for testing timeouts) */
  delay_ms?: number;
}

/** Result of a simulated webhook delivery */
export interface Simulatorresponse {
  delivery_id: Uuid;
  status: 'delivered' | 'failed' | 'pending';
  /** Response time from the endpoint */
  latency_ms: number;
}

export interface Statsresponse {
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  total_endpoints: number;
  active_endpoints: number;
  plan: string;
  webhook_limit: number;
  webhook_count: number;
}

export interface Streamparams {
  endpoint_id: Uuid;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  limit: number;
}

export interface Subscriptionresponse {
  plan: string;
  status: string;
  payment_provider: string;
  webhook_limit: number;
  endpoint_limit: number;
  retention_days: number;
  monthly_price_cents: number;
}

export interface Successrateresponse {
  range: string;
  successful: number;
  failed: number;
  pending: number;
  success_rate: number;
}

export interface Systemstats {
  total_users: number;
  active_users: number;
  total_endpoints: number;
  total_deliveries: number;
  plan_breakdown: Record<string, unknown>[];
}

export interface Systemstatus {
  overall_status: 'operational' | 'degraded' | 'down';
  uptime_30d: number;
  components: Record<string, unknown>[];
  checked_at: string;
}

export interface Team {
  id: Uuid;
  name: string;
  created_at: Datetime;
}

export interface Teamdetailresponse {
  team: Team;
  members: Teammember[];
  invites: Teaminvite[];
}

export interface Teaminvite {
  id: Uuid;
  email: string;
  role: string;
  created_at: Datetime;
}

/** Paginated list of teams */
export interface Teamlistresponse {
  data: Team[];
  has_more: boolean;
  total: number;
}

export interface Teammember {
  id: Uuid;
  user_id: Uuid;
  email: string;
  name?: string;
  role: string;
  joined_at: Datetime;
}

/** List of members in a team */
export interface Teammemberlistresponse {
  data: Teammember[];
}

/** Paginated list of webhook payload templates */
export interface Templatelistresponse {
  data: Webhooktemplate[];
}

export interface Testwebhookrequest {
  endpoint_id: Uuid;
  payload: Record<string, unknown>;
  event?: string;
}

export interface Testwebhookresponse {
  success: boolean;
  status_code: number;
  duration_ms: number;
  response_body: string;
}

export interface Transformrule {
  id: Uuid;
  endpoint_id: Uuid;
  name: string;
  rule_type: string;
  config?: Record<string, unknown>;
  is_active: boolean;
  created_at: Datetime;
}

/** Paginated list of transform rules */
export interface Transformrulelistresponse {
  data: Transformrule[];
}

export interface Twofactorrequiredresponse {
  requires_2fa: boolean;
  temp_token: string;
  message: string;
}

/** Request to update an existing alert rule (all fields optional) */
export interface Updatealertrulerequest {
  name: string;
  condition: 'failure_rate' | 'latency' | 'consecutive_failures';
  threshold: number;
  channels: 'slack' | 'email' | 'webhook'[];
}

export interface Updateendpointrequest {
  url: string;
  description: string;
  is_active: boolean;
  allowed_ips: string[];
  event_filter: string[];
  custom_headers?: Record<string, unknown>;
  retry_policy: Retrypolicy;
  routing_strategy: 'round-robin' | 'latency' | 'failover';
  fallback_url: string;
  format: 'standard' | 'cloudevents';
}

export interface Updatenotificationpreferences {
  email_on_failure: boolean;
  email_on_dead_letter: boolean;
  email_on_success: boolean;
  slack_webhook_url?: string;
  discord_webhook_url?: string;
  webhook_url?: string;
}

export interface Updateprofilerequest {
  name: string;
  email: string;
}

export interface Updateroutingrequest {
  routing_strategy: 'round-robin' | 'latency' | 'failover';
  fallback_url: string;
}

/** Update an existing routing rule (all fields optional) */
export interface Updateroutingrulerequest {
  name: string;
  conditions?: Record<string, unknown>;
  transform?: Record<string, unknown>;
}

/** Update an SSO configuration (all fields optional) */
export interface Updatessoconfigrequest {
  provider: 'saml' | 'oidc';
  domain: string;
}

/** Request to change subscription plan */
export interface Updatesubscriptionrequest {
  /** Target plan name */
  plan: 'free' | 'pro' | 'business';
  /** Whether to prorate charges for the current billing period */
  proration?: boolean;
}

/** Fields to update on a team (all optional) */
export interface Updateteamrequest {
  name: string;
  description: string;
}

/** Update an existing transform rule (all fields optional) */
export interface Updatetransformrulerequest {
  name: string;
  /** Updated transformation configuration */
  config?: Record<string, unknown>;
}

export interface Upgraderequest {
  plan: 'pro' | 'business';
  provider?: 'stripe' | 'polar' | 'iyzico';
}

export interface Upgraderesponse {
  checkout_url?: string;
  provider: string;
  message: string;
}

export interface Usageresponse {
  plan: string;
  period_start: Datetime;
  period_end: Datetime;
  webhooks_used: number;
  webhooks_limit: number;
  endpoints_used: number;
  endpoints_limit: number;
}

/** Account usage statistics summary */
export interface Usagestatsresponse {
  /** Number of active endpoints */
  endpoints_count: number;
  /** Total deliveries in current period */
  deliveries_count: number;
  /** Number of teams */
  teams_count: number;
  /** Storage used in bytes */
  storage_used_bytes: number;
}

/** User analytics data for admin view */
export interface Useranalytics {
  daily_deliveries: Dailydeliverycount[];
  top_events: Eventtypecount[];
  endpoint_health: Endpointhealth[];
}

export interface Usersummary {
  id: Uuid;
  email: string;
  name?: string;
  plan: string;
  is_active: boolean;
  created_at: Datetime;
}

export interface Validateeventrequest {
  event: Record<string, unknown>;
}

/** Result of validating an event payload against a schema */
export interface Validateeventresponse {
  valid: boolean;
  errors?: Record<string, unknown>[];
}

export interface Verify2farequest {
  temp_token: string;
  code: string;
}

/** Result of domain verification attempt */
export interface Verifycustomdomainresponse {
  status: 'verified' | 'pending' | 'failed';
  /** DNS records that need to be configured */
  dns_records: Domaindnsrecord[];
}

export interface Verifyemailrequest {
  token: string;
}

/** Query parameters for filtering webhook deliveries */
export interface Webhookfilter {
  /** Filter by delivery status */
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  endpoint_id: Uuid;
  /** Filter by event type (e.g. order.created) */
  event_type: string;
  from_date: Datetime;
  to_date: Datetime;
  page: number;
  per_page: number;
}

export interface Webhooktemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  payload_template?: Record<string, unknown>;
}
