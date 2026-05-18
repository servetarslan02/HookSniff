# ⚡ Hız Sınırı (Rate Limiting)

> Sayfa: `dashboard/src/app/[locale]/dashboard/rate-limiting/page.tsx`
> Route: `/dashboard/rate-limiting`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- RateLimitInfo — Endpoint bazlı limit bilgisi
- RateLimitStats — Genel istatistikler

### RateLimitInfo
- endpoint_id, endpoint_url, requests_per_second, requests_per_minute
- burst_size, current_queue_depth, throttled_count, last_throttled_at

### RateLimitStats
- total_endpoints, total_throttled, avg_rps, peak_rps, limits[]

## Özellikler
- ✅ Genel istatistikler (toplam endpoint, throttle, RPS)
- ✅ Endpoint bazlı limit listesi
- ✅ RPS ve burst size gösterimi
- ✅ Queue depth ve throttle sayısı
- ✅ Son throttle zamanı

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Veri dönüştürme** — API'den gelen veri stats formatına dönüştürülüyor
- **Bazı alanlar hardcoded 0** — current_queue_depth, throttled_count

### 🔴 Eksiklikler
- Rate limit düzenleme formu
- Endpoint bazlı limit ayarlama
- Throttle geçmişi grafiği
- Rate limit alert entegrasyonu

---

## 🔧 Backend & Frontend Uyumsuzluğu (2026-05-13)

### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Rate limit ayarlama | `POST /v1/rate-limits/{endpoint_id}` (set_rate_limit) | ❌ Form yok | EKLENMELİ |
| Rate limit silme | `DELETE /v1/rate-limits/{endpoint_id}` (delete_rate_limit) | ❌ Buton yok | EKLENMELİ |

### Yapılacaklar
1. **Rate Limit Ayarlama Formu** — Endpoint bazlı limit
   - Backend: `POST /v1/rate-limits/{endpoint_id}` zaten var
   - Frontend: "Limit Ayarla" butonu → Modal: endpoint seç, requests_per_second, burst_size input
   - Mevcut limit varsa düzenleme modu
2. **Rate Limit Silme** — Endpoint limitini kaldırma
   - Backend: `DELETE /v1/rate-limits/{endpoint_id}` zaten var
   - Frontend: ConfirmDialog ile silme butonu
3. **Endpoint Bazlı Limit Düzenleme** — Mevcut limiti değiştirme
   - Frontend: Her rate limit kartında "Düzenle" butonu → inline edit veya modal
4. **Toplu Rate Limit** — Tüm endpoint'ler için varsayılan limit
   - Frontend: "Varsayılan Limit" kartı + ayarlama formu

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Rate Limit Ayarlama Formu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
- **Backend:** `POST /v1/rate-limits/{endpoint_id}` — rate limit ayarlama
- **Sorun:** Sadece okuma var, ayarlama formu yok.
- **Adımlar:**
  1. "Limit Ayarla" butonu ekle
  2. Modal form: endpoint seçici, requests_per_second (input), burst_size (input)
  3. `apiFetch('/rate-limits/${endpointId}', { method: 'POST', body: { requests_per_second, burst_size }, token })` çağrısı
  4. Mevcut limit varsa düzenleme modu
  5. i18n key: `setRateLimit`, `requestsPerSecond`, `burstSize`, `rateLimitSet`

#### BF-02: Rate Limit Silme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
- **Backend:** `DELETE /v1/rate-limits/{endpoint_id}` — rate limit silme
- **Sorun:** Silme butonu yok.
- **Adımlar:**
  1. Her rate limit kartına silme butonu ekle
  2. ConfirmDialog: "Rate limit silinecek"
  3. `apiFetch('/rate-limits/${endpointId}', { method: 'DELETE', token })` çağrısı

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
- **Sorun:** 2 useEffect, 4 fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/rate-limiting/page.tsx`
- **Sorun:** Tüm limitler tek seferde yükleniyor.
