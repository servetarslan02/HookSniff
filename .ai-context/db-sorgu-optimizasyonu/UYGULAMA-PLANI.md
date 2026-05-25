# 🚀 DB Sorgu Optimizasyonu — Aşamalı Uygulama Planı

> **Başlangıç:** 2026-05-26
> **Hedef:** Slow query'leri tespit edip optimize etmek
> **Mevcut:** Bazı sorgular 50-200ms → **Hedef: Tüm sorgular < 5ms**
> **Ek Maliyet:** $0

---

## 📖 İçindekiler

1. [Mevcut Durum & Darboğazlar](#1-mevcut-durum--darboğazlar)
2. [Sektör Karşılaştırması & Tezler](#2-sektör-karşılaştırması--tezler)
3. [Faz 1: Slow Query Log Açma](#3-faz-1-slow-query-log-açma)
4. [Faz 2: Index Optimizasyonu](#4-faz-2-index-optimizasyonu)
5. [Faz 3: N+1 Sorgu Tespiti](#5-faz-3-n1-sorgu-tespiti)
6. [Faz 4: Query Plan Analizi](#6-faz-4-query-plan-analizi)
7. [Faz 5: Connection Pool & Prepared Statements](#7-faz-5-connection-pool--prepared-statements)
8. [Grafana Metrikleri & Monitoring](#8-grafana-metrikleri--monitoring)
9. [Test & Doğrulama](#9-test--doğrulama)
10. [Rollback Planı](#10-rollback-planı)
11. [Zaman Çizelgesi](#11-zaman-çizelgesi)

---

## 1. Mevcut Durum & Darboğazlar

### Veritabanı Kullanım Analizi

HookSniff'te DB'nin yoğun kullanıldığı alanlar:

| Alan | Sıklık | Mevcut Süre | Hedef |
|------|--------|-------------|-------|
| Webhook kabul (INSERT delivery) | Her webhook | ~10ms | < 5ms |
| Endpoint lookup | Her webhook | ~10ms | < 2ms |
| Signing secret | Her webhook | ~10ms | < 2ms |
| Plan limit check | Her webhook | ~10ms | < 2ms |
| Idempotency check | Her webhook | ~10ms | < 2ms |
| Content dedup | Her webhook | ~10ms | < 5ms |
| Delivery status update | Her teslimat | ~10ms | < 5ms |
| Analytics sorguları | Dashboard | ~50-200ms | < 20ms |
| Search sorguları | Dashboard | ~50-200ms | < 20ms |

### Mevcut Index Durumu

```sql
-- migrations/ dosyalarında tanımlı index'ler
-- 99_security_indexes.sql son eklenen

-- Temel index'ler (muhtemelen var):
-- deliveries: id (primary), endpoint_id
-- endpoints: id (primary), customer_id
-- customers: id (primary), email
-- webhook_queue: id (primary), delivery_id, status
```

### Tespit Edilen Potansiyel Sorunlar

| # | Sorun | Etki | Öncelik |
|---|-------|------|---------|
| 1 | Slow query log yok | Yavaş sorgular tespit edilemiyor | 🔴 Kritik |
| 2 | Eksik index'ler olabilir | Sequential scan | 🔴 Kritik |
| 3 | N+1 sorgu pattern | Gereksiz DB yükü | 🟡 Yüksek |
| 4 | SELECT * kullanımı | Gereksiz data transferi | 🟡 Yüksek |
| 5 | Prepared statement yok | Query plan cache yok | 🟢 Orta |
| 6 | ANALYZE çalıştırılmamış | Query planner yanlış tahmin | 🟢 Orta |

---

## 2. Sektör Karşılaştırması & Tezler

### Tez 1: Neden Slow Query Log?

Yavaş sorguları tespit etmeden optimize edemezsin. Önce ölç, sonra optimize et.

| Durum | Slow Query Log Yok | Slow Query Log Var |
|-------|-------------------|-------------------|
| Yavaş sorgu tespiti | Tahmin | Kesin veri |
| Optimizasyon önceliği | Bilinmiyor | En yavaş sorgu önce |
| Regresyon tespiti | İmkansız | Otomatik alert |

### Tez 2: Neden Index?

Bir sorgu 100ms sürüyorsa, muhtemelen sequential scan yapıyor. Doğru index ile 1ms'ye düşer.

| Durum | Index Yok | Index Var |
|-------|-----------|-----------|
| 1M satır arama | ~100ms (sequential scan) | ~1ms (index scan) |
| JOIN performansı | Yavaş | Hızlı |
| ORDER BY | Yavaş (sort) | Hızlı (index order) |

### Tez 3: Neden N+1 Tespiti?

N+1 sorgu: 1 ana sorgu + N alt sorgu = N+1 DB roundtrip. Toplu sorgu ile 1'e düşer.

| Durum | N+1 (100 endpoint) | Toplu Sorgu |
|-------|-------------------|-------------|
| DB roundtrip | 101 | 1 |
| Toplam süre | ~500ms | ~5ms |

---

## 3. Faz 1: Slow Query Log Açma

> **Süre:** 1 oturum | **Etki:** Yavaş sorgular tespit edilir | **Risk:** Çok düşük

### 3.1 Neon Slow Query Log

Neon dashboard'dan slow query log açılabilir:

```
Neon Dashboard → Settings → Query Log → Enable
Threshold: 100ms (100ms üzeri sorguları kaydet)
```

### 3.2 sqlx ile Query Timing

```rust
// api/src/db.rs — Query timing middleware

use std::time::Instant;
use sqlx::postgres::PgPoolOptions;

/// Slow query threshold
const SLOW_QUERY_THRESHOLD_MS: u64 = 100;

/// Query timing wrapper
pub async fn timed_query<F, T>(query_name: &str, f: F) -> Result<T>
where
    F: std::future::Future<Output = Result<T>>,
{
    let start = Instant::now();
    let result = f.await;
    let duration = start.elapsed();

    if duration.as_millis() > SLOW_QUERY_THRESHOLD_MS as u128 {
        tracing::warn!(
            query = query_name,
            duration_ms = duration.as_millis() as u64,
            "⚠️ Slow query detected"
        );
        metrics::SLOW_QUERY_COUNT.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    }

    // Her sorguyu kaydet (debug modunda)
    tracing::debug!(
        query = query_name,
        duration_ms = duration.as_millis() as u64,
        "Query executed"
    );

    result
}

// Kullanım:
let endpoints = timed_query("endpoints_by_customer", async {
    sqlx::query_as::<_, Endpoint>(
        "SELECT id, url, description FROM endpoints WHERE customer_id = $1"
    )
    .bind(customer_id)
    .fetch_all(&pool)
    .await
}).await?;
```

### 3.3 pg_stat_statements (Neon)

Neon'da `pg_stat_statements` extension'ı var. En yavaş sorguları listeler:

```sql
-- En yavaş 10 sorgu
SELECT
    query,
    calls,
    total_exec_time / calls as avg_time_ms,
    rows / calls as avg_rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- En çok çağrılan 10 sorgu
SELECT
    query,
    calls,
    total_exec_time / calls as avg_time_ms
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

### 3.4 Faz 1 Doğrulama

- [ ] Slow query log Neon'da aktif
- [ ] Query timing wrapper çalışıyor
- [ ] 100ms üzeri sorgular loglanıyor
- [ ] pg_stat_statements sorgulanabiliyor

---

## 4. Faz 2: Index Optimizasyonu

> **Süre:** 1-2 oturum | **Etki:** Sequential scan → Index scan | **Risk:** Düşük

### 4.1 Eksik Index Tespiti

```sql
-- Sequential scan yapan sorguları bul
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    seq_tup_read / GREATEST(seq_scan, 1) as avg_rows_per_scan
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

### 4.2 Potansiyel Index'ler

```sql
-- deliveries tablosu (en çok sorgulanan)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_endpoint_id
    ON deliveries(endpoint_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_status
    ON deliveries(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_created_at
    ON deliveries(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_customer_created
    ON deliveries(customer_id, created_at DESC);

-- webhook_queue tablosu
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_queue_status_next_retry
    ON webhook_queue(status, next_retry_at)
    WHERE status = 'pending';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_queue_delivery_id
    ON webhook_queue(delivery_id);

-- endpoints tablosu
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_endpoints_customer_id
    ON endpoints(customer_id);

-- customers tablosu
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email
    ON customers(email);

-- api_keys tablosu
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_key_hash
    ON api_keys(key_hash);

-- dead_letters tablosu
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dead_letters_created_at
    ON dead_letters(created_at DESC);
```

### 4.3 Gereksiz Index Tespiti

```sql
-- Kullanılmayan index'ler
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 4.4 Index Boyut Takibi

```sql
-- Index boyutları
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### 4.5 Faz 2 Doğrulama

- [ ] `EXPLAIN ANALYZE` ile index kullanımı doğrulandı
- [ ] Sequential scan sayısı azaldı
- [ ] Slow query sayısı azaldı
- [ ] Index boyutu makul (< 100MB toplam)

---

## 5. Faz 3: N+1 Sorgu Tespiti

> **Süre:** 1 oturum | **Etki:** 101 sorgu → 1 sorgu | **Risk:** Düşük

### 5.1 N+1 Tespiti

```rust
// N+1 pattern örneği (KAÇINILMALI):
// 1. Tüm endpoint'leri çek
let endpoints = sqlx::query_as::<_, Endpoint>(
    "SELECT * FROM endpoints WHERE customer_id = $1"
).bind(customer_id).fetch_all(&pool).await?;

// 2. Her endpoint için signing secret çek (N+1!)
for ep in &endpoints {
    let secret = sqlx::query_scalar::<_, String>(
        "SELECT signing_secret FROM endpoints WHERE id = $1"
    ).bind(ep.id).fetch_one(&pool).await?;
    // ...
}
```

### 5.2 Toplu Sorgu (Batch)

```rust
// Doğru yaklaşım — tek sorgu:
let endpoints = sqlx::query_as::<_, Endpoint>(
    "SELECT id, url, signing_secret, description FROM endpoints WHERE customer_id = $1"
).bind(customer_id).fetch_all(&pool).await?;

// VEYA — IN ile toplu sorgu:
let endpoint_ids: Vec<Uuid> = vec![...];
let secrets = sqlx::query_as::<_, (Uuid, String)>(
    "SELECT id, signing_secret FROM endpoints WHERE id = ANY($1)"
).bind(&endpoint_ids).fetch_all(&pool).await?;
```

### 5.3 Mevcut N+1 Potansiyelleri

| Dosya | Sorgu | Potansiyel N+1 |
|-------|-------|----------------|
| `middleware/mod.rs` | Auth lookup | Düşük (cache var) |
| `routes/webhooks/` | Endpoint lookup | Orta (batch yapılabilir) |
| `routes/analytics/` | Delivery stats | Yüksek (per-endpoint sorgu) |
| `routes/teams/` | Member lookup | Orta (batch yapılabilir) |

### 5.4 Faz 3 Doğrulama

- [ ] N+1 sorgular tespit edildi
- [ ] Toplu sorgulara dönüştürüldü
- [ ] DB roundtrip sayısı azaldı
- [ ] Sorgu süresi azaldı

---

## 6. Faz 4: Query Plan Analizi

> **Süre:** 1 oturum | **Etki:** Query planner doğru karar verir | **Risk:** Çok düşük

### 6.1 EXPLAIN ANALYZE

```sql
-- En yavaş sorguları analiz et
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM deliveries
WHERE endpoint_id = '...'
AND created_at > now() - interval '7 days'
ORDER BY created_at DESC
LIMIT 50;

-- Sonuç:
-- Index Scan using idx_deliveries_endpoint_id on deliveries
--   Index Cond: (endpoint_id = '...')
--   Filter: (created_at > now() - '7 days'::interval)
--   Rows Removed by Filter: 100
--   Planning Time: 0.1ms
--   Execution Time: 2.5ms  ✅
```

### 6.2 ANALYZE Komutu

```sql
-- Tablo istatistiklerini güncelle (query planner doğru tahmin yapsın)
ANALYZE deliveries;
ANALYZE endpoints;
ANALYZE customers;
ANALYZE webhook_queue;
ANALYZE api_keys;

-- Veya tüm tablolar:
ANALYZE;
```

### 6.3 Common Table Expressions (CTE)

```sql
-- ESKİ: Subquery (yavaş olabilir)
SELECT * FROM deliveries
WHERE endpoint_id IN (
    SELECT id FROM endpoints WHERE customer_id = '...'
);

-- YENİ: CTE (daha okunabilir, bazen daha hızlı)
WITH customer_endpoints AS (
    SELECT id FROM endpoints WHERE customer_id = '...'
)
SELECT d.* FROM deliveries d
JOIN customer_endpoints ce ON d.endpoint_id = ce.id;
```

### 6.4 Faz 4 Doğrulama

- [ ] Tüm slow sorgular EXPLAIN ANALYZE ile analiz edildi
- [ ] ANALYZE çalıştırıldı
- [ ] Query planner doğru index kullanıyor
- [ ] Execution time < 5ms

---

## 7. Faz 5: Connection Pool & Prepared Statements

> **Süre:** 1 oturum | **Etki:** Bağlantı overhead azalır | **Risk:** Düşük

### 7.1 sqlx Prepared Statements

```rust
// sqlx otomatik prepared statement kullanır
// Ama manuel olarak da yapılabilir:

let endpoint = sqlx::query_as::<_, Endpoint>(
    "SELECT id, url, signing_secret FROM endpoints WHERE id = $1"
)
.bind(endpoint_id)
.fetch_optional(&pool)
.prepare(&pool)  // Prepared statement olarak kaydet
.await?;
```

### 7.2 Connection Pool Monitoring

```rust
// db.rs — Pool durumunu izle
pub fn log_pool_status(pool: &PgPool) {
    let size = pool.size();
    let idle = pool.num_idle();
    tracing::debug!(
        pool_size = size,
        idle_connections = idle,
        active_connections = size - idle,
        "DB pool status"
    );
}
```

### 7.3 Neon Connection Pooling

Neon'un built-in connection pooler'ı var. Transaction modu kullan:

```
# Neon connection string (transaction mode)
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### 7.4 Faz 5 Doğrulama

- [ ] Prepared statements aktif
- [ ] Pool monitoring çalışıyor
- [ ] Connection acquisition timeout < 100ms
- [ ] Pool exhaustion hatası yok

---

## 8. Grafana Metrikleri & Monitoring

### 8.1 Yeni Metrikler

```rust
// api/src/metrics.rs

// Slow query count
pub static SLOW_QUERY_COUNT: AtomicU64 = AtomicU64::new(0);

// Query latency histogram (buckets: 1ms, 5ms, 10ms, 50ms, 100ms)
pub static QUERY_LATENCY_1MS: AtomicU64 = AtomicU64::new(0);
pub static QUERY_LATENCY_5MS: AtomicU64 = AtomicU64::new(0);
pub static QUERY_LATENCY_10MS: AtomicU64 = AtomicU64::new(0);
pub static QUERY_LATENCY_50MS: AtomicU64 = AtomicU64::new(0);
pub static QUERY_LATENCY_100MS: AtomicU64 = AtomicU64::new(0);

// Pool status
pub static POOL_SIZE: AtomicU64 = AtomicU64::new(0);
pub static POOL_IDLE: AtomicU64 = AtomicU64::new(0);
```

### 8.2 Grafana Dashboard Panelleri

```json
{
  "panels": [
    {
      "title": "Slow Query Sayısı",
      "targets": [{"expr": "hooksniff_slow_query_count"}],
      "type": "stat",
      "thresholds": [
        {"value": 0, "color": "green"},
        {"value": 10, "color": "yellow"},
        {"value": 100, "color": "red"}
      ]
    },
    {
      "title": "Query Latency Dağılımı",
      "targets": [
        {"expr": "hooksniff_query_latency_1ms", "legendFormat": "< 1ms"},
        {"expr": "hooksniff_query_latency_5ms", "legendFormat": "1-5ms"},
        {"expr": "hooksniff_query_latency_10ms", "legendFormat": "5-10ms"},
        {"expr": "hooksniff_query_latency_50ms", "legendFormat": "10-50ms"},
        {"expr": "hooksniff_query_latency_100ms", "legendFormat": "> 50ms"}
      ],
      "type": "pie"
    },
    {
      "title": "DB Pool Durumu",
      "targets": [
        {"expr": "hooksniff_pool_size", "legendFormat": "Total"},
        {"expr": "hooksniff_pool_idle", "legendFormat": "Idle"}
      ],
      "type": "timeseries"
    }
  ]
}
```

---

## 9. Test & Doğrulama

### 9.1 Slow Query Testi

```bash
# Neon dashboard'dan pg_stat_statements sorgula
# En yavaş 10 sorguyu listele
# Her birini EXPLAIN ANALYZE ile analiz et
```

### 9.2 Index Kullanım Testi

```sql
-- Index kullanılıyor mu?
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM deliveries WHERE endpoint_id = '...';

-- "Index Scan" görmeli, "Seq Scan" görmemeli
```

### 9.3 Before/After Karşılaştırma

| Metrik | Before | After | İyileşme |
|--------|--------|-------|----------|
| Slow query sayısı | Bilinmiyor | 0 | — |
| Avg query time | ~10ms | < 2ms | **5x** |
| p99 query time | ~100ms | < 10ms | **10x** |
| Sequential scan | Çok | Az | — |
| N+1 sorgu | Var | Yok | — |

---

## 10. Rollback Planı

```sql
-- Index'leri geri al (gerekirse)
DROP INDEX IF EXISTS idx_deliveries_endpoint_id;
DROP INDEX IF EXISTS idx_deliveries_status;
-- ... diğer index'ler

-- ANALYZE tekrar çalıştır
ANALYZE;
```

---

## 11. Zaman Çizelgesi

| Faz | Süre | Etki | Oturum |
|-----|------|------|--------|
| **Faz 1:** Slow Query Log | 1 oturum | Yavaş sorgular tespit | 1 |
| **Faz 2:** Index Optimizasyonu | 1-2 oturum | Seq scan → Index scan | 2-3 |
| **Faz 3:** N+1 Tespiti | 1 oturum | 101 sorgu → 1 sorgu | 4 |
| **Faz 4:** Query Plan Analizi | 1 oturum | Planner doğru karar | 5 |
| **Faz 5:** Pool & Prepared | 1 oturum | Bağlantı overhead | 6 |

**Toplam:** ~6 oturum, **$0 ek maliyet**

---

## 📚 Kaynaklar

- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html)
- [Neon Performance Tips](https://neon.tech/docs/postgresql/query-performance)
- [sqlx Performance](https://docs.rs/sqlx/latest/sqlx/)

---

*Bu plan HookSniff'in tüm DB sorgularını optimize etmeyi hedefler.*
*Son güncelleme: 2026-05-26*
