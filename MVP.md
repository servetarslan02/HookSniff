# HookSniff — MVP Definition

> Last updated: 2026-06-03
> MVP = Minimum Viable Product

---

## ✅ MVP Complete

All MVP checklist items have been completed:

| # | Task | Status |
|---|------|--------|
| 1 | Free tier limit: 10,000 webhooks/month | ✅ |
| 2 | Standard Webhooks headers | ✅ |
| 3 | Playground UI | ✅ |
| 4 | Delivery Details UI | ✅ |
| 5 | Custom Retry Policy UI | ✅ |
| 6 | Signature Rotation UI | ✅ |
| 7 | Rate Limit Dashboard | ✅ |
| 8 | Customer Self-Service | ✅ |
| 9 | Event hierarchy filtering | ✅ |
| 10 | Timestamp tolerance docs | ✅ |
| 11 | Alerting | ✅ |
| 12 | Health Monitoring | ✅ |
| 13 | Grafana OpenTelemetry | ✅ |

---

## ✅ v1.1 — Competitive Advantage (Complete)

| Feature | Status |
|---------|--------|
| Embeddable Customer Portal | ✅ `routes/embed.rs` |
| CLI Tool | ✅ `cli/` |
| Inbound Webhook Proxy | ✅ `routes/inbound.rs` |
| Webhook Transformations | ✅ `transform/` |

## ✅ v1.2 — Differentiation (Complete)

| Feature | Status |
|---------|--------|
| Bulk Operations | ✅ `routes/webhooks.rs` (batch) |
| WebSocket real-time updates | ✅ `ws/` |
| Event Schema Validation | ✅ `schemas/` |
| Self-Host | ✅ `docker-compose.yml` + `docs/SELF-HOST.md` |

## 🔄 v1.3 — Enterprise Ready (Partial)

| Feature | Status |
|---------|--------|
| Terraform Provider | ⏳ Skeleton exists in `deploy/terraform-provider-hooksniff/` |
| Test coverage | ⚠️ Unit tests exist, integration tests need expansion |
| SOC 2 preparation | ⏳ Not started |

---

## Planned Features

| Feature | Notes |
|---------|-------|
| gRPC Delivery | Schema has `delivery_targets` but no implementation |
| SQS Delivery | Schema has `delivery_targets` but no implementation |
| Kafka Delivery | Schema has `delivery_targets` but no implementation |
| npm publish | `@hooksniff/sdk` scope reserved |
| PyPI publish | `hooksniff` package name reserved |
| crates.io publish | `hooksniff` package name reserved |
