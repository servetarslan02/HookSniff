# 🔍 Mevcut Sistem Analizi — Var Olan ve Geliştirilmesi Gerekenler

> Oluşturma: 2026-05-20 05:15 GMT+8
> Kaynak: api/src/, worker/src/, migrations/

---

## 📊 Genel Bakış

```
Toplam Rust dosyası:     ~120 dosya
Toplam kod satırı:       ~53,000 satır
Migration dosyası:       78 dosya
Background job:          6 job
API route modülü:        30+ modül
```

---

## ✅ MEVCUT OLAN SİSTEMLER (Çalışıyor)

### 1. Circuit Breaker (api/src/circuit_breaker.rs + worker/src/circuit_breaker.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → 5 fail → circuit aç (sabit eşik)
  → 60 sn cooldown → half-open
  → Başarılı delivery → circuit kapat
  → Redis persistence (worker'da)

Eksiklikler:
  ❌ Sabit eşik (5 fail) — adaptif değil
  ❌ Sabit cooldown (60 sn) — adaptif değil
  ❌ Her endpoint için aynı kurallar
  ❌ Öğrenme yok (hangi endpoint kaç fail'den sonra düzeliyor bilmiyor)

Geliştirme:
  → RL ile adaptif eşik (Multi-Armed Bandit)
  → Her endpoint için farklı eşik
  → Cooldown'u endpoint'in recovery pattern'ına göre ayarla
```

### 2. Retry Policy (api/src/retry_policy/mod.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Per-endpoint retry politikası
  → Exponential backoff + jitter
  → Max attempt limit (varsayılan 5)
  → Base delay, max delay, multiplier ayarlanabilir

Eksiklikler:
  ❌ Sabit strateji (exponential backoff) — adaptif değil
  ❌ Hata tipine göre farklı strateji yok
  ❌ Öğrenme yok (hangi strateji en iyi bilmiyor)

Geliştirme:
  → RL ile strateji optimizasyonu (Multi-Armed Bandit)
  → Hata tipine göre strateji seçimi (timeout → uzun bekle, 5xx → kısa bekle)
  → Her endpoint için en iyi stratejiyi öğren
```

### 3. Per-Endpoint Throttle (api/src/throttle/mod.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Per-endpoint rate limit (token bucket / sliding window)
  → 3 strateji: fixed_window, sliding_window, token_bucket
  → Rate ve period ayarlanabilir

Eksiklikler:
  ❌ Sabit rate — adaptif değil
  ❌ Trafik spike'ında otomatik artış yok
  ❌ Recovery surge koruması yok

Geliştirme:
  → Trafik spike'ında otomatik throttle artışı
  → Recovery surge detection
  → RL ile optimal rate öğrenme
```

### 4. Rate Limiter (api/src/rate_limit.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐⭐ (Mükemmel)

Ne yapıyor:
  → Plan bazlı rate limit (Free 100/dk, Pro 1000/dk)
  → Redis sliding window (production)
  → In-memory fallback (development)
  → Fail-open when Redis unavailable
  → Proper X-RateLimit headers

Eksiklikler:
  ❌ Sabit limitler — adaptif değil
  ❌ Trafik pattern'ına göre otomatik ayar yok

Geliştirme:
  → Trafik spike'ında geçici limit artışı
  → Müşteri bazlı adaptive limit
```

### 5. Alert Evaluation (api/src/jobs/alert_eval.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Her 5 dk'da alert kurallarını değerlendirir
  → 3 koşul: failure_rate, latency, consecutive_failures
  → 3 kanal: email, slack webhook, operational webhook
  → 15 dk cooldown (alert storms engeli)
  → alert_history tablosuna log

Eksiklikler:
  ❌ Sabit eşikler — adaptif değil
  ❌ Endpoint'in "normal" değerlerini bilmiyor
  ❌ False positive oranı yüksek olabilir

Geliştirme:
  → Profile-based alerting (endpoint'in normal değerlerini bil)
  → Adaptive thresholds (her endpoint için farklı eşik)
  → Alert correlation (birden fazla alert aynı kök neden mi?)
```

### 6. Security Monitor (api/src/security_monitor.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → 11 saldırı tespiti:
    - Brute force login
    - Credential stuffing
    - Password spray
    - SQL injection
    - XSS attempt
    - Path traversal
    - Scanner detection
    - Suspicious user agent
    - Password reset abuse
    - Account enumeration
    - Disabled account login
  → security_events tablosuna log
  → login_attempts tablosuna tracking
  → ip_blocklist tablosu

Eksiklikler:
  ❌ Sabit kurallar — öğrenme yok
  ❌ Yeni saldırı türlerini otomatik tanımıyor
  ❌ IP reputation check yok

Geliştirme:
  → Anomaly-based detection (normal davranıştan sapma)
  → IP reputation scoring
  → Otomatik IP blocklama (zaten var ama geliştirilebilir)
```

### 7. Endpoint Health (api/src/routes/health_endpoints.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐ (Orta)

Ne yapıyor:
  → Her endpoint için health status (healthy/degraded/unhealthy)
  → failure_streak ve success_rate'a göre belirleme
  → Son 24 saat delivery istatistikleri
  → avg_response_ms, p95, p99 (tahmini)

Eksiklikler:
  ❌ p95 ve p99 tahmini (avg_response_ms * 2 ve * 3) — gerçek percentile değil
  ❌ Son 7 gün verisi yok
  ❌ Trafik pattern'ı yok
  ❌ Error distribution yok
  ❌ last_success_at yok

Geliştirme:
  → Gerçek percentile hesaplama (p50, p95, p99)
  → Son 7 gün trend verisi
  → Trafik pattern'ı (saat bazlı)
  → Error distribution breakdown
  → endpoint_profiles tablosu ile birleştir
```

### 8. Operational Webhooks (worker/src/operational_webhook.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → 2 event tipi: delivery.failed, endpoint.disabled
  → Customer'a webhook POST
  → HMAC-SHA256 imza
  → operational_webhook_deliveries tablosuna log

Eksiklikler:
  ❌ Sadece 2 event tipi — daha fazla gerekli
  ❌ endpoint.enabled, alert.triggered, delivery.recovered yok

Geliştirme:
  → Daha fazla event tipi ekle
  → Event filtering (customer hangi event'leri alsın)
  → Retry logic (webhook başarısız olursa)
```

### 9. Push Notifications (api/src/notifications/mod.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐ (Orta)

Ne yapıyor:
  → FCM (Firebase Cloud Messaging) ile mobil bildirim
  → delivery.failed ve delivery.success event'leri
  → Per-customer device token yönetimi

Eksiklikler:
  ❌ Sadece 2 event tipi
  ❌ Email bildirim yok (sadece FCM)
  ❌ SMS bildirim yok
  ❌ In-app bildirim yok (sadece push)

Geliştirme:
  → Daha fazla event tipi
  → Email bildirim entegrasyonu
  → In-app notification center
```

### 10. Retention Job (api/src/jobs/retention.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐⭐ (Mükemmel)

Ne yapıyor:
  → Eski delivery'leri dead_letters'a taşı + sil
  → Idempotency key temizliği
  → Webhook queue temizliği
  → SSO login attempts temizliği (90 gün)
  → Dunning reminders temizliği (30 gün)
  → Payment retry attempts temizliği (90 gün)
  → Monthly webhook count reset (dönem bazlı)
  → Daily webhook count reset

Eksiklikler:
  ❌ Yok — kapsamlı ve iyi yapılmış

Geliştirme:
  → Gerek yok (mevcut hali yeterli)
```

### 11. Dunning System (api/src/jobs/dunning.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Dönem sonu email hatırlatmaları (3, 2, 1 gün kala)
  → Yıllık planlar için (30, 7, 3, 2, 1 gün kala)
  → Failed payment retry
  → Paused subscription aktivasyonu
  → Paused subscription süresi dolma

Eksiklikler:
  ❌ Yok — kapsamlı

Geliştirme:
  → Gerek yok
```

### 12. Event Publisher (api/src/events/publisher.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Redis Streams (XADD) ile cross-instance delivery
  → Local broadcast channel ile same-instance real-time
  → 12 event tipi (Delivery, Endpoint, User, Application, Alert, Queue)
  → SSE stream (dashboard'da gerçek zamanlı)

Eksiklikler:
  ❌ Event'ler sadece publish ediliyor — tüketen yok (dashboard SSE dışında)
  ❌ Event-based otomatik aksiyon yok

Geliştirme:
  → Event consumer ekle (otomatik aksiyon için)
  → Event-based anomaly detection
  → Event-based self-healing triggers
```

### 13. FIFO Delivery (api/src/fifo/mod.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Sıralı teslimat (sequence number)
  → Per-endpoint FIFO enable/disable
  → Max wait timeout (stuck delivery escape)

Eksiklikler:
  ❌ Yok

Geliştirme:
  → Gerek yok
```

### 14. SSRF Protection (api/src/ssrf.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐⭐ (Mükemmel)

Ne yapıyor:
  → Private IP engeli (10.x, 172.16.x, 192.168.x)
  → Metadata endpoint engeli (169.254.169.254)
  → DNS validation
  → IPv6 loopback engeli

Eksiklikler:
  ❌ Yok

Geliştirme:
  → Gerek yok
```

### 15. Metrics Push (api/src/jobs/metrics_push.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Her 60 sn'de Grafana Cloud'a metrik gönder
  → OTEL (OpenTelemetry) ile

Eksiklikler:
  ❌ Sadece temel metrikler
  ❌ Business metrikleri yok (success rate trend, anomaly count)

Geliştirme:
  → Business metrikleri ekle
  → Anomaly score metrikleri
  → Customer health score metrikleri
```

### 16. Job Queue (api/src/jobs/job_queue.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Redis-based delayed job queue
  → Distributed lock (tek instance çalıştırır)
  → Email + notification job processing
  → Delayed job processor

Eksiklikler:
  ❌ Job priority yok (hepsi aynı öncelik)
  ❌ Job retry logic yok (job başarısız olursa)

Geliştirme:
  → Job priority (high, normal, low)
  → Job retry with backoff
```

### 17. Fanout Engine (worker/src/fanout.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Tek event → birden fazla hedef
  → Pattern matching (event type'a göre)
  → Conditional routing
  → Per-target dead letter queue

Eksiklikler:
  ❌ Yok

Geliştirme:
  → Gerek yok
```

### 18. Broadcast System (api/src/routes/broadcasts.rs)

```
DURUM: ✅ ÇALIŞIYOR
KALİTE: ⭐⭐⭐⭐ (İyi)

Ne yapıyor:
  → Admin → tüm kullanıcılara bildirim
  → Email/Bildirim toggle
  → Warning/Critical severity
  → Dashboard'da banner gösterimi

Eksiklikler:
  ❌ Yok

Geliştirme:
  → Gerek yok
```

---

## ❌ EKSİK OLAN SİSTEMLER (Henüz Yok)

### 1. Signal Collector (Cortex Katman 1)

```
DURUM: ❌ YOK
ÖNEM: 🔴 KRİTİK (diğer her şey bunun üzerine kurulacak)

Ne olacak:
  → Her delivery'den 12 sinyal toplayacak
  → endpoint_hourly_stats tablosu (saatlik özet)
  → delivery_signals tablosu (sampling ile)
  → Saatlik aggregation job'u

Neden gerekli:
  → Behavior profiles, anomaly scoring, prediction hepsi bu veriye bağlı
  → Veri yoksa hiçbir akıllı sistem çalışamaz
```

### 2. Profile Engine (Cortex Katman 2)

```
DURUM: ❌ YOK
ÖNEM: 🔴 YÜKSEK

Ne olacak:
  → Her endpoint için davranış profili
  → Latency percentiles (p50, p95, p99)
  → Success rate baseline
  → Traffic pattern (saat bazlı)
  → Error distribution
  → endpoint_profiles tablosu
```

### 3. Anomaly Scorer (Cortex Katman 3)

```
DURUM: ❌ YOK
ÖNEM: 🟡 ORTA

Ne olacak:
  → Her olaya 0-100 anomali skoru
  → Latency anomali, error type değişikliği, trafik anomali
  → anomaly_scores tablosu
  → Dashboard'da anomali görselleştirme
```

### 4. Self-Healing Engine (Cortex Katman 4)

```
DURUM: ❌ YOK
ÖNEM: 🔴 YÜKSEK

Ne olacak:
  → Auto-disable endpoint (5 gün fail)
  → Recovery test (24 saatte bir)
  → Cascade prevention (10+ endpoint aynı anda fail)
  → Adaptive circuit breaker
  → healing_actions tablosu
```

### 5. Predictive Engine (Cortex Katman 5)

```
DURUM: ❌ YOK
ÖNEM: 🟡 ORTA

Ne olacak:
  → Failure prediction (trend + seasonality + error momentum)
  → Capacity forecast (limit tahmini)
  → failure_predictions tablosu
```

### 6. Insights Engine (Cortex Katman 6)

```
DURUM: ❌ YOK
ÖNEM: 🟡 ORTA

Ne olacak:
  → Haftalık otomatik rapor (email)
  → Customer health score (churn risk, upgrade probability)
  → Smart recommendations (performans, güvenlik, maliyet)
  → Benchmark karşılaştırması
  → weekly_reports, customer_health, recommendations tabloları
```

### 7. Smart Routing (Cortex Katman 7)

```
DURUM: ❌ YOK
ÖNEM: 🟢 DÜŞÜK

Ne olacak:
  → Fallback URL'ler arası akıllı seçim
  → Latency-based + error-aware routing
  → routing_decisions tablosu
```

### 8. Webhook Freshness Monitoring

```
DURUM: ❌ YOK
ÖNEM: 🟡 ORTA

Ne olacak:
  → Event created_at ile işlenme zamanı arasındaki gecikmeyi izle
  → "Bu webhook 30 dakika gecikmeli" alert'i
  → Upstream incident tespiti
```

### 9. Recovery Surge Protection

```
DURUM: ❌ YOK
ÖNEM: 🔴 YÜKSEK

Ne olacak:
  → Trafik spike olduğunda otomatik throttling
  → Retry storm detection
  → Backpressure mechanism
```

### 10. Weekly Report Email

```
DURUM: ❌ YOK
ÖNEM: 🟡 ORTA

Ne olacak:
  → Her Pazartesi 09:00'da email
  → Toplam delivery, success rate, trend
  → Öneriler (endpoint sil, retry politikası değiştir, vs.)
```

---

## 📊 ÖZET TABLO

| # | Sistem | Durum | Kalite | Geliştirme Gerekli |
|---|--------|-------|--------|-------------------|
| 1 | Circuit Breaker | ✅ | ⭐⭐⭐⭐ | Adaptif eşik (RL) |
| 2 | Retry Policy | ✅ | ⭐⭐⭐⭐ | Strateji optimizasyonu (RL) |
| 3 | Per-Endpoint Throttle | ✅ | ⭐⭐⭐⭐ | Recovery surge koruması |
| 4 | Rate Limiter | ✅ | ⭐⭐⭐⭐⭐ | Gerek yok |
| 5 | Alert Evaluation | ✅ | ⭐⭐⭐⭐ | Profile-based alerting |
| 6 | Security Monitor | ✅ | ⭐⭐⭐⭐ | Anomaly-based detection |
| 7 | Endpoint Health | ✅ | ⭐⭐⭐ | Gerçek percentile, 7 gün trend |
| 8 | Operational Webhooks | ✅ | ⭐⭐⭐⭐ | Daha fazla event tipi |
| 9 | Push Notifications | ✅ | ⭐⭐⭐ | Email + in-app bildirim |
| 10 | Retention Job | ✅ | ⭐⭐⭐⭐⭐ | Gerek yok |
| 11 | Dunning System | ✅ | ⭐⭐⭐⭐ | Gerek yok |
| 12 | Event Publisher | ✅ | ⭐⭐⭐⭐ | Event consumer ekle |
| 13 | FIFO Delivery | ✅ | ⭐⭐⭐⭐ | Gerek yok |
| 14 | SSRF Protection | ✅ | ⭐⭐⭐⭐⭐ | Gerek yok |
| 15 | Metrics Push | ✅ | ⭐⭐⭐⭐ | Business metrikleri |
| 16 | Job Queue | ✅ | ⭐⭐⭐⭐ | Priority + retry |
| 17 | Fanout Engine | ✅ | ⭐⭐⭐⭐ | Gerek yok |
| 18 | Broadcast System | ✅ | ⭐⭐⭐⭐ | Gerek yok |
| 19 | Signal Collector | ❌ | - | SIFIRDAN YAPILACAK |
| 20 | Profile Engine | ❌ | - | SIFIRDAN YAPILACAK |
| 21 | Anomaly Scorer | ❌ | - | SIFIRDAN YAPILACAK |
| 22 | Self-Healing Engine | ❌ | - | SIFIRDAN YAPILACAK |
| 23 | Predictive Engine | ❌ | - | SIFIRDAN YAPILACAK |
| 24 | Insights Engine | ❌ | - | SIFIRDAN YAPILACAK |
| 25 | Smart Routing | ❌ | - | SIFIRDAN YAPILACAK |
| 26 | Webhook Freshness | ❌ | - | SIFIRDAN YAPILACAK |
| 27 | Recovery Surge | ❌ | - | SIFIRDAN YAPILACAK |
| 28 | Weekly Report | ❌ | - | SIFIRDAN YAPILACAK |

---

## 🎯 ÖNCELİK SIRASI

```
KRİTİK (hemen başla):
  19. Signal Collector → Temel veri toplama (her şey buna bağlı)
  20. Profile Engine → "Normal" ne demek öğren

YÜKSEK (sonraki):
  22. Self-Healing Engine → Otomatik iyileştirme
  27. Recovery Surge → Trafik spike koruması
  5. Alert Evaluation geliştirme → Profile-based alerting

ORTA (daha sonra):
  21. Anomaly Scorer → Anomali tespiti
  23. Predictive Engine → Önceden tahmin
  24. Insights Engine → Müşteriye değer göster
  28. Weekly Report → Haftalık rapor
  7. Endpoint Health geliştirme → Gerçek percentile

DÜŞÜK (ileride):
  25. Smart Routing → Fallback URL optimizasyonu
  26. Webhook Freshness → Upstream incident tespiti
  8. Operational Webhooks geliştirme → Daha fazla event
  9. Push Notifications geliştirme → Email + in-app
  15. Metrics Push geliştirme → Business metrikleri
  6. Security Monitor geliştirme → Anomaly-based detection
```

---

## 💡 SONUÇ

**Mevcut sistem sağlam.** 18 sistem çalışıyor, kaliteli kod, iyi test coverage.

**Eksik olan: Akıllı katman.** Tüm mevcut sistemler "sabit kurallar" ile çalışıyor. Hiçbiri öğrenmiyor, adapte olmuyor, veya önceden tahmin yapmıyor.

**Cortex bu eksiği kapatacak.** 10 yeni sistem (Signal Collector'dan Weekly Report'a kadar), mevcut 18 sistemin üzerine inşa edilecek. Mevcut sistemler değiştirilmeyecek, Cortex onları daha akıllı hale getirecek.
