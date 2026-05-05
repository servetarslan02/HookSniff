# 📋 HookRelay — Feature Tracker

> Eksik özelliklerin takibi. Her özellik tamamlandığında ✅ yapılır.

---

## 🔴 Hafta 1-2: Satılabilir Ürün

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 1 | API Key Management | ✅ `routes/api_keys.rs` | ❌ | ❌ | Backend hazır |
| 2 | Customer Self-Service | ⚠️ Mevcut | ⚠️ Mevcut | ❌ | Kısmen hazır |
| 3 | Webhook Playground | ✅ `routes/playground.rs` | ❌ | ❌ | Backend hazır |
| 4 | Delivery Attempt Details | ✅ `routes/delivery_details.rs` | ❌ | ❌ | Backend hazır |
| 5 | Webhook Logs Search | ✅ `routes/search.rs` | ❌ | ❌ | Backend hazır |

## 🟡 Hafta 3-4: Rekabet Avantajı

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 6 | Embeddable Portal | ❌ | ❌ | ❌ | Başlanmadı |
| 7 | CLI Tool | ❌ | N/A | ❌ | Başlanmadı |
| 8 | Webhook Alerting | ✅ `routes/alerts.rs` | ❌ | ❌ | Backend hazır |
| 9 | Custom Retry Schedules | ⚠️ Mevcut | ❌ | ❌ | Retry policy var, UI yok |
| 10 | Endpoint Health Monitoring | ✅ `routes/health_endpoints.rs` | ❌ | ❌ | Backend hazır |

## 🟢 Hafta 5-6: Fark Yaratma

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 11 | Webhook Transformations | ❌ | ❌ | ❌ | Başlanmadı |
| 12 | Self-Hosted Option | ❌ | N/A | ❌ | Başlanmadı |
| 13 | AI Anomaly Detection | ⚠️ Mevcut (ai-center) | ⚠️ Mevcut | ❌ | Kısmen hazır |
| 14 | Webhook Analytics Dashboard | ⚠️ Mevcut | ⚠️ Mevcut | ❌ | Kısmen hazır |

## 🔵 Ek Özellikler

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 15 | SDK: Go | ❌ | N/A | ❌ | Başlanmadı |
| 16 | SDK: Ruby | ❌ | N/A | ❌ | Başlanmadı |
| 17 | SDK: Java | ❌ | N/A | ❌ | Başlanmadı |
| 18 | Event Schema Validation | ❌ | ❌ | ❌ | Başlanmadı |
| 19 | Rate Limit Dashboard | ⚠️ Mevcut | ❌ | ❌ | Backend var, UI yok |
| 20 | Bulk Operations | ❌ | ❌ | ❌ | Başlanmadı |
| 21 | Webhook Signature Rotation UI | ⚠️ Mevcut | ❌ | ❌ | Backend var, UI yok |
| 22 | WebSocket Real-time Updates | ❌ | ❌ | ❌ | Başlanmadı |

---

## Backend Dosyaları (Yeni Eklenen)

```
api/src/routes/
├── api_keys.rs           # API key CRUD + rotate
├── playground.rs         # Webhook tester + sample payloads
├── delivery_details.rs   # Delivery detail + attempt detail
├── alerts.rs             # Alert rules CRUD + test
├── search.rs             # Webhook logs search
├── health_endpoints.rs   # Endpoint health monitoring
```

## Frontend Gereken Sayfalar

```
dashboard/src/app/dashboard/
├── api-keys/page.tsx        # API key management sayfası
├── playground/page.tsx      # Webhook tester sayfası (mevcut, güncellenmeli)
├── alerts/page.tsx          # Alert rules sayfası
├── health/page.tsx          # Endpoint health sayfası
├── search/page.tsx          # Webhook search sayfası
```

---

> 💡 Her backend route tamamlandığında ilgili frontend sayfası da yapılmalı.
> Frontend sayfaları oluşturulduğunda bu dosya güncellenmeli.
