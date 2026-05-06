# HookSniff Unit Test Önerileri

Bu doküman, HookSniff projesinde unit test yazılması gereken modülleri ve spesifik test senaryolarını listeler.

---

## 1. API Handlers (`api/src/routes/*`)

Her handler için önerilen testler:

### `auth.rs` — Kimlik Doğrulama
- `register` — Yeni kullanıcı kaydı başarılı
- `register` — Duplicate email reddedilmeli (409)
- `register` — Geçersiz email formatı reddedilmeli (400)
- `register` — Zayıf şifre reddedilmeli (400)
- `login` — Doğru bilgilerle giriş başarılı
- `login` — Yanlış şifre → 401
- `login` — Var olmayan kullanıcı → 401
- `login` — Rate limiting (brute force koruması)

### `endpoints.rs` — Endpoint Yönetimi
- `create` — Geçerli URL ile endpoint oluşturma
- `create` — Geçersiz URL formatı → 400
- `create` — Eksik zorunlu alanlar → 400
- `create` — Duplicate URL (idempotent mi?)
- `list` — Pagination doğru çalışıyor mu
- `list` — Boş liste dönebilmeli
- `get` — Var olan endpoint getirme
- `get` — Var olmayan endpoint → 404
- `update` — URL ve description güncelleme
- `update` — Kısmi update (sadece description)
- `delete` — Silme başarılı
- `delete` — Silinen endpoint → 404
- `delete` — İlişkili webhook'lar ne oluyor?

### `webhooks.rs` — Webhook Gönderimi
- `send` — Geçerli payload ile webhook gönderimi
- `send` — Var olmayan endpoint_id → 404
- `send` — Büyük payload (>1MB) — sınır kontrolü
- `send` — Boş data field'ı
- `list` — Pagination
- `list` — Filtreleme (event type, status, tarih aralığı)
- `get` — Webhook detayı getirme
- `get` — Attempts listesi
- `replay` — Başarılı replay
- `replay` — Var olmayan webhook → 404
- `batch` — Toplu gönderim
- `batch` — Kısmi başarısızlık (bazıları hatalı)
- `export` — JSON format export
- `export` — CSV format export (varsa)

### `api_keys.rs` — API Key Yönetimi
- `create` — Yeni key oluşturma
- `create` — İsim zorunlu mu?
- `list` — Kullanıcının key'lerini listeleme
- `delete` — Key silme
- `delete` — Başkasının key'ini silme → 403
- Auth: API key ile endpoint erişimi
- Auth: Geçersiz API key → 401

### `stats.rs` — İstatistikler
- `get` — Tüm istatistikler doğru mu
- `get` — Tarih filtreleme
- `get` — Boş veri durumu (yeni hesap)

### `health.rs` — Sağlık Kontrolü
- `health` — 200 döndürüyor
- `health` — Bağımlılıklar (DB) durumu

### `search.rs` — Arama
- `search` — Anahtar kelime ile arama
- `search` — Boş query
- `search` — Sonuç bulunamama durumu
- `search` — Special karakterler (SQL injection koruması)

### `analytics.rs` — Analitik
- `deliveries` — Doğru aggregation
- `deliveries` — Zaman aralığı filtreleme

### `templates.rs` — Şablonlar
- `list` — Şablon listesi
- `get` — Şablon detayı
- `create` — Yeni şablon (varsa)

### `alerts.rs` — Alarmlar
- `create` — Alarm kuralı oluşturma
- `list` — Alarm listesi
- `delete` — Alarm silme

### `routing.rs` — Routing
- `create` — Routing kuralı oluşturma
- `list` — Routing kuralları
- `update` — Kural güncelleme

### `billing.rs` — Faturalandırma
- `plans` — Plan listesi
- `subscribe` — Plan aboneliği
- `usage` — Kullanım bilgisi

---

## 2. Database (`api/src/db.rs`)

### Migration Testleri
- `migrate` — Tüm migration'lar sorunsuz çalışmalı
- `migrate` — Idempotent (tekrar çalıştırılabilir)
- `rollback` — Geri alma çalışmalı (varsa)

### Query Testleri
- `insert_endpoint` — Endpoint ekleme
- `get_endpoint` — Endpoint getirme
- `list_endpoints` — Pagination ile listeleme
- `update_endpoint` — Güncelleme
- `delete_endpoint` — Soft delete mi, hard delete mi?
- `insert_delivery` — Delivery kaydı
- `get_delivery` — Delivery detayı
- `update_delivery_status` — Durum güncelleme
- `insert_dead_letter` — Dead letter kaydı
- `get_stats` — İstatistik aggregation'ı doğru mu

### Connection Pool Testleri
- Pool boyutu doğru mu
- Timeout davranışı
- Concurrent access

---

## 3. Worker Activities (`worker/src/activities/*`)

### `deliver_webhook` Activity
- ✅ Başarılı 200 yanıtı → success=true
- ✅ 4xx yanıtı → success=false, status_code doğru
- ✅ 5xx yanıtı → success=false
- ✅ Timeout → error mesajı doğru
- ✅ Connection refused → error mesajı doğru
- ✅ HMAC signature header'ı doğru mu (`X-HookSniff-Signature`)
- ✅ Custom header'lar ekleniyor mu
- ✅ Large response body truncate ediliyor mu (1000 char)
- ✅ `X-HookSniff-Delivery-Id` header'ı doğru mu
- ✅ `X-HookSniff-Attempt` header'ı doğru mu

### `record_delivery_attempt` Activity
- ✅ Attempt kaydı insert ediliyor
- ✅ Delivery status güncelleniyor
- ✅ attempt_count artıyor
- ✅ last_attempt_at güncelleniyor
- ✅ DB hatası → ActivityError dönüşü

### `move_to_dead_letter` Activity
- ✅ Dead letter'a kopyalama
- ✅ Delivery status = 'failed' güncelleme
- ✅ reason field'ı doğru yazılıyor

### `publish_to_kafka` Activity
- ✅ Doğru topic'e publish
- ✅ Key = delivery_id
- ✅ JSON format doğru
- ✅ Kafka down → hata yönetimi
- ✅ Producer yoksa yeni oluşturuluyor

### `trigger_agents` Activity
- ✅ AI center'a POST isteği
- ✅ Başarılı yanıt → agents_triggered parse
- ✅ AI center down → hata yönetimi (delivery'ı bloklamamalı)
- ✅ Timeout → graceful failure
- ✅ AI_CENTER_URL env yoksa no-op

### `signing.rs`
- ✅ HMAC-SHA256 doğru hesaplanıyor
- ✅ Boş secret ile hata
- ✅ Boş payload ile hata
- ✅ Farklı secret → farklı signature

### `fanout.rs`
- ✅ Tek endpoint'e fanout
- ✅ Çoklu endpoint'e fanout
- ✅ Endpoint filtreleme (event type matching)

### `retry_scheduler.rs`
- ✅ Exponential backoff doğru mu
- ✅ Max retry sayısı
- ✅ Dead letter'a geçiş koşulu

---

## 4. Rate Limiter (`api/src/throttle/mod.rs`)

### Token Bucket / Sliding Window Testleri
- ✅ İlk istek geçiyor
- ✅ Limit aşıldığında 429 dönüyor
- ✅ Window reset sonrası tekrar geçiyor
- ✅ Farklı kullanıcılar bağımsız limitleniyor
- ✅ Concurrent istekler doğru sayılıyor
- ✅ Rate limit header'ları doğru mu (`X-RateLimit-Remaining`, `Retry-After`)

### Edge Cases
- ✅ Sınırda (tam limit sayısı) — bir fazlası 429
- ✅ Çok yüksek concurrency (100+ paralel istek)
- ✅ Clock skew toleransı

---

## 5. Cross-Cutting Concerns

### Validation (`api/src/validation.rs`)
- ✅ Email format validasyonu
- ✅ URL format validasyonu
- ✅ UUID format validasyonu
- ✅ JSON schema validasyonu
- ✅ XSS prevention (input sanitization)
- ✅ SQL injection prevention

### Config (`api/src/config.rs`, `worker/src/config.rs`)
- ✅ Env var okuma
- ✅ Default değerler
- ✅ Geçersiz değer → hata

### Metrics (`api/src/metrics.rs`)
- ✅ Counter artışları
- ✅ Histogram doğru bucket'lar
- ✅ Label doğru mu

---

## 6. Test Altyapısı Önerileri

### Framework
- **Rust**: `cargo test` + `tokio::test` (async testler için)
- **Mock**: `mockall` crate — HTTP client ve DB pool mocklama
- **DB**: `sqlx::test` attribute — test veritabanı otomatik oluşturma
- **Fixtures**: `tests/fixtures/` dizinindeki JSON'ları kullan

### Test Helpers
```rust
// Örnek test helper yapısı
#[cfg(test)]
mod test_helpers {
    use sqlx::PgPool;

    pub async fn setup_test_db() -> PgPool {
        // Test DB oluştur, migration çalıştır
    }

    pub fn sample_endpoint() -> CreateEndpointRequest {
        CreateEndpointRequest {
            url: "https://httpbin.org/post".into(),
            description: "test".into(),
            events: vec!["order.created".into()],
        }
    }

    pub fn sample_webhook(endpoint_id: &str) -> SendWebhookRequest {
        SendWebhookRequest {
            endpoint_id: endpoint_id.into(),
            event: "order.created".into(),
            data: serde_json::json!({"order_id": "ORD-1"}),
        }
    }
}
```

### CI Entegrasyonu
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: hooksniff
          POSTGRES_PASSWORD: hooksniff_local
          POSTGRES_DB: hooksniff
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - run: cargo test --workspace
```

---

## Öncelik Sıralaması

| Öncelik | Modül | Neden |
|---------|-------|-------|
| 🔴 Yüksek | `auth.rs` | Güvenlik kritik |
| 🔴 Yüksek | `webhooks.rs` | Core işlev |
| 🔴 Yüksek | `deliver_webhook` activity | Core işlev |
| 🔴 Yüksek | `rate_limit` | Abuse koruması |
| 🟡 Orta | `endpoints.rs` | CRUD operations |
| 🟡 Orta | `api_keys.rs` | Auth flow |
| 🟡 Orta | `signing.rs` | Güvenlik |
| 🟢 Düşük | `stats.rs` | Read-only |
| 🟢 Düşük | `analytics.rs` | Read-only |
| 🟢 Düşük | `templates.rs` | Nice-to-have |
