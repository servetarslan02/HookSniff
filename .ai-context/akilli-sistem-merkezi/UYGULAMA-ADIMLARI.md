# 📋 Cortex Uygulama Adımları — Aşamalı Takip Belgesi

> Oluşturma: 2026-05-20 05:17 GMT+8
> Bu belge: Her oturumda okunacak, adım adım ilerlenecek, tik atılacak
> Kural: Bir adım bitmeden diğerine geçme. Her adımın sonunda test et + commit et.

---

## ⚠️ BAŞLAMADAN ÖNCE (Her Oturum)

```
□ Bu dosyayı oku (UYGULAMA-ADIMLARI.md)
□ MEVCUT-SISTEM-ANALIZI.md oku (mevcut sistemleri bil)
□ MIMARI.md oku (hedef mimariyi bil)
□ git pull (en son kodu çek)
□ Hangi adımda kaldığını bul (aşağıdaki tiklere bak)
□ Kaldığın yerden devam et
```

---

## AŞAMA 1: Signal Collector (Temel Veri Toplama)

**Amaç:** Her webhook delivery'den sinyal topla, saatlik özet oluştur.
**Süre:** 1-2 oturum
**Risk:** SIFIR (mevcut sistemi etkilemez)
**Dosyalar:** 4 yeni dosya, 1 yeni migration

---

### Adım 1.1: Migration Oluştur

```
□ Dosya oluştur: migrations/079_cortex_hourly_stats.sql

İçerik:
  -- Cortex: Saatlik endpoint istatistikleri
  CREATE TABLE IF NOT EXISTS endpoint_hourly_stats (
      endpoint_id UUID NOT NULL,
      hour_start TIMESTAMPTZ NOT NULL,
      total_deliveries INT DEFAULT 0,
      successful INT DEFAULT 0,
      failed INT DEFAULT 0,
      avg_latency_ms INT DEFAULT 0,
      p50_latency_ms INT DEFAULT 0,
      p95_latency_ms INT DEFAULT 0,
      p99_latency_ms INT DEFAULT 0,
      error_breakdown JSONB DEFAULT '{}',
      PRIMARY KEY (endpoint_id, hour_start)
  );

  CREATE INDEX IF NOT EXISTS idx_hourly_stats_endpoint
      ON endpoint_hourly_stats(endpoint_id, hour_start DESC);

  -- Cortex: Anomali skorları (sampling ile)
  CREATE TABLE IF NOT EXISTS delivery_signals (
      id BIGSERIAL PRIMARY KEY,
      delivery_id UUID NOT NULL,
      endpoint_id UUID NOT NULL,
      customer_id UUID NOT NULL,
      status VARCHAR(20) NOT NULL,
      status_code INT,
      latency_ms INT NOT NULL,
      payload_bytes INT NOT NULL,
      attempt_number INT NOT NULL,
      error_category VARCHAR(30),
      is_retry BOOLEAN DEFAULT false,
      time_of_hour INT NOT NULL,
      day_of_week INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_signals_endpoint
      ON delivery_signals(endpoint_id, created_at DESC);

  -- 7 gün TTL (retention job tarafından temizlenecek)

□ Migration'ı Neon DB'ye uygula: node run-migrations.js
□ Doğrulama: psql ile tabloları kontrol et
□ Git commit: "feat(cortex): migration 079 - hourly stats + delivery signals"
```

### Adım 1.2: Cortex Modülü Oluştur

```
□ Dosya oluştur: api/src/cortex/mod.rs

İçerik:
  //! Cortex — HookSniff Akıllı Sistem Motoru
  //!
  //! 7 katmanlı akıllı sistem:
  //! 1. Signal Collector (bu modül)
  //! 2. Profile Engine
  //! 3. Anomaly Scorer
  //! 4. Self-Healing Engine
  //! 5. Predictive Engine
  //! 6. Insights Engine
  //! 7. Smart Routing

  pub mod signal_collector;

□ api/src/lib.rs'ye ekle:
  pub mod cortex;

□ Git commit: "feat(cortex): initialize cortex module"
```

### Adım 1.3: Signal Collector Yaz

```
□ Dosya oluştur: api/src/cortex/signal_collector.rs

İçerik:
  //! Signal Collector — Her delivery'den sinyal toplar
  //!
  //! Her delivery'de çağrılır. 12 sinyal toplar ve delivery_signals'a yazar.
  //! Her saat başı, son saatteki delivery'lerden hourly_stats oluşturur.

  use sqlx::PgPool;
  use uuid::Uuid;
  use chrono::{DateTime, Utc, Timelike, Datelike};

  /// Bir delivery'den sinyal topla ve delivery_signals'a yaz.
  /// NOT: Her delivery için değil, her 10. delivery için çağrılır (sampling).
  pub async fn collect_signal(
      pool: &PgPool,
      delivery_id: Uuid,
      endpoint_id: Uuid,
      customer_id: Uuid,
      status: &str,
      status_code: Option<i32>,
      latency_ms: i32,
      payload_bytes: i32,
      attempt_number: i32,
      error_category: Option<&str>,
      is_retry: bool,
  ) -> Result<(), sqlx::Error> {
      let now = Utc::now();

      sqlx::query(
          "INSERT INTO delivery_signals
           (delivery_id, endpoint_id, customer_id, status, status_code,
            latency_ms, payload_bytes, attempt_number, error_category,
            is_retry, time_of_hour, day_of_week, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)"
      )
      .bind(delivery_id)
      .bind(endpoint_id)
      .bind(customer_id)
      .bind(status)
      .bind(status_code)
      .bind(latency_ms)
      .bind(payload_bytes)
      .bind(attempt_number)
      .bind(error_category)
      .bind(is_retry)
      .bind(now.minute() as i32)
      .bind(now.weekday().num_days_from_monday() as i32)
      .bind(now)
      .execute(pool)
      .await?;

      Ok(())
  }

  /// Son 1 saatteki delivery'lerden hourly_stats oluştur.
  /// Her saat 00:01'de çağrılır.
  pub async fn aggregate_hourly_stats(
      pool: &PgPool,
      hour_start: DateTime<Utc>,
  ) -> Result<u64, sqlx::Error> {
      let hour_end = hour_start + chrono::Duration::hours(1);

      let result = sqlx::query(
          r#"
          INSERT INTO endpoint_hourly_stats
              (endpoint_id, hour_start, total_deliveries, successful, failed,
               avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown)
          SELECT
              endpoint_id,
              $1 as hour_start,
              COUNT(*) as total_deliveries,
              COUNT(*) FILTER (WHERE status = 'delivered') as successful,
              COUNT(*) FILTER (WHERE status = 'failed') as failed,
              COALESCE(AVG(latency_ms), 0)::INT as avg_latency_ms,
              COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms), 0)::INT as p50_latency_ms,
              COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::INT as p95_latency_ms,
              COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms), 0)::INT as p99_latency_ms,
              COALESCE(
                  jsonb_object_agg(
                      COALESCE(error_category, 'none'),
                      error_count
                  ),
                  '{}'::jsonb
              ) as error_breakdown
          FROM (
              SELECT
                  endpoint_id,
                  status,
                  latency_ms,
                  error_category,
                  COUNT(*) OVER (PARTITION BY endpoint_id, error_category) as error_count
              FROM delivery_signals
              WHERE created_at >= $1 AND created_at < $2
          ) sub
          GROUP BY endpoint_id
          ON CONFLICT (endpoint_id, hour_start) DO UPDATE SET
              total_deliveries = EXCLUDED.total_deliveries,
              successful = EXCLUDED.successful,
              failed = EXCLUDED.failed,
              avg_latency_ms = EXCLUDED.avg_latency_ms,
              p50_latency_ms = EXCLUDED.p50_latency_ms,
              p95_latency_ms = EXCLUDED.p95_latency_ms,
              p99_latency_ms = EXCLUDED.p99_latency_ms,
              error_breakdown = EXCLUDED.error_breakdown
          "#
      )
      .bind(hour_start)
      .bind(hour_end)
      .execute(pool)
      .await?;

      Ok(result.rows_affected())
  }

□ Git commit: "feat(cortex): signal collector - collect + aggregate"
```

### Adım 1.4: Signal Collector'ı Worker'a Entegre Et

```
□ worker/src/delivery/http.rs dosyasında, başarılı/başarısız delivery sonrası:
  - Her 10. delivery'de signal_collector::collect_signal() çağır
  - NOT: Her delivery'de değil, her 10'da bir (sampling)

□ Örnek entegrasyon:
  // delivery_attempt_count'u global atomic counter olarak ekle
  static DELIVERY_COUNT: AtomicU64 = AtomicU64::new(0);

  // Her delivery sonrası:
  let count = DELIVERY_COUNT.fetch_add(1, Ordering::Relaxed);
  if count % 10 == 0 {
      let _ = signal_collector::collect_signal(
          &pool, delivery_id, endpoint_id, customer_id,
          &status, status_code, latency_ms, payload_bytes,
          attempt_number, error_category, is_retry
      ).await;
  }

□ Git commit: "feat(cortex): integrate signal collector into worker"
```

### Adım 1.5: Saatlik Aggregation Job'u Ekle

```
□ api/src/main.rs'de yeni background job ekle:

  // Cortex: Saatlik aggregation
  let cortex_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          // Her saat 00:01'de çalış
          let now = chrono::Utc::now();
          let next_hour = (now + chrono::Duration::hours(1))
              .with_minute(0).unwrap()
              .with_second(0).unwrap();
          let wait = (next_hour - now).num_milliseconds().max(0) as u64;
          tokio::time::sleep(std::time::Duration::from_millis(wait)).await;

          // Son saati aggregate et
          let hour_start = now.with_minute(0).unwrap()
              .with_second(0).unwrap();
          match signal_collector::aggregate_hourly_stats(&cortex_pool, hour_start).await {
              Ok(count) => tracing::info!("📊 Cortex: Aggregated {} endpoints for {}", count, hour_start),
              Err(e) => tracing::error!("❌ Cortex aggregation failed: {:?}", e),
          }
      }
  });

□ Git commit: "feat(cortex): hourly aggregation job in main.rs"
```

### Adım 1.6: Eski Veriyi Temizle (Retention)

```
□ api/src/jobs/retention.rs'ye ekle:

  /// Cortex: 7 günden eski delivery_signals'ı temizle
  async fn cleanup_delivery_signals(pool: &PgPool) -> Result<u64> {
      let result = sqlx::query(
          "DELETE FROM delivery_signals WHERE created_at < NOW() - INTERVAL '7 days'"
      )
      .execute(pool)
      .await?;
      if result.rows_affected() > 0 {
          tracing::info!("🧹 Cleaned up {} old delivery_signals", result.rows_affected());
      }
      Ok(result.rows_affected())
  }

  /// Cortex: 90 günden eski hourly_stats'ı temizle
  async fn cleanup_hourly_stats(pool: &PgPool) -> Result<u64> {
      let result = sqlx::query(
          "DELETE FROM endpoint_hourly_stats WHERE hour_start < NOW() - INTERVAL '90 days'"
      )
      .execute(pool)
      .await?;
      if result.rows_affected() > 0 {
          tracing::info!("🧹 Cleaned up {} old hourly_stats", result.rows_affected());
      }
      Ok(result.rows_affected())
  }

  // run_retention() fonksiyonuna bu iki fonksiyonu ekle

□ Git commit: "feat(cortex): retention for delivery_signals + hourly_stats"
```

### Adım 1.7: Test Et

```
□ API'yi başlat (cargo run)
□ Bir webhook gönder (curl ile)
□ delivery_signals tablosunda veri var mı kontrol et:
  psql -c "SELECT COUNT(*) FROM delivery_signals;"
□ Saatlik aggregation'ı manuel tetikle:
  psql -c "SELECT aggregate_hourly_stats(NOW() - INTERVAL '1 hour');"
□ endpoint_hourly_stats tablosunda veri var mı kontrol et:
  psql -c "SELECT * FROM endpoint_hourly_stats ORDER BY hour_start DESC LIMIT 5;"
□ Git commit: "test(cortex): signal collector + hourly aggregation verified"
```

### Aşama 1 Tamamlandı ✅

```
□ Tüm adımlar tikli
□ Testler çalışıyor
□ Git push edildi
□ Bu belgeye tik at: AŞAMA 1 ✅
```

---

## AŞAMA 2: Profile Engine (Davranış Profilleri)

**Amaç:** Her endpoint için "normal davranış" profili oluştur.
**Süre:** 1-2 oturum
**Risk:** DÜŞÜK
**Bağımlılık:** Aşama 1 tamamlanmış olmalı

---

### Adım 2.1: Migration Oluştur

```
□ Dosya oluştur: migrations/080_cortex_profiles.sql

İçerik:
  CREATE TABLE IF NOT EXISTS endpoint_profiles (
      endpoint_id UUID PRIMARY KEY,
      latency_p50 INT DEFAULT 0,
      latency_p95 INT DEFAULT 0,
      latency_p99 INT DEFAULT 0,
      latency_stddev FLOAT DEFAULT 0.0,
      success_rate_1h FLOAT DEFAULT 100.0,
      success_rate_24h FLOAT DEFAULT 100.0,
      success_rate_7d FLOAT DEFAULT 100.0,
      baseline_success_rate FLOAT DEFAULT 100.0,
      avg_deliveries_per_hour FLOAT DEFAULT 0.0,
      peak_deliveries_per_hour FLOAT DEFAULT 0.0,
      traffic_pattern JSONB DEFAULT '{}',
      dominant_error_type VARCHAR(30),
      error_distribution JSONB DEFAULT '{}',
      busiest_hour INT,
      quietest_hour INT,
      weekday_avg FLOAT DEFAULT 0.0,
      weekend_avg FLOAT DEFAULT 0.0,
      sample_size INT DEFAULT 0,
      confidence FLOAT DEFAULT 0.0,
      last_updated TIMESTAMPTZ,
      updated_at TIMESTAMPTZ DEFAULT now()
  );

□ Migration'ı uygula
□ Git commit: "feat(cortex): migration 080 - endpoint profiles"
```

### Adım 2.2: Profile Engine Yaz

```
□ Dosya oluştur: api/src/cortex/profile_engine.rs

İçerik:
  //! Profile Engine — Her endpoint için davranış profili oluşturur
  //!
  //! Son 7 günlük hourly_stats'tan profili hesaplar.
  //! Her 15-30 dakikada bir güncellenir.

  use sqlx::PgPool;
  use uuid::Uuid;
  use chrono::Utc;

  /// Endpoint profilini hesapla ve güncelle.
  pub async fn update_profile(pool: &PgPool, endpoint_id: Uuid) -> Result<(), sqlx::Error> {
      // Son 7 günlük hourly_stats'tan aggregate et
      let stats = sqlx::query_as::<_, (i64, i64, i64, f64, f64, f64)>(
          r#"
          SELECT
              COALESCE(SUM(total_deliveries), 0),
              COALESCE(SUM(successful), 0),
              COALESCE(SUM(failed), 0),
              COALESCE(AVG(avg_latency_ms), 0),
              COALESCE(AVG(p95_latency_ms), 0),
              COALESCE(AVG(p99_latency_ms), 0)
          FROM endpoint_hourly_stats
          WHERE endpoint_id = $1
            AND hour_start > NOW() - INTERVAL '7 days'
          "#
      )
      .bind(endpoint_id)
      .fetch_one(pool)
      .await?;

      let (total, successful, failed, avg_lat, p95_lat, p99_lat) = stats;

      if total == 0 {
          return Ok(()); // Veri yok, güncelleme
      }

      let success_rate = (successful as f64 / total as f64) * 100.0;
      let sample_size = total as i32;
      let confidence = (sample_size as f64 / 1000.0).min(1.0);

      sqlx::query(
          r#"
          INSERT INTO endpoint_profiles (endpoint_id, latency_p50, latency_p95, latency_p99,
              success_rate_7d, baseline_success_rate, sample_size, confidence, last_updated, updated_at)
          VALUES ($1, $2, $3, $4, $5, $5, $6, $7, NOW(), NOW())
          ON CONFLICT (endpoint_id) DO UPDATE SET
              latency_p50 = EXCLUDED.latency_p50,
              latency_p95 = EXCLUDED.latency_p95,
              latency_p99 = EXCLUDED.latency_p99,
              success_rate_7d = EXCLUDED.success_rate_7d,
              baseline_success_rate = EXCLUDED.baseline_success_rate,
              sample_size = EXCLUDED.sample_size,
              confidence = EXCLUDED.confidence,
              last_updated = NOW(),
              updated_at = NOW()
          "#
      )
      .bind(endpoint_id)
      .bind(avg_lat as i32)
      .bind(p95_lat as i32)
      .bind(p99_lat as i32)
      .bind(success_rate)
      .bind(sample_size)
      .bind(confidence)
      .execute(pool)
      .await?;

      Ok(())
  }

  /// Tüm endpoint'lerin profilini güncelle.
  pub async fn update_all_profiles(pool: &PgPool) -> Result<u64, sqlx::Error> {
      let endpoints: Vec<(Uuid,)> = sqlx::query_as(
          "SELECT DISTINCT endpoint_id FROM endpoint_hourly_stats"
      )
      .fetch_all(pool)
      .await?;

      let mut updated = 0u64;
      for (endpoint_id,) in endpoints {
          if update_profile(pool, endpoint_id).await.is_ok() {
              updated += 1;
          }
      }

      Ok(updated)
  }

□ api/src/cortex/mod.rs'ye ekle:
  pub mod profile_engine;

□ Git commit: "feat(cortex): profile engine - endpoint behavior profiles"
```

### Adım 2.3: Profile Güncelleme Job'u Ekle

```
□ api/src/main.rs'de:

  // Cortex: Profile güncelleme (her 15 dakika)
  let profile_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          tokio::time::sleep(std::time::Duration::from_secs(900)).await;
          match profile_engine::update_all_profiles(&profile_pool).await {
              Ok(count) => tracing::info!("📊 Cortex: Updated {} profiles", count),
              Err(e) => tracing::error!("❌ Cortex profile update failed: {:?}", e),
          }
      }
  });

□ Git commit: "feat(cortex): profile update job every 15 minutes"
```

### Adım 2.4: Test Et

```
□ endpoint_profiles tablosunda veri var mı:
  psql -c "SELECT endpoint_id, confidence, success_rate_7d FROM endpoint_profiles;"
□ confidence > 0 mı? (yeterli veri varsa)
□ Git commit: "test(cortex): profile engine verified"
```

### Aşama 2 Tamamlandı ✅

```
□ Tüm adımlar tikli
□ Testler çalışıyor
□ Git push edildi
□ Bu belgeye tik at: AŞAMA 2 ✅
```

---

## AŞAMA 3: Anomaly Scoring (Anomali Tespiti)

**Amaç:** Her olaya 0-100 anomali skoru ata.
**Süre:** 1 oturum
**Risk:** DÜŞÜK
**Bağımlılık:** Aşama 1 + 2 tamamlanmış olmalı

---

### Adım 3.1: Migration Oluştur

```
□ Dosya oluştur: migrations/081_cortex_anomalies.sql

İçerik:
  CREATE TABLE IF NOT EXISTS anomaly_scores (
      id BIGSERIAL PRIMARY KEY,
      delivery_id UUID NOT NULL,
      endpoint_id UUID NOT NULL,
      score INT NOT NULL,
      factors JSONB NOT NULL,
      category VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_anomaly_endpoint
      ON anomaly_scores(endpoint_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_anomaly_high
      ON anomaly_scores(score DESC) WHERE score > 70;

□ Migration'ı uygula
□ Git commit: "feat(cortex): migration 081 - anomaly scores"
```

### Adım 3.2: Anomaly Scorer Yaz

```
□ Dosya oluştur: api/src/cortex/anomaly_scorer.rs

İçerik: (Her sinyal için skor hesaplama, endpoint_profiles ile karşılaştırma)

□ api/src/cortex/mod.rs'ye ekle:
  pub mod anomaly_scorer;

□ Git commit: "feat(cortex): anomaly scorer"
```

### Adım 3.3: Signal Collector ile Entegre Et

```
□ signal_collector.rs'de, collect_signal() sonrası anomaly_scorer::score() çağır

□ Git commit: "feat(cortex): integrate anomaly scorer with signal collector"
```

### Adım 3.4: Test Et

```
□ anomaly_scores tablosunda veri var mı
□ Yüksek skorlu anomali var mı (score > 70)
□ Git commit: "test(cortex): anomaly scoring verified"
```

### Aşama 3 Tamamlandı ✅

```
□ Tüm adımlar tikli
□ Testler çalışıyor
□ Git push edildi
□ Bu belgeye tik at: AŞAMA 3 ✅
```

---

## AŞAMA 4: Self-Healing Engine (Otomatik İyileştirme)

**Amaç:** Sorun tespit edilince otomatik aksiyon al.
**Süre:** 2 oturum
**Risk:** ORTA (dikkatli test gerekir)
**Bağımlılık:** Aşama 1 + 2 + 3 tamamlanmış olmalı

---

### Adım 4.1: Migration Oluştur

```
□ Dosya oluştur: migrations/082_cortex_healing.sql

İçerik:
  CREATE TABLE IF NOT EXISTS healing_actions (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL,
      action_type VARCHAR(30) NOT NULL,
      trigger_reason TEXT NOT NULL,
      previous_state JSONB,
      new_state JSONB,
      auto_reversible BOOLEAN DEFAULT true,
      reversed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS recovery_tests (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL,
      test_url VARCHAR(2048) NOT NULL,
      result_status INT,
      result_latency_ms INT,
      success BOOLEAN,
      tested_at TIMESTAMPTZ DEFAULT now()
  );

□ Migration'ı uygula
□ Git commit: "feat(cortex): migration 082 - healing actions + recovery tests"
```

### Adım 4.2: Healing Engine Yaz

```
□ Dosya oluştur: api/src/cortex/healing_engine.rs

İçerik: (Auto-disable, recovery test, cascade prevention)

□ api/src/cortex/mod.rs'ye ekle:
  pub mod healing_engine;

□ Git commit: "feat(cortex): healing engine - auto-disable, recovery, cascade"
```

### Adım 4.3: Adaptive Circuit Breaker

```
□ api/src/circuit_breaker.rs'yi güncelle:
  - Sabit eşik (5 fail) yerine profile-based eşik
  - endpoint_profiles'dan bu endpoint'in normal failure_streak'ini al
  - Eşik = max(3, normal_failure_streak * 1.5)

□ Git commit: "feat(cortex): adaptive circuit breaker from profiles"
```

### Adım 4.4: Alert Evaluation'ı Geliştir

```
□ api/src/jobs/alert_eval.rs'yi güncelle:
  - Sabit eşikler yerine profile-based eşikler
  - endpoint_profiles'dan normal latency'yi al
  - Alert eşiği = normal_latency * 1.5

□ Git commit: "feat(cortex): profile-based alert evaluation"
```

### Adım 4.5: Test Et

```
□ Auto-disable test et (test endpoint oluştur, fail et, disable olmasını bekle)
□ Recovery test et (disable edilmiş endpoint'e test delivery gönder)
□ Cascade prevention test et (10+ endpoint fail et, alert gelmeli)
□ Git commit: "test(cortex): self-healing verified"
```

### Aşama 4 Tamamlandı ✅

```
□ Tüm adımlar tikli
□ Testler çalışıyor
□ Git push edildi
□ Bu belgeye tik at: AŞAMA 4 ✅
```

---

## AŞAMA 5: Predictive Engine (Tahmin Motoru)

**Amaç:** Failure prediction, capacity forecast.
**Süre:** 1-2 oturum
**Risk:** DÜŞÜK
**Bağımlılık:** Aşama 1 + 2 tamamlanmış olmalı

---

### Adım 5.1: Migration Oluştur

```
□ Dosya oluştur: migrations/083_cortex_predictions.sql

İçerik:
  CREATE TABLE IF NOT EXISTS failure_predictions (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL,
      predicted_failure_probability FLOAT,
      predicted_failure_time TIMESTAMPTZ,
      confidence FLOAT,
      signals JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
  );

□ Migration'ı uygula
□ Git commit: "feat(cortex): migration 083 - failure predictions"
```

### Adım 5.2: Predictive Engine Yaz

```
□ Dosya oluştur: api/src/cortex/predictive_engine.rs

İçerik: (Trend analizi, seasonality, error momentum)

□ api/src/cortex/mod.rs'ye ekle:
  pub mod predictive_engine;

□ Git commit: "feat(cortex): predictive engine - failure prediction + capacity forecast"
```

### Adım 5.3: Proactive Alerting

```
□ alert_eval.rs'ye ekle:
  - failure_probability > 0.7 → "Bu endpoint 2 saat içinde fail olabilir"
  - capacity_forecast → "12 gün sonra limit aşılacak"

□ Git commit: "feat(cortex): proactive alerting from predictions"
```

### Adım 5.4: Test Et

```
□ failure_predictions tablosunda veri var mı
□ Tahminler mantıklı mı
□ Git commit: "test(cortex): predictive engine verified"
```

### Aşama 5 Tamamlandı ✅

```
□ Tüm adımlar tikli
□ Testler çalışıyor
□ Git push edildi
□ Bu belgeye tik at: AŞAMA 5 ✅
```

---

## AŞAMA 6: Insights Engine (İş Zekası)

**Amaç:** Haftalık rapor, customer health, recommendations.
**Süre:** 2 oturum
**Risk:** DÜŞÜK
**Bağımlılık:** Aşama 1 + 2 tamamlanmış olmalı

---

### Adım 6.1: Migration Oluştur

```
□ Dosya oluştur: migrations/084_cortex_insights.sql

İçerik:
  CREATE TABLE IF NOT EXISTS weekly_reports (
      id BIGSERIAL PRIMARY KEY,
      customer_id UUID NOT NULL,
      week_start DATE NOT NULL,
      week_end DATE NOT NULL,
      total_deliveries INT,
      success_rate FLOAT,
      delivery_change_pct FLOAT,
      insights JSONB,
      recommendations JSONB,
      email_sent BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS customer_health (
      customer_id UUID PRIMARY KEY,
      integration_score INT DEFAULT 0,
      engagement_score INT DEFAULT 0,
      growth_score INT DEFAULT 0,
      stability_score INT DEFAULT 0,
      health_score INT DEFAULT 0,
      health_grade VARCHAR(2) DEFAULT 'F',
      churn_risk FLOAT DEFAULT 0.5,
      upgrade_probability FLOAT DEFAULT 0.1,
      updated_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS recommendations (
      id BIGSERIAL PRIMARY KEY,
      customer_id UUID NOT NULL,
      type VARCHAR(30) NOT NULL,
      priority VARCHAR(10) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      action_url VARCHAR(500),
      action_label VARCHAR(100),
      dismissed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
  );

□ Migration'ı uygula
□ Git commit: "feat(cortex): migration 084 - weekly reports, customer health, recommendations"
```

### Adım 6.2: Insights Engine Yaz

```
□ Dosya oluştur: api/src/cortex/insights_engine.rs

İçerik: (Weekly report, customer health, recommendations)

□ api/src/cortex/mod.rs'ye ekle:
  pub mod insights_engine;

□ Git commit: "feat(cortex): insights engine - reports, health, recommendations"
```

### Adım 6.3: Haftalık Rapor Job'u

```
□ api/src/main.rs'de:
  // Her Pazartesi 09:00'da haftalık rapor oluştur + email gönder

□ Git commit: "feat(cortex): weekly report job"
```

### Adım 6.4: Dashboard Sayfası

```
□ dashboard/src/app/[locale]/(dashboard)/insights/page.tsx oluştur
  - Customer health score göster
  - Recommendations listesi
  - Haftalık rapor geçmişi

□ Git commit: "feat(cortex): insights dashboard page"
```

### Adım 6.5: Test Et

```
□ weekly_reports tablosunda veri var mı
□ customer_health hesaplanmış mı
□ recommendations oluşturulmuş mu
□ Email gönderilmiş mi
□ Git commit: "test(cortex): insights engine verified"
```

### Aşama 6 Tamamlandı ✅

```
□ Tüm adımlar tikli
□ Testler çalışıyor
□ Git push edildi
□ Bu belgeye tik at: AŞAMA 6 ✅
```

---

## AŞAMA 7: Smart Routing (Akıllı Yönlendirme)

**Amaç:** Fallback URL'ler arası akıllı seçim.
**Süre:** 1 oturum
**Risk:** DÜŞÜK
**Bağımlılık:** Aşama 1 + 2 tamamlanmış olmalı

---

### Adım 7.1: Migration Oluştur

```
□ Dosya oluştur: migrations/085_cortex_routing.sql

İçerik:
  CREATE TABLE IF NOT EXISTS routing_decisions (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL,
      chosen_url VARCHAR(2048) NOT NULL,
      reason VARCHAR(100) NOT NULL,
      alternatives JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
  );

□ Migration'ı uygula
□ Git commit: "feat(cortex): migration 085 - routing decisions"
```

### Adım 7.2: Smart Routing Yaz

```
□ Dosya oluştur: api/src/cortex/smart_routing.rs

İçerik: (Latency-based + error-aware routing)

□ api/src/cortex/mod.rs'ye ekle:
  pub mod smart_routing;

□ Git commit: "feat(cortex): smart routing - latency-based + error-aware"
```

### Adım 7.3: Worker ile Entegre Et

```
□ worker/src/delivery/http.rs'de:
  - Fallback URL varsa, smart_routing::choose_url() çağır
  - Seçilen URL'ye delivery yap

□ Git commit: "feat(cortex): integrate smart routing with worker"
```

### Adım 7.4: Test Et

```
□ Fallback URL'li endpoint oluştur
□ routing_decisions tablosunda veri var mı
□ Doğru URL seçilmiş mi
□ Git commit: "test(cortex): smart routing verified"
```

### Aşama 7 Tamamlandı ✅

```
□ Tüm adımlar tikli
□ Testler çalışıyor
□ Git push edildi
□ Bu belgeye tik at: AŞAMA 7 ✅
```

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

## 💡 HER OTURUM SONUNDA YAPILACAKLAR

```
□ Kodu test et
□ Git commit (anlamlı mesaj ile)
□ Git push
□ Bu belgedeki tikleri güncelle
□ memory/YYYY-MM-DD.md'ye ne yaptığını yaz
□ NEXT_SESSION.md'ye sıradaki adımı yaz
```
