import { getUserFriendlyMessage, extractErrorCode } from './error-catalog';

// In production, "https://hooksniff-api-1046140057667.europe-west1.run.app/v1" is rewritten by Vercel to the GCP Cloud Run API (see vercel.json).
// In development, point directly to the local API server.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? "https://hooksniff-edge-proxy.servetarslan02.workers.dev/v1" : "http://localhost:3000/v1");

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

/** Check if the browser is offline before making requests (Item 169) */
function assertOnline(): void {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    throw new Error('You appear to be offline. Please check your connection and try again.');
  }
}

// Shared refresh promise — prevents multiple concurrent 401s from
// each firing their own refresh request (Item 138).
let refreshPromise: Promise<boolean> | null = null;

function doRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getCSRFHeaders('POST') },
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function isTransientError(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// CSRF protection: For mutating requests, ensure Origin matches the site.
// This is a defense-in-depth measure alongside cookie-based auth.
// Browsers send Origin automatically; attackers cannot spoof it cross-origin.
function getCSRFHeaders(method: string): Record<string, string> {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    if (typeof window !== 'undefined') {
      return {
        'Origin': window.location.origin,
      };
    }
  }
  return {};
}

export interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token, signal } = options;

  assertOnline(); // Item 169 — fail fast if offline

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getCSRFHeaders(method),
  };

  if (token && token !== 'cookie') {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  void setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // If caller provided an external signal, forward its abort
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        // Auto-logout on 401 (token expired or invalid)
        if (res.status === 401 && typeof window !== 'undefined') {
          const refreshed = await doRefresh();
          if (refreshed) {
            // Refresh succeeded — retry the original request once
            const retryRes = await fetch(`${API_BASE}${path}`, {
              method,
              headers,
              credentials: 'include',
              body: body ? JSON.stringify(body) : undefined,
              signal: controller.signal,
            });
            if (retryRes.ok) {
              return retryRes.json();
            }
          }
          // Refresh failed — clear auth and redirect
          localStorage.removeItem('hooksniff_auth');
          window.location.href = '/login';
        }

        // Retry transient errors (502, 503, 504) with exponential backoff
        if (isTransientError(res.status) && attempt < MAX_RETRIES) {
          await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
          continue;
        }

        const error = await res.json().catch(() => ({ message: `API error: ${res.status}` }));
        // Item 282: Use error catalog for user-friendly messages
        const errorCode = extractErrorCode(error);
        const message = errorCode
          ? getUserFriendlyMessage(errorCode)
          : (error.error?.message || `API error: ${res.status}`);
        throw new Error(message);
      }

      return res.json();
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.', { cause: err });
      }
      lastError = err;
      // Don't retry non-network errors (already parsed API errors)
      if (err instanceof Error && err.message.startsWith('API error:')) {
        throw err;
      }
      // Network error — retry with backoff
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// Application API (Hook0-style)
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

export const applicationsApi = {
  list: (token: string) =>
    apiFetch<Application[]>("/applications", { token }),
  get: (token: string, id: string) =>
    apiFetch<Application>(`/applications/${id}`, { token }),
  create: (token: string, data: { name: string; description?: string }) =>
    apiFetch<Application>("/applications", { method: "POST", body: data, token }),
  update: (token: string, id: string, data: { name?: string; description?: string; is_active?: boolean }) =>
    apiFetch<Application>(`/applications/${id}`, { method: "PUT", body: data, token }),
  delete: (token: string, id: string) =>
    apiFetch<{ message: string }>(`/applications/${id}`, { method: "DELETE", token }),
};

// Endpoint API
export interface RetryPolicyConfig {
  max_attempts: number;
  backoff: string;
  initial_delay_secs: number;
  max_delay_secs: number;
}

export const endpointsApi = {
  list: (token: string) =>
    apiFetch<Endpoint[]>("/endpoints", { token }),

  get: (token: string, id: string) =>
    apiFetch<Endpoint>(`/endpoints/${id}`, { token }),

  create: (token: string, data: { url: string; description?: string }) =>
    apiFetch<Endpoint>("/endpoints", { method: "POST", body: data, token }),

  update: (token: string, id: string, data: Partial<Endpoint> & { retry_policy?: RetryPolicyConfig }) =>
    apiFetch<Endpoint>(`/endpoints/${id}`, { method: "PUT", body: data, token }),

  updateRetryPolicy: (token: string, id: string, policy: RetryPolicyConfig) =>
    apiFetch<Endpoint>(`/endpoints/${id}/retry-policy`, { method: "PUT", body: policy, token }),

  delete: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/endpoints/${id}`, { method: "DELETE", token }),

  rotateSecret: (token: string, id: string) =>
    apiFetch<{ secret: string }>(`/endpoints/${id}/rotate-secret`, { method: "POST", token }),
};

// Webhook API
export const webhooksApi = {
  list: (token: string, params?: { page?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return apiFetch<DeliveryListResponse>(`/webhooks${qs ? `?${qs}` : ""}`, { token });
  },

  create: (token: string, data: { endpoint_id: string; event?: string; data: unknown }) =>
    apiFetch<Delivery>("/webhooks", { method: "POST", body: data, token }),

  get: (token: string, id: string) =>
    apiFetch<DeliveryDetail>(`/webhooks/${id}/details`, { token }),

  getAttempts: (token: string, id: string) =>
    apiFetch<DeliveryAttempt[]>(`/webhooks/${id}/attempts`, { token }),

  replay: (token: string, id: string) =>
    apiFetch<Delivery>(`/webhooks/${id}/replay`, { method: 'POST', token }),


  batchReplay: (token: string, ids: string[]) =>
    apiFetch<{ replayed: number }>('/webhooks/batch/replay', { method: 'POST', body: { ids }, token }),
};

// Stats API
export const statsApi = {
  get: (token: string) =>
    apiFetch<StatsResponse>("/stats", { token }),
};

// Auth API

// Generic API client (axios-style wrapper — returns { data } for compatibility)
export const api = {
  get: async <T = unknown>(path: string, token?: string) => ({ data: await apiFetch<T>(path, { token }) }),
  post: async <T = unknown>(path: string, body?: unknown, token?: string) => ({ data: await apiFetch<T>(path, { method: 'POST', body, token }) }),
  put: async <T = unknown>(path: string, body?: unknown, token?: string) => ({ data: await apiFetch<T>(path, { method: 'PUT', body, token }) }),
  delete: async <T = unknown>(path: string, token?: string) => ({ data: await apiFetch<T>(path, { method: 'DELETE', token }) }),

  getAuditLog: (token: string, params?: { page?: number; limit?: number; action?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.action) qs.set('action', params.action);
    return apiFetch<{ entries: AuditLogEntryResponse[]; has_more: boolean }>(`/audit-log${qs.toString() ? `?${qs}` : ''}`, { token });
  },

  getEndpointHealth: (token?: string) =>
    apiFetch<EndpointHealthResponse[]>('/endpoint-health', { token: token || undefined }),

  getApiKeys: (token: string) =>
    apiFetch<ApiKeyResponse[]>('/api-keys', { token }),
  createApiKey: (token: string, name: string) =>
    apiFetch<{ key: string }>('/api-keys', { method: 'POST', body: { name }, token }),
  deleteApiKey: (token: string, id: string) =>
    apiFetch(`/api-keys/${id}`, { method: 'DELETE', token }),
  rotateApiKey: (token: string, id: string) =>
    apiFetch<{ key: string }>(`/api-keys/${id}/rotate`, { method: 'POST', token }),

  getPortalConfig: (token: string) =>
    apiFetch<PortalConfigResponse>('/portal/config', { token }),
  getPortalEmbedCode: (token: string) =>
    apiFetch<PortalEmbedCodeResponse>('/portal/embed-code', { token }),
  updatePortalConfig: (token: string, config: Partial<PortalConfigResponse>) =>
    apiFetch('/portal/config', { method: 'POST', body: config, token }),
  getPortalProfile: (token: string) =>
    apiFetch<PortalProfileResponse>('/portal/me', { token }),
  getPortalUsage: (token: string) =>
    apiFetch<PortalUsageResponse>('/portal/usage', { token }),

  getRateLimits: (token: string) =>
    apiFetch<RateLimitResponse[]>('/rate-limits', { token }),
  setRateLimit: (token: string, endpointId: string, config: { requests_per_second: number; burst_size: number; enabled: boolean }) =>
    apiFetch(`/rate-limits/${endpointId}`, { method: 'POST', body: config, token }),
  deleteRateLimit: (token: string, endpointId: string) =>
    apiFetch(`/rate-limits/${endpointId}`, { method: 'DELETE', token }),

  getSchemas: (token: string) =>
    apiFetch<SchemaRegistryListResponse>('/schemas', { token }),

  search: (token: string, params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<SearchResponseData>(`/search${qs ? `?${qs}` : ''}`, { token });
  },

  getServiceTokens: (token: string) =>
    apiFetch<ServiceTokenResponse[]>('/service-tokens', { token }),
  createServiceToken: (token: string, name: string) =>
    apiFetch<ServiceTokenResponse>('/service-tokens', { method: 'POST', body: { name }, token }),
  deleteServiceToken: (token: string, id: string) =>
    apiFetch(`/service-tokens/${id}`, { method: 'DELETE', token }),
  revealServiceToken: (token: string, id: string) =>
    apiFetch<{ token: string | null; message?: string }>(`/service-tokens/${id}/reveal`, { method: 'POST', token }),
  updateServiceToken: (token: string, id: string, body: { name?: string; is_active?: boolean }) =>
    apiFetch(`/service-tokens/${id}`, { method: 'PUT', body, token }),

  getTemplates: (token: string, industry?: string) => {
    const qs = industry ? `?industry=${industry}` : '';
    return apiFetch<TemplateListResponse>(`/templates${qs}`, { token });
  },
};

// Types
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

// Admin types
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

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
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

// Notification types
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
  page: number;
  per_page: number;
}

// Analytics types
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

// Admin API types
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
  created_at: string;
}

// Admin API
export const adminApi = {
  getStats: (token: string) =>
    apiFetch<AdminStatsResponse>('/admin/stats', { token }),

  listUsers: (token: string, params?: { page?: number; search?: string; plan?: string; status?: string; created_after?: string; created_before?: string; sort_field?: string; sort_dir?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.plan) searchParams.set('plan', params.plan);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.created_after) searchParams.set('created_after', params.created_after);
    if (params?.created_before) searchParams.set('created_before', params.created_before);
    if (params?.sort_field) searchParams.set('sort_field', params.sort_field);
    if (params?.sort_dir) searchParams.set('sort_dir', params.sort_dir);
    const qs = searchParams.toString();
    return apiFetch<AdminUsersResponse>(`/admin/users${qs ? `?${qs}` : ''}`, { token });
  },

  getUserDetail: (token: string, id: string) =>
    apiFetch<AdminUserDetail>(`/admin/users/${id}`, { token }),

  updateUserPlan: (token: string, id: string, plan: string) =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/plan`, { method: 'PUT', body: { plan }, token }),

  getUserPlanHistory: (token: string, id: string) =>
    apiFetch<{ history: Array<{ action: string; details: Record<string, unknown>; created_at: string }> }>(`/admin/users/${id}/plan-history`, { token }),

  sendUserEmail: (token: string, id: string, subject: string, body: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/send-email`, { method: 'POST', body: { subject, body }, token }),

  updateUserStatus: (token: string, id: string, status: 'active' | 'banned', reason?: string) =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/status`, { method: 'PUT', body: { is_active: status === 'active', reason }, token }),

  getRevenue: (token: string) =>
    apiFetch<RevenueResponse>('/admin/revenue', { token }),

  // New endpoints
  getAuditLogs: (token: string, params?: { limit?: number; offset?: number; action?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) {
      searchParams.set('per_page', params.limit.toString());
      // Calculate page from offset and limit
      const page = params.offset ? Math.floor(params.offset / params.limit) + 1 : 1;
      searchParams.set('page', page.toString());
    }
    if (params?.action) searchParams.set('action', params.action);
    const qs = searchParams.toString();
    return apiFetch<AuditLogResponse>(`/admin/audit-logs${qs ? `?${qs}` : ''}`, { token });
  },

  replayDelivery: (token: string, deliveryId: string) =>
    apiFetch<{ message: string }>(`/admin/deliveries/${deliveryId}/replay`, { method: 'POST', token }),

  impersonateUser: (token: string, userId: string) =>
    apiFetch<{ token: string; expires_in: number }>(`/admin/users/${userId}/impersonate`, { method: 'POST', token }),

  getUserAnalytics: (token: string, userId: string, days?: number) => {
    const qs = days ? `?days=${days}` : '';
    return apiFetch<UserAnalytics>(`/admin/users/${userId}/analytics${qs}`, { token });
  },

  // Aşama 1 — Kullanıcı kaynakları
  getUserEndpoints: (token: string, userId: string) =>
    apiFetch<{ endpoints: Array<{ id: string; url: string; description: string | null; is_active: boolean; created_at: string; total_deliveries: number; last_delivery_at: string | null }> }>(`/admin/users/${userId}/endpoints`, { token }),

  getUserWebhooks: (token: string, userId: string, params?: { page?: number; per_page?: number; status?: string; event_type?: string; since?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.per_page) searchParams.set("per_page", params.per_page.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.event_type) searchParams.set("event_type", params.event_type);
    if (params?.since) searchParams.set("since", params.since);
    const qs = searchParams.toString();
    return apiFetch<{ webhooks: Array<{ id: string; endpoint_id: string; status: string; event: string | null; created_at: string; attempt_count: number; response_status: number | null; response_body: string | null; error_message: string | null }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/webhooks${qs ? `?${qs}` : ""}`, { token });
  },

  getUserApiKeys: (token: string, userId: string) =>
    apiFetch<{ api_keys: Array<{ prefix: string; name: string; created_at: string; is_active: boolean }> }>(`/admin/users/${userId}/api-keys`, { token }),

  getUserApplications: (token: string, userId: string) =>
    apiFetch<{ applications: Array<{ id: string; name: string; description: string | null; created_at: string; endpoint_count: number }> }>(`/admin/users/${userId}/applications`, { token }),

  getUserUsage: (token: string, userId: string) =>
    apiFetch<{ total_deliveries: number; successful: number; failed: number; pending: number; success_rate: number; endpoints_count: number; active_endpoints: number; last_30_days: number; last_7_days: number; top_events: Array<{ event: string | null; count: number }> }>(`/admin/users/${userId}/usage`, { token }),

  adminUserTestWebhook: (token: string, userId: string, data: { endpoint_url: string; event_type?: string; payload: Record<string, unknown> }) =>
    apiFetch<{ status_code: number; response_body: string; duration_ms: number }>(`/admin/users/${userId}/test-webhook`, { method: "POST", body: data, token }),

  adminUserReplayDelivery: (token: string, userId: string, deliveryId: string) =>
    apiFetch<{ message: string; original_id: string; new_delivery_id: string }>(`/admin/users/${userId}/webhooks/${deliveryId}/replay`, { method: "POST", token }),

  testWebhook: (token: string, data: { endpoint_url: string; event_type: string; payload: Record<string, unknown> }) =>
    apiFetch<{ status_code: number; response_body: string; duration_ms: number }>(`/admin/test-webhook`, { method: 'POST', body: data, token }),

  getChurn: (token: string) =>
    apiFetch<{ users: ChurnUser[] }>('/admin/churn', { token }),

  exportUsers: (_token: string, params?: { format?: string; plan?: string; status?: string; created_after?: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('format', params?.format || 'csv');
    if (params?.plan) searchParams.set('plan', params.plan);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.created_after) searchParams.set('created_after', params.created_after);
    return `/admin/users/export?${searchParams.toString()}`;
  },

  exportRevenue: (_token: string, months?: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('format', 'csv');
    if (months) searchParams.set('months', months.toString());
    return `/admin/revenue/export?${searchParams.toString()}`;
  },

  getSettings: (token: string) =>
    apiFetch<PlatformSettings>('/admin/settings', { token }),

  updateSettings: (token: string, settings: PlatformSettings) =>
    apiFetch<{ message: string }>('/admin/settings', { method: 'PUT', body: settings, token }),

  // Admin Alerts (platform-wide)
  listAlerts: (token: string) =>
    apiFetch<AlertRuleAdmin[]>('/admin/alerts', { token }),

  createAlert: (token: string, data: { name: string; condition: string; threshold: number; channels: string[] }) =>
    apiFetch<AlertRuleAdmin>('/admin/alerts', { method: 'POST', body: data, token }),

  updateAlert: (token: string, id: string, data: { name?: string; condition?: string; threshold?: number; channels?: string[]; is_active?: boolean }) =>
    apiFetch<AlertRuleAdmin>(`/admin/alerts/${id}`, { method: 'PUT', body: data, token }),

  deleteAlert: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/admin/alerts/${id}`, { method: 'DELETE', token }),

  // Feature Flags
  listFeatureFlags: (token: string) =>
    apiFetch<{ flags: FeatureFlag[] }>('/admin/feature-flags', { token }),

  createFeatureFlag: (token: string, data: { name: string; description?: string | null; is_enabled?: boolean; rollout_percentage?: number; enabled_for_plans?: string[] }) =>
    apiFetch<FeatureFlag>('/admin/feature-flags', { method: 'POST', body: data, token }),

  updateFeatureFlag: (token: string, id: string, data: { name?: string; description?: string | null; is_enabled?: boolean; rollout_percentage?: number; enabled_for_plans?: string[] }) =>
    apiFetch<FeatureFlag>(`/admin/feature-flags/${id}`, { method: 'PUT', body: data, token }),

  deleteFeatureFlag: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/admin/feature-flags/${id}`, { method: 'DELETE', token }),

  getDeployInfo: (token: string) =>
    apiFetch<DeployInfo>('/admin/deploy-info', { token }),

  getSystemHealth: (token: string) =>
    apiFetch<Record<string, unknown>>('/health', { token }),

  // ── Aşama 2: System Monitoring ──
  getFailedDeliveries: (token: string, params?: { limit?: number; since?: string; user_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.since) qs.set('since', params.since);
    if (params?.user_id) qs.set('user_id', params.user_id);
    return apiFetch<{ deliveries: Array<{ id: string; customer_id: string; endpoint_id: string; event_type: string | null; status: string; attempt_count: number; response_status: number | null; response_body: string | null; created_at: string; error_message: string | null; customer_email: string | null; endpoint_url: string | null }>; count: number }>(`/admin/deliveries/failed?${qs}`, { token });
  },

  getDeadLetters: (token: string, params?: { limit?: number; since?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.since) qs.set('since', params.since);
    return apiFetch<{ dead_letters: Array<{ id: string; delivery_id: string; endpoint_id: string; customer_id: string; payload: unknown; reason: string | null; attempts: number; created_at: string; customer_email: string | null; endpoint_url: string | null }>; count: number }>(`/admin/deliveries/dead-letters?${qs}`, { token });
  },

  getQueueStatus: (token: string) =>
    apiFetch<{ pending: number; processing: number; failed: number; total: number; oldest_pending_at: string | null; failed_last_hour: number }>('/admin/queue/status', { token }),

  getRateLimitViolations: (token: string, params?: { limit?: number; since?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.since) qs.set('since', params.since);
    return apiFetch<{ violations: Array<{ id: string; customer_id: string | null; endpoint_id: string | null; ip: string | null; requests_count: number; limit_per_window: number; window_seconds: number; created_at: string; customer_email: string | null }>; count: number }>(`/admin/rate-limit-violations?${qs}`, { token });
  },

  getApiLatency: (token: string, params?: { period?: string }) => {
    const qs = new URLSearchParams();
    if (params?.period) qs.set('period', params.period);
    return apiFetch<{ endpoints: Array<{ endpoint_id: string; url: string; total_deliveries: number; avg_latency_ms: number | null; p95_latency_ms: number | null; failed_count: number; error_rate: number }>; period: string }>(`/admin/api-latency?${qs}`, { token });
  },

  // Aşama 3 — Müşteri İlişkileri (Notes, Tags, Communications)
  addNote: (token: string, userId: string, content: string) =>
    apiFetch<{ note: { id: string; customer_id: string; admin_user_id: string; content: string; created_at: string }; message: string }>(`/admin/users/${userId}/notes`, { method: 'POST', body: { content }, token }),

  getNotes: (token: string, userId: string) =>
    apiFetch<{ notes: Array<{ id: string; customer_id: string; admin_user_id: string; content: string; created_at: string }>; total: number }>(`/admin/users/${userId}/notes`, { token }),

  addTag: (token: string, userId: string, tag: string) =>
    apiFetch<{ tag: string; added: boolean; message: string }>(`/admin/users/${userId}/tags`, { method: 'POST', body: { tag }, token }),

  removeTag: (token: string, userId: string, tag: string) =>
    apiFetch<{ tag: string; removed: boolean; message: string }>(`/admin/users/${userId}/tags/${tag}`, { method: 'DELETE', token }),

  getTags: (token: string, userId: string) =>
    apiFetch<{ tags: Array<{ id: string; customer_id: string; tag: string; admin_user_id: string; created_at: string }>; total: number }>(`/admin/users/${userId}/tags`, { token }),

  getCommunications: (token: string, userId: string, params?: { type?: string; page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const qs = searchParams.toString();
    return apiFetch<{ communications: Array<{ id: string; customer_id: string; type: string; subject: string | null; details: unknown; admin_user_id: string | null; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/communications${qs ? `?${qs}` : ''}`, { token });
  },

  // Aşama 4 — Fatura, Ödeme, Gelir Metrikleri
  getUserInvoices: (token: string, userId: string, params?: { page?: number; per_page?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiFetch<{ invoices: Array<{ id: string; customer_id: string; amount_cents: number; currency: string; plan: string; status: string; provider: string; provider_invoice_id: string | null; paid_at: string | null; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/invoices${qs ? `?${qs}` : ''}`, { token });
  },

  getUserPayments: (token: string, userId: string, params?: { page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const qs = searchParams.toString();
    return apiFetch<{ payments: Array<{ id: string; customer_id: string; amount_cents: number; currency: string; status: string; provider: string; provider_transaction_id: string | null; metadata: unknown; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/payments${qs ? `?${qs}` : ''}`, { token });
  },

  getRevenueMetrics: (token: string) =>
    apiFetch<{ mrr: number; arr: number; arpu: number; ltv: number; nrr: number; expansion_revenue: number; total_customers: number; paying_customers: number; churn_rate: number; avg_months_retained: number }>('/admin/revenue/metrics', { token }),

  getRevenueCohorts: (token: string, months?: number) => {
    const qs = months ? `?months=${months}` : '';
    return apiFetch<{ cohorts: Array<{ cohort_month: string; customers_signed_up: number; customers_active: number; total_revenue_cents: number; retention_rate: number }>; months: number }>(`/admin/revenue/cohorts${qs}`, { token });
  },

  // Aşama 5 — Refund + Polar.sh
  refundUser: (token: string, userId: string, amount_cents: number, reason: string, currency?: string) =>
    apiFetch<{ refund: { id: string; customer_id: string; email?: string; amount_cents: number; currency: string; reason: string | null; status: string; created_at: string }; message: string }>(`/admin/users/${userId}/refund`, { method: 'POST', body: { amount_cents, reason, ...(currency ? { currency } : {}) }, token }),

  getUserRefunds: (token: string, userId: string, params?: { page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const qs = searchParams.toString();
    return apiFetch<{ refunds: Array<{ id: string; customer_id: string; email?: string; amount_cents: number; currency: string; reason: string | null; admin_user_id: string | null; provider: string; provider_refund_id: string | null; status: string; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/refunds${qs ? `?${qs}` : ''}`, { token });
  },

  getAllRefunds: (token: string, params?: { page?: number; per_page?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiFetch<{ refunds: Array<{ id: string; customer_id: string; email?: string; amount_cents: number; currency: string; reason: string | null; admin_user_id: string | null; provider: string; provider_refund_id: string | null; status: string; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/refunds${qs ? `?${qs}` : ''}`, { token });
  },

  // Aşama 7 — GDPR + Bulk Email
  exportUserData: (token: string, userId: string) =>
    apiFetch<{ export_date: string; account: { id: string; email: string; name: string | null; plan: string; is_active: boolean; email_verified: boolean; created_at: string }; endpoints: unknown[]; deliveries: unknown[]; invoices: unknown[]; notes: unknown[]; tags: unknown[]; communications: unknown[]; audit_logs: unknown[] }>(`/admin/users/${userId}/export`, { token }),

  deleteUserData: (token: string, userId: string, reason: string) =>
    apiFetch<{ message: string; deleted_at: string }>(`/admin/users/${userId}/data`, { method: 'DELETE', body: { confirm: true, reason }, token }),

  sendBulkEmail: (token: string, data: { subject: string; body: string; plan_filter?: string; status_filter?: string }) =>
    apiFetch<{ total_sent: number; total_failed: number; message: string }>(`/admin/bulk-email`, { method: 'POST', body: data, token }),
};

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
  resend_api_key: string | null;
  email_sender: string | null;
  webhook_secret: string | null;
  backup_retention_days: number;
  global_rate_limit: number;
  cors_origins: string | null;
}

// Team API
export const teamsApi = {
  list: (token: string) =>
    apiFetch<Team[]>('/teams', { token }),

  create: (token: string, data: { name: string; description?: string }) =>
    apiFetch<Team>('/teams', { method: 'POST', body: { name: data.name }, token }),

  listMembers: (token: string, teamId: string) =>
    apiFetch<TeamMember[]>(`/teams/${teamId}/members`, { token }),

  inviteMember: (token: string, teamId: string, data: { email: string; role: string }) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/invite`, { method: 'POST', body: data, token }),

  removeMember: (token: string, teamId: string, memberId: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE', token }),

  updateRole: (token: string, teamId: string, memberId: string, role: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}/role`, { method: 'PUT', body: { role }, token }),

  acceptInvite: (token: string, inviteToken: string) =>
    apiFetch<{ team_id: string; role: string; message: string }>('/teams/accept-invite', { method: 'POST', body: { token: inviteToken }, token }),
};

// Notification API
export const notificationsApi = {
  list: (token: string, params?: { page?: number; type?: string; read?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.read !== undefined) searchParams.set('read', params.read.toString());
    const qs = searchParams.toString();
    return apiFetch<NotificationListResponse>(`/notifications${qs ? `?${qs}` : ''}`, { token });
  },

  getUnreadCount: (token: string) =>
    apiFetch<{ unread_count: number }>('/notifications/unread-count', { token }),

  markAsRead: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT', token }),

  markAllAsRead: (token: string) =>
    apiFetch<{ success: boolean }>('/notifications/read-all', { method: 'PUT', token }),

  deleteNotification: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}`, { method: 'DELETE', token }),
};

// Billing types
export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
}

// Alert types
export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
  is_active: boolean;
  created_at: string;
}

// Alert API
export const alertsApi = {
  list: (token?: string) =>
    apiFetch<AlertRule[]>('/alerts', { token }),

  create: (token: string | undefined, data: { name: string; condition: string; threshold: number; channels: string[] }) =>
    apiFetch<AlertRule>('/alerts', { method: 'POST', body: data, token }),

  update: (token: string | undefined, id: string, data: Partial<{ name: string; condition: string; threshold: number; channels: string[]; is_active: boolean }>) =>
    apiFetch<AlertRule>(`/alerts/${id}`, { method: 'PUT', body: data, token }),

  delete: (token: string | undefined, id: string) =>
    apiFetch<{ success: boolean }>(`/alerts/${id}`, { method: 'DELETE', token }),

  test: (token: string | undefined, id: string) =>
    apiFetch<{ success: boolean }>(`/alerts/${id}/test`, { method: 'POST', token }),
};

// Inbound types
export interface InboundConfig {
  id: string;
  provider: string;
  endpoint_id: string | null;
  enabled: boolean;
  secret: string;
  created_at: string;
}

// Inbound API
export const inboundApi = {
  listConfigs: (token?: string) =>
    apiFetch<InboundConfig[]>('/inbound/configs', { token }),

  createConfig: (token: string | undefined, data: { provider: string; endpoint_id?: string | null; secret: string }) =>
    apiFetch<InboundConfig>('/inbound/configs', { method: 'POST', body: data, token }),
};

// Two-Factor Authentication API
export const twoFactorApi = {
  enable: (token: string) =>
    apiFetch<{ secret: string; qr_code: string; backup_codes: string[] }>('/auth/2fa/enable', { method: 'POST', token }),

  confirm: (token: string, code: string) =>
    apiFetch<{ success: boolean; backup_codes: string[] }>('/auth/2fa/confirm', { method: 'POST', body: { code }, token }),

  disable: (token: string) =>
    apiFetch<{ success: boolean }>('/auth/2fa/disable', { method: 'POST', token }),

  getStatus: (token: string) =>
    apiFetch<{ enabled: boolean; last_used_at?: string }>('/auth/2fa/status', { token }),
};

// Custom Domains API

// SSO API
export const ssoApi = {
  testSso: (token: string) =>
    apiFetch<{ success: boolean; message: string; redirect_url?: string }>('/sso/test', { method: 'POST', token }),
};

// Transform types
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

// Transform API
export const transformsApi = {
  list: (token: string, endpointId: string) =>
    apiFetch<TransformRule[]>(`/endpoints/${endpointId}/transforms`, { token }),

  create: (token: string, endpointId: string, data: { rule: TransformRule['rule_json'] }) =>
    apiFetch<TransformRule>(`/endpoints/${endpointId}/transforms`, { method: 'POST', body: data, token }),

  delete: (token: string, endpointId: string, ruleId: string) =>
    apiFetch<{ success: boolean }>(`/endpoints/${endpointId}/transforms/${ruleId}`, { method: 'DELETE', token }),
};

// Billing usage types
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
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

// Extended Billing API
export const billingApiExtended = {
  getUsage: (token?: string) =>
    apiFetch<BillingUsage>('/billing/usage', { token }),

  getSubscription: (token?: string) =>
    apiFetch<BillingSubscription>('/billing/subscription', { token }),

  upgrade: (token: string, plan: string, billingPeriod?: string) =>
    apiFetch<{ success: boolean; checkout_url?: string }>('/billing/upgrade', { method: 'POST', body: { plan, provider: 'polar', billing_period: billingPeriod || 'monthly' }, token }),

  getInvoices: (token: string) =>
    apiFetch<Invoice[]>('/billing/invoices', { token }),
};

// Analytics API
export const analyticsApi = {
  deliveryTrend: (token: string, range: string = '24h') =>
    apiFetch<DeliveryTrendResponse>(`/analytics/deliveries?range=${range}`, { token }),

  successRate: (token: string, range: string = '24h') =>
    apiFetch<SuccessRateData>(`/analytics/success-rate?range=${range}`, { token }),

  latencyTrend: (token: string, range: string = '24h') =>
    apiFetch<LatencyTrendResponse>(`/analytics/latency?range=${range}`, { token }),
};
