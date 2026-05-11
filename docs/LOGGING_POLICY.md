# HookSniff — Log Retention Policy (Günlük Saklama Politikası)

> Son güncelleme: 2026-05-12
> Sahip: DevOps / AI Agent
> İlgili: [SECURITY.md](./SECURITY.md), [RUNBOOK.md](./RUNBOOK.md)

---

## İçindekiler

1. [Log Seviyeleri](#log-seviyeleri)
2. [Retention Policy (Saklama Süreleri)](#retention-policy)
3. [PII Masking Rules (Kişisel Veri Maskeleme)](#pii-masking-rules)
4. [Log Formatı](#log-formatı)
5. [Alert Rules (Uyarı Kuralları)](#alert-rules)
6. [Log Kaynakları](#log-kaynakları)
7. [Compliance](#compliance)

---

## Log Seviyeleri

HookSniff, standart log seviyelerini kullanır. Her seviye belirli bir ciddiyet ve aksiyon beklentisi taşır.

| Seviye | Kullanım | Örnek |
|--------|----------|-------|
| `FATAL` | Servis çökmesi, geri dönüşü olmayan hatalar | DB bağlantısı tamamen koptu, OOM |
| `ERROR` | İşlem başarısız, kullanıcı etkilendi | Webhook delivery başarısız, auth hatası |
| `WARN` | Potansiyel sorun, aksiyon gerekebilir | Rate limit yaklaşıyor, retry sayısı yüksek |
| `INFO` | Normal iş akışı olayları | Webhook alındı, endpoint oluşturuldu, user login |
| `DEBUG` | Detaylı hata ayıklama bilgisi | HTTP header'lar, SQL query'ler, cache hit/miss |
| `TRACE` | Çok detaylı, sadece geliştirme ortamında | Her fonksiyon girişi/çıkışı |

### Seviye Kullanım Kuralları

- **Production:** `INFO` ve üzeri (varsayılan)
- **Staging:** `DEBUG` ve üzeri
- **Development:** `TRACE` dahil tümü
- **Dinamik seviye:** `RUST_LOG` ortam değişkeni ile değiştirilebilir

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

### Grafana Cloud (Ana Log Deposu)

| Log Türü | Saklama Süresi | Açıklama |
|----------|----------------|----------|
| **Application logs** (API + Worker) | **30 gün** | Tüm INFO ve üzeri loglar |
| **Access logs** (HTTP request) | **30 gün** | Her HTTP isteği |
| **Audit logs** (güvenlik) | **90 gün** | Login, permission değişiklikleri |
| **Error logs** | **30 gün** | ERROR ve FATAL seviyeleri |
| **Debug logs** | **7 gün** | Sadece gerektiğinde aktif |

### Saklama Süresi Hesaplaması

Grafana Cloud free tier:
- **10 GB/ay** log volume
- **50 GB** toplam saklama
- **30 gün** default retention

HookSniff tahmini günlük volume:
- ~50 MB/gün (INFO seviyesi, normal trafik)
- ~150 MB/gün (DEBUG seviyesi, yüksek trafik)
- **Aylık toplam:** ~1.5 GB (INFO) — free tier yeterli

### Yedekleme ve Arşivleme

| İşlem | Sıklık | Saklama | Konum |
|-------|--------|---------|-------|
| Grafana Cloud export | Haftalık | 90 gün | Cloudflare R2 |
| Audit log export | Aylık | 1 yıl | Cloudflare R2 |
| Error log snapshot | Günlük | 30 gün | Grafana Cloud |

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

### Maskeleme Kuralları

1. **Log oluşturma anında maskele** — Log storage'a gitmeden önce
2. **Geri dönüşü olmayan maskeleme** — Maskelenmiş veri orijinalinden kurtarılamaz
3. **Audit log istisnası** — Audit log'lar orijinal veriyi saklar (erişim kontrolü ile)
4. **Debug modunda bile maskele** — Debug log'ları PII korumalı olmalı

### Kesinlikle Loglanmaması Gerekenler

- ❌ Kullanıcı şifreleri (plain veya hash)
- ❌ OAuth token'ları
- ❌ JWT secret'ları
- ❌ Database connection string'leri (credentials içeren)
- ❌ Private key'ler
- ❌ Webhook secret'ları (signature verification için kullanılan)

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

### Log Bazlı Alert'ler

| Alert | Koşul | Seviye | Aksiyon |
|-------|-------|--------|---------|
| `ErrorSpike` | 5 dakikada >50 ERROR log | 🔴 Critical | Otomatik rollback değerlendir |
| `FatalDetected` | Herhangi bir FATAL log | 🔴 Critical | Acil müdahale |
| `AuthFailureSpike` | 1 dakikada >20 auth hatası | 🟡 Warning | Brute-force kontrolü |
| `WebhookDeliveryErrors` | 5 dakikada >%10 delivery hatası | 🔴 Critical | Worker durumu kontrol |
| `DatabaseConnectionErrors` | >3 DB bağlantı hatası/dakika | 🔴 Critical | Neon durumu kontrol |
| `HighRetryRate` | >%20 request retry | 🟡 Warning | API durumu kontrol |
| `MemoryPressure` | >%90 memory kullanımı | 🟡 Warning | Instance scaling kontrol |
| `SlowQueries` | >5 sorgu >2 saniye/dakika | 🟡 Warning | DB indeks kontrolü |

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
