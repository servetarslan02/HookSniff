import type { ApiOptions, Application, RetryPolicyConfig, Endpoint, Delivery, DeliveryDetail, DeliveryAttempt, DeliveryListResponse, StatsResponse, AdminStatsResponse, DeployInfo, AdminUsersResponse, AdminUserDetail, RevenueResponse, Team, TeamMember, NotificationListResponse, DeliveryTrendResponse, SuccessRateData, LatencyTrendResponse, AuditLogResponse, AuditLogEntryResponse, EndpointHealthResponse, ApiKeyResponse, PortalConfigResponse, PortalEmbedCodeResponse, PortalProfileResponse, PortalUsageResponse, RateLimitResponse, SchemaRegistryListResponse, SearchResponseData, ServiceTokenResponse, TemplateListResponse, UserAnalytics, ChurnUser, AlertRuleAdmin, FeatureFlag, PlatformSettings, Invoice, AlertRule, InboundConfig, TransformRule, BillingUsage, BillingSubscription, OverageSettings, PortalResponse, RefundResponse } from './api-types';
export type * from './api-types';

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
        const specificMessage = error.error?.message || error.message;
        const message = specificMessage
          ? specificMessage
          : errorCode
            ? getUserFriendlyMessage(errorCode)
            : `API error: ${res.status}`;
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

export const endpointsApi = {
  list: (token: string) =>
    apiFetch<Endpoint[]>("/endpoints", { token }),

  get: (token: string, id: string) =>
    apiFetch<Endpoint>(`/endpoints/${id}`, { token }),

  create: (token: string, data: { url: string; description?: string; application_id?: string }) =>
    apiFetch<Endpoint>("/endpoints", { method: "POST", body: data, token }),

  update: (token: string, id: string, data: Partial<Endpoint> & { retry_policy?: RetryPolicyConfig }) =>
    apiFetch<Endpoint>(`/endpoints/${id}`, { method: "PUT", body: data, token }),

  updateRetryPolicy: (token: string, id: string, policy: RetryPolicyConfig) =>
    apiFetch<Endpoint>(`/endpoints/${id}/retry-policy`, { method: "PUT", body: policy, token }),

  delete: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/endpoints/${id}`, { method: "DELETE", token }),

  rotateSecret: (token: string, id: string) =>
    apiFetch<{ signing_secret: string }>(`/endpoints/${id}/rotate-secret`, { method: "POST", token }),
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






// Admin types






// Team types


// Notification types


// Analytics types





// Admin API types




















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

// Alert types

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





// Extended Billing API
export const billingApiExtended = {
  getUsage: (token?: string) =>
    apiFetch<BillingUsage>('/billing/usage', { token }),

  getSubscription: (token?: string) =>
    apiFetch<BillingSubscription>('/billing/subscription', { token }),

  upgrade: (token: string, plan: string, billingPeriod?: string) =>
    apiFetch<{ checkout_url?: string; message?: string; requires_contact?: boolean; contact_url?: string; prorated_amount_cents?: number }>('/billing/upgrade', { method: 'POST', body: { plan, provider: 'polar', billing_period: billingPeriod || 'monthly' }, token }),

  getInvoices: (token: string) =>
    apiFetch<Invoice[]>('/billing/invoices', { token }),

  openPortal: (token: string) =>
    apiFetch<PortalResponse>('/billing/portal', { method: 'POST', token }),

  requestRefund: (token: string, reason: string) =>
    apiFetch<RefundResponse>('/billing/refund', { method: 'POST', body: { reason }, token }),

  getOverageSettings: (token?: string) =>
    apiFetch<OverageSettings>('/billing/settings', { token }),

  updateOverageSettings: (token: string, data: { allow_overage?: boolean; overage_email_notification?: boolean }) =>
    apiFetch<OverageSettings>('/billing/settings', { method: 'PUT', body: data, token }),
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
// deploy trigger Mon May 18 01:16:03 AM CST 2026
