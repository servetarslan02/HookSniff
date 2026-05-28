# 📋 Sonraki Oturum Rehberi — DB Sorgu Optimizasyonu

> **Son güncelleme:** 2026-05-29 (OpenClaw oturumu)

## ✅ Tamamlanan

### Faz 1: Slow Query Log — TAMAMLANDI ✅
- `timed_query()` wrapper, slow query counter, Prometheus metrics

### Faz 2: timed_query Entegrasyonu — BAŞLANDI ✅

| # | Sorgu | Dosya | Durum |
|---|-------|-------|-------|
| 1 | webhook_dedup_check | webhooks/create.rs | ✅ |
| 2 | webhook_create_delivery | webhooks/create.rs | ✅ |
| 3 | webhook_batch_endpoints | webhooks/create.rs | ✅ |
| 4 | webhook_batch_create_delivery | webhooks/create.rs | ✅ |
| 5 | auth_login_lookup | auth/credentials.rs | ✅ |
| 6 | auth_register_check | auth/credentials.rs | ✅ |
| 7 | analytics_delivery_trend | analytics.rs | ✅ |
| 8 | analytics_success_rate | analytics.rs | ✅ |

## 🔜 Sıradaki Adımlar

1. **pg_stat_statements** — Neon dashboard'dan slow query log aç (Servet yapacak)
2. **EXPLAIN ANALYZE** — En yavaş 10 sorguyu analiz et
3. **N+1 taraması** — `routes/` klasöründe döngü içinde DB sorgusu ara
4. **Health endpoint queries** — health_endpoints.rs'deki sorguları sar
