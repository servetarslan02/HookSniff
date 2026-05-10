# HookSniff SDK Deep Review

**Date:** 2026-05-10  
**Reviewed:** All 11 SDKs against OpenAPI spec (`docs/openapi.yaml`) and `docs/api-reference.md`

---

## Executive Summary

All 11 SDKs cover a **common core** of Endpoints CRUD, Webhooks send/list/get/replay/batch/attempts/export, Search, Stats, and webhook signature verification. However, **every SDK is missing ~70% of the API surface** defined in the OpenAPI spec. No SDK implements Auth, Alerts, Analytics, API Keys, Notifications, Devices, Teams, Billing, Templates, Schemas, Routing, Playground, Transforms, Stream, Contact, Outbound IPs, Health, Customer Portal, or Admin endpoints.

Additionally, **none of the 11 SDKs implement idempotency key generation** or **client-side retry logic for transient failures**.

---

## 1. API Coverage

### Endpoints Covered by All SDKs

| Endpoint | Python | Node | Go | Rust | Java | C# | Ruby | PHP | Swift | Kotlin | Elixir |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `POST /endpoints` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /endpoints` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /endpoints/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /endpoints/{id}` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DELETE /endpoints/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /endpoints/{id}/rotate-secret` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUT /endpoints/{id}/retry-policy` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /webhooks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /webhooks` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /webhooks/{id}` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /webhooks/{id}/replay` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /webhooks/batch` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /webhooks/{id}/attempts` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /webhooks/export` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /search` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /stats` | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `POST /webhooks/batch/replay` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /webhooks/{id}/details` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /webhooks/{id}/attempts/{attempt_id}` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Endpoint Groups Completely Missing from ALL SDKs

| Group | # Endpoints | Priority |
|---|---|---|
| **Auth** (register, login, 2FA, profile, password) | 15 | 🔴 High — needed for SDK-based auth flows |
| **API Keys** (list, create, delete, rotate) | 4 | 🔴 High — key management is core |
| **Alerts** (CRUD + test) | 4 | 🟡 Medium |
| **Analytics** (deliveries, success-rate, latency) | 3 | 🟡 Medium |
| **Notifications** (list, read, delete, prefs) | 5 | 🟡 Medium |
| **Devices** (register, list, delete) | 3 | 🟢 Low |
| **Teams** (CRUD + invite + members) | 6 | 🟡 Medium |
| **Billing** (subscription, upgrade, portal, usage, invoices) | 7 | 🟡 Medium |
| **Templates** (list, get, apply) | 3 | 🟢 Low |
| **Schemas** (register, get, validate) | 4 | 🟢 Low |
| **Routing** (get, update, health) | 3 | 🟢 Low |
| **Playground** (info, test) | 2 | 🟢 Low |
| **Transforms** (CRUD + test) | 5 | 🟢 Low |
| **Stream** (SSE delivery events) | 1 | 🟢 Low |
| **Inbound** (receive from providers) | 2 | 🟢 Low |
| **Contact** (submit form) | 1 | 🟢 Low |
| **Outbound IPs** (list) | 1 | 🟢 Low |
| **Health / Status** | 2 | 🟢 Low |
| **Customer Portal** (profile, keys, usage, plan, notifications) | 6 | 🟡 Medium |
| **Admin** (users, stats, revenue) | 5 | 🟢 Low |

**Total: ~82 endpoints in OpenAPI spec, ~16 covered per SDK (≈20%)**

### Missing CRUD Operations

- **`PUT /endpoints/{id}`** (Update endpoint) — missing from ALL SDKs
- **`PUT /endpoints/{id}/retry-policy`** (Update retry policy) — missing from ALL SDKs
- **`POST /webhooks/batch/replay`** (Batch replay) — missing from ALL SDKs
- **`GET /webhooks/{id}/details`** (Delivery details) — missing from ALL SDKs
- **`GET /webhooks/{id}/attempts/{attempt_id}`** (Specific attempt) — missing from ALL SDKs

---

## 2. Error Handling

| SDK | HTTP Error Mapping | Error Classes/Types | Parses Error Body | Status Code on Error |
|---|---|---|---|---|
| Python | ✅ 400/401/404/413/429 | ✅ 5 exception classes | ✅ | ✅ |
| Node | ✅ 400/401/404/413/429 | ✅ 5 error classes | ✅ | ✅ |
| Go | ✅ 400/401/404/413/429 | ✅ APIError struct + helper funcs | ✅ | ✅ |
| Rust | ✅ 400/401/404/413/429 | ✅ 7 error variants (thiserror) | ✅ | ✅ |
| Java | ✅ 400/401/404/413/429 | ✅ 5 inner exception classes | ✅ | ✅ |
| C# | ✅ 400/401/404/413/429 | ✅ 5 exception classes | ✅ | ✅ |
| Ruby | ✅ 400/401/404/413/429 | ✅ 5 error classes | ✅ | ✅ |
| PHP | ✅ 400/401/404/413/429 | ✅ 5 exception classes | ✅ | ✅ |
| Swift | ✅ 400/401/404/413/429 | ⚠️ Single HookSniffError struct | ✅ | ✅ |
| Kotlin | ✅ 400/401/404/413/429 | ✅ 5 exception classes | ✅ | ✅ |
| Elixir | ✅ 400/401/404/413/429 | ✅ Error struct with code atom | ✅ | ✅ |

**Gaps:**
- **Swift**: Uses a single `HookSniffError` struct instead of typed error subclasses. No `AuthenticationError`, `RateLimitError`, etc. — makes `catch` patterns harder.
- **Go**: Uses helper functions (`IsAuthenticationError(err)`) instead of typed errors. Works but less idiomatic than `errors.As`.
- **Elixir**: Returns `{:error, %HookSniff.Error{}}` tuples — idiomatic but error codes are atoms, not consistent with other SDKs' string codes.

**Missing across all SDKs:**
- No `403 Forbidden` handling (SSRF protection errors)
- No `503 Service Unavailable` handling
- No `429` rate limit header parsing (`X-RateLimit-Remaining`, `X-RateLimit-Reset`)

---

## 3. Type Safety

| SDK | Request Types | Response Models | Typed Methods | Nullable Handling |
|---|---|---|---|---|
| Python | ⚠️ Dict-based | ✅ Dataclasses | ✅ | ✅ Optional |
| Node | ✅ Interfaces | ✅ Interfaces | ✅ | ✅ Optional |
| Go | ✅ Structs | ✅ Structs | ✅ | ✅ Pointers |
| Rust | ⚠️ serde_json::Value | ✅ Structs (Serialize/Deserialize) | ✅ | ✅ Option |
| Java | ⚠️ String params | ✅ POJOs | ✅ | ✅ Nullable annotations |
| C# | ✅ Classes with JsonProperty | ✅ Classes | ✅ | ✅ Nullable ref types |
| Ruby | ⚠️ Hash-based | ✅ Model classes | ✅ | ⚠️ nil |
| PHP | ⚠️ Array-based | ✅ Readonly classes | ✅ | ✅ Nullable types |
| Swift | ⚠️ [String: Any] dicts | ✅ Codable structs | ✅ | ✅ Optional |
| Kotlin | ⚠️ Map<String, Any> | ✅ Data classes | ✅ | ✅ Nullable |
| Elixir | ⚠️ Map-based | ❌ Raw maps | ⚠️ | ❌ |

**Gaps:**
- **Python, Rust, Java, Ruby, PHP, Swift, Kotlin, Elixir**: Use raw dicts/maps for request bodies instead of typed request objects. This loses IDE autocomplete and compile-time checks.
- **Elixir**: Returns raw decoded JSON maps with string keys — no model structs at all. Most weakly typed of all SDKs.
- **Go**: Uses `map[string]interface{}` for `RetryPolicy` instead of a dedicated struct.

---

## 4. Authentication

| SDK | Bearer Token | Custom Headers | User-Agent |
|---|---|---|---|
| Python | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-python/0.1.0` |
| Node | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-node/0.1.0` |
| Go | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-go/0.1.0` |
| Rust | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-rust/0.2.0` |
| Java | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-java/0.1.0` |
| C# | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-csharp/0.2.0` |
| Ruby | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-ruby/0.1.0` |
| PHP | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-php/0.1.0` |
| Swift | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-swift/0.2.0` |
| Kotlin | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-kotlin/0.2.0` |
| Elixir | ✅ `Authorization: Bearer` | ✅ | ✅ `hooksniff-elixir/0.2.0` |

**All SDKs correctly implement Bearer token auth.** ✅

**Gaps:**
- No SDK supports JWT token auth (for user-scoped operations like `/auth/me`)
- No SDK has token refresh logic
- User-Agent versions are inconsistent (some 0.1.0, some 0.2.0)

---

## 5. Retry Logic

| SDK | Client-side Retries | Configurable | Backoff Strategy |
|---|---|---|---|
| Python | ❌ None | — | — |
| Node | ❌ None | — | — |
| Go | ❌ None | — | — |
| Rust | ❌ None | — | — |
| Java | ❌ None | — | — |
| C# | ❌ None | — | — |
| Ruby | ❌ None | — | — |
| PHP | ❌ None | — | — |
| Swift | ❌ None | — | — |
| Kotlin | ❌ None | — | — |
| Elixir | ❌ None | — | — |

**No SDK implements client-side retry logic.** This is a significant gap for production use. Transient 5xx errors and network timeouts should be automatically retried with exponential backoff.

---

## 6. Idempotency

| SDK | Idempotency Key Support |
|---|---|
| Python | ❌ |
| Node | ❌ |
| Go | ❌ |
| Rust | ❌ |
| Java | ❌ |
| C# | ❌ |
| Ruby | ❌ |
| PHP | ❌ |
| Swift | ❌ |
| Kotlin | ❌ |
| Elixir | ❌ |

**No SDK generates or sends `Idempotency-Key` headers.** The API supports it on `POST /webhooks` for exactly-once delivery, but no SDK exposes this.

---

## 7. Documentation

| SDK | README | API Reference | Examples | Docstrings/KDoc/JSDoc |
|---|---|---|---|---|
| Python | ✅ Comprehensive | ✅ | ✅ Batch, retry, export, verify | ✅ |
| Node | ✅ Comprehensive | ✅ | ✅ TypeScript examples | ✅ |
| Go | ✅ Basic | ⚠️ Partial | ✅ Basic usage | ✅ Godoc |
| Rust | ✅ Good | ⚠️ Partial | ✅ | ✅ Rustdoc |
| Java | ✅ Comprehensive | ✅ | ✅ | ✅ Javadoc |
| C# | ❌ Missing README | ❌ | ❌ | ✅ XML docs |
| Ruby | ✅ Comprehensive | ✅ | ✅ | ✅ YARD |
| PHP | ✅ Comprehensive | ✅ | ✅ | ✅ PHPDoc |
| Swift | ✅ Good | ⚠️ Partial | ✅ | ✅ |
| Kotlin | ✅ Good | ⚠️ Partial | ✅ | ✅ KDoc |
| Elixir | ✅ Good | ⚠️ Partial | ✅ | ✅ @moduledoc/@doc |

**Gaps:**
- **C#**: No README at all — users have no installation or usage guide.
- **Go, Rust, Swift, Kotlin, Elixir**: API reference sections are partial — don't list all available methods.

---

## 8. Tests

| SDK | Unit Tests | Integration Tests | Test Framework | Coverage |
|---|---|---|---|---|
| Python | ✅ 3 test classes | ❌ | pytest | Signature verification + client construction |
| Node | ✅ 4 test suites | ❌ | Jest | Signature verification + client + handler |
| Go | ✅ 6 test functions | ❌ | testing | Signature verification + client config |
| Rust | ✅ 5 tests | ❌ | #[test] | Verifier + client config |
| Java | ❌ None | ❌ | — | — |
| C# | ❌ None | ❌ | — | — |
| Ruby | ❌ None | ❌ | — | — |
| PHP | ❌ None | ❌ | — | — |
| Swift | ❌ None | ❌ | — | — |
| Kotlin | ❌ None | ❌ | — | — |
| Elixir | ❌ None | ❌ | — | — |

**Only 4 of 11 SDKs have any tests**, and those tests only cover signature verification and client construction — no API call tests, no error handling tests, no model deserialization tests.

---

## 9. Packaging

| SDK | Package File | Ecosystem | Version | Published |
|---|---|---|---|---|
| Python | `setup.py` | PyPI | 0.1.0 | ⚠️ Uses legacy setup.py, no pyproject.toml |
| Node | `package.json` | npm | 0.1.0 | ✅ Ready (hooksniff-sdk) |
| Go | `go.mod` | Go modules | — | ✅ Ready |
| Rust | `Cargo.toml` | crates.io | 0.2.0 | ✅ Ready |
| Java | `pom.xml` | Maven Central | 0.2.0 | ✅ Ready (with GPG signing) |
| C# | `.csproj` | NuGet | 0.2.0 | ⚠️ No NuGet metadata |
| Ruby | `.gemspec` | RubyGems | 0.1.0 | ✅ Ready |
| PHP | `composer.json` | Packagist | 0.1.0 | ✅ Ready |
| Swift | `Package.swift` | SPM | — | ✅ Ready |
| Kotlin | `build.gradle.kts` + `pom.xml` | Maven Central | 0.3.0 | ✅ Ready |
| Elixir | `mix.exs` | Hex | 0.2.0 | ✅ Ready |

**Gaps:**
- **Python**: Uses legacy `setup.py` instead of modern `pyproject.toml`. No `py.typed` marker for type checkers.
- **C#**: Missing NuGet package metadata (no `PackageId`, `PackageVersion`, `PackageTags` are incomplete).
- **Kotlin**: Has both `build.gradle.kts` AND `pom.xml` — redundant, should pick one.
- **Version inconsistency**: Python/Node/Ruby/PHP at 0.1.0, Rust/Java/C#/Elixir at 0.2.0, Kotlin at 0.3.0.

---

## 10. Cross-SDK Consistency

### Naming Conventions

| Pattern | Python | Node | Go | Rust | Java | C# | Ruby | PHP | Swift | Kotlin | Elixir |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Client class | `HookSniffClient` | `HookSniff` | `Client` | `HookSniffClient` | `HookSniffClient` | `HookSniffClient` | `Client` | `HookSniffClient` | `HookSniff` | `HookSniffClient` | `HookSniff` |
| Resource access | `client.endpoints` | `client.endpoints` | `client.Endpoints` | `client.endpoints()` | `client.endpoints()` | `client.Endpoints` | `client.endpoints` | `client->endpoints()` | `client.endpoints` | `client.endpoints()` | `HookSniff.Endpoints` |
| Method style | `snake_case` | `camelCase` | `PascalCase` | `snake_case` | `camelCase` | `PascalCaseAsync` | `snake_case` | `camelCase` | `camelCase` | `camelCase` | `snake_case` |

**Issues:**
- **Client class name**: `HookSniffClient` (Python/Rust/Java/C#/PHP/Kotlin), `HookSniff` (Node/Swift/Elixir), `Client` (Go/Ruby) — inconsistent.
- **Go/Ruby**: Use `Client` which is too generic and could conflict with other libraries.
- **Resource access pattern**: Some use properties (`client.endpoints`), some use methods (`client.endpoints()`), some use module-level functions (`HookSniff.Endpoints.create(client, ...)`).
- **C#**: Uses `Async` suffix on all methods — idiomatic for C# but inconsistent with other SDKs.
- **Elixir**: Uses module functions (`HookSniff.Endpoints.create(client, ...)`) instead of method chaining — idiomatic but very different pattern.

### Error Class Naming

| Error | Python | Node | Go | Rust | Java | C# | Ruby | PHP | Swift | Kotlin | Elixir |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 400 | `ValidationError` | `ValidationError` | `APIError` | `HookSniffError::Validation` | `ValidationException` | `ValidationException` | `ValidationError` | `ValidationException` | `HookSniffError` | `ValidationException` | `:validation_error` |
| 401 | `AuthenticationError` | `AuthenticationError` | `APIError` | `HookSniffError::Authentication` | `AuthenticationException` | `AuthenticationException` | `AuthenticationError` | `AuthenticationException` | `HookSniffError` | `AuthenticationException` | `:authentication_error` |
| 404 | `NotFoundError` | `NotFoundError` | `APIError` | `HookSniffError::NotFound` | `NotFoundException` | `NotFoundException` | `NotFoundError` | `NotFoundException` | `HookSniffError` | `NotFoundException` | `:not_found_error` |
| 429 | `RateLimitError` | `RateLimitError` | `APIError` | `HookSniffError::RateLimit` | `RateLimitException` | `RateLimitException` | `RateLimitError` | `RateLimitException` | `HookSniffError` | `RateLimitException` | `:rate_limit_error` |

**Issues:**
- **Python/Node/Ruby**: Use `*Error` suffix
- **Java/C#/PHP/Kotlin**: Use `*Exception` suffix
- **Go**: Single `APIError` type with status code check
- **Rust**: Enum variants on `HookSniffError`
- **Swift**: Single `HookSniffError` struct (no typed errors)
- **Elixir**: Atom codes on `HookSniff.Error` struct

### Model Field Naming

All SDKs correctly map `snake_case` API fields to their language conventions:
- Python/Ruby/Elixir: `snake_case` (matches API)
- Node/Swift/Kotlin/C#: `camelCase`
- Go/Rust/Java/PHP: `snake_case` (with JSON tags/annotations)

**Issue**: Node SDK maps `replay_count` → `replayCount` but doesn't map `attempt_count` → `attemptCount` consistently (it does, but the mapping is manual in `mapDelivery`).

---

## Critical Bugs & Issues

### 1. Kotlin SDK — Syntax Error (🔴 Critical)
**File:** `sdks/kotlin/src/main/kotlin/com/hooksniff/HookSniffClient.kt`

The `WebhookVerifier` class and `VerificationResult` data class are defined **inside** the `HookSniffClient` class body (after the `WebhooksResource` inner class), but there's an extra closing `}` at the end of the file. This creates a mismatched brace — the file will not compile.

```kotlin
// Line ~end of file:
    // WebhookVerifier is inside HookSniffClient but should be outside
    class WebhookVerifier(...) { ... }
}  // ← This closes HookSniffClient, but WebhookVerifier is inside it
}  // ← Extra brace — compilation error
```

### 2. Python SDK — Duplicate `WebhookHandler` Class (🟡 Medium)
**Files:** `sdks/python/hooksniff/utils.py` and `sdks/python/hooksniff/verify.py`

Both files define a `WebhookHandler` class with different implementations. `utils.py` has a simpler version; `verify.py` has a more complete version with `@handler.on()` decorator support. The `__init__.py` exports both, which will cause confusion.

### 3. Node SDK — Missing `endpoint_id` Field in `UpdateEndpointRequest` (🟡 Medium)
The `CreateEndpointRequest` type exists but there's no `UpdateEndpointRequest` type. The `PUT /endpoints/{id}` endpoint isn't implemented at all.

### 4. Go SDK — `DefaultBaseURL` Exported Constant Mismatch (🟢 Low)
**File:** `sdks/go/hooksniff_test.go` references `DefaultBaseURL` but the constant in `hooksniff.go` is `defaultBaseURL` (unexported). The test will fail to compile.

### 5. Swift SDK — `BatchResult.errors` Type Mismatch (🟡 Medium)
The `BatchResult` struct declares `errors: [String]` but the API returns `errors: [{index: int, error: string}]`. This will cause deserialization failures for batch requests with errors.

### 6. Rust SDK — `WebhookVerifier::verify` Returns Result but Tests Call `.is_ok()` (🟢 Low)
The `verify` method returns `VerificationResult` (a struct), not `Result`. Tests call `.is_ok()` which doesn't exist on `VerificationResult`. The tests won't compile.

---

## Recommendations

### P0 — Must Fix
1. **Fix Kotlin syntax error** — Move `WebhookVerifier` and `VerificationResult` outside `HookSniffClient` class.
2. **Fix Swift `BatchResult` type** — Change `errors: [String]` to `errors: [BatchError]` with a proper struct.
3. **Fix Go test compilation** — Either export `DefaultBaseURL` or update the test.
4. **Fix Rust test compilation** — `VerificationResult` needs `.is_ok()` or tests need updating.

### P1 — High Priority
5. **Add `PUT /endpoints/{id}`** (Update endpoint) to all SDKs — this is a basic CRUD gap.
6. **Add `PUT /endpoints/{id}/retry-policy`** to all SDKs.
7. **Add idempotency key support** — Auto-generate UUID `Idempotency-Key` header on `POST /webhooks`.
8. **Add client-side retry logic** with exponential backoff for 5xx and network errors.
9. **Add API Key management endpoints** (`/api-keys` CRUD) to all SDKs.
10. **Fix Python duplicate `WebhookHandler`** — Remove from `utils.py`, keep only in `verify.py`.

### P2 — Medium Priority
11. **Standardize error class naming** — Pick either `*Error` or `*Exception` across all SDKs.
12. **Standardize client class naming** — `HookSniffClient` everywhere (not `Client` or `HookSniff`).
13. **Add Auth endpoints** to all SDKs (at minimum: register, login, refresh).
14. **Add Analytics endpoints** to all SDKs.
15. **Add C# README** with installation and usage guide.
16. **Add tests to Java, C#, Ruby, PHP, Swift, Kotlin, Elixir** SDKs.
17. **Standardize version numbers** — Pick one version (e.g., 0.2.0) for all SDKs.

### P3 — Low Priority
18. **Add typed request models** to Python, Rust, Java, Ruby, PHP, Swift, Kotlin, Elixir.
19. **Add `pyproject.toml`** for Python SDK (replace `setup.py`).
20. **Remove duplicate `pom.xml`** from Kotlin SDK (keep `build.gradle.kts` only).
21. **Add rate limit header parsing** to all SDKs.
22. **Add pagination helpers** (auto-paging iterators) to all SDKs.

---

## Summary Scorecard

| Category | Score | Notes |
|---|---|---|
| API Coverage | 2/10 | ~20% of endpoints covered; 15+ endpoint groups completely missing |
| Error Handling | 8/10 | Consistent across SDKs; minor gaps in Swift/Go |
| Type Safety | 6/10 | Response models good; request bodies often untyped dicts |
| Authentication | 9/10 | Bearer auth correctly implemented everywhere |
| Retry Logic | 0/10 | No SDK has client-side retry |
| Idempotency | 0/10 | No SDK generates idempotency keys |
| Documentation | 6/10 | Most have READMEs; C# missing; API refs incomplete |
| Tests | 2/10 | 4/11 SDKs have tests; coverage is minimal |
| Packaging | 7/10 | Most ready to publish; Python uses legacy setup.py |
| Consistency | 5/10 | Naming patterns vary significantly across SDKs |

**Overall: 4.5/10** — The SDKs provide a functional core for basic webhook operations but are far from production-ready for comprehensive API usage. The most critical gaps are the missing API endpoints, lack of retry/idempotency support, and compilation errors in Kotlin/Rust/Go.
