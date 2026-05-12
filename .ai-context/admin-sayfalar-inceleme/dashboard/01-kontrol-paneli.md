# 📊 Kontrol Paneli (Dashboard Overview)

> Sayfa: `dashboard/src/app/[locale]/dashboard/page.tsx`
> Route: `/dashboard`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| OnboardingWizard | `@/components/OnboardingWizard` | İlk giriş wizard'ı |
| SetupChecklist | `@/components/OnboardingWizard` | Kurulum kontrol listesi |
| StatCard | `@/components/tremor` | İstatistik kartları |
| TimeRangeSelector | `./components/TimeRangeSelector` | Zaman aralığı seçici |
| AnimatedCounter | `./components/AnimatedCounter` | Animasyonlu sayılar |
| DeliveryTrendChart | `./components/DeliveryTrendChart` | Teslimat trend grafiği |
| SuccessRateDonut | `./components/SuccessRateDonut` | Başarı oranı donut grafiği |
| ActivityFeed | `./components/ActivityFeed` | Son aktivite akışı |
| RecentDeliveriesTable | `./components/RecentDeliveriesTable` | Son teslimatlar tablosu |

### Veri Akışı
1. `useAuth()` → token alınır
2. `statsApi.get(token)` → genel istatistikler
3. `webhooksApi.list(token, {page: 1})` → son teslimatlar (5 adet)
4. `analyticsApi.deliveryTrend(token, timeRange)` → trend verisi
5. `analyticsApi.successRate(token, timeRange)` → başarı oranı verisi

### İstatistik Kartları (6 adet)
1. **Toplam Teslimat** — `stats.total_deliveries` (mavi)
2. **Teslim Edilen** — `stats.delivered` (yeşil)
3. **Başarısız** — `stats.failed` (kırmızı)
4. **Başarı Oranı** — `stats.success_rate` (mor, %)
5. **Bekleyen** — `stats.pending` (sarı)
6. **Endpoint Sayısı** — `stats.endpoints_count` (gri)

### Zaman Aralığı Seçici
- `TimeRange` tipi ile filtreleme
- Değişiklikte otomatik analytics yenileme

### Loading State
- 6 adet skeleton shimmer kart
- `mounted` flag ile cleanup kontrolü

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- i18n kullanımı (dashboard, common namespace)
- Skeleton loading state
- Cleanup (mounted flag)
- Error handling (try/catch + fallback)
- Time range ile dinamik grafik
- OnboardingWizard + SetupChecklist entegrasyonu

### ⚠️ Potansiyel Sorunlar
- `_error` state tanımlanmış ama UI'da gösterilmiyor (sadece console)
- `recentDeliveries` sadece ilk 5 item — pagination yok
- Analytics catch bloğu boş (`// ignore`)
- Token null iken bileşenler render ediliyor (early return yok)
- `useEffect` dependency array'de `t` ve `tc` yok (stable reference)

### 🔴 Eksiklikler
- Error toast/banner gösterimi yok
- Refresh/polling mekanizması yok (manuel yenileme gerekli)
- Empty state tasarımı yok (hiç veri yoksa)
- Grafik verisi yoksa placeholder mesajı eksik
- Mobile responsive grid breakpoint'leri kontrol edilmeli

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **MRR/ARR kartı** — Aylık/yıllık tekrarlayan gelir gösterimi
- **Uptime göstergesi** — Platform uptime yüzdesi (SLA takibi)
- **Feature flag durumu** — Aktif/pasif feature sayısı
- **Son deploy bilgisi** — Son deployment zamanı ve versiyon
