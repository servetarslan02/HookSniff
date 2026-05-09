# 🔍 HOOKSNIFF KOD ANALİZİ — ANA RAPOR

> Tarih: 2026-05-10
> Kapsam: ~410 dosya, ~70,689 satır kod — %100 satır satır okundu
> Detaylı dosya bazlı analizler: Alt raporlarda (bkz. Kaynak Dosyalar)

---

## 📊 Proje Skor Kartı

| Kategori | Puan | Not |
|----------|------|-----|
| **Güvenlik** | 6.5/10 | Credential leaks, CSRF eksik, SSRF riski |
| **Kod Kalitesi** | 7/10 | Temiz yapı ama silent errors, dead code |
| **Test Kapsamı** | 5/10 | Sıfır güvenlik testi, zayıf assertion'lar |
| **Performans** | 7/10 | İyi, batch processing iyileştirilebilir |
| **Güvenilirlik** | 7.5/10 | Dual migration conflict, webhook_queue tanımsız |
| **Bakım** | 5.5/10 | hookrelay artıkları, hardcoded values, i18n eksik |
| **Genel** | **6.2/10** | Yayına yakın değil — kritik düzeltmeler zorunlu |

---

## 🔴 KRİTİK SORUNLAR (22 adet — Yayından Önce Zorunlu)

### Güvenlik — Credential & Secret Leaks

| # | Sorun | Dosya | Etki |
|---|-------|-------|------|
| 1 | Maven Central credential'ları hardcoded | `scripts/publish-sdks.sh` | Publish hakları çalınabilir |
| 2 | Hex.pm API key hardcoded | `scripts/publish-sdks.sh` | Package publish yetkisi çalınabilir |
| 3 | Grafana admin password hardcoded | `monitoring/docker-compose.monitoring.yml` | Grafana admin erişimi |
| 4 | Grafana Cloud token hardcoded | `monitoring/otel-collector-config.yml` | Observability erişimi |
| 5 | Helm default JWT_SECRET/HMAC_SECRET | `deploy/helm/values.yaml` | JWT token'ları forge edilebilir |
| 6 | Polar product ID'leri hardcoded | `deploy/api-env.yaml`, `render.yaml` | Business config ifşa |
| 7 | TOTP secret'ları şifrelenmemiş | `migrations/033_totp_2fa.sql` | 2FA bypass riski |

### Güvenlik — Auth & Access Control

| # | Sorun | Dosya | Etki |
|---|-------|-------|------|
| 8 | `credentials: 'include'` yanlış konumda (headers içinde) | `dashboard/.../settings/page.tsx`, `api-keys/page.tsx`, `search/page.tsx` | Auth cookie gönderilmiyor |
| 9 | 9+ dashboard sayfasında Authorization header eksik | alerts, billing, health, inbound, transforms, analytics, logs, notifications, routing | Yetkisiz API istekleri |
| 10 | Admin sayfalarında sunucu tarafı yetkilendirme yok | 6 admin sayfası (sadece client-side token) | Non-admin kullanıcılar admin UI görebilir |
| 11 | Playground'ta hardcoded token + SSRF riski | `dashboard/.../playground/page.tsx` | Token sızıntısı + internal API erişimi |

### Güvenlik — Data & Compliance

| # | Sorun | Dosya | Etki |
|---|-------|-------|------|
| 12 | GDPR delete_account 12+ tabloda veri bırakıyor | `api/src/routes/auth.rs` | GDPR Article 17 uyumsuzluğu |
| 13 | Config Debug'da secret sızıntısı | `api/src/config.rs` | Panic anında log'a yazılabilir |
| 14 | Portal API key URL'de | `portal/embed.js`, `portal/widget.html` | Browser history/logs'da görünür |
| 15 | Portal double-path bug (`/v1/api/v1/webhooks`) | `portal/widget.html` | API çağrıları başarısız |

### Fiyat & Veri Tutarsızlığı

| # | Sorun | Dosya | Etki |
|---|-------|-------|------|
| 16 | Fiyat yanlış: kodda $49/$149, olmalı $29/$99 | `api/src/billing/mod.rs`, `admin.rs` | Yanlış ücretlendirme |
| 17 | Landing vs pricing fiyat tutarsızlığı ($49 vs $29) | `dashboard/.../page.tsx` vs `pricing/page.tsx` | Kullanıcı kafa karışıklığı |
| 18 | Data retention çelişkisi (7 gün vs 3 gün) | `privacy/page.tsx` vs `pricing/page.tsx` | Hukuki risk |

### Database & Migration

| # | Sorun | Dosya | Etki |
|---|-------|-------|------|
| 19 | Dual migration systems çelişki | `migrations/` + `api/migrations/` | Schema bozulabilir |
| 20 | `webhook_queue` tablosu tanımsız | migrations 010, 011, 012 refere ediyor | Worker çöker |
| 21 | Migration gap 013-025 | `migrations/` dizini | Schema completeness doğrulanamıyor |

### Naming

| # | Sorun | Etki |
|---|-------|------|
| 22 | "hookrelay" artıkları (scripts, CLI, SDK'lar, CSS, migrations) | Kullanıcı kafa karışıklığı, profesyonellik kaybı |

---

## 🟠 YÜKSEK SORUNLAR (25 adet)

### Dashboard — Genel

| # | Sorun | Kapsam |
|---|-------|--------|
| 1 | 17/23 dashboard sayfası hatayı sessizce yutuyor (`catch {}`) | Core dashboard pages |
| 2 | Checkout URL doğrulamasız redirect | `billing/page.tsx` |
| 3 | `alert()` kullanımı (toast yerine) | endpoints, settings, alerts |
| 4 | Blog'ta `dangerouslySetInnerHTML` (şu an güvenli ama tehlikeli pattern) | `blog/[slug]/page.tsx` |
| 5 | Blog tüm content client'a bundle ediliyor (~600 satır) | `blog/[slug]/page.tsx` |
| 6 | Newsletter form'da CSRF koruması yok | `blog/page.tsx`, `contact/page.tsx` |
| 7 | ROI calculator yanlış formüller | `pricing/page.tsx` |
| 8 | "PayStack" gerçek şirket adı — trademark riski | `customers/page.tsx` |

### API & Worker

| # | Sorun | Dosya |
|---|-------|-------|
| 9 | Fiyat $49/$149 → $29/$99 düzeltilmeli (billing + admin revenue query) | `api/src/billing/mod.rs`, `admin.rs` |
| 10 | Fanout feature işlevsiz | `worker/src/fanout.rs` |
| 11 | Batch webhook race condition | `api/src/routes/webhooks.rs` |
| 12 | Auth middleware'de her istekte 2 DB sorgusu (cache yok) | `api/src/middleware/mod.rs` |
| 13 | Worker paralel değil (sırayla işliyor) | `worker/src/main.rs` |
| 14 | Response header sızıntısı (Set-Cookie bile kaydediliyor) | `worker/src/delivery/http.rs` |
| 15 | Custom header injection riski | `worker/src/delivery/http.rs` |
| 16 | `compute_body_hash` weak hash (DefaultHasher) | `api/src/middleware/idempotency.rs` |

### SDK & Deploy

| # | Sorun | Dosya |
|---|-------|-------|
| 17 | 11 SDK'da GCP Cloud Run URL hardcoded (proje ID ifşa) | Tüm SDK'lar |
| 18 | Terraform provider çalışmıyor (stub) | `deploy/terraform-provider-hooksniff/` |
| 19 | Helm'de DB password inline (kubectl describe ile görünür) | `deploy/helm/templates/deployments.yaml` |
| 20 | Deploy script'te Polar product ID hardcoded | `deploy/gcp-deploy.sh` |

### Dashboard — Erişilebilirlik & UX

| # | Sorun | Kapsam |
|---|-------|--------|
| 21 | Modal'larda focus trapping, ESC, role="dialog" yok | Tüm modal'lar |
| 22 | Icon-only butonlarda `aria-label` yok | Tüm sayfalar |
| 23 | Tıklanabilir satırlar keyboard-navigable değil | Tablo sayfaları |
| 24 | Dashboard token refresh yok (401 → login'e atıyor) | `lib/api.ts` |
| 25 | 15+ sayfa gereksiz client component (SEO/performans kaybı) | Public pages |

---

## 🟡 ORTA SORUNLAR (52 adet)

### Dashboard (14)
- SVG gradient ID collision riski (charts)
- `attempts.sort()` state mutation (deliveries detail)
- Notification preferences local state only (settings)
- Table headers `scope` attribute eksik
- Inconsistent styling (`glass-card` vs plain `bg-white`)
- Missing `aria-expanded` on FAQ accordions
- Missing `aria-pressed` on toggle buttons
- Missing `role="alert"` on form messages
- Clickable rows lack keyboard handlers
- `window.location.href` yerine Next.js router kullanılmalı (search)
- Dead code (`selected` state, `_setEvent`, `_endpoints`)
- Duplicate chart code (dashboard + analytics)
- 5s/30s polling background tab'da devam ediyor
- `useEffect` dependency array'de `t.raw()` her render'da yeni array

### i18n (3)
- 6/8 dil <%40 çevrilmiş (de, ja, pt-BR, es, fr, ko)
- Landing page free tier 1,000 yazıyor ama gerçek 10,000
- `HOOKRELAY_KEY` env var adı docs'da (HOOKSNIFF olmalı)

### API (8)
- Batch webhook rollback mekanizması yok
- `ip_whitelist` tek STRING column (array olmalı)
- `role` VARCHAR(50) — ENUM olmalı
- `amount_cents` INT — BIGINT olmalı
- `currency` TEXT — CHAR(3) olmalı
- `target_type` serbest STRING — constrain edilmeli
- Invoice status default 'paid' — 'pending' olmalı
- Expired token cleanup job yok (password reset, email verification, refresh)

### SDK (7)
- C# SDK: API key validation zayıf (sadece null kontrol)
- C# SDK: CancellationToken desteği yok
- C# SDK: Retry logic yok
- Swift SDK: `@unchecked Sendable` data race riski
- Swift SDK: Force-cast `as! HTTPURLResponse` crash riski
- Elixir SDK: `:patch` method eksik
- Search API SDK'larda tutarsız (Swift expose etmiyor, Elixir implement etmemiş)

### Deploy & Monitoring (5)
- Helm replica count ayrı ayrı configure edilemiyor
- Redis auth enabled değil (default)
- Image tag `latest` — version pin yok
- `--web.enable-lifecycle` Prometheus'ta (external exposure riski)
- Grafana `disableDeletion: false` — production'da dashboard silinebilir

### Infrastructure (6)
- CORS duplicate entry (`api-env.yaml`)
- `npm audit` failure `continue-on-error: true`
- Production deploy'da manual approval yok
- OpenAPI'da inconsistent response codes (POST /endpoints 200 → 201 olmalı)
- OpenAPI'da `per_page` maximum constraint yok
- `RegisterRequest`'ta password optional — passwordless account oluşabilir

### Tests (9)
- Sıfır güvenlik testi (XSS, CSRF, injection, token leakage)
- Sıfır erişilebilirlik testi
- Analytics, routing, schemas sayfalarında sadece 3 test
- Shallow assertions (çoğunlukla `textContent` kontrolü)
- Heavy mocking (translation key typo'lar yakalanmaz)
- Duplicated boilerplate (~20 satır her dosyada)
- Auth bypass testi yok
- Real-time (SSE/WebSocket) testi yok
- Error boundary testi yok

---

## 🔵 DÜŞÜK SORUNLAR (50 adet)

- Minor code quality issues (dead code, inconsistent styling)
- Missing structured data (SEO)
- Missing `<caption>` on tables
- Inconsistent `<a>` vs `<Link>` usage
- Missing OpenGraph metadata on some pages
- CLI'da test yok, engines field yok
- Portal README sadece Türkçe
- Backup/restore script'lerinde hookrelay referansları
- Missing `aria-live` regions for loading states
- Format edilmemiş tarihler (schemas page)
- Template cards clickable ama action yok
- Blog post ordering manual (`orderedSlugs`)
- ASCII art diagrams accessibility (docs/architecture)
- `formatRelativeTime` future date handle etmiyor (status)
- Retry attempt docs'da tutarsız (3 vs 6)

---

## 🟢 GÜÇLÜ YÖNLER

### Güvenlik
- ✅ Standard Webhooks HMAC-SHA256 (constant-time comparison)
- ✅ SSRF koruması — private IP, loopback, metadata engelleme
- ✅ Argon2id password + API key hashing
- ✅ TOTP 2FA (RFC 6238)
- ✅ Replay protection (timestamp + seen_webhooks)
- ✅ Rate limiting (plan-based, Redis destekli)
- ✅ Circuit breaker (per-endpoint failure tracking)
- ✅ Idempotency key + body hash validation
- ✅ Login rate limit (10/15min brute force koruması)
- ✅ Email enumeration koruması (always-same-response)

### Mimarisi
- ✅ PostgreSQL LISTEN/NOTIFY + poll fallback
- ✅ FOR UPDATE SKIP LOCKED (paralel worker concurrency)
- ✅ Zombie reaper (5dk stuck recovery)
- ✅ Graceful shutdown (SIGTERM/SIGINT)
- ✅ OpenTelemetry distributed tracing
- ✅ Exponential backoff retry (30s → 30min)
- ✅ Secret rotation support (old_secret + 24h grace period)

### Test & Altyapı
- ✅ 200+ unit test (dashboard)
- ✅ k6 load test suite (smoke, load, stress, throughput)
- ✅ Kapsamlı OpenAPI spec (80KB)
- ✅ CI/CD pipeline'da security audit
- ✅ Production'da Secret Manager kullanımı
- ✅ Comprehensive integration tests

### Kod Kalitesi
- ✅ Tutarlı error handling (AppError enum — Rust tarafı)
- ✅ Type-safe SQL (sqlx compile-time checks)
- ✅ Structured logging (JSON in production)
- ✅ WebhookVerifier'lar tüm SDK'larda constant-time comparison

---

## 📋 Öncelikli Aksiyon Listesi

### 🔴 P0 — Yayından Önce (22 madde)
1. Credential'ları rotate et + kaldır (Maven, Hex.pm, Grafana)
2. Helm default secret'ları zorunlu kıl (empty string)
3. `credentials: 'include'` pozisyon düzeltmesi
4. Authorization header ekle (9+ dashboard sayfası)
5. Admin sayfalarına server-side auth guard ekle
6. Playground hardcoded token + SSRF fix
7. GDPR delete_account eksik tabloları ekle
8. Config Debug redaction
9. Fiyat düzeltmesi: $29/$99 (tüm sayfalar)
10. Data retention tutarlılığı (7 gün mü 3 gün mü?)
11. Dual migration conflict çöz
12. `webhook_queue` tablosu oluştur
13. Migration gap 013-025 açıkla
14. Portal API key URL'den kaldır + double-path fix
15. Polar product ID'leri secret manager'a taşı
16. TOTP secret'ları şifrele
17. "hookrelay" → "hooksniff" rename (tüm proje)
18. Grafana token/password kaldır (config dosyaları)
19. Blog content'ini ayrı dosyalara taşı (dangerouslySetInnerHTML kaldır)
20. Helm DB password → Secret reference
21. Landing vs pricing fiyat tutarlılığı
22. CORS duplicate düzelt

### 🟡 P1 — Yayına Yakın (30 madde)
23. CSRF koruması (forms)
24. Silent error handling → user-visible errors
25. Modal accessibility (focus trap, ESC, role="dialog")
26. Erişilebilirlik (aria-label, keyboard nav, aria-expanded)
27. Batch webhook rollback
28. Auth middleware cache (Redis)
29. Worker paralel processing
30. Response header filtering
31. Dashboard token refresh
32. SDK default URL → api.hooksniff.com
33. Body hash → SHA-256
34. Custom header injection blocklist
35. Swift SDK Sendable fix
36. C# SDK API key validation + CancellationToken + retry
37. Elixir SDK :patch method
38. Terraform provider ya implement et ya kaldır
39. Expired token cleanup job
40. i18n çeviri tamamla (6 dil)
41. ROI calculator formül düzeltmesi
42. Client → server component dönüşümü (15+ sayfa)
43. SDK search API consistency
44. Helm replica count ayrı ayrı
45. Redis auth enable
46. Image tag pinning
47. HOOKRELAY_KEY → HOOKSNIFF_API_KEY (docs)
48. Free tier 1,000 → 10,000 (landing + i18n)
49. PayStack → fictional name change
50. Blog content bundle optimization
51. npm audit failure handling
52. Production deploy manual approval

### 🟢 P2 — Sonraki Sprint (20 madde)
53. Security test suite (XSS, CSRF, injection)
54. Accessibility test suite (jest-axe)
55. Test boilerplate refactor (shared setup)
56. SDK test ekle (tüm diller)
57. Dead code temizliği
58. OpenAPI spec doğrulama
59. Migration refactor (modüler)
60. k6 load test çalıştır
61. Staging ortamı
62. CLI test + engines field
63. Request ID tracking (SDK'lar)
64. SDK logging support
65. Portal postMessage (API key)
66. Portal CSP headers
67. Backup/restore hookrelay temizliği
68. Integration test hookrelay temizliği
69. Structured data (SEO)
70. Shared chart components extraction
71. Shared Modal component
72. PublicLayout extraction

---

## 📊 Modül Özeti

| Modül | Satır | Dosya | Kritik | Yüksek | Orta | Düşük |
|-------|-------|-------|--------|--------|------|-------|
| API (Rust) | 32,940 | 81 | 5 | 3 | 8 | 5 |
| Worker (Rust) | 2,379 | 10 | 2 | 1 | 4 | 2 |
| Dashboard Sayfalar | 15,000+ | 83 | 4 | 8 | 14 | 18 |
| Dashboard Test | 8,000+ | 57 | 0 | 2 | 9 | 3 |
| Dashboard Bileşen | 4,000+ | 19 | 0 | 1 | 3 | 2 |
| SDK'lar | 8,534 | 52 | 1 | 2 | 7 | 8 |
| Deploy/Helm | 3,000+ | 20 | 3 | 3 | 5 | 3 |
| Monitoring | 1,500+ | 7 | 2 | 0 | 1 | 2 |
| Scripts | 2,000+ | 10 | 2 | 2 | 1 | 2 |
| Portal | 500+ | 5 | 1 | 2 | 1 | 2 |
| CLI | 200+ | 2 | 0 | 0 | 2 | 1 |
| i18n | 5,000+ | 8 | 0 | 0 | 3 | 0 |
| Migrations | 3,000+ | 24 | 2 | 0 | 2 | 1 |
| Root Config | 90KB+ | 9 | 1 | 1 | 1 | 0 |
| Tests (integration) | 32KB+ | 10 | 0 | 0 | 0 | 1 |
| **TOPLAM** | **~70,689** | **~410** | **22** | **25** | **52** | **50** |

---

## 🔐 Güvenlik Kontrol Listesi

| Kontrol | Durum | Not |
|---------|-------|-----|
| SQL Injection | ✅ Güvenli | sqlx parameterized queries |
| XSS | ⚠️ Risk | dangerouslySetInnerHTML (blog), portal API key URL |
| CSRF | ⚠️ Risk | Form'larda koruma yok |
| SSRF | ⚠️ Risk | Playground'ta user-controlled path |
| Timing Attack | ✅ Güvenli | Constant-time comparison |
| Replay Attack | ✅ Güvenli | Timestamp + seen_webhooks |
| Brute Force | ✅ Güvenli | Login rate limit |
| Password Storage | ✅ Güvenli | Argon2id |
| API Key Storage | ✅ Güvenli | Argon2id + prefix lookup |
| JWT | ✅ Güvenli | Short-lived (15min) + refresh |
| 2FA | ⚠️ Risk | TOTP secret şifrelenmemiş, backup codes yok |
| Secret Logging | ⚠️ Risk | Config Debug'da secret'lar |
| Header Injection | ⚠️ Risk | Custom header allowlist yok |
| Token Exposure | ⚠️ Risk | Portal URL, OTEL config, dashboard fetch |
| Credential Leak | 🔴 Kritik | Publish scripts, Helm defaults, docker-compose |

---

## 📁 Kaynak Dosyalar (Detaylı Dosya Bazlı Analiz)

| Dosya | Kapsam |
|-------|--------|
| `DASHBOARD_PAGES_REVIEW.md` | 23 dashboard core sayfası — dosya bazlı analiz |
| `DASHBOARD_PUBLIC_PAGES_REVIEW.md` | 29 public/marketing sayfası — dosya bazlı analiz |
| `DASHBOARD_SEO_DOCS_REVIEW.md` | 32 SEO/alternatives/blog/docs/admin sayfası — dosya bazlı analiz |
| `TESTS_REVIEW.md` | 57 test dosyası — dosya bazlı analiz |
| `INFRASTRUCTURE_REVIEW.md` | Config, workflows, migrations, i18n, integration tests — dosya bazlı analiz |
| `REMAINING_REVIEW.md` | SDK'lar, deploy, monitoring, scripts, portal, CLI — dosya bazlı analiz |
| `READING_STATUS.md` | Dosya dosya okuma takibi |

---

*Bu rapor ~410 dosyanın %100 satır satır okunmasıyla hazırlanmıştır.*
*Her bulgu tek kez listelenmiştir — detay için ilgili kaynak dosyaya bakınız.*
