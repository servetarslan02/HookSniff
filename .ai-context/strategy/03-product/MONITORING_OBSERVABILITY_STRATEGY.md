# HookSniff — Monitoring ve Observability Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulandı)
> Durum: Taslak
> Kaynaklar: APM Digest Alerting Best Practices 2026, Grafana Docs, OpenTelemetry Docs, HookSniff telemetry.rs (314 OTEL referansı)

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Observability Nedir?](#2-observability-nedir)
3. [Three Pillars: Logs, Metrics, Traces](#3-three-pillars-logs-metrics-traces)
4. [Alert Stratejisi](#4-alert-stratejisi)
5. [Dashboard Stratejisi](#5-dashboard-stratejisi)
6. [SLO ve Error Budget](#6-slo-ve-error-budget)
7. [Runbook'lar](#7-runbooklar)
8. [Mevcut OTEL Entegrasyonu Analizi](#8-mevcut-otel-entegrasyonu-analizi)
9. [Grafana Cloud Kullanımı](#9-grafana-cloud-kullanımı)
10. [Maliyet Optimizasyonu](#10-maliyet-optimizasyonu)
11. [Uygulama Planı](#11-uygulama-planı)
12. [Metrikler](#12-metrikler)
13. [Kaynaklar](#13-kaynaklar)

---

## 1. Mevcut Durum

### 1.1 HookSniff Monitoring Envanteri

| Bileşen | Teknoloji | Durum | Not |
|---------|-----------|-------|-----|
| Distributed tracing | OpenTelemetry (OTLP) | ✅ Aktif | 314 referans kodda |
| Structured logging | tracing + tracing-subscriber | ✅ Aktif | JSON format (production) |
| Health check | /health + /v1/status | ✅ Aktif | 2 endpoint |
| Prometheus metrics | /metrics endpoint | ✅ Aktif | Custom metrics |
| Grafana Cloud | OTEL exporter | ✅ Aktif | Free tier |
| Alert rules | ? | ⚠️ Bilinmiyor | Kurulmuş mu? |
| On-call rotation | ❌ Yok | ❌ | Tek kişi (Servet) |
| Incident management | ❌ Yok | ❌ | Prosedür yok |
| Log aggregation | Grafana Cloud | ✅ Aktif | Free tier limit |
| Uptime monitoring | ? | ⚠️ Bilinmiyor | Harici kontrol gerekli |

### 1.2 Kod Bazlı Monitoring Analizi

#### telemetry.rs — OTEL Bootstrap

```rust
// Mevcut: api/src/telemetry.rs
// OTEL_ENABLED=true → OTLP exporter aktif
// OTEL_EXPORTER_OTLP_ENDPOINT → Grafana Cloud
// OTEL_EXPORTER_OTLP_HEADERS → Auth token
// Graceful fallback: OTEL başarısız olursa plain logging
```

**Güçlü yönler:**
- ✅ Graceful fallback (OTEL çökse bile logging çalışır)
- ✅ Structured JSON logging (production)
- ✅ Environment-based config (APP_ENV, LOG_FORMAT)
- ✅ OTLP HTTP exporter (standard)

**Zayıf yönler:**
- ⚠️ Alert rule'lar dokümante edilmemiş
- ⚠️ Grafana dashboard'ları export edilmemiş
- ⚠️ Log retention policy belirsiz
- ⚠️ Trace sampling rate belirsiz

### 1.3 Monitoring Coverage Haritası

| Katman | Metrics | Traces | Logs | Alert |
|--------|---------|--------|------|-------|
| API (Rust Axum) | ✅ | ✅ | ✅ | ⚠️ |
| Worker (Rust) | ✅ | ✅ | ✅ | ⚠️ |
| Dashboard (Next.js) | ❌ | ❌ | ✅ | ❌ |
| PostgreSQL (Neon) | ⚠️ | ❌ | ✅ | ⚠️ |
| Redis (Upstash) | ⚠️ | ❌ | ❌ | ❌ |
| Cloudflare | ❌ | ❌ | ✅ | ❌ |
| External deps | ❌ | ❌ | ❌ | ❌ |

---

## 2. Observability Nedir?

> Kaynak: APM Digest — "APM Alerting Best Practices That Actually Work in 2026" (2026-03-23, doğrulanmış)

### 2.1 Monitoring vs Observability

| Kavram | Tanım | HookSniff |
|--------|-------|-----------|
| **Monitoring** | "Ne oldu?" — Bilinen sorunları tespit et | ✅ Health check, metrics |
| **Observability** | "Neden oldu?" — Bilinmeyen sorunları anlamak | ⚠️ Kısmen (traces var) |

### 2.2 Three Pillars

```
         ┌─────────────┐
         │ Observability│
         └──────┬──────┘
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
 ┌──────┐  ┌────────┐  ┌───────┐
 │ Logs │  │ Metrics│  │ Traces│
 │"Ne   │  │"Ne     │  │"Neden │
 │oldu?"│  │kadar?" │  │oldu?" │
 └──────┘  └────────┘  └───────┘
```

### 2.3 KPI-Driven Alerting (2026 Trendi)

> "2026'da CPU kullanımı gibi ham teknik metrikler üzerine alert kurmak ikincil sağlık kontrolüdür. Asıl alert, UX ve iş KPI'larına bağlı olmalıdır." — APM Digest

**HookSniff için KPI'lar:**

| KPI | Tanım | Eşik |
|-----|-------|------|
| Webhook delivery success rate | Başarılı teslimat oranı | ≥ %99.5 |
| Webhook delivery latency (p95) | Teslimat gecikmesi | ≤ 500ms |
| API error rate | 5xx hata oranı | ≤ %0.1 |
| Time to first delivery | İlk teslimat süresi | ≤ 2sn |
| Dead letter queue depth | Başarısız teslimat kuyruğu | ≤ 10 |

---

## 3. Three Pillars: Logs, Metrics, Traces

### 3.1 Logs

#### Mevcut Durum

```rust
// api/src/telemetry.rs
// Production: JSON format
// Development: Pretty print
// Filter: RUST_LOG env var
```

#### Log Strategy

| Log Level | Kullanım | Örnek |
|-----------|----------|-------|
| `ERROR` | Kritik hatalar, insan müdahalesi gerekli | DB bağlantı hatası, OTEL export başarısız |
| `WARN` | Potansiyel sorunlar, dikkat gerekli | Rate limit yaklaşıyor, retry ediliyor |
| `INFO` | Normal operasyon olayları | Webhook teslim edildi, kullanıcı giriş yaptı |
| `DEBUG` | Detaylı bilgi, development | Request/response body, cache hit/miss |
| `TRACE` | Çok detaylı, performans analizi | Her SQL sorgusu, her HTTP header |

#### Log Format (Production)

```json
{
  "timestamp": "2026-05-10T02:55:00.000Z",
  "level": "INFO",
  "target": "hooksniff::routes::webhooks",
  "message": "Webhook delivered successfully",
  "span": {
    "trace_id": "abc123",
    "span_id": "def456"
  },
  "fields": {
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "latency_ms": 145,
    "status_code": 200,
    "attempt": 1
  }
}
```

### 3.2 Metrics

#### Mevcut Prometheus Metrics

| Metric | Tipi | Açıklama |
|--------|------|----------|
| `http_requests_total` | Counter | Toplam HTTP istekleri |
| `http_request_duration_seconds` | Histogram | İstek süresi |
| `webhook_deliveries_total` | Counter | Toplam webhook teslimatları |
| `webhook_delivery_duration_seconds` | Histogram | Teslimat süresi |
| `webhook_delivery_failures_total` | Counter | Başarısız teslimatlar |
| `db_pool_connections` | Gauge | DB bağlantı havuzu |
| `redis_operations_total` | Counter | Redis operasyonları |
| `rate_limit_hits_total` | Counter | Rate limit tetiklenmeleri |

#### Eklenmesi Gereken Metrics

| Metric | Tipi | Açıklama | Öncelik |
|--------|------|----------|---------|
| `webhook_queue_depth` | Gauge | Kuyrukta bekleyen webhook sayısı | 🔴 |
| `endpoint_health_status` | Gauge | Endpoint sağlık durumu (0/1) | 🔴 |
| `circuit_breaker_state` | Gauge | Circuit breaker durumu (0=closed, 1=open) | 🟡 |
| `active_api_keys` | Gauge | Aktif API key sayısı | 🟡 |
| `billing_plan_distribution` | Gauge | Plan dağılımı (free/pro/business) | 🟢 |
| `inbound_webhooks_total` | Counter | Gelen webhook sayısı | 🟡 |

### 3.3 Traces

#### Mevcut Durum

OpenTelemetry tracing aktif. Her istek için:
- Trace ID (global unique)
- Span ID (her operasyon)
- Parent span (çağırıcı)
- Attributes (endpoint_id, event, user_id, vb.)

#### Trace Strategy

```
Incoming Request
│
├── HTTP Request Span
│   ├── Authentication Span
│   │   ├── JWT Validation
│   │   └── API Key Lookup
│   ├── Rate Limiting Span
│   │   └── Redis Check
│   ├── Webhook Processing Span
│   │   ├── Payload Validation
│   │   ├── Schema Validation
│   │   ├── HMAC Signing
│   │   └── Queue Insert
│   └── Response Span
│
└── Background Worker Span (async)
    ├── Delivery Attempt Span
    │   ├── HTTP Client Span
    │   └── Response Processing
    ├── Retry Logic Span
    └── Dead Letter Span (if failed)
```

#### Sampling Strategy

| Ortam | Sampling Rate | Gerekçe |
|-------|--------------|---------|
| Development | %100 | Her şeyi gör |
| Staging | %100 | Test amaçlı |
| Production (normal) | %10 | Maliyet kontrolü |
| Production (hata) | %100 | Hataları kaçırma |
| Production (yavaş) | %100 | Latency sorunlarını tespit et |

```rust
// Tail-based sampling önerisi
let sampler = opentelemetry_sdk::trace::Sampler::ParentBased(
    Box::new(opentelemetry_sdk::trace::TraceIdRatioBased::new(0.1)),
);
```

---

## 4. Alert Stratejisi

> Kaynak: APM Digest 2026 — "KPI-driven alerting", "3-level escalation", "SLO-based alerting"

### 4.1 Alert Seviyeleri

| Seviye | Kriter | Kanal | Yanıt Süresi |
|--------|--------|-------|-------------|
| **P1 — Critical** | Full outage, veri kaybı | SMS + Discord + Email | 5 dk |
| **P2 — High** | Tek servis kesinti | Discord + Email | 15 dk |
| **P3 — Medium** | Performans degradation | Discord | 30 dk |
| **P4 — Low** | Kapasite uyarısı | Email | 1 saat |

### 4.2 Alert Kuralları

#### P1 — Critical Alerts

| Alert | Koşul | Runbook |
|-------|-------|---------|
| API Down | Health check 3x başarısız (1 dk) | RB-001 |
| Database Unreachable | DB bağlantı hatası 5x (2 dk) | RB-002 |
| Webhook Delivery Halted | 0 teslimat 10 dk (normalde dk'da onlarca) | RB-003 |
| Error Rate Spike | 5xx oranı %5'i aştı (5 dk) | RB-004 |

#### P2 — High Alerts

| Alert | Koşul | Runbook |
|-------|-------|---------|
| High Latency (p95) | > 2sn (10 dk) | RB-005 |
| Dead Letter Queue Growing | > 50 item (15 dk) | RB-006 |
| Redis Connection Lost | Bağlantı hatası 3x | RB-007 |
| Disk Space Low | > %90 (Neon storage) | RB-008 |

#### P3 — Medium Alerts

| Alert | Koşul | Runbook |
|-------|-------|---------|
| Rate Limit Approaching | %80 quota kullanıldı | RB-009 |
| Slow Queries | p95 > 500ms (15 dk) | RB-010 |
| High Memory Usage | > %80 (Cloud Run) | RB-011 |
| OTEL Export Failures | > 10 başarısız (5 dk) | RB-012 |

#### P4 — Low Alerts

| Alert | Koşul | Runbook |
|-------|-------|---------|
| New Error Pattern | Bilinmeyen error code | RB-013 |
| Certificate Expiry | < 30 gün | RB-014 |
| Dependency Update | Güvenlik açığı | RB-015 |

### 4.3 Grafana Alert Rule Örnekleri

```yaml
# Grafana Alert Rule — API Down
apiVersion: 1
groups:
  - orgId: 1
    name: hooksniff-critical
    folder: HookSniff
    interval: 1m
    rules:
      - uid: api-down
        title: "API Down"
        condition: A
        data:
          - refId: A
            datasourceUid: prometheus
            model:
              expr: up{job="hooksniff-api"} == 0
              for: 1m
        noDataState: Alerting
        execErrState: Alerting
        annotations:
          summary: "HookSniff API is down"
          runbook_url: "https://hooksniff.vercel.app/docs/runbooks/RB-001"
```

### 4.4 Alert Routing

```
Alert tetiklendi
       │
       ▼
  ┌─────────────┐
  │ Severity?   │
  └──────┬──────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
   P1        P2       P3       P4
    │         │        │        │
    ▼         ▼        ▼        ▼
 SMS+Disc  Discord  Discord   Email
 +Email    +Email
    │         │        │        │
    ▼         ▼        ▼        ▼
 5 dk      15 dk    30 dk    1 saat
```

---

## 5. Dashboard Stratejisi

### 5.1 Grafana Dashboard Planı

#### Dashboard 1: Executive Overview

```
┌──────────────────────────────────────────────┐
│  Webhook Delivery Success Rate    [99.7% ✅]  │
│  ████████████████████████████████░░ 99.7%    │
├──────────────┬──────────────┬────────────────┤
│ Total Sent   │ Failed       │ Avg Latency    │
│    12,450    │     37       │    145ms        │
├──────────────┴──────────────┴────────────────┤
│  [24h Success Rate Graph]                    │
│  ▁▂▃▄▅▆▇█▇█▇█▇█▇█▇█▇█▇█▇█▇█               │
├──────────────────────────────────────────────┤
│  [Top 5 Failing Endpoints]                   │
│  1. api.shopify.com/webhook  — 12 failures   │
│  2. app.stripe.com/hook     — 8 failures     │
└──────────────────────────────────────────────┘
```

#### Dashboard 2: API Performance

```
┌──────────────┬──────────────┬────────────────┐
│ Request Rate │ Error Rate   │ p95 Latency    │
│  450 req/min │  0.1%        │  180ms         │
├──────────────┴──────────────┴────────────────┤
│  [Request Rate — 24h]                        │
│  [Error Rate — 24h]                          │
│  [Latency Distribution — histogram]          │
├──────────────────────────────────────────────┤
│  [Top Endpoints by Traffic]                  │
│  [Slowest Endpoints]                         │
└──────────────────────────────────────────────┘
```

#### Dashboard 3: Infrastructure

```
┌──────────────┬──────────────┬────────────────┐
│ DB Pool      │ Redis Ops    │ CPU Usage      │
│  8/20 active │  1.2K/min    │  45%           │
├──────────────┴──────────────┴────────────────┤
│  [DB Connection Pool — 24h]                  │
│  [Redis Operations — 24h]                    │
│  [Memory Usage — 24h]                        │
│  [Queue Depth — 24h]                         │
└──────────────────────────────────────────────┘
```

#### Dashboard 4: Business Metrics

```
┌──────────────┬──────────────┬────────────────┐
│ Active Users │ Webhooks/Day │ Revenue        │
│     45       │   12,450     │  $290          │
├──────────────┴──────────────┴────────────────┤
│  [Plan Distribution — pie chart]             │
│  [Webhook Volume — 30d trend]                │
│  [Top Events — bar chart]                    │
│  [Geographic Distribution — map]             │
└──────────────────────────────────────────────┘
```

### 5.2 Dashboard Oluşturma Planı

| Dashboard | Priority | Süre | Durum |
|-----------|----------|------|-------|
| Executive Overview | 🔴 Yüksek | 2 saat | ❌ |
| API Performance | 🔴 Yüksek | 2 saat | ❌ |
| Infrastructure | 🟡 Orta | 1 saat | ❌ |
| Business Metrics | 🟡 Orta | 1 saat | ❌ |
| Alert History | 🟢 Düşük | 30 dk | ❌ |

---

## 6. SLO ve Error Budget

### 6.1 SLO Tanımları

> Kaynak: APM Digest 2026 — "Error Budget Burn Rates", "SLO-based alerting"

| SLO | Hedef | Error Budget (aylık) | Burn Rate Alert |
|-----|-------|---------------------|-----------------|
| API Uptime | %99.9 | 43 dk/ay | %2/yıl → P1 |
| Webhook Delivery | %99.5 | 3.6 saat/ay | %5/yıl → P1 |
| API Latency (p95) | ≤ 500ms | %1 slow requests | %10/yıl → P2 |
| Dashboard Uptime | %99.5 | 3.6 saat/ay | %5/yıl → P2 |

### 6.2 Fast-Burn vs Slow-Burn

```
Error Budget Burn Rate

Fast-burn (P1):  Hızlı tükenme — tüm aylık bütçe saatler içinde bitecek
                 → Acil müdahale, tüm ekip

Slow-burn (P2):  Yavaş tükenme — bütçe 20 günde bitecek
                 → Proaktif fix, normal iş akışı
```

### 6.3 SLO as Code

```yaml
# slo.yaml — SLO tanımları (Git'te versioned)
slos:
  - name: api-uptime
    target: 0.999
    window: 30d
    metric: up{job="hooksniff-api"}
    
  - name: webhook-delivery
    target: 0.995
    window: 30d
    metric: webhook_delivery_success_rate
    
  - name: api-latency-p95
    target: 0.99  # %99 istek ≤ 500ms
    window: 30d
    metric: http_request_duration_seconds{quantile="0.95"}
    threshold: 0.5
```

---

## 7. Runbook'lar

### 7.1 Runbook Template

```markdown
# Runbook: [TITLE]

## Alert
- **Name:** [Alert name]
- **Severity:** P[1-4]
- **Condition:** [When it fires]

## Impact
- **Users affected:** [Who]
- **Services affected:** [What]
- **Revenue impact:** [How much]

## Diagnosis
1. Check [dashboard link]
2. Run [diagnostic command]
3. Look for [pattern]

## Mitigation
1. [Immediate action]
2. [Short-term fix]
3. [Long-term fix]

## Escalation
- If not resolved in [X] minutes → escalate to [person/service]

## Post-Incident
- [ ] Update status page
- [ ] Notify affected users
- [ ] Write post-mortem
```

### 7.2 Runbook Listesi

| ID | Başlık | Alert | Öncelik |
|----|--------|-------|---------|
| RB-001 | API Down | P1 | 🔴 |
| RB-002 | Database Unreachable | P1 | 🔴 |
| RB-003 | Webhook Delivery Halted | P1 | 🔴 |
| RB-004 | Error Rate Spike | P1 | 🔴 |
| RB-005 | High Latency | P2 | 🟡 |
| RB-006 | Dead Letter Queue Growing | P2 | 🟡 |
| RB-007 | Redis Connection Lost | P2 | 🟡 |
| RB-008 | Disk Space Low | P2 | 🟡 |
| RB-009 | Rate Limit Approaching | P3 | 🟢 |
| RB-010 | Slow Queries | P3 | 🟢 |
| RB-011 | High Memory Usage | P3 | 🟢 |
| RB-012 | OTEL Export Failures | P3 | 🟢 |
| RB-013 | New Error Pattern | P4 | 🟢 |
| RB-014 | Certificate Expiry | P4 | 🟢 |
| RB-015 | Dependency Vulnerability | P4 | 🟢 |

### 7.3 Örnek Runbook — RB-001: API Down

```markdown
# RB-001: API Down

## Alert
- Name: API Down
- Severity: P1
- Condition: Health check fails 3 times in 1 minute

## Impact
- Users: ALL — no webhooks can be sent
- Services: API, all dependent services
- Revenue: Critical — every minute of downtime = lost customer trust

## Diagnosis
1. Check Grafana: https://grafana.com/d/hooksniff-api
2. Run: curl https://hooksniff-api-*.run.app/health
3. Check Cloud Run logs: gcloud run services logs read hooksniff-api
4. Check Neon status: https://status.neon.tech

## Mitigation
1. Cloud Run: gcloud run services update-traffic hooksniff-api --to-revisions=LATEST=100
2. If region issue: redeploy to different region
3. If code issue: git rollback + redeploy
4. If DB issue: check Neon status, switch to backup if needed

## Escalation
- Not resolved in 15 min → notify Servet via Discord
- Not resolved in 30 min → check all infrastructure

## Post-Incident
- [ ] Update status page
- [ ] Notify affected users
- [ ] Write post-mortem
```

---

## 8. Mevcut OTEL Entegrasyonu Analizi

### 8.1 Kod İncelemesi

`api/src/telemetry.rs` dosyası incelendi:

| Özellik | Durum | Not |
|---------|-------|-----|
| OTLP HTTP exporter | ✅ | `opentelemetry_otlp::new_exporter().http()` |
| Graceful fallback | ✅ | OTEL başarısız olursa plain logging |
| Environment-based config | ✅ | APP_ENV, LOG_FORMAT |
| Header injection | ✅ | OTEL_EXPORTER_OTLP_HEADERS |
| Tracing subscriber | ✅ | `tracing_subscriber::Registry` |
| JSON format (prod) | ✅ | `use_json = env == "production"` |
| Log level filter | ✅ | `RUST_LOG` env var |

### 8.2 Eksik OTEL Özellikleri

| Özellik | Durum | Öncelik | Not |
|---------|-------|---------|-----|
| Tail-based sampling | ❌ | 🟡 Orta | Maliyet kontrolü için |
| Custom span attributes | ⚠️ | 🟡 Orta | Bazı endpoint'lerde eksik |
| Metrics export (OTLP) | ❌ | 🟡 Orta | Prometheus /metrics var ama OTEL metrics yok |
| Baggage propagation | ❌ | 🟢 Düşük | Cross-service context |
| Log correlation (trace_id) | ⚠️ | 🔴 Yüksek | Log'da trace_id olmalı |

### 8.3 OTEL Best Practices Checklist

| Kriter | Durum |
|--------|-------|
| Span'lar arası parent-child ilişki | ✅ |
| Error span'ları otomatik oluşturma | ⚠️ |
| HTTP semantic conventions | ✅ |
| DB semantic conventions | ⚠️ |
| Messaging semantic conventions (webhook) | ❌ |
| Resource detection (service.name, service.version) | ✅ |

---

## 9. Grafana Cloud Kullanımı

### 9.1 Free Tier Limitleri

> Kaynak: Grafana Pricing (2026-05-10, doğrulanmış: grafana.com/pricing)

| Özellik | Free Tier | HookSniff Kullanımı |
|---------|-----------|-------------------|
| Metrics | 10K active series | ~500 series (yeterli) |
| Logs | 50 GB ingested/ay | ~5 GB/ay (yeterli) |
| Traces | 50 GB ingested/ay | ~10 GB/ay (yeterli) |
| Alert rules | 100 rules | ~15 rules (yeterli) |
| Dashboard | Sınırsız | ~4 dashboard |
| Data retention | 14 gün | ⚠️ Kısa (Pro'da 13 ay) |
| **SLO** | ✅ Ücretsiz | ⚠️ Kurulmalı |
| **OnCall (IRM)** | ✅ 3 kullanıcı ücretsiz | ⚠️ Kurulmalı |
| Profiles | ✅ Ücretsiz | ❌ Gerek yok |
| k6 performance tests | ✅ Ücretsiz | ⚠️ Load test için kullanılabilir |
| Support | Community | — |

**Kritik düzeltme:** Grafana Cloud free tier'a **SLO feature** ve **OnCall (3 kullanıcı)** dahil. Bu, PagerDuty/Opsgenie ihtiyacını ortadan kaldırır — $0 ile incident management mümkün!

**Grafana Cloud IRM (Incident Response Management):**
- OnCall scheduling + escalation policies
- Incident management + post-mortem
- Alert grouping + deduplication
- Mobile app (iOS + Android)
- 3 kullanıcı ücretsiz (Servet + 2 ekip üyesi yeterli)

### 9.2 Grafana Cloud Dashboard Export

```bash
# Mevcut dashboard'ları export et (yedekleme)
curl -H "Authorization: Bearer $GRAFANA_TOKEN" \
  https://grafana.com/api/dashboards/uid/hooksniff-api | jq '.dashboard' > grafana-api-dashboard.json
```

### 9.3 Alert Notification Channels

| Kanal | Kullanım | Durum |
|-------|----------|-------|
| Discord webhook | P2, P3, P4 | ⚠️ Kurulmalı |
| Email | Tüm seviyeler | ⚠️ Kurulmalı |
| Grafana OnCall (IRM) | P1, escalation | ✅ 3 kullanıcı ücretsiz — kurulmalı! |
| Grafana Mobile App | P1 push notification | ✅ OnCall ile birlikte gelir |

---

## 10. Maliyet Optimizasyonu

### 10.1 $0 Bütçe ile Monitoring

| Bileşen | Maliyet | Free Tier |
|---------|---------|-----------|
| Grafana Cloud | $0 | 10K metrics, 50GB logs, 50GB traces |
| Prometheus /metrics | $0 | Built-in |
| OpenTelemetry | $0 | Open source |
| Uptime monitoring | $0 | UptimeRobot free (50 monitor) |
| Log retention | $0 | 14 gün (Grafana free) |
| **TOPLAM** | **$0** | |

### 10.2 Opsiyonel İyileştirmeler

| İyileştirme | Maliyet | Etki |
|-------------|---------|------|
| Grafana Cloud Pro | $29/ay | 1 yıl retention, unlimited alerting |
| Betterstack | $0 (free) | Daha iyi uptime monitoring |
| PagerDuty | $0 (free tier) | On-call rotation |
| Sentry | $0 (free) | Error tracking (frontend) |

---

## 11. Uygulama Planı

### Faz 1: Alert Rules (1 gün)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | P1 alert rules oluştur (4 kural) | 2 saat | ❌ |
| 2 | P2 alert rules oluştur (4 kural) | 1 saat | ❌ |
| 3 | Discord notification channel kur | 30 dk | ❌ |
| 4 | Email notification channel kur | 30 dk | ❌ |
| 5 | Alert routing (P1→SMS, P2→Discord) | 30 dk | ❌ |

### Faz 2: Dashboard'lar (1-2 gün)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | Executive Overview dashboard | 2 saat | ❌ |
| 2 | API Performance dashboard | 2 saat | ❌ |
| 3 | Infrastructure dashboard | 1 saat | ❌ |
| 4 | Dashboard export (yedekleme) | 30 dk | ❌ |

### Faz 3: Runbook'lar (1 gün)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | RB-001: API Down | 30 dk | ❌ |
| 2 | RB-002: Database Unreachable | 30 dk | ❌ |
| 3 | RB-003: Webhook Delivery Halted | 30 dk | ❌ |
| 4 | RB-004: Error Rate Spike | 30 dk | ❌ |
| 5 | Kalan 11 runbook | 2 saat | ❌ |

### Faz 4: İyileştirmeler (1 gün)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | Tail-based sampling ekle | 1 saat | ❌ |
| 2 | SLO tanımları (slo.yaml) | 1 saat | ❌ |
| 3 | Log-trace correlation (trace_id) | 1 saat | ❌ |
| 4 | Custom metrics (queue depth, vb.) | 1 saat | ❌ |

**Toplam süre:** 4-5 gün
**Toplam maliyet:** $0

---

## 12. Metrikler

| Metrik | Mevcut | Hedef | Ölçüm |
|--------|--------|-------|-------|
| Alert coverage | ? | 15+ rules | Grafana alert count |
| MTTD (Mean Time to Detect) | ? | ≤ 2 dk | Alert timestamp - incident start |
| MTTR (Mean Time to Recover) | ? | ≤ 30 dk | Incident end - alert timestamp |
| Dashboard coverage | 0 custom | 4 dashboards | Grafana dashboard count |
| Runbook coverage | 0 | 15 runbooks | Document count |
| Log retention | 14 gün | 14 gün+ | Grafana config |
| Trace sampling rate | ? | %10 (normal) | OTEL config |

---

## 13. Kaynaklar

| # | Kaynak | URL | Doğrulama |
|---|--------|-----|-----------|
| 1 | APM Digest — Alerting Best Practices 2026 | apmdigest.com | ✅ 2026-03-23 |
| 2 | Grafana Cloud Free Tier | grafana.com/pricing | ✅ 2026 |
| 3 | OpenTelemetry Docs | opentelemetry.io/docs | ✅ 2026 |
| 4 | Grafana Alerting | grafana.com/docs/grafana/latest/alerting | ✅ 2026 |
| 5 | Prometheus Metrics | prometheus.io/docs | ✅ 2026 |
| 6 | SRE Tools 2026 (OpenObserve) | openobserve.ai/blog/sre-tools | ✅ 2026 |
| 7 | HookSniff telemetry.rs | api/src/telemetry.rs | ✅ Mevcut |
| 8 | HookSniff health.rs | api/src/routes/health.rs | ✅ Mevcut |
| 9 | Grafana OTEL Integration | grafana.com/docs/grafana-cloud/monitor-infrastructure/otel | ✅ 2026 |
| 10 | Google Cloud Run Monitoring | cloud.google.com/run/docs/monitoring | ✅ 2026 |
