# 📊 Genel Bakış (Admin Overview)

> Sayfa: `admin/page.tsx`
> Route: `/admin`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatCard | tremor | İstatistik kartları |
| PieChart | LazyCharts | Plan dağılımı |
| Link | i18n/navigation | Sayfa yönlendirme |

### Veri Akışı
- `adminApi.getStats(token)` → Admin istatistikleri
- `adminApi.getAuditLogs(token, {limit: 5})` → Son aktiviteler

### AdminStatsResponse
- total_users, total_deliveries, total_revenue, active_users_today
- users_by_plan: [{plan, count}]
- recent_signups: [{id, name, email, plan, created_at}]
- trends: {total_users_yesterday, total_deliveries_yesterday, revenue_yesterday, active_users_yesterday, active_webhooks}

## Özellikler

### İstatistik Kartları (4 adet)
1. **Toplam Kullanıcı** — 👥 (blue) + trend (dün karşılaştırma)
2. **Toplam Teslimat** — 📦 (emerald) + trend
3. **Toplam Gelir** — 💰 ₺ format (violet) + trend
4. **Aktif Kullanıcı Bugün** — 🔥 (amber) + trend

### Grafikler
- ✅ **Users by Plan** — PieChart (free/pro/business, renk kodlu)
- ✅ **Chart Placeholder** — Veri yoksa CSS bar chart (Item 67)

### Listeler
- ✅ **Recent Activity** — Son 5 audit log kaydı
- ✅ **Recent Signups** — Son kayıt olan kullanıcılar
- ✅ **Live Webhooks** — Aktif webhook sayısı (animasyonlu indicator)

### Erişilebilirlik
- ✅ aria-hidden emoji'lerde
- ✅ scope="col" tablo header'larında
- ✅ Dark mode tam destek
- ✅ i18n tüm metinlerde

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- 4 istatistik kartı (trend karşılaştırmalı)
- PieChart ile plan dağılımı
- Live webhooks indicator (animasyonlu)
- Audit log özeti (son 5)
- Recent signups listesi
- Error state with retry
- Skeleton loading
- i18n tam destek

### ⚠️ Potansiyel Sorunlar
- **₺ format hardcoded** — `₺${value.toLocaleString()}` i18n key ile yapılabilir
- **Tooltip dark mode** — Hardcoded dark bg color
- **Chart placeholder** — CSS bar chart, gerçek veri olmadığında

### 🔴 Eksiklikler
- Dashboard widget özelleştirme yok
- Grafik zoom/drill-down yok
- Veri export yok
- Gerçek zamanlı güncelleme yok
- Karşılaştırma (bu hafta vs geçen hafta) yok
