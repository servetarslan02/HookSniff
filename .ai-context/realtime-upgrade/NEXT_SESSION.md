# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 06:12 GMT+8

## Hemen Oku

1. `.ai-context/realtime-upgrade/MEMORY.md` → proje hafızası
2. `.ai-context/realtime-upgrade/PLAN.md` → plan (v3.0)
3. Bu dosya → sıradaki iş

## Tamamlanan Fazlar

- ✅ Faz 1: React Query + Zod (11/11 sayfa)
- ✅ Faz 2: Event System + Redis Streams

## Sıradaki: Faz 3 — WebSocket Real-Time Bağlantı

### Hedef
WebSocket endpoint'i oluştur + EventPublisher'ı WS gateway'e bağla.

### Adımlar
1. **WS endpoint** — `/v1/ws` WebSocket upgrade
2. **EventPublisher → WS bridge** — subscribe + get_recent
3. **Frontend WS hook** — useWebSocket.ts
4. **Frontend entegrasyon** — React Query cache invalidation

### Dikkat Edilecekler
- Mevcut `ws/` modülünü kullan (WsGateway, handler zaten var)
- JWT auth zorunlu
- Max connections: 100
- Heartbeat: 30 sn
