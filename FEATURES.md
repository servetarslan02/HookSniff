# 📋 HookSniff — Feature Tracker

> Son güncelleme: 2026-05-09

---

## ✅ Tamamlanan Özellikler

### API (30 Route Module)

| Feature | Dosya | Durum |
|---------|-------|-------|
| Auth (register, login, JWT, API key) | `routes/auth.rs` | ✅ |
| Two-Factor Auth (TOTP) | `routes/auth.rs` | ✅ |
| Email Verification | `routes/auth.rs` | ✅ |
| Password Reset | `routes/auth.rs` | ✅ |
| GDPR Data Export | `routes/auth.rs` | ✅ |
| GDPR Account Deletion | `routes/auth.rs` | ✅ |
| Endpoint CRUD + Secret Rotation | `routes/endpoints.rs` | ✅ |
| Webhook Send + List + Get + Replay | `routes/webhooks.rs` | ✅ |
| Batch Webhooks | `routes/webhooks.rs` | ✅ |
| Webhook Export (CSV/JSON) | `routes/webhooks.rs` | ✅ |
| Billing (Polar.sh + iyzico + Stripe) | `routes/billing.rs` | ✅ |
| Customer Portal | `routes/customer_portal.rs` | ✅ |
| Analytics (trends, success rate, latency) | `routes/analytics.rs` | ✅ |
| Search | `routes/search.rs` | ✅ |
| SSE Real-time Stream | `routes/stream.rs` | ✅ |
| Events Polling | `routes/events.rs` | ✅ |
| Alerts | `routes/alerts.rs` | ✅ |
| API Key Management | `routes/api_keys.rs` | ✅ |
| Playground | `routes/playground.rs` | ✅ |
| Simulator | `routes/simulator.rs` | ✅ |
| Embeddable Portal | `routes/embed.rs` | ✅ |
| Endpoint Health Monitoring | `routes/health_endpoints.rs` | ✅ |
| Smart Routing (round-robin, failover) | `routes/routing.rs` | ✅ |
| Schema Registry + Validation | `routes/schemas.rs` | ✅ |
| Templates | `routes/templates.rs` | ✅ |
| Transforms | `routes/transforms.rs` | ✅ |
| Teams (CRUD, invites, roles) | `routes/teams.rs` | ✅ |
| Notifications | `routes/notifications.rs` | ✅ |
| Device Push (FCM) | `routes/devices.rs` | ✅ |
| Contact Form | `routes/contact.rs` | ✅ |
| Delivery Details | `routes/delivery_details.rs` | ✅ |
| Inbound Webhook Proxy (Stripe, GitHub, Shopify) | `routes/inbound.rs` | ✅ |
| Outbound IPs | `routes/outbound_ips.rs` | ✅ |
| Swagger UI | `routes/docs.rs` | ✅ |
| Admin Panel | `routes/admin.rs` | ✅ |
| Stats | `routes/stats.rs` | ✅ |
| Health Check | `routes/health.rs` | ✅ |

### Core Modules

| Feature | Dosya | Durum |
|---------|-------|-------|
| Standard Webhooks HMAC-SHA256 | `signing.rs` | ✅ |
| SSRF Protection | `ssrf.rs` | ✅ |
| Rate Limiting (sliding window) | `rate_limit.rs` | ✅ |
| Input Validation | `validation.rs` | ✅ |
| Idempotency Keys | `middleware/idempotency.rs` | ✅ |
| FIFO Ordered Delivery | `fifo/mod.rs` | ✅ |
| Per-Endpoint Throttling | `throttle/mod.rs` | ✅ |
| Exponential Backoff Retry | `retry_policy/mod.rs` | ✅ |
| Payload Transformation | `transform/` | ✅ |
| Schema Validation | `schemas/` | ✅ |
| CloudEvents v1.0 | `events/cloudevents.rs` | ✅ |
| WebSocket Handler | `ws/` | ✅ |
| Circuit Breaker | `circuit_breaker.rs` | ✅ |
| Gmail API Email | `email.rs` | ✅ |
| OpenTelemetry Tracing | `telemetry.rs` | ✅ |
| Prometheus Metrics | `metrics.rs` | ✅ |

### Worker

| Feature | Durum |
|---------|-------|
| PostgreSQL LISTEN/NOTIFY | ✅ |
| Fallback Polling (1s) | ✅ |
| HTTP Delivery | ✅ |
| Standard Webhooks Signing | ✅ |
| Dead Letter Queue | ✅ |
| Health Check Server | ✅ |

### Dashboard (Next.js 15 — 41 sayfa)

| Sayfa | Durum |
|-------|-------|
| Landing (typewriter, particles, pricing) | ✅ |
| Login + Register | ✅ |
| 2FA Setup | ✅ |
| Dashboard Overview (stat cards, charts, activity feed) | ✅ |
| Endpoints Management | ✅ |
| Delivery Logs | ✅ |
| Analytics | ✅ |
| Alerts | ✅ |
| API Keys | ✅ |
| Billing | ✅ |
| Team Management | ✅ |
| Settings | ✅ |
| Notifications | ✅ |
| Health Monitoring | ✅ |
| Inbound Webhooks | ✅ |
| Playground | ✅ |
| Portal | ✅ |
| Routing | ✅ |
| Schemas | ✅ |
| Search | ✅ |
| Templates | ✅ |
| Transforms | ✅ |
| Webhook Creation | ✅ |
| Admin (users, revenue, system) | ✅ |
| Docs + API Docs + SDK Docs | ✅ |
| FAQ | ✅ |
| Status Page | ✅ |
| About | ✅ |
| Contact | ✅ |
| Privacy + Terms | ✅ |
| Dark Mode | ✅ |
| i18n (6 dil) | ✅ |

### SDKs (11 dil)

| Dil | Durum |
|-----|-------|
| Node.js (TypeScript) | ✅ |
| Python | ✅ |
| Go | ✅ |
| Rust | ✅ |
| Ruby | ✅ |
| Java | ✅ |
| Kotlin | ✅ |
| PHP | ✅ |
| C# | ✅ |
| Elixir | ✅ |
| Swift | ✅ |

### CLI + Portal

| Feature | Durum |
|---------|-------|
| CLI Tool | ✅ |
| Embeddable Portal Widget | ✅ |

### Infrastructure

| Feature | Durum |
|---------|-------|
| GitHub Actions CI/CD | ✅ |
| Dependabot | ✅ |
| Docker multi-stage builds | ✅ |
| Docker Compose (local dev) | ✅ |
| Cloud Run deployment | ✅ |
| Secret Manager integration | ✅ |

---

## 🔄 Planned (Henüz implementasyon yok)

| Feature | Not |
|---------|-----|
| gRPC Delivery | Schema'da `delivery_targets` var ama implementasyon yok |
| SQS Delivery | Schema'da `delivery_targets` var ama implementasyon yok |
| Kafka Delivery | Schema'da `delivery_targets` var ama implementasyon yok |
| Terraform Provider | `deploy/terraform-provider-hooksniff/` klasörü var |
| npm @hooksniff scope publish | Paket adı rezerve edildi (`docs/PACKAGE_RESERVATION.md`) |
| PyPI hooksniff publish | Paket adı rezerve edildi |
| crates.io hooksniff publish | Paket adı rezerve edildi |
