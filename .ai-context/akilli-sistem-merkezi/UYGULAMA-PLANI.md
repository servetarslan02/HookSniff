# 📋 Uygulama Planı — Aşamalı Geçiş

> Oluşturma: 2026-05-20

---

## Prensip: Önce Güvenli, Sonra Zeki

Her aşamada:
1. Mevcut ücretsiz servisleri ÇÖKERTMEMELİ
2. Bir önceki aşamanın üzerine inşa etmeli
3. Çalışır durumda bırakmalı (yarıda kesilse bile)

---

## AŞAMA 1: Temel Gözlem (Signal Collection + Hourly Aggregation)

**Süre:** 1-2 oturum
**Risk:** SIFIR
**Ek Maliyet:** $0

### Ne Yapılacak?

1. **`endpoint_hourly_stats` tablosu oluştur**
   - Saatlik özet: toplam delivery, başarılı, başarısız, avg/p95/p99 latency, error breakdown
   - Her saat başı, son saatteki delivery'lerden aggregate et
   - 100K delivery/gün → 24 satır/gün × endpoint sayısı

2. **`delivery_signals` tablosu oluştur (sampling ile)**
   - Her 10. delivery'yi yaz (sampling)
   - 7 gün TTL (otomatik silme)

3. **Saatlik aggregation job'u ekle**
   - main.rs'e yeni background job
   - Her saat 00:01'de çalışır
   - `REFRESH MATERIALIZED VIEW` gibi

### Dosyalar

```
YENİ:
  api/src/cortex/mod.rs           → Cortex modülü
  api/src/cortex/signal_collector.rs → Signal toplama
  api/src/cortex/aggregator.rs     → Saatlik aggregation
  migrations/079_cortex_signals.sql → Tablolar

DEĞİŞEN:
  api/src/main.rs                  → Yeni job ekle
  api/src/lib.rs                   → pub mod cortex
```

### Doğrulama

```sql
-- 1 saat sonra bu sorgu çalışmalı
SELECT endpoint_id, hour_start, total_deliveries, avg_latency_ms
FROM endpoint_hourly_stats
ORDER BY hour_start DESC
LIMIT 10;
```

---

## AŞAMA 2: Davranış Profilleri (Behavior Profiles)

**Süre:** 1-2 oturum
**Risk:** DÜŞÜK
**Ek Maliyet:** $0

### Ne Yapılacak?

1. **`endpoint_profiles` tablosu oluştur**
   - Her endpoint için: latency percentiles, success rate, traffic pattern, error distribution
   - Son 7 günlük hourly_stats'tan hesapla

2. **Profile güncelleme job'u**
   - Her 15-30 dakikada bir çalışır
   - Yeni veri geldikçe profili günceller
   - `confidence` = sample_size / 1000

3. **Profile-based alerting**
   - Mevcut alert_eval job'unda: sabit eşik yerine profile-based eşik kullan
   - "Bu endpoint'in normal p95'i 890ms, şu an 1200ms → alert"

### Dosyalar

```
YENİ:
  api/src/cortex/profile_engine.rs → Profil hesaplama

DEĞİŞEN:
  api/src/jobs/alert_eval.rs       → Profile-based eşik
  migrations/080_cortex_profiles.sql
```

---

## AŞAMA 3: Anomali Skorlama (Anomaly Scoring)

**Süre:** 1 oturum
**Risk:** DÜŞÜK
**Ek Maliyet:** $0

### Ne Yapılacak?

1. **`anomaly_scores` tablosu oluştur**
   - Her sampled delivery'ye 0-100 skor
   - Faktörler: latency anomali, error type değişikliği, trafik anomali

2. **Real-time skor hesaplama**
   - Signal collector her sinyalde skor hesaplar
   - Yüksek skor → hemen alert + healing

3. **Dashboard'da anomali görselleştirme**
   - Her endpoint'in anomali skoru renkli
   - Son 24 saat anomali dağılımı grafiği

### Dosyalar

```
YENİ:
  api/src/cortex/anomaly_scorer.rs → Skor hesaplama

DEĞİŞEN:
  dashboard/.../health/page.tsx     → Anomali skoru göster
  migrations/081_cortex_anomalies.sql
```

---

## AŞAMA 4: Self-Healing (Otomatik İyileştirme)

**Süre:** 2 oturum
**Risk:** ORTA (dikkatli test gerekir)
**Ek Maliyet:** $0

### Ne Yapılacak?

1. **`healing_actions` tablosu oluştur**
   - Tüm aksiyonlar loglanır (geri alınabilir)

2. **Auto-disable + recovery test**
   - 5 gün %0 success → disable + email
   - 24 saatte bir test delivery → başarılı olursa enable

3. **Adaptive circuit breaker**
   - Mevcut sabit eşik (5 fail) → profile-based eşik
   - "Bu endpoint genelde 3 fail'den sonra düzeliyor → eşik 3"

4. **Cascade prevention**
   - 5 dakikada 10+ endpoint fail → tüm endpoint'lerde retry yavaşlat

### Dosyalar

```
YENİ:
  api/src/cortex/healing_engine.rs  → Self-healing motoru
  api/src/cortex/recovery_test.rs   → Recovery test

DEĞİŞEN:
  api/src/circuit_breaker.rs        → Adaptive eşik
  worker/src/circuit_breaker.rs     → Adaptive eşik
  api/src/jobs/alert_eval.rs        → Auto-disable
  migrations/082_cortex_healing.sql
```

---

## AŞAMA 5: Predictive Engine (Tahmin Motoru)

**Süre:** 1-2 oturum
**Risk:** DÜŞÜK
**Ek Maliyet:** $0

### Ne Yapılacak?

1. **`failure_predictions` tablosu oluştur**
   - Her endpoint için failure probability
   - Trend + seasonality + error momentum

2. **Capacity forecast**
   - "Mevcut hızla 12 gün sonra Pro plan limitine ulaşacaksınız"
   - Customer health score hesaplama

3. **Proactive alerting**
   - "Bu endpoint 2 saat içinde fail olabilir"
   - "Bu müşterinin webhook limiti dolmak üzere"

### Dosyalar

```
YENİ:
  api/src/cortex/predictive_engine.rs → Tahmin motoru

DEĞİŞEN:
  migrations/083_cortex_predictions.sql
```

---

## AŞAMA 6: Insights Engine (İş Zekası)

**Süre:** 2 oturum
**Risk:** DÜŞÜK
**Ek Maliyet:** $0

### Ne Yapılacak?

1. **Haftalık otomatik rapor**
   - Her Pazartesi 09:00'da email
   - Toplam delivery, success rate, trend, öneriler

2. **Customer health score**
   - Integration + engagement + growth + stability
   - Churn risk + upgrade probability

3. **Smart recommendations**
   - Performans, güvenlik, maliyet, feature önerileri
   - Dashboard'da göster + email

4. **Benchmark karşılaştırması**
   - "Sizin endpoint'inizin başarı oranı %99.2, benzer endpoint'lerin ortalaması %97.8"

### Dosyalar

```
YENİ:
  api/src/cortex/insights_engine.rs  → Rapor + health + recommendations
  api/src/cortex/weekly_report.rs    → Haftalık rapor
  api/src/cortex/customer_health.rs  → Sağlık skoru

DEĞİŞEN:
  dashboard/.../insights/page.tsx     → Insights sayfası
  migrations/084_cortex_insights.sql
```

---

## AŞAMA 7: Smart Routing (Akıllı Yönlendirme)

**Süre:** 1 oturum
**Risk:** DÜŞÜK
**Ek Maliyet:** $0

### Ne Yapılacak?

1. **`routing_decisions` tablosu oluştur**
   - Fallback URL varsa, hangisini seçeceğini belirle

2. **Latency-based routing**
   - En düşük latency'li URL'yi seç
   - Error rate yüksek olanı避开

3. **Dashboard'da routing bilgisi**
   - Hangi URL'nin neden seçildiği

### Dosyalar

```
YENİ:
  api/src/cortex/smart_routing.rs

DEĞİŞEN:
  worker/src/delivery/mod.rs         → Routing kararı
  migrations/085_cortex_routing.sql
```

---

## Toplam Tahmini Süre

| Aşama | Süre | Birikimli |
|-------|------|-----------|
| 1. Signal Collection | 1-2 oturum | 1-2 |
| 2. Behavior Profiles | 1-2 oturum | 2-4 |
| 3. Anomaly Scoring | 1 oturum | 3-5 |
| 4. Self-Healing | 2 oturum | 5-7 |
| 5. Predictive Engine | 1-2 oturum | 6-9 |
| 6. Insights Engine | 2 oturum | 8-11 |
| 7. Smart Routing | 1 oturum | 9-12 |

**Toplam: 9-12 oturum (her biri 1 saat)**

---

## Öncelik Sırası

```
KRİTİK (hemen başla):
  1. Signal Collection → Temel veri toplama
  2. Behavior Profiles → "Normal" ne demek öğren

YÜKSEK (sonraki):
  3. Self-Healing → Otomatik iyileştirme
  4. Anomaly Scoring → Anomali tespiti

ORTA (daha sonra):
  5. Insights Engine → Müşteriye değer göster
  6. Predictive Engine → Önceden tahmin

DÜŞÜK (ileride):
  7. Smart Routing → Fallback URL optimizasyonu
```

---

## Başarı Kriterleri

| Aşama | Kriter |
|-------|--------|
| 1 | endpoint_hourly_stats tablosu doluyor, 7 gün veri tutuluyor |
| 2 | endpoint_profiles güncelleniyor, confidence > 0.5 |
| 3 | Anomali skorları hesaplanıyor, dashboard'da gösteriliyor |
| 4 | Auto-disable + recovery test çalışıyor |
| 5 | Failure prediction %70+ doğrulukla çalışıyor |
| 6 | Haftalık rapor email'i gönderiliyor |
| 7 | Fallback URL'ler arası akıllı seçim yapılıyor |
