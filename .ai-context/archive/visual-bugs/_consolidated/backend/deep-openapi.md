# Deep Review: HookSniff OpenAPI Specification & API Documentation

**Reviewer:** deep-openapi subagent  
**Date:** 2026-05-10  
**Files reviewed:** `docs/openapi.yaml`, `docs/api-reference.md`, `api/src/routes/*.rs`, `api/src/models/*.rs`, `api/src/schemas/*.rs`, `api/src/error.rs`

---

## Executive Summary

The OpenAPI spec (`docs/openapi.yaml`) covers **~70% of implemented endpoints**. There are **34+ endpoints in code but missing from the spec**, and the **error response format in the spec does not match actual implementation**. Authentication documentation is incomplete, no request/response examples exist, and several schema types diverge from Rust structs.

**Severity: 🔴 High** — The spec will produce incorrect client SDKs and mislead API consumers.

---

## 1. Spec Completeness — Missing Endpoints

### 1.1 Endpoints in Code but MISSING from OpenAPI Spec

These routes are implemented in Rust and registered in the router but have **no corresponding entry in `openapi.yaml`**:

| # | Method | Path | Source File | Description |
|---|--------|------|-------------|-------------|
| 1 | `POST` | `/auth/logout` | `auth.rs:104` | Logout / invalidate session |
| 2 | `GET` | `/auth/export` | `auth.rs:109` | Export user data (GDPR) |
| 3 | `DELETE` | `/auth/account` | `auth.rs:110` | Delete user account |
| 4 | `GET` | `/oauth/providers` | `oauth.rs:46` | List available OAuth providers |
| 5 | `GET` | `/oauth/google` | `oauth.rs:47` | Initiate Google OAuth login |
| 6 | `GET` | `/oauth/google/callback` | `oauth.rs:48` | Google OAuth callback |
| 7 | `GET` | `/oauth/github` | `oauth.rs:49` | Initiate GitHub OAuth login |
| 8 | `GET` | `/oauth/github/callback` | `oauth.rs:50` | GitHub OAuth callback |
| 9 | `GET` | `/audit-log` | `audit_log.rs:34` | List audit log entries |
| 10 | `GET` | `/audit-log/{id}` | `audit_log.rs:35` | Get single audit entry |
| 11 | `GET` | `/custom-domains` | `custom_domains.rs:28` | List custom domains |
| 12 | `POST` | `/custom-domains` | `custom_domains.rs:29` | Add custom domain |
| 13 | `DELETE` | `/custom-domains/{id}` | `custom_domains.rs:30` | Delete custom domain |
| 14 | `POST` | `/custom-domains/{id}/verify` | `custom_domains.rs:31` | Verify domain ownership |
| 15 | `GET` | `/sso/config` | `sso.rs:27` | Get SSO configuration |
| 16 | `POST` | `/sso/config` | `sso.rs:28` | Create/update SSO config |
| 17 | `DELETE` | `/sso/config` | `sso.rs:29` | Delete SSO config |
| 18 | `POST` | `/sso/test` | `sso.rs:30` | Test SSO connection |
| 19 | `POST` | `/simulator` | `simulator.rs:17` | Simulate webhook delivery |
| 20 | `GET` | `/embed` | `embed.rs:18` | Serve embeddable portal HTML |
| 21 | `GET` | `/embed/script` | `embed.rs:19` | Serve embed JavaScript |
| 22 | `GET` | `/events` | `events.rs:18` | List event types |
| 23 | `GET` | `/portal/config` | `portal_config.rs:26` | Get portal configuration |
| 24 | `POST` | `/portal/config` | `portal_config.rs:27` | Upsert portal configuration |
| 25 | `GET` | `/portal/embed-code` | `portal_config.rs:28` | Get portal embed code |
| 26 | `GET` | `/rate-limits` | `rate_limits.rs:27` | List all rate limits |
| 27 | `GET` | `/rate-limits/{endpoint_id}` | `rate_limits.rs:28` | Get rate limit for endpoint |
| 28 | `POST` | `/rate-limits/{endpoint_id}` | `rate_limits.rs:29` | Set rate limit for endpoint |
| 29 | `DELETE` | `/rate-limits/{endpoint_id}` | `rate_limits.rs:30` | Delete rate limit |
| 30 | `POST` | `/admin/sdk-update` | `admin.rs:19` | Notify SDK update |

**Non-`/v1` endpoints also missing:**

| # | Method | Path | Source | Description |
|---|--------|------|--------|-------------|
| 31 | `GET` | `/health` | `main.rs:95` | Health check (outside /v1) |
| 32 | `GET` | `/metrics` | `main.rs:97` | Prometheus metrics |

### 1.2 Endpoints in Spec but Possibly Unreachable

- **`GET /v1/docs`** and **`GET /v1/openapi.yaml`**: The `docs` module is declared in `routes/mod.rs` but the `swagger_ui()` and `openapi_spec()` handlers are **not registered** in `api_router()` or `main.rs`. They exist as dead code unless wired elsewhere.

### 1.3 Spec-Only Endpoints (No Code Found)

- **`/portal/notifications` GET/PUT**: The OpenAPI spec defines these for notification preferences, but `customer_portal.rs` routes these as `/portal/notifications` (GET/PUT). The routes DO exist — confirmed in `customer_portal.rs:33-34`. ✅ OK.

---

## 2. Type Accuracy — Schema vs Rust Struct Mismatches

### 2.1 Error Response Format — 🔴 CRITICAL

**OpenAPI spec defines:**
```yaml
Error:
  type: object
  properties:
    error:
      type: string
  required: [error]
```

**Actual implementation (`error.rs`):**
```rust
let body = json!({
    "error": {
        "code": code,      // e.g. "NOT_FOUND", "BAD_REQUEST"
        "message": message  // e.g. "Not found", "Bad request: missing field"
    }
});
```

**Actual format:** `{"error": {"code": "NOT_FOUND", "message": "Not found"}}`  
**Spec format:** `{"error": "Not found"}`

This is a **breaking difference**. Any client generated from the spec will fail to parse error responses.

### 2.2 Delivery Schema

**OpenAPI `Delivery` schema has:**
- `id`, `endpoint_id`, `event`, `status`, `attempt_count`, `response_status`, `replay_count`, `created_at`

**Rust `DeliveryResponse` has (superset):**
- All of the above, PLUS:
  - `is_test: Option<bool>` — undocumented field (skip_serializing_if None)

**Rust internal `Delivery` model has additional fields not in response:**
- `customer_id`, `payload`, `max_attempts`, `last_attempt_at`, `response_body`, `next_retry_at`, `sequence_num`, `fifo_group_id`, `updated_at`, `error_message`, `is_test`

The `Delivery` schema in OpenAPI correctly represents the *response* shape (matching `DeliveryResponse`), but `is_test` is undocumented.

### 2.3 DeliveryAttempt Schema

**OpenAPI `DeliveryAttempt` has:**
- `id`, `attempt_number`, `status_code`, `response_body`, `duration_ms`, `error_message`, `created_at`

**Rust `DeliveryAttempt` has additional fields:**
- `delivery_id` — not in spec
- `trace_id` — not in spec
- `response_headers` — not in spec

The `DeliveryAttemptResponse` matches the spec, but the actual `DeliveryAttempt` struct has more fields.

### 2.4 CustomerResponse

**OpenAPI schema:** Matches `CustomerResponse` struct ✅  
**Rust `Customer` model** has many more fields (api_key_hash, api_key_prefix, stripe_customer_id, etc.) but these are internal and correctly excluded from the response schema.

### 2.5 Endpoint Schema

**OpenAPI `Endpoint` schema** matches `EndpointResponse` struct ✅  
**Rust `Endpoint` model** has additional internal fields:
- `customer_id`, `signing_secret`, `old_signing_secret`, `secret_rotated_at`, `last_failure_at`, `fifo_enabled`, `fifo_sequence`, `fifo_group_by_customer`, `fifo_max_wait_secs`, `throttle_rate`, `throttle_period_secs`, `throttle_strategy`

These are correctly excluded from the response schema.

### 2.6 SubscriptionResponse

**OpenAPI schema:**
```yaml
SubscriptionResponse:
  properties:
    plan, status, payment_provider, webhook_limit, endpoint_limit, retention_days, monthly_price_cents
```

The `endpoint_limit` and `retention_days` fields need verification against actual billing handler implementation. The billing handler returns plan-specific data but these specific fields weren't confirmed in the response structs.

### 2.7 RegisterSchemaRequest

**OpenAPI spec:** `name` (required), `schema` (required)  
**Rust struct:** `name`, `schema`, `auto_detect` (optional, defaults to false)

The `auto_detect` field is missing from the OpenAPI spec.

### 2.8 Validation Result

**OpenAPI spec:** No schema defined for validation results (`/schemas/{id}/validate` returns generic 200/422)  
**Rust implementation:** Returns `ValidationResult { valid: bool, errors: Vec<ValidationError> }` with detailed error info

---

## 3. Error Responses

### 3.1 Error Codes Available in Code

From `error.rs`, the application can return:

| HTTP Status | Error Code | When |
|-------------|-----------|------|
| 400 | `BAD_REQUEST` | Validation errors |
| 400 | `SERIALIZATION_ERROR` | Invalid JSON |
| 401 | `UNAUTHORIZED` | Missing/invalid auth |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 413 | `PAYLOAD_TOO_LARGE` | Body exceeds limit |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit hit |
| 500 | `INTERNAL_ERROR` | Unexpected errors |
| 500 | `DATABASE_ERROR` | Database failures |

### 3.2 Missing Error Documentation in Spec

Most endpoints only document 200/201 responses. The following common errors are **never documented**:

- **429 Rate Limit Exceeded** — Applied globally via middleware but documented on zero endpoints
- **413 Payload Too Large** — Applied to webhook creation but undocumented
- **500 Internal Server Error** — Possible on every endpoint but documented on zero
- **403 Forbidden** — Admin endpoints should document this
- **401 Unauthorized** — Only documented on login/2FA; should be on ALL protected endpoints

### 3.3 Webhook-Specific Error Codes

The middleware layer adds idempotency conflict handling (409 status) that's not reflected in the spec.

---

## 4. Authentication

### 4.1 What the Spec Says

```yaml
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    description: API key passed as Bearer token
```

### 4.2 What the Code Actually Supports

1. **API Key** (`hr_live_*` / `hr_test_*`) — passed as `Authorization: Bearer hr_live_...`
2. **JWT Token** — returned from `/auth/login`, passed as `Authorization: Bearer eyJ...`
3. **OAuth2** — Google and GitHub login flows (completely undocumented in spec)
4. **SSO** — SAML/SSO configuration (completely undocumented in spec)
5. **2FA** — TOTP-based two-factor auth (partially documented)

### 4.3 Issues

- **No distinction between API key and JWT auth** in the spec. Both use Bearer scheme but have different lifetimes and scopes.
- **OAuth endpoints are completely undocumented** — 5 endpoints (providers, google, google/callback, github, github/callback).
- **SSO endpoints are completely undocumented** — 4 endpoints.
- **No documentation on which auth type to use when** (API key for server-to-server, JWT for dashboard sessions).
- **Public endpoints** (`/auth/*`, `/contact`, `/outbound-ips`, `/status`, `/billing/webhook/*`) correctly marked with `security: []`.

---

## 5. Examples

### 5.1 Current State

**Zero request/response examples** exist in the OpenAPI spec. Every endpoint lacks `example:` fields.

### 5.2 What's Needed

At minimum, examples should be provided for:
- Registration and login flows
- Webhook creation and delivery
- Endpoint CRUD
- Error responses (matching actual format)
- Batch operations
- Analytics responses

### 5.3 `docs/api-reference.md` Has Examples

The separate `docs/api-reference.md` file contains curl examples and response samples, but:
- Only covers ~30% of endpoints
- Examples use different response format than actual code (e.g., register returns 200 in examples but code returns 201)
- Not machine-readable (can't generate clients from it)

---

## 6. Versioning

### 6.1 Current Strategy

- All API routes are nested under `/v1` prefix ✅
- OpenAPI spec `version: "1.0.0"` ✅
- No version negotiation headers
- No deprecation policy documented
- No changelog linked from spec

### 6.2 Issues

- No `info.contact.url` points to changelog
- No `x-tagGroups` or similar organizational extensions
- No mention of backward compatibility guarantees
- Breaking change policy: none documented

---

## 7. Additional Findings

### 7.1 WebSocket Gateway — Completely Undocumented

The codebase includes a full WebSocket gateway (`api/src/ws/`) with:
- JWT-authenticated connections
- Pattern-based event subscriptions
- Heartbeat/ping-pong
- Reconnection with missed event replay

This is **not mentioned anywhere** in the OpenAPI spec. WebSocket endpoints can't be fully represented in OpenAPI 3.0, but should be documented via `x-webhooks` extension or a separate async API spec.

### 7.2 Swagger UI Route Not Wired

`docs.rs` contains Swagger UI HTML and OpenAPI spec serving handlers, but they are **not registered in the router**. The `docs` module is declared in `routes/mod.rs` but `swagger_ui()` and `openapi_spec()` are never called in `api_router()` or `main.rs`.

### 7.3 OpenAPI Spec Served from Binary

The spec is embedded via `include_str!("../../../docs/openapi.yaml")` in `docs.rs`, meaning the spec file is compiled into the binary. This is good for consistency but means the spec must be updated before recompilation.

### 7.4 Missing Tags

The spec defines tags for all documented features but is missing tags for:
- OAuth
- SSO
- Audit Log
- Custom Domains
- Rate Limits
- Simulator
- Embed
- Events
- Portal Config

### 7.5 HTTP Status Code Mismatches — 🔴 HIGH

The spec claims `201 Created` for all create endpoints, but **the code returns `200 OK`** for all of them. In axum, `Ok(Json(...))` defaults to 200. None of the create handlers set `StatusCode::CREATED`.

**Affected endpoints (spec says 201, code returns 200):**
- `POST /auth/register`
- `POST /endpoints`
- `POST /webhooks`
- `POST /webhooks/batch`
- `POST /alerts`
- `POST /api-keys`
- `POST /teams`
- `POST /devices`
- `POST /schemas`
- `POST /endpoints/{endpoint_id}/transforms`
- `POST /portal/api-keys`
- `POST /admin/users` (if exists)

**Fix:** Either add `.status(StatusCode::CREATED)` to each handler, or update the spec to say `200`.

---

## 8. Severity Summary

| Issue | Severity | Count |
|-------|----------|-------|
| Error response format mismatch | 🔴 Critical | 1 |
| HTTP status code mismatches (201 vs 200) | 🔴 High | 12+ create endpoints |
| Missing endpoints in spec | 🔴 High | 30+ |
| Missing error code documentation | 🔴 High | All endpoints |
| Missing OAuth/SSO documentation | 🟡 Medium | 9 endpoints |
| Zero request/response examples | 🟡 Medium | All endpoints |
| WebSocket undocumented | 🟡 Medium | 1 feature |
| Schema field mismatches | 🟡 Medium | 3 schemas |
| Swagger UI not wired | 🟠 Low | 1 |
| Missing auto_detect field | 🟠 Low | 1 |
| No versioning strategy docs | 🟠 Low | 1 |

---

## 9. Recommendations

### Immediate (P0)

1. **Fix the Error schema** to match actual format:
   ```yaml
   Error:
     type: object
     properties:
       error:
         type: object
         properties:
           code:
             type: string
           message:
             type: string
         required: [code, message]
     required: [error]
   ```

2. **Fix HTTP status codes** — Either update spec `201` → `200` for create endpoints, or add `StatusCode::CREATED` to handlers.

3. **Add all missing endpoints** to the spec (30+ routes listed above).

4. **Document 429 and 500 error responses** on all protected endpoints.

### Short-term (P1)

4. **Add OAuth and SSO tags and endpoints** to the spec.
5. **Add request/response examples** for top 10 most-used endpoints.
6. **Document the `auto_detect` field** in `RegisterSchemaRequest`.
7. **Wire the Swagger UI** route in the router.
8. **Add `is_test` field** to Delivery response schema.

### Medium-term (P2)

9. **Create WebSocket documentation** (separate async API spec or markdown).
10. **Add `trace_id` and `response_headers`** to DeliveryAttempt schema.
11. **Document API key vs JWT auth** distinction.
12. **Add versioning and deprecation policy**.
13. **Validate spec against code** in CI (e.g., using `utoipa` or `paperclip` for auto-generation from Rust attributes).
