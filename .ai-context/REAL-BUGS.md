# 🐛 GERÇEK HATALAR VE AÇIKLAR

> **Tespit:** 2026-05-12 05:55 GMT+8
> **Kaynak:** Manuel kod incelemesi (evaluation raporundan bağımsız)
> **Kural:** Sadece doğrulanmış gerçek sorunlar

---

## 🔴 KRİTİK (Hemen düzeltilmeli)

### BUG-001: Global Request Body Size Limit Yok ✅ DÜZELTİLDİ
**Dosya:** `api/src/main.rs` (middleware stack)
**Sorun:** `tower-http` Cargo.toml'da `"limit"` feature'ı aktif ama `DefaultBodyLimit` HİÇ kullanılmıyor. Sadece webhook endpoint'inde `max_webhook_payload_bytes` kontrolü var. Auth, admin, billing endpoint'leri limitsiz body kabul ediyor.
**Risk:** DoS saldırısı — multi-GB body ile bellek tüketimi
**Çözüm:** `main.rs`'e `.layer(DefaultBodyLimit::max(2 * 1024 * 1024))` ekle (2MB default)

### BUG-002: CORS Health Endpoint'te Hardcoded
**Dosya:** `api/src/routes/health.rs:12-24`
**Sorun:** Health endpoint CORS header'ları hardcoded (`Access-Control-Allow-Origin: *`). Config'deki `cors_origins` kullanılmıyor.
**Risk:** Health endpoint'i her yerden çağrılabilir, bilgi sızıntısı
**Çözüm:** Config'deki CORS origins kullan veya health endpoint'i CORS'siz bırak

### BUG-003: Email Validation Çok Zayıf ✅ DÜZELTİLDİ
**Dosya:** `api/src/routes/auth.rs:139`
**Sorun:** Email doğrulama sadece `@` karakteri içeriyor mu kontrol ediyor. Geçersiz format'lar kabul edilir (`@`, `a@`, `@.com`)
**Risk:** Geçersiz emailler DB'ye yazılabilir
**Çözüm:** `validator` crate ile RFC 5322 email validation ekle veya mevcut `validation.rs`'deki `validate_email` fonksiyonunu kullan

### BUG-004: NOTIFY_EMAIL Hardcoded Kişisel Email
**Dosya:** `api/src/routes/contact.rs:91`
**Sorun:** `NOTIFY_EMAIL` env var yoksa `servetarslan02@gmail.com` kişisel email'i fallback olarak kullanılıyor
**Risk:** Contact form mesajları yanlış yere gidebilir, kişisel email ifşa
**Çözüm:** Config'den oku veya env var zorunlu yap

---

## 🟡 YÜKSEK (Bu oturumda düzeltilmeli)

### BUG-005: Serde `deny_unknown_fields` Hiç Kullanılmıyor ✅ DÜZELTİLDİ
**Dosya:** Tüm request struct'ları (`api/src/routes/*.rs`)
**Sorun:** Hiçbir request struct'ında `#[serde(deny_unknown_fields)]` yok. Bilinmeyen field'lar sessizce ignore ediliyor.
**Risk:** API tüketicileri yanlış field ismi kullanınca hata almaz, silent failure
**Çözüm:** Kritik request struct'larına `#[serde(deny_unknown_fields)]` ekle

### BUG-006: Contact Form Rate Limit Ama Global Değil
**Dosya:** `api/src/routes/contact.rs`
**Sorun:** Contact form'da rate limit var ama IP bazlı. Aynı kullanıcı farklı IP'lerden spam yapabilir.
**Risk:** Spam
**Çözüm:** Email bazlı rate limit de ekle

### BUG-007: Pagination Per-Page Limit Tutarlı Değil ✅ DÜZELTİLDİ
**Dosya:** `api/src/routes/events.rs`, `api/src/routes/audit_log.rs`, `api/src/routes/admin.rs`
**Sorun:** Bazı endpoint'ler `min(200)`, bazıları `min(100)`, bazıları limitsiz. Standart bir max_per_page yok.
**Risk:** Büyük sayfa boyutları yavaş query'ler
**Çözüm:** Global `MAX_PER_PAGE = 200` sabiti, tüm endpoint'lerde uygula

### BUG-008: Outbound IP'ler Statik
**Dosya:** `api/src/routes/outbound_ips.rs:26`
**Sorun:** `OUTBOUND_IPS` env var'dan okunuyor, Cloud Run'da IP'ler değişebilir. Dinamik olarak alınmalı.
**Risk:** Müşteriler whitelist'e eski IP'leri ekler, webhook'ları fail
**Çözüm:** Cloud Run metadata API'den dinamik IP çek veya cache'le (TTL ile)

---

## 🟢 ORTA (Sıradaki oturumlarda)

### BUG-009: `SELECT *` Kullanımı
**Dosya:** `api/src/routes/events.rs:79`
**Sorun:** `SELECT * FROM deliveries` — gereksiz kolon çekimi, performans ve gizlilik riski
**Çözüm:** Spesifik kolonları listele

### BUG-010: Error Context Eksik
**Dosya:** Çeşitli route handler'lar
**Sorun:** Bazı `.map_err()` çağrıları yeterli context vermiyor, debugging zorlaşıyor
**Çözüm:** `.context("ne zaman bu hata oluştu")` ekle

### BUG-011: Test Secret'ları Production Code'da
**Dosya:** `api/src/routes/inbound.rs:740`, `api/src/billing/stripe.rs:737` vb.
**Sorun:** Test kodunda hardcoded secret'lar var. Test-only olmasına rağmen grep ile bulunabilir.
**Risk:** Düşük — test kodu ama best practice değil
**Çözüm:** Test fixture kullan veya env'den oku

### BUG-012: Graceful Shutdown Belirsiz ✅ DÜZELTİLDİ
**Dosya:** `api/src/main.rs`
**Sorun:** SIGTERM handling'in doğru yapılıp yapılmadığı belirsiz
**Risk:** Deploy sırasında connection drop
**Çözüm:** `tokio::signal::ctrl_c()` + graceful shutdown logic kontrol et

---

## 📊 Rapor vs Gerçeklik Karşılaştırması

| Rapor Maddesi | Gerçek Durum |
|---|---|
| Doc comments eksik (6/10) | ✅ 809 doc comment var — rapor yanlış |
| Encryption at rest yok (5/10) | ✅ Aes256Gcm var — rapor yanlış |
| Audit logging yok (6/10) | ✅ audit_log tablosu + routes var — rapor yanlış |
| Backup strategy yok (3/10) | ✅ 3 backup script var — rapor yanlış |
| k6 load tests yok | ✅ 8 k6 dosyası var — rapor yanlış |
| Redis/cache layer yok (4/10) | ⚠️ Upstash bağlı ama caching'de kullanılmıyor — rapor doğru |
| Container scanning yok | ⚠️ Doğru — Trivy CI yok |
| Contract testing yok (0/10) | ⚠️ Doğru — schemathesis yok |
| Body size limit yok | 🔴 YENİ BULGU — raporda bile yok |
| CORS hardcoded | 🔴 YENİ BULGU — raporda bile yok |

---

*Son güncelleme: 2026-05-12 05:55 GMT+8*

---

## 🔴 YENİ BULGULAR (05:57+ Tespit)

### BUG-013: reqwest::Client Her İstek İçin Yeni Oluşturuluyor ✅ DÜZELTİLDİ
**Dosya:** 12 dosya (oauth, billing, email, notifications)
**Durum:** Shared HTTP client oluşturuldu (`api/src/http_client.rs`), 12 çağrı değiştirildi
**Commit:** 7bbd9afc

### BUG-017: Global Body Size Limit Yok ✅ DÜZELTİLDİ
**Dosya:** `api/src/main.rs`
**Durum:** `RequestBodyLimitLayer::new(2MB)` middleware eklendi
**Commit:** 7bbd9afc

### BUG-020: 2FA Backup Codes Yok
**Dosya:** `api/src/routes/auth.rs`
**Sorun:** 2FA etkinleştirildiğinde backup/recovery code üretilmiyor. Kullanıcı TOTP cihazını kaybederse hesabı kilitlenir.
**Risk:** Hesap erişimi kalıcı kayıp
**Çözüm:** 2FA aktifleştirme sırasında 8-10 backup code üret, DB'de hash'le sakla

### BUG-021: Password Policy Çok Zayıf
**Dosya:** `api/src/routes/auth.rs:148`
**Sorun:** Sadece minimum 8 karakter kontrolü. Büyük/küçük harf, rakam, özel karakter zorunlu değil.
**Risk:** Zayıf şifreler
**Çözüm:** En az 1 büyük harf + 1 rakam + minimum 8 karakter

### BUG-022: CSP'de unsafe-inline + unsafe-eval
**Dosya:** `dashboard/next.config.js`
**Sorun:** CSP'de `script-src 'unsafe-inline' 'unsafe-eval'` var. XSS saldırılarına karşı koruma zayıflıyor.
**Risk:** Stored XSS, DOM-based XSS
**Çözüm:** Nonce-based CSP veya hash-based CSP

### BUG-023: Circuit Breaker State In-Memory ✅ DÜZELTİLDİ (Redis persistence)
**Dosya:** `worker/src/circuit_breaker.rs:65`
**Sorun:** Circuit breaker state `HashMap<Uuid, EndpointCircuit>` in-memory. Worker restart'ta tüm state kaybolur.
**Risk:** Restart sonrası hatalı endpoint'lere tekrar istek atılır
**Çözüm:** Redis'e persist et veya PostgreSQL'de sakla

### BUG-024: Webhook Retry State In-Memory  
**Dosya:** `worker/src/` (IMPLEMENTATION-PLAN madde 22)
**Sorun:** Throttle state in-memory, worker restart'ta kaybolur
**Risk:** Retry sayacı sıfırlanır, duplicate delivery
**Çözüm:** Redis tabanlı retry state

### BUG-025: Events Endpoint SELECT * Kullanımı
**Dosya:** `api/src/routes/events.rs:79`
**Sorun:** `SELECT * FROM deliveries` — gereksiz kolon çekimi
**Risk:** Performans, gizlilik (response body'de gereksiz alanlar)
**Çözüm:** Spesifik kolon listele

### BUG-026: NOTIFY_EMAIL Hardcoded Kişisel Email ✅ DÜZELTİLECEK
**Dosya:** `api/src/routes/contact.rs:91`
**Sorun:** Fallback `servetarslan02@gmail.com`
**Çözüm:** Config'den oku

### BUG-027: Outbound IP'ler Statik
**Dosya:** `api/src/routes/outbound_ips.rs`
**Sorun:** Cloud Run'da IP'ler değişebilir, statik env var'dan okunuyor
**Çözüm:** Cache'le (TTL 5dk) veya Cloud Run metadata API'den dinamik çek

### BUG-028: Pagination Per-Page Limit Tutarlı Değil
**Dosya:** Çeşitli route handler'lar
**Sorun:** Bazıları min(200), bazıları min(100), bazıları limitsiz
**Çözüm:** Global `MAX_PER_PAGE = 200` sabiti

### BUG-029: deny_unknown_fields Kullanılmıyor
**Dosya:** Tüm request struct'ları
**Sorun:** Bilinmeyen field'lar sessizce ignore ediliyor
**Risk:** Silent failure
**Çözüm:** Kritik request'lere `#[serde(deny_unknown_fields)]` ekle
