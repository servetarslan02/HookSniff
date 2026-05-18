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

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **Backup yönetimi** — Manuel backup tetikleme, geçmişi, restore
- **Log seviyesi ayarı** — Debug/Info/Warn/Error toggle
- **Feature flags** — Özellik açma/kapama, percentage rollout
- **Uptime monitoring** — Son 24h/7d/30d uptime yüzdesi
- **Canlı log akışı** — WebSocket ile gerçek zamanlı log streaming
- **Servis restart** — API/Worker/DB servislerini yeniden başlatma
- **Bağlantı havuzu** — DB ve Redis connection pool durumu
- **Disk kullanımı** — Sunucu disk doluluk oranı
- **Structured health checks** — Worker bazlı JSON sağlık durumu (Hookdeck ✅)
- **SSRF attempt log** — Güvenlik olaylarını izleme (Güvenlik araştırması)
- **Endpoint disable log** — Hangi endpoint ne zaman devre dışı kaldı (Svix ✅)
- Sistem metrikleri grafiği yok (CPU, RAM, Disk)
- Log viewer yok
- Servis restart butonu yok
- Alert entegrasyonu yok
- Geçmiş sağlık verisi yok

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔒 Güvenlik

#### G-01: Raw Fetch Kullanımı (2 yer)
- **Dosya:** `dashboard/src/app/[locale]/admin/system/page.tsx`
- **Sorun:** 2 yerde `fetch()` kullanılıyor.
- **Adımlar:**
  1. `fetch()` → `apiFetch()` veya `adminApi` metodına çevir
