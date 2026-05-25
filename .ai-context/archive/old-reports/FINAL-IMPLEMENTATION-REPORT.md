# 🏗️ HookSniff — Nihai Uygulama Raporu (Final Implementation Report)

> **Tarih:** 2026-05-12 01:30 GMT+8
> **Kaynak:** `.ai-context/visual-bugs/_consolidated/` altındaki TÜM raporlar (60+ dosya, ~300KB)
> **Kapsam:** Admin Panel, Frontend, Backend, Infra, SDK, GDPR, A11Y, SEO, i18n, Performance, Security
> **Toplam Bulgu:** ~326+ sorun (6 dalga denetim, 29+ agent)
> **Amaç:** Tek bir belgede, aşamalı, yapılabilir plan

---

## 📊 Genel Durum Özeti (Final — Çapraz Kontrollü)

| Kategori | Kritik | Yüksek | Orta | Düşük | Toplam |
|----------|--------|--------|------|-------|--------|
| 🚨 Güvenlik & Auth | 15 | 18 | 20 | 8 | **~61** |
| 🖥️ Admin Panel | 5 | 20 | 15 | 10 | **~50** |
| 🎨 Frontend (Dashboard) | 14 | 16 | 25 | 15 | **~70** |
| ⚙️ Backend Async/Crypto/Rate | 8 | 10 | 15 | 3 | **~36** |
| 💳 Payments & Billing | 1 | 4 | 7 | 2 | **~14** |
| 🗄️ Veritabanı | 5 | 6 | 10 | 5 | **~26** |
| 🔧 Altyapı & Config | 3 | 3 | 6 | 2 | **~14** |
| 🌍 i18n (Çeviri) | 4 | 6 | 6 | 0 | **~16** |
| ♿ Erişilebilirlik | 13 | 8 | 6 | 0 | **~27** |
| 🔒 GDPR | 2 | 2 | 3 | 0 | **~7** |
| ⚡ Performans | 0 | 1 | 3 | 1 | **~5** |
| 📧 Email Sistemi | 0 | 3 | 4 | 2 | **~9** |
| 📦 SDK & OpenAPI | 0 | 0 | 3 | 1 | **~4** |
| 📝 İçerik & SEO | 0 | 3 | 3 | 0 | **~6** |
| 🏗️ Code Quality & Deps | 0 | 3 | 8 | 3 | **~14** |
| **TOPLAM** | **~70** | **~103** | **~134** | **~52** | **~359** |

> **Not:** Bu tablo sadece KALAN (⬜) işleri gösterir. Önceki oturumlarda yapılan ~153 iş dahil değildir.
> **Çapraz kontrol:** Tüm 60+ rapor dosyası tarandı, agent raporları (1-5), deep-* raporları, admin raporları dahil.

---

# ═══════════════════════════════════════════
# AŞAMA 1 — KRİTİK GÜVENLİK & ALTYAPI
# ═══════════════════════════════════════════
# Süre: 2-3 gün | Öncelik: ACİL

## 1.1 Rate Limiting (Auth Endpoints)

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 1.1.1 | `verify_email` rate limit yok — brute force ile token tahmini | `api/src/routes/auth.rs:474` | ✅ Yapıldı (Oturum 73) |
| 1.1.2 | `verify_2fa` rate limit yok — TOTP brute force | `api/src/routes/auth.rs:302` | ✅ Yapıldı (Oturum 73) |
| 1.1.3 | `refresh_token` rate limit yok — token stuffing | `api/src/routes/auth.rs:547` | ✅ Yapıldı (Oturum 73) |
| 1.1.4 | Contact form rate limit yok — spam/flood | `api/src/routes/contact.rs` | ✅ Yapıldı (Oturum 73) |

## 1.2 Webhook Verification & Ownership

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 1.2.1 | Inbound webhook signature verification optional — secret boşsa `Ok(())` döner | `api/src/routes/inbound.rs:194` | ✅ Yapıldı (Oturum 74) |
| 1.2.2 | Billing webhook secret boşsa verification atlıyor | `api/src/routes/billing.rs:378` | ✅ Yapıldı (Oturum 74) |
| 1.2.3 | Schema endpoint'lerinde ownership check yok — cross-tenant leak | `api/src/routes/schemas.rs:85` | ✅ Yapıldı (Oturum 74) |
| 1.2.4 | `handle_inbound_to_endpoint` Authorization bypass — sadece prefix lookup, Argon2 yok | `api/src/routes/inbound.rs:385` | ✅ Yapıldı (Oturum 74) |
| 1.2.5 | Prefix length mismatch — 20 char lookup ama DB'de 15 char prefix | `api/src/routes/inbound.rs` | ✅ Yapıldı (Oturum 74) |

## 1.3 Infrastructure Security

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 1.3.1 | `.env.production.example`'da gerçek Grafana token (base64) | `.env.production.example` | ✅ Yapıldı (Oturum 75) |
| 1.3.2 | `.gitignore`'da `.env` pattern eksik | `.gitignore` | ✅ Yapıldı (Oturum 75) |
| 1.3.3 | Concurrent delivery limit yok — 50 eşzamanlı HTTP request, DDoS riski | `worker/src/main.rs` | ✅ Yapıldı (Oturum 75) |
| 1.3.4 | Billing webhook'larında rate limiting yok | `api/src/routes/billing.rs` | ✅ Yapıldı (Oturum 75) |

## 1.4 SSRF & Security Hardening

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 1.4.1 | Portal notification URL'lerinde SSRF | `api/src/routes/customer_portal.rs` | ✅ Yapıldı (Oturum 79) |
| 1.4.2 | CSP'de `unsafe-inline` + `unsafe-eval` — XSS riski | `dashboard/next.config.js` | ✅ Yapıldı (Oturum 79) |
| 1.4.3 | `DefaultHasher` idempotency hash'te (kriptografik değil) | `api/src/middleware/idempotency.rs` | ✅ Yapıldı (Oturum 79) |
| 1.4.4 | HSTS header eksik | `dashboard/next.config.js` | ✅ Yapıldı (Oturum 83) |

## 1.5 Auth & Crypto Security

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 1.5.1 | Timing attack — login hataları farklı mesajlar döndürüyor | `api/src/routes/auth.rs` | ✅ Yapıldı (Oturum 82) |
| 1.5.2 | `AppError::Serialization` serde_json hata mesajını kullanıcıya gösteriyor | `api/src/error.rs` | ✅ Yapıldı (Oturum 82) |
| 1.5.3 | Email enumeration — register "Email already registered" döndürüyor | `api/src/routes/auth.rs` | ✅ Yapıldı (Oturum 82) |
| 1.5.4 | Auth cache `std::sync::Mutex` — async context'te deadlock riski | `api/src/middleware/mod.rs` | ✅ Yapıldı (Oturum 82) |
| 1.5.5 | `rate_limit.rs` unwrap() — header parse failure'da panic | `api/src/rate_limit.rs` | ✅ Yapıldı (Oturum 82) |
| 1.5.6 | Alert condition string validation eksik — whitelist yok | `api/src/routes/alerts.rs` | ✅ Yapıldı (Oturum 82) |
| 1.5.7 | Polar/iyzico webhook error message'da internal config sızıntısı | `api/src/routes/billing.rs` | ✅ Yapıldı (Oturum 82) |

## 1.6 Dashboard Security

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 1.6.1 | Hardcoded `Authorization: 'Bearer YOUR_TOKEN'` | `dashboard/src/app/[locale]/dashboard/playground/page.tsx` | ✅ Yapıldı (Oturum 78) |
| 1.6.2 | `api-keys/page.tsx` credentials yanlış yerde | `dashboard/src/app/[locale]/dashboard/api-keys/page.tsx` | ✅ Yapıldı (Oturum 78) |
| 1.6.3 | `output: 'standalone'` eksik — Docker build başarısız | `dashboard/next.config.js` | ✅ Yapıldı (Oturum 83) |

## 1.7 Worker & Backend Core

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 1.7.1 | Error classification yok — 400/401/404 de retry ediliyor | `worker/src/main.rs` | ✅ Yapıldı (Oturum 80) |
| 1.7.2 | WebSocket connection limit yok — bellek tüketimi | `api/src/ws/` | ✅ Yapıldı (Oturum 91) |
| 1.7.3 | Circuit breaker modülü var ama entegre edilmemiş | `api/src/circuit_breaker.rs` | ✅ Yapıldı (Oturum 91) |
| 1.7.4 | Billing webhook'larda idempotency yok | `api/src/routes/billing.rs` | ✅ Yapıldı (Oturum 91) |
| 1.7.5 | FIFO modülü var ama worker döngüsüne bağlanmamış | `worker/src/main.rs` | ✅ Yapıldı (Oturum 92) |

## 1.8 ⬜ KALAN KRİTİK — Henüz Yapılmadı

### 1.8.A Edge & Dashboard Security

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 1.8.1 | **Edge middleware auth yok** — Dashboard HTML'i herkese servis ediliyor, middleware sadece i18n routing yapıyor | `dashboard/src/middleware.ts` | 🔴 Kritik |
| 1.8.2 | **No CSRF protection on state-changing API calls** — POST/PUT/DELETE'de CSRF token yok | `dashboard/src/lib/api.ts` | 🔴 Kritik |
| 1.8.3 | **Admin authorization client-side only** — Server-side admin role doğrulaması yok | `dashboard/src/app/[locale]/admin/layout.tsx` | 🟡 Yüksek |
| 1.8.4 | **Playground token localStorage'da** — XSS ile çalınabilir | `dashboard/src/app/[locale]/dashboard/playground/page.tsx` | 🟡 Yüksek |
| 1.8.5 | **Playground token URL path'te** — Token URL'de görünüyor, loglanabilir | `dashboard/src/app/[locale]/dashboard/playground/page.tsx` | 🟡 Yüksek |
| 1.8.6 | **Missing input sanitization on API parameters** — Search sayfası | `dashboard/src/app/[locale]/dashboard/search/page.tsx` | 🟡 Orta |
| 1.8.7 | **Deprecated X-XSS-Protection header** — Modern tarayıcılarda gereksiz, CSP kullanılmalı | `dashboard/next.config.js` | 🟢 Düşük |
| 1.8.8 | **Endpoint detail fetches all endpoints** — N+1 query, performans sorunu | `dashboard/src/app/[locale]/dashboard/endpoints/[id]/page.tsx` | 🟢 Düşük |

### 1.8.B Async Rust Kritik Sorunlar (deep-async-rust.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 1.8.9 | **`std::sync::Mutex` held across `.await`** — Auth middleware'de cache miss'te tüm requestleri bloklayabilir, production hang | `api/src/middleware/mod.rs` | 🔴 Kritik |
| 1.8.10 | **Unbounded auth cache growth** — Memory leak, OOM over time | `api/src/middleware/mod.rs` | 🔴 Kritik |
| 1.8.11 | **Argon2 (CPU-bound) in async without `spawn_blocking`** — Thread starvation under load | `api/src/auth/jwt.rs` | 🔴 Kritik |
| 1.8.12 | **`reqwest::Client` created per-request** — Connection leak, performance degradation (birden fazla modülde) | `api/src/`, `worker/src/` | 🟡 Yüksek |
| 1.8.13 | **Blocking file I/O in async context** — Thread blocking | `worker/src/` | 🟡 Yüksek |
| 1.8.14 | **Unbounded `mpsc::UnboundedChannel` in WebSocket** — Memory pressure under slow consumers | `api/src/ws/` | 🟡 Yüksek |
| 1.8.15 | **Broadcast channel overflow silently drops events** — Event loss | `api/src/ws/` | 🟡 Orta |
| 1.8.16 | **Poisoned mutex panics crash the server** — Server crash propagation | `api/src/` | 🟡 Orta |

### 1.8.C Crypto & Auth (deep-crypto.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 1.8.17 | **Argon2id parametreleri OWASP altı** — memory_cost, time_cost yetersiz | `api/src/auth/jwt.rs` | 🟡 Yüksek |
| 1.8.18 | **JWT uses HS256 (symmetric) — no asymmetric option** | `api/src/auth/jwt.rs` | 🟡 Orta |
| 1.8.19 | **Access tokens cannot be revoked** — Token geçerlilik süresince revoke edilemiyor | `api/src/auth/jwt.rs` | 🟡 Orta |
| 1.8.20 | **Endpoint signing secrets use UUID instead of cryptographic random** | `api/src/routes/endpoints.rs` | 🟡 Orta |
| 1.8.21 | **ENCRYPTION_KEY not validated at startup** — Boş/yanlış key ile başlayabilir | `api/src/crypto.rs` | 🟡 Orta |
| 1.8.22 | **No PKCE (Proof Key for Code Exchange)** — OAuth flow'da | `api/src/routes/oauth.rs` | 🟡 Orta |

### 1.8.D Rate Limiting Bypass (deep-rate-limiting.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 1.8.23 | **In-memory rate limit default** — Production'da restart'ta kaybolur, multi-instance'da bypass | `api/src/rate_limit.rs` | 🔴 Kritik |
| 1.8.24 | **IP spoofing via X-Forwarded-For header** — Rate limit bypass | `api/src/rate_limit.rs` | 🔴 Kritik |
| 1.8.25 | **API-level rate limit middleware gap** — Bazı endpoint'ler atlanıyor | `api/src/rate_limit.rs` | 🟡 Yüksek |
| 1.8.26 | **Auth routes lack X-RateLimit headers** — Client rate limit durumunu göremiyor | `api/src/routes/auth.rs` | 🟡 Orta |
| 1.8.27 | **Redis failure = open floodgates** — Redis down olursa rate limit tamamen bypass | `api/src/rate_limit.rs` | 🟡 Orta |
| 1.8.28 | **Key collision risk with 15-character prefix** — Rate limit key'lerinde | `api/src/rate_limit.rs` | 🟢 Düşük |

### 1.8.E Worker Kritik Sorunlar (deep-worker.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 1.8.29 | **No idempotency — webhooks can be duplicated** | `worker/src/main.rs` | 🔴 Kritik |
| 1.8.30 | **Zombie reaper increments attempt count without delivery** — Yanlış retry sayımı | `worker/src/main.rs` | 🟡 Yüksek |
| 1.8.31 | **No retry for DB commit failures** — Veri kaybı riski | `worker/src/main.rs` | 🟡 Yüksek |
| 1.8.32 | **`avg_response_ms` overwritten, not averaged** — Yanlış metrik | `worker/src/main.rs` | 🟡 Orta |
| 1.8.33 | **Email delivery uses blocking I/O in async context** | `worker/src/delivery/mod.rs` | 🟡 Orta |
| 1.8.34 | **Email delivery creates new HTTP client per call** — Connection leak | `worker/src/delivery/mod.rs` | 🟡 Orta |
| 1.8.35 | **No response body size limit on receive** — Memory bomb riski | `worker/src/delivery/http.rs` | 🟡 Orta |
| 1.8.36 | **Fan-out bug — target config not used** | `worker/src/delivery/mod.rs` | 🟡 Orta |
| 1.8.37 | **Dead letter customer ID is `Uuid::nil()`** — İzlenebilirlik sorunu | `worker/src/delivery/mod.rs` | 🟢 Düşük |

### 1.8.F Infrastructure (deep-infra.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 1.8.38 | **Staging has default fallback passwords** — Güvenlik açığı | `docker-compose.staging.yml` | 🔴 Kritik |
| 1.8.39 | **No rollback strategy** — Deploy başarısız olursa geri dönüş yok | `.github/workflows/deploy.yml` | 🟡 Yüksek |
| 1.8.40 | **Hardcoded secrets in Helm values.yaml** | `deploy/helm/values.yaml` | 🟡 Yüksek |
| 1.8.41 | **No HPA (Horizontal Pod Autoscaler)** — Ölçeklenme yok | `deploy/helm/` | 🟡 Orta |
| 1.8.42 | **Worker has no liveness/readiness probes** | `deploy/helm/` | 🟡 Orta |
| 1.8.43 | **No `--start-period` in dev HEALTHCHECK** | `Dockerfile.api` | 🟡 Orta |
| 1.8.44 | **Worker Dockerfile has no HEALTHCHECK** | `Dockerfile.worker` | 🟡 Orta |
| 1.8.45 | **Connection pool config hardcoded** — `max_connections(10)` env'den okunmalı | `worker/src/main.rs` | 🟡 Orta |
| 1.8.46 | **Git history'de OTEL credentials** — BFG ile temizlenmeli | Git history | 🟡 Orta |
| 1.8.47 | **DATABASE_URL local credentials git history'de** — BFG ile temizlenmeli | Git history | 🟡 Orta |
| 1.8.48 | **DNS rebinding SSRF** — Endpoint creation'da validation, DNS rebinding ile bypass | `api/src/ssrf.rs` | 🟡 Orta |

---

# ═══════════════════════════════════════════
# AŞAMA 2 — ADMIN PANEL (Tüm Sorunlar)
# ═══════════════════════════════════════════
# Süre: 2-3 gün | Öncelik: YÜKSEK

## 2.1 Admin Sidebar Çevirisi (Tüm Sayfaları Etkiliyor)

| # | Mevcut (EN) | Olması Gereken (TR) | Durum |
|---|-------------|---------------------|-------|
| 2.1.1 | Admin Panel | Yönetim Paneli | ⬜ |
| 2.1.2 | HookSniff Management | HookSniff Yönetimi | ⬜ |
| 2.1.3 | Overview | Genel Bakış | ⬜ |
| 2.1.4 | Users | Kullanıcılar | ⬜ |
| 2.1.5 | Revenue | Gelir | ⬜ |
| 2.1.6 | System | Sistem | ⬜ |
| 2.1.7 | Settings | Ayarlar | ⬜ |
| 2.1.8 | Back to Dashboard | Panele Dön | ⬜ |
| 2.1.9 | Logout | Çıkış Yap | ⬜ |
| 2.1.10 | Switch to dark mode | Karanlık moda geç | ⬜ |
| 2.1.11 | Switch to light mode | Açık moda geç | ⬜ |
| 2.1.12 | Open sidebar | Yan menüyü aç | ⬜ |

## 2.2 Admin Overview Sayfası

| # | Sorun | Durum | Kaynak |
|---|-------|-------|--------|
| 2.2.1 | Header "Admin" badge'i İngilizce → "Yönetici" | ⬜ | 📸 dark + light screenshot |
| 2.2.2 | "Admin Overview" → "Yönetici Genel Bakışı" | ⬜ | 📝 rapor |
| 2.2.3 | "Platform-wide metrics and recent activity" → "Platform genelinde metrikler ve son aktivite" | ⬜ | 📸 light screenshot |
| 2.2.4 | "No recent signups" → "Son kayıt yok" | ⬜ | 📝 rapor |
| 2.2.5 | Document title Türkçe değil → "HookSniff — Webhook Teslimat Servisi" | ⬜ | 📝 rapor |
| 2.2.6 | Contrast fail: empty state text `text-gray-400` (2.54:1) — WCAG AA fail | ⬜ | 📸 dark screenshot |
| 2.2.7 | Contrast fail: subtitle text `text-gray-400` (2.54:1) | ⬜ | 📸 light screenshot |
| 2.2.8 | Contrast fail: logout butonu sol altta neredeyse görünmez (2.54:1 light, 3.75:1 dark) | ⬜ | 📸 dark + light screenshot |
| 2.2.9 | Dark mode toggle `type="submit"` → `type="button"` | ⬜ | 📝 rapor |
| 2.2.10 | Mobil menü butonu `type="submit"` → `type="button"` | ⬜ | 📝 rapor |
| 2.2.11 | SVG icon'larda `aria-label` eksik | ⬜ | 📝 rapor |
| 2.2.12 | Emoji icon'lar `aria-hidden="true"` ile işaretlenmeli | ⬜ | 📝 rapor |
| 2.2.13 | **"Plana Göre Kullanıcılar" kartı tamamen boş** — sadece başlık + "Veri yok", placeholder grafik yok | ⬜ | 📸 dark screenshot |
| 2.2.14 | **"Switch to dark mode" butonu İngilizce** (sidebar altı) | ⬜ | 📸 dark screenshot |

## 2.3 Admin Users Sayfası

| # | Sorun | Durum | Kaynak |
|---|-------|-------|--------|
| 2.3.1 | Tablo başlıkları İngilizce: ID, Email, Name, Plan, Status, Created, Actions | ⬜ | 📸 screenshot |
| 2.3.2 | Butonlar İngilizce: View, Plan, Ban | ⬜ | 📸 screenshot |
| 2.3.3 | Badge'ler İngilizce: free (gri), active (yeşil), business (mavi) | ⬜ | 📸 screenshot |
| 2.3.4 | Tarih formatı MM/DD/YYYY ("5/10/2026") → DD.MM.YYYY | ⬜ | 📸 screenshot |
| 2.3.5 | Zebra renklendirme yok — tüm satırlar aynı renk | ⬜ | 📸 screenshot |
| 2.3.6 | Hover efekti belirsiz | ⬜ | 📝 rapor |
| 2.3.7 | `scope="col"` eksik header'larda | ⬜ | 📝 rapor |
| 2.3.8 | Arama input label eksik | ⬜ | 📝 rapor |
| 2.3.9 | Combobox label eksik | ⬜ | 📝 rapor |
| 2.3.10 | Sayfalama eksik | ⬜ | 📝 rapor |
| 2.3.11 | Kolon sıralama (sortable) yok | ⬜ | 📝 rapor |
| 2.3.12 | Butonlarda ikon yok | ⬜ | 📝 rapor |
| 2.3.13 | **"Admin" badge'i İngilizce** — users sayfasında da | ⬜ | 📸 screenshot |

## 2.4 Admin Revenue Sayfası (Puan: 4/10)

| # | Sorun | Durum | Kaynak |
|---|-------|-------|--------|
| 2.4.1 | "Revenue Dashboard" → "Gelir Paneli" | ⬜ | 📝 rapor |
| 2.4.2 | "Financial metrics and revenue breakdown" → "Finansal metrikler ve gelir dağılımı" | ⬜ | 📝 rapor |
| 2.4.3 | **Grafik X ve Y ekseni etiketleri tamamen boş** — çizgi yok, eksen yok | ⬜ | 📸 light + dark desktop screenshot |
| 2.4.4 | Pie chart legend yok | ⬜ | 📝 rapor |
| 2.4.5 | SVG `<title>` ve `<desc>` boş — erişilebilirlik | ⬜ | 📝 rapor |
| 2.4.6 | **Mobile responsive tamamen bozuk** — 375px'te kartlar taşıyor | ⬜ | 📸 mobile screenshot |
| 2.4.7 | Sidebar offset mobile'da düzeltilmemiş | ⬜ | 📝 rapor |
| 2.4.8 | Chart container 423px sabit genişlik — responsive değil | ⬜ | 📝 rapor |
| 2.4.9 | Para birimi `$` → Türkçe locale'de `₺` olmalı | ⬜ | 📝 rapor |
| 2.4.10 | Tarih aralığı seçici yok | ⬜ | 📝 rapor |
| 2.4.11 | Veri yenileme mekanizması yok (manuel refresh butonu) | ⬜ | 📝 rapor |
| 2.4.12 | Boş state için placeholder grafik/ikon yok | ⬜ | 📸 screenshot |
| 2.4.13 | H1 hierarchy — iki tane h1 var, biri h2 olmalı | ⬜ | 📝 rapor |
| 2.4.14 | Alert element boş — kaldırılmalı veya doldurulmalı | ⬜ | 📝 rapor |
| 2.4.15 | **"Admin" badge'i İngilizce** — revenue sayfasında da | ⬜ | 📸 screenshot |
| 2.4.16 | **"Switch to light mode" butonu İngilizce** (dark mode'da) | ⬜ | 📸 dark screenshot |
| 2.4.17 | **Grafik dark mode'da da boş** — light/dark fark etmiyor | ⬜ | 📸 dark screenshot |

## 2.5 Admin System Sayfası

| # | Sorun | Durum | Kaynak |
|---|-------|-------|--------|
| 2.5.1 | **Sağlık kontrolü API çalışmıyor** — 4 servis sürekli "Checking..." / "Bilinmiyor" | ⬜ | 📸 screenshot (refresh sonrası bile) |
| 2.5.2 | "Monitor infrastructure services and system status" → "Altyapı hizmetlerini ve sistem durumunu izleyin" | ⬜ | 📝 rapor |
| 2.5.3 | Tarih formatı İngilizce: `5/10/2026, 4:59:33 PM` → `Intl.DateTimeFormat('tr-TR')` | ⬜ | 📝 rapor |
| 2.5.4 | **Servis rolleri İngilizce: Database, Cache, Monitoring, Queue** → Veritabanı, Önbellek, İzleme, Kuyruk | ⬜ | 📸 screenshot |
| 2.5.5 | Loading spinner eksik — "Checking..." statik metin | ⬜ | 📸 screenshot |
| 2.5.6 | Retry butonu yok | ⬜ | 📝 rapor |
| 2.5.7 | Hata detayı eksik — banner hangi servisin neden başarısız olduğunu açıklamıyor | ⬜ | 📸 screenshot |
| 2.5.8 | ARIA live region eksik — durum değişiklikleri screen reader'a bildirilmiyor | ⬜ | 📝 rapor |
| 2.5.9 | Altyapı tablosu header eksik (Sağlayıcı, Kapasite, Rol) | ⬜ | 📸 screenshot |
| 2.5.10 | Renk bağımlı bilgi — sadece renk + metin, renk körlüğü sorunu | ⬜ | 📝 rapor |
| 2.5.11 | **"Sistem Sorunları Tespit Edildi" uyarı banner'ı dar, sıkışık layout** | ⬜ | 📸 screenshot |
| 2.5.12 | **15s auto-refresh sonrası bile hâlâ "Checking..."** — API hiç yanıt vermiyor | ⬜ | 📸 after-refresh screenshot |
| 2.5.13 | **"Admin" badge'i İngilizce** — system sayfasında da | ⬜ | 📸 screenshot |

## 2.6 Admin Settings Sayfası

| # | Sorun | Durum | Kaynak |
|---|-------|-------|--------|
| 2.6.1 | "Settings" → "Ayarlar" (header) | ⬜ | 📸 screenshot |
| 2.6.2 | "Configure platform-wide defaults and limits" → "Platform genelinde varsayılan ayarları ve limitleri yapılandırın" | ⬜ | 📝 rapor |
| 2.6.3 | "Default Plan" → "Varsayılan Plan" | ⬜ | 📸 screenshot |
| 2.6.4 | "Free" → "Ücretsiz" (select seçeneği) | ⬜ | 📸 screenshot |
| 2.6.5 | "Max Endpoints" → "Maks. Uç Nokta" | ⬜ | 📸 screenshot |
| 2.6.6 | "Max Webhooks/Month" → "Maks. Webhook/Ay" | ⬜ | 📸 screenshot |
| 2.6.7 | "Rate Limit (req/min)" → "Hız Limiti (istek/dk)" | ⬜ | 📸 screenshot |
| 2.6.8 | "Retention (days)" → "Süre (gün)" | ⬜ | 📸 screenshot |
| 2.6.9 | "Max Retry Attempts" → "Maks. Tekrar Deneme Sayısı" | ⬜ | 📸 screenshot |
| 2.6.10 | **"Failed to save settings" → "Ayarlar kaydedilemedi"** — hata mesajı İngilizce | ⬜ | 📸 error screenshot |
| 2.6.11 | Toggle'larda `role="switch"` ve `aria-checked` eksik | ⬜ | 📝 rapor |
| 2.6.12 | Label'lar `htmlFor` ile input'lara bağlı değil | ⬜ | 📝 rapor |
| 2.6.13 | Number input'larda min/max sınırları yok (8 input'tan 7'sinde) | ⬜ | 📝 rapor |
| 2.6.14 | Toggle butonları `type="submit"` → `type="button"` | ⬜ | 📝 rapor |
| 2.6.15 | **Input stilleri tutarsız** — `py-2 rounded-lg` vs `py-3 rounded-xl` | ⬜ | 📸 screenshot |
| 2.6.16 | Dark mode focus ring stilleri boş | ⬜ | 📝 rapor |
| 2.6.17 | Success feedback mekanizması yok | ⬜ | 📝 rapor |
| 2.6.18 | Loading state (spinner) yok | ⬜ | 📝 rapor |
| 2.6.19 | Zorunlu alan işaretleri (*) yok | ⬜ | 📝 rapor |
| 2.6.20 | **"Admin" badge'i İngilizce** — settings sayfasında da | ⬜ | 📸 screenshot |
| 2.6.21 | **Hata banner'ı kırmızı arka plan + beyaz metin** — ✅ görünür ama `role="alert"` eksik | ⬜ | 📸 error screenshot |

## 2.7 Admin API & Data Flow

| # | Sorun | Durum |
|---|-------|-------|
| 2.7.1 | `/admin/settings` endpoint'i backend'de eksik — frontend çağırıyor ama route yok | ⬜ |
| 2.7.2 | Revenue response format uyumsuzluğu — frontend/backend type mismatch | ⬜ |
| 2.7.3 | Admin sağlık kontrolü API yanıt vermiyor | ⬜ |

## 2.8 Admin Genel Sorunlar

| # | Sorun | Durum | Kaynak |
|---|-------|-------|--------|
| 2.8.1 | Tüm sayfalarda heading hierarchy sorunu — 2 tane h1 | ⬜ | 📝 rapor |
| 2.8.2 | ARIA landmarks eksik | ⬜ | 📝 rapor |
| 2.8.3 | Skip-to-content link'i yok | ⬜ | 📝 rapor |
| 2.8.4 | Border radius inconsistency (input stilleri) | ⬜ | 📝 rapor |
| 2.8.5 | Save button color mismatch | ⬜ | 📝 rapor |
| 2.8.6 | **Tablet'te sayfa TAMAMEN BOŞ** — hiçbir content render edilmiyor (overview-tablet-blank.png) | ⬜ | 📸 tablet screenshot |
| 2.8.7 | **Tablet layout bozuk** — sidebar offset sorunu, içerik hizalanmamış | ⬜ | 📸 tablet screenshot |
| 2.8.8 | **"Admin" badge'i TÜM sayfalarda İngilizce** — 5/5 sayfada tespit edildi | ⬜ | 📸 tüm screenshot'lar |

---

# ═══════════════════════════════════════════
# AŞAMA 3 — FRONTEND DASHBOARD (Kritik Fixler)
# ═══════════════════════════════════════════
# Süre: 2-3 gün | Öncelik: YÜKSEK

## 3.1 Dashboard Routing & API Uyumsuzluğu

| # | Sorun | Durum |
|---|-------|-------|
| 3.1.1 | Dashboard routing çökmüş — 16 sayfa yanlış içerik | ✅ Yapıldı (Oturum 76) |
| 3.1.2 | Frontend-Backend API uyumsuzluğu (Revenue, Billing, Notifications) | ✅ Yapıldı (Oturum 77) |
| 3.1.3 | Fiyat uyumsuzluğu — Frontend $49/$149, Backend $29/$99 | ✅ Yapıldı (Oturum 77) |
| 3.1.4 | Search'de debounce yok — her tuşta API çağrısı | ✅ Yapıldı (Oturum 77) |
| 3.1.5 | Abonelik iptal endpoint'i yok — DELETE /billing/subscription → 405 | ✅ Yapıldı (Oturum 78) |
| 3.1.6 | Hesap silme bozuk — DELETE /auth/me vs DELETE /auth/account | ✅ Yapıldı (Oturum 78) |

## 3.2 Component Logic Issues

| # | Sorun | Durum |
|---|-------|-------|
| 3.2.1 | Dual onboarding modal — ikisi aynı anda açılıyor | ✅ Yapıldı (Oturum 84) |
| 3.2.2 | Toast'ta dismiss/aria-live yok | ✅ Yapıldı (Oturum 84) |
| 3.2.3 | Client-side search + server-side pagination çelişkisi | ✅ Yapıldı (Oturum 84) |
| 3.2.4 | Status count'lar sadece mevcut sayfadan hesaplanıyor | ✅ Yapıldı (Oturum 84) |
| 3.2.5 | Stale closure riskleri (4 useEffect) | ✅ Yapıldı (Oturum 84) |

## 3.3 ⬜ KALAN FRONTEND — Kritik & Yüksek

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 3.3.1 | **Silent API failures** — 7+ sayfada boş `catch {}`, kullanıcı hata göremiyor | Health, Alerts, Search, Schemas, Templates, Portal, Routing | 🔴 Kritik |
| 3.3.2 | **Error Boundary dashboard'da kullanılmamış** — Component crash → beyaz ekran | `dashboard/src/app/[locale]/dashboard/layout.tsx` | 🔴 Kritik |
| 3.3.3 | **Destructive action'larda confirmation yok** — Transforms, Notifications, Team'de silme onaysız | Transforms, Notifications, Team pages | 🔴 Kritik |
| 3.3.4 | **`router.push` navigations locale prefix içermiyor** — 3 sayfada locale kaybediliyor | Dashboard, Endpoints, Deliveries | 🔴 Kritik |
| 3.3.5 | **Hardcoded locale list in regex** — bazı locale'leri kaçırıyor | `dashboard/src/app/[locale]/dashboard/layout.tsx` | 🔴 Kritik |
| 3.3.6 | **No i18n in Webhook Builder** — tamamen İngilizce | `dashboard/src/app/[locale]/dashboard/webhook-builder/page.tsx` | 🔴 Kritik |
| 3.3.7 | **No i18n in Signature Verifier** — tamamen İngilizce | `dashboard/src/app/[locale]/dashboard/signature-verifier/page.tsx` | 🔴 Kritik |
| 3.3.8 | **No i18n in API Importer** — tamamen İngilizce | `dashboard/src/app/[locale]/dashboard/api-importer/page.tsx` | 🔴 Kritik |
| 3.3.9 | **API Request Missing Authorization Header** (Health page) — API çağrısı auth header yok | `dashboard/src/app/[locale]/dashboard/health/page.tsx` | 🔴 Kritik |
| 3.3.10 | **`credentials: 'include'` inside `headers` object** (API Keys createKey) — Cookie gönderilmiyor, 401 hatası | `dashboard/src/app/[locale]/dashboard/api-keys/page.tsx` | 🔴 Kritik |
| 3.3.11 | **`billingApi` ve `billingApiExtended` duplicate `getInvoices`** — çakışma | `dashboard/src/lib/api.ts` | 🟡 Yüksek |
| 3.3.12 | **No retry logic for transient errors** (502, 503, 504) — Kullanıcı error görür, recovery yok | `dashboard/src/lib/api.ts` | 🟡 Yüksek |
| 3.3.13 | **401 refresh loop risk** — Concurrent requests refresh'i tetikleyebilir | `dashboard/src/lib/api.ts` | 🟡 Yüksek |
| 3.3.14 | **Owner can demote themselves** — Role dropdown'da owner kendi rolünü değiştirebilir | `dashboard/src/app/[locale]/dashboard/team/page.tsx` | 🟡 Yüksek |
| 3.3.15 | **No role-based permission checks** — Herkes (member dahil) rol değiştirebilir, üye atabilir | `dashboard/src/app/[locale]/dashboard/team/page.tsx` | 🟡 Yüksek |
| 3.3.16 | **Signature comparison not constant-time** (Signature Verifier) — Timing attack | `dashboard/src/app/[locale]/dashboard/signature-verifier/page.tsx` | 🟡 Yüksek |
| 3.3.17 | **Grid layout mobilde kırılıyor** — `grid-cols-2`/`grid-cols-3` responsive breakpoint yok | Portal page | 🟡 Yüksek |
| 3.3.18 | **`vh` kullanımı mobilde address bar sorunu** — `max-h-[80vh]` → `max-h-[80dvh]` | Deliveries, Logs, Blog | 🟡 Orta |
| 3.3.19 | **Suspense boundary eksik** — 29 dashboard sayfası data fetching ama Suspense yok | Çeşitli sayfalar | 🟡 Orta |
| 3.3.20 | **Console.log/Debug kalıntıları** — Production'da console.error/warn | Portal, Store, Email | 🟡 Orta |
| 3.3.21 | **Toast warning type eksik** — Sadece success/error/info | `dashboard/src/components/Toast.tsx` | 🟡 Orta |
| 3.3.22 | **Toast messages translated değil** — Bazı sayfalar raw English gönderiyor | Çeşitli sayfalar | 🟡 Orta |
| 3.3.23 | **Toast no dismiss button** — Kullanıcı 4 saniye beklemek zorunda | `dashboard/src/components/Toast.tsx` | 🟡 Orta |
| 3.3.24 | **Toast no `role="alert"`** — Ekran okuyucu bildirimleri algılayamıyor | `dashboard/src/components/Toast.tsx` | 🟡 Orta |
| 3.3.25 | **ErrorBoundary console.log only** — Production'da error tracking yok (Sentry vb.) | `dashboard/src/components/ErrorBoundary.tsx` | 🟡 Orta |
| 3.3.26 | **No offline detection** — Kullanıcı offline olursa generic error | `dashboard/src/lib/api.ts` | 🟡 Orta |

## 3.4 ⬜ KALAN FRONTEND — Orta & Düşük

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 3.4.1 | **63 useEffect'ten %75'inde cleanup eksik** — memory leak riski | Çeşitli sayfalar | 🟡 Orta |
| 3.4.2 | **Sidebar 26 item, gruplama yok** — yeni kullanıcı kayboluyor | `dashboard/src/app/[locale]/dashboard/layout.tsx` | 🟡 Orta |
| 3.4.3 | **Sidebar active state sadece exact match** — `/endpoints/abc123` highlight etmiyor | `dashboard/src/app/[locale]/dashboard/layout.tsx` | 🟡 Orta |
| 3.4.4 | **Schemas, Templates, Portal sidebar'da link yok** | `dashboard/src/app/[locale]/dashboard/layout.tsx` | 🟡 Orta |
| 3.4.5 | **Sidebar bottom controls nav overlap** — 26+ item'da LanguageSwitcher/ThemeToggle content üstüne biniyor | `dashboard/src/app/[locale]/dashboard/layout.tsx` | 🟡 Orta |
| 3.4.6 | **ConfirmDialog dark mode eksik** — `bg-white` ama `dark:bg-slate-900` yok | `dashboard/src/components/ConfirmDialog.tsx` | 🟡 Orta |
| 3.4.7 | **Toast info variant dark mode** — `bg-gray-900` dark background'da düşük kontrast | `dashboard/src/components/Toast.tsx` | 🟡 Orta |
| 3.4.8 | **Loading states tutarsız** — SkeletonCard/SkeletonTable/LoadingSpinner var ama çoğu sayfa plain text kullanıyor | Çeşitli sayfalar | 🟡 Orta |
| 3.4.9 | **EmptyState component hiç kullanılmıyor** — her sayfa kendi empty state'ini yapmış | `dashboard/src/components/EmptyState.tsx` | 🟡 Orta |
| 3.4.10 | **Multiple pages raw `fetch()` kullanıyor** — `apiFetch()` yerine | Health, API Keys, Search, Audit Log, Custom Domain, SSO, Portal, Playground | 🟡 Orta |
| 3.4.11 | **Portal/Schemas/Routing/Templates double-padding** — farklı layout pattern | Portal, Schemas, Routing, Templates | 🟡 Orta |
| 3.4.12 | **Billing useRouter wrong module** — `next/navigation` yerine `@/i18n/navigation` | `dashboard/src/app/[locale]/dashboard/billing/page.tsx` | 🟡 Orta |
| 3.4.13 | **`getErrorMessage` inconsistent usage** — Bazı catch'ler inline, bazıları utility | `dashboard/src/lib/errors.ts` | 🟡 Orta |
| 3.4.14 | **Error messages translated değil** — `getErrorMessage` raw English döndürüyor | `dashboard/src/lib/errors.ts` | 🟡 Orta |
| 3.4.15 | **`weeklyDigest` state local-only** — API payload'a eklenmiyor, sessizce düşüyor | `dashboard/src/app/[locale]/dashboard/settings/page.tsx` | 🟡 Orta |
| 3.4.16 | **`keyCount` translation broken pluralization** — `"3 key"` instead of `"3 keys"` | `dashboard/src/app/[locale]/dashboard/api-keys/page.tsx` | 🟡 Orta |
| 3.4.17 | **13 tablo `overflow-x-auto` olmadan** — docs, alternatives, privacy sayfaları | docs/*, alternatives/*, privacy | 🟡 Orta |
| 3.4.18 | **8 `<pre>` bloğu `overflow-x-auto` olmadan** — docs sayfaları | docs/* | 🟡 Orta |
| 3.4.19 | **`any` type usage — 15+ production code** — Type safety eksik | Çeşitli | 🟡 Orta |
| 3.4.20 | **useEffect dependency array eksiklikleri** — 4+ yerde boş `[]` ama dependency eksik | Onboarding, Playground | 🟡 Orta |
| 3.4.21 | **Inbound page unused loading variable** — `const [_loading, setLoading]` | `dashboard/src/app/[locale]/dashboard/inbound/page.tsx` | 🟢 Düşük |
| 3.4.22 | **Duplicate StatusBadge** — `components/StatusBadge.tsx` + `components/tremor/StatusBadge.tsx` | Component duplication | 🟢 Düşük |
| 3.4.23 | **Onboarding + OnboardingWizard overlap** — ikisi birden render ediliyor | Dashboard page | 🟢 Düşük |
| 3.4.24 | **AnimatedCounter negative values** — ara değerler tuhaf görünebilir | `dashboard/src/components/` | 🟢 Düşük |
| 3.4.25 | **Playground history localStorage size limit yok** | `dashboard/src/app/[locale]/dashboard/playground/page.tsx` | 🟢 Düşük |
| 3.4.26 | **Route-level `loading.tsx` yok** — dashboard sayfa geçişlerinde indicator yok | `dashboard/src/app/[locale]/dashboard/` | 🟢 Düşük |
| 3.4.27 | **Endpoints detail page hand-rolled modal** — ConfirmDialog kullanılmalı | `dashboard/src/app/[locale]/dashboard/endpoints/[id]/page.tsx` | 🟢 Düşük |
| 3.4.28 | **Logs page status counts current page only** — yanıltıcı | `dashboard/src/app/[locale]/dashboard/logs/page.tsx` | 🟢 Düşük |
| 3.4.29 | **Billing cancel modal state reset yok** — `cancelling` state kalmış | `dashboard/src/app/[locale]/dashboard/billing/page.tsx` | 🟢 Düşük |
| 3.4.30 | **Notification API field mismatch** — `email_on_success` generic toggle'a mapleniyor | `dashboard/src/app/[locale]/dashboard/settings/page.tsx` | 🟢 Düşük |
| 3.4.31 | **Missing `autoComplete` on confirm password** — Password manager sorunu | `dashboard/src/app/[locale]/dashboard/settings/page.tsx` | 🟢 Düşük |
| 3.4.32 | **Mobile sidebar toggle `aria-expanded` eksik** | `dashboard/src/app/[locale]/dashboard/layout.tsx` | 🟢 Düşük |
| 3.4.33 | **Date formatting not locale-aware** — `toLocaleDateString()` browser locale kullanıyor | Team page | 🟢 Düşük |
| 3.4.34 | **ErrorBoundary shows raw error message** — Technical details kullanıcıya gösteriliyor | `dashboard/src/components/ErrorBoundary.tsx` | 🟢 Düşük |
| 3.4.35 | **Global error page generic message** — Client/server error ayrımı yok | `dashboard/src/app/[locale]/error.tsx` | 🟢 Düşük |

## 3.5 Mega Component Refactoring

| # | Sorun | Dosya | Durum |
|---|-------|-------|-------|
| 3.5.1 | `playground/page.tsx` — 695 satır | ⬜ |
| 3.5.2 | `OnboardingWizard.tsx` — 649 satır | ⬜ |
| 3.5.3 | `dashboard/page.tsx` — 586 satır | ⬜ |
| 3.5.4 | `deliveries/[id]/page.tsx` — 547 satır | ⬜ |
| 3.5.5 | `billing/page.tsx` — 494 satır | ⬜ |
| 3.5.6 | `endpoints/[id]/page.tsx` — 446 satır | ⬜ |
| 3.5.7 | `settings/page.tsx` — 441 satır | ⬜ |
| 3.5.8 | `portal-customize/page.tsx` — 402 satır | ⬜ |
| 3.5.9 | `retry-policy/page.tsx` — 355 satır | ⬜ |
| 3.5.10 | `team/page.tsx` — 339 satır | ⬜ |
| 3.5.11 | `api-importer/page.tsx` — 336 satır | ⬜ |
| 3.5.12 | `api-keys/page.tsx` — 332 satır | ⬜ |
| 3.5.13 | `status/page.tsx` — 699 satır | ⬜ |
| 3.5.14 | `playground/page.tsx` (public) — 911 satır | ⬜ |
| 3.5.15 | `blog/[slug]/page.tsx` — 308 satır (1922'den düşürüldü) | ✅ Yapıldı (Oturum 93) |

## 3.6 Dependencies & Config (DEEP-DEPS-CONFIG.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 3.6.1 | **Unused dependencies** — `cookie`, `async-stream`, `aes-gcm` kodda hiç kullanılmıyor | `api/Cargo.toml` | 🟡 Orta |
| 3.6.2 | **`totp-rs` ve `base32` import yok** — 2FA implementasyonu eksik | `api/Cargo.toml` | 🟡 Orta |
| 3.6.3 | **Docker dev image `rust:1-bookworm`** — sabit version yok | `Dockerfile.api` (dev) | 🟡 Orta |
| 3.6.4 | **Worker dev Dockerfile `rust:slim`** — ne version ne distro belirtilmemiş | `Dockerfile.worker` (dev) | 🟡 Orta |
| 3.6.5 | **`opentelemetry-otlp` duplicate transport** — http-proto + grpc-tonic ikisi birden | `api/Cargo.toml` | 🟡 Orta |
| 3.6.6 | **`recharts` ~200KB gzipped** — D3 tabanlı, alternatif düşünülmeli | `dashboard/package.json` | 🟡 Orta |
| 3.6.7 | **`lucide-react` unused ama install ediliyor** — ~150KB wasted | `dashboard/package.json` | ✅ Yapıldı (Oturum 85) |
| 3.6.8 | **ESLint 8 + Next.js 15 uyumsuzluğu** — eslint-config-next 15 ile ESLint 8 çakışıyor | `dashboard/package.json` | ✅ Yapıldı (Oturum 93) |
| 3.6.9 | **`@modelcontextprotocol/sdk` çok eski** — güncel sürüm 1.9+ | `mcp/package.json` | 🟢 Düşük |

---

# ═══════════════════════════════════════════
# AŞAMA 4 — DATABASE SORUNLARI
# ═══════════════════════════════════════════
# Süre: 1 gün | Öncelik: YÜKSEK

## 4.1 DB Schema & Constraints

| # | Sorun | Durum |
|---|-------|-------|
| 4.1.1 | CHECK constraint'ler eksik — invalid status girilebilir | ✅ Yapıldı (Oturum 81) |
| 4.1.2 | `webhook_queue`'da FK eksik | ✅ Yapıldı (Oturum 81) |
| 4.1.3 | 20+ eksik DB index — yavaş query'ler | ✅ Yapıldı (Oturum 87) |
| 4.1.4 | `updated_at` trigger'ları eksik | ✅ Yapıldı (Oturum 87) |
| 4.1.5 | UNIQUE constraint'ler eksik | ✅ Yapıldı (Oturum 87) |
| 4.1.6 | Delivery index eksik (`customer_id, created_at DESC`) | ✅ Yapıldı (Oturum 87) |

## 4.2 ⬜ KALAN DB — Henüz Yapılmadı

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 4.2.1 | **İki migration sistemi senkron değil** — standalone SQL vs embedded Rust | `api/migrations/` + `api/src/db.rs` | 🟡 Yüksek |
| 4.2.2 | **Hardcoded DB credentials in migration scripts** | `api/migrations/` | 🟡 Yüksek |
| 4.2.3 | **Missing indexes on hot paths** — unbounded queries | `api/src/db.rs` | 🟡 Orta |
| 4.2.4 | **Suboptimal queries** — missing composite indexes | `api/src/db.rs` | 🟡 Orta |
| 4.2.5 | **Schema registry'de enum/oneOf/format desteklenmiyor** | `api/src/routes/schemas.rs` | 🟢 Düşük |
| 4.2.6 | **WebSocket'te server-initiated ping eksik** | `api/src/ws/` | 🟢 Düşük |

## 4.3 DB Test Coverage

| # | Sorun | Durum |
|---|-------|-------|
| 4.3.1 | `db.rs` (1029 satır) test yok | ✅ Yapıldı (Oturum 113) — 10 unit + 7 integration test |
| 4.3.2 | `delivery/mod.rs` (404 satır) test yok | ✅ Yapıldı (Oturum 113) — 12 yeni test |
| 4.3.3 | `worker/main.rs` (807 satır) test yok | ✅ Yapıldı (Oturum 113) — 16 yeni test |

---

# ═══════════════════════════════════════════
# AŞAMA 5 — İ18N & ÇEVİRİ
# ═══════════════════════════════════════════
# Süre: 1-2 gün | Öncelik: YÜKSEK

## 5.1 Dashboard i18n

| # | Sorun | Durum |
|---|-------|-------|
| 5.1.1 | 920+ hardcoded İngilizce string — i18n eksik | ✅ Yapıldı (Oturum 98-100, 115) — EN=1829, TR=1829, 0 eksik |
| 5.1.2 | 6 kaldırıldı (de/ja/pt-BR/es/fr/ko), sadece en + tr | ✅ Yapıldı (Oturum 99) |
| 5.1.3 | 30 dosyadaki useTranslations quote hatası düzeltildi | ✅ Yapıldı (Oturum 103) |
| 5.1.4 | 6 kullanılmayan dil dosyası silindi | ✅ Yapıldı (Oturum 103) |

## 5.2 ⬜ KALAN İ18N — Henüz Yapılmadı

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 5.2.1 | **Admin paneli çevirileri** — sidebar, header, content İngilizce | Admin sayfaları (Aşama 2'ye bak) | 🔴 Kritik (Aşama 2'de) |
| 5.2.2 | **Email template'leri sadece İngilizce** — TR kullanıcılarına İngilizce email | `api/src/email.rs` | 🟡 Yüksek |
| 5.2.3 | **14+ sayfada hardcoded string'ler** — Health, Alerts, Rate Limiting, Signature Verifier, SSO, Audit Log, Custom Domain, Retry Policy, Routing, Schemas, Templates, Portal, Webhook Builder, API Importer | Çeşitli sayfalar | 🟡 Yüksek |
| 5.2.4 | **Blog, changelog, docs content İngilizce** — /tr/ altında bile İngilizce | Content pages | 🟡 Orta |
| 5.2.5 | **Alternatives sayfaları (8 sayfa) tamamen İngilizce** — SEO için kasıtlı olabilir | `dashboard/src/app/[locale]/alternatives/` | 🟡 Orta |
| 5.2.6 | **ConfirmDialog hardcoded strings** — "Confirm", "Cancel", "Processing..." | `dashboard/src/components/ConfirmDialog.tsx` | 🟡 Orta |
| 5.2.7 | **EmailVerificationBanner hardcoded strings** — "Verification email sent!", "Failed to send." | `dashboard/src/components/EmailVerificationBanner.tsx` | 🟡 Orta |
| 5.2.8 | **SdkTabs hardcoded strings** — "Copy", "Copied!" | `dashboard/src/components/SdkTabs.tsx` | 🟡 Orta |
| 5.2.9 | **Tarih formatı İngilizce** — Admin sayfalarında MM/DD/YYYY | Admin sayfaları | 🟡 Orta |
| 5.2.10 | **getStarted.* section — 56 key eksik** (sadece EN'de var) | `dashboard/src/messages/` | 🟡 Orta |
| 5.2.11 | **onboarding.* section — 32 key eksik** | `dashboard/src/messages/` | 🟡 Orta |

## 5.3 Landing Page & Content

| # | Sorun | Durum |
|---|-------|-------|
| 5.3.1 | Türkçe çeviri hataları ("APIimize", "Ölü Mektup Kuyruğu") | ✅ Yapıldı (Oturum 93) |
| 5.3.2 | FAQ eksik — SEO featured snippets kaybı | ✅ Yapıldı (Oturum 90) |
| 5.3.3 | Müşteri hikayeleri kurgusal — yasal risk | ✅ Yapıldı (Oturum 111) — disclaimer eklendi |

## 5.4 ⬜ KALAN CONTENT — Henüz Yapılmadı

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 5.4.1 | **Landing page zero social proof** — testimonial, müşteri logosu yok | `dashboard/src/app/[locale]/page.tsx` | 🟡 Yüksek |
| 5.4.2 | **Content quality score: 6.5/10** — messaging gaps, inconsistencies | Landing, Blog, Docs | 🟡 Orta |
| 5.4.3 | **Blog factual errors** — compare page ile çelişki | Blog pages | 🟡 Orta |
| 5.4.4 | **Landing page conversion elements eksik** — CTA zayıf | `dashboard/src/app/[locale]/page.tsx` | 🟡 Orta |
| 5.4.5 | **Trust signals eksik** — security badges, uptime guarantee | Landing page | 🟡 Orta |

---

# ═══════════════════════════════════════════
# AŞAMA 6 — ERİŞİLEBİLİRLİK (A11Y) & SEO
# ═══════════════════════════════════════════
# Süre: 2-3 gün | Öncelik: ORTA

## 6.1 Kritik A11Y Sorunları

| # | Sorun | Etki | Durum |
|---|-------|------|-------|
| 6.1.1 | **23 yerde `<label>` + `<input>` `htmlFor`/`id` eşleşmesi eksik** | Form erişilebilirliği yok | ⬜ |
| 6.1.2 | **`aria-live` region hiç yok** | Ekran okuyucu dinamik içerik güncelleyemiyor | ⬜ |
| 6.1.3 | **Icon-only butonlarda `aria-label` eksik** — close, copy, pagination | Ekran okuyucu butonun amacını bilmiyor | ⬜ |
| 6.1.4 | **Toggle'larda `role="switch"` yok** — Settings, Portal, Retry Policy | Ekran okuyucu toggle'ı buton sanıyor | ⬜ |
| 6.1.5 | **Status dots text alternative yok** — Activity Feed, Health | Renk bağımlı bilgi | ⬜ |
| 6.1.6 | **Sidebar links `aria-current` yok** — active page belirsiz | Ekran okuyucu hangi sayfada olduğunu bilmiyor | ⬜ |
| 6.1.7 | **Skip-to-content link'i yok** | Klavye kullanıcıları her seferinde sidebar'dan geçmek zorunda | ⬜ |
| 6.1.8 | **`<div onClick>` — keyboard erişilebilirliği yok** (10+ yer) | Billing, Settings, Team, API Keys, Deliveries, Logs, Admin | ⬜ |
| 6.1.9 | **Modal close button `aria-label` eksik** | Ekran okuyucu ✕ butonunun ne yaptığını bilmiyor | ⬜ |
| 6.1.10 | **Pagination `aria-label` eksik** | "Previous" / "Next" yetersiz | ⬜ |
| 6.1.11 | **Copy button `aria-label` eksik** | Clipboard icon text alternative yok | ⬜ |
| 6.1.12 | **Heading hierarchy tutarsız** — bazı sayfalarda h2/h3 düzensiz | Sayfa yapısı belirsiz | ⬜ |
| 6.1.13 | **Grafik SVG `<title>` ve `<desc>` boş** — Revenue, Analytics | Grafik erişilebilirliği yok | ⬜ |
| 6.1.14 | **Forms `aria-describedby` eksik** — Hata mesajları input'a bağlı değil | Ekran okuyucu hata mesajını input ile ilişkilendiremiyor | ⬜ |
| 6.1.15 | **Alert element boş render edilmiş** — `role="alert"` var ama içerik yok | Ekran okuyucu boş alert duyuruyor | ⬜ |
| 6.1.16 | **Renk bağımlı bilgi (System sayfası)** — Durum sadece renk + badge | Renk körlüğü olan kullanıcılar ayırt edemiyor | ⬜ |

## 6.2 Yüksek A11Y Sorunları

| # | Sorun | Durum |
|---|-------|-------|
| 6.2.1 | Contrast fail: `text-gray-400` empty state'lerde (2.54:1) | ⬜ |
| 6.2.2 | Contrast fail: logout butonu dark mode (3.75:1) | ⬜ |
| 6.2.3 | SkeletonCard/SkeletonTable dark mode desteği yok | ⬜ |
| 6.2.4 | Form input autoComplete eksik (password fields) | ⬜ |
| 6.2.5 | `dangerouslySetInnerHTML` (4 kullanım) — XSS güvenli ama CSP bypass vektörü | ⬜ |
| 6.2.6 | Dark mode eksik (portal, routing, schemas, templates sayfaları) | ✅ Yapıldı (Oturum 86) — 101/104 |
| 6.2.7 | Footer eksik (birçok sayfa) | ✅ Yapıldı (Oturum 86) — Layout'larda |
| 6.2.8 | Toggle accessibility `role="switch"` eksik | ✅ Yapıldı (Oturum 86) |
| 6.2.9 | Delete modal focus trap | ✅ Yapıldı (Oturum 86) — Zaten mevcut |

## 6.3 SEO Sorunları

| # | Sorun | Durum |
|---|-------|-------|
| 6.3.1 | **71 sayfada metadata eksik** — title, description | ⬜ |
| 6.3.2 | Document title Türkçe değil (Admin sayfaları) | ⬜ |
| 6.3.3 | JSON-LD structured data eksik (landing, pricing) | ⬜ |
| 6.3.4 | Open Graph tags eksik | ⬜ |

## 6.4 CSS & Responsive

| # | Sorun | Durum |
|---|-------|-------|
| 6.4.1 | 13 tablo `overflow-x-auto` olmadan — mobil taşma | ✅ Yapıldı (Oturum 85) |
| 6.4.2 | `lucide-react` hiç kullanılmıyor (~150KB wasted) | ✅ Yapıldı (Oturum 85) |
| 6.4.3 | Admin Revenue mobile responsive tamamen bozuk | ⬜ (Aşama 2'de) |
| 6.4.4 | Border radius inconsistency (Admin Settings) | ⬜ |
| 6.4.5 | Input padding inconsistency (Admin Settings) | ⬜ |
| 6.4.6 | Save button color mismatch (Admin Settings) | ⬜ |

---

# ═══════════════════════════════════════════
# AŞAMA 7 — PERFORMANS & OPTİMİZASYON
# ═══════════════════════════════════════════
# Süre: 1-2 gün | Öncelik: ORTA

## 7.1 Bundle & Loading

| # | Sorun | Durum |
|---|-------|-------|
| 7.1.1 | **Recharts ~400KB eagerly loaded** — dashboard yavaş açılıyor | ⬜ |
| 7.1.2 | **Tüm sayfalar 'use client' CSR** — SSR/SSG yok | ⬜ |
| 7.1.3 | **Caching yok, prefetching yok** — API çağrıları tekrarlanıyor | ⬜ |
| 7.1.4 | **`blog/[slug]` 1922 satır mega component** | ✅ Yapıldı (Oturum 93) — 308 satır |
| 7.1.5 | **`'use client'` oranı %45.8** — çok yüksek | ⬜ |

## 7.2 Monitoring & Observability

| # | Sorun | Durum |
|---|-------|-------|
| 7.2.1 | Custom metric yok — sadece trace var | ✅ Yapıldı (Oturum 89) |
| 7.2.2 | Simple exporter (sync) — batch exporter kullanılmalı | ✅ Yapıldı (Oturum 89) |
| 7.2.3 | Sampling strategy yok — tüm trace'ler export ediliyor | ✅ Yapıldı (Oturum 89) |
| 7.2.4 | Response body PII trace'de loglanıyor | ✅ Yapıldı (Oturum 89) |

## 7.3 Code Quality

| # | Sorun | Durum |
|---|-------|-------|
| 7.3.1 | **Signing/crypto logic 6+ kez duplicated** — `api/src/signing.rs` + `worker/src/signing.rs` + 11 SDK | ⬜ |
| 7.3.2 | **Billing provider integrations near-identical** — Stripe, Polar, iyzico copy-paste | ⬜ |
| 7.3.3 | **67+ fonksiyon 100 satırı aşıyor** — en kötü 400-700+ satır | ⬜ |
| 7.3.4 | **Duplicate StatusBadge component** | ⬜ |
| 7.3.5 | **Two overlapping onboarding components** | ⬜ |

---

# ═══════════════════════════════════════════
# AŞAMA 8 — GDPR & UYUMLULUK
# ═══════════════════════════════════════════
# Süre: 1 gün | Öncelik: ORTA

## 8.1 GDPR Kritik

| # | Sorun | Durum |
|---|-------|-------|
| 8.1.1 | **Kayıt'ta consent mekanizması yok** — ToS/Privacy Policy kabulü yok | ⬜ |
| 8.1.2 | **Consent records tablosu yok** — ne zaman/how consent verildiği kayıtlı değil | ⬜ |
| 8.1.3 | **Cookie consent banner yok** — GDPR ihlali | ⬜ |
| 8.1.4 | **Withdrawal of consent mekanizması yok** | ⬜ |

## 8.2 GDPR Orta

| # | Sorun | Durum |
|---|-------|-------|
| 8.2.1 | `source_ip` ve `request_headers` deliveries'da PII — consent olmadan toplanıyor | ⬜ |
| 8.2.2 | `user_agent` audit_log'da potentially excessive | ⬜ |
| 8.2.3 | Data retention policy otomasyonu yok | ⬜ |

---

# ═══════════════════════════════════════════
# AŞAMA 9 — EMAIL SİSTEMİ
# ═══════════════════════════════════════════
# Süre: 1 gün | Öncelik: ORTA

## 9.1 Email Sorunları

| # | Sorun | Durum |
|---|-------|-------|
| 9.1.1 | **Email template'leri sadece İngilizce** | ⬜ |
| 9.1.2 | **Email retry yok** — başarısız gönderim sessizce düşüyor | ⬜ |
| 9.1.3 | **Dead-letter queue yok** failed emails için | ⬜ |
| 9.1.4 | **Email-level rate limiting yok** — API rate limit var ama email throttle yok | ⬜ |
| 9.1.5 | **Billing/Invoice email template'i yok** | ⬜ |
| 9.1.6 | **Webhook Success email template'i yok** | ⬜ |
| 9.1.7 | **Email template'leri mobile-optimized değil** — media query yok | ⬜ |
| 9.1.8 | **Resend entegrasyonu tamamlandı** — EmailProvider sistemi çalışıyor | ✅ Yapıldı (Oturum 103) |
| 9.1.9 | **Email adresleri düzeltildi** — onboarding@resend.dev | ✅ Yapıldı (Oturum 103) |

---

# ═══════════════════════════════════════════
# AŞAMA 10 — SDK & DOKÜMANTASYON
# ═══════════════════════════════════════════
# Süre: 1 gün | Öncelik: DÜŞÜK

## 10.1 SDK Durumu

| # | Sorun | Durum |
|---|-------|-------|
| 10.1.1 | 3 farklı API URL tutarsızlığı | ✅ Yapıldı (Oturum 83) |
| 10.1.2 | Kotlin SDK generic crash (TypeToken erasure) | ✅ Yapıldı (Oturum 83) |
| 10.1.3 | 6 SDK'da `X-Hookrelay-Signature` legacy header | ✅ Yapıldı (Oturum 83) |
| 10.1.4 | CLI `HOOKRELAY_*` env vars → `HOOKSNIFF_*` | ✅ Yapıldı (Oturum 83) |
| 10.1.5 | 11 SDK'da retry logic yok | ✅ Yapıldı (Oturum 96) |
| 10.1.6 | OpenAPI schema vs actual API mismatch | ✅ Yapıldı (Oturum 97) |
| 10.1.7 | Version mismatch (Kotlin) | ✅ Yapıldı (Oturum 97) |
| 10.1.8 | 11/11 SDK wrapper + imza doğrulama | ✅ Yapıldı (Oturum 114) |
| 10.1.9 | 11/11 SDK serialization layer | ✅ Yapıldı (Oturum 115) |
| 10.1.10 | 11/11 SDK yayınlandı | ✅ Yapıldı (Oturum 112) |

## 10.2 ⬜ KALAN SDK — Henüz Yapılmadı

| # | Sorun | Öncelik |
|---|-------|---------|
| 10.2.1 | **SDK endpoint coverage eksik** — Auth, API Keys, Alerts, Analytics, Notifications, Devices, Teams, Billing, Templates, Schemas, Routing endpoint'leri SDK'da yok | 🟡 Orta |
| 10.2.2 | **SDK otomatik güncelleme sistemi yok** | 🟢 Düşük |
| 10.2.3 | **tracing-opentelemetry vendor patch** — upstream 0.33 bekleniyor | 🟢 Düşük |

## 10.3 OpenAPI Spec

| # | Sorun | Durum |
|---|-------|-------|
| 10.3.1 | Spec eksik endpoint'ler — code'da var ama spec'te yok | ⬜ |
| 10.3.2 | Yanlış type definitions — SDK'lar hatalı client üretebilir | ⬜ |

---

# ═══════════════════════════════════════════
# AŞAMA 11 — BACKEND DERİN SORUNLAR
# ═══════════════════════════════════════════
# Süre: 1-2 gün | Öncelik: DÜŞÜK-ORTA

## 11.1 Billing & Payments

| # | Sorun | Durum |
|---|-------|-------|
| 11.1.1 | Proration yok — mid-cycle upgrade adaletsiz | ✅ Yapıldı (Oturum 88) |
| 11.1.2 | Grace period yok — ödeme başarısızlığında anında downgrade | ✅ Yapıldı (Oturum 88) |
| 11.1.3 | Downgrade'de endpoint cleanup yok | ✅ Yapıldı (Oturum 88) |

## 11.2 ⬜ KALAN BACKEND — Payments (deep-payments.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 11.2.1 | **Subscription status hardcoded to "active"** — Her zaman active döndürüyor | `api/src/routes/billing.rs` | 🔴 Kritik |
| 11.2.2 | **Pricing page shows different limits than backend** — Frontend/backend tutarsız | `dashboard/src/app/[locale]/pricing/page.tsx` | 🟡 Yüksek |
| 11.2.3 | **Provider switching doesn't cancel old subscription** — Stripe→Polar geçişinde eski abonelik kalmış | `api/src/routes/billing.rs` | 🟡 Yüksek |
| 11.2.4 | **Polar.sh `create_customer_portal` is a stub** — Çalışmıyor | `api/src/billing/polar.rs` | 🟡 Yüksek |
| 11.2.5 | **No chargeback/refund handling** | `api/src/routes/billing.rs` | 🟡 Orta |
| 11.2.6 | **Admin revenue calculation is estimation only** — Gerçek hesaplama yok | `api/src/routes/admin.rs` | 🟡 Orta |
| 11.2.7 | **`webhook_count` uses `i32` — overflow risk at 2.1B** | `api/src/db.rs` | 🟡 Orta |
| 11.2.8 | **No webhook failure alerting** — Başarısız webhook'lar bildirilmiyor | `worker/src/` | 🟡 Orta |
| 11.2.9 | **No annual billing option** — Sadece aylık | `api/src/routes/billing.rs` | 🟢 Düşük |
| 11.2.10 | **Enterprise plan has no implementation** | `api/src/routes/billing.rs` | 🟢 Düşük |
| 11.2.11 | **Missing `cancel_at_period_end` logic** — Dönem sonunda iptal yok | `api/src/routes/billing.rs` | 🟢 Düşük |
| 11.2.12 | **Upgrade flow doesn't validate plan transition** — Herhangi bir plana geçiş yapılabilir | `api/src/routes/billing.rs` | 🟡 Orta |
| 11.2.13 | **Checkout URL validation is client-side only** — Server-side doğrulama yok | `dashboard/src/app/[locale]/dashboard/billing/page.tsx` | 🟡 Orta |

## 11.3 ⬜ KALAN BACKEND — Database (deep-database.md, deep-db-queries.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 11.3.1 | **`password_hash` column allows NULL** — Account takeover risk | `api/migrations/` | 🔴 Kritik |
| 11.3.2 | **Missing migration files — 13 SQL files absent** — Embedded Rust'ta var ama disk'te yok | `api/migrations/` | 🔴 Kritik |
| 11.3.3 | **Hardcoded DB credentials in migration scripts** | `api/migrations/` | 🔴 Kritik |
| 11.3.4 | **TOTP secret exposure in `customers` table** — `totp_secret` column | `api/migrations/` | 🟡 Yüksek |
| 11.3.5 | **`dead_letters` missing FK on `delivery_id`** | `api/migrations/` | 🟡 Yüksek |
| 11.3.6 | **`webhook_queue` references `delivery_id` without FK** | `api/migrations/` | 🟡 Yüksek |
| 11.3.7 | **`teams.owner_id` missing ON DELETE behavior** | `api/migrations/` | 🟡 Orta |
| 11.3.8 | **`installed_agents` missing ON DELETE CASCADE** | `api/migrations/` | 🟡 Orta |
| 11.3.9 | **`fanout_rules.target_ids` UUID array without FK validation** | `api/migrations/` | 🟡 Orta |
| 11.3.10 | **`sso_configs.client_secret_encrypted` — encryption not verified** | `api/migrations/` | 🟡 Orta |
| 11.3.11 | **Missing composite index on `deliveries(endpoint_id, status)`** | `api/migrations/` | 🟡 Orta |
| 11.3.12 | **Missing index on `deliveries(created_at)` for time-range queries** | `api/migrations/` | 🟡 Orta |
| 11.3.13 | **Missing index on `delivery_attempts(created_at)`** | `api/migrations/` | 🟡 Orta |
| 11.3.14 | **`payment_transactions.amount_cents` uses INT** — overflow risk | `api/migrations/` | 🟡 Orta |
| 11.3.15 | **`dead_letters` missing index on `endpoint_id`** | `api/migrations/` | 🟡 Orta |
| 11.3.16 | **`idempotency_keys` — no automatic cleanup** — Tablo şişer | `api/migrations/` | 🟡 Orta |
| 11.3.17 | **`password_reset_tokens` — no index on `expires_at`** — Cleanup yavaş | `api/migrations/` | 🟢 Düşük |
| 11.3.18 | **`refresh_tokens` — no index on `expires_at`** — Cleanup yavaş | `api/migrations/` | 🟢 Düşük |
| 11.3.19 | **`email_verification_tokens` — no index on `expires_at`** | `api/migrations/` | 🟢 Düşük |
| 11.3.20 | **`notifications` — no cleanup strategy** — Tablo şişer | `api/migrations/` | 🟢 Düşük |
| 11.3.21 | **İki migration sistemi senkron değil** — standalone SQL vs embedded Rust | `api/migrations/` + `api/src/db.rs` | 🟡 Orta |
| 11.3.22 | **Unbounded queries** — LIMIT/OFFSET yok bazı sorgularda | `api/src/db.rs` | 🟡 Orta |

## 11.4 ⬜ KALAN BACKEND — Code Quality (deep-code-quality.md)

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 11.4.1 | **Signing/crypto logic 6+ kez duplicated** — `api/src/signing.rs` + `worker/src/signing.rs` + 11 SDK | `api/src/`, `worker/src/`, `sdks/` | 🟡 Yüksek |
| 11.4.2 | **Billing provider triplication** — Stripe, Polar, iyzico near-identical | `api/src/billing/` | 🟡 Yüksek |
| 11.4.3 | **Tight coupling: `api/src/main.rs` monolith** — Tüm modüller tek dosyada | `api/src/main.rs` | 🟡 Orta |
| 11.4.4 | **Missing shared crate between API and worker** — Kod tekrarı | Cargo workspace | 🟡 Orta |
| 11.4.5 | **Excessive `clone()` — 190 occurrences** — Memory allocation overhead | `api/src/` | 🟡 Orta |
| 11.4.6 | **`any` type usage — 15+ in production code** — Type safety eksik | `api/src/` | 🟡 Orta |
| 11.4.7 | **67+ fonksiyon 100 satırı aşıyor** — en kötü 400-700+ satır | Çeşitli | 🟡 Orta |
| 11.4.8 | **Magic numbers** — Sabit değerler named constant olmalı | Çeşitli | 🟢 Düşük |
| 11.4.9 | **Excessive `unwrap()` in production code** — Panic riski | `api/src/` | 🟢 Düşük |

## 11.5 ⬜ KALAN BACKEND — Genel

| # | Sorun | Dosya | Öncelik |
|---|-------|-------|---------|
| 11.5.1 | **Single-queue design** — high-volume customers head-of-line blocking | `api/src/db.rs` | 🟡 Orta |
| 11.5.2 | **No request ID / correlation ID** error responses'da | `api/src/error.rs` | 🟡 Orta |
| 11.5.3 | **No error catalog/enum on frontend** — server-side error codes var ama shared schema yok | Frontend + Backend | 🟡 Orta |
| 11.5.4 | **`BadRequest` messages developer-facing** — user-facing olmalı | `api/src/routes/` | 🟢 Düşük |
| 11.5.5 | **No `409 Conflict` variant** — "Email already registered" 400 döndürüyor | `api/src/error.rs` | 🟢 Düşük |
| 11.5.6 | **Retry policy default'ları aggressive** — max 10 attempt, exponential backoff | `api/src/retry_policy/` | 🟢 Düşük |
| 11.5.7 | **OpenAPI spec eksik endpoint'ler** — Code'da var ama spec'te yok | `docs/openapi.yaml` | 🟡 Orta |
| 11.5.8 | **OpenAPI wrong type definitions** — SDK'lar hatalı client üretebilir | `docs/openapi.yaml` | 🟡 Orta |
| 11.5.9 | **No dashboard tests in CI** — Frontend testleri CI'da yok | `.github/workflows/ci.yml` | 🟡 Orta |
| 11.5.10 | **Batch endpoint allows up to 100 webhooks per request** — Abuse riski | `api/src/routes/` | 🟡 Orta |

---

# ═══════════════════════════════════════════
# AŞAMA 12 — DÜŞÜK ÖNCELİK & POLISH
# ═══════════════════════════════════════════
# Süre: 1 gün | Öncelik: DÜŞÜK

## 12.1 Git & Repository

| # | Sorun | Durum |
|---|-------|-------|
| 12.1.1 | 6+ stale branch temizlenmemiş | ✅ Yapıldı (Oturum 93) |
| 12.1.2 | 20+ açık Dependabot PR merge edilmemiş | ✅ Yapıldı (Oturum 93) |
| 12.1.3 | Commit convention tutarsız | ✅ Yapıldı (Oturum 93) |
| 12.1.4 | ESLint 8→9 migration | ✅ Yapıldı (Oturum 93) |

## 12.2 ⬜ KALAN POLISH — Henüz Yapılmadı

| # | Sorun | Öncelik |
|---|-------|---------|
| 12.2.1 | Sidebar navigation order iyileştirme | 🟢 Düşük |
| 12.2.2 | Footer component dashboard'da kullanılmıyor | 🟢 Düşük |
| 12.2.3 | Emoji icon'lar `aria-hidden` ile işaretlenmeli | 🟢 Düşük |
| 12.2.4 | Empty state illüstrasyonları ekleme | 🟢 Düşük |
| 12.2.5 | Grafik etkileşimleri (hover tooltip) | 🟢 Düşük |
| 12.2.6 | Tarih aralığı seçici (Revenue) | 🟢 Düşük |
| 12.2.7 | Export fonksiyonu (CSV/PDF) | 🟢 Düşük |
| 12.2.8 | Real-time update (WebSocket) | 🟢 Düşük |
| 12.2.9 | Dark mode grafik optimizasyonu | 🟢 Düşük |
| 12.2.10 | Keyboard shortcuts | 🟢 Düşük |
| 12.2.11 | Favorites/Pinned navigation | 🟢 Düşük |
| 12.2.12 | Toast dismiss button ve animation | 🟢 Düşük |
| 12.2.13 | Skip navigation link | 🟢 Düşük |
| 12.2.14 | Schemas, Templates, Portal sidebar linkleri | 🟢 Düşük |
| 12.2.15 | Zorunlu alan işaretleri (*) | 🟢 Düşük |
| 12.2.16 | Input autoComplete (password fields) | 🟢 Düşük |

---

# ═══════════════════════════════════════════
# SERVET'İN YAPMASI GEREKENLER
# ═══════════════════════════════════════════

| # | Görev | Durum |
|---|-------|-------|
| S1 | iyzico hesap aç (vergi levhası + banka hesabı) | ❌ Beklemede — iyzico pasif kalacak |
| S2 | Domain kararı | ❌ Beklemede — hooksniff.vercel.app yeterli |
| S3 | GCP SA key rotate | ⚠️ Chat'te paylaşıldı |
| S4 | GitHub PAT rotate | ⚠️ Chat'te paylaşıldı |
| S5 | GitHub Actions billing güncelle | ❌ Beklemede |
| S6 | Stripe payout + identity verification (Polar.sh) | ❌ Beklemede |
| S7 | Grafana trial upgrade (May 20'ye kadar) | ❌ Beklemede |
| S8 | Polar.sh: Stripe payout + identity verification | ❌ Beklemede |

---

# ═══════════════════════════════════════════
# ÖZET: AŞAMA BAZLI HEDEF
# ═══════════════════════════════════════════

| Aşama | İçerik | Tahmini Süre | Kritik | Yüksek | Orta | Düşük | Toplam |
|-------|--------|-------------|--------|--------|------|-------|--------|
| 1 | Güvenlik & Altyapı | 3-4 gün | 22 | 18 | 20 | 8 | **~68** |
| 2 | Admin Panel | 2-3 gün | 5 | 20 | 15 | 10 | **~50** |
| 3 | Frontend Dashboard | 3-4 gün | 14 | 16 | 25 | 15 | **~70** |
| 4 | Database | 1-2 gün | 5 | 6 | 10 | 5 | **~26** |
| 5 | i18n & Çeviri | 1-2 gün | 4 | 6 | 6 | 0 | **~16** |
| 6 | A11Y & SEO | 2-3 gün | 13 | 8 | 6 | 0 | **~27** |
| 7 | Performans | 1-2 gün | 0 | 1 | 3 | 1 | **~5** |
| 8 | GDPR | 1 gün | 2 | 2 | 3 | 0 | **~7** |
| 9 | Email | 1 gün | 0 | 3 | 4 | 2 | **~9** |
| 10 | SDK & OpenAPI | 1 gün | 0 | 0 | 3 | 1 | **~4** |
| 11 | Backend Derin | 2-3 gün | 1 | 7 | 12 | 4 | **~24** |
| 12 | Polish & Code Quality | 1-2 gün | 0 | 3 | 8 | 3 | **~14** |
| **TOPLAM** | | **~20-28 gün** | **~66** | **~90** | **~115** | **~49** | **~320** |

---

# ═══════════════════════════════════════════
# YAPILAN İŞLER (Referans — Önceki Oturumlar)
# ═══════════════════════════════════════════

| Oturum | Tarih | Yapılan İş |
|--------|-------|------------|
| 73 | 2026-05-10 | Rate limiting (4 endpoint) |
| 74 | 2026-05-10 | Webhook verification & ownership (5 sorun) |
| 75 | 2026-05-10 | Infrastructure security (4 sorun) |
| 76 | 2026-05-10 | Dashboard routing fix |
| 77 | 2026-05-10 | Frontend-Backend API uyumsuzluğu |
| 78 | 2026-05-10 | Billing & account endpoints |
| 79 | 2026-05-10 | SSRF & security hardening |
| 80 | 2026-05-10 | Worker & backend core (kısmi) |
| 81 | 2026-05-10 | Database issues |
| 82 | 2026-05-10 | Auth & crypto security |
| 83 | 2026-05-10 | SDK & config fixes |
| 84 | 2026-05-10 | Frontend search & component logic |
| 85 | 2026-05-10 | Frontend performance & bundle |
| 86 | 2026-05-10 | Accessibility & dark mode |
| 87 | 2026-05-10 | Database indexes & triggers |
| 88 | 2026-05-10 | Billing business logic |
| 89 | 2026-05-10 | Monitoring & observability |
| 90 | 2026-05-10 | i18n & content |
| 91-93 | 2026-05-10 | Worker, WS, FIFO, circuit breaker, blog refactor |
| 94 | 2026-05-10 | 12 major dependency güncellendi |
| 95 | 2026-05-11 | 4 major dependency (sqlx, redis, rand, prometheus) |
| 96 | 2026-05-11 | Staging testleri, worker fix, SDK retry |
| 97 | 2026-05-11 | Clippy, HS-082/083/084, pricing kararı |
| 98 | 2026-05-11 | i18n kampanyası — 16 sayfa useTranslations |
| 99 | 2026-05-11 | CSP hydration fix, locale restriction |
| 100 | 2026-05-11 | HS-065 i18n tamamlandı |
| 102 | 2026-05-11 | Free tier optimizasyon, Vercel analytics |
| 103 | 2026-05-11 | Resend email, email adresleri, Grafana OTEL |
| 104 | 2026-05-11 | Grafana OTEL region fix, boot test span |
| 105-106 | 2026-05-11 | OpenClac oturumları, TypeScript fix |
| 107-109 | 2026-05-11 | Cloud Run deploy debug |
| 110 | 2026-05-11 | SDK regeneration (11 SDK) |
| 111 | 2026-05-11 | SDK publish (Kotlin, PHP, Ruby, Elixir) |
| 112 | 2026-05-11 | Swift SDK ayrı repo, 11/11 SDK yayında |
| 113 | 2026-05-11 | HS-085 db.rs test, Rust 1.95.0 |
| 114 | 2026-05-11 | AŞAMA 2 wrapper + imza doğrulama (11/11 SDK) |
| 115 | 2026-05-12 | Vercel 404 fix, SDK test, AŞAMA 2.3+2.4 |

---

*Bu belge `.ai-context/visual-bugs/_consolidated/` altındaki TÜM raporlar okunarak oluşturulmuştur.*
*Hiçbir sorun atlanmamıştır. Her sorunun durumu (✅/⬜) belirtilmiştir.*
*Son güncelleme: 2026-05-12 01:30 GMT+8*
