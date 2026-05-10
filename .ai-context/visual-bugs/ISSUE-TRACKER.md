# 🎯 HookSniff — Tekilleştirilmiş Sorun Takip Listesi

> **Tarih:** 2026-05-10  
> **Amaç:** Aynı sorunun birden fazla kez düzeltilmesini önlemek  
> **Kural:** Her sorun tek satır, tek ID. Detay için kaynak dosyaya bak.

---

## Kullanım

Bir sorunu düzelttiğinde yanına `✅` koy ve tarih ekle:
```
| HS-001 | ... | ✅ 2026-05-10 |
```

---

## 🚨 P0 — ACİL

| ID | Sorun | Kaynak | Durum |
|----|-------|--------|-------|
| HS-001 | `verify_email` rate limit yok — brute force | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-002 | `verify_2fa` rate limit yok — TOTP brute force | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-003 | `refresh_token` rate limit yok — token stuffing | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-004 | Inbound webhook signature verification optional — secret boşsa `Ok(())` | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-005 | Billing webhook secret boşsa verification atlıyor | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-006 | `.env.production.example`'da gerçek Grafana token (base64) | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-007 | `.gitignore`'da `.env` pattern eksik | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-008 | Contact form rate limit yok | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-009 | Schema endpoint'lerinde ownership check yok — cross-tenant leak | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-010 | Concurrent delivery limit yok — DDoS riski | `backend/DEEP-WORKER-BILLING.md` | ⬜ |

---

## 🔴 P1 — YÜKSEK

| ID | Sorun | Kaynak | Durum |
|----|-------|--------|-------|
| HS-011 | Portal notification URL'lerinde SSRF | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-012 | Playground test endpoint'inde SSRF (DNS rebinding TOCTOU) | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-013 | CSP'de `unsafe-inline` + `unsafe-eval` — XSS riski | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-014 | Git history'de OTEL credentials (base64 Grafana secrets) | `infra/DEEP-GIT-HISTORY.md` | ⬜ |
| HS-015 | Password reset token URL'de exposure | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-016 | `DefaultHasher` idempotency hash'te (kriptografik değil) | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-017 | Retry'da jitter yok — thundering herd | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-018 | Error classification yok — 400/401/404 de retry ediliyor | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-019 | WebSocket connection limit yok — bellek tüketimi | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-020 | Circuit breaker modülü var ama entegre edilmemiş | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-021 | Billing webhook'larda idempotency yok | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-022 | Throttle state in-memory — restart'ta kaybolur | `backend/deep-rate-limiting.md` | ⬜ |
| HS-023 | FIFO modülü var ama worker döngüsüne bağlanmamış | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-024 | İki migration sistemi senkron değil (standalone SQL vs embedded Rust) | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-025 | CHECK constraint'ler eksik — invalid status girilebilir | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-026 | `webhook_queue`'da FK eksik | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-027 | `amount_cents` INT — overflow, BIGINT olmalı | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-028 | Search sayfasında Authorization header eksik | `frontend/agent5-middleware-shared.md` | ⬜ |
| HS-029 | Search'de debounce yok — her tuşta API çağrısı | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-030 | Dashboard routing çökmüş — 16 sayfa yanlış içerik | `frontend/agent1-core.md` | ⬜ |
| HS-031 | Frontend-Backend API uyumsuzluğu (Revenue, Billing, Notifications) | `frontend/agent2-analytics-billing.md` | ⬜ |
| HS-032 | Abonelik iptal endpoint'i yok — `DELETE /billing/subscription` → 405 | `frontend/agent2-analytics-billing.md` | ⬜ |
| HS-033 | Hesap silme bozuk — `DELETE /auth/me` vs `DELETE /auth/account` | `frontend/agent4-settings-config.md` | ⬜ |
| HS-034 | Fiyat uyumsuzluğu — Frontend $49/$149, Backend $29/$99 | `frontend/agent2-analytics-billing.md` | ⬜ |
| HS-035 | 3 farklı API URL (SDK tutarsızlığı) | `infra/DEEP-SDK-DOCS.md` | ⬜ |
| HS-036 | Kotlin SDK generic crash (TypeToken erasure) | `infra/DEEP-SDK-DOCS.md` | ⬜ |
| HS-037 | 6 SDK'da `X-Hookrelay-Signature` legacy header | `infra/DEEP-SDK-DOCS.md` | ⬜ |
| HS-038 | CLI `HOOKRELAY_*` env vars kullanıyor — `HOOKSNIFF_*` olmalı | `infra/DEEP-SDK-DOCS.md` | ⬜ |
| HS-038a | `handle_inbound_to_endpoint` Authorization bypass — sadece prefix lookup, Argon2 yok | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038b | Prefix length mismatch — 20 char lookup ama DB'de 15 char prefix | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038c | Billing webhook'larında rate limiting yok (Stripe/Polar/iyzico) | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038d | `custom_domains` dig/nslookup subprocess — command injection riski | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038e | Dynamic SQL construction (events, admin) — `format!` ile WHERE clause | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038f | Timing attack — login hataları farklı mesajlar döndürüyor | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038g | `AppError::Serialization` serde_json hata mesajını kullanıcıya gösteriyor | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038h | Email enumeration — register "Email already registered" döndürüyor | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038i | Auth cache `std::sync::Mutex` — async context'te deadlock riski | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038j | `rate_limit.rs` unwrap() — header parse failure'da panic | `backend/DEEP-RUST-API.md` | ⬜ |
| HS-038k | Alert condition string validation eksik — whitelist yok | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-038l | Polar/iyzico webhook error message'da internal config sızıntısı | `backend/DEEP-API-ENDPOINTS.md` | ⬜ |
| HS-038m | `next.config.js` output:standalone eksik — Docker build başarısız | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-038n | DATABASE_URL local credentials git history'de | `infra/DEEP-GIT-HISTORY.md` | ⬜ |

---

## 🟡 P2 — ORTA

| ID | Sorun | Kaynak | Durum |
|----|-------|--------|-------|
| HS-039 | Dual onboarding modal — ikisi aynı anda açılıyor | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-040 | Toast'ta dismiss/aria-live yok — erişilebilirlik | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-041 | Client-side search + server-side pagination çelişkisi | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-042 | Status count'lar sadece mevcut sayfadan hesaplanıyor | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-043 | 63 useEffect'ten %75'inde cleanup eksik — memory leak | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-044 | Stale closure riskleri (4 useEffect) | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-045 | `lucide-react` hiç kullanılmıyor (~150KB wasted) | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-046 | 13 tablo `overflow-x-auto` olmadan — mobil taşma | `frontend/DEEP-CSS-STYLING.md` | ⬜ |
| HS-047 | `blog/[slug]` 1922 satır mega component | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-048 | `dangerouslySetInnerHTML` (CSP bypass) | `frontend/DEEP-COMPONENT-LOGIC.md` | ⬜ |
| HS-049 | Toggle accessibility — `role="switch"` eksik | `frontend/agent4-settings-config.md` | ⬜ |
| HS-050 | Delete modal'da focus trap yok | `frontend/agent4-settings-config.md` | ⬜ |
| HS-051 | `weeklyDigest` state local-only — API'ye gönderilmiyor | `frontend/agent4-settings-config.md` | ⬜ |
| HS-052 | Dark mode eksik (birçok sayfa) | `frontend/DEEP-CSS-STYLING.md` | ⬜ |
| HS-053 | Footer eksik (birçok sayfa) | `frontend/DEEP-CSS-STYLING.md` | ⬜ |
| HS-054 | 20+ eksik DB index — yavaş query'ler | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-055 | `updated_at` trigger'ları eksik | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-056 | UNIQUE constraint'ler eksik | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-057 | Delivery index eksik (`customer_id, created_at DESC`) | `backend/DEEP-DB-MIGRATIONS.md` | ⬜ |
| HS-058 | Proration yok — mid-cycle upgrade adaletsiz | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-059 | Grace period yok — ödeme başarısızlığında anında downgrade | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-060 | Downgrade'de endpoint cleanup yok | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-061 | Custom metric yok — sadece trace var | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-062 | Simple exporter (sync) — batch exporter kullanılmalı | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-063 | Sampling strategy yok — tüm trace'ler export ediliyor | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-064 | Response body PII içerebilir — trace'de loglanıyor | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-065 | 920+ hardcoded İngilizce string — i18n eksik | `frontend/DEEP-HARDCODED-STRINGS.md` | ⬜ |
| HS-066 | 71 sayfada metadata eksik (SEO) | `frontend/DEEP-A11Y-SEO.md` | ⬜ |
| HS-067 | Müşteri hikayeleri kurgusal — yasal risk | `infra/DEEP-LANDING-CONTENT.md` | ⬜ |
| HS-068 | Türkçe çeviri hataları ("APIimize", "Ölü Mektup Kuyruğu") | `infra/DEEP-LANDING-CONTENT.md` | ⬜ |
| HS-069 | FAQ eksik — SEO featured snippets kaybı | `infra/DEEP-LANDING-CONTENT.md` | ⬜ |
| HS-070 | `next.config.js`'de `output: 'standalone'` eksik | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-071 | HSTS header eksik | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-072 | `token!` non-null assertion → null token ile API çağrısı | `frontend/agent1-core.md` | ⬜ |
| HS-073 | Hardcoded `Authorization: 'Bearer YOUR_TOKEN'` | `frontend/agent3-tools.md` | ⬜ |
| HS-074 | `health/page.tsx` token kullanmıyor — herkes erişebilir | `frontend/agent5-middleware-shared.md` | ⬜ |
| HS-075 | `store.tsx` token her zaman `'cookie'` → anlamsız Bearer | `frontend/agent1-core.md` | ⬜ |
| HS-076 | `api-keys/page.tsx` credentials yanlış yerde | `frontend/agent4-settings-config.md` | ⬜ |

---

## 🟢 P3 — DÜŞÜK

| ID | Sorun | Kaynak | Durum |
|----|-------|--------|-------|
| HS-077 | 6+ stale branch temizlenmemiş | `infra/DEEP-GIT-HISTORY.md` | ⬜ |
| HS-078 | 20+ açık Dependabot PR merge edilmemiş | `infra/DEEP-GIT-HISTORY.md` | ⬜ |
| HS-079 | Commit convention tutarsız | `infra/DEEP-GIT-HISTORY.md` | ⬜ |
| HS-080 | ESLint 8 + Next.js 15 uyumsuzluğu | `infra/DEEP-DEPS-CONFIG.md` | ⬜ |
| HS-081 | 11 SDK'da retry logic yok | `infra/DEEP-SDK-DOCS.md` | ⬜ |
| HS-082 | Version mismatch (Kotlin 0.2.0 vs 0.3.0) | `infra/DEEP-SDK-DOCS.md` | ⬜ |
| HS-083 | OpenAPI schema vs actual API mismatch | `infra/DEEP-SDK-DOCS.md` | ⬜ |
| HS-084 | Polar.sh/iyzico fatura handler'ı yok | `backend/DEEP-WORKER-BILLING.md` | ⬜ |
| HS-085 | `db.rs` (1029 satır) test yok | `backend/DEEP-TEST-COVERAGE.md` | ⬜ |
| HS-086 | `delivery/mod.rs` (404 satır) test yok | `backend/DEEP-TEST-COVERAGE.md` | ⬜ |
| HS-087 | `worker/main.rs` (807 satır) test yok | `backend/DEEP-TEST-COVERAGE.md` | ⬜ |
| HS-088 | AuthGuard component test yok | `backend/DEEP-TEST-COVERAGE.md` | ⬜ |
| HS-089 | SSO page test yok | `backend/DEEP-TEST-COVERAGE.md` | ⬜ |

---

## 📊 Özet

| Öncelik | Adet |
|---------|------|
| 🚨 P0 | 10 |
| 🔴 P1 | 43 |
| 🟡 P2 | 38 |
| 🟢 P3 | 13 |
| **TOPLAM** | **104 benzersiz sorun** |

---

## 📝 Notlar

- **Bu listedeki her sorun benzersizdir.** Aynı sorun birden fazla dosyada geçiyor olabilir ama burada tek satırda.
- **Detay için** "Kaynak" sütunundaki dosyaya bak.
- **Düzelttiğinde** `⬜` → `✅ tarih` yap ve GitHub'a commit et.
- **Yanlış bulgu** tespit edersen `❌ neden` yaz.
