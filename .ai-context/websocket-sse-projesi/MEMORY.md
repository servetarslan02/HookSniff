# 🧠 WebSocket/SSE — Hafıza

> **Son güncelleme:** 2026-05-26

## Kararlar

### Karar 1: SSE + WebSocket (İkisi de)
- SSE: Dashboard için (tek taraflı, otomatik reconnect)
- WebSocket: SDK'lar ve interaktif uygulamalar için (iki taraflı)

### Karar 2: Event-Driven (Polling Değil)
- Mevcut: Her 5s'de DB oku (polling)
- Hedef: Webhook teslimat → Event yayınla → SSE/WS (push)
- Gecikme: 5s → < 100ms

### Karar 3: Broadcast Channel
- tokio::sync::broadcast ile global event bus
- Tüm SSE/WS client'larına tek seferde yayın

### Karar 4: Connection Limits
- Global: 1000+ bağlantı
- Per-customer: 10 bağlantı
- Slow consumer: Backpressure (bounded channel)

### Karar 5: Reconnection & Replay
- Son 100 event replay (catch-up)
- Last-Event-ID header (SSE)

## İlerleme

| Faz | Durum |
|-----|-------|
| Faz 1: SSE Optimizasyonu | ⏳ |
| Faz 2: WebSocket Optimizasyonu | ⏳ |
| Faz 3: Connection Management | ⏳ |
| Faz 4: Event Filtering | ⏳ |
| Faz 5: Reconnection & Replay | ⏳ |
