# 📈 Analitik (Analytics)

> Sayfa: `dashboard/src/app/[locale]/dashboard/analytics/page.tsx`
> Route: `/dashboard/analytics`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| AreaChart | LazyCharts | Teslimat trendi grafiği |
| PieChart | LazyCharts | Başarı oranı donut grafiği |
| ChartCard | tremor | Grafik kartı |
| StatCard | tremor | İstatistik kartı |

### Veri Akışı
- `analyticsApi.deliveryTrend(token, timeRange)` → trend verisi
- `analyticsApi.successRate(token, timeRange)` → başarı oranı verisi

### Grafikler
1. **Delivery Trend** — Area chart (successful + failed)
2. **Success Rate** — Donut pie chart (successful/failed/pending)

## Özellikler

### Zaman Aralığı
- ✅ 24h / 7d / 30d seçici
- ✅ ChartCard entegre time range selector

### İstatistik Kartları (3 adet)
1. **Success Rate** — % (emerald)
2. **Total Delivered** — Sayı (blue)
3. **Total Failed** — Sayı (red)

### Grafikler
- ✅ **Area Chart** — Gradient fill, grid, tooltip, legend
- ✅ **Donut Chart** — Center label ile success rate
- ✅ **Responsive** — ResponsiveContainer

### Erişilebilirlik
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Lazy loading grafikler (LazyCharts)
- Gradient fill area chart
- Donut chart center label
- StatCard entegrasyonu
- Paralel API çağrısı (Promise.all)
- i18n tam destek

### ⚠️ Potansiyel Sorunlar
- **Endpoint bazlı filtreleme yok** — Tüm endpoint'ler için
- **Event type bazlı filtreleme yok**
- **Export yok** — Veri dışa aktarma
- **Grafik zoom/drill-down yok**

### 🔴 Eksiklikler
- Endpoint bazlı analitik
- Event type bazlı analitik
- Tarih aralığı özel seçici (custom range)
- Veri export (CSV/PNG)
- Grafik zoom/drill-down
- Karşılaştırma (önceki dönem)
- Heatmap (saat/gün bazlı)
- Latency dağılım grafiği
