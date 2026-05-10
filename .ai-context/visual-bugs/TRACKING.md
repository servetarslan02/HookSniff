# 🎯 HookSniff — Master Takip Belgesi

> **Son güncelleme:** 2026-05-11 02:01 GMT+8  
> **Oturum:** 97  
> **Amaç:** Tüm sorunları tek yerden takip et. Yaptıkça ✅ koyacağız.

---

## 📊 Genel Durum

| Kategori | Toplam | ✅ Yapıldı | ⬜ Beklemede | ❌ İptal |
|----------|--------|-----------|------------|---------|
| 🚨 P0 — Acil | 10 | 0 | 10 | 0 |
| 🔴 P1 — Yüksek | 42 | 0 | 39 | 3 |
| 🟡 P2 — Orta | 38 | 0 | 34 | 4 |
| 🟢 P3 — Düşük | 13 | 0 | 13 | 0 |
| **TOPLAM** | **103** | **0** | **96** | **7** |

---

## 🚨 P0 — ACİL

| ID | Sorun | Durum |
|----|-------|-------|
| HS-001 | `verify_email` rate limit yok — brute force | ⬜ |
| HS-002 | `verify_2fa` rate limit yok — TOTP brute force | ⬜ |
| HS-003 | `refresh_token` rate limit yok — token stuffing | ⬜ |
| HS-004 | Inbound webhook signature verification optional — secret boşsa `Ok(())` | ⬜ |
| HS-005 | Billing webhook secret boşsa verification atlıyor | ⬜ |
| HS-006 | `.env.production.example`'da gerçek Grafana token (base64) | ⬜ |
| HS-007 | `.gitignore`'da `.env` pattern eksik | ⬜ |
| HS-008 | Contact form rate limit yok | ⬜ |
| HS-009 | Schema endpoint'lerinde ownership check yok — cross-tenant leak | ⬜ |
| HS-010 | Concurrent delivery limit yok — DDoS riski | ⬜ |

---

## 🔴 P1 — YÜKSEK

| ID | Sorun | Durum |
|----|-------|-------|
| HS-011 | Portal notification URL'lerinde SSRF | ⬜ |
| HS-012 | Playground test endpoint'inde SSRF (DNS rebinding TOCTOU) | ⬜ |
| HS-013 | CSP'de `unsafe-inline` + `unsafe-eval` — XSS riski | ⬜ |
| HS-014 | Git history'de OTEL credentials (base64 Grafana secrets) | ⬜ |
| HS-015 | Password reset token URL'de exposure | ⬜ |
| HS-016 | `DefaultHasher` idempotency hash'te (kriptografik değil) | ⬜ |
| ~~HS-017~~ | ~~Retry'da jitter yok~~ | ❌ Yanlış — jitter var |
| HS-018 | Error classification yok — 400/401/404 de retry ediliyor | ⬜ |
| HS-019 | WebSocket connection limit yok — bellek tüketimi | ⬜ |
| HS-020 | Circuit breaker modülü var ama entegre edilmemiş | ⬜ |
| HS-021 | Billing webhook'larda idempotency yok | ⬜ |
| HS-022 | Throttle state in-memory — restart'ta kaybolur | ⬜ |
| HS-023 | FIFO modülü var ama worker döngüsüne bağlanmamış | ⬜ |
| HS-024 | İki migration sistemi senkron değil (standalone SQL vs embedded Rust) | ⬜ |
| HS-025 | CHECK constraint'ler eksik — invalid status girilebilir | ⬜ |
| HS-026 | `webhook_queue`'da FK eksik | ⬜ |
| HS-027 | `amount_cents` INT — overflow, BIGINT olmalı | ⬜ |
| HS-028 | Search sayfasında Authorization header eksik | ⬜ |
| HS-029 | Search'de debounce yok — her tuşta API çağrısı | ⬜ |
| HS-030 | Dashboard routing çökmüş — 16 sayfa yanlış içerik | ⬜ |
| HS-031 | Frontend-Backend API uyumsuzluğu (Revenue, Billing, Notifications) | ⬜ |
| HS-032 | Abonelik iptal endpoint'i yok — `DELETE /billing/subscription` → 405 | ⬜ |
| HS-033 | Hesap silme bozuk — `DELETE /auth/me` vs `DELETE /auth/account` | ⬜ |
| HS-034 | Fiyat uyumsuzluğu — Frontend $49/$149, Backend $29/$99 | ⬜ |
| HS-035 | 3 farklı API URL (SDK tutarsızlığı) | ⬜ |
| HS-036 | Kotlin SDK generic crash (TypeToken erasure) | ⬜ |
| HS-037 | 6 SDK'da `X-Hookrelay-Signature` legacy header | ⬜ |
| HS-038 | CLI `HOOKRELAY_*` env vars kullanıyor — `HOOKSNIFF_*` olmalı | ⬜ |
| HS-038a | `handle_inbound_to_endpoint` Authorization bypass — sadece prefix lookup, Argon2 yok | ⬜ |
| HS-038b | Prefix length mismatch — 20 char lookup ama DB'de 15 char prefix | ⬜ |
| HS-038c | Billing webhook'larında rate limiting yok (Stripe/Polar/iyzico) | ⬜ |
| HS-038d | `custom_domains` dig subprocess — command injection riski | ⬜ |
| HS-038e | Dynamic SQL construction (events, admin) — `format!` ile WHERE clause | ⬜ |
| HS-038f | Timing attack — login hataları farklı mesajlar döndürüyor | ⬜ |
| HS-038g | `AppError::Serialization` serde_json hata mesajını kullanıcıya gösteriyor | ⬜ |
| HS-038h | Email enumeration — register "Email already registered" döndürüyor | ⬜ |
| HS-038i | Auth cache `std::sync::Mutex` — async context'te deadlock riski | ⬜ |
| HS-038j | `rate_limit.rs` unwrap() — header parse failure'da panic | ⬜ |
| HS-038k | Alert condition string validation eksik — whitelist yok | ⬜ |
| HS-038l | Polar/iyzico webhook error message'da internal config sızıntısı | ⬜ |
| HS-038m | `next.config.js` output:standalone eksik — Docker build başarısız | ⬜ |
| HS-038n | DATABASE_URL local credentials git history'de | ⬜ |

---

## 🟡 P2 — ORTA

| ID | Sorun | Durum |
|----|-------|-------|
| HS-039 | Dual onboarding modal — ikisi aynı anda açılıyor | ⬜ |
| HS-040 | Toast'ta dismiss/aria-live yok — erişilebilirlik | ⬜ |
| HS-041 | Client-side search + server-side pagination çelişkisi | ⬜ |
| HS-042 | Status count'lar sadece mevcut sayfadan hesaplanıyor | ⬜ |
| HS-043 | 63 useEffect'ten %75'inde cleanup eksik — memory leak | ⬜ |
| HS-044 | Stale closure riskleri (4 useEffect) | ⬜ |
| HS-045 | `lucide-react` hiç kullanılmıyor (~150KB wasted) | ⬜ |
| HS-046 | 13 tablo `overflow-x-auto` olmadan — mobil taşma | ⬜ |
| HS-047 | `blog/[slug]` 1922 satır mega component | ⬜ |
| HS-048 | `dangerouslySetInnerHTML` (CSP bypass) | ⬜ |
| HS-049 | Toggle accessibility — `role="switch"` eksik | ⬜ |
| HS-050 | Delete modal'da focus trap yok | ⬜ |
| HS-051 | `weeklyDigest` state local-only — API'ye gönderilmiyor | ⬜ |
| HS-052 | Dark mode eksik (birçok sayfa) | ⬜ |
| HS-053 | Footer eksik (birçok sayfa) | ⬜ |
| HS-054 | 20+ eksik DB index — yavaş query'ler | ⬜ |
| HS-055 | `updated_at` trigger'ları eksik | ⬜ |
| HS-056 | UNIQUE constraint'ler eksik | ⬜ |
| HS-057 | Delivery index eksik (`customer_id, created_at DESC`) | ⬜ |
| HS-058 | Proration yok — mid-cycle upgrade adaletsiz | ⬜ |
| HS-059 | Grace period yok — ödeme başarısızlığında anında downgrade | ⬜ |
| HS-060 | Downgrade'de endpoint cleanup yok | ⬜ |
| HS-061 | Custom metric yok — sadece trace var | ⬜ |
| HS-062 | Simple exporter (sync) — batch exporter kullanılmalı | ⬜ |
| HS-063 | Sampling strategy yok — tüm trace'ler export ediliyor | ⬜ |
| HS-064 | Response body PII içerebilir — trace'de loglanıyor | ⬜ |
| HS-065 | 920+ hardcoded İngilizce string — i18n eksik | ⬜ |
| HS-066 | 71 sayfada metadata eksik (SEO) | ⬜ |
| HS-067 | Müşteri hikayeleri kurgusal — yasal risk | ⬜ |
| HS-068 | Türkçe çeviri hataları ("APIimize", "Ölü Mektup Kuyruğu") | ⬜ |
| HS-069 | FAQ eksik — SEO featured snippets kaybı | ⬜ |
| HS-070 | `next.config.js`'de `output: 'standalone'` eksik | ⬜ |
| HS-071 | HSTS header eksik | ⬜ |
| HS-072 | `token!` non-null assertion → null token ile API çağrısı | ⬜ |
| HS-073 | Hardcoded `Authorization: 'Bearer YOUR_TOKEN'` | ⬜ |
| HS-074 | `health/page.tsx` token kullanmıyor — herkes erişebilir | ⬜ |
| HS-075 | `store.tsx` token her zaman `'cookie'` → anlamsız Bearer | ⬜ |
| HS-076 | `api-keys/page.tsx` credentials yanlış yerde | ⬜ |

---

## 🟢 P3 — DÜŞÜK

| ID | Sorun | Durum |
|----|-------|-------|
| HS-077 | 6+ stale branch temizlenmemiş | ⬜ |
| HS-078 | 20+ açık Dependabot PR merge edilmemiş | ⬜ |
| HS-079 | Commit convention tutarsız | ⬜ |
| HS-080 | ESLint 8 + Next.js 15 uyumsuzluğu | ⬜ |
| HS-081 | 11 SDK'da retry logic yok | ⬜ |
| HS-082 | Version mismatch (Kotlin 0.2.0 vs 0.3.0) | ⬜ |
| HS-083 | OpenAPI schema vs actual API mismatch | ⬜ |
| HS-084 | Polar.sh/iyzico fatura handler'ı yok | ⬜ |
| HS-085 | `db.rs` (1029 satır) test yok | ⬜ |
| HS-086 | `delivery/mod.rs` (404 satır) test yok | ⬜ |
| HS-087 | `worker/main.rs` (807 satır) test yok | ⬜ |
| HS-088 | AuthGuard component test yok | ⬜ |
| HS-089 | SSO page test yok | ⬜ |

---

## ❌ İptal Edilenler (7)

| ID | Sorun | Neden İptal |
|----|-------|------------|
| HS-017 | Retry'da jitter yok | Yanlış bulgu — jitter var (`retry_policy/mod.rs:142`) |
| HS-027 | `amount_cents` INT → BIGINT | Yanlış bulgu — column codebase'de yok |
| HS-028 | Search Authorization header eksik | Yanlış bulgu — `credentials: 'include'` cookie gönderiyor |
| HS-038d | custom_domains command injection | Yanlış bulgu — domain sanitize edilmiş |
| HS-038e | Dynamic SQL construction | Yanlış bulgu — parametrize edilmiş |
| HS-072 | token! non-null assertion | Yanlış bulgu — `if (!token) return` guard'ı var |
| HS-075 | store.tsx token 'cookie' | Yanlış bulgu — kasıtlı sentinel değer |

---

## 📝 Oturum Logları

### Oturum 97 — 2026-05-11
**Durum:** 🔵 Devam ediyor

---

## 📝 Notlar

- Bu belge ana takip dosyasıdır. Her oturum sonunda güncellenir.
- ⬜ = yapılacak, ✅ = yapıldı, ❌ = iptal (yanlış bulgu)
- ISSUE-TRACKER.md orijinal 103 sorunun detaylı listesi.
- `../NEXT_SESSION.md` sonraki oturum detayları.
- `../SESSION-PLAN.md` eski oturum planı.
