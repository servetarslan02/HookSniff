# Deep Code Quality Analysis — HookSniff

**Date:** 2026-05-10  
**Scope:** `api/src/`, `worker/src/`, `dashboard/src/`, `sdks/`  
**Total source lines reviewed:** ~70,966 (API: 34,658 | Worker: 2,400 | Dashboard: 28,686 | SDKs: 5,222)

---

## Executive Summary

The HookSniff codebase has **significant code duplication**, particularly in cryptographic signing logic (reimplemented 6+ times), billing provider integrations (3 near-identical implementations), and SDK verification code (duplicated across every language SDK). There are **67+ functions exceeding 100 lines**, with the worst offenders reaching 400-700+ lines. Dead code is relatively contained, but architectural issues around tight coupling and missing abstractions are pervasive.

**Severity breakdown:**
- 🔴 Critical: 4 issues
- 🟠 High: 8 issues
- 🟡 Medium: 12 issues
- 🔵 Low: 6 issues

---

## 1. Code Duplication

### 🔴 1.1 Signing/Crypto Logic — Duplicated 6+ Times

**The single worst duplication in the codebase.** HMAC-SHA256 signing and Standard Webhooks verification is reimplemented independently in:

| Location | Lines | Purpose |
|----------|-------|---------|
| `api/src/signing.rs` | 491 | API-layer signing + verification |
| `worker/src/signing.rs` | 340 | Worker-layer signing (copy-paste) |
| `sdks/node/src/verify.ts` | ~180 | Node SDK verification |
| `sdks/rust/src/lib.rs` | ~170 | Rust SDK verification |
| `sdks/python/hooksniff/verify.py` | ~200 | Python SDK verification |
| `sdks/java/.../WebhookVerification.java` | ~120 | Java SDK verification |
| `api/src/billing/stripe.rs` | ~50 | Stripe webhook verification |
| `api/src/billing/polar.rs` | ~50 | Polar webhook verification |
| `api/src/billing/iyzico.rs` | ~50 | iyzico webhook verification |

**Evidence:**
```
api/src/signing.rs:239:     HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
worker/src/signing.rs:55:   HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
```

Both `api/src/signing.rs` and `worker/src/signing.rs` define `type HmacSha256 = Hmac<Sha256>` independently, and `compute_hmac()` is identical in both files.

**Recommendation:** Extract a shared `hooksniff-crypto` crate used by both `api` and `worker`. For SDKs, generate verification code from a single spec or reference implementation.

---

### 🔴 1.2 Billing Provider Triplication

Three billing providers (`stripe.rs` 740 lines, `polar.rs` 651 lines, `iyzico.rs` 643 lines) share nearly identical patterns:

- Each defines `type HmacSha256 = Hmac<Sha256>` (same line, 3 times)
- Each has a `from_env()` constructor with sandbox/production URL switching
- Each has `verify_signature()` with identical HMAC + timestamp tolerance logic
- Each has `create_checkout()` with identical HTTP client patterns
- Each has `handle_webhook()` with identical event parsing

**Duplicated structure across all 3:**
```rust
// Stripe, Polar, and iyzico all repeat this pattern:
type HmacSha256 = Hmac<Sha256>;
struct ProviderConfig { from_env() -> Option<Self> }
struct Provider { verify_signature(), create_checkout(), handle_webhook() }
```

The `verify_signature()` implementations differ only in header format parsing but share identical HMAC computation, timestamp validation, and constant-time comparison logic.

**Recommendation:** Create a `WebhookVerifier` trait/struct in `billing/provider.rs` that handles the common HMAC + timestamp tolerance pattern. Each provider only implements its header format parsing.

---

### 🟠 1.3 Industry Package Template Duplication

`api/src/industry/healthcare.rs` (348 lines) and `api/src/industry/saas.rs` (330 lines) are structurally identical — same `IndustryPackage` trait impl, same `default_events()` pattern, same `webhook_templates()` pattern. Only the event names and descriptions differ.

**Recommendation:** Use a macro or data-driven approach (e.g., YAML/JSON config) to define industry packages.

---

### 🟠 1.4 Route Handler Boilerplate

34 route files in `api/src/routes/` all follow the same pattern:
```rust
pub fn router() -> Router {
    Router::new()
        .route(..., get(handler).post(handler))
}
async fn handler(Extension(pool): Extension<PgPool>, Extension(customer): Extension<Customer>, ...) -> Result<...> {
    // identical error mapping pattern
}
```

The `Extension(pool): Extension<PgPool>` + `Extension(customer): Extension<Customer>` extraction pattern appears **232 times** across route files.

**Recommendation:** Create a `FromRequest` extractor that bundles pool + customer, or use Axum's `State` pattern.

---

### 🟡 1.5 Duplicate StatusBadge Components

Two StatusBadge components exist:
- `dashboard/src/components/StatusBadge.tsx` (97 lines) — full implementation
- `dashboard/src/components/tremor/StatusBadge.tsx` — re-exports from above

This is actually fine (proper re-export pattern). No action needed.

---

### 🟡 1.6 Duplicate Playground Pages

Two playground pages exist with different implementations:
- `dashboard/src/app/[locale]/playground/page.tsx` (911 lines) — public-facing
- `dashboard/src/app/[locale]/dashboard/playground/page.tsx` (695 lines) — dashboard-internal

They share similar state management and webhook testing logic but are distinct enough to warrant separate files. However, shared utilities (payload templates, fetch logic) should be extracted.

---

### 📊 Duplication Estimate

| Category | Duplicated Lines | % of Total |
|----------|-----------------|------------|
| Signing/crypto | ~1,200 | 1.7% |
| Billing providers | ~800 | 1.1% |
| Industry packages | ~300 | 0.4% |
| Route boilerplate | ~500 | 0.7% |
| SDK verification | ~700 | 1.0% |
| **Total** | **~3,500** | **~5%** |

---

## 2. Dead Code

### 🟡 2.1 Unused SDK Directories

Several SDK directories exist with zero source files:
- `sdks/csharp/` — empty
- `sdks/go/` — empty
- `sdks/php/` — empty
- `sdks/ruby/` — empty
- `sdks/swift/` — empty

These are placeholder directories that add noise.

---

### 🟡 2.2 Commented-Out TODOs

```typescript
// dashboard/src/app/api/newsletter/route.ts:103-105
// TODO: Production — store to database or mailing list service
// TODO: Production — send confirmation email (double opt-in)
// TODO: Production — send welcome email
```

Three sequential TODOs indicate incomplete feature implementation left in production code.

---

### 🟡 2.3 Excessive `unwrap()` in Production Code

| File | `unwrap()` count |
|------|-----------------|
| `api/src/models/delivery.rs` | 35 |
| `api/src/models/customer.rs` | 35 |
| `api/src/routes/admin.rs` | 25 |
| `api/src/auth/jwt.rs` | 23 |
| `api/src/transform/filter.rs` | 18 |
| `api/src/schemas/registry.rs` | 18 |

Many of these are in test code, but the models files have `unwrap()` in production paths (serde deserialization defaults) that could panic on malformed data.

---

### 🔵 2.4 No `#[allow(dead_code)]` Found

No explicit dead code suppression was found, which is good — the codebase doesn't silence warnings.

---

## 3. Code Smells

### 🔴 3.1 God Functions (>200 lines)

**28 functions exceed 200 lines.** The worst offenders:

| Function | File | Lines |
|----------|------|-------|
| `validate_secret()` | `api/src/config.rs:104` | 701 |
| `handle_inbound_to_endpoint()` | `api/src/routes/inbound.rs:367` | 494 |
| `process_webhook_result()` | `api/src/routes/billing.rs:429` | 403 |
| `process_pending()` | `worker/src/main.rs:256` | 360 |
| `resolve_provider()` | `api/src/billing/mod.rs:111` | 371 |
| `run_migrations()` | `api/src/db.rs:60` | 941 |
| `notify_sdk_update()` | `api/src/routes/admin.rs:534` | 349 |
| `rate_limit_middleware()` | `api/src/rate_limit.rs:413` | 336 |
| `change_role()` | `api/src/routes/teams.rs:423` | 282 |
| `verify_totp_code()` | `api/src/routes/auth.rs:1085` | 200 |

**`run_migrations()` at 941 lines** is by far the worst — it's a monolithic function containing all SQL migration statements.

**`validate_secret()` at 701 lines** in config.rs is a single function that validates every config field with extensive regex and business logic.

**Recommendation:** Break `run_migrations()` into individual migration files/functions. Extract `validate_secret()` into per-field validators.

---

### 🟠 3.2 Files Exceeding 500 Lines

| File | Lines |
|------|-------|
| `blog/[slug]/page.tsx` | 1,922 |
| `api/src/routes/auth.rs` | 1,285 |
| `api/src/db.rs` | 1,029 |
| `api/src/routes/webhooks.rs` | 1,015 |
| `playground/page.tsx` | 911 |
| `api/src/routes/admin.rs` | 883 |
| `api/src/routes/inbound.rs` | 861 |
| `api/src/transform/mod.rs` | 833 |
| `api/src/routes/billing.rs` | 832 |
| `worker/src/main.rs` | 807 |
| `api/src/config.rs` | 805 |
| `api/src/fifo/mod.rs` | 766 |
| `api/src/rate_limit.rs` | 749 |
| `api/src/models/endpoint.rs` | 747 |
| `api/src/billing/stripe.rs` | 740 |
| `api/src/routes/teams.rs` | 705 |

**16 files exceed 500 lines**, with `auth.rs` and `db.rs` being the worst Rust offenders.

---

### 🟠 3.3 67 Functions Exceed 100 Lines

The full list is extensive (see Appendix A). Key observations:
- Route handlers are the most common offenders — they mix validation, business logic, database queries, and response formatting
- The `routes/` directory alone has 40+ oversized functions
- `api/src/billing/mod.rs:resolve_provider()` is 371 lines — a match statement that should be refactored

---

### 🟡 3.4 Magic Numbers

| Location | Number | Context |
|----------|--------|---------|
| `routes/contact.rs:37` | `5000` | Max message length |
| `routes/notifications.rs:73` | `100` | Max per_page |
| `routes/rate_limits.rs:152-153` | `10000` | Max RPS/burst |
| `routes/analytics.rs:153` | `100.0` | Percentage calculation |
| `routes/analytics.rs:256` | `168` | Hours in 7 days |
| `routes/analytics.rs:264` | `720` | Hours in 30 days |

**Recommendation:** Extract as named constants (e.g., `MAX_CONTACT_MESSAGE_LEN`, `MAX_PAGE_SIZE`).

---

## 4. Architectural Issues

### 🔴 4.1 Tight Coupling: `api/src/main.rs` Monolith

The API has 28 modules declared in `lib.rs`, many with circular-style dependencies through `crate::` imports. The `routes/` modules directly import from `models/`, `billing/`, `middleware/`, `schemas/`, `transform/`, `validation/`, `signing/`, `email/`, `notifications/`, `templates/`, and `crypto/`.

**Dependency graph (simplified):**
```
routes/ → models/, billing/, middleware/, schemas/, transform/, validation/, signing/, email/
billing/ → config/, error/, models/, signing/
middleware/ → signing/, config/, auth/, models/
models/ → (standalone, but heavy)
```

While not technically circular, the `routes/` layer is a god-module that depends on nearly everything.

---

### 🟠 4.2 Missing Shared Crate Between API and Worker

`api/` and `worker/` are separate Cargo packages but duplicate:
- Signing logic (`signing.rs`)
- Config patterns (`config.rs`)
- Error types

They should share a `hooksniff-common` crate.

---

### 🟠 4.3 Inconsistent Billing Provider Pattern

The `resolve_provider()` function in `billing/mod.rs` returns `Option<Box<dyn PaymentProviderImpl>>` for Polar/iyzico but returns `None` for Stripe (falling back to legacy code paths). This means Stripe is handled differently from other providers, creating two parallel code paths.

---

### 🟡 4.4 `db.rs` as Migration Monolith

`api/src/db.rs` (1,029 lines) contains `run_migrations()` which is a 941-line function with inline SQL. This should use a proper migration framework (sqlx-migrate or refinery) with separate migration files.

---

### 🟡 4.5 Inconsistent Error Handling

Billing providers use different error patterns:
- Stripe: `AppError::Internal(anyhow::anyhow!(...))`
- Polar: `AppError::BadRequest(format!(...))`
- iyzico: Mix of both

---

## 5. Rust-Specific Issues

### 🟠 5.1 Excessive `clone()` — 190 Occurrences

Top offenders:
| File | Count |
|------|-------|
| `api/src/transform/templates.rs` | 18 |
| `api/src/transform/mod.rs` | 17 |
| `api/src/metrics.rs` | 11 |
| `api/src/routes/health.rs` | 10 |
| `api/src/rate_limit.rs` | 9 |
| `worker/src/main.rs` | 8 |

Many of these are on `String` and `Vec<String>` types that could use `&str` or `&[String]` references instead.

---

### 🟡 5.2 Inefficient String Handling

Multiple places create `format!()` strings only to immediately call `.as_bytes()`:
```rust
// api/src/signing.rs
let signed_content = format!("{}.{}.{}", msg_id, timestamp, body);
mac.update(signed_content.as_bytes());
```

This allocates a `String` on the heap just to pass bytes to HMAC. Could use `Write` trait or chained `.update()` calls.

---

### 🟡 5.3 Missing `#[derive]` Macros

`worker/src/config.rs` uses `#[derive(Debug, Clone)]` while `api/src/config.rs` implements `Debug` manually. The manual impl is correct (for redaction), but the pattern should be consistent.

---

## 6. TypeScript-Specific Issues

### 🟠 6.1 `any` Type Usage — 15+ Occurrences in Production Code

| File | Line | Usage |
|------|------|-------|
| `sdks/node/src/index.ts:141` | `mapEndpoint(data: any)` |
| `sdks/node/src/index.ts:159` | `mapDelivery(data: any)` |
| `sdks/node/src/index.ts:172` | `mapAttempt(data: any)` |
| `sdks/node/src/index.ts:188` | `const body: any = { url: req.url }` |
| `sdks/node/src/index.ts:210` | `const data = resp as any` |
| `sdks/node/src/index.ts:237` | `const body: any = { ... }` |
| `sdks/node/src/index.ts:268,294,306,322,337,449` | Multiple `as any` casts |
| `dashboard/.../integrations/page.tsx:119` | `normalizeEvent(provider: string, payload: any)` |
| `dashboard/.../blog/[slug]/page.tsx:556` | `handleWebhook(event: any)` |

The Node SDK has the worst `any` usage — nearly every API response is cast through `as any` instead of using proper type guards.

**Recommendation:** Define response types and use runtime validation (e.g., Zod) for API responses.

---

### 🟡 6.2 Repeated Dashboard Page Patterns

42 instances of `const [loading, setLoading]` + `const [error, setError]` across dashboard pages. This loading/error/fetch pattern is copy-pasted into every page component.

**Recommendation:** Create a `useApiQuery` hook or use a data-fetching library (SWR/React Query).

---

### 🟡 6.3 Missing Type Definitions

The Node SDK (`sdks/node/src/index.ts`, 610 lines) has many `as any` casts instead of proper response types. The `mapEndpoint`, `mapDelivery`, `mapAttempt` functions all accept `any` and return typed objects — this is unsafe.

---

## 7. Summary of Recommendations

### Critical (Do First)
1. **Extract shared crypto crate** — Unify `api/src/signing.rs` and `worker/src/signing.rs` into `hooksniff-common`
2. **Refactor billing providers** — Extract common webhook verification + HTTP patterns into shared abstractions
3. **Break up god functions** — `run_migrations()` (941 lines), `validate_secret()` (701 lines), `handle_inbound_to_endpoint()` (494 lines)
4. **Eliminate `any` in Node SDK** — Add proper response types with runtime validation

### High Priority
5. **Create `useApiQuery` hook** — Eliminate 42+ duplicate loading/error patterns in dashboard
6. **Extract route handler boilerplate** — Create shared extractors for pool+customer
7. **Use migration framework** — Replace inline SQL in `db.rs` with sqlx-migrate
8. **Extract magic numbers** — Create named constants for limits and thresholds

### Medium Priority
9. **Clean up empty SDK directories** — Remove or populate csharp/go/php/ruby/swift
10. **Reduce `clone()` usage** — Audit the 190 occurrences, prefer references
11. **Standardize error handling** — Consistent patterns across billing providers
12. **Extract industry packages** — Use data-driven approach instead of per-industry code

### Low Priority
13. **Add missing `#[derive]` macros** — Standardize Debug/Clone patterns
14. **Optimize string handling** — Use `Write` trait for HMAC updates
15. **Clean up TODOs** — Implement or remove newsletter TODOs

---

## Appendix A: Functions Exceeding 100 Lines (Partial List)

<details>
<summary>Click to expand (67 functions)</summary>

| File | Function | Lines |
|------|----------|-------|
| `api/src/config.rs:104` | `validate_secret()` | 701 |
| `api/src/db.rs:60` | `run_migrations()` | 941 |
| `api/src/routes/inbound.rs:367` | `handle_inbound_to_endpoint()` | 494 |
| `api/src/models/endpoint.rs:294` | `matches_cidr()` | 453 |
| `api/src/routes/billing.rs:429` | `process_webhook_result()` | 403 |
| `api/src/billing/mod.rs:111` | `resolve_provider()` | 371 |
| `worker/src/main.rs:256` | `process_pending()` | 360 |
| `api/src/routes/admin.rs:534` | `notify_sdk_update()` | 349 |
| `api/src/rate_limit.rs:413` | `rate_limit_middleware()` | 336 |
| `api/src/middleware/webhook_verify.rs:26` | `webhook_verify_middleware()` | 290 |
| `api/src/ws/handler.rs:267` | `authenticate_ws_token()` | 285 |
| `api/src/routes/teams.rs:423` | `change_role()` | 282 |
| `api/src/transform/mod.rs:575` | `create_legacy_transformer()` | 258 |
| `api/src/signing.rs:237` | `compute_hmac()` | 254 |
| `api/src/templates/library.rs:207` | `twilio_like_template()` | 241 |
| `api/src/schemas/mod.rs:266` | `check_schema_compatible()` | 296 |
| `api/src/middleware/mod.rs:322` | `extract_refresh_token()` | 224 |
| `api/src/routes/playground.rs:106` | `test_webhook()` | 228 |
| `worker/src/delivery/mod.rs:176` | `deliver_email()` | 228 |
| `api/src/metrics.rs:204` | `metrics_handler()` | 229 |
| `api/src/routes/webhooks.rs:797` | `get_delivery_attempts()` | 218 |
| `api/src/retry_policy/mod.rs:432` | `format_duration()` | 210 |
| `api/src/routes/events.rs:51` | `list_events()` | 206 |
| `api/src/routes/health.rs:237` | `health_check()` | 203 |
| `api/src/routes/analytics.rs:169` | `latency_trend()` | 203 |
| `api/src/routes/auth.rs:1085` | `verify_totp_code()` | 200 |
| `api/src/main.rs:17` | `main()` | 193 |
| `api/src/throttle/mod.rs:188` | `run_throttle_migration()` | 184 |
| `api/src/auth/jwt.rs:105` | `verify_password()` | 181 |
| `api/src/routes/delivery_details.rs:139` | `get_attempt_detail()` | 179 |
| `api/src/routes/health.rs:59` | `system_status()` | 178 |
| `api/src/transform/filter.rs:176` | `resolve_json_path()` | 155 |
| `api/src/billing/stripe.rs:585` | `verify_webhook_signature()` | 155 |
| `api/src/routes/customer_portal.rs:274` | `update_notifications()` | 155 |
| `api/src/routes/simulator.rs:48` | `simulate_webhook()` | 155 |
| `api/src/middleware/idempotency.rs:279` | `cleanup_expired_webhooks()` | 150 |
| `api/src/routes/endpoints.rs:304` | `rotate_secret()` | 148 |
| `worker/src/main.rs:80` | `main()` | 147 |
| `api/src/fifo/mod.rs:623` | `run_fifo_migration()` | 143 |
| `api/src/routes/routing.rs:142` | `get_health()` | 142 |
| `api/src/routes/schemas.rs:104` | `validate_event()` | 138 |
| `api/src/routes/inbound.rs:232` | `handle_inbound()` | 135 |
| `api/src/routes/search.rs:37` | `search_deliveries()` | 132 |
| `api/src/jobs/retention.rs:118` | `run_retention()` | 124 |
| `api/src/routes/search.rs:182` | `parse_date_to_str()` | 120 |
| `api/src/ssrf.rs:165` | `check_ipv6()` | 120 |
| `api/src/routes/api_keys.rs:111` | `rotate_api_key()` | 116 |
| `api/src/routes/alerts.rs:165` | `test_alert()` | 115 |
| `api/src/ws/handler.rs:106` | `handle_connection()` | 102 |
| `api/src/schemas/mod.rs:118` | `validate_value()` | 114 |
| `api/src/telemetry.rs:140` | `current_trace_id()` | 106 |
| `api/src/routes/stream.rs:31` | `delivery_stream()` | 117 |
| `api/src/routes/stats.rs:24` | `get_stats()` | 103 |
| `api/src/routes/contact.rs:21` | `handle_contact()` | 108 |
| `api/src/routes/contact.rs:129` | `router()` | 102 |
| `api/src/routes/webhooks.rs:106` | `create_webhook()` | 187 |
| `api/src/routes/webhooks.rs:293` | `batch_webhooks()` | 168 |
| `api/src/routes/webhooks.rs:571` | `batch_replay()` | 101 |

</details>

---

## Appendix B: SDK Verification Reimplementation Matrix

Every SDK independently reimplements the same Standard Webhooks verification:

| Step | Node | Rust | Python | Java | Kotlin | Elixir |
|------|------|------|--------|------|--------|--------|
| Decode `whsec_` prefix | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Base64 decode secret | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Parse `v1,<base64>` signature | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HMAC-SHA256 computation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Timestamp tolerance check | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Constant-time comparison | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Header normalization | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**7 independent implementations of identical logic.** Consider generating SDK verification code from a shared spec.
