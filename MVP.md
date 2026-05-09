# HookSniff — MVP Tanımı

> Son güncelleme: 2026-05-09
> MVP = Satılabilir En Basit Ürün

---

## ✅ MVP Tamamlandı

MVP checklist'inin tüm maddeleri tamamlandı:

| # | Görev | Durum |
|---|-------|-------|
| 1 | Free tier limit: 10,000/ay | ✅ |
| 2 | Standard Webhooks header'ları | ✅ |
| 3 | Playground UI | ✅ |
| 4 | Delivery Details UI | ✅ |
| 5 | Custom Retry Policy UI | ✅ |
| 6 | Signature Rotation UI | ✅ |
| 7 | Rate Limit Dashboard | ✅ |
| 8 | Customer Self-Service | ✅ |
| 9 | Event hierarchy filtering | ✅ |
| 10 | Timestamp tolerans docs | ✅ |
| 11 | Alerting | ✅ |
| 12 | Health Monitoring | ✅ |
| 13 | Grafana OTEL | ✅ |

---

## ✅ v1.1 — Rekabet Avantajı (Tamamlandı)

| Feature | Durum |
|---------|-------|
| Embeddable Customer Portal | ✅ `routes/embed.rs` |
| CLI Tool | ✅ `cli/` |
| Inbound Webhook Proxy | ✅ `routes/inbound.rs` |
| Webhook Transformations | ✅ `transform/` |

## ✅ v1.2 — Fark Yaratma (Tamamlandı)

| Feature | Durum |
|---------|-------|
| Bulk Operations | ✅ `routes/webhooks.rs` (batch) |
| WebSocket real-time updates | ✅ `ws/` |
| Event Schema Validation | ✅ `schemas/` |
| Self-Host | ✅ `docker-compose.yml` + `docs/SELF-HOST.md` |

## 🔄 v1.3 — Enterprise Ready (Kısmen)

| Feature | Durum |
|---------|-------|
| Terraform Provider | ⏳ `deploy/terraform-provider-hooksniff/` klasörü var |
| Test coverage | ⚠️ Unit testler var, integration testler eksik |
| SOC 2 hazırlık | ❌ Başlanmadı |

---

## 🔄 Planned (Henüz implementasyon yok)

| Feature | Not |
|---------|-----|
| gRPC Delivery | Schema'da `delivery_targets` var ama implementasyon yok |
| SQS Delivery | Schema'da `delivery_targets` var ama implementasyon yok |
| Kafka Delivery | Schema'da `delivery_targets` var ama implementasyon yok |
| npm publish | `@hooksniff/sdk` scope hazır |
| PyPI publish | `hooksniff` paket adı hazır |
| crates.io publish | `hooksniff` paket adı hazır |
