# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 06:18 GMT+8

## Hemen Oku

1. `.ai-context/realtime-upgrade/MEMORY.md` → proje hafızası
2. `.ai-context/realtime-upgrade/PLAN.md` → plan (v3.0)
3. Bu dosya → sıradaki iş

## Tamamlanan Fazlar

- ✅ Faz 1: React Query + Zod (11/11 sayfa)
- ✅ Faz 2: Event System + Redis Streams
- ✅ Faz 3: WebSocket endpoint + EventBridge

## Sıradaki: Faz 4 — Entegrasyon

### Hedef
Frontend'de WebSocket hook'u, React Query entegrasyonu, fallback polling.

### Adımlar
1. **useWebSocket hook** (`dashboard/src/hooks/useWebSocket.ts`)
   - WebSocket connection + auto-reconnect
   - Event dinleme + React Query cache invalidation
   - Fallback polling (WS bağlantısı yoksa)

2. **Frontend entegrasyon**
   - Dashboard sayfalarında WS hook kullanımı
   - Real-time güncelleme: sayfa yenilemeden veri akışı

### Dikkat Edilecekler
- WS endpoint: `/v1/ws` (JWT auth gerekli)
- Auto-reconnect: exponential backoff
- Fallback: WS başarısızsa mevcut polling'e dön
- React Query: `queryClient.invalidateQueries()` ile cache temizleme
