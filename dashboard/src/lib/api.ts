import type { ApiOptions, Application, RetryPolicyConfig, Endpoint, Delivery, DeliveryDetail, DeliveryAttempt, DeliveryListResponse, StatsResponse, DeliveryTrendResponse, SuccessRateData, LatencyTrendResponse, AuditLogEntryResponse, EndpointHealthResponse, ApiKeyResponse, PortalConfigResponse, PortalEmbedCodeResponse, PortalProfileResponse, PortalUsageResponse, RateLimitResponse, SchemaRegistryListResponse, SearchResponseData, ServiceTokenResponse, TemplateItem, TemplateListResponse, Invoice, TransformRule, BillingUsage, BillingSubscription, OverageSettings, PortalResponse, RefundResponse } from './api-types';
export type * from './api-types';

import { HookSniffError, createApiError, createNetworkError } from './api-errors';

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

// HS-039: Proactive refresh interval — renews token at ~50 min (before 60 min expiry).
let proactiveRefreshTimer: ReturnType<typeof setInterval> | null = null;
// Cleanup function for visibilitychange listener (stored separately, not on the timer number)
let visibilityCleanup: (() => void) | null = null;

// BUG FIX: Multi-tab refresh coordination via BroadcastChannel
// Prevents multiple tabs from refreshing simultaneously (token is one-time-use).
// Lazy init — avoids module-level side effect that blocks tree-shaking.
let refreshChannel: BroadcastChannel | null = null;
function getRefreshChannel(): BroadcastChannel | null {
  if (refreshChannel === null) {
    try { refreshChannel = new BroadcastChannel('hooksniff-auth'); } catch { refreshChannel = undefined as any; }
  }
  return refreshChannel === (undefined as any) ? null : refreshChannel;
}

// HS-039: Global callback for syncing new tokens to the store.
// Registered by AuthProvider on mount. Used by 401 handler and proactive refresh.
let onTokenRefreshed: ((newToken: string) => void) | null = null;

/** Register a callback that fires when a new token is obtained via refresh. */
export function setTokenRefreshCallback(cb: (newToken: string) => void): void {
  onTokenRefreshed = cb;
}

/**
 * Refresh the access token. Returns the new token string on success, null on failure.
 * Deduplicates concurrent calls (only one refresh request at a time).
 * BUG FIX: Notifies other tabs via BroadcastChannel so they sync the new token.
 */
function doRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    // Try to get refresh token from localStorage (fallback for when cookies don't work through proxy)
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('hooksniff_refresh') : null;
    
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...getCSRFHeaders('POST') },
      body: storedRefreshToken ? JSON.stringify({ refresh_token: storedRefreshToken }) : undefined,
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const data = await r.json();
        const newToken = data.token ?? null;
        // Save new refresh token for proxy fallback (Vercel doesn't forward Set-Cookie)
        if (data.refresh_token && typeof window !== 'undefined') {
          localStorage.setItem('hooksniff_refresh', data.refresh_token);
        }
        // BUG FIX: Broadcast new token to other tabs
        if (newToken && getRefreshChannel()) {
          getRefreshChannel()!.postMessage({ type: 'TOKEN_REFRESHED', token: newToken });
        }
        return newToken;
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
 *
 * BUG FIX: Listens for BroadcastChannel messages from other tabs
 * to sync tokens without each tab refreshing independently.
 * BUG FIX: Re-registers onTokenRefreshed callback (cleared by stopProactiveRefresh on logout).
 */
export function startProactiveRefresh(onRefresh: (newToken: string) => void): void {
  stopProactiveRefresh();
  // BUG FIX: Re-register the callback that was cleared by stopProactiveRefresh
  onTokenRefreshed = onRefresh;

  // BUG FIX: Listen for token refreshes from other tabs
  if (getRefreshChannel()) {
    getRefreshChannel()!.onmessage = (event) => {
      if (event.data?.type === 'TOKEN_REFRESHED' && event.data.token) {
        onRefresh(event.data.token);
      }
    };
  }

  proactiveRefreshTimer = setInterval(async () => {
    const newToken = await doRefresh();
    if (newToken) {
      onRefresh(newToken);
    }
    // If refresh fails, don't panic — the reactive 401 handler will catch it
  }, 50 * 60 * 1000); // 50 minutes (token expires in 60 min, refresh 10 min early)

  // BUG FIX: Refresh immediately when tab becomes visible again.
  // Background tabs have setInterval throttled to 1-minute minimum,
  // so the timer may not fire for 15+ minutes. When user returns,
  // the token might be expired. This fixes random logouts on PC.
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      // Check if token is close to expiry (or already expired)
      const token = localStorage.getItem('hooksniff_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiresAt = payload.exp * 1000;
          const now = Date.now();
          const minutesLeft = (expiresAt - now) / 60000;
          // If less than 10 minutes left, refresh immediately
          if (minutesLeft < 10) {
            const newToken = await doRefresh();
            if (newToken) {
              onRefresh(newToken);
            }
          }
        } catch {
          // Token parse error — try refresh anyway
          const newToken = await doRefresh();
          if (newToken) {
            onRefresh(newToken);
          }
        }
      }
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  // Store cleanup function in module-level variable (cannot set properties on a number)
  visibilityCleanup = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/** Stop proactive token refresh. Call on logout. */
export function stopProactiveRefresh(): void {
  if (proactiveRefreshTimer) {
    // Clean up visibility change listener
    if (visibilityCleanup) {
      visibilityCleanup();
      visibilityCleanup = null;
    }
    clearInterval(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
  // BUG FIX: Clean up BroadcastChannel listener
  if (getRefreshChannel()) {
    getRefreshChannel()!.onmessage = null;
  }
  // BUG FIX: Clear any pending refresh promise to prevent stale callbacks
  refreshPromise = null;
  // BUG FIX: Clear the token refresh callback to prevent race condition
  // (logout clears state, then refresh callback fires and restores token)
  onTokenRefreshed = null;
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

  // If caller provided an external signal, forward its abort
  const externalController = new AbortController();
  if (signal) {
    signal.addEventListener('abort', () => externalController.abort(), { once: true });
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // BUG FIX: Create a fresh AbortController for each attempt.
    // Reusing a controller after timeout would make retries immediately fail.
    const controller = new AbortController();
    void setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    // Link external signal
    if (externalController.signal.aborted) controller.abort();
    else externalController.signal.addEventListener('abort', () => controller.abort(), { once: true });

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
            // HS-039: Refresh succeeded — sync token to store, cookie, and localStorage
            if (onTokenRefreshed) onTokenRefreshed(newToken);
            else localStorage.setItem('hooksniff_token', newToken);
            // BUG FIX: Broadcast new token to other tabs (doRefresh already does this,
            // but in case refresh was deduped, ensure all tabs get the token)
            if (getRefreshChannel()) {
              getRefreshChannel()!.postMessage({ type: 'TOKEN_REFRESHED', token: newToken });
            }
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
          // BUG FIX: Stop proactive refresh to prevent zombie timer
          stopProactiveRefresh();
          localStorage.removeItem('hooksniff_user');
          localStorage.removeItem('hooksniff_token');
          window.location.href = '/login';
        }

        // Retry transient errors (502, 503, 504) with exponential backoff
        if (isTransientError(res.status) && attempt < MAX_RETRIES) {
          await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
          continue;
        }

        const error = await res.json().catch(() => ({ message: `API error: ${res.status}` }));
        throw createApiError(error, res.status);
      }

      return res.json();
    } catch (err: unknown) {
      if (err instanceof HookSniffError) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw createNetworkError('Request timed out. Please try again.');
      }
      lastError = err;
      // Don't retry non-network errors (already parsed API errors)
      if (err instanceof Error && err.message.startsWith('API error:')) {
        throw createNetworkError(err.message);
      }
      // Network error — retry with backoff
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
        continue;
      }
      throw createNetworkError('Network error. Please check your connection and try again.');
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
















// Re-export admin API from split module
export { adminApi } from './api-admin';

// Team API

// Re-export teams/notifications/broadcasts/alerts/inbound APIs from split module
export { teamsApi, notificationsApi, broadcastsApi, alertsApi, inboundApi } from './api-teams';

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
    apiFetch<{ secret: string; qr_code: string; otpauth_url?: string; backup_codes: string[] }>('/auth/2fa/enable', { method: 'POST', token }),

  confirm: (token: string, code: string) =>
    apiFetch<{ success: boolean; backup_codes: string[] }>('/auth/2fa/confirm', { method: 'POST', body: { code }, token }),

  verify: (tempToken: string, code: string, backupCode?: string) =>
    apiFetch<{ token: string; customer: { id: string; email: string; name?: string; plan: string; is_admin?: boolean; api_key?: string; avatar_url?: string }; refresh_token?: string }>('/auth/2fa/verify', {
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
    apiFetch<{ checkout_url?: string; message?: string; requires_contact?: boolean; contact_url?: string; prorated_amount_cents?: number }>('/billing/upgrade', { method: 'POST', body: { plan, billing_period: billingPeriod || 'monthly', ...(discountCode ? { discount_code: discountCode } : {}) }, token }),

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
