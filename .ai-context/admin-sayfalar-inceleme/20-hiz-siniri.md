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
