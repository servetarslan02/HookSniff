# 🔍 API (Rust/Axum) — Kapsamlı Kod Analizi

> Tarih: 2026-05-10
> Satır: ~32,940 Rust kodu
> Dosya: 76 kaynak dosya + 43 migration
> İnceleme: Satır satır, modül modül

---

## 📊 Genel Değerlendirme

| Kategori | Puan | Not |
|----------|------|-----|
| Güvenlik | 8/10 | Güçlü altyapı, birkaç iyileştirme alanı var |
| Kod Kalitesi | 7/10 | Temiz yapı, bazı tekrarlar |
| Test Kapsamı | 8/10 | Her modülde kapsamlı testler |
| Performans | 7/10 | İyi, bazı N+1 riskleri |
| Bakım | 6/10 | Migration yönetimi iyileştirilebilir |

---

## 🟢 İYİ UYGULAMALAR (Güçlü Yönler)

### 1. Güvenlik Altyapısı Çok Güçlü ✅
- **Standard Webhooks imza doğrulama** (`signing.rs`): Svix uyumlu, constant-time XOR fold karşılaştırması, timing attack koruması
- **SSRF Koruması** (`ssrf.rs`): Private IP, loopback, link-local, metadata endpoint engelleme — eksiksiz
- **Argon2id** ile API key ve password hashing (OWASP önerisi)
- **Production secret validation** (`config.rs`): Placeholder pattern algılama, minimum 32 karakter
- **TOTP 2FA desteği** (`auth.rs`): totp-rs ile RFC 6238 uyumlu
- **Replay protection** (`middleware/idempotency.rs`): Timestamp tolerance + seen_webhooks tablosu
- **CORS yapılandırması**: Production'da spesifik origin'ler, credential desteği

### 2. Test Kapsamı Mükemmel ✅
- Her modülde `#[cfg(test)]` blokları
- Edge case'ler test edilmiş (empty strings, unicode, max values)
- Integration testler (`tests/integration.rs`)
- Svix reference test vector doğrulama
- 100+ unit test sadece auth ve signing'de

### 3. Graceful Shutdown ✅
- SIGINT ve SIGTERM yakalama
- OpenTelemetry flush before exit
- `with_graceful_shutdown()` kullanımı

### 4. Rate Limiting Çift Katmanlı ✅
- In-memory (geliştirme) + Redis (production)
- Sliding window algoritması
- Plan-based limitler (Free: 100/min, Pro: 1000/min)
- Proper X-RateLimit-* header'ları

### 5. Circuit Breaker Pattern ✅
- Per-endpoint failure tracking
- Cooldown + half-open test mekanizması
- Monitoring dashboard için `get_all()` endpoint'i

### 6. Idempotency + Replay Protection ✅
- `Idempotency-Key` header desteği
- Body hash doğrulama (farklı payload aynı key = reddet)
- 24 saat TTL, ON CONFLICT DO NOTHING

### 7. GDPR Uyumluluğu ✅
- `GET /v1/auth/export` — Veri dışa aktarma (Article 15)
- `DELETE /v1/auth/account` — Hesap silme (Article 17)
- Transaction içinde sıralı silme (foreign key sırası doğru)

---

## 🔴 KRİTİK SORUNLAR

### 1. 🔴 Fiyat Tutarsızlığı — `monthly_price_cents()` Güncel Değil
**Dosya**: `billing/mod.rs`
```rust
// Mevcut (YANLIŞ):
Plan::Pro => 4900,       // $49/mo
Plan::Business => 14900, // $149/mo

// NEXT_SESSION.md'ye göre doğru fiyat:
Plan::Pro => 2900,       // $29/mo
Plan::Business => 9900,  // $99/mo
```
**Etki**: Stripe/Polar'da yanlış fiyat gösterilir. Müşteri $49 görür ama $29 ödemeli.
**Önem**: 🔴 KRİTİK — Yayından önce düzeltilmeli.

### 2. 🔴 `webhook_count` Race Condition
**Dosya**: `routes/webhooks.rs` — `create_webhook()`
```rust
let updated: Option<Customer> = sqlx::query_as(
    "UPDATE customers SET webhook_count = webhook_count + 1 
     WHERE id = $1 AND webhook_count < $2 RETURNING *",
)
```
Bu atomic UPDATE iyi, ama `batch_webhooks()`'da:
```rust
let updated: Option<Customer> = sqlx::query_as(
    "UPDATE customers SET webhook_count = webhook_count + $1 
     WHERE id = $2 AND webhook_count + $1 <= $3 RETURNING *",
)
```
**Sorun**: Batch'te webhook_count artırıldı ama hata durumunda geri alınmıyor. Eğer batch'in ortasında DB hatası olursa, sayac artmış kalır.
**Çözüm**: Transaction içinde batch işlemi veya hata durumunda rollback.

### 3. 🔴 Migration 025 — Duplicate Index
**Dosya**: `db.rs`
```sql
-- Migration 011'de zaten var:
CREATE INDEX IF NOT EXISTS idx_seen_webhooks_expires ON seen_webhooks (expires_at);

-- Migration 025'te tekrar tanımlanıyor (farklı tablo için ama trace_id için):
CREATE INDEX IF NOT EXISTS idx_webhook_queue_trace_id ON webhook_queue(trace_id) WHERE trace_id IS NOT NULL;
```
**Sorun**: `idx_webhook_queue_trace_id` index'i hem 009 hem 025 migration'da tanımlanmış. `IF NOT EXISTS` sayesinde crash olmaz ama gereksiz tekrar.

### 4. 🔴 `delete_account` — Eksik Tablo Silme
**Dosya**: `routes/auth.rs`
GDPR delete_account fonksiyonu bu tabloları silmiyor:
- `alert_rules`
- `ai_agent_configs`
- `installed_agents`
- `team_members` / `team_invites`
- `notification_preferences`
- `inbound_configs`
- `event_schemas`
- `transform_rules`
- `retry_policies`
- `fifo_queue`
- `fanout_rules`
- `delivery_targets`

**Etki**: Kullanıcı hesabı silinse bile bu tablolarda veri kalır (orphan data).
**Önem**: 🔴 GDPR uyumsuzluğu.

### 5. 🔴 `Config` Debug Implementasyonu — Secret Sızıntısı Riski
**Dosya**: `config.rs`
```rust
#[derive(Debug, Clone)]
pub struct Config {
    pub hmac_secret: String,
    pub jwt_secret: String,
    pub stripe_secret_key: Option<String>,
    // ... tüm secret'lar Debug'da görünür
}
```
**Sorun**: `Config` struct'ı `#[derive(Debug)]` ile tüm secret'ları log'a yazabilir. Panic anında veya `unwrap()` hatasında secret'lar loglanır.
**Çözüm**: Manual `Debug` impl ile secret'ları redact et (WebhookVerifier'daki gibi).

---

## 🟡 ORTA SEVİYE SORUNLAR

### 1. 🟡 Background Job Management — Structured Olmayan Tokio Spawn
**Dosya**: `main.rs`
```rust
tokio::spawn(async move { loop { ... } }); // retention
tokio::spawn(async move { loop { ... } }); // monthly reset
tokio::spawn(async move { loop { ... } }); // cleanup
```
**Sorun**: 3 ayrı background loop, hata yönetimi sadece `tracing::error`. Job tracking yok, crash durumunda restart yok.
**Öneri**: `tokio::task::JoinSet` veya structured concurrency pattern.

### 2. 🟡 N+1 Query Riski — Auth Middleware
**Dosya**: `middleware/mod.rs`
```rust
// Her request'te 2 ayrı DB sorgusu:
let candidates = sqlx::query_as::<_, Customer>(
    "SELECT * FROM customers WHERE api_key_prefix = $1"
).fetch_all(&*pool).await?;

let api_key_candidates: Vec<(String,)> = sqlx::query_as(
    "SELECT api_key_hash FROM api_keys WHERE api_key_prefix = $1 AND is_active = true"
).fetch_all(&*pool).await?;
```
**Sorun**: Her API isteğinde 2 DB sorgusu. Prefix collision durumunda tüm hash'ler iterate edilir.
**Öneri**: Redis'te api_key_prefix → customer_id cache (zaten rate limiter'da plan cache var, genişletilebilir).

### 3. 🟡 `compute_body_hash` — Weak Hash Function
**Dosya**: `middleware/idempotency.rs`
```rust
pub fn compute_body_hash(body: &serde_json::Value) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    body.to_string().hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}
```
**Sorun**: `DefaultHasher` collision'a açık. Aynı body farklı hash üretebilir (platform-dependent). Idempotency key'de false positive riski.
**Öneri**: SHA-256 kullan (zaten `sha2` dependency var).

### 4. 🟡 `webhook_verify_middleware` — Body Tüketimi
**Dosya**: `middleware/webhook_verify.rs`
```rust
let body = std::mem::replace(req.body_mut(), Body::empty());
let body_bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap_or_default();
```
**Sorun**: Body'nin tamamı memory'ye yükleniyor. Büyük payload'larda OOM riski.
**Öneri**: Stream-based verification veya max body size check middleware.

### 5. 🟡 CORS — SameSite=None Cookie Sorunu
**Dosya**: `middleware/mod.rs`
```rust
pub fn create_auth_cookie(token: &str, max_age_secs: i64) -> String {
    format!(
        "{}={}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age={}",
        AUTH_COOKIE_NAME, token, max_age_secs
    )
}
```
**Sorun**: `SameSite=None` cross-site tracking'e izin verir. Modern tarayıcılar `Secure` gerektirir (bu var), ama CSRF riski artar.
**Öneri**: Dashboard ile API aynı domain'deyse `SameSite=Lax` kullan.

### 6. 🟡 Eksik Input Validation — `update_profile`
**Dosya**: `routes/auth.rs`
```rust
async fn update_profile(..., Json(req): Json<UpdateProfileRequest>) -> ... {
    if req.name.trim().is_empty() { ... }
    if !req.email.contains('@') { ... }
}
```
**Sorun**: Email validation sadece `@` kontrolü. Geçersiz domain'ler kabul edilir. Name için max length kontrolü yok.
**Öneri**: `email` crate ile domain validation, name max 100 chars.

### 7. 🟡 `ForgotPassword` — Token Hash Sızıntısı Timing
**Dosya**: `routes/auth.rs`
```rust
if let Some((customer_id, email)) = customer {
    // token oluştur ve email gönder
}
// Her durumda aynı mesaj döner (email enumeration koruması) ✅
```
**İyi**: Email enumeration koruması var. Ama token oluşturma + DB insert zaman alıyor, bu timing side-channel oluşturabilir.
**Öneri**: Her durumda sabit zamanlı dummy işlem yap.

### 8. 🟡 `batch_webhooks` — Partial Failure Handling
**Dosya**: `routes/webhooks.rs`
```rust
for (delivery, endpoint, payload_str) in &queue_messages {
    if let Err(e) = db::publish_to_queue(...).await {
        tracing::error!("Failed to publish...");
        // Hata loglanıyor ama user'a bildirilmiyor!
    }
}
```
**Sorun**: Queue'ya publish başarısız olursa, delivery DB'de var ama queue'da yok. Bu delivery asla işlenmez (stuck "pending").
**Öneri**: Queue publish hatası delivery status'unu "failed" yap.

### 9. 🟡 OpenAPI Spec Boş
**Dosya**: `docs/` klasörü
NEXT_SESSION.md'de belirtildiği gibi OpenAPI spec boş. Bu, SDK'ların ve third-party entegrasyonların doğrulanmasını engeller.

---

## 🟢 DÜŞÜK SEVİYE / GÖZLEM

### 1. ✅ Migration Sistemi İyi
- `_migrations` tracking tablosu
- `IF NOT EXISTS` ile idempotent
- `raw_sql()` ile complex migration'lar destekleniyor
- **Ancak**: 43 migration tek bir fonksiyonda (`run_migrations`). Büyük dosya, bakım zor.

### 2. ✅ Error Handling Tutarlı
- `AppError` enum'ı tüm hata türlerini kapsar
- Internal error detayları production'da sızdırılmaz ("Internal server error")
- `thiserror` ile boilerplate azaltılmış

### 3. ✅ Email Sistemi İyi Tasarlanmış
- GCloud Gmail API + service account
- Token caching (5 dk erken yenileme)
- Fire-and-forget pattern (`tokio::spawn`)
- HTML template'ler responsive

### 4. ⚠️ `industry/` Modülü — Kullanılmıyor Olabilir
- `ecommerce.rs`, `fintech.rs`, `healthcare.rs`, `saas.rs` dosyaları var
- Hiçbir route bunları kullanmıyor
- Dead code olabilir

### 5. ⚠️ `fifo/` Modülü — Kısmen Entegre
- FIFO queue tablosu var (migration 020)
- `fifo_queue` tablosu var ama `deliveries` tablosundaki `fifo_*` column'lar da var
- İki farklı FIFO mekanizması çakışabilir

### 6. ⚠️ `ws/` (WebSocket) Modülü — Entegrasyon Belirsiz
- `ws/handler.rs` var ama route'larda WebSocket endpoint'i yok
- `stream/` modülü SSE kullanıyor
- Dead code olabilir

---

## 📋 Öncelikli Aksiyon Listesi

### 🔴 Yayından Önce (Zorunlu)
1. **Fiyat düzeltmesi** — `billing/mod.rs` → `$29/$99` yap
2. **GDPR delete_account** — Eksik tabloları ekle
3. **Config Debug redaction** — Secret'ları Debug'da gizle
4. **Batch webhook rollback** — Hata durumunda webhook_count geri al

### 🟡 Yayına Yakın (Önerilen)
5. **Auth middleware cache** — Redis'te api_key_prefix cache
6. **Body hash upgrade** — DefaultHasher → SHA-256
7. **Profile validation** — Email domain check, name max length
8. **Stuck delivery detection** — Queue publish hatası → delivery "failed"
9. **Background job health check** — JoinSet veya watchdog

### 🟢 Sonraki Sprint
10. **Dead code temizliği** — industry/, ws/, fifo/ modüllerini kontrol et
11. **OpenAPI spec doldurma**
12. **Migration refactor** — 43 migration'ı modüler dosyalara böl
13. **Load test** — k6 ile gerçek trafik simülasyonu

---

## 🔐 Güvenlik Kontrol Listesi

| Kontrol | Durum | Not |
|---------|-------|-----|
| SQL Injection | ✅ Güvenli | sqlx parameterized queries |
| XSS | ✅ Güvenli | API-only, JSON response |
| CSRF | ⚠️ Orta | SameSite=None cookie riski |
| SSRF | ✅ Güvenli | Kapsamlı IP engelleme |
| Timing Attack | ✅ Güvenli | Constant-time comparison |
| Secret Logging | ⚠️ Risk | Config Debug'da secret'lar |
| Rate Limiting | ✅ Güvenli | Plan-based, Redis destekli |
| Replay Attack | ✅ Güvenli | Timestamp + seen_webhooks |
| Brute Force | ✅ Güvenli | Login rate limit (10/15min) |
| Password Storage | ✅ Güvenli | Argon2id |
| API Key Storage | ✅ Güvenli | Argon2id + prefix lookup |
| JWT | ✅ Güvenli | Short-lived (15min) + refresh |
| 2FA | ✅ Güvenli | TOTP RFC 6238 |
| Email Enumeration | ✅ Güvenli | Always-same-response pattern |

---

## 📊 Kod İstatistikleri

| Metrik | Değer |
|--------|-------|
| Toplam Rust satırı | 32,940 |
| Kaynak dosya | 76 |
| Migration | 43 |
| Route handler | ~80+ |
| Test fonksiyonu | ~200+ |
| DB tablo | ~30 |
| Background job | 3 |
| Middleware | 5 |

---

*Bu analiz satır satır kod incelemesiyle hazırlanmıştır. Her modül okunmuş, değerlendirilmiştir.*
