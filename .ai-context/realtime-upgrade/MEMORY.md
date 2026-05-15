# Real-Time Upgrade — Hafıza

> Son güncelleme: 2026-05-16 04:58 GMT+8

## Proje Nedir?

HookSniff dashboard'unu polling tabanlı sistemden event-driven real-time sisteme çevirme projesi.

## Mevcut Durum

- **Frontend:** Next.js 15, Zustand, useEffect + fetch (cache yok)
- **Backend:** Rust Axum, PostgreSQL, Redis (sadece cache/queue)
- **Real-time:** Polling (60 sn admin, 30 sn health)
- **Deploy:** Vercel (dashboard) + Cloud Run (API)

## Hedef Durum

- **Frontend:** React Query (cache) + WebSocket (anlık veri) + Zod validation
- **Backend:** Event system + Redis Pub/Sub + WebSocket endpoint + Connection Manager
- **Real-time:** <100ms güncelleme + fallback polling + graceful shutdown
- **Deploy:** Aynı (değişiklik yok)

## Teknoloji Seçimi

| Teknoloji | Neden | Fiyat |
|-----------|-------|-------|
| React Query | Cache + refetch + optimistic | $0 (açık kaynak) |
| WebSocket (Axum) | İki yönlü real-time | $0 (built-in) |
| Redis Pub/Sub | Event broadcasting | $0 (Upstash free tier) |
| TanStack Virtual | Büyük listeler | $0 (açık kaynak) |
| Sentry | Hata takibi | $0 (5K error/ay free) |
| Zod | Schema validation | $0 (açık kaynak) |
| Prometheus | WS metrics | $0 (açık kaynak) |

## Faz Durumları (v2)

| Faz | Durum | Not |
|-----|-------|-----|
| Faz 1: React Query + Zod | ⬜ Başlamadı | |
| Faz 2: Event System + Envelope | ⬜ Başlamadı | |
| Faz 3: WebSocket + Connection Manager + Graceful Shutdown | ⬜ Başlamadı | |
| Faz 4: Entegrasyon + Fallback Polling | ⬜ Başlamadı | |
| Faz 5: Optimizasyon + Bundle Analysis | ⬜ Başlamadı | |
| Faz 6: Güvenlik & Dayanıklılık (Token refresh, Metrics, Stress test) | ⬜ Başlamadı | |

## Kritik Notlar

- Cloud Run WebSocket timeout: 3600 sn'e çıkarılmalı
- Upstash Redis free tier: 10,000 komut/gün (şu an ~3,700/gün kullanılıyor)
- Polling kademeli kaldırılacak (ani kesinti yok)
- Rollback: `WS_ENABLED=false` ile anında polling'e dönülebilir
- Per-user WS limit: 5 bağlantı (LRU eviction)
- Total WS limit: 100 bağlantı
- Client-side dedup: sequence number ile
- Graceful shutdown: SIGTERM → client'a server_shutdown mesajı
- Fallback: WS max reconnect (10) → 30 sn polling
- Token refresh: WS reconnect tetikler
