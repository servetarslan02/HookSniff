# Changelog

All notable changes to HookSniff will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GDPR endpoints (data export + account deletion)
- HttpOnly cookie authentication for refresh tokens
- OG image (PNG) for social media sharing
- Favicon in 5 sizes (16, 32, 180, 192, 512)
- FAQ translations (6 languages, 37 keys)
- OTLP exporter graceful fallback on initialization failure

### Fixed
- Production `unwrap()` calls eliminated (0 remaining)
- CSP and CORS configuration for production
- API key removed from localStorage (HttpOnly cookies instead)
- OpenTelemetry OTLP HTTP client dependency (`reqwest` feature)

### Security
- Inbound webhook signature verification hardened
- GCP service account key rotated
- Refresh tokens moved to HttpOnly, Secure, SameSite=Strict cookies

## [0.1.0] - 2026-04-01

### Added
- Initial release
- Rust API server (Axum) with full webhook CRUD
- Background worker for webhook delivery with retries
- Next.js 15 dashboard with dark mode, i18n (6 languages)
- Landing page with typewriter effect and animated particles
- JWT + API key authentication (Argon2 password hashing)
- HMAC-SHA256 webhook signatures (Standard Webhooks compliant)
- Replay protection (±5 minute timestamp tolerance)
- Rate limiting per plan (sliding window)
- Polar.sh billing integration (Pro + Business plans)
- iyzico billing integration (Turkey)
- Dead letter queue for failed deliveries
- Real-time delivery stream (SSE)
- WebSocket webhook delivery
- gRPC webhook delivery
- OpenTelemetry distributed tracing (Grafana Cloud)
- Prometheus metrics
- SSRF protection
- Idempotency key support
- Webhook batch sending
- Endpoint health monitoring
- Alert system for failed deliveries
- Customer portal (self-service)
- Team management
- Device push notifications (FCM)
- Search across deliveries
- Analytics dashboard (delivery trends, success rates)
- Schema validation for webhook payloads
- Webhook templates
- 11 SDKs (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
- CLI tool
- Embeddable portal widget
- GitHub Actions CI/CD (lint, test, build, deploy)
- Dependabot for Cargo, npm, and GitHub Actions
- Docker Compose for local development
- Free-tier deployment guide ($0/month)
- OpenAPI specification
- Integration and load tests (k6)

[Unreleased]: https://github.com/servetarslan02/HookSniff/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/servetarslan02/HookSniff/releases/tag/v0.1.0
