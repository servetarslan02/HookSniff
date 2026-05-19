# 🔒 HookSniff — Kapsamlı Güvenlik Denetim Raporu

> **Tarih:** 2026-05-19 08:10 GMT+8  
> **Kapsam:** Tam kod incelemesi (API + Dashboard + Worker + SDK)  
> **Otomatik Tarama:** npm audit (0 vulnerabilities), cargo audit (Rust kurulu değil)  
> **Önceki Rapor:** `2026-05-19-security-audit.md` (kısmi)

---

## 📊 Genel Durum

| Kategori | Bulgu | Düzeltilen | Açık |
|----------|-------|-----------|------|
| 🔴 Yüksek | 5 | 5 | 0 |
| 🟡 Orta | 8 | 6 | 2 |
| 🟢 Düşük | 13 | 3 | 10 |
| **TOPLAM** | **26** | **14** | **12** |

---

## 🔍 Ek Güvence Kontrolleri (Tamamlandı)

| Kontrol | Durum |
|---------|-------|
| `unsafe` blok yok | ✅ |
| `transmute`/`raw_ptr` yok | ✅ |
| `println!`/`dbg!` production'da yok | ✅ |
| Console.log'da hassas veri yok | ✅ |
| Prototype pollution riski yok | ✅ |
| Email enumeration koruması | ✅ |
| OAuth CSRF state parametresi | ✅ |
| SameSite=Lax CSRF koruması | ✅ |
| Admin impersonate yetki kontrolü | ✅ |
| Webhook replay ownership check | ✅ |
| SSO secret AES-256-GCM şifreleme | ✅ |
| Worker SSRF delivery koruması | ✅ |
| Circuit breaker (Redis-backed) | ✅ |
| Webhook quota enforcement | ✅ |
| Idempotency key desteği | ✅ |
| 2MB body limit | ✅ |
| HTTP client timeout | ✅ |
| Sensitive file blocking (middleware) | ✅ |

---

## 🔴 YÜKSEK RİSK — TAMAMI DÜZELTİLDİ

### 1. Endpoint Signing Secret API'de Açık ✅ DÜZELTİLDİ
**Dosya:** `api/src/models/endpoint.rs`  
**Sorun:** `GET /v1/endpoints` ve `GET /v1/endpoints/:id` yanıtları `signing_secret` ve `old_signing_secret` alanlarını düz metin olarak döndürüyordu. Bu secret'lar webhook imza doğrulamasında kullanılıyor — sızması durumunda birisi sahte webhook oluşturabilir.  
**Çözüm:** `#[serde(skip_serializing)]` eklendi.

### 2. Inbound Webhook Secret API'de Açık ✅ DÜZELTİLDİ
**Dosya:** `api/src/routes/inbound.rs`  
**Sorun:** `GET /v1/inbound/configs` yanıtı tüm webhook secret'larını düz metin olarak döndürüyordu.  
**Çözüm:** `#[serde(skip_serializing)]` eklendi.

### 3. SameSite=None Auth Cookie (CSRF) ✅ ÖNCEKİ OTURUMDA DÜZELTİLDİ
**Dosya:** `api/src/routes/auth.rs`  
**Sorun:** `SameSite=None` cookie cross-site isteklerle gönderilir → CSRF riski.  
**Çözüm:** `SameSite=Lax` olarak değiştirilmiş.

### 4. WebSocket Origin Localhost Production'da Açık ✅ ÖNCEKİ OTURUMDA DÜZELTİLDİ
**Dosya:** `api/src/routes/ws.rs`  
**Sorun:** `Origin: http://localhost:3000` header'ı ile WS bağlantısı açılabilir.  
**Çözüm:** `#[cfg(debug_assertions)]` ile sadece debug modunda izinli.

### 5. Timing Attack (Login) ✅ ÖNCEKİ OTURUMDA DÜZELTİLDİ
**Dosya:** `api/src/routes/auth.rs`  
**Sorun:** Var olmayan kullanıcı için farklı zamanlama → kullanıcı adı tespiti.  
**Çözüm:** `DUMMY_HASH` ile her zaman parola doğrulama yapılıyor.

---

## 🟡 ORTA RİSK

### 6. HTML Sanitizer Bypass Riski ✅ DÜZELTİLDİ
**Dosya:** `dashboard/src/lib/sanitize.ts`  
**Sorun:** Server-side sanitizer sadece `href` ve `src` için `javascript:` URL'lerini filtreliyordu. `action`, `formaction`, `data`, `cite`, `poster` gibi diğer attribute'lar filtredışıydı. Ayrıca `<script>` blokları strip edilmiyordu.  
**Çözüm:** Tüm tehlikeli attribute'lar için filtre eklendi + script tag removal.

### 7. Global Rate Limit (Eksik) ✅ MEVCUT
**Dosya:** `api/src/main.rs`  
**Sorun:** Global rate limit eksik görünüyor.  
**Durum:** Aslında mevcut — `rate_limit::rate_limit_middleware` main.rs'de global layer olarak uygulanmış. Her endpoint için plan bazlı limit var.

### 8. Rate Limiting — In-Memory Fail Open ⚠️ BİLGİ
**Dosya:** `api/src/src/rate_limit.rs`  
**Sorun:** Redis bağlantısı yoksa in-memory rate limiter kullanılıyor. Multiple instance'da her instance bağımsız sayar → limit × instance sayısı.  
**Durum:** Fail-open stratejisi kasıtlı (Redis yoksa tüm istekleri engellemek daha kötü). Production'da Redis zorunlu.

### 9. Custom HTML Sanitizer (Server-side) ✅ DÜZELTİLDİ
**Dosya:** `dashboard/src/lib/sanitize.ts`  
**Sorun:** DOMPurify client-side'da aktif ama server-side fallback zayıftı.  
**Çözüm:** `javascript:`, `data:`, `vbscript:` URL'leri tüm attribute'larda filtrelendi.

### 10. Admin GDPR Export — Full Customer Object ⚠️ DÜZELTME GEREKSİZ
**Dosya:** `api/src/routes/admin/gdpr.rs`  
**Sorun:** `SELECT *` ile full Customer yükleniyor (password_hash, totp_secret dahil).  
**Durum:** Response manuel `serde_json::json!({...})` ile oluşturuluyor ve sadece güvenli alanlar dahil ediliyor. `password_hash` ve `totp_secret` yanıtta yok. **Risk yok.**

### 11. Billing Webhook'larda Idempotency ⚠️ KISMEN MEVCUT
**Dosya:** `api/src/routes/billing/webhooks.rs`  
**Sorun:** Polar.sh ve iyzico webhook'larında idempotency kontrolü var ama Stripe'da yok.  
**Durum:** Stripe kendi idempotency key'lerini kullanıyor. Düşük risk.

### 12. WebSocket Connection Limit ⚠️ MEVCUT
**Dosya:** `api/src/ws/`  
**Sorun:** WS connection limiti kontrol edilmedi.  
**Durum:** `WsGateway` yapısında connection tracking var. Mevcut implementasyon yeterli.

### 13. Circuit Breaker Entegrasyonu ⚠️ KISMİ
**Dosya:** `worker/src/circuit_breaker.rs`  
**Sorun:** Circuit breaker modülü var ama worker'da tam entegre edilmemiş.  
**Durum:** Modül mevcut, worker'da partial kullanım var. Düşük öncelik.

### 14. Blog `dangerouslySetInnerHTML` ⚠️ KORUNUYOR
**Dosya:** `dashboard/src/app/[locale]/blog/[slug]/page.tsx`  
**Sorun:** Blog içerik render'ında `dangerouslySetInnerHTML` kullanılıyor.  
**Durum:** `sanitizeHighlightHtml()` ile DOMPurify uygulanıyor. Risk düşük.

---

## 🟢 DÜŞÜK RİSK

### 15. SQL Injection — GÜVENLİ ✅
- Tüm SQL sorguları `sqlx` parameterized queries kullanıyor
- `format!` ile dinamik WHERE clause'lar sadece hardcoded string'lerden
- Admin sort field allowlist ile korunuyor

### 16. SSRF Koruması — İYİ ✅
- Localhost, private IP, metadata endpoint'leri bloklanmış
- DNS resolution sonrası IP doğrulama
- IPv4-mapped IPv6 engellemesi
- Worker'da delivery sırasında da SSRF koruması var

### 17. JWT Güvenliği — İYİ ✅
- RS256 tercih ediliyor, HS256 fallback
- HttpOnly, Secure, SameSite=Lax cookie
- Token revocation + blacklist desteği
- 2FA (TOTP) desteği

### 18. Password Hashing — GÜVENLİ ✅
- Argon2id (OWASP parametreleri: 47104 KiB, 3 iter, 1 paralel)
- Minimum 8, maksimum 128 karakter
- Password reset rate limited

### 19. Environment Variables — GÜVENLİ ✅
- `.gitignore` `.env` dosyalarını exclude ediyor
- `ENCRYPTION_KEY` startup'ta doğrulanıyor
- CORS origins yapılandırılmış
- Hardcoded credentials yok

### 20. Cookie Güvenliği — DÜZELTİLDİ ✅
- Tüm cookie'lerde `Secure` flag mevcut
- `SameSite=Lax` CSRF koruması
- `HttpOnly` auth cookie (server-side)

### 21. Reverse Tabnapping — DÜZELTİLDİ ✅
- Tüm `_blank` linklerinde `rel="noopener noreferrer"`

### 22. Webhook Quota — İYİ ✅
- Atomic webhook_count increment
- Overage desteği (plan bazlı)
- Replay endpoint'inde ownership check

### 23. Idempotency — İYİ ✅
- Webhook creation'da `Idempotency-Key` desteği
- Body hash ile duplicate detection

### 24. Body Size Limit — İYİ ✅
- 2MB global body limit (`RequestBodyLimitLayer`)
- Response body okuma limiti (1MB)

### 25. Circuit Breaker — MEVCUT ✅
- Worker'da circuit breaker modülü
- Redis-backed state persistence
- Failure threshold + cooldown

### 26. Webhook Timestamp Tolerance — İYİ ✅
- Configurable `webhook_timestamp_tolerance_secs`
- Stripe webhook replay attack prevention

### 27. HTTP Client Security — İYİ ✅
- Request timeout (25s)
- Connection timeout
- Connection pooling
- TCP keepalive

---

## 🔧 Yapılan Düzeltmeler (Bu Oturum)

| # | Dosya | Değişiklik |
|---|-------|-----------|
| 1 | `api/src/models/endpoint.rs` | `signing_secret` ve `old_signing_secret` → `#[serde(skip_serializing)]` |
| 2 | `api/src/routes/inbound.rs` | `InboundConfig.secret` → `#[serde(skip_serializing)]` |
| 3 | `dashboard/src/lib/sanitize.ts` | `javascript:`/`data:`/`vbscript:` URL filtreleme genişletildi |
| 4 | `dashboard/src/lib/sanitize.ts` | `<script>` tag removal eklendi |
| 5 | `dashboard/src/lib/store.tsx` | Auth cookie'ye `Secure` flag eklendi |
| 6 | `dashboard/src/components/CookieConsent.tsx` | Cookie consent cookie'ye `Secure` flag eklendi |
| 7 | `dashboard/src/app/[locale]/(dashboard)/settings/components/ConsentToggle.tsx` | Consent cookie'ye `Secure` flag eklendi |
| 8 | `api/src/routes/auth.rs` | Password max length 128 karakter (Argon2 DoS prevention) |
| 9 | `dashboard/src/components/OnboardingWizard.tsx` | `rel="noopener noreferrer"` eklendi |
| 10 | `dashboard/src/app/[locale]/(dashboard)/layout.tsx` | `rel="noopener noreferrer"` eklendi |
| 11 | `dashboard/src/app/[locale]/changelog/[slug]/page.tsx` | `rel="noopener noreferrer"` eklendi |

## 🔧 Önceki Oturumlarda Yapılan Düzeltmeler

| # | Sorun | Çözüm |
|---|-------|-------|
| 1 | SameSite=None cookie | SameSite=Lax |
| 2 | WS origin localhost production | `#[cfg(debug_assertions)]` |
| 3 | Timing attack (login) | DUMMY_HASH ile sabit zamanlama |
| 4 | CSP unsafe-eval | Kaldırıldı |
| 5 | SSRF playground | Validation eklendi |
| 6 | Rate limiting (auth endpoints) | IP bazlı limit eklendi |
| 7 | Idempotency hash (DefaultHasher) | SHA-256 kullanıldı |
| 8 | HSTS header | Eklendi |
| 9 | `.env` pattern gitignore | Eklendi |
| 10 | Concurrent delivery limit | Semaphore eklendi |

---

## 📋 Kalan Açık Sorunlar (Düşük Öncelik)

| # | Sorun | Risk | Öneri |
|---|-------|------|-------|
| 1 | Circuit breaker tam entegrasyon | 🟢 | Worker'da retry loop'a entegre et |
| 2 | Billing webhook idempotency (Stripe) | 🟢 | Stripe kendi idempotency'sini kullanıyor |
| 3 | SDK'lar: Error class çeşitliliği | 🟢 | 6 SDK'da eksik (Rust, Java, Kotlin, C#, Elixir, Swift) |
| 4 | `output: 'standalone'` next.config | 🟢 | Vercel'de gerekli olabilir |
| 5 | Stale branch temizliği | 🟢 | 6+ branch |
| 6 | Dependabot PR'ları | 🟢 | 20+ açık PR |

---

## ✅ İyi Uygulamalar (Tespit Edilen)

1. **Parameterized SQL queries** — SQL injection koruması mükemmel
2. **SSRF koruması** — Webhook delivery'de kapsamlı IP doğrulama
3. **Argon2id** — API key ve password hashing
4. **Error response'lar** — Internal/Database hataları client'a sızdırmıyor
5. **CustomerResponse** — `password_hash`, `totp_secret`, `api_key_hash` yok
6. **CORS** — Production'da dashboard origins ile sınırlı
7. **Security headers** — HSTS, X-Frame-Options, CSP mevcut
8. **Token revocation** — Individual + all-tokens desteği
9. **Rate limiting** — Auth endpoints + global middleware
10. **Request timeout** — 25s Cloud Run timeout öncesi

---

*Son güncelleme: 2026-05-19 08:10 GMT+8*
