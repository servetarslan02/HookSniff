# 📋 Cortex Uygulama Planı — Aşamalı Takip (v2)

> Son güncelleme: 2026-05-20
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

## 🏗️ MİMARİ NOTLAR (Önemli!)

```
HookSniff iki ayrı binary'den oluşur:
├── api/           → Rust API (axum, port 3000) — background job'lar burada
├── worker/        → Rust Worker (ayrı binary) — HTTP teslimat burada olur
├── common/        → Paylaşılan kütüphane (signing, ssrf, http_client)
└── dashboard/     → Next.js 16 (Vercel'de deploy)

KURAL: Teslimat worker'da olur. Signal toplama worker'da, aggregation API'de.
Worker-API iletişimi: PostgreSQL üzerinden (worker yazar, API okur).
```

---

## 🔧 CROSS-CUTTING CONCERNS (Tüm Aşamaları İlgilendirir)

### CC-1: Distributed Lock (KRİTİK)
```
□ api/src/cortex/mod.rs'de, her Cortex job'ı için lock helper ekle:

  use sqlx::PgPool;

  /// Cortex job'ları için distributed lock (Redis varsa Redis, yoksa PostgreSQL advisory lock)
  pub async fn try_cortex_lock(
      pool: &PgPool,
      lock_name: &str,
      ttl_secs: i64,
  ) -> bool {
      // PostgreSQL advisory lock (basit, güvenilir)
      let lock_id = match lock_name {
          "cortex_hourly" => 9001i64,
          "cortex_profile" => 9002,
          "cortex_healing" => 9003,
          "cortex_surge" => 9004,
          "cortex_predict" => 9005,
          "cortex_report" => 9006,
          "cortex_routing" => 9007,
          _ => 9099,
      };
      let result: (bool,) = sqlx::query_as(
          "SELECT pg_try_advisory_lock($1)"
      )
      .bind(lock_id)
      .fetch_one(pool)
      .await
      .unwrap_or((false,));
      result.0
  }

  pub async fn release_cortex_lock(pool: &PgPool, lock_name: &str) {
      let lock_id = match lock_name {
          "cortex_hourly" => 9001i64,
          "cortex_profile" => 9002,
          "cortex_healing" => 9003,
          "cortex_surge" => 9004,
          "cortex_predict" => 9005,
          "cortex_report" => 9006,
          "cortex_routing" => 9007,
          _ => 9099,
      };
      let _ = sqlx::query("SELECT pg_advisory_unlock($1)")
          .bind(lock_id)
          .execute(pool)
          .await;
  }

□ Her Cortex job'ında KULLAN (aşağıda her aşamada belirtiliyor)
□ Git commit: "feat(cortex): distributed lock via PostgreSQL advisory locks"
```

### CC-2: Cortex Configuration (platform_settings)
```
□ migrations/087_cortex_config.sql oluştur:

  -- Cortex configuration (all thresholds configurable)
  -- Stored in platform_settings under 'cortex_config' key
  -- Defaults applied if key missing

  -- No new table needed — uses existing platform_settings
  -- Example cortex_config JSON:
  -- {
  --   "hourly_stats_enabled": true,
  --   "profile_update_interval_mins": 15,
  --   "anomaly_default_p95_ms": 5000,
  --   "anomaly_default_p99_ms": 10000,
  --   "anomaly_high_threshold": 70,
  --   "auto_disable_days": 14,
  --   "cascade_threshold_pct": 20,
  --   "recovery_ramp_steps": [10, 20, 50, 100, 200],
  --   "recovery_step_interval_secs": 60,
  --   "recovery_min_success_rate": 95.0,
  --   "alert_correlation_window_mins": 5,
  --   "alert_correlation_min_count": 3,
  --   "predictive_failure_threshold": 0.7,
  --   "predictive_trend_threshold": -0.1,
  --   "predictive_momentum_threshold": -0.1,
  --   "error_breakdown_max_entries": 10
  -- }

□ api/src/cortex/config.rs oluştur:

  use serde::{Deserialize, Serialize};

  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub struct CortexConfig {
      pub hourly_stats_enabled: bool,
      pub profile_update_interval_mins: i64,
      pub anomaly_default_p95_ms: i32,
      pub anomaly_default_p99_ms: i32,
      pub anomaly_high_threshold: i32,
      pub auto_disable_days: i64,
      pub cascade_threshold_pct: f64,
      pub recovery_ramp_steps: Vec<f64>,
      pub recovery_step_interval_secs: i64,
      pub recovery_min_success_rate: f64,
      pub alert_correlation_window_mins: i64,
      pub alert_correlation_min_count: i32,
      pub predictive_failure_threshold: f64,
      pub predictive_trend_threshold: f64,
      pub predictive_momentum_threshold: f64,
      pub error_breakdown_max_entries: i32,
  }

  impl Default for CortexConfig {
      fn default() -> Self {
          Self {
              hourly_stats_enabled: true,
              profile_update_interval_mins: 15,
              anomaly_default_p95_ms: 5000,
              anomaly_default_p99_ms: 10000,
              anomaly_high_threshold: 70,
              auto_disable_days: 14,
              cascade_threshold_pct: 20.0,
              recovery_ramp_steps: vec![10.0, 20.0, 50.0, 100.0, 200.0],
              recovery_step_interval_secs: 60,
              recovery_min_success_rate: 95.0,
              alert_correlation_window_mins: 5,
              alert_correlation_min_count: 3,
              predictive_failure_threshold: 0.7,
              predictive_trend_threshold: -0.1,
              predictive_momentum_threshold: -0.1,
              error_breakdown_max_entries: 10,
          }
      }
  }

  impl CortexConfig {
      pub async fn load(pool: &sqlx::PgPool) -> Self {
          let result: Option<(serde_json::Value,)> = sqlx::query_as(
              "SELECT value->'cortex_config' FROM platform_settings WHERE key = 'main'"
          )
          .fetch_optional(pool)
          .await
          .unwrap_or(None);

          match result {
              Some((Some(json),)) => serde_json::from_value(json).unwrap_or_default(),
              _ => Self::default(),
          }
      }
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod config;
□ Her Cortex modülünde CortexConfig::load() kullan (hardcoded değerler yerine)
□ Git commit: "feat(cortex): configurable thresholds via platform_settings"
```

### CC-3: Monitoring — Prometheus Metrics
```
□ api/src/cortex/mod.rs'de, Cortex metrics struct'ı ekle:

  use std::sync::atomic::{AtomicU64, Ordering};
  use std::sync::Arc;

  #[derive(Default)]
  pub struct CortexMetrics {
      pub hourly_stats_runs: AtomicU64,
      pub hourly_stats_endpoints: AtomicU64,
      pub hourly_stats_errors: AtomicU64,
      pub profile_updates: AtomicU64,
      pub profile_errors: AtomicU64,
      pub anomaly_scores_high: AtomicU64,
      pub healing_actions: AtomicU64,
      pub cascade_detections: AtomicU64,
      pub recovery_surges_started: AtomicU64,
      pub recovery_surges_completed: AtomicU64,
      pub predictions_generated: AtomicU64,
      pub alerts_correlated: AtomicU64,
  }

□ api/src/metrics.rs'de, Cortex metrics'i Prometheus format'ında expose et:
  - cortex_hourly_stats_runs_total
  - cortex_hourly_stats_endpoints_processed
  - cortex_profile_updates_total
  - cortex_anomaly_scores_high_total (score > 70)
  - cortex_healing_actions_total
  - cortex_cascade_detections_total
  - cortex_recovery_surges_active

□ Her Cortex modülünde metrics güncelle (aşağıda belirtiliyor)
□ Git commit: "feat(cortex): prometheus metrics for all cortex modules"
```

### CC-4: API Endpoints (TÜM Aşamalar İçin)
```
□ api/src/routes/cortex.rs oluştur:

  use axum::{extract::Extension, Json, routing::get};
  use sqlx::PgPool;
  use uuid::Uuid;

  pub fn router() -> axum::Router {
      axum::Router::new()
          // Stage 1: Hourly Stats
          .route("/stats", get(get_hourly_stats))
          .route("/stats/:endpoint_id", get(get_endpoint_stats))
          // Stage 2: Profiles
          .route("/profiles", get(get_profiles))
          .route("/profiles/:endpoint_id", get(get_endpoint_profile))
          // Stage 3: Anomalies
          .route("/anomalies", get(get_anomalies))
          .route("/anomalies/high", get(get_high_anomalies))
          // Stage 3: Alert Correlation
          .route("/correlations", get(get_correlations))
          // Stage 4: Healing
          .route("/healing/actions", get(get_healing_actions))
          .route("/healing/recovery-tests", get(get_recovery_tests))
          // Stage 5: Predictions
          .route("/predictions", get(get_predictions))
          .route("/predictions/capacity", get(get_capacity_forecast))
          // Stage 6: Insights (mevcut)
          .route("/health", get(get_customer_health))
          .route("/reports", get(get_weekly_reports))
          .route("/recommendations", get(get_recommendations))
          // Stage 7: Routing
          .route("/routing/decisions", get(get_routing_decisions))
          // Stage 8: Recovery Surge
          .route("/surge/status", get(get_surge_status))
          // Cortex health
          .route("/system/health", get(get_cortex_health))
  }

  // ... handler fonksiyonları (her biri basit SELECT + JSON response)

□ api/src/routes/mod.rs'ye ekle:
  pub mod cortex;

□ api/src/routes/mod.rs'deki protected router'a ekle:
  .nest("/cortex", cortex::router())

□ Git commit: "feat(cortex): API endpoints for all cortex stages"
```

### CC-5: Dashboard Sayfası (TÜM Aşamalar İçin)
```
□ dashboard/src/app/[locale]/(dashboard)/cortex/page.tsx oluştur:

  Tek bir "Intelligence" sayfası, 4 sekme:
  - Overview: hourly stats grafik, anomaly trend, health score
  - Anomalies: anomali listesi, skor dağılımı, correlation grupları
  - Healing: auto-disabled endpoints, recovery tests, cascade alerts
  - Predictions: failure probability, capacity forecast, surge status

□ Git commit: "feat(cortex): unified cortex dashboard page"
```

---

## AŞAMA 1: Hourly Stats Aggregator 🔴 KRİTİK

**Amaç:** Mevcut `delivery_attempts` tablosundan saatlik özet oluştur.
**Süre:** 1-2 oturum | **Risk:** SIFIR

> **NOT:** Orijinal planda `delivery_signals` diye yeni bir tablo vardı.
> Bu tabloyu KALDIRDIK çünkü `delivery_attempts` zaten aynı veriyi tutuyor
> (status_code, duration_ms, error_message, attempt_number).
> Doğrudan mevcut tablolardan aggregate ediyoruz.

### Adım 1.1 — Migration
```
□ Dosya oluştur: migrations/079_cortex_hourly_stats.sql

İçerik:

  -- Cortex: Hourly stats aggregation table
  -- Populated by background job from delivery_attempts + deliveries
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

□ Neon DB'ye uygula: node run-migrations.js
□ Doğrulama: psql ile tabloları kontrol et
□ Git commit: "feat(cortex): migration 079 - hourly stats"
```

> **⚠️ DÜZELTME:** Orijinal planda aggregation query hatalıydı:
> 1. `JOIN delivery_attempts` → her delivery için birden fazla attempt var → COUNT(*) attempt sayıyordu
> 2. Latency TÜM attempt'lerden ortalaması alınıyordu (son attempt'in latency'si önemli)
> 3. LATERAL + window function subquery karmaşık ve hatalı sonuç veriyordu
>
> Aşağıdaki düzeltilmiş versiyon:
> - `COUNT(DISTINCT d.id)` ile delivery sayar (attempt değil)
> - Her delivery için sadece SON attempt'in latency'sini kullanır
> - Error breakdown basit ve doğru gruplama yapar

### Adım 1.2 — Cortex Modülü
```
□ Dosya oluştur: api/src/cortex/mod.rs

İçerik:

  //! Cortex — HookSniff Akıllı Sistem Motoru
  //!
  //! Her modül bağımsız çalışır, birbiriyle PostgreSQL üzerinden iletişim kurar.
  //! Tüm eşikler CortexConfig'den okunur (platform_settings.cortex_config).

  pub mod config;
  pub mod signal_collector;
  pub mod profile_engine;
  pub mod anomaly_scorer;
  pub mod alert_correlation;
  pub mod healing_engine;
  pub mod predictive_engine;
  pub mod insights_engine;
  pub mod smart_routing;
  pub mod recovery_surge;

  // Re-export commonly used items
  pub use config::CortexConfig;

  // Distributed lock helpers
  pub async fn try_cortex_lock(pool: &sqlx::PgPool, lock_name: &str, _ttl_secs: i64) -> bool {
      let lock_id = match lock_name {
          "cortex_hourly" => 9001i64,
          "cortex_profile" => 9002,
          "cortex_healing" => 9003,
          "cortex_surge" => 9004,
          "cortex_predict" => 9005,
          "cortex_report" => 9006,
          "cortex_routing" => 9007,
          _ => 9099,
      };
      let result: (bool,) = sqlx::query_as("SELECT pg_try_advisory_lock($1)")
          .bind(lock_id).fetch_one(pool).await.unwrap_or((false,));
      result.0
  }

  pub async fn release_cortex_lock(pool: &sqlx::PgPool, lock_name: &str) {
      let lock_id = match lock_name {
          "cortex_hourly" => 9001i64,
          "cortex_profile" => 9002,
          "cortex_healing" => 9003,
          "cortex_surge" => 9004,
          "cortex_predict" => 9005,
          "cortex_report" => 9006,
          "cortex_routing" => 9007,
          _ => 9099,
      };
      let _ = sqlx::query("SELECT pg_advisory_unlock($1)")
          .bind(lock_id).execute(pool).await;
  }

□ api/src/lib.rs'ye ekle (mevcut modüllerin yanına):
  pub mod cortex;

□ cargo check
□ Git commit: "feat(cortex): initialize cortex module with all sub-modules"
```

### Adım 1.3 — Hourly Stats Aggregator Yaz
```
□ Dosya oluştur: api/src/cortex/signal_collector.rs

İçerik (copy-paste, çalışır kod):

  use chrono::{DateTime, Utc};

  /// Son 1 saatten hourly_stats oluştur (her saat 00:01'de çağrılır)
  ///
  /// Mantık:
  /// 1. deliveries tablosundan o saat aralığındaki webhook'ları bul
  /// 2. Her delivery için SON attempt'in latency'sini al
  /// 3. Endpoint bazında aggregate et (COUNT DISTINCT = delivery sayısı)
  /// 4. error_breakdown: en sık görülen error_message'ları JSON olarak tut
  pub async fn aggregate_hourly_stats(
      pool: &sqlx::PgPool,
      hour_start: DateTime<Utc>,
  ) -> Result<u64, sqlx::Error> {
      let hour_end = hour_start + chrono::Duration::hours(1);
      let result = sqlx::query(
          r#"
          INSERT INTO endpoint_hourly_stats
              (endpoint_id, hour_start, total_deliveries, successful, failed,
               avg_latency_ms, p50_latency_ms, p95_latency_ms, p99_latency_ms, error_breakdown)
          WITH latest_attempts AS (
              -- Her delivery için SADECE son attempt'i al (en yüksek attempt_number)
              SELECT DISTINCT ON (da.delivery_id)
                  da.delivery_id,
                  da.duration_ms,
                  da.error_message,
                  da.status_code
              FROM delivery_attempts da
              JOIN deliveries d ON d.id = da.delivery_id
              WHERE d.created_at >= $1 AND d.created_at < $2
              ORDER BY da.delivery_id, da.attempt_number DESC
          ),
          endpoint_stats AS (
              SELECT
                  d.endpoint_id,
                  COUNT(DISTINCT d.id) as total,
                  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'delivered') as ok,
                  COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('failed', 'dead_letter')) as fail,
                  COALESCE(AVG(la.duration_ms), 0)::INT as avg_lat,
                  COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p50,
                  COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p95,
                  COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY la.duration_ms), 0)::INT as p99
              FROM deliveries d
              LEFT JOIN latest_attempts la ON la.delivery_id = d.id
              WHERE d.created_at >= $1 AND d.created_at < $2
              GROUP BY d.endpoint_id
          ),
          error_stats AS (
              -- Error breakdown: hangi hata mesajı kaç kez oluştu
              SELECT
                  d.endpoint_id,
                  COALESCE(jsonb_object_agg(
                      COALESCE(NULLIF(la.err_msg, ''), 'success'),
                      la.cnt
                  ), '{}'::jsonb) as breakdown
              FROM (
                  SELECT DISTINCT endpoint_id FROM deliveries
                  WHERE created_at >= $1 AND created_at < $2
              ) d
              LEFT JOIN (
                  SELECT
                      d2.endpoint_id,
                      la2.error_message as err_msg,
                      COUNT(*) as cnt
                  FROM deliveries d2
                  JOIN latest_attempts la2 ON la2.delivery_id = d2.id
                  WHERE d2.created_at >= $1 AND d2.created_at < $2
                  GROUP BY d2.endpoint_id, la2.error_message
              ) la ON la.endpoint_id = d.endpoint_id
              GROUP BY d.endpoint_id
          )
          SELECT
              es.endpoint_id,
              $1,
              es.total,
              es.ok,
              es.fail,
              es.avg_lat,
              es.p50,
              es.p95,
              es.p99,
              COALESCE(err.breakdown, '{}'::jsonb)
          FROM endpoint_stats es
          LEFT JOIN error_stats err ON err.endpoint_id = es.endpoint_id
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

□ cargo check
□ Git commit: "feat(cortex): hourly stats aggregator (fixed: distinct deliveries, latest attempt)"
```

### Adım 1.4 — Saatlik Job (API Process) + Distributed Lock
```
□ api/src/main.rs'de, mevcut background job'ların yanına ekle:

  // Cortex: Saatlik aggregation (her saat 00:01'de) + distributed lock
  let cortex_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          let now = chrono::Utc::now();
          let next_hour = (now + chrono::Duration::hours(1))
              .with_minute(0).unwrap().with_second(0).unwrap();
          let wait = (next_hour - now).num_milliseconds().max(0) as u64;
          tokio::time::sleep(std::time::Duration::from_millis(wait)).await;

          // Distributed lock: birden fazla instance varsa sadece biri çalışsın
          if !hooksniff_api::cortex::try_cortex_lock(&cortex_pool, "cortex_hourly", 300).await {
              tracing::debug!("⏭️ Cortex hourly: another instance holds lock, skipping");
              continue;
          }

          let hour_start = now.with_minute(0).unwrap().with_second(0).unwrap();
          match hooksniff_api::cortex::signal_collector::aggregate_hourly_stats(
              &cortex_pool, hour_start
          ).await {
              Ok(n) => {
                  tracing::info!("📊 Cortex: Aggregated {} endpoints", n);
                  CORTEX_METRICS.hourly_stats_runs.fetch_add(1, Ordering::Relaxed);
                  CORTEX_METRICS.hourly_stats_endpoints.fetch_add(n, Ordering::Relaxed);
              }
              Err(e) => {
                  tracing::error!("❌ Cortex aggregation failed: {:?}", e);
                  CORTEX_METRICS.hourly_stats_errors.fetch_add(1, Ordering::Relaxed);
              }
          }

          hooksniff_api::cortex::release_cortex_lock(&cortex_pool, "cortex_hourly").await;
      }
  });

□ cargo check
□ Git commit: "feat(cortex): hourly job with distributed lock + metrics"
```

### Adım 1.5 — Retention
```
□ api/src/jobs/retention.rs'de, mevcut cleanup fonksiyonuna EKLE (en sona):

  // Cortex: 90 günden eski hourly_stats temizle
  let r = sqlx::query("DELETE FROM endpoint_hourly_stats WHERE hour_start < NOW() - INTERVAL '90 days'")
      .execute(pool).await?;
  if r.rows_affected() > 0 {
      tracing::info!("🧹 Cleaned {} old hourly_stats", r.rows_affected());
  }

□ NOT: worker/src/main.rs'deki cleanup_expired_retention() fonksiyonuna DA ekle
  (worker ayrı binary ama kendi retention cleanup'ını yapıyor)

□ Git commit: "feat(cortex): retention for hourly_stats (90 days)"
```

### Adım 1.6 — Test
```
□ API başlat, webhook gönder
□ Saatlik aggregation bekle (veya manüel test: aggregate_hourly_stats(pool, hour_start).await)
□ hourly_stats'da veri var mı: SELECT * FROM endpoint_hourly_stats LIMIT 5;
□ total_deliveries = COUNT(DISTINCT delivery_id) mı? (attempt sayısı değil)
□ p95_latency_ms mantıklı mı?
□ error_breakdown JSON doğru mu?
□ Git push
```

### AŞAMA 1 TAMAMLANDI □

---

## AŞAMA 2: Profile Engine 🔴 YÜKSEK

**Amaç:** Her endpoint için "normal davranış" profili oluştur (3 pencere: 1h, 24h, 7d).
**Süre:** 1-2 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1

### Adım 2.1 — Migration
```
□ Dosya oluştur: migrations/080_cortex_profiles.sql

İçerik:

  CREATE TABLE IF NOT EXISTS endpoint_profiles (
      endpoint_id UUID PRIMARY KEY REFERENCES endpoints(id) ON DELETE CASCADE,
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

> **⚠️ DÜZELTMELER:**
> 1. `REFERENCES endpoints(id) ON DELETE CASCADE` — endpoint silinince profil de silinir
> 2. 3 ayrı sorgu → 1 sorgu (conditional aggregation ile)
> 3. Eksik kolonlar dolduruldu: latency_stddev, traffic_pattern, dominant_error_type, busiest_hour, error_distribution
> 4. Distributed lock eklendi

### Adım 2.2 — Profile Engine Yaz (Tek Sorgu, Tüm Kolonlar)
```
□ Dosya oluştur: api/src/cortex/profile_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;

  /// Her endpoint için profil güncelle — TEK SORGU ile tüm pencere ve kolonlar.
  ///
  /// 3 ayrı sorgu yerine conditional aggregation kullanır:
  /// - 7d: latency + success rate + error distribution
  /// - 24h: success rate
  /// - 1h: success rate + delivery rate
  pub async fn update_profile(pool: &PgPool, endpoint_id: Uuid) -> Result<(), sqlx::Error> {
      let stats = sqlx::query_as::<_, ProfileRow>(
          r#"
          WITH hourly_data AS (
              SELECT
                  hour_start,
                  total_deliveries,
                  successful,
                  failed,
                  avg_latency_ms,
                  p95_latency_ms,
                  p99_latency_ms,
                  error_breakdown,
                  EXTRACT(HOUR FROM hour_start)::INT as hour_of_day,
                  EXTRACT(DOW FROM hour_start)::INT as day_of_week
              FROM endpoint_hourly_stats
              WHERE endpoint_id = $1
                AND hour_start > NOW() - INTERVAL '7 days'
          ),
          windowed AS (
              SELECT
                  -- 7d metrics
                  SUM(total_deliveries)::BIGINT as total_7d,
                  SUM(successful)::BIGINT as successful_7d,
                  SUM(failed)::BIGINT as failed_7d,
                  COALESCE(AVG(avg_latency_ms), 0)::FLOAT as avg_lat,
                  COALESCE(AVG(p95_latency_ms), 0)::FLOAT as p95_lat,
                  COALESCE(AVG(p99_latency_ms), 0)::FLOAT as p99_lat,
                  COALESCE(STDDEV(avg_latency_ms), 0)::FLOAT as lat_stddev,
                  COUNT(*)::INT as hours_with_data,

                  -- 24h metrics
                  COALESCE(SUM(total_deliveries) FILTER (
                      WHERE hour_start > NOW() - INTERVAL '24 hours'
                  ), 0)::BIGINT as total_24h,
                  COALESCE(SUM(successful) FILTER (
                      WHERE hour_start > NOW() - INTERVAL '24 hours'
                  ), 0)::BIGINT as successful_24h,

                  -- 1h metrics
                  COALESCE(SUM(total_deliveries) FILTER (
                      WHERE hour_start > NOW() - INTERVAL '1 hour'
                  ), 0)::BIGINT as total_1h,
                  COALESCE(SUM(successful) FILTER (
                      WHERE hour_start > NOW() - INTERVAL '1 hour'
                  ), 0)::BIGINT as successful_1h,

                  -- Traffic pattern: saatlik dağılım
                  COALESCE(AVG(total_deliveries), 0)::FLOAT as avg_per_hour,
                  COALESCE(MAX(total_deliveries), 0)::INT as peak_per_hour,

                  -- Busiest/quietest hour
                  (SELECT hour_of_day FROM hourly_data ORDER BY total_deliveries DESC LIMIT 1) as busiest,
                  (SELECT hour_of_day FROM hourly_data ORDER BY total_deliveries ASC LIMIT 1) as quietest

              FROM hourly_data
          ),
          error_stats AS (
              -- Dominant error type (en sık görülen)
              SELECT err_msg, err_count
              FROM (
                  SELECT
                      COALESCE(NULLIF(kv.key, ''), 'success') as err_msg,
                      SUM((kv.value::TEXT)::INT) as err_count
                  FROM hourly_data h,
                  LATERAL jsonb_each(h.error_breakdown) kv
                  GROUP BY kv.key
              ) sub
              ORDER BY err_count DESC
              LIMIT 1
          ),
          error_distribution AS (
              -- Tüm error'ların dağılımı (JSON object)
              SELECT COALESCE(jsonb_object_agg(kv.key, total), '{}'::jsonb) as dist
              FROM (
                  SELECT kv.key, SUM((kv.value::TEXT)::INT) as total
                  FROM hourly_data h,
                  LATERAL jsonb_each(h.error_breakdown) kv
                  GROUP BY kv.key
                  LIMIT 20  -- Max 20 error tipi
              ) sub
          ),
          weekday_weekend AS (
              SELECT
                  COALESCE(AVG(total_deliveries) FILTER (WHERE day_of_week BETWEEN 1 AND 5), 0)::FLOAT as weekday_avg,
                  COALESCE(AVG(total_deliveries) FILTER (WHERE day_of_week IN (0, 6)), 0)::FLOAT as weekend_avg
              FROM hourly_data
          )
          SELECT
              w.total_7d,
              w.successful_7d,
              w.failed_7d,
              w.avg_lat,
              w.p95_lat,
              w.p99_lat,
              w.lat_stddev,
              w.total_24h,
              w.successful_24h,
              w.total_1h,
              w.successful_1h,
              w.avg_per_hour,
              w.peak_per_hour,
              w.hours_with_data,
              w.busiest,
              w.quietest,
              ww.weekday_avg,
              ww.weekend_avg,
              es.err_msg as dominant_error,
              ed.dist as error_dist
          FROM windowed w
          CROSS JOIN weekday_weekend ww
          CROSS JOIN error_distribution ed
          LEFT JOIN error_stats es ON true
          "#
      )
      .bind(endpoint_id)
      .fetch_optional(pool)
      .await?;

      let row = match stats {
          Some(r) => r,
          None => return Ok(()), // Veri yok
      };

      if row.total_7d == 0 { return Ok(()); }

      // Success rates
      let success_rate_7d = (row.successful_7d as f64 / row.total_7d as f64) * 100.0;
      let success_rate_24h = if row.total_24h > 0 {
          (row.successful_24h as f64 / row.total_24h as f64) * 100.0
      } else { success_rate_7d };
      let success_rate_1h = if row.total_1h > 0 {
          (row.successful_1h as f64 / row.total_1h as f64) * 100.0
      } else { success_rate_24h };

      // Confidence: hem sample_size hem de veri tazeliği
      let size_confidence = (row.total_7d as f64 / 1000.0).min(1.0);
      let freshness_confidence = (row.hours_with_data as f64 / 168.0).min(1.0); // 168 = 7 gün × 24 saat
      let confidence = (size_confidence * 0.7 + freshness_confidence * 0.3).min(1.0);

      // Error distribution (CTE'den gelen gerçek değer)
      // row.error_dist zaten serde_json::Value olarak geliyor

      sqlx::query(
          r#"
          INSERT INTO endpoint_profiles
              (endpoint_id, latency_p50, latency_p95, latency_p99, latency_stddev,
               success_rate_1h, success_rate_24h, success_rate_7d,
               baseline_success_rate, avg_deliveries_per_hour, peak_deliveries_per_hour,
               dominant_error_type, error_distribution,
               busiest_hour, quietest_hour, weekday_avg, weekend_avg,
               sample_size, confidence, last_updated, updated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),NOW())
          ON CONFLICT (endpoint_id) DO UPDATE SET
              latency_p50=EXCLUDED.latency_p50,
              latency_p95=EXCLUDED.latency_p95,
              latency_p99=EXCLUDED.latency_p99,
              latency_stddev=EXCLUDED.latency_stddev,
              success_rate_1h=EXCLUDED.success_rate_1h,
              success_rate_24h=EXCLUDED.success_rate_24h,
              success_rate_7d=EXCLUDED.success_rate_7d,
              baseline_success_rate=EXCLUDED.baseline_success_rate,
              avg_deliveries_per_hour=EXCLUDED.avg_deliveries_per_hour,
              peak_deliveries_per_hour=EXCLUDED.peak_deliveries_per_hour,
              dominant_error_type=EXCLUDED.dominant_error_type,
              error_distribution=EXCLUDED.error_distribution,
              busiest_hour=EXCLUDED.busiest_hour,
              quietest_hour=EXCLUDED.quietest_hour,
              weekday_avg=EXCLUDED.weekday_avg,
              weekend_avg=EXCLUDED.weekend_avg,
              sample_size=EXCLUDED.sample_size,
              confidence=EXCLUDED.confidence,
              last_updated=NOW(),
              updated_at=NOW()
          "#
      )
      .bind(endpoint_id)
      .bind(row.avg_lat as i32)
      .bind(row.p95_lat as i32)
      .bind(row.p99_lat as i32)
      .bind(row.lat_stddev)
      .bind(success_rate_1h)
      .bind(success_rate_24h)
      .bind(success_rate_7d)
      .bind(row.avg_per_hour)
      .bind(row.peak_per_hour)
      .bind(&row.dominant_error)
      .bind(&row.error_dist)  // CTE'den gelen gerçek error distribution
      .bind(row.busiest)
      .bind(row.quietest)
      .bind(row.weekday_avg)
      .bind(row.weekend_avg)
      .bind(row.total_7d as i32)
      .bind(confidence)
      .execute(pool)
      .await?;

      Ok(())
  }

  /// SQLx row type for profile query
  /// NOT: Field isimleri CTE alias'larıyla birebir eşleşmeli
  #[derive(sqlx::FromRow)]
  struct ProfileRow {
      total_7d: i64,
      successful_7d: i64,
      failed_7d: i64,
      avg_lat: f64,
      p95_lat: f64,
      p99_lat: f64,
      lat_stddev: f64,
      total_24h: i64,
      successful_24h: i64,
      total_1h: i64,
      successful_1h: i64,
      avg_per_hour: f64,
      peak_per_hour: i32,
      hours_with_data: i32,
      busiest: Option<i32>,
      quietest: Option<i32>,
      weekday_avg: f64,
      weekend_avg: f64,
      dominant_error: Option<String>,
      error_dist: serde_json::Value,  // YENİ: error distribution JSON
  }

  /// Tüm endpoint profillerini güncelle (distributed lock ile)
  pub async fn update_all_profiles(pool: &PgPool) -> Result<u64, sqlx::Error> {
      // Sadece aktif endpoint'lerin profillerini güncelle
      let endpoints: Vec<(Uuid,)> = sqlx::query_as(
          "SELECT DISTINCT ehs.endpoint_id FROM endpoint_hourly_stats ehs
           JOIN endpoints e ON e.id = ehs.endpoint_id
           WHERE e.is_active = true"
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
□ Git commit: "feat(cortex): profile engine - single query, all columns, cascade delete"
```

### Adım 2.3 — Güncelleme Job'u + Distributed Lock
```
□ api/src/main.rs'de ekle:

  // Cortex: Profile güncelleme (her 15 dakika) + distributed lock
  let profile_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          // Config'den interval oku (default 15 dakika)
          let config = hooksniff_api::cortex::CortexConfig::load(&profile_pool).await;
          tokio::time::sleep(std::time::Duration::from_secs(
              (config.profile_update_interval_mins * 60) as u64
          )).await;

          // Distributed lock
          if !hooksniff_api::cortex::try_cortex_lock(&profile_pool, "cortex_profile", 600).await {
              tracing::debug!("⏭️ Cortex profile: another instance holds lock, skipping");
              continue;
          }

          match hooksniff_api::cortex::profile_engine::update_all_profiles(&profile_pool).await {
              Ok(n) => {
                  tracing::info!("📊 Cortex: Updated {} profiles", n);
              }
              Err(e) => tracing::error!("❌ Profile update failed: {:?}", e),
          }

          hooksniff_api::cortex::release_cortex_lock(&profile_pool, "cortex_profile").await;
      }
  });

□ Git commit: "feat(cortex): profile update job with distributed lock + config"
```

### Adım 2.4 — Test
```
□ endpoint_profiles'da veri var mı
□ success_rate_1h, success_rate_24h, success_rate_7d dolu mu
□ latency_stddev > 0 mü (çeşitli latency'ler varsa)
□ dominant_error_type dolu mu
□ error_distribution dolu mu (boş {} değil, gerçek değerler)
□ busiest_hour mantıklı mı (0-23 arası)
□ confidence > 0 mü
□ Endpoint silinince CASCADE ile profil de siliniyor mu
□ Deleted endpoint profilleri update_all_profiles'da atlanıyor mu (JOIN endpoints)
□ Git push
```

### AŞAMA 2 TAMAMLANDI □

---

## AŞAMA 3: Anomaly Scoring 🟡 ORTA

**Amaç:** Her olaya 0-100 anomali skoru ata. Yeni endpoint'ler için default eşik.
**Süre:** 1 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

### Adım 3.1 — Migration
```
□ Dosya oluştur: migrations/081_cortex_anomalies.sql

İçerik:

  CREATE TABLE IF NOT EXISTS anomaly_scores (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL,
      customer_id UUID NOT NULL,
      score INT NOT NULL,
      factors JSONB NOT NULL,
      category VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_anomaly_endpoint
      ON anomaly_scores(endpoint_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_anomaly_customer
      ON anomaly_scores(customer_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_anomaly_high
      ON anomaly_scores(score DESC) WHERE score > 70;

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 081 - anomaly scores with customer_id"
```

### Adım 3.2 — Anomaly Scorer Yaz (Configurable Ağırlıklar + Entegrasyon)
```
□ Dosya oluştur: api/src/cortex/anomaly_scorer.rs

İçerik (copy-paste):

  use serde::Serialize;
  use super::config::CortexConfig;

  #[derive(Debug, Serialize)]
  pub struct AnomalyResult {
      pub score: i32,
      pub factors: serde_json::Value,
      pub category: String,
  }

  /// Anomaly scorer. Tüm eşikler ve ağırlıklar CortexConfig'den okunur.
  pub fn score(
      latency_ms: i32,
      endpoint_p95: i32,
      endpoint_p99: i32,
      error_category: Option<&str>,
      dominant_error: Option<&str>,
      current_rate: f64,
      peak_rate: f64,
      attempt_number: i32,
      config: &CortexConfig,
  ) -> AnomalyResult {
      let mut score = 0i32;
      let mut factors = Vec::new();

      // Profil yoksa config'den default eşik kullan
      let p95 = if endpoint_p95 > 0 { endpoint_p95 } else { config.anomaly_default_p95_ms };
      let p99 = if endpoint_p99 > 0 { endpoint_p99 } else { config.anomaly_default_p99_ms };

      // Latency anomali (ağırlık: 30)
      if latency_ms > p99 * 2 {
          score += 30;
          factors.push(format!("latency_{}ms_vs_p99_{}ms", latency_ms, p99));
      } else if latency_ms > (p95 as f64 * 1.5) as i32 {
          score += 15;
          factors.push(format!("latency_{}ms_vs_p95_{}ms", latency_ms, p95));
      }

      // Error type değişikliği (ağırlık: 20)
      if let (Some(err), Some(dom)) = (error_category, dominant_error) {
          if err != dom && err != "none" {
              score += 20;
              factors.push(format!("error_{}_vs_dominant_{}", err, dom));
          }
      }

      // Trafik anomali (ağırlık: 25)
      if peak_rate > 0.0 && current_rate > peak_rate * 1.5 {
          score += 25;
          factors.push(format!("traffic_{}_vs_peak_{}", current_rate, peak_rate));
      }

      // Attempt anomali (ağırlık: 10)
      if attempt_number > 3 {
          score += 10;
          factors.push(format!("attempt_{}", attempt_number));
      }

      let category = if score >= config.anomaly_high_threshold { "critical" }
          else if score >= 40 { "warning" }
          else { "normal" }.to_string();

      AnomalyResult {
          score: score.min(100),
          factors: serde_json::json!({"details": factors}),
          category,
      }
  }

  /// Hourly stats'dan anomaly hesapla ve anomaly_scores tablosuna yaz.
  /// Her saatlik aggregation sonrası çağrılır.
  pub async fn score_and_persist(
      pool: &sqlx::PgPool,
      config: &CortexConfig,
  ) -> Result<u64, sqlx::Error> {
      // Son 1 saatteki hourly_stats'ları al + son 24 saat ortalamasıyla karşılaştır
      let stats: Vec<EndpointAnomalyInput> = sqlx::query_as(
          r#"
          WITH current_hour AS (
              SELECT
                  ehs.endpoint_id,
                  e.customer_id,
                  ehs.avg_latency_ms,
                  ehs.p95_latency_ms,
                  ehs.p99_latency_ms,
                  ehs.total_deliveries as current_total,
                  ehs.error_breakdown
              FROM endpoint_hourly_stats ehs
              JOIN endpoints e ON e.id = ehs.endpoint_id
              WHERE ehs.hour_start > NOW() - INTERVAL '1 hour'
                AND ehs.total_deliveries > 0
          ),
          baseline AS (
              SELECT
                  endpoint_id,
                  AVG(total_deliveries)::FLOAT as avg_hourly_rate,
                  MAX(total_deliveries)::INT as peak_hourly_rate
              FROM endpoint_hourly_stats
              WHERE hour_start > NOW() - INTERVAL '24 hours'
              GROUP BY endpoint_id
          )
          SELECT
              ch.endpoint_id,
              ch.customer_id,
              ch.avg_latency_ms,
              ch.p95_latency_ms,
              ch.p99_latency_ms,
              ch.current_total,
              COALESCE(bl.avg_hourly_rate, ch.current_total::FLOAT) as avg_rate,
              COALESCE(bl.peak_hourly_rate, ch.current_total) as peak_rate,
              ch.error_breakdown
          FROM current_hour ch
          LEFT JOIN baseline bl ON bl.endpoint_id = ch.endpoint_id
          "#
      )
      .fetch_all(pool)
      .await?;

      // Her endpoint için profili al
      let profiles: std::collections::HashMap<uuid::Uuid, (i32, i32, Option<String>)> =
          sqlx::query_as(
              "SELECT endpoint_id, latency_p95, latency_p99, dominant_error_type FROM endpoint_profiles"
          )
          .fetch_all(pool)
          .await?
          .into_iter()
          .map(|(eid, p95, p99, dom): (uuid::Uuid, i32, i32, Option<String>)| (eid, (p95, p99, dom)))
          .collect();

      let mut scored = 0u64;
      for row in stats {
          let (prof_p95, prof_p99, prof_dom) = profiles
              .get(&row.endpoint_id)
              .cloned()
              .unwrap_or((0, 0, None));

          // Trafik anomalisi: mevcut saat > 24s peak = anomali
          let current_rate = row.current_total as f64;
          let peak_rate = row.peak_rate as f64;

          let result = score(
              row.avg_latency_ms,
              prof_p95,
              prof_p99,
              None,
              prof_dom.as_deref(),
              current_rate,
              peak_rate,
              1,
              config,
          );

          if result.score > 0 {
              sqlx::query(
                  "INSERT INTO anomaly_scores (endpoint_id, customer_id, score, factors, category)
                   VALUES ($1, $2, $3, $4, $5)"
              )
              .bind(row.endpoint_id)
              .bind(row.customer_id)
              .bind(result.score)
              .bind(&result.factors)
              .bind(&result.category)
              .execute(pool)
              .await?;

              scored += 1;
          }
      }

      Ok(scored)
  }

  #[derive(sqlx::FromRow)]
  struct EndpointAnomalyInput {
      endpoint_id: uuid::Uuid,
      customer_id: uuid::Uuid,
      avg_latency_ms: i32,
      p95_latency_ms: i32,
      p99_latency_ms: i32,
      current_total: i32,
      avg_rate: f64,
      peak_rate: i32,
      error_breakdown: serde_json::Value,
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod anomaly_scorer;
□ cargo check
□ Git commit: "feat(cortex): anomaly scorer - score + persist from hourly_stats"
```

### Adım 3.3 — Alert Correlation + Root Cause Detection (YENİ)
```
□ Dosya oluştur: api/src/cortex/alert_correlation.rs

İçerik:

  use sqlx::PgPool;
  use uuid::Uuid;
  use chrono::{DateTime, Utc};
  use super::config::CortexConfig;

  #[derive(Debug)]
  pub struct AlertGroup {
      pub root_alert_id: Uuid,
      pub customer_id: Uuid,
      pub condition: String,
      pub alert_count: i32,
      pub first_alert_at: DateTime<Utc>,
      pub last_alert_at: DateTime<Utc>,
      pub affected_endpoint_ids: Vec<Uuid>,
      pub probable_cause: String,  // YENİ: kök neden tahmini
  }

  /// Alert correlation: Aynı zamanda tetiklenen alert'leri grupla + kök neden bul.
  ///
  /// Kök neden tespiti:
  /// - 3+ endpoint aynı anda fail → "infrastructure issue" (DB, network, provider)
  /// - 1 endpoint + high latency → "endpoint degradation"
  /// - 1 endpoint + consecutive failures → "endpoint down"
  /// - Farklı customer'lar + aynı condition → "platform-wide issue"
  pub async fn correlate_alerts(
      pool: &PgPool,
      config: &CortexConfig,
  ) -> Result<Vec<AlertGroup>, sqlx::Error> {
      let window_start = Utc::now() - chrono::Duration::minutes(config.alert_correlation_window_mins);

      let alerts: Vec<(Uuid, Uuid, String, f64, i32, DateTime<Utc>)> = sqlx::query_as(
          r#"
          SELECT ah.alert_rule_id, ah.customer_id, ah.condition,
                 ah.actual_value, ah.threshold, ah.created_at
          FROM alert_history ah
          WHERE ah.created_at > $1
          ORDER BY ah.created_at DESC
          "#
      )
      .bind(window_start)
      .fetch_all(pool).await?;

      if alerts.len() < config.alert_correlation_min_count as usize {
          return Ok(vec![]);
      }

      // Zaman bazlı gruplama
      let mut groups: Vec<AlertGroup> = Vec::new();
      let mut used = vec![false; alerts.len()];

      for i in 0..alerts.len() {
          if used[i] { continue; }

          let mut group = AlertGroup {
              root_alert_id: alerts[i].0,
              customer_id: alerts[i].1,
              condition: alerts[i].2.clone(),
              alert_count: 1,
              first_alert_at: alerts[i].5,
              last_alert_at: alerts[i].5,
              affected_endpoint_ids: vec![],
              probable_cause: String::new(),
          };
          used[i] = true;

          for j in (i+1)..alerts.len() {
              if used[j] { continue; }
              let time_diff = (alerts[i].5 - alerts[j].5).num_minutes().abs();
              if time_diff <= config.alert_correlation_window_mins && alerts[j].1 == alerts[i].1 {
                  group.alert_count += 1;
                  group.last_alert_at = alerts[j].5.max(group.last_alert_at);
                  group.first_alert_at = alerts[j].5.min(group.first_alert_at);
                  used[j] = true;
              }
          }

          if group.alert_count >= config.alert_correlation_min_count {
              // Kök neden tespiti
              group.probable_cause = detect_root_cause(pool, &group, config).await;
              groups.push(group);
          }
      }

      Ok(groups)
  }

  /// Kök neden tespiti: alert grubuna bakarak en olası nedeni belirle
  async fn detect_root_cause(pool: &PgPool, group: &AlertGroup, config: &CortexConfig) -> String {
      // Son 1 saatte kaç endpoint fail etti?
      let failing_count: (i64,) = sqlx::query_as(
          "SELECT COUNT(DISTINCT endpoint_id) FROM endpoint_hourly_stats
           WHERE hour_start > NOW() - INTERVAL '1 hour'
             AND failed > 0 AND successful = 0"
      )
      .fetch_one(pool)
      .await
      .unwrap_or((0,));

      // Toplam aktif endpoint sayısı
      let total: (i64,) = sqlx::query_as(
          "SELECT COUNT(*) FROM endpoints WHERE is_active = true"
      )
      .fetch_one(pool)
      .await
      .unwrap_or((0,));

      // Oran bazlı cascade tespiti (config'den)
      if total.0 > 0 {
          let fail_pct = (failing_count.0 as f64 / total.0 as f64) * 100.0;
          if fail_pct >= config.cascade_threshold_pct {
              return "infrastructure_issue".to_string();
          }
      }

      match group.condition.as_str() {
          "failure_rate" if group.alert_count >= 5 => "cascading_failure".to_string(),
          "latency" if group.alert_count >= 3 => "service_degradation".to_string(),
          "consecutive_failures" => "endpoint_down".to_string(),
          _ => "unknown".to_string(),
      }
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod alert_correlation;
□ cargo check
□ Git commit: "feat(cortex): alert correlation with root cause detection"
```

### Adım 3.4 — Alert Correlation Job + Anomaly Persistence Job
```
□ api/src/jobs/alert_eval.rs'de, run_alert_evaluation() fonksiyonunun SONUNA ekle:

  // Cortex: Alert correlation — gruplanmış alert'leri bildir
  let cortex_config = hooksniff_api::cortex::CortexConfig::load(pool).await;
  let correlated = hooksniff_api::cortex::alert_correlation::correlate_alerts(pool, &cortex_config)
      .await.unwrap_or_default();
  for group in &correlated {
      if group.alert_count >= cortex_config.alert_correlation_min_count {
          // In-app notification
          let _ = sqlx::query(
              "INSERT INTO notifications (customer_id, type, title, message, is_read)
               VALUES ($1, 'alert_correlation', $2, $3, false)"
          )
          .bind(group.customer_id)
          .bind(format!("🔗 {} related alerts grouped", group.alert_count))
          .bind(format!(
              "Cause: {} | Condition: {} | {} alerts between {} and {}",
              group.probable_cause,
              group.condition,
              group.alert_count,
              group.first_alert_at.format("%H:%M"),
              group.last_alert_at.format("%H:%M")
          ))
          .execute(pool).await;

          // Prometheus metric
          // CORTEX_METRICS.alerts_correlated.fetch_add(1, Ordering::Relaxed);
      }
  }

□ api/src/main.rs'de, saatlik aggregation SONRASINI ekle:

  // Cortex: Anomaly scoring (saatlik aggregation sonrası)
  let anomaly_pool = cortex_pool.clone();
  tokio::spawn(async move {
      loop {
          // Her saat 00:05'te çalış (aggregation 00:01'de biter)
          let now = chrono::Utc::now();
          let next_hour = (now + chrono::Duration::hours(1))
              .with_minute(5).unwrap().with_second(0).unwrap();
          let wait = (next_hour - now).num_milliseconds().max(0) as u64;
          tokio::time::sleep(std::time::Duration::from_millis(wait)).await;

          let config = hooksniff_api::cortex::CortexConfig::load(&anomaly_pool).await;
          match hooksniff_api::cortex::anomaly_scorer::score_and_persist(&anomaly_pool, &config).await {
              Ok(n) => tracing::info!("📊 Cortex: Scored {} anomalies", n),
              Err(e) => tracing::error!("❌ Anomaly scoring failed: {:?}", e),
          }
      }
  });

□ Git commit: "feat(cortex): anomaly persistence job + alert correlation with config"
```

### Adım 3.5 — Test
```
□ anomaly_scores'da veri var mı
□ customer_id dolu mu
□ Yüksek skorlu anomali var mı (score > 70)
□ Default eşik çalışıyor mu (yeni endpoint — profil yokken)
□ Alert correlation gruplama doğru mu (config window kullanıyor mu)
□ Root cause detection oran bazlı mı (cascade_threshold_pct)
□ Farklı customer'lar ayrı gruplanıyor mu
□ Git push
```

### AŞAMA 3 TAMAMLANDI □

---

## AŞAMA 4: Self-Healing Engine 🔴 YÜKSEK

**Amaç:** Sorun tespit edilince otomatik aksiyon al. 14 gün %0 success → auto-disable.
**Süre:** 2 oturum | **Risk:** ORTA | **Bağımlılık:** Aşama 1 + 2 + 3

### Adım 4.1 — Migration
```
□ Dosya oluştur: migrations/082_cortex_healing.sql

İçerik:

  CREATE TABLE IF NOT EXISTS healing_actions (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      action_type VARCHAR(30) NOT NULL,
      trigger_reason TEXT NOT NULL,
      previous_state JSONB,
      new_state JSONB,
      auto_reversible BOOLEAN DEFAULT true,
      reversed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_healing_endpoint
      ON healing_actions(endpoint_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_healing_customer
      ON healing_actions(customer_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS recovery_tests (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
      test_url VARCHAR(2048) NOT NULL,
      result_status INT,
      result_latency_ms INT,
      success BOOLEAN,
      tested_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_recovery_endpoint
      ON recovery_tests(endpoint_id, tested_at DESC);

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 082 - healing + recovery with customer_id + indexes"
```

### Adım 4.2 — Healing Engine Yaz (14 Gün Auto-Disable + Oran Bazlı Cascade)
```
□ Dosya oluştur: api/src/cortex/healing_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;
  use super::config::CortexConfig;

  /// N gün üst üste %0 success → endpoint'i disable et
  ///
  /// KRİTİK: "üst üste" kontrolü — tek bir başarılı saat bile olsa disable etmez.
  /// Son N günün TAMAMINDA (saatlik) 0 success olmalı.
  pub async fn check_auto_disable(
      pool: &PgPool,
      config: &CortexConfig,
  ) -> Result<Vec<AutoDisableResult>, sqlx::Error> {
      let days = format!("{} days", config.auto_disable_days);

      // Son N günde TEK BİLE başarılı delivery'si olan endpoint'leri bul
      // Bunları HARİÇ tut — sadece tamamen başarısız olanları disable et
      let endpoints: Vec<(Uuid,)> = sqlx::query_as(
          r#"
          SELECT ehs.endpoint_id
          FROM endpoint_hourly_stats ehs
          JOIN endpoints e ON e.id = ehs.endpoint_id
          WHERE ehs.hour_start > NOW() - $1::interval
            AND e.is_active = true
            AND ehs.total_deliveries > 10
          GROUP BY ehs.endpoint_id
          HAVING SUM(ehs.successful) = 0
             AND SUM(ehs.failed) > 0
          "#
      )
      .bind(&days)
      .fetch_all(pool).await?;

      let mut results = Vec::new();
      for (eid,) in endpoints {
          // Endpoint'in customer_id'sini al
          let customer_id: Option<(Uuid,)> = sqlx::query_as(
              "SELECT customer_id FROM endpoints WHERE id = $1"
          )
          .bind(eid).fetch_optional(pool).await?;

          let cid = customer_id.map(|c| c.0).unwrap_or(eid);

          sqlx::query("UPDATE endpoints SET is_active = false WHERE id = $1 AND is_active = true")
              .bind(eid).execute(pool).await?;
          sqlx::query(
              "INSERT INTO healing_actions (endpoint_id, customer_id, action_type, trigger_reason)
               VALUES ($1, $2, 'auto_disable', $3)"
          )
          .bind(eid)
          .bind(cid)
          .bind(format!("{} gün üst üste %0 success", config.auto_disable_days))
          .execute(pool).await?;

          // Müşteriye bildirim gönder
          let _ = sqlx::query(
              "INSERT INTO notifications (customer_id, type, title, message, is_read)
               VALUES ($1, 'healing', '🔒 Endpoint Auto-Disabled', $2, false)"
          )
          .bind(cid)
          .bind(format!(
              "Endpoint has been disabled after {} days with 0% success rate. \
               Check your server and re-enable when ready.",
              config.auto_disable_days
          ))
          .execute(pool).await?;

          results.push(AutoDisableResult { endpoint_id: eid, customer_id: cid });
      }
      Ok(results)
  }

  pub struct AutoDisableResult {
      pub endpoint_id: Uuid,
      pub customer_id: Uuid,
  }

  /// Cascade prevention: Aktif endpoint'lerin %X'i aynı anda fail
  pub async fn check_cascade(
      pool: &PgPool,
      config: &CortexConfig,
  ) -> Result<Option<CascadeAlert>, sqlx::Error> {
      let failing: (i64,) = sqlx::query_as(
          "SELECT COUNT(DISTINCT endpoint_id) FROM endpoint_hourly_stats
           WHERE hour_start > NOW() - INTERVAL '1 hour'
             AND failed > 0 AND successful = 0"
      )
      .fetch_one(pool).await?;

      let total: (i64,) = sqlx::query_as(
          "SELECT COUNT(*) FROM endpoints WHERE is_active = true"
      )
      .fetch_one(pool).await?;

      if total.0 == 0 {
          return Ok(None);
      }

      let fail_pct = (failing.0 as f64 / total.0 as f64) * 100.0;

      if fail_pct >= config.cascade_threshold_pct {
          Ok(Some(CascadeAlert {
              failing_count: failing.0,
              total_count: total.0,
              fail_percentage: fail_pct,
          }))
      } else {
          Ok(None)
      }
  }

  pub struct CascadeAlert {
      pub failing_count: i64,
      pub total_count: i64,
      pub fail_percentage: f64,
  }

  /// Recovery test: Endpoint tekrar çalışıyor mu?
  /// HEAD method + configurable timeout
  pub async fn test_endpoint(
      pool: &PgPool,
      endpoint_id: Uuid,
      url: &str,
      timeout_secs: u64,
  ) -> Result<bool, sqlx::Error> {
      let client = reqwest::Client::builder()
          .timeout(std::time::Duration::from_secs(timeout_secs))
          .build()
          .unwrap_or_default();

      let start = std::time::Instant::now();
      let result = client.head(url).send().await;
      let latency = start.elapsed().as_millis() as i32;

      let (status, success) = match result {
          Ok(resp) => {
              let s = resp.status().as_u16() as i32;
              let alive = (200..500).contains(&s) || s == 405;
              (s, alive)
          }
          Err(_) => (0, false),
      };

      sqlx::query(
          "INSERT INTO recovery_tests (endpoint_id, test_url, result_status, result_latency_ms, success)
           VALUES ($1, $2, $3, $4, $5)"
      )
      .bind(endpoint_id).bind(url).bind(status).bind(latency).bind(success)
      .execute(pool).await?;

      if success {
          sqlx::query("UPDATE endpoints SET is_active = true WHERE id = $1 AND is_active = false")
              .bind(endpoint_id).execute(pool).await?;
          sqlx::query(
              "INSERT INTO healing_actions (endpoint_id, customer_id, action_type, trigger_reason)
               VALUES ($1, (SELECT customer_id FROM endpoints WHERE id = $1), 'auto_recover', 'Recovery test succeeded')"
          )
          .bind(endpoint_id).execute(pool).await?;
      }

      Ok(success)
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod healing_engine;
□ cargo check
□ Git commit: "feat(cortex): healing engine - consecutive check, customer_id, cascade fix"
```

### Adım 4.3 — Adaptive Circuit Breaker (Worker'da)
```
⚠️ DİKKAT: Circuit breaker ASIL worker'da (worker/src/circuit_breaker.rs).
   API'deki circuit_breaker.rs farklı bir amaçla kullanılıyor.
   Worker'ın circuit breaker'ını Redis ile persist ediyor.

□ worker/src/circuit_breaker.rs'de, config'e adaptive_threshold seçeneği ekle:

  // Mevcut config:
  // pub failure_threshold: u32,

  // Yeni: Profile-based adaptive threshold
  // worker/src/main.rs'de, CIRCUIT_BREAKER_FAILURE_THRESHOLD yerine:
  // endpoint_profiles'dan sample_size > 100 ise threshold=3, değilse 5

□ NOT: Bu değişiklik worker restart gerektirir. Basit başla, sonra geliştir.
□ Git commit: "feat(cortex): adaptive circuit breaker note for worker"
```

### Adım 4.4 — Healing Job + Recovery Test Job (API Process)
```
□ api/src/main.rs'de ekle:

  // Cortex: Auto-disable + cascade prevention (her saat) + distributed lock
  let healing_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          tokio::time::sleep(std::time::Duration::from_secs(3600)).await;

          if !hooksniff_api::cortex::try_cortex_lock(&healing_pool, "cortex_healing", 600).await {
              tracing::debug!("⏭️ Cortex healing: another instance holds lock, skipping");
              continue;
          }

          let config = hooksniff_api::cortex::CortexConfig::load(&healing_pool).await;

          // Auto-disable check
          match hooksniff_api::cortex::healing_engine::check_auto_disable(&healing_pool, &config).await {
              Ok(disabled) => {
                  for r in &disabled {
                      tracing::warn!("🔒 Auto-disabled endpoint {} ({}d 0% success)",
                          r.endpoint_id, config.auto_disable_days);
                  }
              }
              Err(e) => tracing::error!("❌ Auto-disable check failed: {:?}", e),
          }

          // Cascade prevention check
          match hooksniff_api::cortex::healing_engine::check_cascade(&healing_pool, &config).await {
              Ok(Some(alert)) => {
                  tracing::error!("🚨 CASCADE DETECTED: {}/{} endpoints failing ({:.0}%)",
                      alert.failing_count, alert.total_count, alert.fail_percentage);

                  let affected_customers: Vec<(uuid::Uuid,)> = sqlx::query_as(
                      "SELECT DISTINCT e.customer_id FROM endpoints e
                       JOIN endpoint_hourly_stats eh ON eh.endpoint_id = e.id
                       WHERE eh.hour_start > NOW() - INTERVAL '1 hour'
                         AND eh.failed > 0 AND eh.successful = 0"
                  )
                  .fetch_all(&healing_pool).await.unwrap_or_default();

                  for (customer_id,) in affected_customers {
                      let _ = sqlx::query(
                          "INSERT INTO notifications (customer_id, type, title, message, is_read)
                           VALUES ($1, 'cascade', '🚨 Cascade Failure Detected', $2, false)"
                      )
                      .bind(customer_id)
                      .bind(format!(
                          "{} of {} endpoints are failing simultaneously.",
                          alert.failing_count, alert.total_count
                      ))
                      .execute(&healing_pool).await;
                  }
              }
              Ok(None) => {}
              Err(e) => tracing::error!("❌ Cascade check failed: {:?}", e),
          }

          hooksniff_api::cortex::release_cortex_lock(&healing_pool, "cortex_healing").await;
      }
  });

  // Cortex: Recovery test — auto-disabled endpoint'leri periyodik test et (her 6 saat)
  let recovery_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          tokio::time::sleep(std::time::Duration::from_secs(6 * 3600)).await;

          // Distributed lock (recovery test uzun sürebilir, 30dk TTL)
          if !hooksniff_api::cortex::try_cortex_lock(&recovery_pool, "cortex_surge", 1800).await {
              tracing::debug!("⏭️ Cortex recovery: another instance holds lock, skipping");
              continue;
          }

          // Son 14 gün içinde auto-disable edilen endpoint'leri bul
          let disabled: Vec<(uuid::Uuid, String)> = sqlx::query_as(
              "SELECT e.id, e.url FROM endpoints e
               WHERE e.is_active = false
                 AND EXISTS (
                     SELECT 1 FROM healing_actions ha
                     WHERE ha.endpoint_id = e.id
                       AND ha.action_type = 'auto_disable'
                       AND ha.created_at > NOW() - INTERVAL '14 days'
                 )
               LIMIT 50"
          )
          .fetch_all(&recovery_pool).await.unwrap_or_default();

          for (endpoint_id, url) in disabled {
              match hooksniff_api::cortex::healing_engine::test_endpoint(
                  &recovery_pool, endpoint_id, &url, 5,
              ).await {
                  Ok(true) => {
                      tracing::info!("✅ Recovery test passed for endpoint {}", endpoint_id);
                  }
                  Ok(false) => {
                      tracing::debug!("❌ Recovery test failed for endpoint {}", endpoint_id);
                  }
                  Err(e) => {
                      tracing::error!("❌ Recovery test error for {}: {:?}", endpoint_id, e);
                  }
              }
          }

          hooksniff_api::cortex::release_cortex_lock(&recovery_pool, "cortex_surge").await;
      }
  });

□ Git commit: "feat(cortex): healing job + recovery test job for auto-disabled endpoints"
```

### Adım 4.5 — Test
```
□ Auto-disable: 14 gün 0% success → endpoint disable + notification gönderildi mi
□ Auto-disable: 14 gün içinde TEK BİLE success varsa disable ETMİYOR mu
□ Cascade: %20+ endpoint fail → cascade alert + sadece ilgili customer'lara bildirim
□ Recovery test: HEAD method çalışıyor mu (405 = alive)
□ Recovery test: timeout configurable mı
□ Recovery test job: auto-disabled endpoint'ler 6 saatte bir test ediliyor mu
□ Recovery test job: endpoint tekrar çalışıyorsa auto-recover + notification
□ healing_actions'da customer_id dolu mu
□ Endpoint silinince CASCADE ile healing_actions/recovery_tests de siliniyor mu
□ Git push
```

### AŞAMA 4 TAMAMLANDI □

---

## AŞAMA 5: Action Memory + Adaptive Learning 🔴 YÜKSEK

**Amaç:** Her self-healing aksiyonunun sonucunu kaydet, başarı oranlarını öğren, 
her endpoint için en iyi stratejiyi otomatik seç (Multi-Armed Bandit).
**Süre:** 2-3 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 4

> **Neden Bu Aşama Önemli?**
> Aşama 4'te aksiyon alıyoruz (auto-disable, recovery test vb.) ama sonucundan 
> ders çıkarmıyoruz. Bu aşamayla sistem KENDİNİ ÖĞRENİR:
> - "Bu endpoint'te auto-disable %80 işe yarıyor → devam et"
> - "Bu endpoint'te retry yavaşlatma daha etkili → strateji değiştir"
> - "Gece yapılan aksiyonlar %95 başarılı → gece daha agresif ol"

### Adım 5.1 — Action History Tablosu (Migration)
```
□ Dosya oluştur: migrations/088_cortex_action_history.sql

İçerik:

  -- Cortex: Action history — her aksiyonun kaydı ve sonucu
  -- Sistem bundan öğrenir: hangi aksiyon hangi endpoint'te işe yarıyor
  CREATE TABLE IF NOT EXISTS cortex_action_history (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      action_type VARCHAR(50) NOT NULL,
          -- auto_disable, recovery_test, retry_slow, circuit_open,
          -- notify_aggressive, cascade_prevent, surge_throttle
      reason VARCHAR(100) NOT NULL,
          -- anomaly_high, cascade_detected, failure_threshold, recovery_surge
      anomaly_score INT,
      context JSONB DEFAULT '{}',
          -- Saat, trafik, error tipi, mevcut strateji vb.
      outcome VARCHAR(30) DEFAULT 'pending',
          -- success, failure, partial, customer_intervened, timeout
      outcome_details TEXT,
          -- Ne oldu? Müşteri müdahale etti mi? Ne kadar sürdü?
      time_to_resolution_secs INT,
          -- Aksiyon alındıktan sonra sorun ne kadar sürede düzeldi?
      endpoint_success_rate_before FLOAT,
          -- Aksiyon öncesi success rate
      endpoint_success_rate_after FLOAT,
          -- Aksiyon sonrası success rate (1 saat sonra ölçülür)
      strategy_snapshot JSONB DEFAULT '{}',
          -- Aksiyon anındaki strateji ayarları (snapshot)
      created_at TIMESTAMPTZ DEFAULT now(),
      resolved_at TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS idx_action_history_endpoint
      ON cortex_action_history(endpoint_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_action_history_customer
      ON cortex_action_history(customer_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_action_history_failures
      ON cortex_action_history(endpoint_id, action_type, outcome)
      WHERE outcome IN ('failure', 'partial', 'customer_intervened');
  CREATE INDEX IF NOT EXISTS idx_action_history_pending
      ON cortex_action_history(endpoint_id, created_at DESC)
      WHERE outcome = 'pending';
  CREATE INDEX IF NOT EXISTS idx_action_history_type_outcome
      ON cortex_action_history(action_type, outcome, created_at DESC);

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 088 - action history for adaptive learning"
```

### Adım 5.2 — Action Memory Modülü (api/src/cortex/action_memory.rs)
```
□ Dosya oluştur: api/src/cortex/action_memory.rs

İçerik:

  use sqlx::PgPool;
  use uuid::Uuid;
  use serde::{Deserialize, Serialize};

  #[derive(Debug, Serialize, Deserialize)]
  pub struct ActionRecord {
      pub endpoint_id: Uuid,
      pub customer_id: Uuid,
      pub action_type: String,
      pub reason: String,
      pub anomaly_score: Option<i32>,
      pub context: serde_json::Value,
  }

  #[derive(Debug, Serialize, Deserialize)]
  pub struct ActionOutcome {
      pub outcome: String,
      pub outcome_details: Option<String>,
      pub time_to_resolution_secs: Option<i32>,
      pub success_rate_before: Option<f64>,
      pub success_rate_after: Option<f64>,
  }

  /// Aksiyonu kaydet (self-healing aksiyon alırken çağrılır)
  pub async fn record_action(pool: &PgPool, record: &ActionRecord) -> Result<i64, sqlx::Error> {
      let row: (i64,) = sqlx::query_as(
          r#"INSERT INTO cortex_action_history
              (endpoint_id, customer_id, action_type, reason, anomaly_score, context)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"#
      )
      .bind(record.endpoint_id).bind(record.customer_id)
      .bind(&record.action_type).bind(&record.reason)
      .bind(record.anomaly_score).bind(&record.context)
      .fetch_one(pool).await?;
      Ok(row.0)
  }

  /// Aksiyon sonucunu güncelle
  pub async fn resolve_action(pool: &PgPool, action_id: i64, outcome: &ActionOutcome) -> Result<(), sqlx::Error> {
      sqlx::query(
          r#"UPDATE cortex_action_history SET
              outcome = $2, outcome_details = $3, time_to_resolution_secs = $4,
              endpoint_success_rate_before = $5, endpoint_success_rate_after = $6,
              resolved_at = NOW()
          WHERE id = $1"#
      )
      .bind(action_id).bind(&outcome.outcome).bind(&outcome.outcome_details)
      .bind(outcome.time_to_resolution_secs)
      .bind(outcome.success_rate_before).bind(outcome.success_rate_after)
      .execute(pool).await?;
      Ok(())
  }

  /// Endpoint için en iyi aksiyonu bul (UCB1 Multi-Armed Bandit)
  pub async fn get_best_action_for_endpoint(pool: &PgPool, endpoint_id: Uuid) -> Result<Option<String>, sqlx::Error> {
      let best: Option<(String,)> = sqlx::query_as(
          r#"SELECT action_type FROM cortex_action_history
          WHERE endpoint_id = $1 AND created_at > NOW() - INTERVAL '30 days'
            AND outcome != 'pending'
          GROUP BY action_type
          HAVING COUNT(*) >= 3
          ORDER BY
              (SUM(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END) / COUNT(*))
              + SQRT(2.0 * LN((SELECT COUNT(*) FROM cortex_action_history
                  WHERE endpoint_id = $1 AND outcome != 'pending'
                  AND created_at > NOW() - INTERVAL '30 days')) / COUNT(*))
              DESC
          LIMIT 1"#
      )
      .bind(endpoint_id).fetch_optional(pool).await?;
      Ok(best.map(|(t,)| t))
  }

  /// Pending aksiyonları timeout yap (1 saat)
  pub async fn resolve_stale_actions(pool: &PgPool) -> Result<u64, sqlx::Error> {
      let result = sqlx::query(
          r#"UPDATE cortex_action_history SET
              outcome = 'timeout',
              outcome_details = 'Auto-resolved: no outcome reported within 1 hour',
              resolved_at = NOW()
          WHERE outcome = 'pending' AND created_at < NOW() - INTERVAL '1 hour'"#
      ).execute(pool).await?;
      Ok(result.rows_affected())
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod action_memory;
□ cargo check
□ Git commit: "feat(cortex): action memory - record, resolve, UCB1 bandit"
```

### Adım 5.3 — Self-Healing Entegrasyonu
```
□ api/src/cortex/healing_engine.rs'de güncelle:

  // Her aksiyon ALINDIĞINDA kaydet:
  let action_id = crate::cortex::action_memory::record_action(&pool, &ActionRecord {
      endpoint_id, customer_id,
      action_type: "auto_disable".to_string(),
      reason: "failure_threshold".to_string(),
      anomaly_score: Some(score),
      context: serde_json::json!({"hour": chrono::Utc::now().hour()}),
  }).await.ok();

  // Sonuç BELİRLENDİĞİNDE güncelle:
  if let Some(aid) = action_id {
      crate::cortex::action_memory::resolve_action(&pool, aid, &ActionOutcome {
          outcome: if test_passed { "success" } else { "failure" }.to_string(),
          outcome_details: Some(format!("Recovery test: {}", if test_passed { "passed" } else { "failed" })),
          time_to_resolution_secs: Some(elapsed_secs),
          success_rate_before: Some(success_rate_before),
          success_rate_after: Some(success_rate_after),
      }).await.ok();
  }

  // Karar verirken EN İYİ AKSİYONU SOR:
  let best = crate::cortex::action_memory::get_best_action_for_endpoint(&pool, endpoint_id)
      .await.unwrap_or(None);
  // best Some("retry_slow") → retry yavaşlat
  // best Some("notify_aggressive") → agresif bildirim
  // best None → default strateji (auto_disable)

□ cargo check
□ Git commit: "feat(cortex): integrate action memory with self-healing (adaptive strategy)"
```

### Adım 5.4 — Adaptive Threshold Job'u (Her Saat)
```
□ api/src/main.rs'de ekle:

  // Cortex: Adaptive threshold güncelleme (her saat)
  let adaptive_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          tokio::time::sleep(std::time::Duration::from_secs(3600)).await;
          if !hooksniff_api::cortex::try_cortex_lock(&adaptive_pool, "cortex_adaptive", 300).await {
              continue;
          }
          // Her endpoint için en başarılı aksiyonu bul ve platform_settings'a yaz
          let endpoints: Vec<(Uuid,)> = sqlx::query_as(
              "SELECT DISTINCT endpoint_id FROM cortex_action_history
               WHERE created_at > NOW() - INTERVAL '7 days' AND outcome != 'pending'
               GROUP BY endpoint_id HAVING COUNT(*) >= 5"
          ).fetch_all(&adaptive_pool).await.unwrap_or_default();

          for (eid,) in endpoints {
              if let Ok(Some(best)) = hooksniff_api::cortex::action_memory::
                  get_best_action_for_endpoint(&adaptive_pool, eid).await
              {
                  let _ = sqlx::query(
                      r#"INSERT INTO platform_settings (key, value)
                      VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value"#
                  )
                  .bind(format!("adaptive_strategy:{}", eid))
                  .bind(serde_json::json!({"preferred_action": best, "updated_at": chrono::Utc::now()}))
                  .execute(&adaptive_pool).await;
              }
          }
          hooksniff_api::cortex::release_cortex_lock(&adaptive_pool, "cortex_adaptive").await;
      }
  });

□ Git commit: "feat(cortex): adaptive threshold job - per-endpoint strategy optimization"
```

### Adım 5.5 — Pending Aksiyon Çözümleme Job'u (Her 15 dk)
```
□ api/src/main.rs'de ekle:

  let stale_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          tokio::time::sleep(std::time::Duration::from_secs(900)).await;
          match hooksniff_api::cortex::action_memory::resolve_stale_actions(&stale_pool).await {
              Ok(n) if n > 0 => tracing::info!("⏰ Resolved {} stale actions", n),
              _ => {}
          }
      }
  });

□ Git commit: "feat(cortex): stale action resolver job"
```

### Adım 5.6 — Retention
```
□ api/src/jobs/retention.rs'de ekle:

  let r = sqlx::query("DELETE FROM cortex_action_history WHERE created_at < NOW() - INTERVAL '90 days'")
      .execute(pool).await?;
  if r.rows_affected() > 0 {
      tracing::info!("🧹 Cleaned {} old action_history records", r.rows_affected());
  }

□ Git commit: "feat(cortex): retention for action_history (90 days)"
```

### Adım 5.7 — API Endpoint'leri
```
□ api/src/routes/cortex.rs'ye ekle:

  .route("/actions", get(get_action_history))
  .route("/actions/stats", get(get_action_stats))
  .route("/actions/best/:endpoint_id", get(get_best_action))

□ Git commit: "feat(cortex): action memory API endpoints"
```

### Adım 5.8 — Dashboard Entegrasyonu
```
□ cortex/page.tsx'de "Healing" sekmesine ekle:

  - Son 20 aksiyon tablosu (tip, endpoint, sonuç, süre)
  - Aksiyon başarı oranları pie chart
  - "En iyi strateji" kartı
  - Pending aksiyon sayısı

□ Git commit: "feat(cortex): action memory dashboard widgets"
```

### Adım 5.9 — Test
```
□ Self-healing aksiyonu al → cortex_action_history'de kayıt var mı
□ Aksiyon sonucu güncelle → outcome ve resolved_at dolu mu
□ get_best_action_for_endpoint() → UCB1 formülü çalışıyor mu
□ 3 deneme sonrası en iyi aksiyonu doğru seçiyor mu
□ Adaptive threshold job → platform_settings'a yazıyor mu
□ Pending aksiyon 1 saat sonra timeout oluyor mu
□ API endpoint'leri doğru veri döndürüyor mu
□ Git push
```

### AŞAMA 5 TAMAMLANDI □

---

## AŞAMA 6: Recovery Surge 🔴 YÜKSEK (YENİ)

**Amaç:** Kesinti SONRASI spike trafiğini kontrollü gönder. (Hookdeck modeli)
**Süre:** 1-2 oturum | **Risk:** ORTA | **Bağımlılık:** Aşama 4

### Adım 5.1 — Recovery Surge State Tablosu
```
□ Dosya oluştur: migrations/086_cortex_recovery_surge.sql

İçerik:

  CREATE TABLE IF NOT EXISTS recovery_surge_state (
      endpoint_id UUID PRIMARY KEY REFERENCES endpoints(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      is_recovering BOOLEAN DEFAULT false,
      recovery_started_at TIMESTAMPTZ,
      current_rate_per_sec FLOAT DEFAULT 0.0,
      target_rate_per_sec FLOAT DEFAULT 100.0,
      ramp_up_step FLOAT DEFAULT 10.0,
      last_step_at TIMESTAMPTZ,
      queued_count INT DEFAULT 0,
      processed_count INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
  );

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 086 - recovery surge state"
```

### Adım 5.2 — Recovery Surge Engine Yaz
```
□ Dosya oluştur: api/src/cortex/recovery_surge.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;

  /// Recovery surge: Endpoint down'dan çıktıktan sonra trafiği kademeli artır.
  ///
  /// Nasıl çalışır:
  /// 1. Endpoint down (5+ consecutive failure) → surge state oluştur
  /// 2. Endpoint tekrar healthy → recovery moduna geç
  /// 3. Rate yavaşça artır: 10/sn → 20/sn → 50/sn → 100/sn
  /// 4. Her adımda success rate kontrol et (%95+ ise devam)
  /// 5. Hedef hıza ulaşınca recovery modunu kapat

  // NOT: Bu değerler CortexConfig'den okunur. Sabit değerler sadece referans.
  // RAMP_STEPS → config.recovery_ramp_steps
  // STEP_INTERVAL_SECS → config.recovery_step_interval_secs
  // MIN_SUCCESS_RATE → config.recovery_min_success_rate

  /// Endpoint recovery moduna girdi mi?
  pub async fn is_recovering(pool: &PgPool, endpoint_id: Uuid) -> Result<bool, sqlx::Error> {
      let state: Option<(bool,)> = sqlx::query_as(
          "SELECT is_recovering FROM recovery_surge_state WHERE endpoint_id = $1"
      )
      .bind(endpoint_id)
      .fetch_optional(pool)
      .await?;

      Ok(state.map(|s| s.0).unwrap_or(false))
  }

  /// Mevcut rate limit (recovery modunda ise)
  pub async fn get_current_rate(pool: &PgPool, endpoint_id: Uuid) -> Result<Option<f64>, sqlx::Error> {
      let state: Option<(bool, f64)> = sqlx::query_as(
          "SELECT is_recovering, current_rate_per_sec FROM recovery_surge_state WHERE endpoint_id = $1"
      )
      .bind(endpoint_id)
      .fetch_optional(pool)
      .await?;

      match state {
          Some((true, rate)) => Ok(Some(rate)),
          _ => Ok(None),
      }
  }

  /// Endpoint down'dan çıktığında recovery başlat
  pub async fn start_recovery(pool: &PgPool, endpoint_id: Uuid) -> Result<(), sqlx::Error> {
      sqlx::query(
          r#"
          INSERT INTO recovery_surge_state (endpoint_id, customer_id, is_recovering, recovery_started_at,
              current_rate_per_sec, target_rate_per_sec, ramp_up_step, last_step_at)
          VALUES ($1, (SELECT customer_id FROM endpoints WHERE id = $1), true, NOW(), 10.0, 200.0, 10.0, NOW())
          ON CONFLICT (endpoint_id) DO UPDATE SET
              is_recovering = true,
              recovery_started_at = NOW(),
              current_rate_per_sec = 10.0,
              ramp_up_step = 10.0,
              last_step_at = NOW(),
              updated_at = NOW()
          "#
      )
      .bind(endpoint_id)
      .execute(pool)
      .await?;

      tracing::info!("🔄 Recovery surge started for endpoint {} (rate: 10/s)", endpoint_id);
      Ok(())
  }

  /// Recovery rate'ini güncelle (her dakika çağrılır)
  pub async fn tick_recovery(pool: &PgPool, config: &super::config::CortexConfig) -> Result<Vec<Uuid>, sqlx::Error> {
      // Recovery modundaki endpoint'leri al
      let endpoints: Vec<(Uuid, f64, f64, chrono::DateTime<chrono::Utc>)> = sqlx::query_as(
          "SELECT endpoint_id, current_rate_per_sec, ramp_up_step, last_step_at
           FROM recovery_surge_state WHERE is_recovering = true"
      )
      .fetch_all(pool)
      .await?;

      let mut completed = Vec::new();

      for (endpoint_id, current_rate, step, last_step) in endpoints {
          let elapsed = (chrono::Utc::now() - last_step).num_seconds();

          if elapsed < config.recovery_step_interval_secs {
              continue; // Henüz adım zamanı gelmedi
          }

          // Son 1 saatlik success rate'i kontrol et (hourly_stats saatlik veri tutar)
          let stats: (i64, i64) = sqlx::query_as(
              "SELECT COALESCE(SUM(total_deliveries),0), COALESCE(SUM(successful),0)
               FROM endpoint_hourly_stats
               WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '1 hour'"
          )
          .bind(endpoint_id)
          .fetch_one(pool)
          .await
          .unwrap_or((0, 0));

          let success_rate = if stats.0 > 0 {
              (stats.1 as f64 / stats.0 as f64) * 100.0
          } else { 100.0 };

          if success_rate < config.recovery_min_success_rate {
              // Success rate düşük → rate'i düşür
              let new_rate = (current_rate * 0.5).max(5.0);
              sqlx::query(
                  "UPDATE recovery_surge_state SET current_rate_per_sec = $1, last_step_at = NOW()
                   WHERE endpoint_id = $2"
              )
              .bind(new_rate).bind(endpoint_id).execute(pool).await?;
              tracing::warn!("⬇️ Recovery rate decreased for {}: {:.0}/s (success: {:.0}%)",
                  endpoint_id, new_rate, success_rate);
              continue;
          }

          // Bir sonraki adım
          let next_step = config.recovery_ramp_steps.iter().find(|&&s| s > current_rate);

          match next_step {
              Some(&next_rate) => {
                  sqlx::query(
                      "UPDATE recovery_surge_state
                       SET current_rate_per_sec = $1, ramp_up_step = $1, last_step_at = NOW()
                       WHERE endpoint_id = $2"
                  )
                  .bind(next_rate).bind(endpoint_id).execute(pool).await?;
                  tracing::info!("⬆️ Recovery rate increased for {}: {:.0}/s", endpoint_id, next_rate);
              }
              None => {
                  // Hedef hıza ulaştık → recovery tamamlandı
                  sqlx::query(
                      "UPDATE recovery_surge_state SET is_recovering = false, updated_at = NOW()
                       WHERE endpoint_id = $1"
                  )
                  .bind(endpoint_id).execute(pool).await?;

                  // Müşteriye bildirim gönder
                  let _ = sqlx::query(
                      "INSERT INTO notifications (customer_id, type, title, message, is_read)
                       SELECT customer_id, 'recovery', '✅ Recovery Complete',
                              'Your endpoint is back to normal traffic levels.', false
                       FROM endpoints WHERE id = $1"
                  )
                  .bind(endpoint_id).execute(pool).await;

                  tracing::info!("✅ Recovery surge completed for {}", endpoint_id);
                  completed.push(endpoint_id);
              }
          }
      }

      Ok(completed)
  }

  /// Endpoint down oldu → queue'daki webhook'ları bekle
  pub async fn queue_surge_delivery(
      pool: &PgPool,
      endpoint_id: Uuid,
      delivery_id: Uuid,
  ) -> Result<(), sqlx::Error> {
      sqlx::query(
          "UPDATE recovery_surge_state SET queued_count = queued_count + 1 WHERE endpoint_id = $1"
      )
      .bind(endpoint_id)
      .execute(pool)
      .await?;

      // Webhook'u normal kuyruğa ekle ama rate limit uygulanacak
      Ok(())
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod recovery_surge;
□ cargo check
□ Git commit: "feat(cortex): recovery surge engine - controlled ramp-up"
```

### Adım 5.3 — Recovery Surge Job
```
□ api/src/main.rs'de ekle:

  // Cortex: Recovery surge tick (her dakika) + distributed lock
  let surge_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          tokio::time::sleep(std::time::Duration::from_secs(60)).await;

          if !hooksniff_api::cortex::try_cortex_lock(&surge_pool, "cortex_surge", 120).await {
              continue;
          }

          let surge_config = hooksniff_api::cortex::CortexConfig::load(&surge_pool).await;
          match hooksniff_api::cortex::recovery_surge::tick_recovery(&surge_pool, &surge_config).await {
              Ok(completed) => {
                  for eid in &completed {
                      tracing::info!("✅ Recovery surge completed for endpoint {}", eid);
                  }
              }
              Err(e) => tracing::error!("❌ Recovery surge tick failed: {:?}", e),
          }

          hooksniff_api::cortex::release_cortex_lock(&surge_pool, "cortex_surge").await;
      }
  });

□ Git commit: "feat(cortex): recovery surge job every minute"
```

### Adım 5.4 — Worker Entegrasyonu (Rate Limit Uygulama)
```
⚠️ Worker ayrı binary. Recovery surge state'i okuyup rate limit uygulayacak.

□ worker/src/main.rs'de, process_pending() fonksiyonunda, her item için:

  // Recovery surge kontrol: endpoint recovery modundaysa rate limit uygula
  let surge_state: Option<(bool, f64)> = sqlx::query_as(
      "SELECT is_recovering, current_rate_per_sec FROM recovery_surge_state WHERE endpoint_id = $1"
  )
  .bind(item.endpoint_id)
  .fetch_optional(&pool)
  .await
  .unwrap_or(None);

  if let Some((true, rate_per_sec)) = surge_state {
      // Recovery modunda → rate limit uygula
      // Basit token bucket: rate_per_sec kadar saniyede izin ver
      let recent_count: (i64,) = sqlx::query_as(
          "SELECT COUNT(*) FROM webhook_queue
           WHERE endpoint_id = $1
             AND status = 'delivered'
             AND processed_at > NOW() - INTERVAL '1 second'"
      )
      .bind(item.endpoint_id)
      .fetch_one(&pool)
      .await
      .unwrap_or((0,));

      if recent_count.0 as f64 >= rate_per_sec {
          // Rate aşıldı → ertele
          let _ = sqlx::query(
              "UPDATE webhook_queue SET status = 'pending', next_retry_at = NOW() + INTERVAL '100ms' WHERE id = $1"
          )
          .bind(item.id)
          .execute(&pool)
          .await;
          return Ok::<(), anyhow::Error>(());
      }
  }

□ NOT: worker/src/main.rs'de, failure_streak 5'ten 0'a düştüğünde
   recovery_surge_state INSERT et (is_recovering=true):

   // delivery başarılı olduktan SONRA:
   if old_failure_streak >= 5 && new_failure_streak == 0 {
       let _ = sqlx::query(
           "INSERT INTO recovery_surge_state (endpoint_id, customer_id, is_recovering, recovery_started_at,
               current_rate_per_sec, target_rate_per_sec, ramp_up_step, last_step_at)
           VALUES ($1, $2, true, NOW(), 10.0, 200.0, 10.0, NOW())
           ON CONFLICT (endpoint_id) DO UPDATE SET
               is_recovering = true, recovery_started_at = NOW(),
               current_rate_per_sec = 10.0, ramp_up_step = 10.0, last_step_at = NOW()"
       )
       .bind(item.endpoint_id)
       .bind(item.customer_id)  // customer_id from webhook queue item
       .execute(&pool)
       .await;
   }

□ Git commit: "feat(cortex): worker recovery surge rate limiting"
```

### Adım 5.5 — Test (güncellenmiş)
```
□ Endpoint down et → failure_streak 5+
□ Endpoint up et → recovery state oluştu mu (customer_id dolu mu)
□ Worker rate limit uyguluyor mu (recovery modunda yavaş gönderiyor mu)
□ Rate kademeli artıyor mu (config.recovery_ramp_steps kullanıyor mu)
□ Success rate düşünce rate düşüyor mu (1 saatlik pencere)
□ Hedefe ulaşınca recovery kapanıyor mu
□ Recovery tamamlandığında müşteriye bildirim gidiyor mu
□ Distributed lock çalışıyor mu
□ Config-driven: RAMP_STEPS, STEP_INTERVAL, MIN_SUCCESS_RATE
□ Git push
```

### AŞAMA 6 TAMAMLANDI □

---

## AŞAMA 7: Predictive Engine 🟡 ORTA

**Amaç:** Failure prediction, capacity forecast.
**Süre:** 1-2 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

### Adım 6.1 — Migration
```
□ Dosya oluştur: migrations/083_cortex_predictions.sql

İçerik:

  CREATE TABLE IF NOT EXISTS failure_predictions (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      predicted_failure_probability FLOAT,
      predicted_failure_time TIMESTAMPTZ,
      confidence FLOAT,
      trend VARCHAR(30),
      momentum FLOAT,
      signals JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_predictions_endpoint
      ON failure_predictions(endpoint_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_predictions_customer
      ON failure_predictions(customer_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_predictions_high
      ON failure_predictions(predicted_failure_probability DESC)
      WHERE predicted_failure_probability > 0.7;

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 083 - failure predictions"
```

### Adım 6.2 — Predictive Engine Yaz (Trend Analizi + Momentum)
```
□ Dosya oluştur: api/src/cortex/predictive_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;
  use super::config::CortexConfig;

  /// Failure prediction: trend analizi + momentum + failure time tahmini
  pub async fn predict_failure(
      pool: &PgPool, endpoint_id: Uuid, config: &CortexConfig,
  ) -> Result<PredictionResult, sqlx::Error> {
      let hourly_rates: Vec<(f64,)> = sqlx::query_as(
          r#"
          SELECT COALESCE(SUM(successful)::FLOAT / NULLIF(SUM(total_deliveries),0), 1.0)
          FROM endpoint_hourly_stats
          WHERE endpoint_id = $1
            AND hour_start > NOW() - INTERVAL '3 hours'
          GROUP BY hour_start
          ORDER BY hour_start ASC
          "#
      )
      .bind(endpoint_id)
      .fetch_all(pool).await?;

      if hourly_rates.is_empty() {
          return Ok(PredictionResult {
              probability: 0.0, trend: "stable".to_string(),
              momentum: 0.0, predicted_failure_time: None,
          });
      }

      let rates: Vec<f64> = hourly_rates.iter().map(|r| r.0).collect();
      let current_rate = *rates.last().unwrap_or(&1.0);
      let trend_slope = compute_slope(&rates);

      let momentum = if rates.len() >= 3 {
          let recent_change = rates[rates.len()-1] - rates[rates.len()-2];
          let older_change = rates[rates.len()-2] - rates[rates.len()-3];
          recent_change - older_change
      } else { 0.0 };

      // Probability hesaplama — config-driven eşikler
      let base_prob = (1.0 - current_rate).max(0.0).min(1.0);

      let trend_bonus = if trend_slope < config.predictive_trend_threshold {
          (-trend_slope * 0.5).min(0.3)
      } else { 0.0 };

      let momentum_bonus = if momentum < config.predictive_momentum_threshold {
          (-momentum * 0.3).min(0.2)
      } else { 0.0 };

      let probability = (base_prob + trend_bonus + momentum_bonus).min(1.0);

      let trend = if trend_slope < -0.2 { "declining_fast" }
          else if trend_slope < -0.05 { "declining" }
          else if trend_slope > 0.05 { "improving" }
          else { "stable" }.to_string();

      // Failure time tahmini: mevcut trend devam ederse kaç saat sonra %0 success?
      let predicted_failure_time = if trend_slope < -0.01 && current_rate > 0.0 {
          let hours_to_zero = current_rate / (-trend_slope);
          if hours_to_zero > 0.0 && hours_to_zero < 720.0 { // max 30 gün
              Some(chrono::Utc::now() + chrono::Duration::hours(hours_to_zero as i64))
          } else { None }
      } else { None };

      Ok(PredictionResult { probability, trend, momentum, predicted_failure_time })
  }

  #[derive(Debug)]
  pub struct PredictionResult {
      pub probability: f64,
      pub trend: String,
      pub momentum: f64,
      pub predicted_failure_time: Option<chrono::DateTime<chrono::Utc>>,
  }

  /// Basit lineer regresyon eğimi (y = mx + b → m)
  fn compute_slope(values: &[f64]) -> f64 {
      let n = values.len() as f64;
      if n < 2.0 { return 0.0; }

      let sum_x: f64 = (0..values.len()).map(|i| i as f64).sum();
      let sum_y: f64 = values.iter().sum();
      let sum_xy: f64 = values.iter().enumerate().map(|(i, &y)| i as f64 * y).sum();
      let sum_x2: f64 = (0..values.len()).map(|i| (i as f64).powi(2)).sum();

      let denominator = n * sum_x2 - sum_x * sum_x;
      if denominator.abs() < f64::EPSILON { return 0.0; }

      (n * sum_xy - sum_x * sum_y) / denominator
  }

  /// Capacity forecast: mevcut hızla limit ne zaman aşılır
  /// Plan limitini customers tablosundan okur (hardcoded değil)
  pub async fn forecast_capacity(
      pool: &PgPool, customer_id: uuid::Uuid
  ) -> Result<Option<chrono::DateTime<chrono::Utc>>, sqlx::Error> {
      // Plan limitini customers tablosundan oku
      let plan_info: Option<(String, i32)> = sqlx::query_as(
          "SELECT plan, webhook_limit FROM customers WHERE id = $1"
      )
      .bind(customer_id)
      .fetch_optional(pool)
      .await?;

      let limit = match plan_info {
          Some((_, limit)) if limit > 0 => limit as f64,
          _ => 10000.0, // fallback
      };

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
      let remaining = limit - (total as f64 % limit);
      let hours_remaining = remaining / rate_per_hour;

      Ok(Some(chrono::Utc::now() + chrono::Duration::hours(hours_remaining as i64)))
  }

  /// Prediction'ları hesapla ve DB'ye yaz
  /// Her saatlik aggregation sonrası çağrılır
  pub async fn predict_and_persist(
      pool: &PgPool,
      config: &CortexConfig,
  ) -> Result<u64, sqlx::Error> {
      let endpoints: Vec<(Uuid, Uuid)> = sqlx::query_as(
          "SELECT DISTINCT e.id, e.customer_id FROM endpoints e
           JOIN endpoint_hourly_stats eh ON eh.endpoint_id = e.id
           WHERE eh.hour_start > NOW() - INTERVAL '3 hours'
             AND e.is_active = true"
      )
      .fetch_all(pool).await?;

      let mut persisted = 0u64;
      for (endpoint_id, customer_id) in endpoints {
          let result = predict_failure(pool, endpoint_id, config).await?;

          // Sadece probability > 0.1 ise kaydet (gürültüyü azalt)
          if result.probability > 0.1 {
              // Confidence: veri miktarına göre
              let data_points: (i64,) = sqlx::query_as(
                  "SELECT COUNT(*) FROM endpoint_hourly_stats
                   WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '3 hours'"
              )
              .bind(endpoint_id)
              .fetch_one(pool)
              .await
              .unwrap_or((0,));
              let confidence = (data_points.0 as f64 / 3.0).min(1.0);

              sqlx::query(
                  "INSERT INTO failure_predictions
                   (endpoint_id, customer_id, predicted_failure_probability, predicted_failure_time,
                    confidence, trend, momentum, signals)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
              )
              .bind(endpoint_id)
              .bind(customer_id)
              .bind(result.probability)
              .bind(result.predicted_failure_time)
              .bind(confidence)
              .bind(&result.trend)
              .bind(result.momentum)
              .bind(serde_json::json!({"data_points": data_points.0}))
              .execute(pool)
              .await?;

              persisted += 1;
          }
      }

      Ok(persisted)
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod predictive_engine;
□ cargo check
□ Git commit: "feat(cortex): predictive engine with trend analysis + momentum"
```

### Adım 6.3 — Proactive Alerting + Prediction Persist Job
```
□ api/src/jobs/alert_eval.rs'de, run_alert_evaluation() fonksiyonunun SONUNA ekle:

  // Cortex: Proactive failure prediction (cooldown: 1 endpoint'e 6 saatte bir)
  // NOT: predictive_engine modülünden PredictionResult import et
  use hooksniff_api::cortex::predictive_engine::PredictionResult;

  let cortex_config = hooksniff_api::cortex::CortexConfig::load(pool).await;
  let endpoints: Vec<(Uuid,)> = sqlx::query_as(
      "SELECT DISTINCT endpoint_id FROM endpoint_hourly_stats WHERE hour_start > NOW() - INTERVAL '3 hours'"
  )
  .fetch_all(pool).await.unwrap_or_default();

  for (endpoint_id,) in endpoints {
      let prediction = hooksniff_api::cortex::predictive_engine::predict_failure(
          pool, endpoint_id, &cortex_config
      ).await.unwrap_or(PredictionResult {
          probability: 0.0, trend: "stable".to_string(),
          momentum: 0.0, predicted_failure_time: None,
      });

      if prediction.probability > cortex_config.predictive_failure_threshold {
          // Cooldown: son 6 saatte bu endpoint için bildirim gönderilmiş mi?
          let already_notified: Option<(i32,)> = sqlx::query_as(
              "SELECT 1 FROM notifications
               WHERE customer_id = (SELECT customer_id FROM endpoints WHERE id = $1)
                 AND type = 'warning'
                 AND title LIKE '%Failure Risk%'
                 AND created_at > NOW() - INTERVAL '6 hours'
               LIMIT 1"
          )
          .bind(endpoint_id)
          .fetch_optional(pool)
          .await
          .unwrap_or(None);

          if already_notified.is_none() {
              let failure_time_str = prediction.predicted_failure_time
                  .map(|t| format!("Estimated failure: {}", t.format("%Y-%m-%d %H:%M UTC")))
                  .unwrap_or_else(|| "No time estimate".to_string());

              tracing::warn!("⚠️ Endpoint {} failure probability: {:.0}% (trend: {}) {}",
                  endpoint_id, prediction.probability * 100.0, prediction.trend, failure_time_str);

              let _ = sqlx::query(
                  "INSERT INTO notifications (customer_id, type, title, message, is_read)
                   SELECT customer_id, 'warning', '⚠️ Endpoint Failure Risk',
                          FORMAT('Failure probability: %.0f%% (%s trend). %s Check your server.',
                                 $2 * 100, $3, $4), false
                   FROM endpoints WHERE id = $1"
              )
              .bind(endpoint_id)
              .bind(prediction.probability)
              .bind(&prediction.trend)
              .bind(&failure_time_str)
              .execute(pool).await;
          }
      }
  }

□ api/src/main.rs'de, anomaly scoring job SONRASI ekle:

  // Cortex: Prediction persist (her saat 00:10'de) + distributed lock
  let predict_pool = cortex_pool.clone();
  tokio::spawn(async move {
      loop {
          let now = chrono::Utc::now();
          let next_hour = (now + chrono::Duration::hours(1))
              .with_minute(10).unwrap().with_second(0).unwrap();
          let wait = (next_hour - now).num_milliseconds().max(0) as u64;
          tokio::time::sleep(std::time::Duration::from_millis(wait)).await;

          if !hooksniff_api::cortex::try_cortex_lock(&predict_pool, "cortex_predict", 300).await {
              tracing::debug!("⏭️ Cortex predict: another instance holds lock, skipping");
              continue;
          }

          let config = hooksniff_api::cortex::CortexConfig::load(&predict_pool).await;
          match hooksniff_api::cortex::predictive_engine::predict_and_persist(&predict_pool, &config).await {
              Ok(n) => tracing::info!("📊 Cortex: Persisted {} predictions", n),
              Err(e) => tracing::error!("❌ Prediction persist failed: {:?}", e),
          }

          hooksniff_api::cortex::release_cortex_lock(&predict_pool, "cortex_predict").await;
      }
  });

□ Git commit: "feat(cortex): proactive alert with failure time + prediction persist with lock"
```

### Adım 6.4 — Test
```
□ failure_predictions'da veri var mı
□ customer_id, trend, momentum dolu mu
□ Confidence mantıklı mı (0-1 arası)
□ Tahminler mantıklı mı (düşüş trendi → yüksek probability)
□ Proactive alert cooldown çalışıyor mu (6 saatte bir)
□ Capacity forecast plan limitini okuyor mu (hardcoded değil)
□ compute_slope doğru mu (test: [1.0, 0.8, 0.6] → negatif eğim)
□ Git push
```

### AŞAMA 7 TAMAMLANDI □

---

## AŞAMA 8: Insights Engine 🟡 ORTA

**Amaç:** Haftalık rapor, customer health, recommendations, haftalık email.
**Süre:** 2 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

### Adım 7.1 — Migration
```
□ Dosya oluştur: migrations/084_cortex_insights.sql

İçerik:

  CREATE TABLE IF NOT EXISTS weekly_reports (
      id BIGSERIAL PRIMARY KEY,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      week_end DATE NOT NULL,
      total_deliveries BIGINT DEFAULT 0,
      success_rate FLOAT DEFAULT 100.0,
      delivery_change_pct FLOAT DEFAULT 0.0,
      insights JSONB DEFAULT '{}',
      recommendations JSONB DEFAULT '[]',
      email_sent BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(customer_id, week_start)
  );

  CREATE INDEX IF NOT EXISTS idx_weekly_reports_customer
      ON weekly_reports(customer_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS customer_health (
      customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
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
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      type VARCHAR(30) NOT NULL,
      priority VARCHAR(10) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      action_url VARCHAR(500),
      action_label VARCHAR(100),
      dismissed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_recommendations_customer
      ON recommendations(customer_id, created_at DESC) WHERE dismissed = false;

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 084 - insights with FK + indexes + unique"
```

### Adım 7.2 — Insights Engine Yaz
```
□ Dosya oluştur: api/src/cortex/insights_engine.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;
  use chrono::{Utc, Duration};

  /// Haftalık rapor oluştur (idempotent — UNIQUE constraint sayesinde)
  pub async fn generate_weekly_report(
      pool: &PgPool, customer_id: Uuid
  ) -> Result<(), sqlx::Error> {
      let now = Utc::now();
      // Haftanın başlangıcı (Pazartesi)
      let days_since_monday = now.weekday().num_days_from_monday();
      let week_start = (now - Duration::days(days_since_monday as i64)).date_naive();
      let week_end = (week_start + Duration::days(6)).naive_utc();

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
      .bind(customer_id).fetch_one(pool).await?;

      let (total, successful, _failed) = stats;
      let success_rate = if total > 0 { (successful as f64 / total as f64) * 100.0 } else { 100.0 };

      // Geçen hafta ile karşılaştırma
      let prev_stats: (i64,) = sqlx::query_as(
          "SELECT COALESCE(SUM(total_deliveries),0) FROM weekly_reports
           WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1"
      )
      .bind(customer_id).fetch_one(pool).await.unwrap_or((0,));

      let change_pct = if prev_stats.0 > 0 {
          ((total as f64 - prev_stats.0 as f64) / prev_stats.0 as f64) * 100.0
      } else { 0.0 };

      // Insights otomatik oluştur
      let mut insights = Vec::new();
      if success_rate < 95.0 {
          insights.push(serde_json::json!({"type": "warning", "message": "Success rate below 95%"}));
      }
      if change_pct < -20.0 {
          insights.push(serde_json::json!({"type": "alert", "message": "Delivery volume dropped >20%"}));
      }
      if change_pct > 50.0 {
          insights.push(serde_json::json!({"type": "info", "message": "Delivery volume increased >50%"}));
      }

      // UNIQUE constraint — duplicate rapor oluşmaz
      sqlx::query(
          "INSERT INTO weekly_reports (customer_id, week_start, week_end, total_deliveries,
              success_rate, delivery_change_pct, insights)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (customer_id, week_start) DO UPDATE SET
              total_deliveries = EXCLUDED.total_deliveries,
              success_rate = EXCLUDED.success_rate,
              delivery_change_pct = EXCLUDED.delivery_change_pct,
              insights = EXCLUDED.insights"
      )
      .bind(customer_id).bind(week_start).bind(week_end)
      .bind(total).bind(success_rate).bind(change_pct)
      .bind(serde_json::json!(insights))
      .execute(pool).await?;

      Ok(())
  }

  /// Customer health hesapla (tüm skorları doldurur)
  pub async fn calculate_customer_health(
      pool: &PgPool, customer_id: Uuid
  ) -> Result<(), sqlx::Error> {
      // Integration: endpoint + API key kullanımı
      let ep_count: (i64,) = sqlx::query_as(
          "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1"
      )
      .bind(customer_id).fetch_one(pool).await?;

      let has_api_key: (bool,) = sqlx::query_as(
          "SELECT COUNT(*) > 0 FROM api_keys WHERE customer_id = $1"
      )
      .bind(customer_id).fetch_one(pool).await.unwrap_or((false,));

      let integration = match (ep_count.0, has_api_key.0) {
          (0, _) => 0,
          (_, false) => 25,
          (1..=2, true) => 50,
          _ => 50,
      };

      // Engagement: son 7 günde aktif delivery var mı
      let recent_activity: (i64,) = sqlx::query_as(
          "SELECT COALESCE(SUM(total_deliveries),0) FROM endpoint_hourly_stats eh
           JOIN endpoints e ON e.id = eh.endpoint_id
           WHERE e.customer_id = $1 AND eh.hour_start > NOW() - INTERVAL '24 hours'"
      )
      .bind(customer_id).fetch_one(pool).await.unwrap_or((0,));

      let engagement = if recent_activity.0 > 0 { 50 } else { 10 };

      // Growth: haftalık değişim
      let current_week: (i64,) = sqlx::query_as(
          "SELECT COALESCE(SUM(total_deliveries),0) FROM endpoint_hourly_stats eh
           JOIN endpoints e ON e.id = eh.endpoint_id
           WHERE e.customer_id = $1 AND eh.hour_start > NOW() - INTERVAL '7 days'"
      )
      .bind(customer_id).fetch_one(pool).await.unwrap_or((0,));

      let prev_week: (i64,) = sqlx::query_as(
          "SELECT COALESCE(SUM(total_deliveries),0) FROM endpoint_hourly_stats eh
           JOIN endpoints e ON e.id = eh.endpoint_id
           WHERE e.customer_id = $1
             AND eh.hour_start > NOW() - INTERVAL '14 days'
             AND eh.hour_start <= NOW() - INTERVAL '7 days'"
      )
      .bind(customer_id).fetch_one(pool).await.unwrap_or((0,));

      let growth = if prev_week.0 > 0 && current_week.0 > prev_week.0 {
          50 // Büyüme var
      } else if prev_week.0 > 0 {
          25 // Stabil veya düşüş
      } else { 10 }; // Veri yok

      // Stability: success rate
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
      } else { 25 };

      let health_score = integration + engagement + growth + stability;
      let grade = match health_score {
          140..=200 => "A",
          100..=139 => "B",
          60..=99 => "C",
          30..=59 => "D",
          _ => "F",
      };
      let churn_risk = if health_score < 30 { 0.8 }
          else if health_score < 60 { 0.5 }
          else if health_score < 100 { 0.3 }
          else { 0.1 };
      let upgrade_prob = if health_score > 120 { 0.4 }
          else if health_score > 80 { 0.2 }
          else { 0.05 };

      sqlx::query(
          r#"
          INSERT INTO customer_health (customer_id, integration_score, engagement_score,
              growth_score, stability_score, health_score, health_grade,
              churn_risk, upgrade_probability, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (customer_id) DO UPDATE SET
              integration_score=EXCLUDED.integration_score,
              engagement_score=EXCLUDED.engagement_score,
              growth_score=EXCLUDED.growth_score,
              stability_score=EXCLUDED.stability_score,
              health_score=EXCLUDED.health_score,
              health_grade=EXCLUDED.health_grade,
              churn_risk=EXCLUDED.churn_risk,
              upgrade_probability=EXCLUDED.upgrade_probability,
              updated_at=NOW()
          "#
      )
      .bind(customer_id).bind(integration).bind(engagement)
      .bind(growth).bind(stability).bind(health_score).bind(grade)
      .bind(churn_risk).bind(upgrade_prob)
      .execute(pool).await?;

      Ok(())
  }

  /// Haftalık rapor email'i gönder
  pub async fn send_weekly_report_email(
      pool: &PgPool,
      email_client: &crate::resend_email::ResendEmailClient,
      customer_id: Uuid,
  ) -> Result<(), sqlx::Error> {
      let customer: (String,) = sqlx::query_as(
          "SELECT email FROM customers WHERE id = $1"
      )
      .bind(customer_id).fetch_one(pool).await?;

      let report: Option<(i64, f64, f64)> = sqlx::query_as(
          "SELECT total_deliveries, success_rate, delivery_change_pct FROM weekly_reports
           WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1"
      )
      .bind(customer_id).fetch_optional(pool).await?;

      if let Some((total, rate, change)) = report {
          let change_emoji = if change > 0.0 { "📈" } else if change < 0.0 { "📉" } else { "➡️" };
          let subject = format!("📊 Weekly Report: {} deliveries, {:.1}% success", total, rate);
          let html = format!(
              "<h2>Your Weekly HookSniff Report</h2>
               <p>Total deliveries: <strong>{}</strong></p>
               <p>Success rate: <strong>{:.1}%</strong></p>
               <p>{} Change vs last week: <strong>{:+.1}%</strong></p>
               <p><a href='https://hooksniff.vercel.app/analytics'>View Dashboard →</a></p>",
              total, rate, change_emoji, change
          );
          match email_client.send_contact_email(&customer.0, &subject, &html).await {
              Ok(_) => {
                  sqlx::query("UPDATE weekly_reports SET email_sent = true WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1")
                      .bind(customer_id).execute(pool).await?;
              }
              Err(e) => {
                  tracing::warn!("⚠️ Weekly report email failed for {}: {:?}", customer_id, e);
              }
          }
      }

      Ok(())
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod insights_engine;
□ cargo check
□ Git commit: "feat(cortex): insights engine - full health scores + idempotent reports + error handling"
```

### Adım 7.3 — Haftalık Rapor Job'u (Email + Lock)
```
□ api/src/main.rs'de ekle:

  // Cortex: Haftalık rapor + email (her Pazartesi 09:00 UTC) + distributed lock
  let report_pool = pool.clone();
  tokio::spawn(async move {
      loop {
          let now = chrono::Utc::now();
          // Doğru Monday hesaplama: bugünden Pazartesi'ye kadar olan gün sayısı
          let days_until_monday = (7 - now.weekday().num_days_from_monday()) % 7;
          let wait_days = if days_until_monday == 0 && now.hour() < 9 {
              0 // Bugün Pazartesi ve saat 09:00'dan önce
          } else if days_until_monday == 0 {
              7 // Bugün Pazartesi ama saat 09:00'dan sonra → gelecek Pazartesi
          } else {
              days_until_monday
          };
          let next_monday_9am = (now + chrono::Duration::days(wait_days as i64))
              .with_hour(9).unwrap().with_minute(0).unwrap().with_second(0).unwrap();
          let wait = (next_monday_9am - now).num_milliseconds().max(0) as u64;
          tokio::time::sleep(std::time::Duration::from_millis(wait)).await;

          // Distributed lock
          if !hooksniff_api::cortex::try_cortex_lock(&report_pool, "cortex_report", 3600).await {
              tracing::debug!("⏭️ Cortex reports: another instance holds lock, skipping");
              continue;
          }

          let customers: Vec<(Uuid,)> = sqlx::query_as(
              "SELECT DISTINCT customer_id FROM endpoints WHERE is_active = true"
          )
          .fetch_all(&report_pool).await.unwrap_or_default();

          if let Some(email_client) = hooksniff_api::resend_email::ResendEmailClient::from_env() {
              for (customer_id,) in &customers {
                  let _ = hooksniff_api::cortex::insights_engine::generate_weekly_report(&report_pool, *customer_id).await;
                  let _ = hooksniff_api::cortex::insights_engine::calculate_customer_health(&report_pool, *customer_id).await;
                  let _ = hooksniff_api::cortex::insights_engine::send_weekly_report_email(&report_pool, &email_client, *customer_id).await;
              }
              tracing::info!("📊 Cortex: Weekly reports + emails sent for {} customers", customers.len());
          }

          hooksniff_api::cortex::release_cortex_lock(&report_pool, "cortex_report").await;
      }
  });

□ Git commit: "feat(cortex): weekly report job with lock + correct Monday calculation"
```

### Adım 7.4 — API Endpoints + Dashboard
```
□ Dosya oluştur: api/src/routes/cortex_insights.rs

İçerik (gerçek implementasyon — stub değil):

  use axum::{extract::{Extension, Path}, Json};
  use sqlx::PgPool;
  use uuid::Uuid;
  use crate::middleware::AuthUser; // auth middleware'den gelir

  pub fn router() -> axum::Router {
      axum::Router::new()
          .route("/health", axum::routing::get(get_health))
          .route("/reports", axum::routing::get(get_reports))
          .route("/recommendations", axum::routing::get(get_recommendations))
  }

  async fn get_health(
      Extension(pool): Extension<PgPool>,
      auth: AuthUser,
  ) -> Json<serde_json::Value> {
      let health: Option<(i32, String, f64, f64)> = sqlx::query_as(
          "SELECT health_score, health_grade, churn_risk, upgrade_probability
           FROM customer_health WHERE customer_id = $1"
      )
      .bind(auth.customer_id)
      .fetch_optional(&pool)
      .await
      .unwrap_or(None);

      match health {
          Some((score, grade, churn, upgrade)) => Json(serde_json::json!({
              "health_score": score,
              "health_grade": grade,
              "churn_risk": churn,
              "upgrade_probability": upgrade,
          })),
          None => Json(serde_json::json!({
              "health_score": 0, "health_grade": "F",
              "churn_risk": 0.5, "upgrade_probability": 0.1,
          })),
      }
  }

  async fn get_reports(
      Extension(pool): Extension<PgPool>,
      auth: AuthUser,
  ) -> Json<serde_json::Value> {
      let reports: Vec<(String, String, i64, f64, f64, bool)> = sqlx::query_as(
          "SELECT week_start::TEXT, week_end::TEXT, total_deliveries, success_rate,
                  delivery_change_pct, email_sent
           FROM weekly_reports WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 12"
      )
      .bind(auth.customer_id)
      .fetch_all(&pool)
      .await
      .unwrap_or_default();

      Json(serde_json::json!({
          "reports": reports.iter().map(|r| serde_json::json!({
              "week_start": r.0, "week_end": r.1,
              "total_deliveries": r.2, "success_rate": r.3,
              "change_pct": r.4, "email_sent": r.5,
          })).collect::<Vec<_>>()
      }))
  }

  async fn get_recommendations(
      Extension(pool): Extension<PgPool>,
      auth: AuthUser,
  ) -> Json<serde_json::Value> {
      let recs: Vec<(String, String, String, String, Option<String>, Option<String>)> = sqlx::query_as(
          "SELECT type, priority, title, description, action_url, action_label
           FROM recommendations WHERE customer_id = $1 AND dismissed = false
           ORDER BY created_at DESC LIMIT 20"
      )
      .bind(auth.customer_id)
      .fetch_all(&pool)
      .await
      .unwrap_or_default();

      Json(serde_json::json!({
          "recommendations": recs.iter().map(|r| serde_json::json!({
              "type": r.0, "priority": r.1, "title": r.2,
              "description": r.3, "action_url": r.4, "action_label": r.5,
          })).collect::<Vec<_>>()
      }))
  }

□ api/src/routes/mod.rs'ye ekle: pub mod cortex_insights;
□ Protected router'a ekle: .nest("/insights", cortex_insights::router())
□ Dashboard sayfası: dashboard/src/app/[locale]/(dashboard)/insights/page.tsx
□ Git commit: "feat(cortex): insights API endpoints (real implementation)"
```

### Adım 7.5 — Test
```
□ weekly_reports'da veri var mı
□ UNIQUE constraint çalışıyor mu (tekrar çalıştır → duplicate yok)
□ customer_health 4 skor dolu mu (integration, engagement, growth, stability)
□ upgrade_probability mantıklı mı
□ Email gönderildi mi
□ API endpoint'leri gerçek veri dönüyor mu (stub değil)
□ Distributed lock çalışıyor mu
□ Git push
```

### AŞAMA 8 TAMAMLANDI □

---

## AŞAMA 9: Smart Routing 🟢 DÜŞÜK

**Amaç:** Fallback URL'ler arası akıllı seçim.
**Süre:** 1 oturum | **Risk:** DÜŞÜK | **Bağımlılık:** Aşama 1 + 2

> **NOT:** Orijinal plan "her URL için ayrı tracking" önerdi ama bu çok karmaşık.
> Basit yaklaşım: API routing kararı yazar, worker DB'den okur.
> Fallback URL'ler zaten endpoints tablosunda `fallback_url` kolonunda var (migration 003).

### Adım 8.1 — Migration
```
□ Dosya oluştur: migrations/085_cortex_routing.sql

İçerik:

  CREATE TABLE IF NOT EXISTS routing_decisions (
      id BIGSERIAL PRIMARY KEY,
      endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      chosen_url VARCHAR(2048) NOT NULL,
      reason VARCHAR(100) NOT NULL,
      alternatives JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_routing_endpoint
      ON routing_decisions(endpoint_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_routing_customer
      ON routing_decisions(customer_id, created_at DESC);

□ Neon DB'ye uygula: node run-migrations.js
□ Git commit: "feat(cortex): migration 085 - routing decisions with FK"
```

### Adım 8.2 — Smart Routing Yaz (API Tarafı)
```
□ Dosya oluştur: api/src/cortex/smart_routing.rs

İçerik (copy-paste):

  use sqlx::PgPool;
  use uuid::Uuid;

  /// Routing kararı ver: primary mi, fallback mı?
  ///
  /// Mantık:
  /// 1. Primary URL'in son 1 saatlik success rate'i
  /// 2. Eğer %50'nin altındaysa → fallback URL'e geç
  /// 3. Kararı routing_decisions tablosuna yaz
  /// 4. Worker bu tabloyu okuyarak delivery yapar
  pub async fn decide_routing(
      pool: &PgPool,
      endpoint_id: Uuid,
      customer_id: Uuid,
      primary_url: &str,
      fallback_url: Option<&str>,
  ) -> RoutingDecision {
      let fallback = match fallback_url {
          Some(f) if !f.is_empty() => f,
          _ => return RoutingDecision {
              url: primary_url.to_string(),
              is_fallback: false,
              reason: "no_fallback_configured".to_string(),
          },
      };

      // Primary URL'in son 1 saatlik success rate'i
      let score = get_endpoint_score(pool, endpoint_id).await;

      if score >= 50.0 {
          // Primary iyi durumda
          RoutingDecision {
              url: primary_url.to_string(),
              is_fallback: false,
              reason: format!("primary_score_{:.0}", score),
          }
      } else {
          // Primary kötü → fallback'e geç
          let decision = RoutingDecision {
              url: fallback.to_string(),
              is_fallback: true,
              reason: format!("primary_score_{:.0}_below_threshold", score),
          };

          // Kararı DB'ye yaz (worker okuyacak)
          let _ = sqlx::query(
              "INSERT INTO routing_decisions (endpoint_id, customer_id, chosen_url, reason, alternatives)
               VALUES ($1, $2, $3, $4, $5)"
          )
          .bind(endpoint_id)
          .bind(customer_id)
          .bind(&decision.url)
          .bind(&decision.reason)
          .bind(serde_json::json!({
              "primary": primary_url,
              "fallback": fallback,
              "primary_score": score,
          }))
          .execute(pool)
          .await;

          decision
      }
  }

  pub struct RoutingDecision {
      pub url: String,
      pub is_fallback: bool,
      pub reason: String,
  }

  /// Endpoint'in son 1 saatlik success rate'i
  async fn get_endpoint_score(pool: &PgPool, endpoint_id: Uuid) -> f64 {
      let stats: (i64, i64) = sqlx::query_as(
          "SELECT COALESCE(SUM(total_deliveries),0), COALESCE(SUM(successful),0)
           FROM endpoint_hourly_stats
           WHERE endpoint_id = $1 AND hour_start > NOW() - INTERVAL '1 hour'"
      )
      .bind(endpoint_id)
      .fetch_one(pool)
      .await
      .unwrap_or((0, 0));

      if stats.0 == 0 { return 100.0; } // Veri yoksa varsayılan iyi
      (stats.1 as f64 / stats.0 as f64) * 100.0
  }

  /// Eski routing_decisions tablosunu temizle (retention: 7 gün)
  pub async fn cleanup_old_decisions(pool: &PgPool) -> Result<u64, sqlx::Error> {
      let result = sqlx::query(
          "DELETE FROM routing_decisions WHERE created_at < NOW() - INTERVAL '7 days'"
      )
      .execute(pool).await?;
      Ok(result.rows_affected())
  }

□ api/src/cortex/mod.rs'ye ekle: pub mod smart_routing;
□ cargo check
□ Git commit: "feat(cortex): smart routing - API decision maker"
```

### Adım 8.3 — Worker Entegrasyonu (Gerçek Kod)
```
⚠️ Worker ayrı binary. Routing kararını DB'den okuyacak.

□ worker/src/delivery/http.rs'de, delivery URL belirlenirken:

  // Mevcut kod:
  // let url = endpoint.url;

  // Yeni: routing_decisions tablosundan son kararı oku
  let routing_decision: Option<(String,)> = sqlx::query_as(
      "SELECT chosen_url FROM routing_decisions
       WHERE endpoint_id = $1
       ORDER BY created_at DESC LIMIT 1"
  )
  .bind(item.endpoint_id)
  .fetch_optional(&pool)
  .await
  .unwrap_or(None);

  let url = routing_decision
      .map(|r| r.0)
      .unwrap_or_else(|| item.endpoint_url.clone());

□ NOT: Worker, API'nin yazdığı routing kararını okur.
   API her saat başı routing_decisions yazar (anomaly scoring sonrası).
   Worker her delivery'de son kararı kontrol eder.

□ Git commit: "feat(cortex): worker reads routing decisions from DB"
```

### Adım 8.4 — Routing Job (API Process)
```
□ api/src/main.rs'de, anomaly scoring SONRASI ekle:

  // Cortex: Smart routing decisions (her saat 00:15'te) + distributed lock
  let routing_pool = cortex_pool.clone();
  tokio::spawn(async move {
      loop {
          let now = chrono::Utc::now();
          let next_hour = (now + chrono::Duration::hours(1))
              .with_minute(15).unwrap().with_second(0).unwrap();
          let wait = (next_hour - now).num_milliseconds().max(0) as u64;
          tokio::time::sleep(std::time::Duration::from_millis(wait)).await;

          if !hooksniff_api::cortex::try_cortex_lock(&routing_pool, "cortex_routing", 300).await {
              continue;
          }

          // Fallback URL'li tüm aktif endpoint'ler için routing kararı ver
          let endpoints: Vec<(Uuid, Uuid, String, String)> = sqlx::query_as(
              "SELECT id, customer_id, url, COALESCE(fallback_url, '') FROM endpoints
               WHERE is_active = true AND fallback_url IS NOT NULL AND fallback_url != ''"
          )
          .fetch_all(&routing_pool).await.unwrap_or_default();

          for (endpoint_id, customer_id, primary_url, fallback_url) in endpoints {
              let decision = hooksniff_api::cortex::smart_routing::decide_routing(
                  &routing_pool, endpoint_id, customer_id,
                  &primary_url, Some(&fallback_url),
              ).await;

              if decision.is_fallback {
                  tracing::warn!("🔀 Routing fallback for endpoint {}: {}",
                      endpoint_id, decision.reason);
              }
          }

          // Eski routing_decisions temizle
          let _ = hooksniff_api::cortex::smart_routing::cleanup_old_decisions(&routing_pool).await;

          hooksniff_api::cortex::release_cortex_lock(&routing_pool, "cortex_routing").await;
      }
  });

□ Git commit: "feat(cortex): routing job every hour + worker integration"
```

### Adım 8.5 — Test
```
□ Fallback URL'li endpoint oluştur
□ Primary score < 50 iken fallback URL seçiliyor mu
□ routing_decisions'da veri var mı
□ Worker routing kararını okuyor mu
□ 7 gün eski routing_decisions temizleniyor mu
□ Git push
```

### AŞAMA 9 TAMAMLANDI □

---

## 📊 İLERLEME TAKİP

```
CC-1:  Distributed Lock                  □ Tamamlandı
CC-2:  Cortex Config (platform_settings) □ Tamamlandı
CC-3:  Prometheus Metrics                □ Tamamlandı
CC-4:  API Endpoints (/v1/cortex/*)      □ Tamamlandı
CC-5:  Dashboard Sayfası                 □ Tamamlandı

AŞAMA 1: Hourly Stats Aggregator        □ Tamamlandı
AŞAMA 2: Profile Engine (3 pencere)      □ Tamamlandı
AŞAMA 3: Anomaly + Alert Correlation    □ Tamamlandı
AŞAMA 4: Self-Healing (14 gün)           □ Tamamlandı
AŞAMA 5: Action Memory + Adaptive Learn  □ Tamamlandı
AŞAMA 6: Recovery Surge (spike koruma)   □ Tamamlandı
AŞAMA 7: Predictive (trend + momentum)  □ Tamamlandı
AŞAMA 8: Insights + Email               □ Tamamlandı
AŞAMA 9: Smart Routing (15dk)            □ Tamamlandı
```

## 📦 MİGRASYON SIRASI

```
079_cortex_hourly_stats.sql    → Aşama 1
080_cortex_profiles.sql        → Aşama 2
081_cortex_anomalies.sql       → Aşama 3
082_cortex_healing.sql         → Aşama 4
088_cortex_action_memory.sql   → Aşama 5
086_cortex_recovery_surge.sql  → Aşama 6
083_cortex_predictions.sql     → Aşama 7
084_cortex_insights.sql        → Aşama 8
085_cortex_routing.sql         → Aşama 9
087_cortex_config.sql          → CC-2 (opsiyonel, platform_settings'a JSON ekleme)
```

---

## 💡 HER OTURUM SONUNDA

```
□ Kodu test et
□ Git commit (anlamlı mesaj)
□ Git push
□ Bu belgedeki tikleri güncelle
□ NEXT_SESSION.md'ye sıradaki adımı yaz
□ .ai-context/MEMORY.md'yi güncelle
```
