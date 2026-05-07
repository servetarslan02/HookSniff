# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 06:36 GMT+8

## Kullanıcı
- **Servet Arslan** — servetarslan02 (GitHub)
- Türkiye, teknik bilgi yok, ilk proje
- Hedef: $500/ay gelir, sonra şirket kur

## Proje Durumu

### Çalışan Servisler
| Servis | Durum | Not |
|--------|-------|-----|
| Dashboard | ✅ | https://hooksniff.vercel.app |
| API | ✅ | GCP Cloud Run |
| Worker | ✅ | GCP Cloud Run |
| Neon DB | ✅ | 35 migration |
| Upstash Redis | ✅ | Rate limiting |
| Polar.sh | ✅ | Pro $49 / Business $149 |

### Çalışmayan / Eksik
| Servis | Durum | Sorun |
|--------|-------|-------|
| Resend | ⚠️ | Domain doğrulanmamış |
| iyzico | ❌ | Hesap açılmamış |
| Domain | ❌ | eu.org veya .com alınacak |

---

## ✅ TAMAMLANAN İŞLER (13 madde)

| # | Görev | Durum |
|---|-------|-------|
| 2 | Free tier limit 1,000 → 10,000 webhook/ay | ✅ |
| 3 | Playground UI | ✅ |
| 4 | Delivery Details UI | ✅ |
| 5 | Custom Retry Policy UI | ✅ |
| 6 | Signature Rotation UI | ✅ |
| 7 | Rate Limit Dashboard | ✅ |
| 8 | Customer Self-Service sayfası | ✅ |
| 9 | Standard Webhooks header'ları | ✅ |
| 10 | Event hierarchy filtering | ✅ |
| 11 | Timestamp tolerans docs | ✅ |
| 12 | Alerting test | ✅ |
| 13 | Health Monitoring test | ✅ |
| 14 | Grafana OTEL test | ✅ |

---

## ❌ KALAN İŞLER (13 madde)

### Acil (Servet yapacak)
| # | Görev | Not |
|---|-------|-----|
| 1 | Render Docker build düzelt | Dockerfile.api + Dockerfile.worker, OpenSSL-sys sorunu |

### Büyük Özellikler (AI yapacak)
| # | Görev | Tahmini |
|---|-------|---------|
| 15 | Embeddable Customer Portal | portal/embed.js, iframe ile SaaS'lara göster |
| 16 | CLI Tool tamamla | cli/index.js |
| 17 | Webhook Transformations | payload dönüştürme (map, filter, enrich) |
| 18 | Self-Host kolaylaştır | make self-host + Helm chart + dokümantasyon |
| 19 | Webhook Analytics Dashboard | mevcut stats'ı geliştir |
| 20 | Inbound Webhook Proxy | webhook alma + yönlendirme (sıfırdan) |
| 21 | Bulk Operations | toplu endpoint oluşturma/silme, toplu replay |
| 22 | WebSocket real-time updates | dashboard'da canlı olay akışı |
| 23 | Event Schema Validation | JSON Schema ile payload doğrulama |

### Enterprise
| # | Görev | Tahmini |
|---|-------|---------|
| 24 | Terraform Provider | terraform-provider-hooksniff |
| 25 | Test coverage | unit + integration test |
| 26 | Paket adı reserve | npm @hooksniff, PyPI hooksniff, crates.io hooksniff |

---

## Mimari

- **API:** Rust + Axum, port 3000, PostgreSQL (Neon) + Redis (Upstash)
- **Worker:** Rust + Tokio, HTTP/gRPC/SQS/WebSocket delivery
- **Dashboard:** Next.js 15, Tailwind + Radix + Tremor, Vercel'de
- **Auth:** JWT + API key `hr_live_*`, Argon2
- **Signing:** HMAC-SHA256, Standard Webhooks
- **Retry:** Exponential backoff + jitter, per-endpoint custom policy
- **Billing:** Polar.sh (global), iyzico (TR)

## Domain Planı
- Seçenek A: eu.org (ücretsiz)
- Seçenek B: .com ($12/yıl)

---

> Her oturumda git pull → oku → çalış → git push
