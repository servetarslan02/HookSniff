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

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **MRR/ARR grafiği** — Aylık/yıllık tekrarlayan gelir trendi
- **ARPU** — Kullanıcı başına ortalama gelir
- **LTV** — Müşteri yaşam boyu değeri
- **Churn rate grafiği** — Tarih bazlı churn trendi
- **Cohort analizi** — Müşteri cohort karşılaştırması
- **Gelir projeksiyonu** — Gelecek dönem gelir tahmini
- **Deduplication metrics** — Filtrelenen event sayısı ve oranı
- **Standard Webhooks adoption** — Uyumluluk oranı
- **Quick filter** — Grafiklerde tek tıkla filtre (Hookdeck ✅)
- **Metrik export** — New Relic/Datadog/Grafana'ya export (Hookdeck ✅)
- Endpoint bazlı analitik
- Event type bazlı analitik
- Tarih aralığı özel seçici (custom range)
- Veri export (CSV/PNG)
- Grafik zoom/drill-down
- Karşılaştırma (önceki dönem)
- Heatmap (saat/gün bazlı)
- Latency dağılım grafiği

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Latency Trend Grafiği Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`
- **Backend:** `GET /v1/analytics/latency` — gecikme trendi verisi
- **Sorun:** `analyticsApi.latencyTrend` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor.
- **Adımlar:**
  1. `analyticsApi.latencyTrend(token, timeRange)` çağrısını ekle
  2. Yeni grafik bileşeni: AreaChart (P50, P95, P99 gecikme)
  3. i18n key: `latencyTrend`, `p50`, `p95`, `p99`

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`
- **Sorun:** Grafik verisi tek seferde yükleniyor.
- **Adımlar:**
  1. Lazy loading: Grafik viewport'a girdiğinde yükle
