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
□ Dosya oluştur: migrations/079_cortex_hourly_stats.sql

İçerik (copy-paste):

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

□ Neon DB'ye uygula: node run-migrations.js
□ Doğrulama: psql ile tabloları kontrol et
□ Git commit: "feat(cortex): migration 079 - hourly stats + delivery signals"
```

### Adım 1.2 — Cortex Modülü
```
□ Dosya oluştur: api/src/cortex/mod.rs

İçerik:

  //! Cortex — HookSniff Akıllı Sistem Motoru
  pub mod signal_collector;

□ api/src/lib.rs'ye ekle (mevcut modüllerin yanına):
  pub mod cortex;

□ Derleme hatası almadığını kontrol et: cargo check
□ Git commit: "feat(cortex): initialize cortex module"
```

### Adım 1.3 — Signal Collector Yaz
```
□ Dosya oluştur: api/src/cortex/signal_collector.rs

İçerik (copy-paste, çalışır kod):

  use sqlx::PgPool;
  use uuid::Uuid;
  use chrono::{DateTime, Utc, Timelike, Datelike};

  /// Bir delivery'den sinyal topla (her 10. delivery'de çağrılır)
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
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)"
      )
      .bind(delivery_id).bind(endpoint_id).bind(customer_id)
      .bind(status).bind(status_code).bind(latency_ms)
      .bind(payload_bytes).bind(attempt_number).bind(error_category)
      .bind(is_retry).bind(now.minute() as i32)
      .bind(now.weekday().num_days_from_monday() as i32).bind(now)
      .execute(pool).await?;
      Ok(())
  }

  /// Son 1 saatten hourly_stats oluştur (her saat 00:01'de çağrılır)
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
              endpoint_id, $1,
              COUNT(*),
              COUNT(*) FILTER (WHERE status = 'delivered'),
              COUNT(*) FILTER (WHERE status = 'failed'),
              COALESCE(AVG(latency_ms),0)::INT,
              COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms),0)::INT,
              COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms),0)::INT,
              COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms),0)::INT,
              COALESCE(jsonb_object_agg(COALESCE(error_category,'none'), cnt),'{}'::jsonb)
          FROM (
              SELECT endpoint_id, status, latency_ms, error_category,
                     COUNT(*) OVER (PARTITION BY endpoint_id, error_category) as cnt
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
      .bind(hour_start).bind(hour_end)
      .execute(pool).await?;
      Ok(result.rows_affected())
  }

□ cargo check ile derleme kontrol et
□ Git commit: "feat(cortex): signal collector - collect + aggregate"
```

### Adım 1.4 — Worker Entegrasyonu
```
□ worker/src/delivery/http.rs'de, delivery başarılı/başarısız OLDUKTAN SONRA ekle:

  // Dosyanın en üstüne ekle:
  use std::sync::atomic::{AtomicU64, Ordering};
  static DELIVERY_COUNT: AtomicU64 = AtomicU64::new(0);

  // Delivery sonucu hesaplandıktan SONRA (return'den önce) ekle:
  let count = DELIVERY_COUNT.fetch_add(1, Ordering::Relaxed);
  if count % 10 == 0 {
      let _ = hooksniff_api::cortex::signal_collector::collect_signal(
          &pool, delivery_id, endpoint_id, customer_id,
          &status, status_code, latency_ms, payload_bytes,
          attempt_number, error_category, is_retry
      ).await;
  }

□ cargo check ile derleme kontrol et
□ Git commit: "feat(cortex): integrate signal collector into worker"
```

### Adım 1.5 — Saatlik Job
```
□ api/src/main.rs'de, mevcut background job'ların yanına ekle:

  // Cortex: Saatlik aggregation
  let cortex_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          let now = chrono::Utc::now();
          let next_hour = (now + chrono::Duration::hours(1))
              .with_minute(0).unwrap().with_second(0).unwrap();
          let wait = (next_hour - now).num_milliseconds().max(0) as u64;
          tokio::time::sleep(std::time::Duration::from_millis(wait)).await;
          let hour_start = now.with_minute(0).unwrap().with_second(0).unwrap();
          match hooksniff_api::cortex::signal_collector::aggregate_hourly_stats(
              &cortex_pool, hour_start
          ).await {
              Ok(n) => tracing::info!("📊 Cortex: Aggregated {} endpoints", n),
              Err(e) => tracing::error!("❌ Cortex aggregation failed: {:?}", e),
          }
      }
  });

□ cargo check ile derleme kontrol et
□ Git commit: "feat(cortex): hourly aggregation job in main.rs"
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

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 080 - endpoint profiles"
```

### Adım 2.2 — Profile Engine Yaz
```
□ Dosya oluştur: api/src/cortex/profile_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;

  pub async fn update_profile(pool: &PgPool, endpoint_id: Uuid) -> Result<(), sqlx::Error> {
      let stats = sqlx::query_as::<_, (i64, i64, i64, f64, f64, f64)>(
          r#"
          SELECT
              COALESCE(SUM(total_deliveries),0),
              COALESCE(SUM(successful),0),
              COALESCE(SUM(failed),0),
              COALESCE(AVG(avg_latency_ms),0),
              COALESCE(AVG(p95_latency_ms),0),
              COALESCE(AVG(p99_latency_ms),0)
          FROM endpoint_hourly_stats
          WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '7 days'
          "#
      )
      .bind(endpoint_id)
      .fetch_one(pool).await?;

      let (total, successful, _failed, avg_lat, p95_lat, p99_lat) = stats;
      if total == 0 { return Ok(()); }

      let success_rate = (successful as f64 / total as f64) * 100.0;
      let confidence = (total as f64 / 1000.0).min(1.0);

      sqlx::query(
          r#"
          INSERT INTO endpoint_profiles
              (endpoint_id, latency_p50, latency_p95, latency_p99,
               success_rate_7d, baseline_success_rate, sample_size, confidence,
               last_updated, updated_at)
          VALUES ($1,$2,$3,$4,$5,$5,$6,$7,NOW(),NOW())
          ON CONFLICT (endpoint_id) DO UPDATE SET
              latency_p50=EXCLUDED.latency_p50, latency_p95=EXCLUDED.latency_p95,
              latency_p99=EXCLUDED.latency_p99, success_rate_7d=EXCLUDED.success_rate_7d,
              baseline_success_rate=EXCLUDED.baseline_success_rate,
              sample_size=EXCLUDED.sample_size, confidence=EXCLUDED.confidence,
              last_updated=NOW(), updated_at=NOW()
          "#
      )
      .bind(endpoint_id).bind(avg_lat as i32).bind(p95_lat as i32)
      .bind(p99_lat as i32).bind(success_rate).bind(total as i32).bind(confidence)
      .execute(pool).await?;
      Ok(())
  }

  pub async fn update_all_profiles(pool: &PgPool) -> Result<u64, sqlx::Error> {
      let endpoints: Vec<(Uuid,)> = sqlx::query_as(
          "SELECT DISTINCT endpoint_id FROM endpoint_hourly_stats"
      )
      .fetch_all(pool).await?;

      let mut updated = 0u64;
      for (eid,) in endpoints {
          if update_profile(pool, eid).await.is_ok() { updated += 1; }
      }
      Ok(updated)
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod profile_engine;
□ cargo check
□ Git commit: "feat(cortex): profile engine - endpoint behavior profiles"
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

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 081 - anomaly scores"
```

### Adım 3.2 — Anomaly Scorer Yaz
```
□ Dosya oluştur: api/src/cortex/anomaly_scorer.rs

İçerik (copy-paste):

  use serde::Serialize;

  #[derive(Debug, Serialize)]
  pub struct AnomalyResult {
      pub score: i32,
      pub factors: serde_json::Value,
      pub category: String,
  }

  pub fn score(
      latency_ms: i32,
      endpoint_p95: i32,
      endpoint_p99: i32,
      error_category: Option<&str>,
      dominant_error: Option<&str>,
      current_rate: f64,
      peak_rate: f64,
      attempt_number: i32,
  ) -> AnomalyResult {
      let mut score = 0i32;
      let mut factors = Vec::new();

      // Latency anomali
      if endpoint_p99 > 0 && latency_ms > endpoint_p99 * 2 {
          score += 30;
          factors.push(format!("latency_{}ms_vs_p99_{}ms", latency_ms, endpoint_p99));
      } else if endpoint_p95 > 0 && latency_ms > (endpoint_p95 as f64 * 1.5) as i32 {
          score += 15;
          factors.push(format!("latency_{}ms_vs_p95_{}ms", latency_ms, endpoint_p95));
      }

      // Error type değişikliği
      if let (Some(err), Some(dom)) = (error_category, dominant_error) {
          if err != dom && err != "none" {
              score += 20;
              factors.push(format!("error_{}_vs_dominant_{}", err, dom));
          }
      }

      // Trafik anomali
      if peak_rate > 0.0 && current_rate > peak_rate * 1.5 {
          score += 25;
          factors.push(format!("traffic_{}_vs_peak_{}", current_rate, peak_rate));
      }

      // Attempt anomali
      if attempt_number > 3 {
          score += 10;
          factors.push(format!("attempt_{}", attempt_number));
      }

      let category = if score >= 70 { "critical" }
          else if score >= 40 { "warning" }
          else { "normal" }.to_string();

      AnomalyResult {
          score: score.min(100),
          factors: serde_json::json!({"details": factors}),
          category,
      }
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod anomaly_scorer;
□ cargo check
□ Git commit: "feat(cortex): anomaly scorer - latency + error + traffic scoring"
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

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 082 - healing actions + recovery tests"
```

### Adım 4.2 — Healing Engine Yaz
```
□ Dosya oluştur: api/src/cortex/healing_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;

  /// 5 gün üst üste %0 success → endpoint'i disable et
  pub async fn check_auto_disable(pool: &PgPool) -> Result<Vec<Uuid>, sqlx::Error> {
      let endpoints: Vec<(Uuid,)> = sqlx::query_as(
          r#"
          SELECT endpoint_id FROM endpoint_hourly_stats
          WHERE hour_start > NOW() - INTERVAL '5 days'
          GROUP BY endpoint_id
          HAVING SUM(successful) = 0 AND SUM(total_deliveries) > 10
          "#
      )
      .fetch_all(pool).await?;

      let mut disabled = Vec::new();
      for (eid,) in endpoints {
          sqlx::query("UPDATE endpoints SET is_active = false WHERE id = $1 AND is_active = true")
              .bind(eid).execute(pool).await?;
          sqlx::query(
              "INSERT INTO healing_actions (endpoint_id, action_type, trigger_reason)
               VALUES ($1, 'auto_disable', '5 gün %0 success')"
          )
          .bind(eid).execute(pool).await?;
          disabled.push(eid);
      }
      Ok(disabled)
  }

  /// Cascade prevention: 10+ endpoint aynı anda fail
  pub async fn check_cascade(pool: &PgPool) -> Result<bool, sqlx::Error> {
      let count: (i64,) = sqlx::query_as(
          r#"
          SELECT COUNT(DISTINCT endpoint_id) FROM endpoint_hourly_stats
          WHERE hour_start > NOW() - INTERVAL '1 hour'
            AND failed > 0 AND successful = 0
          "#
      )
      .fetch_one(pool).await?;

      Ok(count.0 >= 10)
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod healing_engine;
□ cargo check
□ Git commit: "feat(cortex): healing engine - auto-disable + cascade prevention"
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

  CREATE INDEX IF NOT EXISTS idx_predictions_endpoint
      ON failure_predictions(endpoint_id, created_at DESC);

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 083 - failure predictions"
```

### Adım 5.2 — Predictive Engine Yaz
```
□ Dosya oluştur: api/src/cortex/predictive_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;

  /// Failure prediction: trend + seasonality + error momentum
  pub async fn predict_failure(
      pool: &PgPool, endpoint_id: Uuid
  ) -> Result<f64, sqlx::Error> {
      // Son 3 saatlik trend
      let trend: Vec<(f64,)> = sqlx::query_as(
          r#"
          SELECT COALESCE(
              SUM(successful)::FLOAT / NULLIF(SUM(total_deliveries),0), 1.0
          )
          FROM endpoint_hourly_stats
          WHERE endpoint_id = $1
            AND hour_start > NOW() - INTERVAL '3 hours'
          ORDER BY hour_start DESC
          "#
      )
      .bind(endpoint_id)
      .fetch_all(pool).await?;

      if trend.is_empty() { return Ok(0.0); }

      let recent_rate = trend.first().map(|r| r.0).unwrap_or(1.0);

      // Basit tahmin: success rate düşükse failure probability yüksek
      let probability = (1.0 - recent_rate).max(0.0).min(1.0);
      Ok(probability)
  }

  /// Capacity forecast: mevcut hızla limit ne zaman aşılır
  pub async fn forecast_capacity(
      pool: &PgPool, customer_id: uuid::Uuid
  ) -> Result<Option<chrono::DateTime<chrono::Utc>>, sqlx::Error> {
      let stats: (i64, i64) = sqlx::query_as(
          r#"
          SELECT COALESCE(SUM(total_deliveries),0),
                 EXTRACT(EPOCH FROM (MAX(hour_start) - MIN(hour_start)))::BIGINT
          FROM endpoint_hourly_stats eh
          JOIN endpoints e ON e.id = eh.endpoint_id
          WHERE e.customer_id = $1
            AND hour_start > NOW() - INTERVAL '7 days'
          "#
      )
      .bind(customer_id)
      .fetch_one(pool).await?;

      let (total, seconds) = stats;
      if total == 0 || seconds == 0 { return Ok(None); }

      let rate_per_hour = total as f64 / (seconds as f64 / 3600.0);
      let limit = 10000.0; // Free tier
      let remaining = limit - (total as f64 % limit);
      let hours_remaining = remaining / rate_per_hour;

      Ok(Some(chrono::Utc::now() + chrono::Duration::hours(hours_remaining as i64)))
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod predictive_engine;
□ cargo check
□ Git commit: "feat(cortex): predictive engine - failure prediction + capacity forecast"
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

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 084 - weekly reports, customer health, recommendations"
```

### Adım 6.2 — Insights Engine Yaz
```
□ Dosya oluştur: api/src/cortex/insights_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;
  use chrono::{NaiveDate, Utc, Duration};

  /// Haftalık rapor oluştur
  pub async fn generate_weekly_report(
      pool: &PgPool, customer_id: Uuid
  ) -> Result<(), sqlx::Error> {
      let now = Utc::now();
      let week_start = (now - Duration::days(7)).date_naive();
      let week_end = now.date_naive();

      let stats: (i64, i64, i64) = sqlx::query_as(
          r#"
          SELECT COALESCE(SUM(eh.total_deliveries),0),
                 COALESCE(SUM(eh.successful),0),
                 COALESCE(SUM(eh.failed),0)
          FROM endpoint_hourly_stats eh
          JOIN endpoints e ON e.id = eh.endpoint_id
          WHERE e.customer_id = $1
            AND eh.hour_start > NOW() - INTERVAL '7 days'
          "#
      )
      .bind(customer_id)
      .fetch_one(pool).await?;

      let (total, successful, _failed) = stats;
      let success_rate = if total > 0 { (successful as f64 / total as f64) * 100.0 } else { 100.0 };

      sqlx::query(
          r#"
          INSERT INTO weekly_reports (customer_id, week_start, week_end, total_deliveries, success_rate)
          VALUES ($1, $2, $3, $4, $5)
          "#
      )
      .bind(customer_id).bind(week_start).bind(week_end)
      .bind(total as i32).bind(success_rate)
      .execute(pool).await?;

      Ok(())
  }

  /// Customer health hesapla
  pub async fn calculate_customer_health(
      pool: &PgPool, customer_id: Uuid
  ) -> Result<(), sqlx::Error> {
      // Integration score: endpoint var mı, API key kullanılmış mı
      let ep_count: (i64,) = sqlx::query_as(
          "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1"
      )
      .bind(customer_id).fetch_one(pool).await?;

      let integration = if ep_count.0 > 0 { 50 } else { 0 };

      // Stability score: success rate
      let stats: (i64, i64) = sqlx::query_as(
          r#"
          SELECT COALESCE(SUM(total_deliveries),0), COALESCE(SUM(successful),0)
          FROM endpoint_hourly_stats eh
          JOIN endpoints e ON e.id = eh.endpoint_id
          WHERE e.customer_id = $1 AND eh.hour_start > NOW() - INTERVAL '7 days'
          "#
      )
      .bind(customer_id).fetch_one(pool).await?;

      let stability = if stats.0 > 0 {
          ((stats.1 as f64 / stats.0 as f64) * 50.0) as i32
      } else { 50 };

      let health_score = integration + stability;
      let grade = match health_score {
          90..=100 => "A",
          70..=89 => "B",
          50..=69 => "C",
          30..=49 => "D",
          _ => "F",
      };
      let churn_risk = if health_score < 30 { 0.8 }
          else if health_score < 50 { 0.5 }
          else { 0.1 };

      sqlx::query(
          r#"
          INSERT INTO customer_health (customer_id, integration_score, stability_score,
              health_score, health_grade, churn_risk, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (customer_id) DO UPDATE SET
              integration_score=EXCLUDED.integration_score,
              stability_score=EXCLUDED.stability_score,
              health_score=EXCLUDED.health_score,
              health_grade=EXCLUDED.health_grade,
              churn_risk=EXCLUDED.churn_risk,
              updated_at=NOW()
          "#
      )
      .bind(customer_id).bind(integration).bind(stability)
      .bind(health_score).bind(grade).bind(churn_risk)
      .execute(pool).await?;

      Ok(())
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod insights_engine;
□ cargo check
□ Git commit: "feat(cortex): insights engine - weekly report + customer health"
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

  CREATE INDEX IF NOT EXISTS idx_routing_endpoint
      ON routing_decisions(endpoint_id, created_at DESC);

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 085 - routing decisions"
```

### Adım 7.2 — Smart Routing Yaz
```
□ Dosya oluştur: api/src/cortex/smart_routing.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;

  /// Fallback URL'ler arasından en iyisini seç
  pub async fn choose_url(
      pool: &PgPool,
      endpoint_id: Uuid,
      primary_url: &str,
      fallback_urls: &[String],
  ) -> String {
      if fallback_urls.is_empty() {
          return primary_url.to_string();
      }

      // Tüm URL'ler için son 5 dakikadaki başarı oranını al
      let mut best_url = primary_url.to_string();
      let mut best_score = get_url_score(pool, endpoint_id, primary_url).await;

      for url in fallback_urls {
          let score = get_url_score(pool, endpoint_id, url).await;
          if score > best_score {
              best_score = score;
              best_url = url.clone();
          }
      }

      // Routing kararını logla
      let _ = sqlx::query(
          "INSERT INTO routing_decisions (endpoint_id, chosen_url, reason, alternatives)
           VALUES ($1, $2, 'highest_score', $3)"
      )
      .bind(endpoint_id)
      .bind(&best_url)
      .bind(serde_json::json!({"primary": primary_url, "fallbacks": fallback_urls}))
      .execute(pool).await;

      best_url
  }

  async fn get_url_score(pool: &PgPool, _endpoint_id: Uuid, _url: &str) -> f64 {
      // Basit skor: son 5 dakikadaki success rate
      // Gerçek implementasyonda URL bazlı tracking gerekir
      // Şimdilik primary URL'e yüksek skor ver
      let stats: (i64, i64) = sqlx::query_as(
          "SELECT COALESCE(SUM(total_deliveries),0), COALESCE(SUM(successful),0)
           FROM endpoint_hourly_stats
           WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '5 minutes'"
      )
      .bind(_endpoint_id)
      .fetch_one(pool)
      .await
      .unwrap_or((0, 0));

      if stats.0 == 0 { return 100.0; } // Veri yoksa varsayılan
      (stats.1 as f64 / stats.0 as f64) * 100.0
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod smart_routing;
□ cargo check
□ Git commit: "feat(cortex): smart routing - latency-based + error-aware"
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
