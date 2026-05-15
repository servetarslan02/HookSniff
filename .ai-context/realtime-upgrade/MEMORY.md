# Real-Time Upgrade — Hafıza

> Son güncelleme: 2026-05-16 05:55 GMT+8

## Faz Durumları

| Faz | Durum | Not |
|-----|-------|-----|
| Faz 1: React Query + Zod | ✅ %100 tamamlandı | 11/11 sayfa dönüştürüldü |
| Faz 2: Event System + Redis Streams | ⬜ Başlamadı | Plan v3.0 — Pub/Sub → Streams |
| Faz 3: WebSocket | ⬜ Başlamadı | |
| Faz 4: Entegrasyon | ⬜ Başlamadı | |
| Faz 5: Optimizasyon | ⬜ Başlamadı | |
| Faz 6: Güvenlik | ⬜ Başlamadı | |

## Mimari Karar: Redis Streams

**Neden Pub/Sub değil?**
- Subscriber offline ise mesaj kaybolur
- Deploy/restart sırasında event kaybı

**Neden Streams?**
- XADD ile mesaj Redis'te saklanır (persistence)
- Consumer groups → multi-instance'da duplicate yok
- XREVRANGE → son N eventi getir (ilk yükleme/reconnect)
- Upstash free tier'da mevcut ($0)
- Deploy güvenliği: instance yenilenirken event kaybolmaz

**Neden NATS değil?**
- Ayrı servis gerekli, Upstash'te yok, overkill

## Teknik Notlar

- Stream key: `hooksniff:events`
- XADD ile event yaz, XREVRANGE ile son N event oku
- Local broadcast (tokio::sync::broadcast) same-instance anlık推送 için
- Redis Streams cross-instance için
- Zod v4: `z.record(keySchema, valueSchema)` — iki argüman
- AdminUser: `role` ve `status` zorunlu
- Git email: servetarslan02@gmail.com

## Faz 1 Tamamlanan İşler (Son Oturum)

- `admin/revenue/page.tsx` → React Query (useAdminRevenue, useAdminRevenueMetrics, useAdminRevenueCohorts, useAdminRefunds, useAdminChurn, useAdminSettings)
- `admin/system/page.tsx` → React Query (useSystemHealth, useQueueStatus, useFailedDeliveries, useDeadLetters, useRateLimitViolations, useApiLatency, useTestWebhook, useBatchReplay)
- `admin/settings/page.tsx` → React Query (useAdminSettings, useUpdateSettings, useAdminAlerts, useCreateAlert, useUpdateAlert)
- `endpoints/[id]/page.tsx` → React Query (useEndpointDetail, useUpdateEndpoint)
- 12 yeni Zod şeması eklendi (SystemHealth, QueueStatus, RevenueMetrics, Cohort, Refund, PlatformSettings, AlertRule, FailedDeliveries, DeadLetters, RateLimitViolations, ApiLatency)
- 16 yeni React Query hook'u eklendi (useAdminData.ts)
