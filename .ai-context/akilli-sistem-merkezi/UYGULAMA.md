# 📋 Cortex Uygulama Planı — Aşamalı Takip

> Oluşturma: 2026-05-20
> Bu belge: Her oturumda okunacak, adım adım ilerlenecek, tik atılacak
> Kural: Bir adım bitmeden diğerine geçme. Her adımın sonunda test et + commit et.

---

## ⚠️ BAŞLAMADAN ÖNCE (Her Oturum)

```
□ Bu dosyayı oku
□ ARASTIRMA.md oku (hedef sistemi bil)
□ MEVCUT-SISTEM.md oku (mevcut sistemleri bil)
□ git pull (en son kodu çek)
□ Hangi adımda kaldığını bul (tiklere bak)
□ Kaldığın yerden devam et
```

---

## AŞAMA 1: Signal Collector 🔴 KRİTİK

**Amaç:** Her delivery'den sinyal topla, saatlik özet oluştur.
**Süre:** 1-2 oturum | **Risk:** SIFIR

### Adım 1.1 — Migration
```
□ Dosya: migrations/079_cortex_hourly_stats.sql
□ Tablo: endpoint_hourly_stats (endpoint_id, hour_start, total, successful, failed, avg/p50/p95/p99 latency, error_breakdown)
□ Tablo: delivery_signals (id, delivery_id, endpoint_id, status, latency_ms, error_category, ...)
□ Neon DB'ye uygula: node run-migrations.js
□ Git commit
```

### Adım 1.2 — Cortex Modülü
```
□ Dosya: api/src/cortex/mod.rs (pub mod signal_collector;)
□ api/src/lib.rs'ye ekle: pub mod cortex;
□ Git commit
```

### Adım 1.3 — Signal Collector Yaz
```
□ Dosya: api/src/cortex/signal_collector.rs
□ Fonksiyon: collect_signal() — 12 sinyal topla, delivery_signals'a yaz
□ Fonksiyon: aggregate_hourly_stats() — son 1 saatten hourly_stats oluştur
□ Git commit
```

### Adım 1.4 — Worker Entegrasyonu
```
□ worker/src/delivery/http.rs'de her 10. delivery'de collect_signal() çağır
□ Sampling: her delivery'de değil, her 10'da bir
□ Git commit
```

### Adım 1.5 — Saatlik Job
```
□ api/src/main.rs'de: her saat 00:01'de aggregate_hourly_stats() çağır
□ Git commit
```

### Adım 1.6 — Retention
```
□ api/src/jobs/retention.rs'ye ekle:
  - 7 günden eski delivery_signals sil
  - 90 günden eski hourly_stats sil
□ Git commit
```

### Adım 1.7 — Test
```
□ API başlat, webhook gönder
□ delivery_signals'da veri var mı: SELECT COUNT(*) FROM delivery_signals;
□ hourly_stats'da veri var mı: SELECT * FROM endpoint_hourly_stats LIMIT 5;
□ Git push
```

### AŞAMA 1 TAMAMLANDI □

---

## AŞAMA 2: Profile Engine 🔴 YÜKSEK

**Amaç:** Her endpoint için "normal davranış" profili oluştur.
**Süre:** 1-2 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1

### Adım 2.1 — Migration
```
□ Dosya: migrations/080_cortex_profiles.sql
□ Tablo: endpoint_profiles (endpoint_id, latency_p50/p95/p99, success_rate_1h/24h/7d, traffic_pattern, error_distribution, confidence, ...)
□ Neon DB'ye uygula
□ Git commit
```

### Adım 2.2 — Profile Engine Yaz
```
□ Dosya: api/src/cortex/profile_engine.rs
□ Fonksiyon: update_profile() — son 7 günlük hourly_stats'tan profil hesapla
□ Fonksiyon: update_all_profiles() — tüm endpoint'lerin profilini güncelle
□ api/src/cortex/mod.rs'ye ekle: pub mod profile_engine;
□ Git commit
```

### Adım 2.3 — Güncelleme Job'u
```
□ api/src/main.rs'de: her 15 dakikada update_all_profiles() çağır
□ Git commit
```

### Adım 2.4 — Test
```
□ endpoint_profiles'da veri var mı: SELECT * FROM endpoint_profiles;
□ confidence > 0 mı?
□ Git push
```

### AŞAMA 2 TAMAMLANDI □

---

## AŞAMA 3: Anomaly Scoring 🟡 ORTA

**Amaç:** Her olaya 0-100 anomali skoru ata.
**Süre:** 1 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

### Adım 3.1 — Migration
```
□ Dosya: migrations/081_cortex_anomalies.sql
□ Tablo: anomaly_scores (id, delivery_id, endpoint_id, score, factors, category)
□ Neon DB'ye uygula
□ Git commit
```

### Adım 3.2 — Anomaly Scorer Yaz
```
□ Dosya: api/src/cortex/anomaly_scorer.rs
□ Fonksiyon: score() — latency anomali + error type değişikliği + trafik anomali
□ api/src/cortex/mod.rs'ye ekle: pub mod anomaly_scorer;
□ Git commit
```

### Adım 3.3 — Entegrasyon
```
□ signal_collector.rs'de collect_signal() sonrası score() çağır
□ Git commit
```

### Adım 3.4 — Test
```
□ anomaly_scores'da veri var mı
□ Yüksek skorlu anomali var mı (score > 70)
□ Git push
```

### AŞAMA 3 TAMAMLANDI □

---

## AŞAMA 4: Self-Healing Engine 🔴 YÜKSEK

**Amaç:** Sorun tespit edilince otomatik aksiyon al.
**Süre:** 2 oturum | **Risk:** ORTA | **Bağımlılık:** Aşama 1 + 2 + 3

### Adım 4.1 — Migration
```
□ Dosya: migrations/082_cortex_healing.sql
□ Tablo: healing_actions (id, endpoint_id, action_type, trigger_reason, previous_state, new_state)
□ Tablo: recovery_tests (id, endpoint_id, test_url, result_status, success)
□ Neon DB'ye uygula
□ Git commit
```

### Adım 4.2 — Healing Engine Yaz
```
□ Dosya: api/src/cortex/healing_engine.rs
□ Fonksiyon: check_auto_disable() — 5 gün %0 success → disable + email
□ Fonksiyon: run_recovery_test() — 24 saatte bir test delivery
□ Fonksiyon: check_cascade() — 10+ endpoint aynı anda fail → alert
□ api/src/cortex/mod.rs'ye ekle: pub mod healing_engine;
□ Git commit
```

### Adım 4.3 — Adaptive Circuit Breaker
```
□ api/src/circuit_breaker.rs'yi güncelle:
  - Sabit eşik (5) yerine profile-based eşik
  - Eşik = max(3, endpoint'in normal failure_streak * 1.5)
□ Git commit
```

### Adım 4.4 — Alert Evaluation Geliştir
```
□ api/src/jobs/alert_eval.rs'yi güncelle:
  - Sabit eşikler yerine profile-based eşikler
  - endpoint_profiles'dan normal latency'yi al
□ Git commit
```

### Adım 4.5 — Test
```
□ Auto-disable test et
□ Recovery test et
□ Cascade prevention test et
□ Git push
```

### AŞAMA 4 TAMAMLANDI □

---

## AŞAMA 5: Predictive Engine 🟡 ORTA

**Amaç:** Failure prediction, capacity forecast.
**Süre:** 1-2 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

### Adım 5.1 — Migration
```
□ Dosya: migrations/083_cortex_predictions.sql
□ Tablo: failure_predictions (id, endpoint_id, predicted_failure_probability, predicted_failure_time, confidence, signals)
□ Neon DB'ye uygula
□ Git commit
```

### Adım 5.2 — Predictive Engine Yaz
```
□ Dosya: api/src/cortex/predictive_engine.rs
□ Fonksiyon: predict_failure() — trend + seasonality + error momentum
□ Fonksiyon: forecast_capacity() — limit tahmini
□ api/src/cortex/mod.rs'ye ekle: pub mod predictive_engine;
□ Git commit
```

### Adım 5.3 — Proactive Alerting
```
□ alert_eval.rs'ye ekle:
  - failure_probability > 0.7 → "Bu endpoint 2 saat içinde fail olabilir"
  - capacity_forecast → "12 gün sonra limit aşılacak"
□ Git commit
```

### Adım 5.4 — Test
```
□ failure_predictions'da veri var mı
□ Tahminler mantıklı mı
□ Git push
```

### AŞAMA 5 TAMAMLANDI □

---

## AŞAMA 6: Insights Engine 🟡 ORTA

**Amaç:** Haftalık rapor, customer health, recommendations.
**Süre:** 2 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

### Adım 6.1 — Migration
```
□ Dosya: migrations/084_cortex_insights.sql
□ Tablo: weekly_reports (id, customer_id, week_start, total_deliveries, success_rate, insights, recommendations)
□ Tablo: customer_health (customer_id, integration_score, engagement_score, growth_score, stability_score, health_score, churn_risk, upgrade_probability)
□ Tablo: recommendations (id, customer_id, type, priority, title, description, action_url)
□ Neon DB'ye uygula
□ Git commit
```

### Adım 6.2 — Insights Engine Yaz
```
□ Dosya: api/src/cortex/insights_engine.rs
□ Fonksiyon: generate_weekly_report()
□ Fonksiyon: calculate_customer_health()
□ Fonksiyon: generate_recommendations()
□ api/src/cortex/mod.rs'ye ekle: pub mod insights_engine;
□ Git commit
```

### Adım 6.3 — Haftalık Rapor Job'u
```
□ api/src/main.rs'de: her Pazartesi 09:00'da rapor oluştur + email gönder
□ Git commit
```

### Adım 6.4 — Dashboard Sayfası
```
□ dashboard/src/app/[locale]/(dashboard)/insights/page.tsx
  - Customer health score
  - Recommendations listesi
  - Haftalık rapor geçmişi
□ Git commit
```

### Adım 6.5 — Test
```
□ weekly_reports'da veri var mı
□ customer_health hesaplanmış mı
□ Email gönderilmiş mi
□ Git push
```

### AŞAMA 6 TAMAMLANDI □

---

## AŞAMA 7: Smart Routing 🟢 DÜŞÜK

**Amaç:** Fallback URL'ler arası akıllı seçim.
**Süre:** 1 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

### Adım 7.1 — Migration
```
□ Dosya: migrations/085_cortex_routing.sql
□ Tablo: routing_decisions (id, endpoint_id, chosen_url, reason, alternatives)
□ Neon DB'ye uygula
□ Git commit
```

### Adım 7.2 — Smart Routing Yaz
```
□ Dosya: api/src/cortex/smart_routing.rs
□ Fonksiyon: choose_url() — latency-based + error-aware
□ api/src/cortex/mod.rs'ye ekle: pub mod smart_routing;
□ Git commit
```

### Adım 7.3 — Worker Entegrasyonu
```
□ worker/src/delivery/http.rs'de fallback URL varsa choose_url() çağır
□ Git commit
```

### Adım 7.4 — Test
```
□ Fallback URL'li endpoint oluştur
□ routing_decisions'da veri var mı
□ Git push
```

### AŞAMA 7 TAMAMLANDI □

---

## 📊 İLERLEME TAKİP

```
AŞAMA 1: Signal Collector      □ Tamamlandı
AŞAMA 2: Profile Engine         □ Tamamlandı
AŞAMA 3: Anomaly Scoring        □ Tamamlandı
AŞAMA 4: Self-Healing Engine    □ Tamamlandı
AŞAMA 5: Predictive Engine      □ Tamamlandı
AŞAMA 6: Insights Engine        □ Tamamlandı
AŞAMA 7: Smart Routing          □ Tamamlandı
```

---

## 💡 HER OTURUM SONUNDA

```
□ Kodu test et
□ Git commit (anlamlı mesaj)
□ Git push
□ Bu belgedeki tikleri güncelle
□ memory/YYYY-MM-DD.md'ye ne yaptığını yaz
□ NEXT_SESSION.md'ye sıradaki adımı yaz
```
