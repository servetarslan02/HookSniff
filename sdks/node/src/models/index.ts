/**
 * HookSniff SDK — API Models
 *
 * Generated from HookSniff OpenAPI spec.
 * These represent the request/response types for the HookSniff API.
 */

// ─── Common ────────────────────────────────────────────────────────

export interface RetryPolicy {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
}

// ─── Auth ──────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: CustomerResponse;
}

export interface TwoFactorRequiredResponse {
  requires_2fa: boolean;
  temp_token: string;
}

export interface CustomerResponse {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  is_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  api_key_prefix: string;
  webhook_count: number;
  team_count: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface Verify2faRequest {
  code: string;
}

export interface Enable2faRequest {
  password: string;
}

export interface Confirm2faRequest {
  code: string;
}

export interface Disable2faRequest {
  code: string;
  password: string;
}

export interface Enable2faResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export interface UpdateProfileRequest {
  name?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ExportDataResponse {
  data: unknown;
  exported_at: string;
  format: string;
}

// ─── Endpoints ─────────────────────────────────────────────────────

export interface Endpoint {
  id: string;
  url: string;
  description: string | null;
  is_active: boolean;
  retry_policy: RetryPolicy;
  created_at: string;
  allowed_ips: string[] | null;
  event_filter: string[] | null;
  custom_headers: Record<string, string> | null;
  routing_strategy: "round-robin" | "latency" | "failover";
  fallback_url: string | null;
  avg_response_ms: number;
  failure_streak: number;
  format: "standard" | "cloudevents";
}

export interface EndpointListResponse {
  data: Endpoint[];
  iterator?: string | null;
  done?: boolean;
}

export interface CreateEndpointRequest {
  url: string;
  description?: string;
  is_active?: boolean;
  retry_policy?: Partial<RetryPolicy>;
  allowed_ips?: string[];
  event_filter?: string[];
  custom_headers?: Record<string, string>;
  routing_strategy?: "round-robin" | "latency" | "failover";
  fallback_url?: string;
  format?: "standard" | "cloudevents";
}

export interface UpdateEndpointRequest {
  url?: string;
  description?: string;
  is_active?: boolean;
  retry_policy?: Partial<RetryPolicy>;
  allowed_ips?: string[];
  event_filter?: string[];
  custom_headers?: Record<string, string>;
  routing_strategy?: "round-robin" | "latency" | "failover";
  fallback_url?: string;
  format?: "standard" | "cloudevents";
}

export interface RotateSecretResponse {
  secret: string;
  rotated_at: string;
}

// ─── Webhooks / Deliveries ─────────────────────────────────────────

export interface CreateWebhookRequest {
  endpoint_id: string;
  event: string;
  data: Record<string, unknown>;
  metadata?: Record<string, string>;
}

export interface BatchWebhookRequest {
  webhooks: CreateWebhookRequest[];
}

export interface Delivery {
  id: string;
  endpoint_id: string;
  event: string;
  status: "pending" | "processing" | "delivered" | "failed" | "retrying";
  attempts: number;
  max_attempts: number;
  next_retry_at: string | null;
  response_status: number | null;
  response_body: string | null;
  created_at: string;
  delivered_at: string | null;
  duration_ms: number | null;
  payload_size: number;
}

export interface DeliveryListResponse {
  data: Delivery[];
  iterator?: string | null;
  done?: boolean;
}

export interface BatchResponse {
  results: Array<{
    id: string;
    status: string;
    error?: string;
  }>;
  success_count: number;
  failure_count: number;
}

export interface DeliveryAttempt {
  id: string;
  delivery_id: string;
  attempt_number: number;
  status: "success" | "failed" | "timeout";
  response_status: number | null;
  response_body: string | null;
  request_headers: Record<string, string> | null;
  request_body: string | null;
  duration_ms: number;
  created_at: string;
  error_message: string | null;
}

export interface BatchReplayRequest {
  delivery_ids: string[];
}

// ─── API Keys ──────────────────────────────────────────────────────

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  scopes: string[];
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
  name: string;
  prefix: string;
  created_at: string;
}

// ─── Teams ─────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  created_at: string;
  member_count: number;
  endpoint_count: number;
}

export interface TeamDetailResponse extends Team {
  members: TeamMember[];
  pending_invites: TeamInvite[];
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: "admin" | "member";
  created_at: string;
  expires_at: string;
}

export interface CreateTeamRequest {
  name: string;
}

export interface InviteRequest {
  email: string;
  role?: "admin" | "member";
}

export interface ChangeRoleRequest {
  role: "admin" | "member";
}

// ─── Alerts ────────────────────────────────────────────────────────

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  window_minutes: number;
  is_active: boolean;
  notification_channels: string[];
  created_at: string;
}

export interface CreateAlertRequest {
  name: string;
  condition: string;
  threshold: number;
  window_minutes: number;
  notification_channels?: string[];
}

// ─── Notifications ─────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  unread_count: number;
}

export interface RegisterDeviceRequest {
  token: string;
  platform: "ios" | "android" | "web";
  device_name?: string;
}

export interface DeviceTokenResponse {
  id: string;
  token: string;
  platform: string;
  device_name: string | null;
  created_at: string;
}

// ─── Billing ───────────────────────────────────────────────────────

export interface SubscriptionResponse {
  plan: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_provider: string | null;
  portal_url: string | null;
  limits: {
    endpoints: number;
    deliveries_per_month: number;
    team_members: number;
    rate_limit_per_second: number;
  };
}

export interface UpgradeRequest {
  plan: string;
  payment_method?: string;
}

export interface UpgradeResponse {
  checkout_url: string;
  session_id: string;
}

export interface UsageResponse {
  period_start: string;
  period_end: string;
  deliveries_used: number;
  deliveries_limit: number;
  endpoints_used: number;
  endpoints_limit: number;
  overage: {
    deliveries: number;
    cost_cents: number;
  };
}

export interface InvoiceResponse {
  id: string;
  amount_cents: number;
  currency: string;
  status: "paid" | "open" | "void";
  created_at: string;
  pdf_url: string | null;
}

// ─── Analytics ─────────────────────────────────────────────────────

export interface StatsResponse {
  total_deliveries: number;
  success_rate: number;
  avg_latency_ms: number;
  active_endpoints: number;
  period: string;
}

export interface AnalyticsTrendPoint {
  date: string;
  value: number;
}

export interface AnalyticsTrendResponse {
  data: AnalyticsTrendPoint[];
  metric: string;
  period: string;
}

export interface SuccessRateResponse {
  overall: number;
  by_endpoint: Array<{
    endpoint_id: string;
    url: string;
    rate: number;
  }>;
}

export interface LatencyTrendResponse {
  data: AnalyticsTrendPoint[];
  p50: number;
  p95: number;
  p99: number;
}

export interface DeliveryTrendResponse {
  data: AnalyticsTrendPoint[];
  total: number;
}

// ─── Search ────────────────────────────────────────────────────────

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string;
  url: string;
  score: number;
}

// ─── Templates ─────────────────────────────────────────────────────

export interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  event: string;
  payload_schema: Record<string, unknown>;
  created_at: string;
}

export interface ApplyTemplateRequest {
  endpoint_id: string;
  template_id: string;
  variables?: Record<string, string>;
}

export interface ApplyTemplateResponse {
  applied: boolean;
  template_id: string;
  endpoint_id: string;
}

// ─── Routing ───────────────────────────────────────────────────────

export interface RoutingInfo {
  strategy: string;
  endpoints: Array<{
    id: string;
    url: string;
    weight: number;
    is_active: boolean;
  }>;
  fallback_url: string | null;
}

export interface UpdateRoutingRequest {
  strategy: "round-robin" | "latency" | "failover";
  fallback_url?: string;
}

// ─── Endpoint Health ───────────────────────────────────────────────

export interface EndpointHealth {
  endpoint_id: string;
  url: string;
  status: "healthy" | "degraded" | "down";
  uptime_percentage: number;
  avg_response_ms: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  failure_streak: number;
  recent_attempts: number;
  recent_failures: number;
}

// ─── Transforms ────────────────────────────────────────────────────

export interface TransformRule {
  id: string;
  name: string;
  source_event: string;
  target_format: string;
  expression: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateTransformRuleRequest {
  name: string;
  source_event: string;
  target_format: string;
  expression: string;
  is_active?: boolean;
}

// ─── Contact ───────────────────────────────────────────────────────

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// ─── Misc ──────────────────────────────────────────────────────────

export interface OutboundIpsResponse {
  ips: string[];
}

export interface SystemStatus {
  status: "operational" | "degraded" | "down";
  version: string;
  uptime_seconds: number;
  database: string;
  redis: string;
  region: string;
}

export interface NotificationPreferences {
  email_deliveries: boolean;
  email_failures: boolean;
  email_weekly_digest: boolean;
  push_deliveries: boolean;
  push_failures: boolean;
}

export interface UpdateNotificationPreferences {
  email_deliveries?: boolean;
  email_failures?: boolean;
  email_weekly_digest?: boolean;
  push_deliveries?: boolean;
  push_failures?: boolean;
}

export interface PortalProfile {
  customer_id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
}

export interface TestWebhookRequest {
  endpoint_id: string;
  event?: string;
  data?: Record<string, unknown>;
}

export interface TestWebhookResponse {
  delivery_id: string;
  status: string;
  response_status: number;
  duration_ms: number;
}

// ─── Admin ─────────────────────────────────────────────────────────

export interface AdminAlertRule extends AlertRule {
  customer_id: string;
  customer_email: string;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  actor: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
}

export interface AdminAuditLogResponse {
  data: AdminAuditEntry[];
  total: number;
}

export interface AdminRevenueEntry {
  date: string;
  revenue_cents: number;
  new_subscriptions: number;
  cancellations: number;
  mrr_cents: number;
}

export interface AdminRevenueResponse {
  data: AdminRevenueEntry[];
  total_revenue_cents: number;
  mrr_cents: number;
}

export interface AdminSystemStatus extends SystemStatus {
  total_customers: number;
  total_endpoints: number;
  total_deliveries_today: number;
  queue_depth: number;
}

export interface AdminCreateAlertRequest {
  name: string;
  condition: string;
  threshold: number;
  window_minutes: number;
  notification_channels?: string[];
  customer_id?: string;
}

export interface AdminUpdateAlertRequest {
  name?: string;
  condition?: string;
  threshold?: number;
  window_minutes?: number;
  notification_channels?: string[];
  is_active?: boolean;
}

export interface AdminTestWebhookRequest {
  endpoint_id: string;
  event?: string;
  data?: Record<string, unknown>;
}

export interface AdminTestWebhookResponse {
  delivery_id: string;
  status: string;
  response_status: number;
  duration_ms: number;
}

export interface BillingPortalResponse {
  url: string;
}

export interface ResendVerificationRequest {
  email?: string;
}

// ─── Ordering ──────────────────────────────────────────────────────

export type Ordering = "ascending" | "descending";
