# HookSniff Infrastructure Code Review

**Date:** 2026-05-10  
**Scope:** All infrastructure files — root configs, GitHub workflows, migrations, i18n, tests, load tests  
**Reviewer:** Automated deep review (47 files, ~80KB+ OpenAPI spec fully read)

---

## Executive Summary

The HookSniff infrastructure is well-structured for a startup-stage project. The migration system is solid, CI/CD pipelines are reasonable, and the test suite covers the major flows. However, there are several **security-critical issues** (hardcoded secrets in docker-compose, exposed product IDs in render.yaml, missing migration numbers), **significant i18n gaps** (6 of 8 languages are <40% translated), and **best-practice violations** across config files, workflows, and database schema.

**Severity Legend:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## 1. Root Configuration Files

### 1.1 `Cargo.toml`

**Status:** ✅ Clean

- Workspace structure is correct with `api` and `worker` members.
- Dependencies are reasonable: `tokio`, `serde`, `uuid`, `chrono`, `anyhow`, `tracing`.
- Uses Rust 2021 edition, resolver 2 — modern and correct.
- MIT license declared.

**No issues found.**

---

### 1.2 `docker-compose.yml`

**Status:** 🔴 Multiple issues

| # | Severity | Issue | Line(s) |
|---|----------|-------|---------|
| 1 | 🔴 | **Hardcoded database credentials in plaintext**: `POSTGRES_PASSWORD: hooksniff_local`, `POSTGRES_USER: hooksniff` | L14-16 |
| 2 | 🔴 | **Hardcoded JWT secret**: `JWT_SECRET: "local-dev-jwt-secret-not-for-production"` — even for dev, this should use `.env` file or Docker secrets | L28 |
| 3 | 🔴 | **Hardcoded HMAC secret**: `HMAC_SECRET: "local-dev-hmac-secret-not-for-production"` | L27 |
| 4 | 🟠 | **`sslmode=disable`** on all DATABASE_URL connections — even for local dev, TLS should be available | L26, L38 |
| 5 | 🟡 | **PostgreSQL port 5432 exposed to host** — should be internal-only for production-like setups | L17 |
| 6 | 🟡 | **No `.env` file referenced** — secrets should be in `.env` (gitignored) not inline | — |
| 7 | 🔵 | Turkish comments in the file — inconsistent with English codebase | L3-9 |

**Recommendations:**
- Create a `.env.example` with placeholder values and a `.gitignore` entry for `.env`.
- Use Docker secrets or environment file references (`env_file: .env`).
- Document that this is dev-only clearly at the top.

---

### 1.3 `render.yaml`

**Status:** 🟠 Several concerns

| # | Severity | Issue | Line(s) |
|---|----------|-------|---------|
| 1 | 🟠 | **Hardcoded Polar product IDs**: `POLAR_PRODUCT_PRO: ec5826ad-4a01-4146-b2d0-3b99eaf150a5` and `POLAR_PRODUCT_BUSINESS: e5b7d88a-7606-4963-a070-4102ca6405e2` — these are internal identifiers that shouldn't be in version control | L30-32 |
| 2 | 🟠 | **`RUST_LOG=info,hooksniff=debug` in production** — debug logging generates excessive logs and may leak sensitive info | L21, L56 |
| 3 | 🟡 | **CORS_ORIGINS has duplicate URL**: `https://hooksniff.vercel.app,https://hooksniff.vercel.app` (same value twice) | L24 |
| 4 | 🟡 | **Free plan for production services** — Render free tier has cold starts and limited resources | L13, L49 |
| 5 | 🟡 | **OTEL_ENABLED=false** with comment "Enable after Grafana setup" — observability should be a priority | L41 |
| 6 | 🔵 | **`POLAR_ENV: production, sync: false`** — this value should probably be synced or set explicitly | L34 |

**Recommendations:**
- Move Polar product IDs to environment variables set in Render dashboard.
- Change production log level to `info` only.
- Fix the CORS duplicate.
- Consider at least the Starter plan for production.

---

### 1.4 `package.json`

**Status:** ✅ Clean, minimal

- Only dependency is `pg` (PostgreSQL client).
- `vercel-build` script correctly builds the dashboard.
- No security issues.

---

### 1.5 `cloudbuild.yaml`

**Status:** 🟡 Minor issues

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **Always tags as `:latest`** — no commit SHA tag, makes rollbacks difficult |
| 2 | 🟡 | **No image vulnerability scanning** step |
| 3 | 🔵 | **`E2_HIGHCPU_8`** — may be overkill for build; consider standard machine type |
| 4 | 🔵 | **No caching** between builds (no `--cache-from`) |

**Recommendations:**
- Add `${SHORT_SHA}` tag alongside `latest`.
- Add container analysis/vulnerability scanning step.
- Use build caching for faster builds.

---

### 1.6 `docs/openapi.yaml` (80KB)

**Status:** 🟡 API design concerns

**Security Issues:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟠 | **`/inbound/{provider}` accepts arbitrary provider names** — potential for path injection or SSRF if provider is used to construct backend URLs |
| 2 | 🟠 | **`/billing/webhook`, `/billing/webhook/polar`, `/billing/webhook/iyzico`** — all have `security: []` (no auth). While correct for webhook receivers, there's no mention of signature verification in the spec |
| 3 | 🟡 | **`/contact` has `security: []`** — no rate limiting documented, susceptible to spam |
| 4 | 🟡 | **`RegisterRequest` has `password` as optional** (only `email` is required) — could allow passwordless accounts |
| 5 | 🟡 | **`/admin/*` endpoints** — no mention of admin role verification in the spec, only "Admin" tag |

**API Design Issues:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **Inconsistent response codes** — `POST /endpoints` returns 200 instead of 201 |
| 2 | 🟡 | **No pagination validation** — `per_page` has no `maximum` constraint |
| 3 | 🟡 | **`/webhooks/export`** returns `text/csv` but the format parameter accepts `json` — confusing |
| 4 | 🔵 | **No API versioning strategy** beyond `/v1` prefix |
| 5 | 🔵 | **`/outbound-ips`** is public (`security: []`) — good for firewall whitelisting |
| 6 | 🔵 | **SSE stream endpoint** (`/stream/deliveries`) — no heartbeat/timeout documented |

**Positive Notes:**
- Comprehensive schema definitions with proper types.
- Good use of `nullable` and `required` fields.
- Well-organized tags.
- Proper use of `security: []` for public endpoints.

---

## 2. GitHub Workflows

### 2.1 `.github/workflows/ci.yml`

**Status:** ✅ Generally good

**Strengths:**
- Proper concurrency control (`cancel-in-progress: true`).
- Security audit for both Rust and Node dependencies.
- Separate jobs for lint, test, build (good parallelism).
- PostgreSQL service container with health checks.
- Cache configured for both Cargo and npm.

**Issues:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`npm audit --audit-level=high` with `continue-on-error: true`** — security audit failures are silently ignored |
| 2 | 🟡 | **No `.env` setup for tests** — tests rely on hardcoded env vars in the workflow |
| 3 | 🔵 | **`cargo install cargo-audit`** on every run — should be cached |
| 4 | 🔵 | **Dashboard build uploads `.next` directory** as artifact — this is a build cache, not a deployable artifact |

---

### 2.2 `.github/workflows/deploy.yml`

**Status:** 🟠 Security concerns

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟠 | **Deploys on CI success without manual approval** — any push to `main` auto-deploys to production |
| 2 | 🟠 | **`--allow-unauthenticated`** on the API service — the API is publicly accessible (this is intentional but should be documented) |
| 3 | 🟡 | **No rollback mechanism** — if deployment fails, there's no automatic rollback |
| 4 | 🟡 | **`--set-secrets` references Secret Manager** — good practice, but the secret names are hardcoded in the workflow |
| 5 | 🟡 | **`--min-instances 0`** — cold starts on free tier |
| 6 | 🔵 | **Worker has `--no-allow-unauthenticated`** — correct, internal service |

**Recommendations:**
- Add a manual approval step for production deployments.
- Implement blue-green or canary deployment strategy.
- Add deployment notification (Slack/email).

---

### 2.3 `.github/workflows/release.yml`

**Status:** ✅ Clean

- Uses GHCR (GitHub Container Registry) — proper auth via `GITHUB_TOKEN`.
- Semantic versioning with metadata-action.
- Buildx with GHA cache — efficient.
- Matrix strategy for api/worker/dashboard — good.

**No issues found.**

---

## 3. Database Migrations

### 3.1 Migration Numbering Gap

**Status:** 🔴 Critical organizational issue

**Missing migration numbers:** 013-025 (13 missing migrations!)

```
001 → 002 → ... → 012 → [GAP: 013-025] → 026 → 027 → ... → 035 → [GAP: 036] → 037
```

This suggests either:
- Migrations were deleted without documentation
- A parallel migration system exists
- Numbering was reset

**Impact:** Makes it impossible to verify schema completeness. Anyone setting up a fresh database may be missing critical schema changes.

---

### 3.2 `migrations/001_initial.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **CockroachDB-specific syntax**: Uses `STRING` type and `gen_random_uuid()` — these are CockroachDB, not standard PostgreSQL. The rest of the project uses PostgreSQL. |
| 2 | 🟡 | **No `password_hash` column** in the initial schema — added later? |
| 3 | 🔵 | **No `ON UPDATE CASCADE`** on foreign keys |

---

### 3.3 `migrations/002_security_features.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟠 | **`ip_whitelist` is a single STRING column** — should be an array or a separate table for multiple IPs/CIDRs |
| 2 | 🟡 | **No validation on `rate_limit_per_minute`** — no CHECK constraint |
| 3 | 🔵 | `signature_header` defaults to `X-HookRelay-Signature` — rebranding leftover? Should be `X-HookSniff-Signature` |

---

### 3.4 `migrations/004_teams.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`role` is VARCHAR(50)** — should be an ENUM type for data integrity |
| 2 | 🟡 | **No index on `team_invites.email`** — slow lookups for invite acceptance |
| 3 | 🔵 | **`team_invites.token`** — no expiration cleanup mechanism |

---

### 3.5 `migrations/005_event_mesh.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`target_type` is a free STRING** — should be constrained to valid values ('http', 'ws', 'grpc', 'sqs', 'kafka', 'email') |
| 2 | 🟡 | **`fanout_rules.target_ids` is UUID[]** — no FK constraint possible with arrays, could reference deleted targets |
| 3 | 🔵 | **No `ON DELETE SET NULL` or cascade** on `dead_letter_endpoint_id` in fanout_rules |

---

### 3.6 `migrations/009_payment_providers.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`amount_cents` is INT** — should be BIGINT for large transactions |
| 2 | 🟡 | **`currency` is TEXT** — should be CHAR(3) with validation |
| 3 | 🔵 | **`status` is TEXT** — should be constrained enum |

---

### 3.7 `migrations/010_reaper_index.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟠 | **References `webhook_queue` table** — this table is NOT defined in any of the read migrations! It's either in the missing 013-025 range or defined elsewhere. |
| 2 | 🟡 | **`update_updated_at_column()` trigger function** — good pattern, but defined late (migration 010) |

---

### 3.8 `migrations/011_listen_notify.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`pg_notify` payload is just the delivery ID** — no event type metadata, limits consumer flexibility |
| 2 | 🔵 | **No error handling** in the trigger function |

---

### 3.9 `migrations/012_trace_id.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`trace_id VARCHAR(64)`** — OpenTelemetry trace IDs are 32 hex chars (128-bit). 64 is oversized but not harmful. |
| 2 | 🔵 | **Partial index on `trace_id`** — good, only indexes non-null values |

---

### 3.10 `migrations/028_invoices.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`status` defaults to `'paid'`** — invoices should default to `'pending'` |
| 2 | 🟡 | **No unique constraint on `provider_invoice_id`** — could create duplicate invoices |
| 3 | 🔵 | **`paid_at` is nullable** — correct for pending invoices |

---

### 3.11 `migrations/030_password_reset_tokens.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟠 | **No cleanup mechanism for expired tokens** — no scheduled job or TTL index. Expired tokens accumulate forever. |
| 2 | 🟡 | **`token_hash` indexed but no uniqueness constraint** — theoretically possible to have hash collisions |
| 3 | 🔵 | **Good: `used` boolean** prevents token reuse |

---

### 3.12 `migrations/031_email_verification.sql`

Same issues as 030 — no cleanup for expired tokens.

---

### 3.13 `migrations/032_refresh_tokens.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟠 | **No cleanup mechanism** — revoked and expired tokens accumulate |
| 2 | 🟡 | **No `device_info` or `ip_address` column** — can't track which device/session a refresh token belongs to |
| 3 | 🔵 | **Good: `revoked` boolean** for token invalidation |

---

### 3.14 `migrations/033_totp_2fa.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟠 | **`totp_secret` stored as plain TEXT** — should be encrypted at rest |
| 2 | 🟡 | **No backup codes** — if user loses TOTP device, account is locked |
| 3 | 🔵 | **No `totp_verified_at` timestamp** |

---

### 3.15 `migrations/035_test_mode.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **Test deliveries mixed with production data** — should be in a separate table or clearly partitioned |
| 2 | 🔵 | **Partial index on `is_test = true`** — good for filtering |

---

### 3.16 `api/migrations/001_initial_schema.sql`

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🔴 | **Conflicts with `migrations/001_initial.sql`** — defines the same tables (`customers`, `endpoints`, `deliveries`, `dead_letters`) with DIFFERENT schemas. Two migration systems exist! |
| 2 | 🟠 | **`api_key_hash` has UNIQUE constraint** here but not in `migrations/001_initial.sql` |
| 3 | 🟠 | **Has `delivery_attempts` table** — missing from `migrations/001_initial.sql` |
| 4 | 🟡 | **Has `idempotency_keys` table** — good, but missing from the other migration set |
| 5 | 🟡 | **`password_hash` column present** — missing from `migrations/001_initial.sql` |
| 6 | 🟡 | **`webhook_limit` defaults to 1000** — migration 029 changes this to 10000, creating inconsistency |

**Critical Finding:** There are TWO parallel migration systems (`migrations/` and `api/migrations/`) with conflicting schemas. This needs to be resolved immediately.

---

## 4. i18n Messages Analysis

### 4.1 Translation Coverage Summary

| Language | File | Status | Coverage (est.) |
|----------|------|--------|-----------------|
| English (en) | `en.json` | ✅ Reference | 100% |
| Turkish (tr) | `tr.json` | ✅ Complete | ~98% |
| German (de) | `de.json` | 🔴 Partial | ~35% |
| Japanese (ja) | `ja.json` | 🔴 Partial | ~30% |
| Portuguese (pt-BR) | `pt-BR.json` | 🔴 Partial | ~30% |
| Spanish (es) | `es.json` | 🔴 Partial | ~30% |
| French (fr) | `fr.json` | 🔴 Partial | ~30% |
| Korean (ko) | `ko.json` | 🔴 Partial | ~30% |

### 4.2 Missing Keys by Language

**All non-English/non-Turkish languages are missing translations for:**

The following sections are entirely in English (untranslated):
- `common.*` (partial — many keys like `retry`, `refresh`, `sending`, `creating`, `saving`, `deleting`, `download`, `view`, `remove`, `plan`, `email`, `id`, `event`, `endpoint`, `attempts`, `time`, `response`, `payload`, `headers`, `statusCode`, `showing`, `pageOf`, `autoRefresh`, `live`, `failed`, `pending`)
- `dashboard.*` (partial — many dashboard-specific keys)
- `deliveries.*` (large portion)
- `logs.*` (entire section)
- `search.*` (entire section)
- `health.*` (entire section)
- `alerts.*` (entire section)
- `playground.*` (entire section)
- `team.*` (entire section)
- `notifications.*` (entire section)
- `webhooks.*` (entire section)
- `apiKeys.*` (entire section)
- `admin.*` (entire section)
- `status.*` (entire section)
- `terms.*` (entire section)
- `privacy.*` (entire section)
- `docs.*` (entire section)
- `auth.*` (partial — `signIn`, `createAccount`, `signUp`, `name`, `namePlaceholder`, `emailPlaceholder`, `passwordPlaceholder`)
- `settings.*` (partial)
- `billing.*` (large portion — `upgradeTo`, `upgradeDesc`, `downgradeDesc`, `cancelTitle`, `cancelDesc`, `keepPlan`, `cancelSubscription`, `cancelledMsg`, `redirecting`)
- `onboarding.*` (untranslated in most)
- `landing.footer.*` (partial — many footer links untranslated)

### 4.3 Specific Issues

| # | Severity | Issue | Affected Languages |
|---|----------|-------|--------------------|
| 1 | 🟠 | **Landing page pricing shows "1,000 webhooks/month" for free tier** but migration 029 changed it to 10,000. **Inconsistent with backend.** | en, tr, de, ja, pt-BR, es, fr, ko |
| 2 | 🟡 | **German (`de.json`)** has many sections completely in English — looks unfinished | de |
| 3 | 🟡 | **Japanese (`ja.json`)** has a stray space in `q4`: `" 어떻게 시작하면 좋습니까?"` (Korean mixed in) | ja |
| 4 | 🟡 | **`common.previous`** is `"Previous"` in all non-English languages (untranslated) | de, ja, pt-BR, es, fr, ko |
| 5 | 🔵 | **Turkish (`tr.json`)** has `q4` with mixed Korean: `" 어떻게 시작하면 좋습니까?"` | tr |

### 4.4 i18n Key Structure Issues

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **Duplicate key patterns**: `billing.plans.free` and `billing["plans.free"]` — both exist, potential collision |
| 2 | 🟡 | **No ICU message format** — uses simple `{variable}` interpolation instead of `{variable, plural, ...}` |
| 3 | 🔵 | **`landing.pricing.freeFeatures`** says "1,000 webhooks/month" but actual free tier is 10,000 |

---

## 5. Integration & Load Tests

### 5.1 `tests/integration_test.sh`

**Status:** ✅ Good coverage

**Strengths:**
- Full auth flow (register → login → CRUD → cleanup)
- Error case testing (invalid URL, missing fields, unauthorized, not found)
- Proper cleanup in section 14

**Issues:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **Hardcoded test password**: `TEST_PASSWORD="TestPass1234!"` — acceptable for tests but document it |
| 2 | 🟡 | **No test isolation** — tests depend on state from previous steps (sequential execution required) |
| 3 | 🔵 | **`httpbin.org` as test endpoint** — external dependency, could fail due to network issues |

---

### 5.2 `tests/integration_test.ps1`

**Status:** ✅ Mirror of bash test

- Same test coverage as the bash version.
- PowerShell 7+ compatibility noted.
- Same issues as bash version.

---

### 5.3 `tests/unit_suggestions.md`

**Status:** ✅ Excellent documentation

- Comprehensive test plan organized by module.
- Priority matrix (High/Medium/Low).
- Specific test cases for each handler.
- Test infrastructure recommendations.

**Note:** This is a planning document, not executable tests. The actual unit tests don't appear to exist yet.

---

### 5.4 `tests/fixtures/sample_payloads.json`

**Status:** ✅ Good test data

- Three sizes per event type (small, medium, large).
- Realistic e-commerce payloads.
- Covers order, payment, and user registration events.
- Includes fraud detection scenarios (good edge case).

---

### 5.5 `tests/integration/api_test.sh`

**Status:** ✅ Comprehensive

- 27 test groups covering auth, CRUD, batch, search, analytics, templates.
- Rate limiting test (120 rapid requests).
- Proper cleanup.
- API key authentication test.

**Issues:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **Rate limiting test may hit CI timeout** — 120 sequential requests could be slow |
| 2 | 🔵 | **No parallel test execution** — all tests run sequentially |

---

### 5.6 `tests/integration/full_test.sh`

**Status:** 🟡 Simpler version

- Less comprehensive than `api_test.sh`.
- Uses `grep` for JSON parsing instead of `jq` — fragile.
- Missing: rate limiting, API key auth, error cases, search, analytics.

---

### 5.7 Load Tests (`tests/load/`)

**Status:** ✅ Excellent load testing suite

**Strengths:**
- Multiple test types: smoke, load, stress, webhook flow, worker throughput.
- k6-based — industry standard.
- Proper setup/teardown with cleanup.
- Custom metrics (latency trends, success rates, throughput).
- Detailed README with environment variables and expected baselines.
- Webhook receiver for isolated testing.
- Free tier resource budgeting documented.

**Issues:**

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`k6_load_test.js`** creates 100 endpoints in setup — could hit rate limits |
| 2 | 🟡 | **`k6_webhook_flow.js`** sends to random endpoint IDs (`ep_loadtest_${Math.floor(Math.random() * 100)}`) — these don't exist unless setup runs first |
| 3 | 🟡 | **No CI integration** — load tests should run on a schedule (nightly) not on every PR |
| 4 | 🔵 | **`webhook_receiver.js`** has no request body size limit — could be exploited |

---

## 6. Cross-Cutting Concerns

### 6.1 Secret Management

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | 🔴 | Hardcoded secrets in `docker-compose.yml` | `HMAC_SECRET`, `JWT_SECRET`, `POSTGRES_PASSWORD` |
| 2 | 🟠 | Product IDs in `render.yaml` | `POLAR_PRODUCT_PRO`, `POLAR_PRODUCT_BUSINESS` |
| 3 | 🟡 | Test passwords in integration tests | `TestPass1234!` |
| 4 | ✅ | Production secrets via Secret Manager | `deploy.yml` uses `--set-secrets` |
| 5 | ✅ | `generateValue: true` for HMAC/JWT in render.yaml | Good for production |

### 6.2 Database Schema Consistency

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🔴 | **Two parallel migration systems** (`migrations/` and `api/migrations/`) with conflicting schemas |
| 2 | 🔴 | **13 missing migration numbers** (013-025) — unexplained gap |
| 3 | 🟠 | **`webhook_queue` table** referenced in migrations 010, 011, 012 but never defined in any read migration |
| 4 | 🟡 | **CockroachDB vs PostgreSQL** syntax inconsistency in migration 001 |
| 5 | 🟡 | **`HookRelay` vs `HookSniff`** naming inconsistency across migrations |

### 6.3 Naming Consistency

| # | Severity | Issue |
|---|----------|-------|
| 1 | 🟡 | **`HookRelay`** appears in migration comments, test scripts, and integration tests — should be `HookSniff` |
| 2 | 🟡 | **`X-HookRelay-Signature`** header default in migration 002 — should be `X-HookSniff-Signature` |
| 3 | 🔵 | Test email domain `@hookrelay.dev` vs `@hookrelay.is-a.dev` — inconsistent |

---

## 7. Summary of Action Items

### 🔴 Critical (Fix Immediately)

1. **Resolve dual migration systems** — `migrations/` and `api/migrations/` define conflicting schemas. Pick one, merge, and delete the other.
2. **Account for missing migrations 013-025** — document what they contained or recreate them.
3. **Find and include the `webhook_queue` table definition** — referenced by 3 migrations but never created.
4. **Remove hardcoded secrets from `docker-compose.yml`** — use `.env` file with `.gitignore`.

### 🟠 High Priority

5. **Move Polar product IDs out of `render.yaml`** — set via Render dashboard.
6. **Fix production log level** — `RUST_LOG=info` not `info,hooksniff=debug`.
7. **Add TOTP secret encryption** — migration 033 stores secrets in plaintext.
8. **Add token cleanup jobs** — password reset, email verification, and refresh tokens accumulate forever.
9. **Complete i18n for 6 languages** — de, ja, pt-BR, es, fr, ko are <40% translated.
10. **Fix free tier pricing in landing page** — shows 1,000 but actual limit is 10,000.

### 🟡 Medium Priority

11. **Fix CORS duplicate** in render.yaml.
12. **Add `npm audit` failure handling** — currently `continue-on-error: true`.
13. **Add manual approval for production deploys**.
14. **Standardize on PostgreSQL types** — fix CockroachDB `STRING` in migration 001.
15. **Rename `HookRelay` references to `HookSniff`** across all files.
16. **Add backup codes for 2FA** — migration 033 has no recovery mechanism.
17. **Constrain `target_type`, `status`, `role` columns** — use CHECK constraints or ENUMs.
18. **Add `provider_invoice_id` uniqueness** in invoices table.

### 🔵 Low Priority

19. **Add image vulnerability scanning** to cloudbuild.yaml.
20. **Use commit SHA tags** alongside `latest` for Docker images.
21. **Cache `cargo-audit` installation** in CI.
22. **Add heartbeat/timeout documentation** for SSE stream endpoint.
23. **Standardize test email domains** across test files.

---

## 8. Positive Findings

The project has several well-implemented aspects:

- ✅ **Comprehensive OpenAPI spec** — 80KB of well-structured API documentation
- ✅ **Proper CI/CD pipeline** — lint, test, security audit, build, deploy
- ✅ **Secret Manager integration** in production deployment
- ✅ **LISTEN/NOTIFY** for real-time webhook processing (migration 011)
- ✅ **Idempotency support** — key-based deduplication
- ✅ **TOTP 2FA** support
- ✅ **Multi-provider payment** (Stripe, Polar, iyzico)
- ✅ **Load testing suite** with k6 — smoke, load, stress, throughput tests
- ✅ **Proper retry policies** with exponential backoff
- ✅ **Dead letter queue** for failed deliveries
- ✅ **Distributed tracing** support (OpenTelemetry trace_id)
- ✅ **Test mode** isolation for development
- ✅ **WebSocket subscriptions** for real-time events
- ✅ **Fan-out rules** for event routing
- ✅ **Rate limiting** infrastructure
- ✅ **Comprehensive integration tests** with error case coverage
