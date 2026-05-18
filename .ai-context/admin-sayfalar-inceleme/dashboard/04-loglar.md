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

---

## 🔧 Yapılacaklar (2026-05-13)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/logs/page.tsx`
- **Sorun:** 3 useEffect, 4 paralel API çağrısı ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: 4 Paralel API Çağrısı — Gereksiz
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/logs/page.tsx`
- **Sorun:** Her fetchData'da 4 ayrı API çağrısı (1 liste + 3 status count).
- **Adımlar:**
  1. Backend'de status count'ları ana response'a ekle (tek istek)
  2. Veya: Status count'ları lazy load et (sekme tıklandığında)

### 🔒 Güvenlik

#### G-01: Hardcoded Stringler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/logs/page.tsx`
- **Sorun:** "Loading logs...", "Full delivery history...", "Refresh", "Close", tablo header'ları hardcoded.
- **Adımlar:**
  1. i18n key'leri ekle: `loadingLogs`, `logsSubtitle`, `refresh`, `close`
  2. Tablo header'ları: `thId`, `thEvent`, `thEndpoint`, `thStatus`, `thAttempts`, `thResponse`, `thTime`

### 🔴 Kod Kalitesi

#### KK-01: useDeliveryStream Hook Kullanılmıyor
- **Dosya:** `dashboard/src/hooks/useDeliveryStream.ts`
- **Sorun:** Real-time SSE delivery stream hook'u tanımlı ve test ediliyor ama hiçbir sayfa kullanmıyor.
- **Adımlar:**
  1. Logs veya Deliveries sayfasına entegre et
  2. Auto-refresh yerine SSE ile gerçek zamanlı güncelleme
  3. Bağlantı durumu göstergesi (bağlı/bağlanıyor/koptu)
