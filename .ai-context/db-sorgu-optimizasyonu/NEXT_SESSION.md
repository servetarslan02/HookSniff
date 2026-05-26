# 📋 Sonraki Oturum Rehberi — DB Sorgu Optimizasyonu

> **Son güncelleme:** 2026-05-26 (OpenClaw oturumu)

## 🚀 Hızlı Başlangıç

```bash
cd /root/.openclaw/workspace/HookSniff && git pull origin main
cat .ai-context/db-sorgu-optimizasyonu/NEXT_SESSION.md
```

## ✅ Tamamlanan (Bu Oturum)

### Faz 1: Slow Query Log — TAMAMLANDI ✅

| # | Adım | Dosya | Durum |
|---|------|-------|-------|
| 1 | Query timing wrapper | `api/src/db.rs` | ✅ `timed_query()` fonksiyonu |
| 2 | Slow query counter | `api/src/db.rs` | ✅ `SLOW_QUERY_COUNT` + `TOTAL_QUERY_COUNT` |
| 3 | Query stats export | `api/src/db.rs` | ✅ `query_stats()` fonksiyonu |
| 4 | Pool metrics | `api/src/metrics.rs` | ✅ `render_with_pool()` metodu |
| 5 | Prometheus metrics | `api/src/metrics.rs` | ✅ `hooksniff_slow_query_count`, `hooksniff_total_query_count`, `hooksniff_db_pool_*` |

### Faz 2: Index Optimizasyonu — BAŞLANDI

| # | Index | Dosya | Durum |
|---|-------|-------|-------|
| 1 | `idx_webhook_queue_status_updated` | `055_performance_indexes.sql` | ✅ |
| 2 | `idx_deliveries_customer_status_created` | `055_performance_indexes.sql` | ✅ |
| 3 | `idx_deliveries_failed_created` | `055_performance_indexes.sql` | ✅ |
| 4 | `idx_login_attempts_email_success` | `055_performance_indexes.sql` | ✅ |
| 5 | `idx_security_events_customer_severity` | `055_performance_indexes.sql` | ✅ |
| 6 | `idx_endpoints_customer_active` | `055_performance_indexes.sql` | ✅ |

## 🔜 Sıradaki Adımlar

### Öncelik Sırası

1. **`timed_query` entegrasyonu** — Kritik sorguları `timed_query` wrapper ile sarmala
   - `routes/webhooks/create.rs` — webhook kabul
   - `routes/auth/` — login/register
   - `routes/analytics/` — dashboard sorguları
   - `routes/health/` — health check sorguları
2. **pg_stat_statements** — Neon dashboard'dan slow query log aç
3. **EXPLAIN ANALYZE** — En yavaş 10 sorguyu analiz et
4. **N+1 taraması** — `routes/` klasöründe döngü içinde DB sorgusu ara

### Neon Dashboard İşlemleri (Servet yapacak)

1. Neon dashboard → Settings → Query Log → Enable (threshold: 100ms)
2. `pg_stat_statements` extension'ı aktif et
3. En yavaş sorguları paylaş

## 📊 Kullanım Örneği

```rust
// Kritik sorguları timed_query ile sarmala:
let endpoints = timed_query("endpoints_by_customer", async {
    sqlx::query_as::<_, Endpoint>(
        "SELECT id, url, description, is_active FROM endpoints WHERE customer_id = $1"
    )
    .bind(customer_id)
    .fetch_all(&pool)
    .await
})
.await?;
```

## 📈 Prometheus Metrikleri (Grafana)

Yeni metrikler eklendi:

```
# Slow query sayısı
hooksniff_slow_query_count

# Toplam sorgu sayısı
hooksniff_total_query_count

# DB pool durumu
hooksniff_db_pool_size
hooksniff_db_pool_idle
hooksniff_db_pool_active
```

Grafana'da yeni panel ekle:
- Query: `hooksniff_slow_query_count`
- Type: Stat
- Thresholds: 0=green, 10=yellow, 100=red

---

*Bu dosya her oturumda güncellenir.*
