# 💰 Gelir (Admin Revenue)

> Sayfa: `admin/revenue/page.tsx`
> Route: `/admin/revenue`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatCard | tremor | İstatistik kartları |
| ChartCard | tremor | Grafik kartı |
| BarChart | LazyCharts | Gelir grafiği |
| PieChart | LazyCharts | Plan dağılımı |

### Veri Akışı
- `adminApi.getRevenue(token)` → Gelir verisi
- `adminApi.getChurnUsers(token)` → Churn kullanıcıları

### DateRange
- 7d / 30d / 90d / 12m / all

## Özellikler

### İstatistik Kartları
- ✅ Toplam gelir
- ✅ Aylık gelir
- ✅ Büyüme oranı
- ✅ Churn rate

### Grafikler
- ✅ **Bar Chart** — Gelir trendi
- ✅ **Pie Chart** — Plan bazlı gelir dağılımı
- ✅ **Tarih aralığı seçici** — 5 seçenek

### Churn Analizi
- ✅ Churn kullanıcı listesi
- ✅ Churn nedenleri

### Erişilebilirlik
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Kapsamlı gelir istatistikleri
- Churn analizi
- Tarih aralığı filtresi
- Lazy loading grafikler

### 🔴 Eksiklikler
- MRR/ARR gösterimi yok
- Cohort analizi yok
- Gelir tahmini yok
- Fatura detayları yok
- Plan bazlı detaylı analiz yok
