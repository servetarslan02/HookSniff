import type { ApiOptions, Application, RetryPolicyConfig, Endpoint, Delivery, DeliveryDetail, DeliveryAttempt, DeliveryListResponse, StatsResponse, AdminStatsResponse, DeployInfo, AdminUsersResponse, AdminUserDetail, RevenueResponse, Team, TeamMember, TeamDetailResponse, NotificationListResponse, DeliveryTrendResponse, SuccessRateData, LatencyTrendResponse, AuditLogResponse, AuditLogEntryResponse, EndpointHealthResponse, ApiKeyResponse, PortalConfigResponse, PortalEmbedCodeResponse, PortalProfileResponse, PortalUsageResponse, RateLimitResponse, SchemaRegistryListResponse, SearchResponseData, ServiceTokenResponse, TemplateItem, TemplateListResponse, UserAnalytics, ChurnUser, AlertRuleAdmin, FeatureFlag, PlatformSettings, Invoice, AlertRule, InboundConfig, TransformRule, BillingUsage, BillingSubscription, OverageSettings, PortalResponse, RefundResponse, Broadcast, UserBroadcast, BroadcastListResponse, SecurityEvent, SecurityStats, IpBlockEntry } from './api-types';
export type * from './api-types';

import { getUserFriendlyMessage, extractErrorCode } from './error-catalog';

// In production, "/api/v1" is proxied by Vercel rewrites to the GCP Cloud Run API (see vercel.json).
// In development, point directly to the local API server.
export const API_BASE = typeof window !== 'undefined' ? '/api/v1' : 'https://hooksniff-api-1046140057667.europe-west1.run.app/v1';

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
let refreshPromise: Promise<string | null> | null = null;

// HS-039: Proactive refresh interval — renews token at ~12 min (before 15 min expiry).
let proactiveRefreshTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Refresh the access token. Returns the new token string on success, null on failure.
 * Deduplicates concurrent calls (only one refresh request at a time).
 */
function doRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...getCSRFHeaders('POST') },
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        return data.token ?? null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * HS-039: Start proactive token refresh.
 * Renews the access token every 12 minutes (3 min before 15-min expiry).
 * While the user is active, the session never drops.
 * Call this after login. Call stopProactiveRefresh() on logout.
 */
export function startProactiveRefresh(onRefresh: (newToken: string) => void): void {
  stopProactiveRefresh();
  proactiveRefreshTimer = setInterval(async () => {
    const newToken = await doRefresh();
    if (newToken) {
      onRefresh(newToken);
    }
    // If refresh fails, don't panic — the reactive 401 handler will catch it
  }, 12 * 60 * 1000); // 12 minutes
}

/** Stop proactive token refresh. Call on logout. */
export function stopProactiveRefresh(): void {
  if (proactiveRefreshTimer) {
    clearInterval(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
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
          const newToken = await doRefresh();
          if (newToken) {
            // HS-039: Refresh succeeded — update stored token and retry with new token
            localStorage.setItem('hooksniff_token', newToken);
            headers["Authorization"] = `Bearer ${newToken}`;
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
// Environments API
export interface EnvironmentOut {
  id: string;
  customer_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
  variable_count: number | null;
}

export interface EnvironmentVariableOut {
  id: string;
  environment_id: string;
  key: string;
  value: string;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export const environmentsApi = {
  list: (token: string) => apiFetch<EnvironmentOut[]>("/environments", { token }),
  get: (token: string, id: string) => apiFetch<EnvironmentOut>(`/environments/${id}`, { token }),
  create: (token: string, data: { name: string; slug?: string; description?: string; is_default?: boolean; color?: string }) =>
    apiFetch<EnvironmentOut>("/environments", { method: "POST", body: data, token }),
  update: (token: string, id: string, data: { name?: string; description?: string; is_default?: boolean; color?: string }) =>
    apiFetch<EnvironmentOut>(`/environments/${id}`, { method: "PUT", body: data, token }),
  delete: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/environments/${id}`, { method: "DELETE", token }),
  listVariables: (token: string, id: string) => apiFetch<EnvironmentVariableOut[]>(`/environments/${id}/variables`, { token }),
  createVariable: (token: string, id: string, data: { key: string; value: string; is_secret?: boolean }) =>
    apiFetch<EnvironmentVariableOut>(`/environments/${id}/variables`, { method: "POST", body: data, token }),
  deleteVariable: (token: string, envId: string, varId: string) =>
    apiFetch<{ deleted: boolean }>(`/environments/${envId}/variables/${varId}`, { method: "DELETE", token }),
};

// Background Tasks API
export interface BackgroundTaskOut {
  id: string;
  customer_id: string;
  task_type: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  data: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error: string | null;
  progress: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export const backgroundTasksApi = {
  list: (token: string) => apiFetch<BackgroundTaskOut[]>("/background-tasks", { token }),
  get: (token: string, id: string) => apiFetch<BackgroundTaskOut>(`/background-tasks/${id}`, { token }),
  cancel: (token: string, id: string) => apiFetch<BackgroundTaskOut>(`/background-tasks/${id}`, { method: "PUT", token }),
};

// Operational Webhooks API
export interface OperationalWebhookEndpointOut {
  id: string;
  customer_id: string;
  url: string;
  description: string | null;
  is_active: boolean;
  event_types: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface OperationalWebhookDeliveryOut {
  id: string;
  endpoint_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  attempt_count: number;
  status: string;
  created_at: string;
  delivered_at: string | null;
}

export interface PolledMessage {
  id: string;
  endpoint_id: string;
  event_type: string | null;
  status: string;
  attempt_count: number;
  response_status: number | null;
  created_at: string;
  payload?: Record<string, unknown>;
}

export interface MessagePollerCursor {
  consumer_id: string;
  last_message_id: string | null;
  last_sequence_num: number;
}

export interface MessagePollerPollResponse {
  messages: PolledMessage[];
  cursor: MessagePollerCursor;
  done: boolean;
}

export interface MessagePollerCursorResponse {
  cursor: MessagePollerCursor;
}

export interface MessagePollerCommitResponse {
  cursor: MessagePollerCursor;
  committed: boolean;
}

export const operationalWebhooksApi = {
  list: (token: string) => apiFetch<OperationalWebhookEndpointOut[]>("/operational-webhooks", { token }),
  get: (token: string, id: string) => apiFetch<OperationalWebhookEndpointOut>(`/operational-webhooks/${id}`, { token }),
  create: (token: string, data: { url: string; description?: string; is_active?: boolean; event_types?: string[] }) =>
    apiFetch<OperationalWebhookEndpointOut>("/operational-webhooks", { method: "POST", body: data, token }),
  update: (token: string, id: string, data: { url?: string; description?: string; is_active?: boolean; event_types?: string[] }) =>
    apiFetch<OperationalWebhookEndpointOut>(`/operational-webhooks/${id}`, { method: "PUT", body: data, token }),
  delete: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/operational-webhooks/${id}`, { method: "DELETE", token }),
  listDeliveries: (token: string, id: string) => apiFetch<OperationalWebhookDeliveryOut[]>(`/operational-webhooks/${id}/deliveries`, { token }),
};

export const messagePollerApi = {
  poll: (token: string, params: { consumer_id: string; limit?: number; endpoint_id?: string; event_type?: string; include_payload?: boolean }) => {
    const qs = new URLSearchParams();
    qs.set('consumer_id', params.consumer_id);
    if (params.limit) qs.set('limit', params.limit.toString());
    if (params.endpoint_id) qs.set('endpoint_id', params.endpoint_id);
    if (params.event_type) qs.set('event_type', params.event_type);
    if (params.include_payload !== undefined) qs.set('include_payload', params.include_payload.toString());
    return apiFetch<MessagePollerPollResponse>(`/message-poller/poll?${qs}`, { token });
  },
  seek: (token: string, data: { consumer_id: string; message_id: string; endpoint_id?: string }) =>
    apiFetch<MessagePollerCursorResponse>("/message-poller/seek", { method: "POST", body: data, token }),
  commit: (token: string, data: { consumer_id: string; message_id: string; endpoint_id?: string }) =>
    apiFetch<MessagePollerCommitResponse>("/message-poller/commit", { method: "POST", body: data, token }),
};

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

  getEndpointHealth: (token?: string, range?: string) =>
    apiFetch<EndpointHealthResponse[]>(`/endpoint-health${range ? `?range=${range}` : ''}`, { token: token || undefined }),

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
  createSchema: (token: string, data: { name: string; schema: Record<string, unknown> }) =>
    apiFetch<{ id: string; name: string; version: number }>('/schemas', { method: 'POST', body: data, token }),
  getSchema: (token: string, id: string) =>
    apiFetch<{ id: string; name: string; version: number; schema: unknown; created_at: string }>(`/schemas/${id}`, { token }),
  validateSchema: (token: string, id: string, event: unknown) =>
    apiFetch<{ valid: boolean; errors: Array<{ path: string; message: string }> }>(`/schemas/${id}/validate`, { method: 'POST', body: { event }, token }),

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
  getTemplate: (token: string, id: string) =>
    apiFetch<TemplateItem>(`/templates/${id}`, { token }),
  applyTemplate: (token: string, id: string, data: { endpoint_url: string; enabled_agents?: string[] }) =>
    apiFetch<{ template_id: string; endpoint_id: string; message: string }>(`/templates/${id}/apply`, { method: 'POST', body: data, token }),
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
    apiFetch<{ deleted: boolean }>(`/admin/alerts/${id}`, { method: 'DELETE', token }),

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

  // ── Broadcasts ──
  listBroadcasts: (token: string, params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiFetch<BroadcastListResponse>(`/admin/broadcasts${qs ? `?${qs}` : ''}`, { token });
  },

  getBroadcast: (token: string, id: string) =>
    apiFetch<Broadcast>(`/admin/broadcasts/${id}`, { token }),

  createBroadcast: (token: string, data: Record<string, unknown>) =>
    apiFetch<Broadcast>(`/admin/broadcasts`, { method: 'POST', body: data, token }),

  updateBroadcast: (token: string, id: string, data: Record<string, unknown>) =>
    apiFetch<Broadcast>(`/admin/broadcasts/${id}`, { method: 'PUT', body: data, token }),

  deleteBroadcast: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/admin/broadcasts/${id}`, { method: 'DELETE', token }),

  // ── Security Monitoring ──
  listSecurityEvents: (token: string, params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiFetch<{ events: SecurityEvent[]; total: number; page: number; per_page: number }>(`/admin/security/events${qs ? `?${qs}` : ''}`, { token });
  },

  getSecurityStats: (token: string) =>
    apiFetch<SecurityStats>('/admin/security/stats', { token }),

  resolveSecurityEvent: (token: string, id: string) =>
    apiFetch<{ resolved: boolean }>(`/admin/security/events/${id}/resolve`, { method: 'PUT', token }),

  resolveAllSecurityEvents: (token: string, data: { event_type?: string; severity?: string }) =>
    apiFetch<{ resolved_count: number }>('/admin/security/resolve-all', { method: 'POST', body: data, token }),

  // ── IP Blocklist ──
  listIpBlocklist: (token: string, params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiFetch<{ entries: IpBlockEntry[]; total: number; page: number; per_page: number }>(`/admin/security/blocklist${qs ? `?${qs}` : ''}`, { token });
  },

  blockIp: (token: string, data: { ip_address: string; reason?: string; expires_hours?: number }) =>
    apiFetch<IpBlockEntry>('/admin/security/blocklist', { method: 'POST', body: data, token }),

  unblockIp: (token: string, id: string) =>
    apiFetch<{ unblocked: boolean }>(`/admin/security/blocklist/${id}`, { method: 'DELETE', token }),

  checkIpBlocked: (token: string, ip: string) =>
    apiFetch<{ ip_address: string; is_blocked: boolean }>('/admin/security/blocklist/check', { method: 'POST', body: { ip_address: ip }, token }),
};



// Team API
export const teamsApi = {
  list: (token: string) =>
    apiFetch<Team[]>('/teams', { token }),

  create: (token: string, data: { name: string; description?: string }) =>
    apiFetch<Team>('/teams', { method: 'POST', body: { name: data.name }, token }),

  listMembers: (token: string, teamId: string) =>
    apiFetch<TeamMember[]>(`/teams/${teamId}/members`, { token }),

  getDetail: (token: string, teamId: string) =>
    apiFetch<TeamDetailResponse>(`/teams/${teamId}`, { token }),

  update: (token: string, teamId: string, data: { name?: string; description?: string }) =>
    apiFetch<Team>(`/teams/${teamId}`, { method: 'PATCH', body: data, token }),

  inviteMember: (token: string, teamId: string, data: { email: string; role: string }) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/invite`, { method: 'POST', body: data, token }),

  removeMember: (token: string, teamId: string, memberId: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE', token }),

  updateRole: (token: string, teamId: string, memberId: string, role: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}/role`, { method: 'PUT', body: { role }, token }),

  acceptInvite: (token: string, inviteToken: string) =>
    apiFetch<{ team_id: string; role: string; message: string }>('/teams/accept-invite', { method: 'POST', body: { token: inviteToken }, token }),

  delete: (token: string, teamId: string) =>
    apiFetch<{ deleted: boolean }>(`/teams/${teamId}`, { method: 'DELETE', token }),

  leave: (token: string, teamId: string) =>
    apiFetch<{ left: boolean }>(`/teams/${teamId}/leave`, { method: 'POST', token }),

  transferOwnership: (token: string, teamId: string, newOwnerId: string) =>
    apiFetch<{ transferred: boolean; new_owner_id: string; message: string }>(`/teams/${teamId}/transfer`, { method: 'POST', body: { new_owner_id: newOwnerId }, token }),

  revokeInvite: (token: string, inviteId: string) =>
    apiFetch<{ revoked: boolean }>(`/teams/invites/${inviteId}`, { method: 'DELETE', token }),

  resendInvite: (token: string, inviteId: string) =>
    apiFetch<{ id: string; email: string; role: string; expires_at: string; invite_link: string }>(`/teams/invites/${inviteId}/resend`, { method: 'POST', token }),
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

// Broadcast API (user-facing)
export const broadcastsApi = {
  listActive: (token: string, includeDismissed?: boolean) => {
    const qs = includeDismissed ? '?include_dismissed=true' : '';
    return apiFetch<UserBroadcast[]>(`/broadcasts${qs}`, { token });
  },

  dismiss: (token: string, id: string) =>
    apiFetch<{ dismissed: boolean }>(`/broadcasts/${id}/dismiss`, { method: 'POST', token }),

  getUnreadCount: (token: string) =>
    apiFetch<{ unread_count: number }>('/broadcasts/unread-count', { token }),
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

  updateConfig: (token: string | undefined, id: string, data: { secret?: string; endpoint_id?: string | null; enabled?: boolean }) =>
    apiFetch<InboundConfig>(`/inbound/configs/${id}`, { method: 'PUT', body: data, token }),

  deleteConfig: (token: string | undefined, id: string) =>
    apiFetch<{ deleted: boolean }>(`/inbound/configs/${id}`, { method: 'DELETE', token }),
};

export interface ConnectorOut {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon_url: string | null;
  config_schema: Record<string, unknown>;
  supported_events: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectorConfigOut {
  id: string;
  connector_id: string;
  connector_name: string;
  connector_display_name: string;
  name: string;
  config: Record<string, unknown>;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export const connectorsApi = {
  list: (token: string) => apiFetch<ConnectorOut[]>('/connectors', { token }),
  get: (token: string, id: string) => apiFetch<ConnectorOut>(`/connectors/${id}`, { token }),
  listConfigs: (token: string) => apiFetch<ConnectorConfigOut[]>('/connectors/configs', { token }),
  getConfig: (token: string, id: string) => apiFetch<ConnectorConfigOut>(`/connectors/configs/${id}`, { token }),
  createConfig: (token: string, data: { connector_id: string; name: string; config?: Record<string, unknown>; credentials?: Record<string, unknown> }) =>
    apiFetch<ConnectorConfigOut>('/connectors/configs', { method: 'POST', body: data, token }),
  updateConfig: (token: string, id: string, data: { name?: string; config?: Record<string, unknown>; credentials?: Record<string, unknown>; is_active?: boolean }) =>
    apiFetch<ConnectorConfigOut>(`/connectors/configs/${id}`, { method: 'PUT', body: data, token }),
  deleteConfig: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/connectors/configs/${id}`, { method: 'DELETE', token }),
};

// Integration types
export interface IntegrationOut {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  connector_config_id: string;
  connector_name: string;
  connector_display_name: string;
  endpoint_id: string;
  endpoint_url: string;
  enabled: boolean;
  event_filter: string[] | null;
  transform_id: string | null;
  retry_policy: Record<string, unknown>;
  metadata: Record<string, unknown>;
  last_triggered_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  failure_count: number;
  total_deliveries: number;
  total_failures: number;
  health_status: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationEventOut {
  id: string;
  integration_id: string;
  event_type: string;
  source_event_id: string | null;
  payload: Record<string, unknown>;
  status: string;
  delivery_id: string | null;
  error_message: string | null;
  attempts: number;
  duration_ms: number | null;
  created_at: string;
  processed_at: string | null;
}

export interface IntegrationStatsOut {
  total_events: number;
  delivered: number;
  failed: number;
  pending: number;
  filtered: number;
  avg_duration_ms: number | null;
  success_rate: number;
  last_24h_events: number;
  last_24h_failures: number;
}

export const integrationsApi = {
  list: (token: string) => apiFetch<IntegrationOut[]>('/integrations', { token }),
  get: (token: string, id: string) => apiFetch<IntegrationOut>(`/integrations/${id}`, { token }),
  create: (token: string, data: { name: string; description?: string; connector_config_id: string; endpoint_id: string; event_filter?: string[]; transform_id?: string; retry_policy?: Record<string, unknown>; metadata?: Record<string, unknown>; enabled?: boolean }) =>
    apiFetch<IntegrationOut>('/integrations', { method: 'POST', body: data, token }),
  update: (token: string, id: string, data: { name?: string; description?: string; endpoint_id?: string; event_filter?: string[]; transform_id?: string; retry_policy?: Record<string, unknown>; metadata?: Record<string, unknown>; enabled?: boolean }) =>
    apiFetch<IntegrationOut>(`/integrations/${id}`, { method: 'PUT', body: data, token }),
  delete: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/integrations/${id}`, { method: 'DELETE', token }),
  test: (token: string, id: string) => apiFetch<{ success: boolean; event_id: string; message: string }>(`/integrations/${id}/test`, { method: 'POST', token }),
  listEvents: (token: string, id: string, params?: { status?: string; event_type?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.event_type) qs.set('event_type', params.event_type);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    const q = qs.toString();
    return apiFetch<IntegrationEventOut[]>(`/integrations/${id}/events${q ? `?${q}` : ''}`, { token });
  },
  getStats: (token: string, id: string) => apiFetch<IntegrationStatsOut>(`/integrations/${id}/stats`, { token }),
};

// Stream types
export interface StreamChannelOut {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  channel_type: string;
  event_filter: string[] | null;
  enabled: boolean;
  max_subscribers: number;
  current_subscribers: number;
  total_messages: number;
  created_at: string;
  updated_at: string;
}

export interface StreamChannelDetailOut extends StreamChannelOut {
  recent_messages: StreamMessageOut[];
}

export interface StreamMessageOut {
  id: string;
  channel_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  delivered_count: number;
  created_at: string;
}

export interface StreamSubscriptionOut {
  id: string;
  channel_id: string;
  customer_id: string;
  connection_type: string;
  client_id: string | null;
  event_filter: string[] | null;
  connected_at: string;
  last_heartbeat_at: string;
  messages_sent: number;
  metadata: Record<string, unknown>;
}

export const streamApi = {
  listChannels: (token: string) => apiFetch<StreamChannelOut[]>('/stream/channels', { token }),
  getChannel: (token: string, id: string) => apiFetch<StreamChannelDetailOut>(`/stream/channels/${id}`, { token }),
  createChannel: (token: string, data: { name: string; description?: string; channel_type?: string; event_filter?: string[]; max_subscribers?: number; enabled?: boolean }) =>
    apiFetch<StreamChannelOut>('/stream/channels', { method: 'POST', body: data, token }),
  updateChannel: (token: string, id: string, data: { name?: string; description?: string; event_filter?: string[]; max_subscribers?: number; enabled?: boolean }) =>
    apiFetch<StreamChannelOut>(`/stream/channels/${id}`, { method: 'PUT', body: data, token }),
  deleteChannel: (token: string, id: string) => apiFetch<{ deleted: boolean }>(`/stream/channels/${id}`, { method: 'DELETE', token }),
  listMessages: (token: string, id: string, params?: { event_type?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.event_type) qs.set('event_type', params.event_type);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiFetch<StreamMessageOut[]>(`/stream/channels/${id}/messages${q ? `?${q}` : ''}`, { token });
  },
  listSubscriptions: (token: string) => apiFetch<StreamSubscriptionOut[]>('/stream/subscriptions', { token }),
  disconnectSubscription: (token: string, id: string) => apiFetch<{ disconnected: boolean }>(`/stream/subscriptions/${id}`, { method: 'DELETE', token }),
  publish: (token: string, data: { channel_id: string; event_type: string; payload: Record<string, unknown> }) =>
    apiFetch<{ success: boolean; message_id: string; delivered_to: number }>('/stream/publish', { method: 'POST', body: data, token }),
};

// Two-Factor Authentication API
export const twoFactorApi = {
  enable: (token: string) =>
    apiFetch<{ secret: string; qr_code: string; backup_codes: string[] }>('/auth/2fa/enable', { method: 'POST', token }),

  confirm: (token: string, code: string) =>
    apiFetch<{ success: boolean; backup_codes: string[] }>('/auth/2fa/confirm', { method: 'POST', body: { code }, token }),

  verify: (tempToken: string, code: string, backupCode?: string) =>
    apiFetch<{ token: string; customer: { id: string; email: string; name?: string; plan: string; is_admin?: boolean; api_key?: string }; refresh_token?: string }>('/auth/2fa/verify', {
      method: 'POST',
      body: backupCode ? { temp_token: tempToken, backup_code: backupCode } : { temp_token: tempToken, code },
    }),

  disable: (token: string, password: string) =>
    apiFetch<{ success: boolean }>('/auth/2fa/disable', { method: 'POST', body: { password }, token }),

  getStatus: (token: string) =>
    apiFetch<{ enabled: boolean; last_used_at?: string }>('/auth/2fa/status', { token }),
};

// Custom Domains API

// SSO API
export const ssoApi = {
  testSso: (token: string, teamId?: string) =>
    apiFetch<{ valid: boolean; provider?: string; message?: string; issues?: string[]; details?: Record<string, Record<string, unknown>> }>(`/sso/test${teamId ? `?team_id=${teamId}` : ''}`, { method: 'POST', token }),
  deleteSso: (token: string, teamId?: string) =>
    apiFetch<{ deleted: boolean }>(`/sso/config${teamId ? `?team_id=${teamId}` : ''}`, { method: 'DELETE', token }),
  getLoginUrl: (email: string) =>
    `/v1/sso/login?email=${encodeURIComponent(email)}`,
};

// Transform types

// Transform API
export const transformsApi = {
  list: (token: string, endpointId: string) =>
    apiFetch<TransformRule[]>(`/endpoints/${endpointId}/transforms`, { token }),

  create: (token: string, endpointId: string, data: { rule: TransformRule['rule_json'] }) =>
    apiFetch<TransformRule>(`/endpoints/${endpointId}/transforms`, { method: 'POST', body: data, token }),

  update: (token: string, endpointId: string, ruleId: string, data: { rule: TransformRule['rule_json'] }) =>
    apiFetch<TransformRule>(`/endpoints/${endpointId}/transforms/${ruleId}`, { method: 'PUT', body: data, token }),

  delete: (token: string, endpointId: string, ruleId: string) =>
    apiFetch<{ success: boolean }>(`/endpoints/${endpointId}/transforms/${ruleId}`, { method: 'DELETE', token }),

  test: (token: string, endpointId: string, data: { payload: unknown; config: TransformRule['rule_json'] }) =>
    apiFetch<Record<string, unknown>>(`/endpoints/${endpointId}/transforms/test`, { method: 'POST', body: data, token }),
};

// Billing usage types





// Extended Billing API
export const billingApiExtended = {
  getUsage: (token?: string) =>
    apiFetch<BillingUsage>('/billing/usage', { token }),

  getSubscription: (token?: string) =>
    apiFetch<BillingSubscription>('/billing/subscription', { token }),

  upgrade: (token: string, plan: string, billingPeriod?: string, discountCode?: string) =>
    apiFetch<{ checkout_url?: string; message?: string; requires_contact?: boolean; contact_url?: string; prorated_amount_cents?: number }>('/billing/upgrade', { method: 'POST', body: { plan, provider: 'polar', billing_period: billingPeriod || 'monthly', ...(discountCode ? { discount_code: discountCode } : {}) }, token }),

  getInvoices: (token: string) =>
    apiFetch<Invoice[]>('/billing/invoices', { token }),

  openPortal: (token: string) =>
    apiFetch<PortalResponse>('/billing/portal', { method: 'POST', token }),

  requestRefund: (token: string, reason: string) =>
    apiFetch<RefundResponse>('/billing/refund', { method: 'POST', body: { reason }, token }),

  pause: (token: string, days?: number) =>
    apiFetch<{ message?: string; paused_until?: string; plan_preserved?: string; keeps_access_until_period_end?: boolean }>('/billing/pause', { method: 'POST', body: { days: days || 30 }, token }),

  resume: (token: string) =>
    apiFetch<{ message?: string; checkout_url?: string; plan?: string }>('/billing/resume', { method: 'POST', token }),

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
