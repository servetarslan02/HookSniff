# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 06:45 GMT+8

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
| Neon DB | ✅ | 35 migration otomatik |
| Upstash Redis | ✅ | Rate limiting |
| Polar.sh | ✅ | Pro $49 / Business $149 |

### Çalışmayan / Eksik
| Servis | Durum | Sorun |
|--------|-------|-------|
| Resend | ⚠️ | Domain doğrulanmamış |
| Grafana | ⚠️ | OTEL test edilmemiş |
| iyzico | ❌ | Hesap açılmamış |
| Domain | ❌ | eu.org veya .com alınacak |

## MVP Durumu — 13/13 TAMAMLANDI ✅

1. ✅ Free tier limit 1,000 → 10,000/webhook/ay
2. ✅ Standard Webhooks header'ları (zaten implemente edilmiş)
3. ✅ Playground UI (zaten dolu)
4. ✅ Delivery Details UI (zaten dolu)
5. ✅ Custom Retry Policy UI — yeni endpoint detail sayfası
6. ✅ Signature Rotation UI — endpoint detail sayfasında
7. ✅ Rate Limit Dashboard — endpoint detail sayfasında
8. ✅ Customer Self-Service (zaten dolu)
9. ✅ Event hierarchy filtering (zaten çalışıyor)
10. ✅ Timestamp tolerans docs — docs/SECURITY.md
11. ✅ Alerting (backend+frontend hazır)
12. ✅ Health Monitoring (backend+frontend hazır)
13. ✅ Grafana OTEL (backend hazır)

## Yapılan Değişiklikler (2026-05-08)

### Free Tier Limit
- `api/src/billing/mod.rs`: Plan::Free max_webhooks_per_month 10,000
- `api/src/db.rs`: webhook_limit DEFAULT 10000
- `api/src/routes/admin.rs`: default limit 10,000
- `migrations/029_free_tier_10k.sql`: mevcut müşterileri güncelle

### Endpoint Settings API
- `api/src/routes/endpoints.rs`: PUT /{id} update endpoint + PUT /{id}/retry-policy

### Endpoint Settings UI
- `dashboard/src/app/[locale]/dashboard/endpoints/[id]/page.tsx`: Retry policy, signature rotation, rate limit
- `dashboard/src/lib/api.ts`: endpointsApi.update + updateRetryPolicy

### Security Docs
- `docs/SECURITY.md`: Replay protection, signature verification, rotation rehberi

## Mimari

- **API:** Rust + Axum, port 3000, PostgreSQL (Neon) + Redis (Upstash)
- **Worker:** Rust + Tokio, PostgreSQL queue poll, HTTP/gRPC/SQS/WebSocket delivery
- **Dashboard:** Next.js 15, Tailwind + Radix + Tremor, Vercel'de
- **Auth:** JWT (dashboard) + API key `hr_live_*` (programatik), Argon2 hash
- **Signing:** HMAC-SHA256, `webhook-id`/`webhook-timestamp`/`webhook-signature` (Standard Webhooks)
- **Retry:** Exponential backoff + jitter, per-endpoint custom policy (JSONB)
- **Billing:** Polar.sh (global), iyzico (TR), Stripe (hazır ama kullanılmıyor)

## Sonraki Adımlar

1. **Servet yapacak:** Render Docker build düzelt, Resend domain doğrulama, Domain kararı, iyzico hesap
2. **v1.1:** Embeddable Portal, CLI Tool, Inbound Proxy, Transformations
3. **v1.2:** Bulk Ops, WebSocket real-time, Schema Validation, Self-Host

---

> Bu dosya her önemli değişiklikte güncellenir.
