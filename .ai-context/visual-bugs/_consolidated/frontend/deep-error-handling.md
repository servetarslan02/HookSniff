# Deep Review: Error Handling & User-Facing Messages

**Reviewer:** Subagent (deep-error-messages)  
**Date:** 2026-05-10  
**Scope:** Full error handling chain — API → Frontend → Worker → Monitoring

---

## 1. API Error Responses (`api/src/error.rs`)

### ✅ What's Good

- **Consistent error envelope**: All errors return `{ "error": { "code": "...", "message": "..." } }` — clean, predictable structure.
- **Error codes are SCREAMING_SNAKE_CASE**: `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`, `PAYLOAD_TOO_LARGE`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`, `DATABASE_ERROR`, `SERIALIZATION_ERROR` — good for programmatic consumption.
- **Internal details are NOT leaked**: `AppError::Internal` and `AppError::Database` both return `"Internal server error"` to the client while logging the real error via `tracing::error!`. This is correct.
- **`From` trait implementations** auto-convert `anyhow::Error`, `sqlx::Error`, and `serde_json::Error` into the right `AppError` variant — ergonomic and safe.
- **Comprehensive test suite** validates both the `Display` trait, `From` conversions, and `IntoResponse` behavior including the critical check that internal errors don't leak details.

### ⚠️ Issues Found

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 1 | 🟡 Medium | **`Serialization` error leaks internal details** — `AppError::Serialization` returns `format!("Serialization error: {}", e)` to the client. While `serde_json` errors aren't as dangerous as DB errors, they can reveal internal field names and data structure. | Return a generic `"Invalid request format"` to the client; log the full error server-side. |
| 2 | 🟡 Medium | **No request ID / correlation ID** in error responses. When users report errors, there's no way to correlate client-side errors to server logs. | Add a `request_id` field to the error envelope (generated via middleware). |
| 3 | 🟡 Medium | **No error catalog/enum on the frontend**. Error codes exist server-side but there's no shared schema or TypeScript enum mapping error codes to user-friendly messages. | Create a shared error code enum and map each code to a translated user-facing message. |
| 4 | 🟢 Low | **`BadRequest` messages are developer-facing, not user-facing**. Messages like `"Password must be at least 8 characters"` are fine, but `"2FA setup not initiated. Call /2fa/enable first."` references API internals. | Clean up messages that reference API paths or internal concepts. |
| 5 | 🟢 Low | **No `409 Conflict` variant** — "Email already registered" returns 400 instead of 409. Semantically, 409 is more appropriate for duplicate resource conflicts. | Add `Conflict(String)` variant or use 409 for duplicate resource scenarios. |

### Route-Level Error Handling (api/src/routes/)

**Pattern observed across all route files:**

```rust
async fn handler(...) -> Result<Json<T>, AppError> {
    // Validation → Err(AppError::BadRequest(...))
    // Not found → Err(AppError::NotFound)
    // DB errors → auto-converted via From<sqlx::Error>
    // Internal → Err(AppError::Internal(e.into()))
}
```

This is a **clean, consistent pattern** across:
- `auth.rs` — Registration, login, 2FA, password reset, GDPR endpoints
- `webhooks.rs` — Create, batch, replay, export
- `endpoints.rs` — CRUD, rotate secret, retry policy
- `api_keys.rs` — CRUD, rotate
- `health.rs` — System status, health check
- `health_endpoints.rs` — Per-endpoint health

**Specific findings per route file:**

| Route File | Findings |
|------------|----------|
| `auth.rs` | ✅ Rate limiting on login/register/reset. ✅ Prevents email enumeration (always returns success). ✅ 2FA flow is well-structured. ⚠️ `verify_2fa_login` creates `AppError::Internal(anyhow::anyhow!("TOTP secret missing"))` — this would return "Internal server error" to the user, which is fine but could be a `BadRequest("2FA not properly configured")`. |
| `webhooks.rs` | ✅ Idempotency key support. ✅ Batch error collection with per-item errors. ✅ Payload size validation. ✅ Event filter matching returns `"filtered"` status. ⚠️ `batch_webhooks` formats DB errors into user-facing messages: `format!("Failed to create delivery: {}", e)` — this could leak table names or constraint details. |
| `endpoints.rs` | ✅ SSRF protection. ✅ Custom header validation (X- prefix). ✅ URL validation. ✅ Plan-based endpoint limits with clear upgrade message. |
| `health.rs` | ✅ Public status endpoint (no auth). ✅ CORS headers. ✅ Per-component health (DB, Redis, Worker). ✅ Stuck processing detection. ⚠️ Database error messages in `description` field could leak connection string details in `format!("PostgreSQL connection failed: {e}")`. |
| `admin.rs` | Not fully reviewed but follows same patterns. |

---

## 2. Frontend Error Handling

### 2a. API Client (`dashboard/src/lib/api.ts`)

**✅ Strengths:**
- **Automatic 401 refresh**: On 401, attempts `/auth/refresh` before logging out — good UX.
- **Timeout handling**: 30s request timeout with `AbortController`.
- **Error extraction**: Parses API error response: `error.error?.message || \`API error: ${res.status}\``
- **Credentials included**: `credentials: 'include'` for cookie-based auth.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 6 | 🔴 High | **No retry logic for transient errors** (502, 503, 504, network errors). If the API is briefly unavailable, the user sees an error with no recovery path. | Add exponential backoff retry (1-2 attempts) for 5xx and network errors. |
| 7 | 🟡 Medium | **Generic error messages**: `"Request timed out. Please try again."` and `"Unknown error"` are the only fallback messages. No context about what the user was trying to do. | Include action context: `"Failed to load endpoints. Please try again."` |
| 8 | 🟡 Medium | **No offline detection**: If the user loses network, they get a generic error rather than an "offline" indicator. | Detect `navigator.onLine` and show an offline banner. |
| 9 | 🟡 Medium | **401 refresh loop risk**: If refresh endpoint itself returns 401, the code falls through to logout, but there's no guard against calling refresh multiple times in rapid succession (e.g., multiple concurrent requests all hitting 401). | Use a shared refresh promise or mutex to prevent concurrent refresh attempts. |

### 2b. Error Utility (`dashboard/src/lib/errors.ts`)

```typescript
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'Unknown error';
}
```

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 10 | 🟡 Medium | **`getErrorMessage` is used in some places but not consistently**. Many `catch` blocks use `err instanceof Error ? err.message : 'Failed to...'` inline instead of calling this utility. | Enforce consistent use of `getErrorMessage` everywhere. |
| 11 | 🟢 Low | **No error message translation**. The utility returns raw English strings. | Return i18n keys instead of raw messages, or wrap with `t()` at the call site. |

### 2c. Toast Notifications (`dashboard/src/components/Toast.tsx`)

**✅ Strengths:**
- Clean context-based toast system.
- Three types: success, error, info.
- Auto-dismiss after 4 seconds.
- Animated slide-up.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 12 | 🟡 Medium | **No "warning" type**. Only success/error/info. Missing a yellow warning state for non-critical issues (e.g., "Rate limit approaching"). | Add `warning` type with appropriate styling. |
| 13 | 🟡 Medium | **Toast messages are not translated**. Some pages pass translated strings (`t('configCreated')`), but many pass raw English: `'Copied!'`, `'Portal configuration saved!'`, `'Signature computed!'`. | Ensure all toast messages use i18n. |
| 14 | 🟢 Low | **No dismiss button**. Users must wait 4 seconds. For error messages that might need reading, this is too short. | Add manual dismiss (X button) for error toasts, or increase timeout to 6-8s for errors. |
| 15 | 🟢 Low | **No accessibility**: No `role="alert"` or `aria-live` on toast container. | Add `role="alert"` and `aria-live="assertive"` for screen readers. |

### 2d. Error Boundary (`dashboard/src/components/ErrorBoundary.tsx`)

**✅ Strengths:**
- Catches React rendering errors.
- Shows error message and "Try again" button.
- Supports custom fallback.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 16 | 🟡 Medium | **Logs to console only**: `console.error('ErrorBoundary caught:', error, errorInfo)` — in production, these errors are lost. | Send to error tracking service (Sentry, LogRocket, etc.). |
| 17 | 🟢 Low | **Shows raw error message to users**: `this.state.error?.message` might contain technical details. | Show a user-friendly message; log the technical details. |

### 2e. Global Error Page (`dashboard/src/app/[locale]/error.tsx`)

**✅ Strengths:**
- Full-page error UI with clear "Something went wrong" message.
- Reset button to retry.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 18 | 🟡 Medium | **Logs to console only** — same as ErrorBoundary. | Send to error tracking. |
| 19 | 🟢 Low | **Generic message** — "An unexpected error occurred" doesn't help users understand if it's their fault or ours. | Differentiate between client errors and server errors if possible. |

### 2f. Dashboard Pages — Error Handling Patterns

**Survey of catch blocks across dashboard pages:**

| Page | Error Handling Quality |
|------|----------------------|
| `billing/page.tsx` | ✅ Uses `getErrorMessage(err)` and toast |
| `portal-customize/page.tsx` | ⚠️ Inline `err instanceof Error ? err.message : 'Failed to...'` |
| `sso/page.tsx` | ⚠️ Same inline pattern |
| `inbound/page.tsx` | ✅ Uses `t('configFailed')` (translated!) |
| `signature-verifier/page.tsx` | ⚠️ Generic `'Failed to compute signature'` |
| `playground/page.tsx` | ⚠️ Mixed: some `catch {}` with no error display |
| `webhook-builder/page.tsx` | ⚠️ Generic catch |
| `api-importer/page.tsx` | ⚠️ Mixed error handling |
| `portal/page.tsx` | ❌ `console.error` only — errors logged but NOT shown to user |
| `rate-limiting/page.tsx` | ⚠️ Bare `catch {}` — errors silently swallowed |

**Critical finding:** Several pages have `catch {}` blocks that silently swallow errors — the user gets no feedback that something failed.

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 20 | 🔴 High | **Silent error swallowing** in `rate-limiting/page.tsx`, `playground/page.tsx`, and others. `catch {}` with no toast or error display. | Every catch block must show user-facing feedback. |
| 21 | 🟡 Medium | **Inconsistent error display patterns**: Some pages use `toast()`, some use inline error state, some use `console.error` only. | Standardize on toast for transient errors, inline error state for form validation. |
| 22 | 🟡 Medium | **Error messages not translated on many pages**: Hardcoded English strings like `'Failed to save portal config'`, `'Failed to send webhook'`. | All user-facing error messages must go through i18n. |

---

## 3. Worker Error Handling (`worker/src/`)

### 3a. Delivery Module (`worker/src/delivery/`)

**✅ Strengths:**
- **Structured delivery result**: `DeliveryResult` captures success, status_code, response_body, response_headers, duration_ms, and error.
- **Response body truncation**: `truncate_str(&body, 1000)` prevents storing massive payloads.
- **Network error differentiation**: `is_network_error` flag distinguishes HTTP errors from connection failures.
- **Comprehensive logging**: Spans with delivery_id, endpoint_id, attempt number, endpoint_url.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 23 | 🟡 Medium | **No response header redaction**: Response headers from target endpoints are stored in full, which could include sensitive headers (Set-Cookie, Authorization, etc.). | Redact sensitive headers before storing. |
| 24 | 🟢 Low | **Email delivery logs service account errors**: `warn!("Failed to read service account file {}: {}", sa_path, e)` — the `sa_path` could be sensitive in shared environments. | Log only the error, not the path. |

### 3b. Main Worker Loop (`worker/src/main.rs`)

**✅ Strengths:**
- **Zombie reaper**: Recovers stuck "processing" records every 30 seconds.
- **Orphaned delivery reaper**: Re-queues deliveries with no active queue entry.
- **Graceful shutdown**: SIGTERM/SIGINT handling with in-flight delivery completion.
- **Concurrent processing**: Each delivery runs in its own tokio task.
- **Exponential backoff**: 30s → 60s → 120s → 300s → 600s → 1800s (max 30 min).
- **Dead letter handling**: After max attempts, delivery is moved to `dead_letters` table.
- **FOR UPDATE SKIP LOCKED**: Prevents duplicate processing in multi-worker deployments.
- **PgListener reconnection**: Handles NOTIFY connection failures gracefully.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 25 | 🟡 Medium | **No alerting on dead letter creation**: When a delivery hits max attempts and moves to dead letter, it's logged with `tracing::error!` but there's no webhook/email/pager notification to the customer. | Trigger customer-configured notifications (email, Slack, Discord) on dead letter. |
| 26 | 🟡 Medium | **No metrics export from worker**: The API has Prometheus metrics (`Metrics` struct) but the worker doesn't export delivery success/failure rates, latency histograms, or queue depth. | Add Prometheus metrics endpoint to worker. |
| 27 | 🟢 Low | **Task panics are logged but not alerted**: `tracing::error!("❌ Delivery task panicked: {:?}", e)` — a panic in delivery logic could go unnoticed. | Add panic counting metric and alert threshold. |

### 3c. Fan-out Engine (`worker/src/fanout.rs`)

**✅ Strengths:**
- Per-target dead letter support.
- Condition evaluation with nested field paths.
- Pattern matching for event types.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 28 | 🟡 Medium | **`send_to_dead_letter` uses `Uuid::nil()` for customer_id**: The customer_id is hardcoded to nil instead of being passed from context. This breaks customer-specific dead letter queries. | Pass customer_id from the webhook context. |

---

## 4. Logging Quality

### API Logging

**✅ Good:**
- Uses `tracing` crate throughout (structured logging).
- Consistent emoji prefixes for log levels (✅ success, ⚠️ warning, ❌ error, 🔑 security, 📧 email).
- Logs include relevant context (customer_id, email, delivery_id, endpoint_id).
- Sensitive data (passwords, tokens, API keys) are NOT logged.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 29 | 🟡 Medium | **No JSON logging in API**: The API uses `tracing` but I don't see JSON format configuration (the worker has it). In production, text logs are harder to parse. | Add JSON logging config for production (like the worker does with `tracing_subscriber::fmt::layer().json()`). |
| 30 | 🟡 Medium | **No request ID propagation**: Logs don't include a request ID that could be correlated with the client's error response. | Add request ID middleware and include it in all log spans. |

### Worker Logging (`worker/src/telemetry.rs`)

**✅ Excellent:**
- **OpenTelemetry integration**: Full OTLP exporter support with configurable endpoint and headers.
- **JSON logging in production**: `APP_ENV=production` triggers JSON format.
- **Trace ID extraction**: `current_trace_id()` captures OTel trace IDs for DB storage.
- **Structured spans**: `tracing::info_span!("delivery-attempt", delivery_id, endpoint_id, attempt, endpoint_url)`.
- **Graceful OTel shutdown**: `opentelemetry::global::shutdown_tracer_provider()` on exit.

**This is production-grade logging.** The worker's telemetry is significantly better than the API's.

---

## 5. Monitoring & Alerting

### Prometheus Metrics (`api/src/metrics.rs`)

**✅ Strong metrics coverage:**
- `http_requests_total` (method, path, status)
- `http_request_duration_seconds` (histogram)
- `active_connections` (gauge)
- `webhook_deliveries_total` (status)
- `delivery_count` (endpoint_id, status)
- `delivery_latency_seconds` (histogram)
- `error_count` (error_type)
- `active_endpoints` (gauge)
- `queue_publish_latency_seconds` (histogram)
- `db_query_duration_seconds` (histogram)

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 31 | 🟡 Medium | **No alerting configuration**: Metrics are exported but there's no Prometheus alerting rules, Grafana dashboards, or PagerDuty/Opsgenie integration defined in the codebase. | Add alerting rules for: error rate > 5%, p99 latency > 5s, queue depth > 1000, dead letter rate > 10/hour. |
| 32 | 🟡 Medium | **Worker has no metrics endpoint**: Only the API exports Prometheus metrics. The worker's delivery success/failure rates, latency, and queue processing rates are not tracked. | Add `/metrics` endpoint to worker health server. |
| 33 | 🟢 Low | **`error_count` metric exists but I don't see it being incremented** in route handlers. The `metrics_middleware` records HTTP status codes but doesn't increment `error_count` by error type. | Wire `error_count` into the error handling path or middleware. |

### Health Checks

**✅ Good:**
- Public `/v1/status` endpoint with per-component health.
- Worker health server at `/health` for Cloud Run.
- Stuck processing detection (>5 min).

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 34 | 🟢 Low | **Uptime is placeholder**: `uptime_30d: 100.0` is hardcoded. No historical uptime tracking. | Implement actual uptime tracking (store daily uptime percentage). |

---

## 6. i18n / Translation Coverage

**Languages supported:** en, de, es, fr, ja, ko, pt-BR, tr — 8 languages.

**Error-related translations found in `en.json`:**
- `"error"`, `"failed"`, `"success"`, `"sendSuccess"`, `"sendFailed"`, `"replaySuccess"`, etc.

**⚠️ Issues:**

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 35 | 🟡 Medium | **API error messages are NOT translated**: All `AppError::BadRequest("...")` messages are in English. When the dashboard displays these, they appear in English regardless of locale. | Either: (a) return error codes only and translate on frontend, or (b) add `Accept-Language` header support to API. |
| 36 | 🟡 Medium | **Toast messages are mixed**: Some pages use `t('configCreated')` (translated), others use hardcoded `'Copied!'`, `'Signature computed!'`. | Audit all toast messages for translation coverage. |
| 37 | 🟢 Low | **`errors.ts` returns English-only fallback**: `"Unknown error"` is not translated. | Use `t('unknownError')` or similar. |

---

## 7. Security Considerations

| # | Status | Finding |
|---|--------|---------|
| 38 | ✅ Good | Internal errors don't leak stack traces or DB details to clients. |
| 39 | ✅ Good | API keys are hashed before storage; only prefix is shown. |
| 40 | ✅ Good | Signing secrets are rotated with 24h grace period. |
| 41 | ✅ Good | CSRF: HttpOnly cookies + SameSite=None for cross-origin. |
| 42 | ✅ Good | SSRF protection on endpoint URLs. |
| 43 | ✅ Good | Rate limiting on auth endpoints. |
| 44 | ✅ Good | CSV export has formula injection prevention (`escape_csv_cell`). |
| 45 | ⚠️ Medium | `Serialization` error variant leaks internal field names in error message. |
| 46 | ⚠️ Medium | Health check `description` field could leak DB connection errors. |

---

## Summary

### Overall Assessment: **B+ (Good, with room for improvement)**

The error handling architecture is **well-designed** at the foundation level:
- Clean `AppError` enum with proper status codes
- Internal details correctly hidden from clients
- Worker has excellent telemetry (OpenTelemetry)
- Prometheus metrics are comprehensive
- Dead letter handling is thorough

### Priority Action Items

| Priority | Action | Effort |
|----------|--------|--------|
| 🔴 P0 | Fix silent error swallowing in dashboard pages (catch {} with no user feedback) | 1-2h |
| 🔴 P0 | Add retry logic for transient 5xx errors in `apiFetch` | 2-3h |
| 🟡 P1 | Add request ID to API error responses and log correlation | 4-6h |
| 🟡 P1 | Wire error tracking (Sentry/LogRocket) for ErrorBoundary and global error page | 2-4h |
| 🟡 P1 | Standardize toast usage and ensure all error messages are translated | 4-8h |
| 🟡 P1 | Add Prometheus metrics to worker | 2-4h |
| 🟡 P1 | Add alerting rules for error rate, latency, dead letters | 2-4h |
| 🟡 P2 | Create shared error code enum (API ↔ Frontend) | 4-6h |
| 🟡 P2 | Fix `Serialization` error variant to not leak internal details | 30min |
| 🟢 P3 | Add `warning` toast type, dismiss button, accessibility | 2-4h |
| 🟢 P3 | Implement real uptime tracking (replace 100.0 placeholder) | 4-8h |
| 🟢 P3 | Redact sensitive headers in worker delivery response storage | 1-2h |
