# 🖥️ Sistem (Admin System)

> Sayfa: `admin/system/page.tsx`
> Route: `/admin/system`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### SystemHealth Interface
```typescript
interface SystemHealth {
  database: { status: string; latency_ms: number };
  redis: { status: string; latency_ms: number };
  api: { status: string; uptime_seconds: number };
  queue: { pending: number; processing: number; failed: number };
  checks?: {
    db_size?: { status: string; size?: string };
    recent_errors?: { status: string; errors?: Array<{id, event?, error?, created_at}> };
    queue_detail?: { status: string; pending?, processing?, failed_last_hour? };
  };
}
```

### Veri Akışı
- `adminApi.getSystemHealth(token)` → Sistem sağlık verisi

## Özellikler

### Servis Durumları
- ✅ **Veritabanı** — Durum + latency (ms)
- ✅ **Redis** — Durum + latency (ms)
- ✅ **API** — Durum + uptime (saniye)
- ✅ **Queue** — Pending/Processing/Failed sayıları

### Ek Kontroller
- ✅ **DB Boyutu** — Veritabanı boyutu
- ✅ **Son Hatalar** — Son hata listesi (id, event, error, created_at)
- ✅ **Queue Detayı** — Pending, processing, failed_last_hour

### Hata Yönetimi
- ✅ **Fallback mock data** — API erişilemezse varsayılan veri
- ✅ **Loading state**
- ✅ **Error state**

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Kapsamlı sistem sağlık kontrolü
- Fallback mock data
- Recent errors listesi
- Queue detayları
- DB boyutu bilgisi

### 🔴 Eksiklikler
- Sistem metrikleri grafiği yok (CPU, RAM, Disk)
- Log viewer yok
- Servis restart butonu yok
- Alert entegrasyonu yok
- Geçmiş sağlık verisi yok
