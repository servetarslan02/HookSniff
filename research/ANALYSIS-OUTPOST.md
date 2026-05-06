# Hookdeck Outpost — Mimari Analizi

## 📋 Genel Bilgi
- **Repo:** https://github.com/hookdeck/outpost
- **Lisans:** Apache 2.0 ✅
- **Dil:** Go
- **Bağımlılıklar:** Redis, PostgreSQL, message queue (çeşitli)

## 🏗️ Mimari Overview

### Core Bileşenler
1. **API Server** — Tenant/destination management
2. **Delivery MQ** — Message queue üzerinden teslimat
3. **Retry Scheduler** — Redis-based retry queue (RSMQ)
4. **Destination Registry** — Multi-destination routing
5. **Log Store** — Attempt history
6. **User Portal** — Customer-facing dashboard

### Architecture Pattern
```
Event → API → Delivery MQ → Worker → Destination
                ↓
           Retry Scheduler (Redis RSMQ)
                ↓
           Log Store (attempt history)
```

## 🔑 Multi-Tenant Pattern

### Tenant Isolation
- Her tenant kendi `tenant_id`'si ile izole edilir
- Destination'lar tenant'a bağlı
- Attempt'ler tenant bazlı filtrelenir

### Tenant Operations
- CRUD operations (create, read, update, delete)
- Her tenant kendi destination'larını yönetir
- Portal'da tenant bazlı görünüm

## 🔄 Retry Stratejisi

### RetryTask Modeli
```go
type RetryTask struct {
    EventID       string
    TenantID      string
    DestinationID string
    Telemetry     *DeliveryTelemetry
}
```

### Retry Akışı
1. Teslimat başarısız → `RetryTask` oluşturulur
2. Redis RSMQ kuyruğuna eklenir (delayed message)
3. Scheduler kuyruğu poll eder
4. Attempt history'den son attempt numarasını alır
5. Yeni `DeliveryTask` oluşturur (attempt + 1)
6. Delivery MQ'ya publish eder

### Visibility Timeout
- Message alındıktan sonra belirli süre gizli kalır
- İşlenemezse tekrar görünür olur (retry)
- Race condition koruması

### Redis-Based Queue (RSMQ)
- Redis Simple Message Queue
- Delayed message desteği
- Namespace ile deployment isolation
- Poll backoff ile Redis yük azaltma

## 🎯 Destination Registry

### Desteklenen Destination'lar
- Webhook (HTTP)
- Amazon EventBridge
- AWS SQS
- AWS S3
- GCP Pub/Sub
- RabbitMQ
- Kafka
- Hookdeck Event Gateway

### Pattern
- Her destination provider'ı interface implement eder
- Registry pattern ile dinamik routing
- Partition key ile message routing

## 📊 Observability

### Delivery Telemetry
- Attempt tracking
- Success/failure metrics
- Response time measurement

### Log Store
- Attempt history (event + attempt details)
- Tenant bazlı sorgulama
- Debugging için attempt detayları

## 🔔 Alert System
- Destination failure alerts
- Customer notification (email vb.)
- Automatic endpoint disable (uzun süreli failure)

## 🔄 HookSniff'e Uygulanabilirlik

### Hemen Uygulanabilir
1. **RetryTask pattern** — Minimal retry task modeli, event data'sını DB'den çek
2. **Visibility timeout** — Race condition koruması
3. **Attempt tracking** — Her attempt'i kaydet

### Gelecekte Uygulanabilir
4. **Multi-destination routing** — Şimdilik sadece webhook, gelecekte EventBridge/SQS
5. **User portal** — Customer dashboard'u
6. **Partition key** — Tenant bazlı message routing

### HookSniff'in Mevcut Yapısıyla Karşılaştırma

| Özellik | Outpost | HookSniff |
|---------|---------|-----------|
| Multi-tenant | ✅ | ✅ (customer_id) |
| Retry queue | Redis RSMQ | PostgreSQL queue |
| Attempt tracking | ✅ | ✅ (delivery_attempts) |
| Destination routing | 8+ destination | Sadece webhook |
| User portal | ✅ | ❌ Henüz yok |
| Alerts | ✅ | ❌ Henüz yok |
| SSRF protection | ✅ (smokescreen) | ❌ Henüz yok |

## ✅ HookSniff İçin Öneriler

### Kısa Vadeli (Hemen)
1. SSRF koruması ekle (IP filtering)
2. Attempt tracking'i iyileştir (telemetry)
3. 410 Gone handling ekle

### Orta Vadeli
4. User portal (customer dashboard)
5. Failure alerts (email notification)
6. Multi-destination (EventBridge, SQS)

### Uzun Vadeli
7. Redis-based retry queue (PostgreSQL'den Redis'e geçiş)
8. Partition key ile tenant routing
9. Destination registry pattern
