# 🔍 Worker (Rust) — Kapsamlı Kod Analizi

> Tarih: 2026-05-10
> Satır: 2,379 Rust kodu
> Dosya: 10 kaynak dosya
> İnceleme: Satır satır, modül modül

---

## 📊 Genel Değerlendirme

| Kategori | Puan | Not |
|----------|------|-----|
| Güvenlik | 8/10 | Standard Webhooks uyumlu |
| Kod Kalitesi | 8/10 | Temiz, iyi yapılandırılmış |
| Güvenilirlik | 9/10 | Zombie reaper, orphan recovery |
| Performans | 8/10 | FOR UPDATE SKIP LOCKED, batch secret fetch |
| Bakım | 7/10 | Temporal artıkları temizlenmeli |

---

## 🟢 İYİ UYGULAMALAR

### 1. PostgreSQL LISTEN/NOTIFY + Poll Fallback ✅
```rust
tokio::select! {
    result = listener.recv() => { /* NOTIFY — instant wake */ }
    _ = tokio::time::sleep(1s) => { /* Fallback poll */ }
    _ = reaper_interval.tick() => { /* Zombie recovery */ }
}
```
**Neden iyi**: Kafka/Temporal yok. Basit, güvenilir, Cloud Run uyumlu. NOTIFY <10ms gecikme, 1s poll fallback güvenilirlik sağlar.

### 2. FOR UPDATE SKIP LOCKED ✅
```sql
UPDATE webhook_queue SET status = 'processing'
WHERE id IN (
    SELECT id FROM webhook_queue WHERE status = 'pending'
    ORDER BY created_at LIMIT 50
    FOR UPDATE SKIP LOCKED
)
```
**Neden iyi**: Paralel worker'larda deadlock yok. Bir record bir worker tarafından alınırken diğeri atlanır.

### 3. Zombie Reaper ✅
- 5 dakikadan uzun "processing" kayıtlarını kurtarır
- Max attempts aşılmışsa dead letter'a gönderir
- Attempt count artırarak tekrar dener

### 4. Orphaned Delivery Recovery ✅
- 10 dakikadan uzun "pending" + queue'da olmayan deliveries'ı bulur
- Tekrar queue'ya ekler (ON CONFLICT DO NOTHING ile güvenli)

### 5. Batch Secret Fetch (N+1 Önleme) ✅
```rust
let endpoint_ids: Vec<Uuid> = items.iter().map(|i| i.endpoint_id).collect();
let secret_rows = sqlx::query_as("SELECT id, signing_secret FROM endpoints WHERE id = ANY($1)")
    .bind(&unique_vec).fetch_all(pool).await?;
```
**Neden iyi**: 50 delivery için 50 ayrı query yerine 1 batch query.

### 6. Graceful Shutdown ✅
- SIGTERM/SIGINT yakalama
- In-flight delivery'lerin bitmesini bekler
- OpenTelemetry flush before exit

### 7. Health Check Server ✅
- Cloud Run gerektirdiği için PORT=8080'de HTTP health endpoint
- Minimal, gereksiz dependency yok

### 8. Exponential Backoff ✅
```rust
fn calculate_backoff(attempt: i32) -> i64 {
    let base = 30_i64;
    let delay = base * 2_i64.pow((attempt - 1).max(0) as u32);
    delay.min(1800) // Max 30 dakika
}
```
30s → 60s → 120s → 300s → 600s → 1800s (max). İyi tasarlanmış.

---

## 🔴 KRİTİK SORUNLAR

### 1. 🔴 `deliver_http` — Response Header Sızıntısı
**Dosya**: `delivery/http.rs`
```rust
let resp_headers: serde_json::Value = serde_json::json!(response
    .headers()
    .iter()
    .map(|(k, v)| (k.as_str().to_string(), v.to_str().unwrap_or("").to_string()))
    .collect::<std::collections::HashMap<String, String>>());
```
**Sorun**: Tüm response header'ları `delivery_attempts` tablosuna kaydediliyor. Bunlar arasında `Set-Cookie`, `Authorization`, `X-Internal-*` gibi hassas header'lar olabilir.
**Öneri**: Sadece güvenli header'ları kaydet (Content-Type, X-Request-Id vb.) veya header allowlist kullan.

### 2. 🔴 `deliver_http` — Timeout Yetersiz
**Dosya**: `main.rs`
```rust
let http_client = reqwest::Client::builder()
    .timeout(std::time::Duration::from_secs(30))
    .build()?;
```
**Sorun**: 30 saniye timeout. Yavaş endpoint'ler tüm batch'i bloklayabilir. 50 item × 30s = 25 dakika potansiyel bekleme.
**Öneri**: Per-request timeout 10s, connect timeout 5s. Batch'i paralel çalıştır (tokio::join_all veya buffer_unordered).

### 3. 🔴 `fanout.rs` — `deliver_to_target` Yanlış Router Kullanımı
**Dosya**: `fanout.rs`
```rust
async fn deliver_to_target(&self, target_id: Uuid, webhook: &WebhookMessage, rule: &FanoutRule) -> ... {
    // Target config'i yükle
    let target = sqlx::query_as("SELECT target_type, config FROM delivery_targets WHERE id = $1")...
    
    // Ama sonra delivery_router.deliver(webhook) çağırıyor!
    let results = self.delivery_router.deliver(webhook).await?;
}
```
**Sorun**: Target config'i yüklüyor ama kullanmıyor. `delivery_router.deliver()` çağrıldığında, router kendi target'larını yükler (endpoint_id bazlı). Bu durumda fanout target'ı hiç kullanılmaz, her zaman default HTTP delivery yapılır.
**Etki**: Fanout feature'ı tamamen işlevsiz.

### 4. 🔴 `fanout.rs` — `send_to_dead_letter` customer_id = Uuid::nil()
**Dosya**: `fanout.rs`
```rust
async fn send_to_dead_letter(&self, ...) {
    sqlx::query("INSERT INTO dead_letters ...")
        .bind(Uuid::nil()) // customer_id!
```
**Sorun**: customer_id NULL UUID olarak kaydedilior. Dead letter tablosunda customer_id foreign key constraint varsa crash olur, yoksa orphan data oluşur.

---

## 🟡 ORTA SEVİYE SORUNLAR

### 1. 🟡 `workflows/mod.rs` ve `activities/mod.rs` — Dead Code
```rust
// workflows/mod.rs: "This module is intentionally empty."
// activities/mod.rs: "Previously used Temporal SDK. Now uses direct function calls."
```
**Sorun**: `activities/mod.rs`'deki fonksiyonlar (`record_delivery_attempt`, `move_to_dead_letter`, `trigger_agents`) hiçbir yerden çağrılmıyor. `main.rs` kendi inline SQL'lerini kullanıyor.
**Öneri**: Ya bu fonksiyonları kullan (kod tekrarını azalt) ya da modülü sil.

### 2. 🟡 `signing.rs` — Kod Tekrarı (API ile Aynı)
Worker'daki `signing.rs` neredeyse API'deki ile aynı. İki yerde bakım yapılması gerekiyor.
**Öneri**: Shared crate veya workspace dependency olarak birleştir.

### 3. 🟡 Batch Processing — Paralel Değil
```rust
for item in items {
    // Her item sırayla işleniyor
    let result = delivery::deliver_http(http_client, &webhook_msg, attempt).await?;
}
```
**Sorun**: 50 item sırayla işleniyor. Bir yavaş endpoint tüm batch'i bloklar.
**Öneri**: `futures::stream::iter(items).map(...).buffer_unordered(10).collect().await` ile paralel processing.

### 4. 🟡 PgListener Reconnect — Exponential Backoff Yok
```rust
Err(e) => {
    match PgListener::connect(&cfg.database_url).await {
        Ok(mut new_listener) => { ... }
        Err(conn_err) => {
            tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        }
    }
}
```
**Sorun**: DB bağlantısı kesilirse her saniye tekrar deneyebilir. Exponential backoff olmalı.

### 5. 🟡 `deliver_http` — Custom Header Injection Riski
```rust
if let Some(ref headers) = webhook.custom_headers {
    if let Some(obj) = headers.as_object() {
        for (key, value) in obj {
            req_builder = req_builder.header(key.as_str(), val);
        }
    }
}
```
**Sorun**: Kullanıcı `Host`, `Content-Length`, `Transfer-Encoding` gibi kritik header'ları enjekte edebilir.
**Öneri**: Blocked header listesi oluştur.

### 6. 🟡 `truncate_str` — UTF-8 Boundary Panic Riski
```rust
pub fn truncate_str(s: &str, max_len: usize) -> String {
    let mut end = max_len;
    while end > 0 && !s.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}...", &s[..end])
}
```
**İyi**: Char boundary kontrolü var. Ama `max_len` byte olarak çalışıyor, karakter olarak değil. Türkçe karakterlerde farklı sonuç verebilir.

---

## 🟢 DÜŞÜK SEVİYE / GÖZLEM

### 1. ✅ `telemetry.rs` — current_trace_id() iyi implemente edilmiş
- OpenTelemetry span context'ten trace ID çıkarır
- 32 hex formatında (standard)
- Geçersiz context'te None döner

### 2. ⚠️ `config.rs` — Minimal Config
- Sadece `database_url` ve OTEL ayarları
- `DATABASE_URL` default'unda `sslmode=disable` — production'da SSL zorunlu olmalı

### 3. ⚠️ Error Handling — Genel Olarak İyi ama Tutarlı Değil
- Bazı yerlerde `?` operatorü (propagate), bazı yerlerde `match` (handle)
- `process_pending` fonksiyonunda hatalar loglanıyor ama retry edilmiyor

---

## 📋 Öncelikli Aksiyon Listesi

### 🔴 Yayından Önce
1. **Fanout fix** — `deliver_to_target'ı gerçekten target config ile çalıştır
2. **Custom header injection** — Blocked header listesi ekle
3. **Response header filtering** — Hassas header'ları kaydetme

### 🟡 Yayına Yakın
4. **Paralel batch processing** — `buffer_unordered` ile concurrent delivery
5. **Timeout tuning** — Connect 5s, request 10s
6. **Dead code temizliği** — workflows/ ve activities/ modüllerini temizle veya kullan
7. **Signing kodunu birleştir** — Shared crate

### 🟢 Sonraki Sprint
8. **PgListener reconnect backoff**
9. **SSL zorunluluğu** — Production'da `sslmode=require`
10. **Metrics** — Worker'a Prometheus metrics ekle

---

## 📊 Worker İstatistikleri

| Metrik | Değer |
|--------|-------|
| Toplam Rust satırı | 2,379 |
| Kaynak dosya | 10 |
| Background loop | 3 (poll, reaper, health) |
| Delivery target | 2 (HTTP, Email) |
| Retry stratejisi | Exponential backoff (30s-30min) |
| Batch size | 50 |
| Concurrency | FOR UPDATE SKIP LOCKED |
| Zombie timeout | 5 dakika |
| Orphan timeout | 10 dakika |

---

## 🔐 Güvenlik Kontrol Listesi

| Kontrol | Durum | Not |
|---------|-------|-----|
| SSRF | ⚠️ Eksik | Worker'da endpoint URL doğrulaması yok |
| Header Injection | ⚠️ Risk | Custom header allowlist yok |
| Response Sızıntısı | ⚠️ Risk | Tüm response header'ları kaydediliyor |
| Signature | ✅ Güvenli | Standard Webhooks HMAC-SHA256 |
| Replay | ✅ Güvenli | Timestamp tolerance (API'de) |
| SQL Injection | ✅ Güvenli | sqlx parameterized queries |
| Secret Logging | ✅ Güvenli | signing_secret loglanmıyor |

---

*Bu analiz satır satır kod incelemesiyle hazırlanmıştır.*
