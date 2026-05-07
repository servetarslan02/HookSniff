# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 06:00 GMT+8

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

## Mimari

- **API:** Rust + Axum, port 3000, PostgreSQL (Neon) + Redis (Upstash)
- **Worker:** Rust + Tokio, PostgreSQL queue poll, HTTP/gRPC/SQS/WebSocket delivery
- **Dashboard:** Next.js 15, Tailwind + Radix + Tremor, Vercel'de
- **Auth:** JWT (dashboard) + API key `hr_live_*` (programatik), Argon2 hash
- **Signing:** HMAC-SHA256, `X-HookSniff-Signature` header
- **Retry:** Exponential backoff + jitter, per-endpoint custom policy (JSONB)
- **Billing:** Polar.sh (global), iyzico (TR), Stripe (hazır ama kullanılmıyor)
- **Monitoring:** OpenTelemetry → Grafana Cloud

## Mevcut Özellikler (Backend Hazır)

- API Key management (`routes/api_keys.rs`)
- Webhook playground (`routes/playground.rs`)
- Delivery attempt details (`routes/delivery_details.rs`)
- Webhook log search (`routes/search.rs`)
- Alerting (`routes/alerts.rs`)
- Endpoint health monitoring (`routes/health_endpoints.rs`)
- Outbound IP listesi (`routes/outbound_ips.rs`)
- Customer portal (`routes/customer_portal.rs`)
- Billing (`routes/billing.rs`)
- SSRF protection (`ssrf.rs`)
- Per-endpoint throttle (`throttle/`)
- FIFO delivery (`fifo/`)
- AI anomaly detection (fraud, churn, segment)

## Rekabet Analizi Özeti

### Rakipler
| Rakip | Güçlü | Zayıf |
|-------|-------|-------|
| **Svix** | En olgun, 6 SDK, Standard Webhooks | Pahalı ($490+), open-core |
| **Hookdeck** | Inbound webhook proxy | Sadece inbound, self-host yok |
| **Convoy** | Go performans, inbound+outbound | Elastic License (tam OSS değil) |
| **Hook0** | Tam OSS, self-host parity | Sadece 2 SDK, genç proje |

### HookSniff Farkları
- 11 SDK (en geniş)
- $49/ay (Svix'ten 10x ucuz)
- MIT lisans (tam açık kaynak)
- 4 delivery method (HTTP, WS, gRPC, SQS)
- AI anomaly detection
- $0/ay hosting (free tier servisler)

## Kritik Olaylar

### Credential İfşası (2026-05-08)
Tüm token'lar chat'te paylaşıldı. EXTERNAL_TOKENS.md'de listeli.
- Şimdilik kalacak, deploy sonrası yenilenecek
- GitHub PAT, Vercel, Neon, Upstash, Grafana, Polar, Resend, Render, Cloudflare, R2

### Render Build Hataları
- OpenSSL-sys derleme hatası
- Çözüldü: rust:slim + pkg-config + libssl-dev
- Alternatif: GCP Cloud Run'a geçildi (çalışıyor)

## Domain Durumu
- is-a.dev: İptal (ticari kullanıma uygun değil)
- edu domain: İptal
- Kalan seçenekler: eu.org (ücretsiz) veya .com ($12/yıl)

## Paket Publish Planı (Gelecek)
- npm: `@hooksniff/sdk` scope reserve et
- PyPI: `hooksniff` paket adı
- crates.io: `hooksniff` paket adı
- Terraform Registry: provider publish

---

> Bu dosya her önemli değişiklikte güncellenir.
