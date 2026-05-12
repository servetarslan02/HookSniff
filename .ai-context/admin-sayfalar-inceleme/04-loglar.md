# 📋 Loglar (Logs)

> Sayfa: `dashboard/src/app/[locale]/dashboard/logs/page.tsx`
> Route: `/dashboard/logs`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatusBadge | `@/components/StatusBadge` | Durum rozeti |
| DetailRow | İç bileşen | Detay modalı satırı |

### Veri Akışı
- `webhooksApi.list(token, {page, status})` → mevcut sayfa verisi
- **Paralel istekler:** Her durum için ayrı API çağrısı (delivered, failed, pending) → status counts

### State Yönetimi
| State | Tip | Açıklama |
|-------|-----|----------|
| deliveries | Delivery[] | Teslimat listesi |
| total | number | Toplam kayıt |
| page | number | Mevcut sayfa |
| filter | StatusFilter | Durum filtresi |
| search | string | Arama |
| selected | Delivery | Seçili teslimat |
| autoRefresh | boolean | Otomatik yenileme |
| statusCounts | Record<StatusFilter, number> | Durum bazlı sayılar |

## Özellikler

### Liste Görünümü
- ✅ **Server-side sayfalama** — 20 kayıt/sayfa
- ✅ **Durum filtresi** — All/Delivered/Failed/Pending (ikonlu)
- ✅ **Status counts** — Her filtre sekmesinde sayı gösterimi
- ✅ **Arama** — Event, ID, endpoint_id ile (client-side)
- ✅ **Auto-refresh** — 5 saniyede bir otomatik yenileme
- ✅ **Manual refresh** — ↻ Refresh butonu
- ✅ **Tablo kolonları:** ID, Event, Endpoint, Status, Attempts, Response, Time

### Detay Modalı
- ✅ ID, Event, Endpoint, Status, Attempts, HTTP Response, Created
- ✅ Attempts Timeline (renk kodlu: yeşil/son başarılı, kırmızı/son başarısız, sarı/retry)
- ✅ Modal kapatma (✕ + backdrop + Close butonu)

### Response Status Renk Kodları
- 🟢 2xx — Yeşil
- 🔵 3xx — Mavi
- 🟡 4xx — Sarı
- 🔴 5xx — Kırmızı

### Erişilebilirlik
- ✅ aria-label pagination butonlarında
- ✅ aria-live pagination bilgisinde
- ✅ aria-hidden backdrop
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Auto-refresh özelliği (5s interval)
- Status counts paralel API çağrısı ile
- Response status renk kodlaması (4 seviye)
- Attempts timeline renk kodlu
- getErrorMessage kullanımı
- useCallback + cleanup pattern

### ⚠️ Potansiyel Sorunlar
- **4 paralel API çağrısı** — Her fetchData'da 4 istek yapılıyor (performans)
- **Arama client-side** — Sadece mevcut sayfada filtreliyor
- **"Loading logs..." hardcoded** — i18n key kullanılmamış
- **"Full delivery history..." subtitle hardcoded** — i18n key kullanılmamış
- **"Refresh" butonu hardcoded** — i18n key kullanılmamış
- **"Close" butonu hardcoded** — i18n key kullanılmamış
- **Tüm tablo header'ları hardcoded** — "ID", "Event", "Endpoint", "Status", "Attempts", "Response", "Time" i18n değil
- **Attempts Timeline header hardcoded** — i18n değil

### 🔴 Eksiklikler
- Endpoint bazlı filtreleme yok
- Event type bazlı filtreleme yok
- Tarih aralığı filtresi yok
- Export (CSV/JSON) yok
- Teslimat replay butonu yok (deliveries sayfasında var)
- Toplu işlem yok
- Request/response body gösterimi yok
- Auto-refresh hızı ayarlanamıyor
