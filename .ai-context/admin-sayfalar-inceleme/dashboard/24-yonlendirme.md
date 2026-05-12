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

---

## 🔧 Backend & Frontend Uyumsuzluğu (2026-05-13)

### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Routing düzenleme | `PUT /v1/endpoints/{id}/routing` (update_routing) | ❌ Düzenleme formu yok | EKLENMELİ |
| Health kontrolü | `GET /v1/endpoints/{id}/routing/health` (get_health) | ❌ Detay gösterimi yok | EKLENMELİ |

### Yapılacaklar
1. **Routing Düzenleme Formu** — Endpoint routing stratejisi ve fallback URL
   - Backend: `PUT /v1/endpoints/{id}/routing` zaten var
   - Frontend: "Düzenle" butonu → Modal: routing_strategy select + fallback_url input
   - Strateji seçenekleri: round-robin, weighted, fallback
2. **Fallback URL Ekleme** — Alternatif endpoint URL'si
   - Backend: `update_routing` içinde fallback_url destekliyor
   - Frontend: Mevcut routing kartına "Fallback URL Ekle" butonu
3. **Health Durumu Detayı** — Endpoint sağlık kontrolü
   - Backend: `GET /v1/endpoints/{id}/routing/health` zaten var
   - Frontend: Sağlık durumu kartı (is_healthy, failure_streak, avg_response_ms)
4. **Routing Kuralı Oluşturma** — Yeni routing kuralı
   - Frontend: "Yeni Kural" butonu → Form: endpoint seç, strateji, fallback
