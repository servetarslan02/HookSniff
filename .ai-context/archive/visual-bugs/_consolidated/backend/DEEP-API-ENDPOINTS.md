# HookSniff API Endpoint Deep Audit

> **Taranan Dizin**: `HookSniff/api/src/routes/` (37 `.rs` dosyası)
> **Toplam Endpoint Sayısı**: ~95+ endpoint
> **Tarih**: 2026-05-10

---

## Genel Mimarisi Özet

### Auth Katmanı (`mod.rs`)
- **Protected routes**: `auth_middleware` (JWT + API key)
- **Admin routes**: `auth_middleware` + `admin_middleware` (is_admin check)
- **Inbound routes**: `auth_middleware` (API key ile)
- **Public routes**: `/auth/*`, `/oauth/*`, `/contact`, `/outbound-ips`, `/status` — auth YOK

### Global Rate Limiting
- `rate_limit_middleware` tüm API router'a uygulanmış (mod.rs L40-42)
- Bazı endpoint'ler kendi rate limit'lerini de uygular (login, register, forgot_password)

---

## Endpoint Bazlı Denetim Tablosu

### auth.rs — Kimlik Doğrulama

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| POST | `/auth/register` | ❌ Public | ✅ 5/IP/saat | ✅ email, password len>=8 | ⚠️ IP extraction X-Forwarded-For spoofing riski; email doğrulama yok (sadece `@` kontrolü) |
| POST | `/auth/login` | ❌ Public | ✅ 10/IP/15dk | ✅ email/password | ⚠️ Timing attack: `Unauthorized` hem email hem password için aynı mesaj |
| POST | `/auth/forgot-password` | ❌ Public | ✅ 5/IP/saat | ✅ email enumeration koruması | ✅ İyi — her zaman aynı mesaj döner |
| POST | `/auth/reset-password` | ❌ Public | ✅ 5/IP/saat | ✅ password len>=8, token expiry | ⚠️ Token reuse koruması var (`used=true`) |
| POST | `/auth/verify-email` | ❌ Public | ❌ Rate limit YOK | ✅ token validation | 🔴 Rate limit eksik — brute force token attack |
| POST | `/auth/resend-verification` | ❌ Public | ✅ 5/IP/saat | ✅ email enumeration koruması | ✅ İyi |
| POST | `/auth/refresh` | ❌ Public (cookie/body) | ❌ Rate limit YOK | ✅ token validation | 🔴 Rate limit eksik — token brute force |
| POST | `/auth/2fa/verify` | ❌ Public (temp token) | ❌ Rate limit YOK | ✅ TOTP verification | 🔴 Rate limit eksik — TOTP brute force (6 digit = 1M kombinasyon) |
| GET | `/auth/me` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| PUT | `/auth/profile` | ✅ auth_middleware | ✅ Global | ✅ email/name validation | ⚠️ Email uniqueness check race condition |
| PUT | `/auth/password` | ✅ auth_middleware | ✅ Global | ✅ password len>=8 | ✅ Refresh token revoke var |
| POST | `/auth/logout` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ Cookie clear sadece client-side — server-side token invalidation yok |
| POST | `/auth/2fa/enable` | ✅ auth_middleware | ✅ Global | ✅ password verification | ✅ |
| POST | `/auth/2fa/confirm` | ✅ auth_middleware | ✅ Global | ✅ TOTP code | ✅ |
| POST | `/auth/2fa/disable` | ✅ auth_middleware | ✅ Global | ✅ password verification | ✅ |
| GET | `/auth/export` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ LIMIT 10000 delivery — büyük hesaplarda memory issue |
| DELETE | `/auth/account` | ✅ auth_middleware | ✅ Global | ✅ password confirmation | ✅ Transaction ile silme |

### admin.rs — Admin Paneli

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/admin/users` | ✅ admin_middleware | ✅ Global | ✅ pagination clamped 1-100 | ⚠️ SQL injection riski yok (parameterized) ama `search` parametresi ILIKE ile — wildcard injection mümkün |
| GET | `/admin/users/{id}` | ✅ admin_middleware | ✅ Global | ✅ UUID path param | ✅ |
| PUT | `/admin/users/{id}/plan` | ✅ admin_middleware | ✅ Global | ✅ plan validation (free/pro/business) | ✅ Webhook limit reset logic iyi |
| PUT | `/admin/users/{id}/status` | ✅ admin_middleware | ✅ Global | ✅ self-deactivation koruması | ✅ |
| GET | `/admin/stats` | ✅ admin_middleware | ✅ Global | ✅ | ⚠️ Revenue hesaplama hardcoded fiyatlar — DB'den okunmalı |
| GET | `/admin/revenue` | ✅ admin_middleware | ✅ Global | ✅ | ⚠️ 12 aylık generate_series — büyük datasetlerde yavaş |
| POST | `/admin/sdk-update` | ✅ admin_middleware | ✅ Global | ✅ empty check | ⚠️ `updates` array için max limit yok |

### alerts.rs — Alarm Kuralları

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/alerts/` | ✅ auth_middleware | ✅ Global | ✅ ownership (customer_id) | ⚠️ Pagination yok — tüm alert'ler döner |
| POST | `/alerts/` | ✅ auth_middleware | ✅ Global | ⚠️ name/condition validation eksik | 🔴 `condition` string'i whitelist ile validate edilmemiş; `channels` validation eksik |
| GET | `/alerts/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| DELETE | `/alerts/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| POST | `/alerts/{id}/test` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ⚠️ Gerçek test notification gönderimi implemente edilmemiş |

### analytics.rs — Analitik

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/analytics/deliveries` | ✅ auth_middleware | ✅ Global | ✅ range validation (24h/7d/30d) | ✅ |
| GET | `/analytics/success-rate` | ✅ auth_middleware | ✅ Global | ✅ range validation | ✅ |
| GET | `/analytics/latency` | ✅ auth_middleware | ✅ Global | ✅ range validation | ✅ |

### api_keys.rs — API Key Yönetimi

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/api-keys/` | ✅ auth_middleware | ✅ Global | ✅ | ✅ Prefix gösterimi iyi |
| POST | `/api-keys/` | ✅ auth_middleware | ✅ Global | ⚠️ name optional | ⚠️ Max API key limit yok — customers unlimited key oluşturabilir |
| DELETE | `/api-keys/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| POST | `/api-keys/{id}/rotate` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### audit_log.rs — Denetim Günlüğü

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/audit-log/` | ✅ auth_middleware | ✅ Global | ✅ pagination (limit max 200) | ✅ |
| GET | `/audit-log/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### billing.rs — Ödeme

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/billing/subscription` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| POST | `/billing/upgrade` | ✅ auth_middleware | ✅ Global | ✅ plan/provider validation | ⚠️ Race condition: aynı anda 2 upgrade request'i |
| POST | `/billing/portal` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| GET | `/billing/usage` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| GET | `/billing/invoices` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ Pagination yok |
| POST | `/billing/webhook` | ❌ Public (Stripe) | ❌ Rate limit YOK | ⚠️ Signature verification optional (secret boşsa skip) | 🔴 Webhook secret boşsa verification bypass; brute force ile fake webhook gönderilebilir |
| POST | `/billing/webhook/polar` | ❌ Public | ❌ Rate limit YOK | ✅ Polar signature verification | ⚠️ Error message'da internal config sızıntısı |
| POST | `/billing/webhook/iyzico` | ❌ Public | ❌ Rate limit YOK | ✅ iyzico signature verification | ⚠️ Error message'da internal config sızıntısı |

### contact.rs — İletişim Formu

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| POST | `/contact/` | ❌ Public | ❌ Rate limit YOK | ✅ basic validation (name/email/message) | 🔴 Rate limit eksik — spam attack; email validation sadece `@` ve `.` kontrolü; XSS riski yok (HTML escape) |

### custom_domains.rs — Özel Domain

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/custom-domains/` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| POST | `/custom-domains/` | ✅ auth_middleware | ✅ Global | ✅ domain format, blocked list | ⚠️ `dig`/`nslookup` subprocess — command injection riski yok (arg array) ama SSRF via DNS |
| DELETE | `/custom-domains/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| POST | `/custom-domains/{id}/verify` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ⚠️ `dig` subprocess output parsing — attacker-controlled domain input |

### customer_portal.rs — Self-Service Portal

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/portal/me` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| PUT | `/portal/me` | ✅ auth_middleware | ✅ Global | ⚠️ email validation sadece `@` | ⚠️ Email uniqueness check yok |
| GET | `/portal/api-keys` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ customers tablosundan tek key döner — api_keys tablosundan değil |
| POST | `/portal/api-keys` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ Mevcut key'i overwrite eder — eski key anında geçersiz |
| DELETE | `/portal/api-keys/{key_id}` | ✅ auth_middleware | ✅ Global | ⚠️ key_id parametre hiç kullanılmıyor | 🔴 `_key_id` parametre ignore ediliyor — her zaman yeni key oluşturur |
| GET | `/portal/usage` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| GET | `/portal/plan` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| GET | `/portal/notifications` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| PUT | `/portal/notifications` | ✅ auth_middleware | ✅ Global | ⚠️ URL validation yok | 🔴 `slack_webhook_url`, `discord_webhook_url`, `webhook_url` — SSRF riski; internal URL'ler atanabilir |

### delivery_details.rs — Teslimat Detayları

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/{id}/details` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| GET | `/{id}/attempts/{attempt_id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check (delivery) | ✅ |

### devices.rs — Cihaz Tokenları

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| POST | `/devices/` | ✅ auth_middleware | ✅ Global | ✅ token/platform validation | ✅ Upsert logic iyi |
| GET | `/devices/` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| DELETE | `/devices/{token}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### embed.rs — Gömülü Portal

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/embed/` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ XSS riski — customer description'ı HTML'e直接 inject ediliyor |
| GET | `/embed/script` | ✅ auth_middleware | ✅ Global | ✅ | ✅ Static content |

### endpoints.rs — Webhook Endpoint'leri

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/endpoints/` | ✅ auth_middleware | ✅ Global | ✅ ownership | ✅ |
| POST | `/endpoints/` | ✅ auth_middleware | ✅ Global | ✅ URL validation, SSRF check, custom header validation | ✅ Plan limit check iyi |
| GET | `/endpoints/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| PUT | `/endpoints/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check, URL/header validation | ✅ COALESCE ile partial update |
| DELETE | `/endpoints/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| POST | `/endpoints/{id}/rotate-secret` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ 24h grace period |
| PUT | `/endpoints/{id}/retry-policy` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### events.rs — Olay Listesi

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/events/` | ✅ auth_middleware | ✅ Global | ✅ pagination, filters, timestamp parse | ⚠️ Total count sadece customer_id ile — filtre uygulanmamış count |

### health.rs — Sistem Durumu

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/status` | ❌ Public | ❌ Rate limit YOK | ✅ | ⚠️ DB error message'ı sızıntısı — `description` field'ında hata detayı |
| OPTIONS | `/status` | ❌ Public | ❌ | ✅ CORS | ✅ |

### health_endpoints.rs — Endpoint Sağlık

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/endpoint-health/` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ N+1 query yok (batch fetch) — iyi |
| GET | `/endpoint-health/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### inbound.rs — Inbound Webhook Proxy

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| POST | `/inbound/:provider` | ✅ API key auth | ❌ Rate limit YOK | ✅ signature verification | 🔴 Rate limit eksik — external service flood; API key prefix lookup tek başına yeterli değil |
| POST | `/inbound/:provider/:endpoint_id` | ✅ API key auth | ❌ Rate limit YOK | ⚠️ Signature verification optional (config yoksa skip) | 🔴 Signature verification bypass riski — config yoksa verification atlanır |

### notifications.rs — Bildirimler

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/notifications/` | ✅ auth_middleware | ✅ Global | ✅ pagination (clamp 1-100) | ✅ |
| GET | `/notifications/unread-count` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| PUT | `/notifications/{id}/read` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| PUT | `/notifications/read-all` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| DELETE | `/notifications/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### oauth.rs — OAuth2 Social Login

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/oauth/providers` | ❌ Public | ❌ Rate limit YOK | ✅ | ⚠️ Environment variable availability bilgisi sızıntısı |
| GET | `/oauth/google` | ❌ Public | ❌ Rate limit YOK | ✅ CSRF state cookie | ✅ |
| GET | `/oauth/google/callback` | ❌ Public | ❌ Rate limit YOK | ✅ CSRF state verification | ⚠️ Error message'da provider detail sızıntısı |
| GET | `/oauth/github` | ❌ Public | ❌ Rate limit YOK | ✅ CSRF state cookie | ✅ |
| GET | `/oauth/github/callback` | ❌ Public | ❌ Rate limit YOK | ✅ CSRF state verification | ⚠️ GitHub email null ise fallback var |

### outbound_ips.rs — Çıkış IP'leri

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/outbound-ips/` | ❌ Public | ❌ Rate limit YOK | ✅ | ✅ Static data |

### playground.rs — Test Alanı

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/playground/` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ LIMIT 5 — hardcoded |
| POST | `/playground/test` | ✅ auth_middleware | ✅ Global | ✅ endpoint ownership | ⚠️ SSRF — `reqwest::Client` ile arbitrary URL'e HTTP request; `timeout` var ama internal URL block yok |

### portal_config.rs — Portal Konfigürasyonu

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/portal/config` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| POST | `/portal/config` | ✅ auth_middleware | ✅ Global | ✅ color format, CSS XSS prevention | ✅ CSS sanitization iyi |
| GET | `/portal/embed-code` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |

### rate_limits.rs — Rate Limit Konfigürasyonu

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/rate-limits/` | ✅ auth_middleware | ✅ Global | ✅ ownership via JOIN | ✅ |
| GET | `/rate-limits/{endpoint_id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| POST | `/rate-limits/{endpoint_id}` | ✅ auth_middleware | ✅ Global | ✅ clamp 1-10000 | ✅ |
| DELETE | `/rate-limits/{endpoint_id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### routing.rs — Akıllı Yönlendirme

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/{id}/routing` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| PUT | `/{id}/routing` | ✅ auth_middleware | ✅ Global | ✅ URL validation | ⚠️ `RoutingStrategy::parse_str` — invalid string silently accepted (default'a düşer) |
| GET | `/{id}/health` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

### schemas.rs — Şema Kaydı

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| POST | `/schemas/` | ✅ auth_middleware | ✅ Global | ✅ name required | ⚠️ Schema content validation yok — arbitrary JSON |
| GET | `/schemas/` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| GET | `/schemas/{id}` | ✅ auth_middleware | ✅ Global | ⚠️ ownership check YOK | 🔴 Herhangi bir customer, başka customer'ın schema'sını okuyabilir |
| POST | `/schemas/{id}/validate` | ✅ auth_middleware | ✅ Global | ⚠️ ownership check YOK | 🔴 Same issue — cross-tenant data access |

### search.rs — Arama

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/search/` | ✅ auth_middleware | ✅ Global | ✅ pagination, filters, date parse, ILIKE escaping | ⚠️ `q` parametresi ILIKE ile — wildcard injection mümkün ama escape var |

### simulator.rs — Webhook Simülatörü

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| POST | `/simulator/` | ✅ auth_middleware | ✅ Global | ✅ delay clamping (max 30s) | ⚠️ Hardcoded test secret `whsec_simulator_test_key` |

### sso.rs — SSO Konfigürasyonu

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/sso/config` | ✅ auth_middleware | ✅ Global | ✅ | ✅ Sensitive fields masked |
| POST | `/sso/config` | ✅ auth_middleware | ✅ Global | ✅ provider/required field validation | ✅ AES-256-GCM encryption |
| DELETE | `/sso/config` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| POST | `/sso/test` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |

### stats.rs — İstatistikler

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/stats/` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |

### stream.rs — Gerçek Zamanlı SSE

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/stream/deliveries` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ SSE connection limit yok — resource exhaustion; 2 saniyede DB poll — performans |

### teams.rs — Ekip Yönetimi

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| POST | `/teams/` | ✅ auth_middleware | ✅ Global | ✅ name validation | ✅ Transaction ile owner+member insert |
| GET | `/teams/` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ N+1 query (her team için member count) |
| GET | `/teams/{id}` | ✅ auth_middleware | ✅ Global | ✅ team membership check | ✅ |
| POST | `/teams/{id}/invite` | ✅ auth_middleware | ✅ Global | ✅ email, role validation, duplicate check | ⚠️ Invite token email'e gönderilmeli ama implementasyon eksik |
| GET | `/teams/{id}/members` | ✅ auth_middleware | ✅ Global | ✅ team membership check | ✅ |
| DELETE | `/teams/{id}/members/{uid}` | ✅ auth_middleware | ✅ Global | ✅ admin check, owner protection | ✅ |
| PUT | `/teams/{id}/members/{uid}/role` | ✅ auth_middleware | ✅ Global | ✅ role validation, owner protection | ✅ |

### templates.rs — Webhook Şablonları

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/templates/` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| GET | `/templates/{id}` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |
| POST | `/templates/{id}/apply` | ✅ auth_middleware | ✅ Global | ✅ | ⚠️ Endpoint creation'da plan limit check yok |

### transforms.rs — Dönüşüm Kuralları

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/endpoints/{id}/transforms/` | ✅ auth_middleware | ✅ Global | ✅ endpoint ownership | ✅ |
| POST | `/endpoints/{id}/transforms/` | ✅ auth_middleware | ✅ Global | ✅ endpoint ownership | ✅ |
| PUT | `/endpoints/{id}/transforms/{id}` | ✅ auth_middleware | ✅ Global | ✅ endpoint ownership | ⚠️ rule_id ownership check yok — sadece endpoint check |
| DELETE | `/endpoints/{id}/transforms/{id}` | ✅ auth_middleware | ✅ Global | ✅ endpoint ownership | ⚠️ Same — rule_id ownership check eksik |
| POST | `/endpoints/{id}/transforms/test` | ✅ auth_middleware | ✅ Global | ✅ | ✅ |

### webhooks.rs — Webhook Gönderimi (Ana Endpoint)

| Method | Path | Auth | RateLimit | Validation | Issues |
|--------|------|------|-----------|------------|--------|
| GET | `/webhooks/` | ✅ auth_middleware | ✅ Global | ✅ pagination | ✅ |
| POST | `/webhooks/` | ✅ auth_middleware | ✅ Global | ✅ idempotency, event type, JSON depth, payload size, SSRF, event filter | ✅ Atomic webhook_count increment |
| POST | `/webhooks/batch` | ✅ auth_middleware | ✅ Global | ✅ max 100 items, atomic count | ✅ Rollback excess count on failures |
| POST | `/webhooks/batch/replay` | ✅ auth_middleware | ✅ Global | ✅ max 100 items | ✅ |
| GET | `/webhooks/export` | ✅ auth_middleware | ✅ Global | ✅ format/status/date filters, CSV injection prevention | ⚠️ LIMIT 10000 hardcoded |
| GET | `/webhooks/{id}` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |
| POST | `/webhooks/{id}/replay` | ✅ auth_middleware | ✅ Global | ✅ ownership, atomic count | ✅ |
| GET | `/webhooks/{id}/attempts` | ✅ auth_middleware | ✅ Global | ✅ ownership check | ✅ |

---

## Kritik Bulgular Özeti

### 🔴 Kritik (Hemen Düzeltilmeli)

| # | Endpoint | Sorun | Etki |
|---|----------|-------|------|
| 1 | `POST /auth/verify-email` | Rate limit eksik | Email verification token brute force |
| 2 | `POST /auth/refresh` | Rate limit eksik | Refresh token brute force |
| 3 | `POST /auth/2fa/verify` | Rate limit eksik | TOTP brute force (6 digit) |
| 4 | `POST /contact/` | Rate limit eksik | Spam/flood attack |
| 5 | `POST /inbound/:provider` | Rate limit eksik | External service flood |
| 6 | `POST /inbound/:provider/:endpoint_id` | Signature verification optional | Webhook spoofing |
| 7 | `POST /billing/webhook` | Signature verification optional (secret boşsa) | Fake webhook injection |
| 8 | `GET /schemas/{id}` | Ownership check yok | Cross-tenant data leak |
| 9 | `POST /schemas/{id}/validate` | Ownership check yok | Cross-tenant data leak |
| 10 | `DELETE /portal/api-keys/{key_id}` | key_id parametre ignore ediliyor | Her zaman yeni key oluşturur |

### 🟡 Orta (Yakın Zamanda Düzeltilmeli)

| # | Endpoint | Sorun | Etki |
|---|----------|-------|------|
| 1 | `GET /status` | DB error detail sızıntısı | Internal architecture exposure |
| 2 | `PUT /portal/notifications` | URL validation yok (SSRF) | Internal service access |
| 3 | `POST /playground/test` | SSRF via reqwest | Internal network scanning |
| 4 | `POST /alerts/` | Condition whitelist yok | Invalid condition injection |
| 5 | `GET /alerts/` | Pagination yok | Large dataset memory issue |
| 6 | `POST /api-keys/` | Max key limit yok | Resource exhaustion |
| 7 | `GET /stream/deliveries` | SSE connection limit yok | Resource exhaustion |
| 8 | `POST /templates/{id}/apply` | Plan limit check yok | Endpoint limit bypass |
| 9 | `PUT /endpoints/{id}/transforms/{id}` | Rule ownership check yok | Cross-endpoint manipulation |
| 10 | OAuth endpoints | Rate limit yok | OAuth flow abuse |

### 🟢 İyi Uygulamalar

- ✅ **Ownership check**: Çoğu endpoint'te `customer_id` SQL filter'ı mevcut
- ✅ **Idempotency**: `POST /webhooks/` endpoint'inde `Idempotency-Key` header desteği
- ✅ **SSRF protection**: Endpoint creation'da `crate::ssrf::validate_url()` kullanımı
- ✅ **Webhook count atomic increment**: `UPDATE ... WHERE webhook_count < limit` pattern
- ✅ **GDPR compliance**: Account deletion transaction ile tüm veriyi siler
- ✅ **Password hashing**: Argon2 kullanımı
- ✅ **CSRF protection**: OAuth state cookie verification
- ✅ **CSS XSS prevention**: Portal config'de dangerous pattern blocking
- ✅ **CSV injection prevention**: Export'ta formula injection prefix
- ✅ **Refresh token rotation**: Her refresh'te eski token revoke edilir
- ✅ **2FA implementation**: TOTP ile standard uyumlu
- ✅ **Pagination clamping**: `min(100)`, `max(1)` pattern çoğu endpoint'te

---

## Genel Tavsiyeler

1. **Public endpoint'lerde rate limiting**: `/auth/*`, `/oauth/*`, `/contact`, `/inbound/*`, `/billing/webhook/*` mutlaka rate limit uygulanmalı
2. **Consistent error response format**: Tüm error'lar için standart `{"error": {"code": "...", "message": "...", "details": ...}}` formatı
3. **Request ID tracking**: Her request'e `X-Request-ID` header ekleme — distributed tracing için
4. **Structured logging**: Tüm endpoint'lerde `tracing::info!` yerine `tracing::Span` ile structured logging
5. **Pagination standardization**: Cursor-based pagination'a geçiş (offset-based performans sorunu)
6. **Field selection (sparse fieldset)**: `?fields=id,name,email` desteği — bandwidth optimizasyonu
7. **API versioning**: `/v1/` prefix'i var ama version negotiation mekanizması yok
8. **Content-Type validation**: POST/PUT endpoint'lerinde `Content-Type: application/json` kontrolü eksik
9. **Request body size limit**: Global `max_webhook_payload_bytes` var ama genel API için limit yok
10. **CORS policy**: Sadece `/status` endpoint'inde CORS header'ı var — diğer endpoint'ler için politika belirsiz
