# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 05:55 GMT+8

## Hemen Oku

1. `.ai-context/realtime-upgrade/MEMORY.md` → proje hafızası
2. `.ai-context/realtime-upgrade/PLAN.md` → plan (v3.0)
3. Bu dosya → sıradaki iş

## Faz 1 Durumu: ✅ %100 TAMAMLANDI

### ✅ Tamamlanan (Tüm Sayfalar)
- React Query + Zod kuruldu (providers.tsx, schemas/api.ts)
- 14 admin hook'u + 16 yeni hook (hooks/useAdminData.ts)
- 10 dashboard hook'u (hooks/useDashboardData.ts)
- Tüm 11 sayfa dönüştürüldü:
  - admin/page, activity, users, alerts, revenue, system, settings
  - DashboardOverview, endpoints/page, endpoints/[id], deliveries/DeliveriesList

## Sıradaki: Faz 2 — Event System + Redis Streams

### Hedef
Rust backend'de event üretim mekanizması kur + Redis Streams ile publish.

### Adımlar
1. **Redis Streams writer** (Rust)
   - `hooksniff:events` stream key'ine XADD ile event yaz
   - Event tipleri: `delivery.created`, `delivery.completed`, `delivery.failed`, `endpoint.created`, `endpoint.updated`, `user.registered`
   - Her event: `{ type, seq, ts, data }` formatında

2. **Event producer modülü**
   - Delivery lifecycle'da (create, complete, fail) event üret
   - Endpoint CRUD'da event üret
   - User registration'da event üret

3. **Upstash Redis bağlantısı**
   - `REDIS_URL` env variable
   - Connection pool (bb8-redis veya deadpool-redis)
   - Retry logic

4. **Sequence number**
   - Her event için monotonik seq numarası
   - INCR ile Redis'ten al

### Dikkat Edilecekler
- Redis Streams > Pub/Sub (persistence, deploy güvenliği)
- XADD ile mesaj Redis'te kalır
- Consumer groups → multi-instance'da duplicate yok
- Upstash free tier: $0, 256 MB
- Stream key: `hooksniff:events`

## Kısa Kararlar
- Redis Streams > Pub/Sub (persistence, deploy güvenliği)
- Kafka/NATS: overkill ($0-100 kullanıcı için)
- Kubernetes: overkill (Cloud Run yeterli)
