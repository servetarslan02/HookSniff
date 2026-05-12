# 🔍 Arama (Search)

> Sayfa: `dashboard/src/app/[locale]/dashboard/search/page.tsx`
> Route: `/dashboard/search`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatusBadge | `@/components/StatusBadge` | Durum rozeti |
| apiFetch | `@/lib/api` | API istemcisi |

### Veri Akışı
- `apiFetch<SearchResponse>(/search?q=...&status=...&page=...&per_page=20)` → arama sonuçları

### State Yönetimi
| State | Tip | Açıklama |
|-------|-----|----------|
| query | string | Arama sorgusu |
| status | string | Durum filtresi |
| results | SearchResponse | Arama sonuçları |
| loading | boolean | Yükleme |
| error | string | Hata |
| page | number | Mevcut sayfa |

### SearchResponse Interface
```typescript
interface SearchResult {
  id: string;
  event: string | null;
  status: string;
  attempt_count: number;
  response_status: number | null;
  created_at: string;
  endpoint_url: string;
}
```

## Özellikler

### Arama
- ✅ **Debounce** — 300ms gecikme ile otomatik arama
- ✅ **Server-side arama** — API'ye q parametresi gönderiliyor
- ✅ **Durum filtresi** — All/Delivered/Failed/Pending select
- ✅ **Sayfalama** — 20 kayıt/sayfa
- ✅ **Form submit** — Enter ile arama

### Tablo Kolonları
- ID (truncated 12 karakter)
- Event (tag görünümü)
- Status (StatusBadge)
- Endpoint URL (truncated, max-width 200px)
- Attempts + Response status
- Time

### Erişilebilirlik
- ✅ Form submit (Enter)
- ✅ aria-label pagination butonlarında
- ✅ aria-live pagination bilgisinde
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Server-side arama (API ile)
- Debounce (300ms)
- Status filtresi ile birleşik arama
- Pagination
- getErrorMessage yerine doğrudan error handling

### ⚠️ Potansiyel Sorunlar
- **"Search" butonu hardcoded** — i18n key kullanılmamış
- **"Search and filter..." subtitle hardcoded** — i18n key kullanılmamış
- **"Searching..." loading text hardcoded** — i18n key kullanılmamış
- **"results" text hardcoded** — i18n key kullanılmamış
- **_error state unused** — tanımlanmış ama UI'da gösterilmiyor
- **Tablo header'ları kısmen hardcoded** — "ID" i18n değil
- **Tarih formatı** — toLocaleString() locale-aware ama i18n key ile yapılabilir

### 🔴 Eksiklikler
- Tarih aralığı filtresi yok
- Endpoint bazlı filtreleme yok
- Event type bazlı filtreleme yok
- Export (CSV/JSON) yok
- Arama geçmişi (son aramalar) yok
- Gelişmiş filtre (attempt count, response status range) yok
- Bulk işlem yok
- Sonuç sıralama seçeneği yok

---

## 🔧 Yapılacaklar (2026-05-13)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/search/page.tsx`
- **Sorun:** 3 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

### 🔒 Güvenlik

#### G-01: Hardcoded Stringler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/search/page.tsx`
- **Sorun:** "Search", "Search and filter...", "Searching...", "results" hardcoded.
- **Adımlar:**
  1. i18n key'leri ekle: `searchButton`, `searchSubtitle`, `searching`, `results`
