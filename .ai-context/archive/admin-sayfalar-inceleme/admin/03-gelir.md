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

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **MRR kartı** — Monthly Recurring Revenue (₺)
- **ARR kartı** — Annual Recurring Revenue (₺)
- **ARPU kartı** — Average Revenue Per User (₺)
- **LTV kartı** — Customer Lifetime Value (₺)
- **Gelir projeksiyonu** — 3/6/12 aylık tahmini gelir grafiği
- **Cohort analizi** — Aylık müşteri cohort gelir karşılaştırması
- **Net Revenue Retention** — Mevcut müşterilerden gelir tutma oranı
- **Expansion Revenue** — Plan yükseltmelerden gelen ek gelir
- MRR/ARR gösterimi yok
- Cohort analizi yok
- Gelir tahmini yok
- Fatura detayları yok
- Plan bazlı detaylı analiz yok
