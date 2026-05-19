// Auto-generated types from api.ts
// Do not edit manually — edit api.ts and re-run split

export interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export interface Application {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  endpoint_count: number;
  created_at: string;
  updated_at: string;
}

export interface RetryPolicyConfig {
  max_attempts: number;
  backoff: string;
  initial_delay_secs: number;
  max_delay_secs: number;
}

export interface Endpoint {
  id: string;
  url: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  routing_strategy?: string | null;
  fallback_url?: string | null;
  avg_response_ms?: number | null;
  failure_streak?: number | null;
  retry_policy?: RetryPolicyConfig | null;
  signing_secret?: string | null;
  event_filter?: string[] | null;
  custom_headers?: Record<string, string> | null;
  application_id?: string | null;
  format?: string | null;
}

export interface Delivery {
  id: string;
  endpoint_id: string;
  event?: string;
  status: "pending" | "delivered" | "failed";
  attempt_count: number;
  response_status?: number;
  created_at: string;
}

export interface DeliveryDetail extends Delivery {
  request_headers?: Record<string, string>;
  request_body?: string | Record<string, unknown>;
  endpoint_url?: string;
  updated_at?: string;
  error_message?: string;
}

export interface DeliveryAttempt {
  id: string;
  delivery_id: string;
  attempt_number: number;
  status: 'delivered' | 'failed';
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  error_message?: string;
  duration_ms?: number;
  created_at: string;
}

export interface DeliveryListResponse {
  deliveries: Delivery[];
  total: number;
  page: number;
  per_page: number;
}

export interface StatsResponse {
  total_deliveries: number;
  delivered: number;
  failed: number;
  pending: number;
  success_rate: number;
  endpoints_count: number;
}

export interface AdminStatsResponse {
  total_users: number;
  total_deliveries: number;
  total_revenue: number;
  active_users_today: number;
  total_endpoints: number;
  active_endpoints: number;
  users_by_plan: { plan: string; count: number }[];
  recent_signups: { id: string; email: string; name?: string; plan: string; created_at: string }[];
  trends: {
    total_users_yesterday: number;
    total_deliveries_yesterday: number;
    revenue_yesterday: number;
    active_users_yesterday: number;
    active_webhooks: number;
  };
}

export interface DeployInfo {
  version: string;
  git_commit?: string;
  build_time?: string;
  environment: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  per_page: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string | null;
  plan: string;
  role: string;
  status: 'active' | 'banned';
  created_at: string;
  is_active?: boolean | null;
  is_admin?: boolean | null;
  total_deliveries?: number | null;
  total_endpoints?: number | null;
}

export interface AdminUserDetail {
  user: AdminUser;
  endpoints: { id: string; url: string; is_active: boolean; created_at: string }[];
  recent_deliveries: Delivery[];
  usage_stats: { total_deliveries: number; success_rate: number; endpoints_count: number };
}

export interface RevenueResponse {
  monthly_revenue: { month: string; revenue: number }[];
  revenue_by_plan: { plan: string; revenue: number; count: number }[];
  mrr: number;
  churn_rate: number;
  mrr_trend: number;
  collected_revenue: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  created_at: string;
  updated_at?: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  customer_id: string;
  email: string;
  name?: string;
  role: 'admin' | 'editor' | 'viewer';
  invited_at: string;
  joined_at: string | null;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
}

export interface TeamDetailResponse {
  id: string;
  name: string;
  owner_id: string;
  members: TeamMember[];
  invites: TeamInvite[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  type: 'webhook_failed' | 'alert' | 'system' | 'billing' | 'team_invite';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  per_page: number;
}

// Broadcast types
export interface Broadcast {
  id: string;
  title: string;
  message: string;
  broadcast_type: 'maintenance' | 'feature' | 'announcement' | 'incident';
  severity: 'info' | 'warning' | 'critical';
  link: string | null;
  link_text: string | null;
  target_plan: string | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserBroadcast {
  id: string;
  title: string;
  message: string;
  broadcast_type: string;
  severity: string;
  link: string | null;
  link_text: string | null;
  created_at: string;
}

export interface BroadcastListResponse {
  broadcasts: Broadcast[];
  total: number;
  page: number;
  per_page: number;
}

export interface TimeBucket {
  timestamp: string;
  successful: number;
  failed: number;
  total: number;
}

export interface DeliveryTrendResponse {
  range: string;
  buckets: TimeBucket[];
}

export interface SuccessRateData {
  range: string;
  successful: number;
  failed: number;
  pending: number;
  success_rate: number;
}

export interface LatencyBucket {
  timestamp: string;
  avg_ms: number;
  p95_ms: number;
}

export interface LatencyTrendResponse {
  range: string;
  buckets: LatencyBucket[];
  overall_avg_ms: number;
}

export interface AuditLogEntry {
  id: string;
  customer_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  per_page: number;
}

export interface AuditLogEntryResponse {
  id: string;
  timestamp: string;
  actor: string;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  user_agent: string;
}

export interface EndpointHealthResponse {
  id: string;
  url: string;
  description: string | null;
  is_active: boolean;
  health_status: string;
  success_rate: number;
  avg_response_ms: number;
  p95_response_ms: number;
  total_deliveries: number;
  successful: number;
  failed: number;
  consecutive_failures: number;
  last_failure_at: string | null;
  uptime_24h: number;
}

export interface ApiKeyResponse {
  id: string;
  name: string | null;
  api_key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface PortalConfigResponse {
  id?: string;
  company_name?: string;
  logo_url?: string | null;
  primary_color?: string;
  font_family?: string;
  dark_mode?: boolean;
  show_events?: boolean;
  show_deliveries?: boolean;
  allowed_events?: string[];
  custom_css?: string;
}

export interface PortalEmbedCodeResponse {
  iframe?: string;
  portal_url?: string;
  react?: string;
  script?: string;
}

export interface PortalProfileResponse {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
}

export interface PortalUsageResponse {
  total_deliveries: number;
  total_endpoints: number;
  success_rate: number;
  period_start: string;
  period_end: string;
}

export interface RateLimitResponse {
  endpoint_id: string;
  requests_per_second: number;
  burst_size: number;
  enabled: boolean;
}

export interface SchemaRegistryItem {
  id: string;
  name: string;
  description: string | null;
  schema: unknown;
  version: number;
  created_at: string;
}

export interface SchemaRegistryListResponse {
  schemas: SchemaRegistryItem[];
}

export interface SearchResult {
  id: string;
  event: string | null;
  status: string;
  attempt_count: number;
  response_status: number | null;
  created_at: string;
  endpoint_url: string;
}

export interface SearchResponseData {
  deliveries: SearchResult[];
  total: number;
  page: number;
  per_page: number;
  query: string;
}

export interface ServiceTokenResponse {
  id: string;
  name: string;
  token_prefix: string;
  token?: string; // only present on creation
  created_at: string;
  last_used_at: string | null;
}

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  industry?: string;
  event_types: string[];
  endpoint_count?: number;
}

export interface TemplateListResponse {
  templates: TemplateItem[];
}

export interface UserAnalytics {
  daily_deliveries: { date: string; total: number; success: number; failed: number }[];
  top_events: { event: string; count: number }[];
  endpoint_health: { url: string; success_rate: number; avg_latency_ms: number }[];
}

export interface ChurnUser {
  id: string;
  email: string;
  name?: string;
  plan: string;
  amount: number;
  churn_date: string;
}

export interface AlertRuleAdmin {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
  is_active: boolean;
  customer_id?: string | null;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  enabled_for_plans: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  default_plan: string;
  // Per-plan limits
  max_endpoints_free: number;
  max_endpoints_startup: number;
  max_endpoints_pro: number;
  max_endpoints_enterprise: number;
  max_webhooks_free: number;
  max_webhooks_startup: number;
  max_webhooks_pro: number;
  max_webhooks_enterprise: number;
  rate_limit_free: number;
  rate_limit_startup: number;
  rate_limit_pro: number;
  rate_limit_enterprise: number;
  retention_days_free: number;
  retention_days_startup: number;
  retention_days_pro: number;
  retention_days_enterprise: number;
  retry_max_attempts: number;
  maintenance_mode: boolean;
  signup_enabled: boolean;
  // Per-plan prices
  plan_price_startup: number;
  plan_price_pro: number;
  plan_price_enterprise: number;
  plan_price_business: number; // backward compat
  resend_api_key: string | null;
  email_sender: string | null;
  webhook_secret: string | null;
  backup_retention_days: number;
  global_rate_limit: number;
  cors_origins: string | null;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
  is_active: boolean;
  created_at: string;
}

export interface InboundConfig {
  id: string;
  provider: string;
  endpoint_id: string | null;
  enabled: boolean;
  secret: string;
  created_at: string;
}

export interface TransformRule {
  id: string;
  endpoint_id: string;
  rule_json: {
    filter?: { include?: string[]; exclude?: string[] };
    mappings?: { source: string; target: string }[];
    enrich?: { fields: Record<string, unknown> };
  };
  created_at: string;
}

export interface BillingUsage {
  deliveries_used: number;
  deliveries_limit: number;
  endpoints_count: number;
  endpoints_limit: number;
  // Backend returns nested objects — these are computed at fetch time
  webhooks?: { used: number; limit: number; remaining: number };
  endpoints?: { used: number; limit: number; remaining: number };
  plan?: string;
}

export interface BillingSubscription {
  plan: string;
  status: string;
  payment_provider: string;
  stripe_subscription_id?: string;
  polar_subscription_id?: string;
  iyzico_subscription_id?: string;
  webhook_limit: number;
  endpoint_limit: number;
  retention_days: number;
  monthly_price_cents: number;
  cancel_at_period_end: boolean;
  billing_period: string;
  current_period_end?: string;
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  paused_at?: string;
  paused_until?: string;
  pause_plan?: string;
}

export interface OverageSettings {
  allow_overage: boolean;
  overage_email_notification: boolean;
  plan: string;
  daily_limit: number;
  overage_price: number;
}

export interface PortalResponse {
  url: string;
  provider: string;
}

export interface RefundResponse {
  message: string;
  status: string;
}
