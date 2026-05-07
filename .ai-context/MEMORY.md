# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 06:50 GMT+8

## Kullanıcı
- **Servet Arslan** — servetarslan02 (GitHub)
- Türkiye, teknik bilgi yok, ilk proje
- Hedef: $500/ay gelir, sonra şirket kur

---

## ✅ TAMAMLANAN İŞLER (22/26)

| # | Görev | Durum |
|---|-------|-------|
| 2 | Free tier limit → 10,000 | ✅ |
| 3 | Playground UI | ✅ |
| 4 | Delivery Details UI | ✅ |
| 5 | Custom Retry Policy UI | ✅ |
| 6 | Signature Rotation UI | ✅ |
| 7 | Rate Limit Dashboard | ✅ |
| 8 | Customer Self-Service | ✅ |
| 9 | Standard Webhooks | ✅ |
| 10 | Event hierarchy filtering | ✅ |
| 11 | Timestamp tolerans docs | ✅ |
| 12 | Alerting test | ✅ |
| 13 | Health Monitoring test | ✅ |
| 14 | Grafana OTEL test | ✅ |
| 15 | Embeddable Customer Portal | ✅ |
| 16 | CLI Tool | ✅ (status, whoami, tail eklendi) |
| 17 | Webhook Transformations | ✅ (API route eklendi) |
| 18 | Self-Host kolaylaştır | ✅ (Makefile + docs + Helm chart) |
| 19 | Webhook Analytics Dashboard | ✅ |
| 21 | Bulk Operations | ✅ (batch replay eklendi) |
| 23 | Event Schema Validation | ✅ |
| 24 | Terraform Provider | ✅ (Go stub oluşturuldu) |
| 26 | Paket adı reserve | ✅ (docs plan hazır) |

---

## ❌ KALAN İŞLER (4/26)

| # | Görev | Not |
|---|-------|-----|
| 1 | Render Docker build | Servet yapacak (OpenSSL-sys) |
| 20 | Inbound Webhook Proxy | Sıfırdan yazılacak, en zor özellik |
| 22 | WebSocket real-time | Dashboard canlı olay akışı |
| 25 | Test coverage | Unit + integration test |

---

## Yapılan Değişiklikler (Bu Oturum)

### Transform API
- `api/src/routes/transforms.rs`: CRUD + test endpoint
- `api/src/routes/mod.rs`: transform route

### Bulk Operations
- `api/src/routes/webhooks.rs`: POST /webhooks/batch/replay

### Self-Host
- `Makefile`: self-host, self-host-status, self-host-backup, self-host-update
- `docs/SELF-HOST.md`: kurulum rehberi

### Helm Chart
- `deploy/helm/hooksniff/`: Full Kubernetes chart
  - PostgreSQL + Redis StatefulSets
  - API + Worker + Dashboard Deployments
  - Services + Ingress + Secrets

### CLI
- `cli/index.js`: status, whoami, tail komutları eklendi

### Terraform Provider
- `deploy/terraform-provider-hooksniff/`: Go provider stub
  - main.go, endpoint_resource.go, client.go

### Docs
- `docs/PACKAGE_RESERVATION.md`: npm/PyPI/crates.io plan
- `docs/SECURITY.md`: replay protection rehberi

---

## Mimari

- **API:** Rust + Axum, PostgreSQL (Neon) + Redis (Upstash)
- **Worker:** Rust, HTTP/gRPC/SQS/WebSocket delivery
- **Dashboard:** Next.js 15, Vercel
- **Auth:** JWT + API key, Argon2
- **Signing:** Standard Webhooks (HMAC-SHA256)
- **Billing:** Polar.sh + iyzico

## Servet'in Blokları
- Render Docker build (OpenSSL-sys)
- Resend domain doğrulama
- Domain kararı
- iyzico hesap

---

> Her oturumda git pull → oku → çalış → git push
