# 🔀 Yönlendirme (Routing)

> Sayfa: `dashboard/src/app/[locale]/dashboard/routing/page.tsx`
> Route: `/dashboard/routing`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- RoutingInfo — Endpoint bazlı routing bilgisi
- Fallback URL desteği

### RoutingInfo
- id, url, endpoint_id, routing_strategy, fallback_url
- avg_response_ms, failure_streak, is_healthy, resolved_url, using_fallback

## Özellikler
- ✅ Endpoint listesi
- ✅ Routing strategy gösterimi
- ✅ Fallback URL
- ✅ Sağlık durumu (is_healthy)
- ✅ Failure streak
- ✅ Ortalama response time
- ✅ Fallback kullanımı (using_fallback)

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Routing düzenleme yok** — Sadece listeleme
- **Fallback URL ekleme/düzenleme yok**

### 🔴 Eksiklikler
- Routing strategy değiştirme
- Fallback URL ekleme/düzenleme
- Routing kuralı oluşturma
- Health check ayarları
