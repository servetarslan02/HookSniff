# Changelog

All notable changes to HookSniff will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — SDK (11 dil)
- Node.js SDK v1.0.0 — Svix'ten adapte (63 dosya, ~40 model)
- Python SDK v1.0.0 — Svix SDK'dan doğrudan (127 dosya, 101 model)
- Go SDK v1.0.0 — Svix SDK'dan doğrudan (115 dosya, 99 model)
- Rust SDK v1.0.0 — Svix SDK'dan doğrudan (118 dosya, 98 model)
- Ruby SDK v1.0.0 — Svix'ten adapte (74 dosya, 48 model)
- Java SDK v1.0.0 — Svix'ten adapte (158 dosya, 104 model)
- Kotlin SDK v1.0.0 — Svix'ten adapte (131 dosya, 103 model)
- PHP SDK v1.0.0 — Svix'ten adapte (89 dosya, ~50 model)
- C# SDK v1.0.0 — Svix'ten adapte (67 dosya, ~40 model)
- Swift SDK v1.0.0 — HookSniff custom (~14 dosya)
- Elixir SDK v1.0.0 — OpenAPI'den adapte (247 dosya)
- Tüm SDK'larda: auto-retry + exponential backoff, webhook verification (HMAC-SHA256), auto-idempotency key

### Added — CI/CD
- Local CI script'leri: `local-ci.sh`, `local-sdk-test.sh`, `local-sdk-publish.sh`
- Makefile entegrasyonu: `make ci`, `make ci-test`, `make ci-publish`
- 11 SDK için local test runner
- SDK publish dry-run + gerçek publish desteği (npm, PyPI, crates.io, RubyGems, Maven, NuGet, Hex, Packagist)
- GitHub Actions workflow'ları (ci.yml, sdk-publish.yml, deploy.yml, trivy-scan.yml)

### Fixed
- 23 eksik i18n key eklendi (en + tr) — MISSING_MESSAGE hataları düzeltildi
- `AlertRule` ve 16 type `@/lib/api`'dan export edildi
- Dashboard build: TypeScript compilation başarılı

### Fixed (DB — AŞAMA 5)
- Performance indexes for deliveries, delivery_attempts, dead_letters, token tables, idempotency_keys (Items 182-191, 187)
- ON DELETE CASCADE added to dead_letters, teams, installed_agents foreign keys (Items 177-181)
- password_hash NOT NULL enforced with OAuth sentinel value (Item 173)
- amount_cents upgraded from INT to BIGINT on payment_transactions and invoices (Item 186)
- Unbounded list queries capped with LIMIT on 8 route handlers (Item 193)

### Added
- GDPR endpoints: `GET /v1/auth/export` (data export) + `DELETE /v1/auth/account` (account deletion)
- HttpOnly cookie authentication for refresh tokens (`hooksniff_refresh`)
- OG image (PNG) for social media sharing
- Favicon in 5 sizes (16, 32, 180, 192, 512)
- FAQ translations (6 languages, 37 keys)
- OTLP exporter graceful fallback — no longer panics if OTel initialization fails

### Fixed
- Production `unwrap()` calls eliminated (0 remaining in api/)
- CSP and CORS configuration for production
- API key removed from localStorage (HttpOnly cookies instead)
- OpenTelemetry OTLP HTTP client: added `reqwest` feature to `opentelemetry-otlp`

### Security
- Inbound webhook signature verification hardened
- GCP service account key rotated
- Refresh tokens: HttpOnly, Secure, SameSite=Strict cookies

## [0.1.0] - 2026-04-01

### Added

#### API (Rust/Axum) — 30 route modules, ~22K lines
- **Authentication**: Register, login, JWT + API key auth (`hr_live_*`/`hr_test_*`), Argon2id password hashing
- **Two-Factor Auth**: TOTP-based 2FA (enable, confirm, verify, disable)
- **Email Verification**: Verification emails via Gmail API (GCP service account)
- **Password Reset**: Time-limited email tokens (1 hour expiry)
- **Endpoints**: CRUD, secret rotation (`POST /v1/endpoints/{id}/rotate-secret`), retry policy configuration
- **Webhooks**: Send, list, get, replay, batch send (`POST /v1/webhooks/batch`), batch replay, CSV/JSON export
- **Standard Webhooks**: HMAC-SHA256 signatures, `whsec_` prefixed secrets, ±5 min replay protection, dual headers (Standard + Svix)
- **Smart Routing**: Round-robin, failover, weighted, random strategies with fallback URLs
- **FIFO Delivery**: Ordered delivery with sequence numbers, max-wait protection
- **Per-Endpoint Throttling**: Token bucket / sliding window per endpoint
- **Retry Policy**: Exponential backoff with jitter, per-endpoint customization
- **Idempotency**: `Idempotency-Key` header with 24h TTL, body hash verification
- **SSRF Protection**: Blocks private IPs, loopback, link-local, metadata endpoints, DNS validation
- **Rate Limiting**: Sliding window algorithm, pluggable (in-memory / Redis), plan-based limits
- **Input Validation**: Event type regex, URL SSRF check, JSON depth (max 10), HTML sanitization
- **Payload Transformation**: Filter, map, enrich rules per endpoint
- **Schema Registry**: JSON schema validation with versioning
- **CloudEvents**: v1.0 format support (`WEBHOOK_FORMAT=cloudevents`)
- **Analytics**: Delivery trends, success rates, latency percentiles (24h/7d/30d)
- **Search**: Full-text search across deliveries with filters
- **Real-time Stream**: SSE (`GET /v1/stream/deliveries`) + polling (`GET /v1/events`)
- **Alerts**: Alert rules with conditions, thresholds, notification channels
- **Teams**: Team CRUD, invitations, roles (admin/editor/viewer)
- **Notifications**: In-app notifications with unread count
- **Push Notifications**: FCM device token registration
- **Customer Portal**: Self-service (profile, API keys, usage, endpoints)
- **Inbound Proxy**: Receive webhooks from Stripe, GitHub, Shopify, generic providers
- **Embeddable Widget**: `GET /v1/embed/portal` — embeddable portal HTML + script
- **Playground**: Test webhooks with sample payloads
- **Simulator**: Mock delivery with configurable status codes and delays
- **Endpoint Health**: Per-endpoint success rate, p95/p99 latency, failure streaks
- **Outbound IPs**: Static IP list for enterprise firewall whitelisting
- **Swagger UI**: Interactive API docs at `GET /v1/docs`
- **Contact**: Contact form → Gmail API email
- **Prometheus Metrics**: `GET /metrics`
- **Trace ID**: `X-Trace-Id` header in every response (OpenTelemetry span or UUID fallback)

#### Billing (Multi-Provider)
- **Polar.sh**: Global payments (credit card, Apple Pay, Google Pay), tax compliance, invoicing
- **iyzico**: Turkey payments (₺149 Pro, ₺449 Business)
- **Stripe**: Legacy support
- **Plans**: Free ($0, 10K webhooks), Pro ($49, 50K), Business ($149, 500K), Enterprise (custom)
- **Customer Portal**: Self-service subscription management
- **Webhooks**: Stripe, Polar.sh, iyzico webhook handlers

#### Worker (Rust)
- PostgreSQL LISTEN/NOTIFY for instant delivery (<10ms latency)
- 1-second fallback poll for reliability
- HTTP delivery with Standard Webhooks signing
- Exponential backoff retry with jitter
- Dead letter queue for permanently failed deliveries
- Health check server for Cloud Run

#### Dashboard (Next.js 15) — 41 pages
- **Landing Page**: Typewriter effect, floating particles, code example, features grid, pricing table, how-it-works, dashboard preview mockup
- **Auth**: Login, register, 2FA setup, email verification, password reset
- **Dashboard**: Overview (stat cards, delivery trend chart, success rate donut, live activity feed, recent deliveries), endpoints management, delivery logs, analytics, alerts, API keys, billing, team management, settings, notifications, health monitoring, inbound webhooks, playground, portal, routing, schemas, search, templates, transforms, webhook creation
- **Admin**: User management, revenue dashboard, system health, settings
- **Public**: API docs, SDK docs, FAQ, status page, about, contact, privacy policy, terms of service
- **i18n**: 6 languages (English, Turkish, German, French, Spanish, Japanese)
- **Dark Mode**: System preference detection + manual toggle
- **Components**: StatCard, ChartCard, StatusBadge, LoadingSpinner, Onboarding, ConfirmDialog, EmptyState, ThemeToggle, LanguageSwitcher, NotificationCenter, Footer, AuthGuard, ErrorBoundary

#### SDKs — 11 languages
- **Node.js** (TypeScript): Full API client + `WebhookVerifier` class
- **Python**: `hooksniff` package with webhook verification
- **Go**: `hooksniff-go` with HMAC verification
- **Rust**: `hooksniff` crate
- **Ruby**: `hooksniff` gem
- **Java**: `com.hooksniff` package
- **Kotlin**: `com.hooksniff` package
- **PHP**: `hooksniff/hooksniff` Composer package
- **C#**: `HookSniff` NuGet package
- **Elixir**: `hooksniff` Hex package
- **Swift**: `HookSniff` Swift Package

#### CLI
- `hooksniff` CLI tool for endpoint and webhook management

#### Portal
- Embeddable portal widget for customer-facing dashboards

#### Infrastructure
- **CI/CD**: GitHub Actions (lint, test, build, security audit, deploy to Cloud Run)
- **Dependabot**: Weekly scans for Cargo, npm, GitHub Actions
- **Docker**: Multi-stage builds (Rust slim + Debian bookworm-slim runtime)
- **Docker Compose**: PostgreSQL + API + Worker + Dashboard for local development
- **Cloud Run**: API + Worker deployment with Secret Manager integration
- **Vercel**: Dashboard deployment
- **Neon**: Serverless PostgreSQL (eu-central-1)
- **Upstash**: Serverless Redis
- **Cloudflare R2**: Object storage (10GB free)
- **Grafana Cloud**: OpenTelemetry tracing + dashboards
- **Gmail API**: Transactional emails via GCP service account

#### Documentation
- OpenAPI 3.0 specification (`docs/openapi.yaml`)
- API reference, quickstart guide, architecture docs
- Deployment guide, self-host guide, free-tier setup guide
- Security policy (webhook signature verification)
- Contributing guide

#### Testing
- Unit tests (Rust)
- Integration test scripts (Bash + PowerShell)
- k6 load tests
- CI: `cargo audit` + `npm audit`

[Unreleased]: https://github.com/servetarslan02/HookSniff/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/servetarslan02/HookSniff/releases/tag/v0.1.0
