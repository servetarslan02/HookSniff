# 📋 HookRelay — Feature Tracker

> Eksik özelliklerin takibi. Her özellik tamamlandığında ✅ yapılır.

---

## 🔴 Hafta 1-2: Satılabilir Ürün

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 1 | API Key Management | ✅ `routes/api_keys.rs` | ✅ `api-keys/page.tsx` | ❌ | ✅ Tamamlandı |
| 2 | Customer Self-Service | ⚠️ Mevcut | ⚠️ Mevcut | ❌ | Kısmen hazır |
| 3 | Webhook Playground | ✅ `routes/playground.rs` | ⚠️ Mevcut (güncellenmeli) | ❌ | Backend hazır |
| 4 | Delivery Attempt Details | ✅ `routes/delivery_details.rs` | ⚠️ Mevcut (güncellenmeli) | ❌ | Backend hazır |
| 5 | Webhook Logs Search | ✅ `routes/search.rs` | ✅ `search/page.tsx` | ❌ | ✅ Tamamlandı |

## 🟡 Hafta 3-4: Rekabet Avantajı

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 6 | Embeddable Portal | ❌ | ❌ | ❌ | Başlanmadı |
| 7 | CLI Tool | ⚠️ Mevcut (cli/index.js) | N/A | ❌ | Kısmen hazır |
| 8 | Webhook Alerting | ✅ `routes/alerts.rs` | ✅ `alerts/page.tsx` | ❌ | ✅ Tamamlandı |
| 9 | Custom Retry Schedules | ⚠️ Mevcut | ❌ | ❌ | Retry policy var, UI yok |
| 10 | Endpoint Health Monitoring | ✅ `routes/health_endpoints.rs` | ✅ `health/page.tsx` | ❌ | ✅ Tamamlandı |

## 🟢 Hafta 5-6: Fark Yaratma

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 11 | Webhook Transformations | ❌ | ❌ | ❌ | Başlanmadı |
| 12 | Self-Hosted Option | ⚠️ docker-compose mevcut | N/A | ❌ | Kısmen hazır |
| 13 | Webhook Analytics Dashboard | ⚠️ Mevcut | ⚠️ Mevcut | ❌ | Kısmen hazır |

## 🔵 Ek Özellikler

| # | Feature | Backend | Frontend | Test | Durum |
|---|---------|---------|----------|------|-------|
| 14 | SDK: Go | ❌ | N/A | ❌ | Başlanmadı |
| 15 | SDK: Ruby | ❌ | N/A | ❌ | Başlanmadı |
| 16 | SDK: Java | ❌ | N/A | ❌ | Başlanmadı |
| 17 | Event Schema Validation | ❌ | ❌ | ❌ | Başlanmadı |
| 18 | Rate Limit Dashboard | ⚠️ Mevcut | ❌ | ❌ | Backend var, UI yok |
| 19 | Bulk Operations | ❌ | ❌ | ❌ | Başlanmadı |
| 20 | Webhook Signature Rotation UI | ⚠️ Mevcut | ❌ | ❌ | Backend var, UI yok |
| 21 | WebSocket Real-time Updates | ❌ | ❌ | ❌ | Başlanmadı |

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
├── api-keys/page.tsx        # API key management sayfası ✅
├── playground/page.tsx      # Webhook tester sayfası (güncellenmeli)
├── alerts/page.tsx          # Alert rules sayfası ✅
├── health/page.tsx          # Endpoint health sayfası ✅
├── search/page.tsx          # Webhook search sayfası ✅
```

---

> 💡 Her backend route tamamlandığında ilgili frontend sayfası da yapılmalı.
