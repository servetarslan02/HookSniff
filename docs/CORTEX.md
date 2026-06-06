# Cortex AI — Intelligent Webhook Infrastructure

Cortex is HookSniff's built-in machine learning engine. It analyzes your webhook traffic in real-time, detects anomalies before they become incidents, and automatically heals degraded endpoints.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cortex Scheduler                      │
│  (11 stages, runs every cycle)                          │
├─────────┬─────────┬─────────┬─────────┬─────────┬──────┤
│ Signal  │ Profile │ Anomaly │ Healing │Predictive│ ML   │
│Collect  │ Engine  │ Scorer  │ Engine  │ Engine   │Train │
├─────────┼─────────┼─────────┼─────────┼─────────┼──────┤
│ Smart   │ Drift   │ Insight │ Proactive│ ML Quality│    │
│Routing  │ Detect  │ Engine  │ Healing │ Check    │      │
└─────────┴─────────┴─────────┴─────────┴─────────┴──────┘
         │                    │                    │
    PostgreSQL           Redis Cache          ml_models
```

Cortex runs as a background scheduler with 11 stages. Each stage processes data independently and shares results through PostgreSQL.

---

## Features

### 1. Anomaly Detection

Cortex uses two complementary methods to detect anomalies:

**Adaptive Thresholds (EWMA + IQR)**
- Each endpoint learns its own "normal" using Exponentially Weighted Moving Average
- IQR (Interquartile Range) identifies outliers without fixed thresholds
- Adapts to traffic patterns: business hours, weekends, seasonal spikes

**Statistical Detection (Modified Z-Score + Mahalanobis)**
- Modified Z-Score uses median absolute deviation — robust against outliers
- Mahalanobis distance detects multi-variate anomalies (success rate + latency + volume)
- Confidence scoring based on training sample size

```json
// Anomaly score response
{
  "score": 72,
  "category": "high",
  "factors": {
    "adaptive_threshold": { "score": 65, "reason": "success_rate_drop" },
    "statistical_detection": { "score": 79, "methods": ["z_score", "mahalanobis"] },
    "ml_confidence": 0.85,
    "ml_samples": 219
  },
  "method": "ml"
}
```

### 2. Predictive Engine

Predicts failures before they happen using trend analysis:

- **Linear regression** on success rate trends over the last 6 hours
- **Momentum analysis** compares early vs late window averages
- **R² filtering** — only acts on statistically significant trends (R² > 0.3)
- **Capacity forecasting** — predicts when endpoints will hit rate limits

```
⚠️ Predictive: endpoint abc123 has 73% failure probability
```

### 3. Self-Healing

When Cortex detects degradation, it automatically applies recovery strategies:

| Strategy | Action | When |
|----------|--------|------|
| `auto_disable` | Temporarily disable endpoint | Critical failures |
| `circuit_tighten` | Reduce circuit breaker threshold | Intermittent failures |
| `retry_slowdown` | Increase retry backoff | Timeout-heavy endpoints |
| `rate_limit_reduce` | Lower rate limit | Overloaded endpoints |
| `fallback_url_switch` | Switch to backup URL | Primary URL down |
| `retry_increase` | Add more retry attempts | Transient errors |
| `timeout_adjust` | Adjust request timeout | Latency issues |

**UCB1 Bandit** learns which strategy works best for each endpoint. 20% exploration rate ensures new strategies are tried.

### 4. Smart Routing

Routes webhook traffic based on endpoint health:

- **Round-robin** — distribute evenly
- **Failover** — primary → backup → tertiary
- **Weighted** — based on success rate and latency
- **Random** — with health-based weighting

Routing decisions are stored and can be reviewed via API:
```
GET /v1/cortex/routing/decisions
```

### 5. Drift Detection

Detects behavioral changes in endpoints:

- **Feature drift** — response format, status codes, latency patterns
- **Concept drift** — relationship between metrics changes
- **Data drift** — traffic volume or pattern shifts

When drift is detected, Cortex:
1. Records the event with severity and affected features
2. Recommends an action (retrain model, adjust thresholds, alert team)
3. Optionally triggers automatic model retraining

### 6. ML Quality Tracking

Every prediction Cortex makes is tracked:

- **Predicted vs Actual** — compares model predictions with real outcomes
- **Quality Score** — weighted combination of accuracy (60%), low error (25%), stability (15%)
- **Auto-reset** — models with quality below 60% are automatically reset and retrained
- **Dashboard** — real-time quality metrics per endpoint per model type

### 7. Proactive Healing

Goes beyond reactive healing — detects degradation trends before anomaly thresholds:

- **Latency trend detection** — catches gradual slowdowns
- **Rate limit exhaustion prediction** — warns before limits are hit
- **Success rate erosion** — detects slow quality decline
- Generates proactive insights (not reactive alerts)

### 8. A/B Testing

Test different ML model configurations:

- Split traffic between model variants
- Track quality score, accuracy, latency per variant
- Statistical significance testing
- Auto-deploy winning variant

### 9. AutoML

Automated hyperparameter optimization:

- Runs trial configurations for each model type
- Multi-metric evaluation (quality score, success rate, latency)
- Auto-deploys best parameters when significantly better (+5% threshold)
- Trial history with full parameter tracking

### 10. Chaos Engineering

Test your webhook infrastructure resilience:

| Scenario | Description | Severity |
|----------|-------------|----------|
| `endpoint_down` | Simulate endpoint outage | High |
| `redis_down` | Simulate cache failure | Low |
| `database_slow` | Simulate DB latency (500ms+) | Medium |
| `traffic_spike` | 10x traffic surge | Medium |
| `error_burst` | Sudden error spike | High |

Records test results with recovery time, alerts generated, and self-healing effectiveness.

### 11. Distributed Tracing

Full pipeline observability:

```
Stage              Avg Duration   Runs/24h   Success Rate
─────────────────────────────────────────────────────────
hourly_stats       12ms           1,440      99.9%
profile_update     8ms            1,440      99.8%
anomaly_scoring    45ms           1,440      99.7%
self_healing       23ms           1,440      99.9%
predictions        67ms           1,440      99.5%
ml_training        340ms          24         100%
drift_detection    89ms           1,440      99.8%
smart_routing      15ms           1,440      99.9%
insights           120ms          1,440      99.6%
```

---

## API Endpoints

All Cortex endpoints require **admin authentication**.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/cortex/health` | Cortex system health overview |
| GET | `/v1/cortex/stats` | Hourly delivery stats |
| GET | `/v1/cortex/anomalies` | Recent anomaly scores |
| GET | `/v1/cortex/anomalies/high` | High-severity anomalies |
| GET | `/v1/cortex/predictions` | Failure predictions |
| GET | `/v1/cortex/insights` | Active insights |
| GET | `/v1/cortex/healing/actions` | Healing action history |
| GET | `/v1/cortex/memory` | Action memory (bandit learning) |
| GET | `/v1/cortex/routing/decisions` | Smart routing decisions |
| GET | `/v1/cortex/proactive/status` | Proactive healing status |
| GET | `/v1/cortex/drift/events` | Drift detection events |
| GET | `/v1/cortex/models/platform-summary` | ML model health summary |
| POST | `/v1/cortex/ml/bootstrap` | Seed ML models with synthetic data |
| GET | `/v1/cortex/ml/quality` | ML model quality metrics |
| POST | `/v1/cortex/ml/quality/reset` | Reset degraded models |
| GET | `/v1/cortex/ab-tests` | A/B test results |
| POST | `/v1/cortex/ab-tests/start` | Start new A/B test |
| GET | `/v1/cortex/automl/trials/:id` | AutoML trial history |
| POST | `/v1/cortex/automl/run` | Run AutoML optimization |
| GET | `/v1/cortex/tracing/performance` | Pipeline tracing stats |
| POST | `/v1/cortex/chaos/run` | Run chaos test |
| GET | `/v1/cortex/chaos/scenarios` | Available chaos scenarios |

---

## ML Models

Cortex maintains these models per endpoint:

| Model | Purpose | Algorithm |
|-------|---------|-----------|
| `adaptive_threshold` | Dynamic anomaly thresholds | EWMA + IQR |
| `anomaly_detector` | Statistical anomaly scoring | Modified Z-Score + Mahalanobis |
| `time_series` | Success rate forecasting | Exponential Smoothing + Linear Regression |
| `ts_latency` | Latency forecasting | Exponential Smoothing |
| `ts_success_rate` | Success rate time series | Exponential Smoothing |
| `failure_predictor` | Failure probability | Logistic Regression |
| `volume_forecaster` | Traffic volume prediction | Linear Regression |
| `latency_predictor` | Latency prediction | Linear Regression |
| `retry_bandit` | Optimal retry strategy | UCB1 + Epsilon-Greedy |
| `circuit_bandit` | Circuit breaker tuning | UCB1 |
| `contextual_bandit` | Context-aware decisions | Thompson Sampling |
| `healing_bandit` | Best healing strategy | UCB1 |
| `throttle_bandit` | Rate limit optimization | UCB1 |
| `drift_detector` | Behavioral drift | Statistical Tests |

---

## Scheduler

Cortex runs 11 stages in sequence:

```
1. SignalCollector    — Gather raw metrics from deliveries
2. ProfileEngine     — Update endpoint profiles
3. AnomalyScorer     — Score anomalies using ML
4. SelfHealing       — Apply healing actions
5. ProactiveHealing  — Detect degradation trends
6. Predictions       — Generate failure predictions
7. InsightsEngine    — Generate actionable insights
8. MlTraining        — Train/retrain ML models
9. MlQualityCheck    — Check model quality, reset degraded
10. SmartRouting      — Make routing decisions
11. DriftDetection   — Detect behavioral drift
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
  "healing_cooldown_minutes": 30
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
