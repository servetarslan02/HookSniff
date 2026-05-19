# 🏗️ HookSniff Cortex — Mimari Tasarım

> Oluşturma: 2026-05-20

---

## Genel Mimari

```
╔══════════════════════════════════════════════════════════════╗
║              HOOKSNIFF CORTEX — AKIL MOTORU                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │           KAPALI DÖNGÜ (Closed Feedback Loop)         │   ║
║  │                                                        │   ║
║  │   ┌─────────┐   ┌─────────┐   ┌─────────┐           │   ║
║  │   │ GÖZLE   │──▶│ KARAR   │──▶│ UYGULA  │           │   ║
║  │   │ (Watch) │   │ (Decide)│   │ (Act)   │           │   ║
║  │   └─────────┘   └─────────┘   └────┬────┘           │   ║
║  │        ▲                            │                 │   ║
║  │        │         ┌─────────┐        │                 │   ║
║  │        └─────────│ ÖLÇ     │◀───────┘                 │   ║
║  │                  │ (Measure)│                          │   ║
║  │                  └─────────┘                          │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                              ║
║  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ ║
║  │ SIGNAL     │ │ PROFILE    │ │ PREDICT    │ │ HEAL     │ ║
║  │ COLLECTOR  │ │ ENGINE     │ │ ENGINE     │ │ ENGINE   │ ║
║  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └────┬─────┘ ║
║        │              │              │              │        ║
║  ┌─────┴──────────────┴──────────────┴──────────────┴─────┐ ║
║  │              PostgreSQL + Redis (Shared State)          │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │              INSIGHTS ENGINE                              │ ║
║  │  • Haftalık rapor • Customer health • Recommendations   │ ║
║  └─────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 7 Katman

### KATMAN 1: Signal Collector

Her webhook teslimatından 12 sinyal toplar:

```sql
CREATE TABLE delivery_signals (
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
    queue_depth INT,
    concurrent_deliveries INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_signals_endpoint_time ON delivery_signals(endpoint_id, created_at DESC);
```

**Safe Mode:** Her delivery yerine her 10. delivery (sampling)
**Storage:** 100K delivery/gün → 10K satır → ~2 MB/gün

---

### KATMAN 2: Profile Engine

Her endpoint için son 7 günlük veriden "davranış profili":

```sql
CREATE TABLE endpoint_profiles (
    endpoint_id UUID PRIMARY KEY,
    latency_p50 INT,
    latency_p95 INT,
    latency_p99 INT,
    latency_stddev FLOAT,
    success_rate_1h FLOAT,
    success_rate_24h FLOAT,
    success_rate_7d FLOAT,
    baseline_success_rate FLOAT,
    avg_deliveries_per_hour FLOAT,
    peak_deliveries_per_hour FLOAT,
    traffic_pattern JSONB,
    dominant_error_type VARCHAR(30),
    error_distribution JSONB,
    busiest_hour INT,
    quietest_hour INT,
    weekday_avg FLOAT,
    weekend_avg FLOAT,
    sample_size INT,
    confidence FLOAT,
    last_updated TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Güncelleme:** Her 15-30 dakikada bir (trafik yoğunluğuna göre)

---

### KATMAN 3: Predictive Engine

Failure prediction + capacity forecast:

```sql
CREATE TABLE failure_predictions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    predicted_failure_probability FLOAT,
    predicted_failure_time TIMESTAMPTZ,
    confidence FLOAT,
    signals JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Algoritma:**
```
probability = (trend_score * 0.4) + (seasonal_score * 0.3) + (error_momentum * 0.3)

trend_score = success_rate_slope negatifse 1.0, pozitifse 0.0
seasonal_score = bu saatteki historical failure rate
error_momentum = son 3 saatteki error artış hızı
```

---

### KATMAN 4: Self-Healing Engine

Otomatik iyileştirme aksiyonları:

```sql
CREATE TABLE healing_actions (
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
```

**Kurallar:**

| Durum | Aksiyon | Geri Alma |
|-------|---------|-----------|
| 5 gün %0 success | auto_disable + email | 7 gün sonra test delivery |
| Success %50 altı (1 saat) | throttle_increase | %90'a çıkınca |
| Latency p95 2x arttı | retry_adjust | Normale dönünce |
| 10+ endpoint aynı anda fail | cascade_alert | Durum düzelince |
| 30 gün hiç trafik | idle_notify | - |

---

### KATMAN 5: Anomaly Scorer

Her olaya 0-100 anomali skoru:

```sql
CREATE TABLE anomaly_scores (
    id BIGSERIAL PRIMARY KEY,
    delivery_id UUID NOT NULL,
    endpoint_id UUID NOT NULL,
    score INT NOT NULL,
    factors JSONB,
    category VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Skor hesaplama:**
```
score = 0
if latency > p99 * 2: score += 30
if error_type != dominant_error: score += 20
if traffic > peak * 1.5: score += 25
if quiet_hour && traffic > avg * 3: score += 15
if attempt_number > 3: score += 10
```

---

### KATMAN 6: Insights Engine

Haftalık rapor + customer health + recommendations:

```sql
CREATE TABLE weekly_reports (
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

CREATE TABLE customer_health (
    customer_id UUID PRIMARY KEY,
    integration_score INT,
    engagement_score INT,
    growth_score INT,
    stability_score INT,
    health_score INT,
    health_grade VARCHAR(2),
    churn_risk FLOAT,
    upgrade_probability FLOAT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE recommendations (
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
```

---

### KATMAN 7: Smart Routing

Akıllı URL seçimi (fallback URL varsa):

```sql
CREATE TABLE routing_decisions (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    chosen_url VARCHAR(2048) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    alternatives JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Algoritma:**
```
score = (success_rate * 0.6) + (1 - latency_normalized * 0.3) + (freshness * 0.1)
```

---

## Background Job Zamanlaması

```
Her 1 dakika:   Signal Collector (sampling modunda)
Her 5 dakika:   Anomaly Scorer
Her 15 dakika:  Profile Engine güncelleme
Her 15 dakika:  Predictive Engine
Her 15 dakika:  Self-Healing kuralları kontrol
Her 1 saat:     Smart Routing skorları
Her gün 02:00:  Customer Health güncelleme
Her Pazartesi:  Weekly Report oluştur + email
```

---

## Kaynak Kullanımı (Safe Mode)

| Bileşen | Neon (0.5 GB) | Redis (10K cmd/gün) | Cloud Run (2M istek/ay) |
|---------|---------------|--------------------|-----------------------|
| Signal Collector | +2 MB/hafta | 0 | +30K/hafta |
| Profile Engine | +100 KB/hafta | 0 | +1K/hafta |
| Anomaly Scorer | +1 MB/hafta | 0 | +5K/hafta |
| Predictive | +50 KB/hafta | 0 | +500/hafta |
| Self-Healing | +20 KB/hafta | 0 | +100/hafta |
| Insights | +200 KB/hafta | 0 | +200/hafta |
| **TOPLAM** | **~3.5 MB/hafta** | **0** | **~37K/hafta** |

**0.5 GB Neon → ~140 hafta (3+ yıl) dayanır** ✅
