# Cortex AI — Intelligent Webhook Infrastructure

Cortex is HookSniff's built-in machine learning engine. It analyzes your webhook traffic in real-time, detects anomalies before they become incidents, and automatically heals degraded endpoints.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Cortex Scheduler                          │
│                  (15 stages, runs every cycle)                │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Signal   │ Profile  │ Anomaly  │ Alert    │ Self-Healing    │
│ Collect  │ Engine   │ Scorer   │Correlate │ Engine          │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│Proactive │Predictive│ Insights │ ML       │ ML Quality      │
│ Healing  │ Engine   │ Engine   │ Training │ Check           │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ Smart    │ Drift    │ Security │ Security │ Cleanup         │
│ Routing  │ Detect   │ Scan     │AutoResolve│ Job            │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
         │                       │                      │
    PostgreSQL              Redis Cache             ml_models
```

Cortex runs as a background scheduler with 15 stages. Each stage processes data independently and shares results through PostgreSQL.

---

## Features

### 1. Hourly Stats Aggregation (Signal Collector)

Aggregates delivery data into hourly summaries per endpoint. Runs every hour at XX:01.

- Counts distinct deliveries (not attempts)
- Uses PostgreSQL `PERCENTILE_CONT` for accurate p95/p99 latency
- Tracks error breakdown by type (timeout, server error, connection, rate limit)
- Bounded to 1 hour of data per run

### 2. Endpoint Profiling

Builds a behavioral profile for each endpoint using hourly stats:

- Success rates across 3 time windows (1h, 24h, 7d)
- Latency percentiles (p50, p95, p99) with standard deviation
- Traffic patterns: busiest hour, quietest hour, weekday vs weekend averages
- Dominant error type identification
- Sample size and confidence score

### 3. Anomaly Detection

Cortex uses multiple complementary methods to detect anomalies:

**Modified Z-Score (MAD-based)**
- Uses Median Absolute Deviation — robust against outliers
- Threshold: Z > 3.5 triggers anomaly scoring
- Separate scoring for success rate and latency

**IQR Outlier Detection (Tukey's Fences)**
- 1.5× IQR = outlier, 3× IQR = extreme outlier
- Requires 10+ recent data points
- Applied to success rate distribution

**Multivariate Correlation**
- Detects simultaneous SR drop + latency increase
- More anomalous than either metric alone
- Uses learned SR-latency correlation from training data

**Delivery Rate Anomaly**
- Z-score on delivery volume
- Detects traffic spikes (>3σ) and drops

**Consecutive Degradation**
- 3 consecutive below-median values trending down
- Catches slow degradation that single-point checks miss

Final score is weighted ensemble: max score × 60% + average × 40%.

```json
{
  "score": 72,
  "category": "high",
  "factors": {
    "adaptive_threshold": { "score": 65, "reason": "success_rate_drop" },
    "statistical_detection": { "score": 79, "methods": ["Modified Z-Score (SR): 4.2", "Multivariate: SR↓ + Latency↑"] },
    "ml_confidence": 0.85,
    "ml_samples": 219
  },
  "method": "ml"
}
```

### 4. Adaptive Thresholds (EWMA + IQR)

Each endpoint learns its own "normal" range instead of using fixed thresholds:

- **EWMA** (Exponentially Weighted Moving Average) for smooth tracking
- **IQR** (Interquartile Range) for robust outlier detection
- Separate models for success rate, latency, p95 latency, delivery rate
- Configurable smoothing factor (alpha) — higher = more responsive, lower = more stable
- Tracks variance for confidence intervals

Unlike fixed thresholds (e.g., "p95 > 5000ms = anomaly"), adaptive thresholds learn what's normal FOR EACH ENDPOINT based on its history.

### 5. Alert Correlation

Groups related anomalies into a single root cause alert. Prevents alert storms: 100 alerts → 1 root cause.

- Correlation window: configurable (default 30 minutes)
- Minimum anomaly count for correlation
- Groups by endpoint and severity
- Tracks first seen / last seen timestamps

### 6. Self-Healing Engine

When Cortex detects degradation, it automatically applies recovery strategies:

| Strategy | Action | When |
|----------|--------|------|
| `auto_disable` | Temporarily disable endpoint | Critical failures (circuit breaker: 3 consecutive high scores) |
| `circuit_tighten` | Reduce circuit breaker threshold | Intermittent failures |
| `retry_slowdown` | Increase retry backoff | Timeout-heavy endpoints |
| `rate_limit_reduce` | Lower rate limit | Overloaded endpoints |
| `fallback_url_switch` | Switch to backup URL | Primary URL down |
| `retry_increase` | Add more retry attempts | Transient errors |
| `timeout_adjust` | Adjust request timeout | Latency issues |

**Circuit Breaker Pattern:** Instead of panicking on a single high anomaly score, destructive actions (auto_disable) require 3 consecutive high scores over 3 hours. Non-destructive actions (circuit_tighten, rate_limit_reduce) still trigger on single high scores.

**UCB1 Bandit** learns which strategy works best for each endpoint. Tracks attempts, successes, average reward, and EWMA reward per strategy. 20% exploration rate ensures new strategies are tried.

### 7. Proactive Healing

Acts BEFORE anomalies occur by detecting degradation trends:

- **Degradation trend detection** — success rate consistently dropping over 6 hours (but not yet anomalous)
- **Peak preparation** — predicts traffic spikes and pre-adjusts rate limits
- **Preemptive rate adjustment** — adjusts throttling before limits are hit

Unlike the reactive healing engine (acts after anomaly score is high), proactive healing predicts problems and takes preventive action.

### 8. Predictive Engine

Predicts failures before they happen using trend analysis:

- **Linear regression** on success rate trends over the last 6 hours
- **Momentum analysis** compares early vs late window averages
- **R² filtering** — only acts on statistically significant trends (R² > 0.3)
- **Capacity forecasting** — predicts when endpoints will hit rate limits

### 9. Insights Engine

Generates actionable insights from Cortex data:

- Anomaly pattern analysis
- Performance trend reports
- Endpoint health summaries
- Weekly digest reports

### 10. ML Training

Trains all ML models for each endpoint:

- Adaptive thresholds (EWMA + IQR)
- Anomaly detector (Modified Z-Score + MAD)
- Time series forecaster (Holt-Winters + Linear Regression)
- Bandit models (trained online, not batch)
- Feature recording for analytics

### 11. ML Quality Tracking

Every prediction Cortex makes is tracked:

- **Predicted vs Actual** — compares model predictions with real outcomes
- **Quality Score** — weighted combination of accuracy (60%), low error (25%), stability (15%)
- **Auto-reset** — models with quality below 60% are automatically reset and retrained
- **Dashboard** — real-time quality metrics per endpoint per model type

### 12. Smart Routing

Routes webhook traffic based on endpoint health. When current performance is degraded (SR < 95% or p95 > 5000ms), selects the best fallback URL:

- Scores each fallback URL based on recent delivery success rate (70% weight) and latency (30% weight)
- Records routing decisions for worker to pick up
- Stores alternatives with scores for transparency

### 13. Drift Detection

Detects when an endpoint's behavior changes significantly using three algorithms:

**Page-Hinkley Test**
- Detects sudden distribution shifts
- Monitors cumulative sum of deviations from mean
- Triggers when sum exceeds threshold

**ADWIN (Adaptive Windowing)**
- Detects gradual changes
- Maintains variable-length window
- Detects when window statistics differ significantly

**Kolmogorov-Smirnov Test**
- Detects distribution changes
- Compares recent vs historical data distributions
- Non-parametric — no assumptions about data shape

When drift is detected:
1. Records the event with severity, type (sudden/gradual/incremental/data quality), and affected features
2. Recommends an action (retrain model, adjust thresholds, alert team)
3. Optionally triggers automatic model retraining

### 14. Security Scan

Runs security-focused anomaly analysis on endpoint behavior. Detects patterns that may indicate compromised endpoints or abuse.

### 15. Security Auto-Resolve

Automatically resolves low-severity security events that have been inactive for a configurable period. Prevents security event table from growing unbounded.

### 16. Cleanup Job

Housekeeping tasks:
- Removes expired data beyond retention period
- Cleans up old anomaly scores, predictions, and traces
- Maintains database performance

### 17. A/B Testing

Test different ML model configurations:

- Split traffic between model variants
- Track quality score, accuracy, latency per variant
- Statistical significance testing
- Auto-deploy winning variant

### 18. AutoML

Automated hyperparameter optimization:

- Runs trial configurations for each model type
- Multi-metric evaluation (quality score, success rate, latency)
- Auto-deploys best parameters when significantly better (+5% threshold)
- Trial history with full parameter tracking

### 19. Chaos Engineering

Test your webhook infrastructure resilience:

| Scenario | Description | Severity |
|----------|-------------|----------|
| `endpoint_down` | Simulate endpoint outage | High |
| `redis_down` | Simulate cache failure | Low |
| `database_slow` | Simulate DB latency (500ms+) | Medium |
| `traffic_spike` | 10x traffic surge | Medium |
| `error_burst` | Sudden error spike | High |

Records test results with recovery time, alerts generated, and self-healing effectiveness.

### 20. Explainable AI (XAI)

Makes ML decisions human-readable:

- **Feature contributions** — which factors influenced the decision and by how much
- **Human-readable summary** — plain language explanation
- **Confidence score** — how certain the model is
- **Context** — time window, data points used, baseline comparison

### 21. Distributed Tracing

Full pipeline observability per stage:

- Average duration per stage
- Run count and success rate (last 24h)
- Timeout rate
- Bottleneck identification (slowest stage)
- Overall pipeline success rate

---

## API Endpoints

All Cortex endpoints require **admin authentication**.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/cortex/health` | Cortex system health overview |
| GET | `/v1/cortex/stats` | Hourly delivery stats |
| GET | `/v1/cortex/stats/:id` | Endpoint-specific stats |
| GET | `/v1/cortex/profiles` | Endpoint behavioral profiles |
| GET | `/v1/cortex/profiles/:id` | Single endpoint profile |
| GET | `/v1/cortex/anomalies` | Recent anomaly scores |
| GET | `/v1/cortex/anomalies/high` | High-severity anomalies |
| GET | `/v1/cortex/correlations` | Alert correlations |
| GET | `/v1/cortex/healing/actions` | Healing action history |
| GET | `/v1/cortex/memory` | Action memory (bandit learning) |
| GET | `/v1/cortex/memory/:id/strategy` | Strategy weights per endpoint |
| GET | `/v1/cortex/surge/status` | Recovery surge status |
| GET | `/v1/cortex/predictions` | Failure predictions |
| GET | `/v1/cortex/predictions/capacity/:id` | Capacity forecast |
| GET | `/v1/cortex/insights` | Active insights |
| GET | `/v1/cortex/reports` | Weekly reports |
| GET | `/v1/cortex/routing/decisions` | Smart routing decisions |
| GET | `/v1/cortex/health` | Cortex system health |
| POST | `/v1/cortex/ml/bootstrap` | Seed ML models with synthetic data |
| GET | `/v1/cortex/ml/quality` | ML model quality metrics |
| POST | `/v1/cortex/ml/quality/reset` | Reset degraded models |
| GET | `/v1/cortex/proactive/status` | Proactive healing status |
| GET | `/v1/cortex/drift/events` | Drift detection events |
| GET | `/v1/cortex/drift/:id` | Endpoint-specific drift events |
| GET | `/v1/cortex/models/health/:id` | Model health per endpoint |
| GET | `/v1/cortex/models/platform-summary` | ML model health summary |
| POST | `/v1/cortex/explain/anomaly` | Explain anomaly score |
| POST | `/v1/cortex/explain/prediction` | Explain prediction |
| GET | `/v1/cortex/ab-tests` | A/B test results |
| POST | `/v1/cortex/ab-tests/start` | Start new A/B test |
| GET | `/v1/cortex/ab-tests/:id/results` | A/B test results |
| GET | `/v1/cortex/automl/trials/:id` | AutoML trial history |
| POST | `/v1/cortex/automl/run` | Run AutoML optimization |
| GET | `/v1/cortex/automl/best-params/:id` | Best AutoML parameters |
| GET | `/v1/cortex/tracing/performance` | Pipeline tracing stats |
| GET | `/v1/cortex/tracing/stage/:name` | Stage-specific performance |
| POST | `/v1/cortex/chaos/run` | Run chaos test |
| GET | `/v1/cortex/chaos/scenarios` | Available chaos scenarios |
| GET | `/v1/cortex/chaos/results/:id` | Chaos test results |

---

## ML Models

Cortex maintains these models per endpoint:

| Model | Purpose | Algorithm |
|-------|---------|-----------|
| `adaptive_threshold` | Dynamic anomaly thresholds | EWMA + IQR |
| `anomaly_detector` | Statistical anomaly scoring | Modified Z-Score + MAD + IQR + Multivariate |
| `time_series` | Success rate forecasting | Holt-Winters Exponential Smoothing + Linear Regression |
| `ts_latency` | Latency forecasting | Exponential Smoothing |
| `ts_success_rate` | Success rate time series | Exponential Smoothing |
| `failure_predictor` | Failure probability | Logistic Regression |
| `retry_bandit` | Optimal retry strategy | UCB1 + Epsilon-Greedy |
| `circuit_bandit` | Circuit breaker tuning | UCB1 |
| `contextual_bandit` | Context-aware decisions | Thompson Sampling |
| `healing_bandit` | Best healing strategy | UCB1 |

---

## Scheduler

Cortex runs 15 stages in sequence:

```
 1. HourlyStats         — Aggregate delivery data into hourly summaries
 2. ProfileUpdate       — Update endpoint behavioral profiles
 3. AnomalyScoring      — Score anomalies using ML
 4. AlertCorrelation    — Group related anomalies into root causes
 5. SelfHealing         — Apply healing actions (circuit breaker pattern)
 6. ProactiveHealing    — Detect degradation trends before anomalies
 7. Predictions         — Generate failure predictions
 8. Insights            — Generate actionable insights
 9. MlTraining          — Train/retrain ML models
10. MlQualityCheck      — Check model quality, generate quality records, reset degraded
11. SmartRouting        — Make routing decisions for degraded endpoints
12. DriftDetection      — Detect behavioral drift (Page-Hinkley, ADWIN, KS)
13. SecurityScan        — Security-focused anomaly analysis
14. SecurityAutoResolve — Auto-resolve inactive security events
15. CleanupJob          — Housekeeping: remove expired data
```

Each stage has an advisory lock to prevent concurrent execution.

---

## Dashboard

The Cortex admin dashboard is available at `/admin/cortex` with 10 tabs:

- **Overview** — System health, key metrics
- **Anomalies** — Real-time anomaly feed
- **Healing** — Self-healing action history
- **Predictions** — Failure probability forecasts
- **ML Quality** — Model accuracy and quality scores
- **Proactive** — Proactive healing insights
- **Drift** — Behavioral drift events
- **Monitor** — ML model health summary
- **A/B Tests** — Model variant testing
- **AutoML** — Hyperparameter optimization

---

## Configuration

Cortex behavior is configurable via the `cortex_config` table:

```json
{
  "anomaly_high_threshold": 70,
  "anomaly_default_p95_ms": 5000,
  "anomaly_default_p99_ms": 15000,
  "predictive_failure_threshold": 0.7,
  "predictive_trend_threshold": -0.01,
  "predictive_momentum_threshold": -0.05,
  "healing_max_actions_per_endpoint": 3,
  "healing_cooldown_minutes": 30,
  "alert_correlation_window_mins": 30,
  "alert_correlation_min_count": 3
}
```

---

## Quick Start

1. **Bootstrap ML models** — seed with synthetic data:
   ```bash
   curl -X POST https://your-api.com/v1/cortex/ml/bootstrap \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

2. **Check Cortex health**:
   ```bash
   curl https://your-api.com/v1/cortex/health \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. **View anomalies**:
   ```bash
   curl https://your-api.com/v1/cortex/anomalies \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```
