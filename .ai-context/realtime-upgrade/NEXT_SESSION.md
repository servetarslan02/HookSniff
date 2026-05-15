# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 06:10 GMT+8

## Hemen Oku

1. `.ai-context/realtime-upgrade/MEMORY.md` → proje hafızası
2. `.ai-context/realtime-upgrade/PLAN.md` → plan (v3.0)
3. Bu dosya → sıradaki iş

## Faz 1: ✅ Tamamlandı
## Faz 2: ✅ Tamamlandı

## Sıradaki: Faz 3 — WebSocket Real-Time Bağlantı

### Hedef
WebSocket endpoint'i oluştur + EventPublisher'ı WS gateway'e bağla.

### Adımlar
1. **WS endpoint** (`api/src/routes/ws.rs` veya mevcut `ws/handler.rs`)
   - `/v1/ws` — WebSocket upgrade endpoint
   - JWT auth zorunlu
   - Event filtreleme (deliveries, endpoints, users, queue)

2. **EventPublisher → WS bridge**
   - `event_publisher.subscribe()` ile local broadcast receiver
   - Her WS connection'a event推送
   - `event_publisher.get_recent(N)` ile ilk yükleme

3. **Frontend WS hook** (`dashboard/src/hooks/useWebSocket.ts`)
   - WebSocket connection + auto-reconnect
   - Event dinleme + React Query cache invalidation
   - Fallback polling (WS bağlantısı yoksa)

4. **Frontend entegrasyon**
   - Dashboard sayfalarında WS hook kullanımı
   - Real-time güncelleme: sayfa yenilemeden veri akışı

### Dikkat Edilecekler
- Mevcut `ws/` modülünü kullan (WsGateway, handler zaten var)
- JWT auth: mevcut middleware'den token al
- Max connections: 100 (config'den)
- Heartbeat: 30 sn interval
- Graceful shutdown: connection cleanup
