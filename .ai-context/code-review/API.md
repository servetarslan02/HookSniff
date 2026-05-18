# 🔍 API & Worker İnceleme

> Kapsam: `api/` (81 dosya, ~32,940 satır) + `worker/` (10 dosya, ~2,379 satır)
> Tarih: 2026-05-10

---

## 🔴 Kritik

| # | Sorun | Dosya | Satır |
|---|-------|-------|-------|
| 1 | Fiyat $49/$149 yanlış — olmalı $29/$99 | `api/src/billing/mod.rs` | ~85 | ✅ Düzeltildi (2026-05-10) |
| 2 | Admin revenue query de $49/$149 | `api/src/routes/admin.rs` | ~CASE | ✅ Düzeltildi (2026-05-10) |
| 3 | Config Debug'da secret sızıntısı (hmac_secret, jwt_secret) | `api/src/config.rs` | struct | ✅ Düzeltildi (2026-05-10) |
| 4 | GDPR delete_account 12+ tabloda veri bırakıyor | `api/src/routes/auth.rs` | delete_account() | ✅ Düzeltildi (2026-05-10) |
| 5 | Fanout feature işlevsiz (target config kullanılmıyor) | `worker/src/fanout.rs` | deliver_to_target() |

## 🟠 Yüksek

| # | Sorun | Dosya | Satır |
|---|-------|-------|-------|
| 1 | Batch webhook race condition (queue publish hatası → stuck pending) | `api/src/routes/webhooks.rs` | batch_webhooks() |
| 2 | Auth middleware her istekte 2 DB sorgusu (cache yok) | `api/src/middleware/mod.rs` | ~50 | ✅ Düzeltildi (2026-05-10) |
| 3 | Worker paralel değil (sırayla `for item in items`) | `worker/src/main.rs` | ~for |
| 4 | Response header sızıntısı (Set-Cookie bile kaydediliyor) | `worker/src/delivery/http.rs` | delivery_attempts |
| 5 | Custom header injection riski (Host, Content-Length enjekte edilebilir) | `worker/src/delivery/http.rs` | headers |
| 6 | `compute_body_hash` weak hash (DefaultHasher — collision açık) | `api/src/middleware/idempotency.rs` | ~hash |
| 7 | Deploy'ta Polar product ID hardcoded | `deploy/gcp-deploy.sh` | POLAR_PRODUCT |

## 🟡 Orta

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | `events.rs` SQL string interpolation (where_clause format! ile) | `api/src/routes/events.rs` |
| 2 | `ip_whitelist` tek STRING column — array/table olmalı | `migrations/002_security_features.sql` |
| 2 | `role` VARCHAR(50) — ENUM olmalı | `migrations/004_teams.sql` |
| 3 | `amount_cents` INT — BIGINT olmalı | `migrations/009_payment_providers.sql` |
| 4 | `currency` TEXT — CHAR(3) olmalı | `migrations/009_payment_providers.sql` |
| 5 | `target_type` serbest STRING — constrain edilmeli | `migrations/005_event_mesh.sql` |
| 6 | Invoice status default 'paid' — 'pending' olmalı | `migrations/028_invoices.sql` |
| 7 | Expired token cleanup job yok (password reset, email verification, refresh) | `migrations/030-032` |
| 8 | TOTP secret şifrelenmemiş, backup codes yok | `migrations/033_totp_2fa.sql` |
| 9 | `inbound.rs` crypt() PostgreSQL extension gerektirir | `api/src/routes/inbound.rs` | ✅ Düzeltildi (2026-05-10) |
| 10 | `teams.rs` invite token response'da dönüyor | `api/src/routes/teams.rs` | ✅ Düzeltildi (2026-05-10) |
| 11 | `customer_portal.rs` duplicate API key management | `api/src/routes/customer_portal.rs` |
| 12 | `embed.rs` hardcoded API URL | `api/src/routes/embed.rs` | ✅ Düzeltildi (2026-05-10) |

## 🟢 Güçlü Yönler

- ✅ HMAC-SHA256 constant-time comparison
- ✅ SSRF koruması (private IP, loopback, metadata engelleme)
- ✅ Argon2id password + API key hashing
- ✅ TOTP 2FA (RFC 6238)
- ✅ Replay protection (timestamp + seen_webhooks)
- ✅ Rate limiting (plan-based, Redis destekli)
- ✅ Circuit breaker (per-endpoint failure tracking)
- ✅ Idempotency key + body hash validation
- ✅ Login rate limit (10/15min brute force koruması)
- ✅ Email enumeration koruması
- ✅ PostgreSQL LISTEN/NOTIFY + FOR UPDATE SKIP LOCKED
- ✅ Zombie reaper (5dk stuck recovery)
- ✅ Graceful shutdown (SIGTERM/SIGINT)
- ✅ OpenTelemetry distributed tracing
- ✅ Exponential backoff retry (30s → 30min)
- ✅ Secret rotation support (old_secret + 24h grace period)
- ✅ Type-safe SQL (sqlx compile-time checks)
- ✅ Structured logging (JSON in production)
