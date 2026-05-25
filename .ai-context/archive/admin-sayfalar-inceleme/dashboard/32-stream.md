# 📡 Stream (Real-time Events)

> Sayfa: ❌ OLUŞTURULMALI
> Route: `/dashboard/stream`
> Backend: `api/src/routes/stream.rs` — SSE mevcut
> İnceleme Tarihi: 2026-05-13

## Backend Durumu

### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/stream` | SSE (Server-Sent Events) bağlantısı |

## Frontend Yapılacaklar

### Sayfa Yapısı
1. **Bağlantı Durumu** — SSE bağlantı göstergesi (bağlı/bağlanıyor/koptu)
2. **Event Akışı** — Canlı event listesi (yeni üstte)
3. **Filtre** — Event type, endpoint, durum filtresi
4. **Duraklat/Devam** — Akışı durdurma butonu
5. **Temizle** — Event listesini temizleme

### Teknik Detay
- `EventSource` API ile SSE bağlantısı
- Auto-reconnect (bağlantı koparsa)
- Max 100 event gösterimi (performans)

### Sidebar Ekleme
```typescript
// sections.tools.items'a ekle:
{ name: t('stream'), href: '/stream', icon: '📡' }
```

### i18n Anahtarları (EN + TR)
- stream, streamDesc, connected, disconnected, reconnecting, pause, resume, clear
- noEventsYet, eventType, endpoint, status, timestamp

### Öncelik: 🟢 ORTA — Gelişmiş kullanıcılar için gerçek zamanlı izleme
