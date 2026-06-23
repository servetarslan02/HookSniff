# HookSniff — Feature Tracker

> Last updated: 2026-06-03

This document tracks the implementation status of all HookSniff features. For a high-level overview, see [README.md](README.md).

---

## Feature Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented and production-ready |
| 🔄 | In progress |
| ⏳ | Planned (not started) |

---

## API (Rust/Axum — 30 Route Modules, ~22K Lines)

### Authentication & Authorization

| Feature | Route | File | Status |
|---------|-------|------|--------|
| User registration | `POST /v1/auth/register` | `routes/auth.rs` | ✅ |
| Login (JWT + cookie) | `POST /v1/auth/login` | `routes/auth.rs` | ✅ |
| Two-Factor Auth (TOTP) | `POST /v1/auth/2fa/*` | `routes/auth.rs` | ✅ |
| Email verification | `GET /v1/auth/verify-email` | `routes/auth.rs` | ✅ |
| Password reset | `POST /v1/auth/forgot-password` | `routes/auth.rs` | ✅ |
| GDPR data export | `GET /v1/auth/export` | `routes/auth.rs` | ✅ |
| GDPR account deletion | `DELETE /v1/auth/account` | `routes/auth.rs` | ✅ |

### Endpoint Management

| Feature | Route | File | Status |
|---------|-------|------|--------|
| CRUD operations | `GET/POST/PUT/DELETE /v1/endpoints` | `routes/endpoints.rs` | ✅ |
| Secret rotation | `POST /v1/endpoints/:id/rotate-secret` | `routes/endpoints.rs` | ✅ |
| Retry policy config | `PUT /v1/endpoints/:id` | `routes/endpoints.rs` | ✅ |
| Event filtering | `PUT /v1/endpoints/:id` | `routes/endpoints.rs` | ✅ |
| Custom headers | `POST /v1/endpoints` | `routes/endpoints.rs` | ✅ |

### Webhook Delivery

| Feature | Route | File | Status |
|---------|-------|------|--------|
| Send webhook | `POST /v1/webhooks` | `routes/webhooks.rs` | ✅ |
| Batch send | `POST /v1/webhooks/batch` | `routes/webhooks.rs` | ✅ |
| List deliveries | `GET /v1/webhooks` | `routes/webhooks.rs` | ✅ |
| Get delivery detail | `GET /v1/webhooks/:id` | `routes/webhooks.rs` | ✅ |
| Replay webhook | `POST /v1/webhooks/:id/replay` | `routes/webhooks.rs` | ✅ |
| Batch replay | `POST /v1/webhooks/batch-replay` | `routes/webhooks.rs` | ✅ |
| CSV/JSON export | `GET /v1/webhooks/export` | `routes/webhooks.rs` | ✅ |

### Analytics & Monitoring

| Feature | Route | File | Status |
|---------|-------|------|--------|
| Delivery trends | `GET /v1/analytics/deliveries` | `routes/analytics.rs` | ✅ |
| Success rate | `GET /v1/analytics/success-rate` | `routes/analytics.rs` | ✅ |
| Latency percentiles | `GET /v1/analytics/latency` | `routes/analytics.rs` | ✅ |
| Search deliveries | `GET /v1/search` | `routes/search.rs` | ✅ |
| SSE real-time stream | `GET /v1/stream/deliveries` | `routes/stream.rs` | ✅ |
| Events polling | `GET /v1/events` | `routes/events.rs` | ✅ |
| Alert rules | `GET/POST /v1/alerts` | `routes/alerts.rs` | ✅ |
| Endpoint health | `GET /v1/endpoint-health/:id` | `routes/health_endpoints.rs` | ✅ |

### Billing & Payments

| Feature | Route | File | Status |
|---------|-------|------|--------|
| Polar.sh integration | `POST /v1/billing/*` | `routes/billing.rs` | ✅ |
| iyzico integration | `POST /v1/billing/*` | `routes/billing.rs` | ✅ |
| Customer portal | `POST /v1/billing/portal` | `routes/customer_portal.rs` | ✅ |
| Usage tracking | `GET /v1/billing/usage` | `routes/billing.rs` | ✅ |
| Invoice management | `GET /v1/billing/invoices` | `routes/billing.rs` | ✅ |

### Platform Features

| Feature | Route | File | Status |
|---------|-------|------|--------|
| API key management | `GET/POST /v1/api-keys` | `routes/api_keys.rs` | ✅ |
| Teams (CRUD, invites, roles) | `GET/POST /v1/teams` | `routes/teams.rs` | ✅ |
| Notifications | `GET/POST /v1/notifications` | `routes/notifications.rs` | ✅ |
| Device push (FCM) | `POST /v1/devices` | `routes/devices.rs` | ✅ |
| Contact form | `POST /v1/contact` | `routes/contact.rs` | ✅ |
| Playground | `POST /v1/playground` | `routes/playground.rs` | ✅ |
| Simulator | `POST /v1/simulator` | `routes/simulator.rs` | ✅ |
| Smart routing | `GET/POST /v1/routing` | `routes/routing.rs` | ✅ |
| Schema registry | `GET/POST /v1/schemas` | `routes/schemas.rs` | ✅ |
| Templates | `GET/POST /v1/templates` | `routes/templates.rs` | ✅ |
| Payload transforms | `GET/POST /v1/endpoints/:id/transforms` | `routes/transforms.rs` | ✅ |
| Embeddable portal | `GET /v1/embed/portal` | `routes/embed.rs` | ✅ |
| Inbound webhook proxy | `POST /v1/inbound/*` | `routes/inbound.rs` | ✅ |
| Outbound IPs | `GET /v1/outbound-ips` | `routes/outbound_ips.rs` | ✅ |
| Swagger UI | `GET /v1/docs` | `routes/docs.rs` | ✅ |
| Admin panel | `GET/POST /v1/admin/*` | `routes/admin.rs` | ✅ |
| Delivery details | `GET /v1/webhooks/:id/details` | `routes/delivery_details.rs` | ✅ |

---

## Core Modules

| Module | File | Description | Status |
|--------|------|-------------|--------|
| Standard Webhooks signing | `signing.rs` | HMAC-SHA256 with `whsec_` secrets, constant-time comparison | ✅ |
| SSRF protection | `ssrf.rs` | Blocks private IPs, metadata endpoints, DNS validation | ✅ |
| Rate limiting | `rate_limit.rs` | Sliding window algorithm, in-memory + Redis backend | ✅ |
| Input validation | `validation.rs` | Event type regex, URL SSRF check, JSON depth (max 10) | ✅ |
| Idempotency | `middleware/idempotency.rs` | `Idempotency-Key` header with 24h TTL | ✅ |
| FIFO ordered delivery | `fifo/mod.rs` | Sequence numbers, max-wait protection | ✅ |
| Per-endpoint throttling | `throttle/mod.rs` | Token bucket / sliding window per endpoint | ✅ |
| Exponential backoff | `retry_policy/mod.rs` | Configurable per endpoint, jitter (±25%) | ✅ |
| Payload transformation | `transform/` | Filter, map, enrich rules per endpoint | ✅ |
| Schema validation | `schemas/` | JSON schema registry with versioning | ✅ |
| CloudEvents v1.0 | `events/cloudevents.rs` | Standard event format support | ✅ |
| WebSocket handler | `ws/` | Real-time delivery updates | ✅ |
| Circuit breaker | `circuit_breaker.rs` | Auto-disable failing endpoints | ✅ |
| Gmail API email | `email.rs` | Transactional emails via GCP service account | ✅ |
| OpenTelemetry tracing | `telemetry.rs` | Distributed tracing with Grafana Cloud | ✅ |
| Prometheus metrics | `metrics.rs` | `GET /metrics` endpoint | ✅ |

---

## Worker (Rust)

| Feature | Description | Status |
|---------|-------------|--------|
| PostgreSQL LISTEN/NOTIFY | Instant delivery (<10ms latency) | ✅ |
| Fallback polling | 1-second interval for reliability | ✅ |
| HTTP delivery | Standard webhook delivery with signing | ✅ |
| Standard Webhooks signing | HMAC-SHA256 in every delivery | ✅ |
| Exponential backoff retry | Configurable per endpoint | ✅ |
| Dead letter queue | Permanently failed deliveries preserved | ✅ |
| Health check server | Cloud Run health endpoint | ✅ |

---

## Cortex AI — ML-Powered Monitoring

| Module | Description | Status |
|--------|-------------|--------|
| Signal collector | Hourly delivery stats aggregation | ✅ |
| Profile engine | Endpoint behavioral profiling | ✅ |
| Anomaly scorer | ML anomaly detection (EWMA + IQR + Z-Score) | ✅ |
| Healing engine | Auto-disable, rate limit, timeout, fallback URL | ✅ |
| Drift detection | Concept drift (Page-Hinkley + ADWIN + KS) | ✅ |
| Model monitor | Per-model health (accuracy, F1, quality) | ✅ |
| Risk scoring | Per-endpoint risk score (0–100) | ✅ |
| Auto-actions | Human approval for high-risk actions | ✅ |

---

## Dashboard (Next.js 16 — 41 Pages)

### Public Pages

| Page | Route | Status |
|------|-------|--------|
| Landing (typewriter, particles, pricing) | `/` | ✅ |
| Login | `/login` | ✅ |
| Register | `/register` | ✅ |
| 2FA Setup | `/2fa` | ✅ |
| Email verification | `/verify-email` | ✅ |
| Password reset | `/forgot-password` | ✅ |

### Dashboard Pages

| Page | Route | Status |
|------|-------|--------|
| Overview (stat cards, charts, activity feed) | `/dashboard` | ✅ |
| Endpoints management | `/dashboard/endpoints` | ✅ |
| Delivery logs | `/dashboard/deliveries` | ✅ |
| Analytics | `/dashboard/analytics` | ✅ |
| Alerts | `/dashboard/alerts` | ✅ |
| API Keys | `/dashboard/api-keys` | ✅ |
| Billing | `/dashboard/billing` | ✅ |
| Team management | `/dashboard/teams` | ✅ |
| Settings | `/dashboard/settings` | ✅ |
| Notifications | `/dashboard/notifications` | ✅ |
| Health monitoring | `/dashboard/health` | ✅ |
| Inbound webhooks | `/dashboard/inbound` | ✅ |
| Playground | `/dashboard/playground` | ✅ |
| Portal | `/dashboard/portal` | ✅ |
| Routing | `/dashboard/routing` | ✅ |
| Schemas | `/dashboard/schemas` | ✅ |
| Search | `/dashboard/search` | ✅ |
| Templates | `/dashboard/templates` | ✅ |
| Transforms | `/dashboard/transforms` | ✅ |
| Webhook creation | `/dashboard/webhooks/new` | ✅ |

### Admin Pages

| Page | Route | Status |
|------|-------|--------|
| User management | `/admin/users` | ✅ |
| Revenue dashboard | `/admin/revenue` | ✅ |
| System health | `/admin/system` | ✅ |
| Admin settings | `/admin/settings` | ✅ |

### Public Info Pages

| Page | Route | Status |
|------|-------|--------|
| API documentation | `/docs` | ✅ |
| SDK documentation | `/docs/sdks` | ✅ |
| FAQ | `/faq` | ✅ |
| Status page | `/status` | ✅ |
| About | `/about` | ✅ |
| Contact | `/contact` | ✅ |
| Privacy policy | `/privacy` | ✅ |
| Terms of service | `/terms` | ✅ |

### UI Components

| Component | Description | Status |
|-----------|-------------|--------|
| `StatCard` | Metric display card | ✅ |
| `ChartCard` | Chart wrapper component | ✅ |
| `StatusBadge` | Delivery status indicator | ✅ |
| `LoadingSpinner` | Loading state | ✅ |
| `Onboarding` | First-time user guide | ✅ |
| `ConfirmDialog` | Confirmation modal | ✅ |
| `EmptyState` | Empty list placeholder | ✅ |
| `ThemeToggle` | Dark/light mode switch | ✅ |
| `LanguageSwitcher` | i18n language selector | ✅ |
| `NotificationCenter` | In-app notification dropdown | ✅ |
| `Footer` | Site footer | ✅ |
| `AuthGuard` | Route protection | ✅ |
| `ErrorBoundary` | Error handling wrapper | ✅ |

### Internationalization

- **Languages:** English, Turkish, German, French, Spanish, Japanese (6 languages)
- **Framework:** `next-intl` with `useTranslations()` hook
- **Dark mode:** System preference detection + manual toggle

---

## SDKs (11 Languages)

| Language | Package | Installation | Status |
|----------|---------|-------------|--------|
| Node.js (TypeScript) | `hooksniff-sdk` | `npm install hooksniff-sdk` | 🔄 In development |
| Python | `hooksniff` | `pip install hooksniff` | ⏳ Planned (OpenAPI codegen) |
| Go | `hooksniff-go` | `go get github.com/servetarslan02/hooksniff-go@v0.5.0` | ✅ Available |
| Rust | `hooksniff` | `cargo add hooksniff` | ⏳ Planned (OpenAPI codegen) |
| Ruby | `hooksniff` | `gem install hooksniff` | 🔄 Models in `.cleanup/` |
| Java | `com.hooksniff` | Maven Central | ⏳ Planned (OpenAPI codegen) |
| Kotlin | `com.hooksniff` | `implementation("com.hooksniff:hooksniff-kotlin:0.5.0")` | ✅ Available |
| PHP | `hooksniff/hooksniff` | `composer require hooksniff/hooksniff` | 🔄 Tests in `.cleanup/` |
| C# | `HookSniff` | `dotnet add package HookSniff` | 🔄 Models+API in `.cleanup/` |
| Elixir | `hooksniff` | `{:hooksniff, "~> 1.0"}` | ⏳ Planned (OpenAPI codegen) |
| Swift | `HookSniff` | Swift Package Manager | ⏳ Planned |

> **Note:** SDK source code is being reorganized from `.cleanup/` to `sdks/`. See [docs/sdk-coverage.md](docs/sdk-coverage.md) for detailed status.

### SDK Common Features

All SDKs include:
- **Auto-retry** with exponential backoff
- **Webhook verification** (HMAC-SHA256, Standard Webhooks compliant)
- **Auto-idempotency** key generation
- **Type-safe** models and responses

---

## CLI & Portal

| Component | Description | Status |
|-----------|-------------|--------|
| CLI tool | Endpoint and webhook management from terminal | ✅ |
| Embeddable portal widget | Customer-facing portal for dashboard embedding | ✅ |

---

## Infrastructure

| Component | Description | Status |
|-----------|-------------|--------|
| GitHub Actions CI/CD | Lint, test, build, security audit, deploy | ✅ |
| Dependabot | Weekly scans for Cargo, npm, GitHub Actions | ✅ |
| Docker multi-stage builds | Optimized production images | ✅ |
| Docker Compose | Local development environment | ✅ |
| Cloud Run deployment | API + Worker on Google Cloud Run | ✅ |
| Secret Manager | GCP Secret Manager integration | ✅ |

---

## Planned Features

| Feature | Description | Status |
|---------|-------------|--------|
| gRPC delivery | gRPC-capable endpoint support | ⏳ |
| SQS delivery | Forward webhooks to AWS SQS queues | ⏳ |
| Kafka delivery | Kafka topic delivery | ⏳ |
| Terraform Provider | Infrastructure as code support | ⏳ |
| SOC 2 preparation | Security compliance audit | ⏳ |
| Integration test coverage | Expand test suite | ⏳ |
| SDK package publishing | npm, PyPI, crates.io package publishing | ⏳ |
