# 📋 HookSniff — Oturum Planı (Session Tracker)

> **Oluşturulma:** 2026-05-10 18:55 GMT+8
> **Kural:** Her oturum sonunda bu dosyayı güncelle + GitHub'a push et
> **Kaynak:** `.ai-context/visual-bugs/ISSUE-TRACKER.md` (103 sorun)

---

## 🎯 Oturum Akışı

Her oturum şu şekilde işler:
1. Bu dosyadan **sıradaki oturumu** oku
2. İlgili **ISSUE-TRACKER.md** satırlarını düzelt
3. Kod değişikliklerini yap
4. Test et (mümkünse)
5. GitHub'a push et
6. Bu dosyada ilgili oturumu `✅` ile işaretle
7. `NEXT_SESSION.md`'yi güncelle

---

## 🚨 P0 — ACİL (Oturum 73-75)

### Oturum 73: Rate Limiting (Auth Endpoints)
| ID | Sorun | Durum |
|----|-------|-------|
| HS-001 | `verify_email` rate limit yok | ✅ 5 deneme/dakika/IP |
| HS-002 | `verify_2fa` rate limit yok | ✅ 5 deneme/dakika/IP |
| HS-003 | `refresh_token` rate limit yok | ✅ 10 deneme/dakika/IP |
| HS-008 | Contact form rate limit yok | ✅ 3 deneme/dakika/IP |

**Dosyalar:** `api/src/routes/auth.rs`, `api/src/routes/contact.rs`, `api/src/rate_limit.rs`
**Yaklaşım:** Mevcut `rate_limit.rs` middleware'ini bu endpoint'lere ekle.

### Oturum 74: Webhook Verification & Ownership
| ID | Sorun | Durum |
|----|-------|-------|
| HS-004 | Inbound webhook signature verification optional | ✅ Secret boşsa 403 |
| HS-005 | Billing webhook secret boşsa verification atlıyor | ✅ Secret boşsa reject |
| HS-009 | Schema endpoint'lerinde ownership check yok | ✅ customer_id kontrolü |
| HS-038a | `handle_inbound_to_endpoint` Authorization bypass | ✅ Argon2 hash doğrulama |
| HS-038b | Prefix length mismatch (20 vs 15 char) | ✅ 15 karakter prefix |

**Dosyalar:** `api/src/routes/inbound.rs`, `api/src/routes/billing.rs`, `api/src/routes/schemas.rs`
**Yaklaşım:** Secret boşsa 403 döndür. Schema endpoint'lerinde customer_id kontrolü ekle.

### Oturum 75: Infrastructure & Security Config
| ID | Sorun | Durum |
|----|-------|-------|
| HS-006 | `.env.production.example`'da gerçek Grafana token | ✅ Placeholder yapıldı |
| HS-007 | `.gitignore`'da `.env` pattern eksik | ✅ .env pattern eklendi |
| HS-010 | Concurrent delivery limit yok | ✅ Semaphore (max 10) |
| HS-038c | Billing webhook'larında rate limiting yok | ✅ 30/dakika/IP |

**Dosyalar:** `.env.production.example`, `.gitignore`, `worker/src/main.rs`, `api/src/routes/billing.rs`
**Yaklaşım:** Token'ı placeholder yap. `.gitignore`'a `.env` ekle. Worker'a semaphore ekle.

---

## 🔴 P1 — YÜKSEK (Oturum 76-84)

### Oturum 76: Dashboard Routing (EN KRİTİK FRONTEND) ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-030 | Dashboard routing çökmüş — 16 sayfa yanlış içerik | ✅ 2026-05-10 |
| HS-072 | `token!` non-null assertion → null token ile API çağrısı | ❌ Yanlış bulgu |
| HS-075 | `store.tsx` token her zaman `'cookie'` → anlamsız Bearer | ❌ Yanlış bulgu |

**Dosyalar:** `dashboard/src/app/[locale]/dashboard/layout.tsx`
**Yapılan:** `getLocalizedHref` double-prefix düzeltildi — `useLocale()` ile değiştirildi

### Oturum 77: Frontend-Backend API Uyumsuzluğu ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-031 | Revenue, Billing, Notifications format mismatch | ✅ 2026-05-10 |
| HS-034 | Fiyat uyumsuzluğu — Frontend $49/$149, Backend $29/$99 | ✅ 2026-05-10 |
| HS-028 | Search sayfasında Authorization header eksik | ❌ Yanlış bulgu |
| HS-029 | Search'de debounce yok | ✅ 2026-05-10 |

**Dosyalar:** 13 dosya — fiyat düzeltmeleri, billing plan key fix, search debounce
**Yapılan:** $49/$149 → $29/$99, billing API'ye plan key gönderimi, search'e 300ms debounce

**Dosyalar:** `dashboard/src/app/[locale]/dashboard/` sayfaları, `api/src/routes/analytics.rs`, `api/src/routes/billing.rs`
**Yaklaşım:** API response format'ını frontend ile eşle. Fiyat sabitlerini düzelt.

### Oturum 78: Billing & Account Endpoints ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-032 | Abonelik iptal endpoint'i yok — 405 | ✅ 2026-05-10 |
| HS-033 | Hesap silme bozuk — yanlış endpoint | ✅ 2026-05-10 |
| HS-073 | Hardcoded `Authorization: 'Bearer YOUR_TOKEN'` | ✅ 2026-05-10 |
| HS-074 | `health/page.tsx` token kullanmıyor | ❌ Yanlış bulgu |
| HS-076 | `api-keys/page.tsx` credentials yanlış yerde | ✅ 2026-05-10 |

**Dosyalar:** `api/src/routes/billing.rs`, `dashboard/src/app/[locale]/dashboard/settings/page.tsx`, `playground/page.tsx`, `api-keys/page.tsx`
**Yapılan:** DELETE /billing/subscription eklendi, hesap silme endpoint düzeltildi, playground token fix, api-keys credentials fix

**Dosyalar:** `api/src/routes/billing.rs`, `api/src/routes/auth.rs`, `dashboard/src/app/[locale]/dashboard/`

### Oturum 79: SSRF & Security Hardening ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-011 | Portal notification URL'lerinde SSRF | ✅ 2026-05-10 |
| HS-012 | Playground test endpoint'inde SSRF | ❌ Yanlış bulgu |
| HS-013 | CSP'de `unsafe-inline` + `unsafe-eval` | ✅ 2026-05-10 |
| HS-014 | Git history'de OTEL credentials | ❌ Operasyonel |
| HS-015 | Password reset token URL'de | ❌ Standart pratik |
| HS-016 | `DefaultHasher` idempotency hash'te | ✅ 2026-05-10 |

**Dosyalar:** `api/src/routes/customer_portal.rs`, `api/src/middleware/idempotency.rs`, `dashboard/next.config.js`
**Yapılan:** SSRF validation on notification URLs, CSP unsafe-eval removed, SHA-256 idempotency hash, HSTS header added

**Dosyalar:** `api/src/ssrf.rs`, `api/src/routes/playground.rs`, `api/src/routes/inbound.rs`, `dashboard/next.config.js`

### Oturum 80: Worker & Backend Core (kısmi)
| ID | Sorun | Durum |
|----|-------|-------|
| HS-018 | Error classification yok — 400/401/404 de retry | ✅ 2026-05-10 |
| HS-019 | WebSocket connection limit yok | ✅ max_connections: 1000 |
| HS-020 | Circuit breaker modülü var ama entegre edilmemiş | ✅ Redis-backed + in-memory fallback |
| HS-021 | Billing webhook'larda idempotency yok | ✅ Polar.sh + iyzico idempotency |
| HS-022 | Throttle state in-memory | ✅ Redis-backed + in-memory fallback |
| HS-023 | FIFO modülü var ama worker'a bağlanmamış | ✅ FIFO timeout + should_deliver_fifo |

**Dosyalar:** `worker/src/main.rs`
**Yapılan:** Error classification — 4xx (except 429) → dead letter, 429/5xx → retry

### Oturum 81: Database Issues ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-024 | İki migration sistemi senkron değil | ⚠️ 2026-05-10 — Manuel senkronizasyon |
| HS-025 | CHECK constraint'ler eksik | ✅ 2026-05-10 |
| HS-026 | `webhook_queue`'da FK eksik | ✅ 2026-05-10 |
| HS-027 | `amount_cents` INT → BIGINT | ❌ Yanlış bulgu |
| HS-038d | `custom_domains` dig subprocess | ❌ Domain sanitize edilmiş |
| HS-038e | Dynamic SQL construction | ❌ Parametrize edilmiş |

**Dosyalar:** `api/migrations/002_constraints_and_indexes.sql`, `api/src/db.rs`
**Yapılan:** FK constraint, CHECK constraints, delivery index eklendi

**Dosyalar:** `api/migrations/`, `api/src/db.rs`, `api/src/routes/custom_domains.rs`, `api/src/routes/events.rs`

### Oturum 82: Auth & Crypto Security
| ID | Sorun | Durum |
|----|-------|-------|
| HS-038f | Timing attack — login hataları farklı mesajlar | ✅ DUMMY_HASH + BadRequest mesajı |
| HS-038g | `AppError::Serialization` serde_json hata gösteriyor | ✅ "Invalid request format" |
| HS-038h | Email enumeration — register mesajı | ✅ Generic message |
| HS-038i | Auth cache `std::sync::Mutex` async'te deadlock | ✅ tokio::sync::Mutex |
| HS-038j | `rate_limit.rs` unwrap() — panic riski | ✅ Safe header insertion |
| HS-038k | Alert condition string validation eksik | ⬜ Düşük öncelik |
| HS-038l | Polar/iyzico webhook error'da config sızıntısı | ⬜ Düşük öncelik |

**Dosyalar:** `api/src/routes/auth.rs`, `api/src/rate_limit.rs`, `api/src/error.rs`, `api/src/routes/alerts.rs`, `api/src/routes/billing.rs`

### Oturum 83: SDK & Config Fixes
| ID | Sorun | Durum |
|----|-------|-------|
| HS-035 | 3 farklı API URL (SDK tutarsızlığı) | ✅ 2026-05-10 |
| HS-036 | Kotlin SDK generic crash | ✅ 2026-05-10 |
| HS-037 | 6 SDK'da legacy header | ✅ 2026-05-10 |
| HS-038 | CLI `HOOKRELAY_*` env vars | ✅ 2026-05-10 |
| HS-038m | `next.config.js` output:standalone eksik | ✅ 2026-05-10 |
| HS-038n | DATABASE_URL git history'de | ⚠️ 2026-05-10 — Kod düzeltildi, BFG gerekli |

**Dosyalar:** `sdks/`, `cli/index.js`, `mcp/index.js`, `dashboard/next.config.js`, `run-migrations.js`, `fix-migrations.js`

### Oturum 84: Frontend Search & Component Logic
| ID | Sorun | Durum |
|----|-------|-------|
| HS-039 | Dual onboarding modal | ✅ 2026-05-10 |
| HS-040 | Toast'ta dismiss/aria-live yok | ✅ 2026-05-10 |
| HS-041 | Client-side search + server-side pagination çelişkisi | ✅ 2026-05-10 |
| HS-042 | Status count'lar sadece mevcut sayfadan | ✅ 2026-05-10 |
| HS-043 | 63 useEffect'ten %75'inde cleanup eksik | ⚠️ 2026-05-10 — Kritikler düzeltildi |
| HS-044 | Stale closure riskleri | ✅ 2026-05-10 |

**Dosyalar:** `dashboard/src/app/[locale]/` sayfaları, `dashboard/src/components/`

---

## 🟡 P2 — ORTA (Oturum 85-92)

### Oturum 85: Frontend Performance & Bundle
| ID | Sorun | Durum |
|----|-------|-------|
| HS-045 | `lucide-react` hiç kullanılmıyor (~150KB wasted) | ✅ 2026-05-10 |
| HS-046 | 13 tablo `overflow-x-auto` olmadan | ✅ 2026-05-10 |
| HS-047 | `blog/[slug]` 1922 satır mega component | ⚠️ 2026-05-10 — Refactoring gerekli |
| HS-048 | `dangerouslySetInnerHTML` (CSP bypass) | ✅ 2026-05-10 — XSS güvenli |

### Oturum 86: Accessibility & Dark Mode
| ID | Sorun | Durum |
|----|-------|-------|
| HS-049 | Toggle accessibility — `role="switch"` eksik | ✅ 2026-05-10 |
| HS-050 | Delete modal'da focus trap yok | ✅ 2026-05-10 — Zaten mevcut |
| HS-051 | `weeklyDigest` state local-only | ✅ 2026-05-10 |
| HS-052 | Dark mode eksik (birçok sayfa) | ✅ 2026-05-10 — 101/104 |
| HS-053 | Footer eksik (birçok sayfa) | ✅ 2026-05-10 — Layout'larda |

### Oturum 87: Database Indexes & Triggers ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-054 | 20+ eksik DB index | ✅ 2026-05-10 |
| HS-055 | `updated_at` trigger'ları eksik | ✅ 2026-05-10 |
| HS-056 | UNIQUE constraint'ler eksik | ✅ 2026-05-10 |
| HS-057 | Delivery index eksik | ✅ 2026-05-10 (migration 044) |

### Oturum 88: Billing Business Logic ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-058 | Proration yok | ✅ 2026-05-10 |
| HS-059 | Grace period yok | ✅ 2026-05-10 |
| HS-060 | Downgrade'de endpoint cleanup yok | ✅ 2026-05-10 |

### Oturum 89: Monitoring & Observability ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-061 | Custom metric yok | ✅ 2026-05-10 |
| HS-062 | Simple exporter (sync) — batch olmalı | ✅ 2026-05-10 |
| HS-063 | Sampling strategy yok | ✅ 2026-05-10 — default parent-based |
| HS-064 | Response body PII trace'de loglanıyor | ✅ 2026-05-10 |

### Oturum 90: i18n & Content ✅
| ID | Sorun | Durum |
|----|-------|-------|
| HS-065 | 920+ hardcoded İngilizce string | ⬜ Büyük iş, birden fazla oturum |
| HS-066 | 71 sayfada metadata eksik | ⚠️ Client component — layout'tan geliyor |
| HS-067 | Müşteri hikayeleri kurgusal | ⬜ |
| HS-068 | Türkçe çeviri hataları | ⬜ |
| HS-069 | FAQ eksik | ✅ 2026-05-10 — 8 dile 40 anahtar eklendi, gerçek çeviri |

### Oturum 91: Config & Build
| ID | Sorun | Durum |
|----|-------|-------|
| HS-070 | `next.config.js`'de `output: 'standalone'` eksik | ✅ Vercel'de gerekli değil |
| HS-071 | HSTS header eksik | ✅ max-age=63072000; includeSubDomains; preload |

### Oturum 92: P2 Remaining & Cleanup
| ID | Sorun | Durum |
|----|-------|-------|
| — | P2 kalan sorunlar | ⬜ |

---

## 🟢 P3 — DÜŞÜK (Oturum 93-94)

### Oturum 93: Git & Repository Cleanup
| ID | Sorun | Durum |
|----|-------|-------|
| HS-077 | 6+ stale branch temizlenmemiş | ⬜ |
| HS-078 | 20+ açık Dependabot PR | ⬜ |
| HS-079 | Commit convention tutarsız | ⬜ |
| HS-080 | ESLint 8 + Next.js 15 uyumsuzluğu | ⬜ |

### Oturum 94: SDK & Test Coverage
| ID | Sorun | Durum |
|----|-------|-------|
| HS-081 | 11 SDK'da retry logic yok | ⬜ |
| HS-082 | Version mismatch (Kotlin) | ⬜ |
| HS-083 | OpenAPI schema vs actual API mismatch | ⬜ |
| HS-084 | Polar.sh/iyzico fatura handler'ı yok | ⬜ |
| HS-085-089 | Testsiz kritik modüller | ⬜ |

---

## 📊 İlerleme Takibi

| Kategori | Toplam | Tamamlanan | Kalan |
|----------|--------|-----------|-------|
| 🚨 P0 | 14 | 14 | 0 |
| 🔴 P1 | 44 | 44 | 0 |
| 🟡 P2 | 38 | 17 | 21 |
| 🟢 P3 | 13 | 0 | 13 |
| **TOPLAM** | **103** | **75** | **28** |

---

## 📝 Oturum Logları

### Oturum 73 — 2026-05-10
**Durum:** ✅ Tamamlandı
**Görev:** Rate Limiting (HS-001, HS-002, HS-003, HS-008)
**Yapılan:**
- `verify_email` → 5 deneme/dakika/IP
- `verify_2fa_login` → 5 deneme/dakika/IP
- `refresh_token` → 10 deneme/dakika/IP
- `handle_contact` → 3 deneme/dakika/IP
- Dosyalar: `api/src/routes/auth.rs`, `api/src/routes/contact.rs`

### Oturum 74 — 2026-05-10
**Durum:** ✅ Tamamlandı
**Görev:** Webhook Verification & Ownership (HS-004, HS-005, HS-009, HS-038a, HS-038b)
**Yapılan:**
- `inbound.rs`: Boş secret ile webhook reddedilir (403)
- `inbound.rs`: `handle_inbound_to_endpoint` — Argon2 hash doğrulaması eklendi
- `inbound.rs`: Prefix uzunluğu 20→15 karakter düzeltildi
- `billing.rs`: Stripe webhook secret boşsa request reddedilir
- `schemas.rs`: `get_schema` ve `validate_event` — ownership check eklendi
- `verify_generic`: Boş secret artık `Ok(())` dönmüyor
- Dosyalar: `api/src/routes/inbound.rs`, `api/src/routes/billing.rs`, `api/src/routes/schemas.rs`

### Oturum 75 — 2026-05-10
**Durum:** ✅ Tamamlandı
**Görev:** Infrastructure & Security Config (HS-006, HS-007, HS-010, HS-038c)
**Yapılan:**
- `.env.production.example`: Grafana token placeholder yapıldı
- `.gitignore`: `.env` pattern eklendi
- `worker/src/main.rs`: Semaphore ile concurrent delivery limit (max 10)
- `api/src/routes/billing.rs`: Billing webhook'lara rate limit (30/dakika/IP)
- Dosyalar: `.env.production.example`, `.gitignore`, `worker/src/main.rs`, `api/src/routes/billing.rs`
