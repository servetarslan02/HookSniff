# 🔍 Mevcut Sistem Analizi

> Oluşturma: 2026-05-20
> 18 çalışan sistem + 10 eksik sistem

---

## ✅ ÇALIŞAN 18 SİSTEM

| # | Sistem | Dosya | Kalite | Durum |
|---|--------|-------|--------|-------|
| 1 | Circuit Breaker | api/src/circuit_breaker.rs | ⭐⭐⭐⭐ | ✅ Sabit eşik (5 fail) |
| 2 | Retry Policy | api/src/retry_policy/mod.rs | ⭐⭐⭐⭐ | ✅ Exponential backoff + jitter |
| 3 | Per-Endpoint Throttle | api/src/throttle/mod.rs | ⭐⭐⭐⭐ | ✅ Token bucket / sliding window |
| 4 | Rate Limiter | api/src/rate_limit.rs | ⭐⭐⭐⭐⭐ | ✅ Redis sliding window, plan bazlı |
| 5 | Alert Evaluation | api/src/jobs/alert_eval.rs | ⭐⭐⭐⭐ | ✅ Her 5 dk, 3 koşul, 3 kanal |
| 6 | Security Monitor | api/src/security_monitor.rs | ⭐⭐⭐⭐ | ✅ 11 saldırı tespiti |
| 7 | Endpoint Health | api/src/routes/health_endpoints.rs | ⭐⭐⭐ | ✅ healthy/degraded/unhealthy |
| 8 | Operational Webhooks | worker/src/operational_webhook.rs | ⭐⭐⭐⭐ | ✅ 2 event tipi |
| 9 | Push Notifications | api/src/notifications/mod.rs | ⭐⭐⭐ | ✅ FCM mobil bildirim |
| 10 | Retention Job | api/src/jobs/retention.rs | ⭐⭐⭐⭐⭐ | ✅ Kapsamlı temizlik |
| 11 | Dunning System | api/src/jobs/dunning.rs | ⭐⭐⭐⭐ | ✅ Pre-expiry email'ler |
| 12 | Event Publisher | api/src/events/publisher.rs | ⭐⭐⭐⭐ | ✅ Redis Streams + broadcast |
| 13 | FIFO Delivery | api/src/fifo/mod.rs | ⭐⭐⭐⭐ | ✅ Sıralı teslimat |
| 14 | SSRF Protection | api/src/ssrf.rs | ⭐⭐⭐⭐⭐ | ✅ Private IP engeli |
| 15 | Metrics Push | api/src/jobs/metrics_push.rs | ⭐⭐⭐⭐ | ✅ Grafana Cloud OTEL |
| 16 | Job Queue | api/src/jobs/job_queue.rs | ⭐⭐⭐⭐ | ✅ Redis delayed queue |
| 17 | Fanout Engine | worker/src/fanout.rs | ⭐⭐⭐⭐ | ✅ Multi-target routing |
| 18 | Broadcast System | api/src/routes/broadcasts.rs | ⭐⭐⭐⭐ | ✅ Admin bildirim |

---

## ❌ EKSİK 10 SİSTEM (Cortex ile gelecek)

| # | Sistem | Önem | Ne Yapacak |
|---|--------|------|-----------|
| 19 | Signal Collector | 🔴 KRİTİK | Her delivery'den sinyal topla, saatlik özet |
| 20 | Profile Engine | 🔴 YÜKSEK | Her endpoint'in "normal" davranışını öğren |
| 21 | Anomaly Scorer | 🟡 ORTA | Her olaya 0-100 anomali skoru |
| 22 | Self-Healing | 🔴 YÜKSEK | Auto-disable, recovery test, cascade prevention |
| 23 | Predictive | 🟡 ORTA | Failure prediction, capacity forecast |
| 24 | Insights | 🟡 ORTA | Haftalık rapor, customer health, öneriler |
| 25 | Smart Routing | 🟢 DÜŞÜK | Fallback URL'ler arası akıllı seçim |
| 26 | Webhook Freshness | 🟡 ORTA | Gecikme izleme |
| 27 | Recovery Surge | 🔴 YÜKSEK | Trafik spike koruması |
| 28 | Weekly Report | 🟡 ORTA | Haftalık email rapor |

---

## 📊 KOD İSTATİSTİKLERİ

```
Toplam Rust dosyası:     ~120 dosya
Toplam kod satırı:       ~53,000 satır
Migration dosyası:       78 dosya
Background job:          6 job (retention, dunning, alert_eval, metrics_push, job_queue, broadcast)
API route modülü:        30+ modül
```

---

## 📐 MİMARİ

```
HookSniff/
├── api/           → Rust API (Axum, port 3000)
│   ├── src/routes/      → 30+ route modülü
│   ├── src/jobs/        → 6 background job
│   ├── src/models/      → DB modelleri
│   ├── src/billing/     → Polar + iyzico + Stripe
│   ├── src/events/      → Event publisher (Redis Streams)
│   ├── src/middleware/   → Rate limit, idempotency, webhook verify
│   └── src/cortex/      → YENİ: Akıllı sistem motoru
├── worker/        → Rust background worker
│   └── src/             → Delivery, circuit breaker, throttle, fanout
├── dashboard/     → Next.js 15 (Vercel'de deploy)
├── migrations/    → SQL migration dosyaları (001-078)
└── .ai-context/   → Kalıcı hafıza (GitHub'da sync)
```

---

## 🔑 DIŞ SERVİSLER

| Servis | Kullanım | Maliyet |
|--------|----------|---------|
| Neon PostgreSQL | Veritabanı (0.5 GB) | $0 |
| Upstash Redis | Cache + queue (256 MB) | $0 |
| Google Cloud Run | API + Worker | $0 |
| Vercel | Dashboard | $0 |
| Grafana Cloud | Monitoring + OTEL | $0 |
| Cloudflare R2 | Dosya depolama | $0 |
| Resend / GCloud | Email gönderimi | $0 |
