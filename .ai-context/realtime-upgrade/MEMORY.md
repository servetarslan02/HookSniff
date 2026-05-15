# Real-Time Upgrade — Hafıza

> Son güncelleme: 2026-05-16 04:50 GMT+8

## Proje Nedir?

HookSniff dashboard'unu polling tabanlı sistemden event-driven real-time sisteme çevirme projesi.

## Mevcut Durum

- **Frontend:** Next.js 15, Zustand, useEffect + fetch (cache yok)
- **Backend:** Rust Axum, PostgreSQL, Redis (sadece cache/queue)
- **Real-time:** Polling (60 sn admin, 30 sn health)
- **Deploy:** Vercel (dashboard) + Cloud Run (API)

## Hedef Durum

- **Frontend:** React Query (cache) + WebSocket (anlık veri)
- **Backend:** Event system + Redis Pub/Sub + WebSocket endpoint
- **Real-time:** <100ms güncelleme
- **Deploy:** Aynı (değişiklik yok)

## Teknoloji Seçimi

| Teknoloji | Neden | Fiyat |
|-----------|-------|-------|
| React Query | Cache + refetch + optimistic | $0 (açık kaynak) |
| WebSocket (Axum) | İki yönlü real-time | $0 (built-in) |
| Redis Pub/Sub | Event broadcasting | $0 (Upstash free tier) |
| TanStack Virtual | Büyük listeler | $0 (açık kaynak) |
| Sentry | Hata takibi | $0 (5K error/ay free) |

## Faz Durumları

| Faz | Durum | Not |
|-----|-------|-----|
| Faz 1: React Query | ⬜ Başlamadı | |
| Faz 2: Event System | ⬜ Başlamadı | |
| Faz 3: WebSocket | ⬜ Başlamadı | |
| Faz 4: Entegrasyon | ⬜ Başlamadı | |
| Faz 5: Optimizasyon | ⬜ Başlamadı | |

## Kritik Notlar

- Cloud Run WebSocket timeout: 3600 sn'e çıkarılmalı
- Upstash Redis free tier: 10,000 komut/gün (şu an ~3,700/gün kullanılıyor)
- Polling kademeli kaldırılacak (ani kesinti yok)
- Rollback: `WS_ENABLED=false` ile anında polling'e dönülebilir
