# 🐝 HookSniff — BİRLEŞTİRİLMİŞ AKSİYON PLANI

> **Tarih:** 2026-05-10 17:18 GMT+8
> **Kaynak:** 5 dalga denetim, 13+ rapor, ~1,500+ bulgu
> **Amaç:** Tüm bulguları tek bir öncelikli aksiyon listesinde birleştir

---

## 🚨 P0 — ACİL (Bu hafta çözülmeli)

### Güvenlik Kritik
| # | Bulgu | Kaynak | Etki | Durum |
|---|-------|--------|------|-------|
| 1 | **Gerçek Grafana token .env.example'da** — base64 encoded ama decode edilebilir | deep-deps-config | 🔴 Monitoring hesabı compromised | ✅ Doğrulandı |
| 2 | **Inbound webhook signature verification optional** — secret boşsa `Ok(())` döner, her request kabul edilir (`inbound.rs:194`) | deep-api-endpoints | 🔴 Webhook spoofing | ✅ Doğrulandı |
| 3 | **verify_email rate limit yok** — brute force ile token tahmini (`auth.rs:474`) | deep-api-endpoints | 🔴 Email verification bypass | ✅ Doğrulandı |
| 4 | **verify_2fa rate limit yok** — TOTP brute force (`auth.rs:302`) | deep-api-endpoints | 🔴 2FA bypass | ✅ Doğrulandı |
| 5 | **refresh_token rate limit yok** — token stuffing saldırısı (`auth.rs:547`) | deep-api-endpoints | 🔴 Session hijacking | ✅ Doğrulandı |
| 6 | **Billing webhook secret boşsa verification atlıyor** — Stripe handler boş secret ile çalışıyor (`billing.rs:378`) | deep-api-endpoints | 🔴 Billing manipülasyonu | ✅ Doğrulandı |

### ❌ ÖNCEKİ AUDIT'TEN DÜZELTİLEN (YANLIŞ BULGULAR)
| # | Önceki Bulgu | Gerçek Durum |
|---|-------------|-------------|
| ~~1~~ | Authorization bypass — API key sadece prefix | ⚠️ KISMEN YANLIŞ — `handle_inbound` (satır 232) Argon2 kullanıyor ✅ ama `handle_inbound_to_endpoint` (satır 367) SADECE prefix lookup yapıyor, Argon2 yok ❌ |
| ~~2~~ | Token her zaman 'cookie' | ❌ YANLIŞ — `setToken('cookie')` sentinel değer. Auth HttpOnly cookie ile yapılıyor. Kasıtlı tasarım. |
| ~~3~~ | API keys cookie auth çalışmıyor | ❌ YANLIŞ — `credentials: 'include'` doğru yerde (fetch options). |
| ~~4~~ | Playground token localStorage'da | ❌ YANLIŞ — localStorage sadece request HISTORY saklıyor, token değil. |

### Altyapı Kritik
| # | Bulgu | Kaynak | Etki |
|---|-------|--------|------|
| 7 | **Concurrent delivery limit yok** — 50 eşzamanlı HTTP request, DDoS riski | deep-worker-billing | 🔴 Hedef sunucu çökmesi |
| 8 | **Throttle state in-memory** — restart'ta kaybolur, multi-instance'da bypass | deep-worker-billing | 🔴 Rate limit tamamen işlevsiz |
| 9 | **`.gitignore`'da `.env` eksik** — secret'lar repo'ya commit edilebilir | deep-deps-config | 🔴 Secret leak |
| 10 | **Contact form rate limit yok** — spam/flood saldırısı | deep-api-endpoints | 🔴 Servis kötüye kullanımı |

---

## 🔴 P1 — YÜKSEK (Bu sprint çözülmeli)

### Güvenlik Yüksek
| # | Bulgu | Kaynak |
|---|-------|--------|
| 11 | Rate limit yok: `verify-email`, `refresh`, `2fa/verify`, contact form | deep-api-endpoints |
| 12 | Schema endpoint'lerinde ownership check yok — cross-tenant data leak | deep-api-endpoints |
| 13 | Portal notification URL'lerinde SSRF riski | deep-api-endpoints |
| 14 | Playground test endpoint'inde SSRF | deep-api-endpoints |
| 15 | DNS rebinding TOCTOU açığı | deep-rust-api |
| 16 | CSP'de `'unsafe-inline'` + `'unsafe-eval'` — XSS riski | deep-deps-config |
| 17 | Git history'de OTEL credentials (base64 Grafana secrets) | deep-git-history |

### Worker/Billing Yüksek
| # | Bulgu | Kaynak |
|---|-------|--------|
| 18 | Retry'da jitter yok — thundering herd riski | deep-worker-billing |
| 19 | Error classification yok — 400/401/404 de retry ediliyor | deep-worker-billing |
| 20 | WebSocket connection limit yok — bellek tüketimi | deep-worker-billing |
| 21 | Circuit breaker modülü var ama entegre edilmemiş | deep-worker-billing |
| 22 | FIFO modülü var ama worker döngüsüne bağlanmamış | deep-worker-billing |
| 23 | Billing webhook'larda idempotency yok | deep-worker-billing |
| 24 | 3 farklı API URL (SDK tutarsızlığı) | deep-sdk-docs |
| 25 | Kotlin SDK generic crash (TypeToken erasure) | deep-sdk-docs |

### DB Yüksek
| # | Bulgu | Kaynak |
|---|-------|--------|
| 26 | İki migration sistemi senkron değil (standalone SQL vs embedded Rust) | deep-db-migrations |
| 27 | CHECK constraint'ler eksik — invalid status değerleri girilebilir | deep-db-migrations |
| 28 | webhook_queue'da FK eksik | deep-db-migrations |
| 29 | `amount_cents` INT — overflow riski, BIGINT olmalı | deep-db-migrations |

---

## 🟡 P2 — ORTA (Gelecek sprint)

### Component & UX
| # | Bulgu | Kaynak |
|---|-------|--------|
| 30 | Search'de debounce yok — her tuş vuruşunda API çağrısı | deep-component-logic |
| 31 | 63 useEffect'ten %75'inde cleanup eksik — memory leak | deep-component-logic |
| 32 | Stale closure riskleri (4 useEffect) | deep-component-logic |
| 33 | Toast'ta dismiss/aria-live yok — erişilebilirlik | deep-component-logic |
| 34 | Dual onboarding modal | deep-component-logic |
| 35 | Client-side search + server-side pagination çelişkisi | deep-component-logic |
| 36 | `lucide-react` hiç kullanılmıyor (~150KB wasted) | deep-deps-config |
| 37 | 13 tablo overflow-x-auto olmadan — mobil taşma | deep-css-styling |
| 38 | blog/[slug] 1922 satır mega component | deep-component-logic |
| 39 | dangerouslySetInnerHTML (CSP bypass) | deep-component-logic |

### Monitoring & Observability
| # | Bulgu | Kaynak |
|---|-------|--------|
| 40 | Custom metric yok — sadece trace var | deep-worker-billing |
| 41 | Simple exporter (sync) — batch exporter kullanılmalı | deep-worker-billing |
| 42 | Sampling strategy yok — tüm trace'ler export ediliyor | deep-worker-billing |
| 43 | Response body PII içerebilir — trace'de loglanıyor | deep-worker-billing |

### SDK & Dokümantasyon
| # | Bulgu | Kaynak |
|---|-------|--------|
| 44 | 11 SDK'da retry logic yok | deep-sdk-docs |
| 45 | Version mismatch (Kotlin 0.2.0 vs 0.3.0) | deep-sdk-docs |
| 46 | OpenAPI schema vs actual API mismatch | deep-sdk-docs |
| 47 | CLI `HOOKRELAY_*` env vars kullanıyor — `HOOKSNIFF_*` olmalı | deep-sdk-docs |
| 48 | 6 SDK'da `X-Hookrelay-Signature` legacy header | deep-sdk-docs |

### DB Orta
| # | Bulgu | Kaynak |
|---|-------|--------|
| 49 | 20+ eksik index — yavaş query'ler | deep-db-migrations |
| 50 | `updated_at` trigger'ları eksik (endpoints, customers) | deep-db-migrations |
| 51 | UNIQUE constraint'ler eksik (api_keys_hash, payment_transactions) | deep-db-migrations |

### Billing Orta
| # | Bulgu | Kaynak |
|---|-------|--------|
| 52 | Proration yok — mid-cycle upgrade'de adaletsizlik | deep-worker-billing |
| 53 | Grace period yok — ödeme başarısızlığında anında downgrade | deep-worker-billing |
| 54 | Downgrade'de endpoint cleanup yok | deep-worker-billing |
| 55 | Polar.sh/iyzico fatura handler'ı yok | deep-worker-billing |

### İçerik & SEO
| # | Bulgu | Kaynak |
|---|-------|--------|
| 56 | 920+ hardcoded İngilizce string — i18n eksik | deep-hardcoded-strings |
| 57 | 71 sayfada metadata eksik (SEO) | deep-a11y-seo |
| 58 | Müşteri hikayeleri kurgusal — yasal risk | deep-landing-content |
| 59 | Türkçe çeviri hataları ("APIimize", "Ölü Mektup Kuyruğu") | deep-landing-content |
| 60 | FAQ eksik — SEO featured snippets kaybı | deep-landing-content |

---

## 🟢 P3 — DÜŞÜK (Backlog)

| # | Bulgu | Kaynak |
|---|-------|--------|
| 61 | 6+ stale branch temizlenmemiş | deep-git-history |
| 62 | 20+ açık Dependabot PR merge edilmemiş | deep-git-history |
| 63 | Commit convention tutarsız | deep-git-history |
| 64 | Schema registry'de enum/oneOf/format desteklenmiyor | deep-worker-billing |
| 65 | WebSocket'te server-initiated ping eksik | deep-worker-billing |
| 66 | `next.config.js`'de `output: 'standalone'` eksik | deep-deps-config |
| 67 | HSTS header eksik | deep-deps-config |
| 68 | ESLint 8 + Next.js 15 uyumsuzluğu | deep-deps-config |
| 69 | Dark mode eksik (birçok sayfa) | deep-css-styling |
| 70 | Footer eksik (birçok sayfa) | deep-css-styling |

---

## 📊 İSTATİSTİKLER

| Öncelik | Adet | Yüzde |
|---------|------|-------|
| 🚨 P0 — Acil | 10 | %14 |
| 🔴 P1 — Yüksek | 19 | %27 |
| 🟡 P2 — Orta | 31 | %44 |
| 🟢 P3 — Düşük | 10 | %14 |
| **TOPLAM** | **70** | **100%** |

### 🔍 SON DAKİKA DÜZELTMELERİ (17:22 GMT+8)
Önceki audit'in **4 bulgusu yanlış** olarak tespit edildi:
- Authorization bypass → ❌ Argon2 doğrulaması var, prefix sadece lookup
- Token 'cookie' hatası → ❌ Kasıtlı sentinel değer, HttpOnly cookie auth
- credentials placement → ❌ Doğru yerde
- Playground localStorage token → ❌ Sadece history saklıyor

**Doğrulanan yeni bulgular:** verify_email, verify_2fa, refresh_token endpoint'lerinde rate limit eksik (3 yeni P0)

---

## 🎯 ÖNERİLEN İLK ADIMLAR (Bu hafta)

### Gün 1-2: P0 Güvenlik Düzeltmeleri
1. `inbound.rs` authorization bypass'ını düzelt — API key full hash doğrulaması ekle
2. `store.tsx` token sorununu düzelt — hardcoded `'cookie'` kaldır
3. `api-keys/page.tsx` credentials fix — `credentials: 'include'` doğru yere taşı
4. `.env.example`'daki gerçek Grafana token'ı revoke et + placeholder yap
5. `.gitignore`'a `.env` ekle

### Gün 3-4: P0 Altyapı
6. Worker'a `tokio::sync::Semaphore` ile concurrent delivery limit ekle (max 10)
7. Throttle state'i Redis'e taşı (veya PostgreSQL'e persist et)
8. Inbound/billing webhook'larda secret boşsa 403 döndür

### Gün 5: P1 Rate Limiting
9. Tüm auth endpoint'lerine rate limit middleware ekle
10. Schema endpoint'lerine ownership check ekle

---

## 📁 TÜM RAPOR DOSYALARI

| Dosya | Boyut | İçerik |
|-------|-------|--------|
| `DEEP-WORKER-BILLING.md` | 22KB | Worker, Billing, WS, FIFO, Throttle, Schema, Monitoring |
| `DEEP-API-ENDPOINTS.md` | 27KB | API endpoint güvenlik denetimi |
| `DEEP-DB-MIGRATIONS.md` | 37KB | DB şema, migration, integrity |
| `DEEP-GIT-HISTORY.md` | 10KB | Git history, branch, security |
| `DEEP-LANDING-CONTENT.md` | 22KB | Landing page, blog, içerik |
| `DEEP-RUST-API.md` | 14KB | Rust API güvenlik |
| `DEEP-COMPONENT-LOGIC.md` | 21KB | React component mantık |
| `DEEP-DEPS-CONFIG.md` | 14KB | Bağımlılık & config |
| `DEEP-TEST-COVERAGE.md` | 14KB | Test coverage |
| `DEEP-SDK-DOCS.md` | 20KB | SDK & dokümantasyon |
| `DEEP-HARDCODED-STRINGS.md` | 34KB | Hardcoded string'ler |
| `DEEP-A11Y-SEO.md` | 29KB | Erişilebilirlik & SEO |
| `DEEP-CSS-STYLING.md` | 18KB | CSS & responsive |
| `DEEP-TYPESCRIPT.md` | 18KB | TypeScript & React |
| `DEEP-SECURITY-PERF.md` | 12KB | Güvenlik & performans |
| `DEEP-I18N-JSON.md` | 2KB | Çeviri JSON |
| `WAVE4-SUMMARY.md` | 4KB | 4. dalga özet |
| `MEGA-AUDIT-2026-05-10.md` | 7KB | 3. dalga mega özet |
| **TOPLAM** | **~300KB+** | **18 rapor dosyası** |
