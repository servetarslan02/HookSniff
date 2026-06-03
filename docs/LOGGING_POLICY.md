# HookSniff — Log Retention Policy

> Last updated: 2026-06-03
> Owner: DevOps / AI Agent
> Related: [SECURITY.md](./SECURITY.md), [RUNBOOK.md](./RUNBOOK.md)

---

## Table of Contents

1. [Log Levels](#log-levels)
2. [Retention Policy](#retention-policy)
3. [PII Masking Rules](#pii-masking-rules)
4. [Log Format](#log-format)
5. [Alert Rules](#alert-rules)
6. [Log Sources](#log-sources)
7. [Compliance](#compliance)

---

## Log Levels

HookSniff uses standard log levels. Each level carries a specific severity and action expectation.

| Level | Usage | Example |
|-------|-------|--------|
| `FATAL` | Service crash, unrecoverable errors | DB connection lost, OOM |
| `ERROR` | Operation failed, user affected | Webhook delivery failed, auth error |
| `WARN` | Potential issue, action may be needed | Rate limit approaching, retry count high |
| `INFO` | Normal business flow events | Webhook received, endpoint created, user login |
| `DEBUG` | Detailed debugging info | HTTP headers, SQL queries, cache hit/miss |
| `TRACE` | Very detailed, development only | Every function entry/exit |

### Level Usage Rules

- **Production:** `INFO` and above (default)
- **Staging:** `DEBUG` and above
- **Development:** All levels including `TRACE`
- **Dynamic level:** Configurable via `RUST_LOG` environment variable

```bash
# Production
RUST_LOG=info

# Debug modunda (geçici)
RUST_LOG=debug

# Belirli bir modül için debug
RUST_LOG=hooksniff::api::webhooks=debug,hooksniff::worker=info
```

---

## Retention Policy

### Grafana Cloud (Primary Log Store)

| Log Type | Retention | Description |
|----------|-----------|-------------|
| **Application logs** (API + Worker) | **30 days** | All INFO and above logs |
| **Access logs** (HTTP request) | **30 days** | Every HTTP request |
| **Audit logs** (security) | **90 days** | Login, permission changes |
| **Error logs** | **30 days** | ERROR and FATAL levels |
| **Debug logs** | **7 days** | Only when needed |

### Retention Calculation

Grafana Cloud free tier:
- **10 GB/month** log volume
- **50 GB** total storage
- **30 days** default retention

HookSniff estimated daily volume:
- ~50 MB/day (INFO level, normal traffic)
- ~150 MB/day (DEBUG level, high traffic)
- **Monthly total:** ~1.5 GB (INFO) — free tier sufficient

### Backup and Archiving

| Operation | Frequency | Retention | Location |
|-----------|-----------|-----------|----------|
| Grafana Cloud export | Weekly | 90 days | Cloudflare R2 |
| Audit log export | Monthly | 1 year | Cloudflare R2 |
| Error log snapshot | Daily | 30 days | Grafana Cloud |

```bash
# Grafana Cloud'dan log export (API ile)
# https://grafana.com/docs/grafana-cloud/logs/logql/
curl -H "Authorization: Bearer $GRAFANA_TOKEN" \
    "https://hookrelay.grafana.net/loki/api/v1/query_range" \
    --data-urlencode 'query={service="hooksniff-api"}' \
    --data-urlencode "start=$(date -d '7 days ago' +%s)" \
    --data-urlencode "end=$(date +%s)"
```

---

## PII Masking Rules

### Maskeleme Zorunlu Alanlar

Aşağıdaki kişisel veriler log'larda **asla** açık yazılmamalıdır:

| Veri | Maskeleme | Örnek |
|------|-----------|-------|
| **Email adresi** | İlk 2 karakter + `***@domain` | `se***@gmail.com` |
| **Password/Hash** | Tamamen gizle | `[REDACTED]` |
| **API Key/Token** | Son 4 karakter göster | `gl***VF1` |
| **IP adresi** | Son oktet maskele | `192.168.1.***` |
| **Credit card** | Son 4 karakter göster | `****-****-****-1234` |
| **User ID** | Log'da göster (PII değil) | `usr_abc123` |
| **Webhook URL** | Domain göster, path maskele | `https://example.com/***` |
| **Webhook payload** | Loglama, sadece boyut | `payload_size=1024` |

### Maskeleme Implementasyonu

```rust
// Rust'ta log maskeleme örneği
use tracing::field::debug;

// Email maskeleme
fn mask_email(email: &str) -> String {
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() == 2 {
        let local = &parts[0][..2.min(parts[0].len())];
        format!("{}***@{}", local, parts[1])
    } else {
        "[INVALID_EMAIL]".to_string()
    }
}

// API key maskeleme
fn mask_api_key(key: &str) -> String {
    if key.len() > 4 {
        format!("***{}", &key[key.len()-4..])
    } else {
        "***".to_string()
    }
}

// Kullanım
tracing::info!(
    email = %mask_email(&user.email),
    api_key = %mask_api_key(&key),
    "User created API key"
);
```

### Masking Rules

1. **Mask at log creation time** — Before log reaches storage
2. **Irreversible masking** — Masked data cannot be recovered to original
3. **Audit log exception** — Audit logs retain original data (with access control)
4. **Mask even in debug mode** — Debug logs must be PII-safe

### Never Log These

- ❌ User passwords (plain or hash)
- ❌ OAuth tokens
- ❌ JWT secrets
- ❌ Database connection strings (with credentials)
- ❌ Private keys
- ❌ Webhook secrets (used for signature verification)

---

## Log Formatı

### Standart Log Entry (JSON)

```json
{
  "timestamp": "2026-05-12T06:00:00.000Z",
  "level": "INFO",
  "service": "hooksniff-api",
  "version": "1.0.0",
  "trace_id": "abc123def456",
  "span_id": "span789",
  "message": "Webhook delivered successfully",
  "fields": {
    "endpoint_id": "ep_xyz",
    "delivery_id": "dlv_123",
    "status_code": 200,
    "duration_ms": 145,
    "attempt": 1
  }
}
```

### HTTP Access Log

```json
{
  "timestamp": "2026-05-12T06:00:00.000Z",
  "level": "INFO",
  "service": "hooksniff-api",
  "method": "POST",
  "path": "/api/v1/webhooks",
  "status": 201,
  "duration_ms": 52,
  "user_agent": "Mozilla/5.0...",
  "client_ip": "192.168.1.***",
  "request_id": "req_abc123"
}
```

---

## Alert Rules

### Log-Based Alert Rules

| Alert | Condition | Level | Action |
|-------|-----------|-------|--------|
| `ErrorSpike` | >50 ERROR logs in 5 min | 🔴 Critical | Evaluate automatic rollback |
| `FatalDetected` | Any FATAL log | 🔴 Critical | Immediate response |
| `AuthFailureSpike` | >20 auth failures in 1 min | 🟡 Warning | Brute-force check |
| `WebhookDeliveryErrors` | >10% delivery errors in 5 min | 🔴 Critical | Check Worker status |
| `DatabaseConnectionErrors` | >3 DB connection errors/min | 🔴 Critical | Check Neon status |
| `HighRetryRate` | >20% request retry | 🟡 Warning | Check API status |
| `MemoryPressure` | >90% memory usage | 🟡 Warning | Check instance scaling |
| `SlowQueries` | >5 queries >2s/min | 🟡 Warning | Check DB indexes |

### Grafana Cloud Alert Konfigürasyonu

```yaml
# monitoring/alerts/log_alerts.yml
groups:
  - name: hooksniff_log_alerts
    interval: 1m
    rules:
      - alert: ErrorSpike
        expr: |
          sum(count_over_time({service=~"hooksniff-.*"} |~ "level.*ERROR" [5m])) > 50
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Error log spike detected"
          description: "More than 50 ERROR logs in 5 minutes"

      - alert: FatalDetected
        expr: |
          count_over_time({service=~"hooksniff-.*"} |~ "level.*FATAL" [1m]) > 0
        labels:
          severity: critical
        annotations:
          summary: "FATAL log detected"
          description: "A FATAL level log has been recorded"

      - alert: AuthFailureSpike
        expr: |
          sum(count_over_time({service="hooksniff-api"} |~ "auth.*failed|unauthorized" [1m])) > 20
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Authentication failure spike"
          description: "More than 20 auth failures in 1 minute"

      - alert: WebhookDeliveryErrors
        expr: |
          (
            sum(count_over_time({service="hooksniff-worker"} |~ "delivery.*failed" [5m]))
            /
            sum(count_over_time({service="hooksniff-worker"} |~ "delivery" [5m]))
          ) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High webhook delivery error rate"
          description: "More than 10% of webhook deliveries are failing"
```

---

## Log Kaynakları

### Kaynak ve Yönlendirme

| Kaynak | Log Türü | Hedef | Yöntem |
|--------|----------|-------|--------|
| Rust API | Application | Grafana Cloud | OpenTelemetry (OTLP) |
| Rust Worker | Application | Grafana Cloud | OpenTelemetry (OTLP) |
| Next.js Dashboard | Access | Vercel Logs | Vercel built-in |
| Cloud Run | Infrastructure | GCP Cloud Logging | GCP built-in |
| Neon PostgreSQL | Query logs | Neon Console | Neon built-in |
| Upstash Redis | Command logs | Upstash Console | Upstash built-in |
| Cloudflare | Access/Security | Cloudflare Dashboard | CF built-in |

### OpenTelemetry Konfigürasyonu

```yaml
# monitoring/otel-collector-config.yml (mevcut)
# API ve Worker log'ları OTLP üzerinden Grafana Cloud'a gönderiliyor
exporters:
  otlphttp:
    endpoint: https://otlp-gateway-prod-eu-west-2.grafana.net/otlp
    headers:
      Authorization: "Basic ${OTEL_AUTH}"
```

---

## Compliance

### GDPR Uyumları

- ✅ Kişisel veriler log'larda maskeleme
- ✅ Log saklama süreleri tanımlı ve otomatik temizleme
- ✅ Audit log'lar ayrı saklama süresi (90 gün)
- ✅ Kullanıcı talebi üzerine log silme prosedürü

### SOC 2 Hazırlıkları

- ✅ Log erişim kontrolü (Grafana Cloud RBAC)
- ✅ Log bütünlüğü (Grafana Cloud immutable storage)
- ✅ Monitoring ve alerting
- 📋 Eksik: Log encryption at rest (Grafana Cloud default)

---

## Güncelleme Geçmişi

| Tarih | Değişiklik | Yapılan |
|-------|-----------|---------|
| 2026-05-12 | İlk versiyon | Log retention policy oluşturuldu |

---

> **Not:** Bu politika yılda en az bir kez gözden geçirilmelidir.
> Grafana Cloud free tier limitleri aşıldığında plan yükseltmesi gerekebilir.
