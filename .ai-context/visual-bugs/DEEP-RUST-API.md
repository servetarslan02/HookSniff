# 🔒 HookSniff Rust API — Deep Security & Quality Audit

**Tarih:** 2026-05-10  
**Taranan Dosyalar:** 90+ `.rs` dosyası (api/src/, worker/src/, api/migrations/)  
**Toplam Satır:** ~15,000+ satır Rust kodu  

---

## 📊 ÖZET

| Kategori | Kritik | Yüksek | Orta | Düşük | Toplam |
|----------|--------|--------|------|-------|--------|
| Güvenlik | 2 | 4 | 5 | 3 | 14 |
| Hata Yönetimi | 0 | 1 | 3 | 2 | 6 |
| Performans | 0 | 1 | 3 | 2 | 6 |
| Kod Kalitesi | 0 | 0 | 4 | 5 | 9 |
| Migration | 0 | 1 | 3 | 2 | 6 |
| **TOPLAM** | **2** | **7** | **18** | **14** | **41** |

---

## 🚨 GÜVENLİK AÇIKLARI

| # | Dosya | Satır | Sorun | Severity | CWE | Çözüm |
|---|-------|-------|-------|----------|-----|-------|
| 1 | `routes/inbound.rs` | 385-388 | **Authorization bypass**: `handle_inbound_to_endpoint` fonksiyonu API key'i sadece prefix ile eşleştiriyor, tam hash doğrulaması yapmıyor. Saldırgan aynı prefix'e sahip farklı bir key ile erişebilir. | 🔴 Kritik | CWE-287 | `handle_inbound` fonksiyonundaki gibi Argon2 hash doğrulaması ekleyin |
| 2 | `routes/inbound.rs` | 385 | **Prefix-based lookup yetersiz**: `api_key[..20.min(api_key.len())]` — 20 karakter prefix, customers tablosundaki 15 karakterlik `api_key_prefix` ile eşleşmeyebilir, fazla karakter ekleniyor | 🔴 Kritik | CWE-287 | Prefix uzunluğunu 15 karakter ile sınırlayın ve hash doğrulama ekleyin |
| 3 | `routes/billing.rs` | 1-20 | **Billing webhook'ları auth bypass**: `/billing/webhook`, `/billing/webhook/polar`, `/billing/webhook/iyzico` endpoint'leri auth_middleware kullanmıyor — sadece signature doğrulaması var ama rate limiting yok | 🟡 Yüksek | CWE-306 | Rate limiting ekleyin (Stripe'ın önerdiği gibi) |
| 4 | `ssrf.rs` | 60-65 | **DNS rebinding koruması yok**: DNS çözümleme anında IP kontrolü yapılıyor ama HTTP bağlantısı sırasında IP değişebilir (TOCTOU) | 🟡 Yüksek | CWE-918 | HTTP client'ın DNS çözümlemesini kontrol edin veya connection pooling'de IP pinning uygulayın |
| 5 | `middleware/idempotency.rs` | 143-148 | **Zayıf hash fonksiyonu**: `compute_body_hash` `DefaultHasher` kullanıyor — kriptografik olarak güvenli değil, collision üretilebilir | 🟡 Yüksek | CWE-328 | SHA-256 kullanın |
| 6 | `routes/custom_domains.rs` | 219 | **Command injection riski**: `verify_dns_txt` ve `verify_dns_cname` fonksiyonları `tokio::process::Command` ile `dig`/`nslookup` çalıştırıyor. Domain validasyonu yapılmış olsa da, shell injection riski var | 🟡 Yüksek | CWE-78 | Domain input'unu sanitize edin veya DNS lookup kütüphanesi kullanın |
| 7 | `routes/events.rs` | 70-85 | **Dynamic SQL construction**: `format!` ile WHERE clause oluşturuluyor. Değerler bind ediliyor ama query string'in kendisi dinamik — gelecekte injection riski | 🟠 Orta | CWE-89 | Query builder kütüphanesi kullanın veya sorguyu sabit tutup optional filter'ları UNION ile yönetin |
| 8 | `routes/admin.rs` | 175-193 | **Dynamic SQL construction**: Admin user listesi için dinamik WHERE clause. Parametreler bind ediliyor ama format! ile SQL string oluşturuluyor | 🟠 Orta | CWE-89 | Query builder kütüphanesi kullanın |
| 9 | `routes/auth.rs` | 140-145 | **Timing attack**: `verify_password` Argon2 kullanıyor (constant-time ✅) ama login hataları farklı mesajlar döndürebilir — "Password login not set up" vs "Unauthorized" | 🟠 Orta | CWE-208 | Tüm hata durumlarında aynı mesajı döndürün |
| 10 | `error.rs` | 52-55 | **Serialization error sızıntısı**: `AppError::Serialization` serde_json hata mesajını kullanıcıya gösteriyor — internal bilgi sızıntısı | 🟠 Orta | CWE-209 | Serialization hatalarını generic mesajla gizleyin |
| 11 | `routes/auth.rs` | 96-100 | **Email enumeration**: `register` endpoint'i "Email already registered" hatası döndürüyor — email varlığını doğruluyor | 🟠 Orta | CWE-203 | Her durumda aynı mesajı döndürün |
| 12 | `routes/webhooks.rs` | 135-140 | **Batch replay N+1**: `batch_replay` her delivery için ayrı DB sorgusu yapıyor (loop içinde) | 🟢 Düşük | CWE-400 | Tek sorguyla tüm delivery'leri getirin |
| 13 | `config.rs` | 145-152 | **Development secret generation**: `HMAC_SECRET` ve `JWT_SECRET` env yoksa `dev-{uuid}` ile oluşturuluyor — restart'ta değişir, session'ları invalid eder | 🟢 Düşük | CWE-798 | Development'ta bile sabit bir secret kullanın veya warning'i daha belirgin yapın |
| 14 | `middleware/mod.rs` | 55 | **Auth cache race condition**: `AUTH_CACHE` `std::sync::Mutex` kullanıyor — async context'te bloklayabilir | 🟢 Düşük | CWE-362 | `tokio::sync::Mutex` kullanın |

---

## 🛡️ GÜVENLİK KONTROL LİSTESİ (İYİ YAPILANLAR)

| Kontrol | Durum | Not |
|---------|-------|-----|
| SQL Injection | ✅ Güvenli | Tüm sorgular parameterized (`$1`, `$2`), format! sadece dynamic clause için |
| Password Hashing | ✅ Güvenli | Argon2id kullanılıyor, random salt |
| JWT Signing | ✅ Güvenli | HMAC-SHA256, configurable secret |
| Webhook Signature | ✅ Güvenli | Standard Webhooks spec, constant-time comparison |
| SSRF Protection | ✅ İyi | Private IP, loopback, metadata endpoint engelleme |
| CORS | ✅ İyi | Production'da origin restriction |
| Rate Limiting | ✅ İyi | Plan-based, sliding window |
| Input Validation | ✅ İyi | Event type, URL, JSON depth, email |
| Error Messages | ✅ İyi | Internal hatalar generic mesajla gizleniyor |
| Encryption at Rest | ✅ İyi | AES-256-GCM for SSO secrets |
| Replay Protection | ✅ İyi | Timestamp tolerance + seen_webhooks |
| Idempotency | ✅ İyi | Body hash ile key validation |
| CSRF Protection | ✅ İyi | HttpOnly + Secure + SameSite cookies |
| 2FA (TOTP) | ✅ İyi | Proper TOTP implementation |

---

## 🔧 HATA YÖNETİMİ

| # | Dosya | Satır | Sorun | Severity | CWE | Çözüm |
|---|-------|-------|-------|----------|-----|-------|
| 1 | `rate_limit.rs` | 270-280 | **unwrap() in middleware**: `result.limit.to_string().parse().expect("valid header value")` — header parse failure'da panic | 🟡 Yüksek | CWE-400 | `unwrap_or_else` veya `unwrap_or_default` kullanın |
| 2 | `routes/auth.rs` | 50 | **unwrap_or_else with HeaderValue**: `HeaderValue::from_str(&access_cookie).unwrap_or_else(\|_\| HeaderValue::from_static(""))` — cookie value invalid ise empty header döndürmek yerine hata loglamalı | 🟠 Orta | CWE-400 | Hata loglayıp default değer döndürün |
| 3 | `config.rs` | 145-152 | **unwrap_or for secrets**: Development'ta secret yoksa random UUID ile oluşturuluyor — production'da validate_secret çalışsa bile development'ta session invalidation riski | 🟠 Orta | CWE-798 | Development'ta bile minimum entropy kontrolü ekleyin |
| 4 | `middleware/mod.rs` | 82 | **unwrap() on Mutex**: `AUTH_CACHE.lock().unwrap()` — poisoned mutex durumunda panic | 🟠 Orta | CWE-400 | `lock().unwrap_or_else(\|e\| e.into_inner())` kullanın |
| 5 | `auth/jwt.rs` | 41 | **expect() for timestamp**: `checked_add_signed(duration).expect("valid timestamp")` — extreme duration değerlerinde panic | 🟢 Düşük | CWE-400 | `ok_or` ile AppError'a çevirin |
| 6 | `error.rs` | 48 | **Error type tutarlılığı**: `AppError::Internal(#[from] anyhow::Error)` — tüm hataları Internal'a sarıyor, bazen daha spesifik hata tipi gerekli | 🟢 Düşük | CWE-400 | Spesifik hata varyantları ekleyin |

---

## ⚡ PERFORMANS

| # | Dosya | Satır | Sorun | Severity | CWE | Çözüm |
|---|-------|-------|-------|----------|-----|-------|
| 1 | `routes/admin.rs` | 220-240 | **N+1 query**: `list_teams` her team için ayrı `COUNT(*)` sorgusu yapıyor | 🟡 Yüksek | CWE-400 | JOIN ile tek sorguda team + member count getirin |
| 2 | `routes/webhooks.rs` | 380-420 | **Loop içinde DB sorgusu**: `batch_replay` her delivery için 2-3 ayrı sorgu yapıyor | 🟠 Orta | CWE-400 | Batch query ile toplu getirin |
| 3 | `routes/custom_domains.rs` | 250-300 | **Blocking DNS lookup**: `tokio::process::Command` ile `dig`/`nslookup` çalıştırılıyor — async context'te blocking | 🟠 Orta | CWE-400 | `tokio::task::spawn_blocking` kullanın veya DNS kütüphanesi (trust-dns) tercih edin |
| 4 | `rate_limit.rs` | 85-110 | **InMemory cleanup overhead**: 30 saniyede bir tüm HashMap'i tarıyor, 10k+ entry'de yavaşlayabilir | 🟠 Orta | CWE-400 | LRU cache veya probabilistic cleanup kullanın |
| 5 | `routes/webhooks.rs` | 200-250 | **Unnecessary clone**: `batch_webhooks`'da `endpoint.clone()` her iterasyonda yapılıyor | 🟢 Düşük | CWE-400 | Reference kullanın veya `Arc` ile sarın |
| 6 | `middleware/mod.rs` | 45-55 | **Auth cache cleanup**: Background task yok, cache sürekli büyüyor | 🟢 Düşük | CWE-400 | Periodic cleanup task ekleyin |

---

## 📝 KOD KALİTESİ

| # | Dosya | Satır | Sorun | Severity | CWE | Çözüm |
|---|-------|-------|-------|----------|-----|-------|
| 1 | `routes/webhooks.rs` | - | **Dosya uzunluğu**: 1015 satır — 300 satır limitini aşıyor | 🟠 Orta | - | `batch_webhooks`, `export_deliveries`, `replay_webhook` fonksiyonlarını ayrı modüllere taşıyın |
| 2 | `routes/auth.rs` | - | **Dosya uzunluğu**: 1285 satır — en büyük dosya | 🟠 Orta | - | 2FA, password reset, GDPR fonksiyonlarını ayrı modüllere taşıyın |
| 3 | `db.rs` | - | **Dosya uzunluğu**: 1029 satır — migration'lar inline | 🟠 Orta | - | Migration'ları ayrı dosyalara taşıyın (sqlx migrations veya embedded SQL) |
| 4 | `signing.rs` (api vs worker) | - | **Duplicate code**: API ve worker'da neredeyse aynı signing implementasyonu | 🟠 Orta | - | Ortak bir `hooksniff-signing` crate oluşturun |
| 5 | `admin.rs` | 115-120 | **Magic numbers**: Revenue calculation hardcoded (29.0, 99.0) | 🟢 Düşük | - | Plan.monthly_price_cents() kullanın |
| 6 | `rate_limit.rs` | 50-60 | **Magic numbers**: `max_entries: 10_000`, cleanup interval `30s` | 🟢 Düşük | - | Config'ten okuyun |
| 7 | `routes/webhooks.rs` | 15 | **Magic number**: Batch limit `100` hardcoded | 🟢 Düşük | - | Config constant olarak tanımlayın |
| 8 | `main.rs` | 40-60 | **Background job scheduling**: Retention ve cleanup job'ları hardcoded interval ile spawn ediliyor | 🟢 Düşük | - | Config'ten okuyun veya cron library kullanın |
| 9 | `lib.rs` | - | **Module structure**: 30+ modül tek `lib.rs`'de — büyük surface area | 🟢 Düşük | - | İlgili modülleri workspace crate'lere ayırın |

---

## 🗄️ MİGRASYON

| # | Dosya | Satır | Sorun | Severity | CWE | Çözüm |
|---|-------|-------|-------|----------|-----|-------|
| 1 | `db.rs` | 50-100 | **Down migration yok**: Hiçbir migration geri alınamıyor | 🟡 Yüksek | CWE-400 | Her migration için `DOWN` SQL ekleyin veya `sqlx migrate` kullanın |
| 2 | `migrations/001_initial_schema.sql` | 1-10 | **CockroachDB syntax**: `STRING` tipi kullanılmış, PostgreSQL'de `TEXT` olmalı. Inline migration'da `TEXT` kullanılıyor ama .sql dosyası farklı | 🟠 Orta | CWE-400 | .sql dosyasını PostgreSQL syntax'ına güncelleyin |
| 3 | `db.rs` | 63-64 | **Duplicate index**: `idx_webhook_queue_trace_id` hem 009 hem 025 migration'ında tanımlanmış | 🟠 Orta | CWE-400 | Tek bir yerde tanımlayın |
| 4 | `db.rs` | 117-120 | **Idempotency key schema mismatch**: 001 migration'ında `PRIMARY KEY (key, customer_id)` ama inline migration'da `key TEXT PRIMARY KEY` | 🟠 Orta | CWE-400 | Schema'yı tutarlı hale getirin |
| 5 | `db.rs` | 43-44 | **Missing FK on dead_letters**: `dead_letters.delivery_id` FOREIGN KEY constraint'i yok (001 migration'da) ama inline migration'da var | 🟢 Düşük | CWE-400 | Tutarlı hale getirin |
| 6 | `db.rs` | 200-210 | **updated_at trigger eksik**: Bazı tablolarda `updated_at` var ama trigger yok (sadece webhook_queue ve deliveries'da var) | 🟢 Düşük | CWE-400 | Tüm updated_at kolonları için trigger ekleyin |

---

## 🔍 EK BULGULAR

### Teslim Edilen Güvenlik Özellikleri (Pozitif)

1. **Standard Webhooks spec** — Tam uyumlu implementasyon
2. **AES-256-GCM encryption** — SSO client_secret'ları için
3. **Argon2id** — Password ve API key hashing
4. **Constant-time comparison** — Signature verification'da
5. **Replay protection** — Timestamp tolerance + seen_webhooks
6. **Idempotency** — Body hash ile key validation
7. **Circuit breaker** — Endpoint delivery'de
8. **Rate limiting** — Plan-based, sliding window, Redis desteği
9. **GDPR endpoints** — Data export + account deletion
10. **2FA (TOTP)** — Proper implementation with base32 encoding

### Test Kapsamı

- ✅ Unit test'ler mevcut (modül başına ~20-40 test)
- ✅ Serde roundtrip test'leri
- ✅ Edge case test'leri
- ⚠️ Integration test'ler eksik (veritabanı ile)
- ⚠️ Security-focused test'ler eksik (fuzzing, negative testing)

---

## 📋 ÖNCELİKLİ DÜZELTMELER

### Acil (Sprint 1)
1. **🔴 routes/inbound.rs:385** — Authorization bypass'ı düzelt (hash doğrulama ekle)
2. **🔴 routes/inbound.rs:385** — Prefix uzunluğunu düzelt (15 karakter)
3. **🟡 rate_limit.rs:270** — unwrap() yerine güvenli alternatif kullan

### Kısa Vadeli (Sprint 2-3)
4. **🟡 routes/billing.rs** — Billing webhook'larına rate limiting ekle
5. **🟡 middleware/idempotency.rs** — SHA-256 hash kullan
6. **🟡 routes/custom_domains.rs** — DNS lookup'u async yap
7. **🟡 error.rs** — Serialization error sızıntısını gizle

### Orta Vadeli (Sprint 4-6)
8. **🟠 routes/admin.rs** — N+1 query'leri optimize et
9. **🟠 routes/webhooks.rs** — Batch replay optimize et
10. **🟠 db.rs** — Down migration'lar ekle
11. **🟠 signing.rs** — Duplicate code'u ortak crate'e taşı

---

*Rapor: 90+ dosya, ~15,000 satır Rust kodu tarandı. 2 kritik, 7 yüksek, 18 orta, 14 düşük seviye sorun tespit edildi.*
