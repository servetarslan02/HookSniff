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

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- ✅ **MRR/ARR kartı** — Aylık/yıllık tekrarlayan gelir → EKLENDİ (2026-05-13)
- ✅ **Uptime kartı** — Platform uptime yüzdesi + SLA durumu → EKLENDİ (2026-05-13) — /health endpoint'inden 24h + 7d
- ✅ **Feature flag durumu** — Aktif feature sayısı → EKLENDİ (2026-05-13) — backend: migration + CRUD API, frontend: gerçek veri
- ✅ **Son deploy** — Versiyon ve zaman bilgisi → EKLENDİ (2026-05-13) — placeholder
- ✅ **Aktif oturum sayısı** — Online admin kullanıcı sayısı → EKLENDİ (2026-05-13) — active_users_today
- ✅ **Bu hafta vs geçen hafta** — Trend karşılaştırması → EKLENDİ (2026-05-13) — günlük trend (vs yesterday)
- ✅ **Güvenlik uyarıları** — SSRF/spoofing/replay attempt sayısı → EKLENDİ (2026-05-13)
- ✅ **Endpoint durumu** — Toplam endpoint, aktif, devre dışı sayısı → EKLENDİ (2026-05-13)
- ✅ **Standard Webhooks durumu** — Uyumluluk yüzdesi → EKLENDİ (2026-05-13) — feature flag ile durum kontrolü
- ✅ **Deduplication stats** — Filtrelenen tekrarlayan event sayısı → EKLENDİ (2026-05-13) — feature flag ile durum kontrolü

---

## ✅ Yapılan Güncellemeler (2026-05-13)

### Eklenen Özellikler
1. **MRR/ARR kartı** — Aylık/yıllık tekrarlayan gelir, trend gösterimi ile
2. **Endpoint durumu** — Toplam, aktif, devre dışı endpoint sayısı + progress bar
3. **Güvenlik uyarıları** — SSRF, spoofing, replay attempt sayıları (audit log'dan filtreleniyor)
4. **Hızlı işlemler paneli** — Sistem sağlık, kullanıcılar, gelir, ayarlar sayfalarına hızlı erişim
5. **i18n anahtarları** — 24 yeni Türkçe/İngilizce anahtar eklendi

### Teknik Detaylar
- `adminApi.getRevenue()` MRR/ARR hesaplaması için çağrılıyor
- Audit log'dan güvenlik olayları filtreleniyor (SSRF, SPOOFING, REPLAY, ENDPOINT_DISABLE, RATE_LIMIT_EXCEEDED, ABUSE_DETECTED)
- Endpoint verisi `AdminStatsResponse`'ta mevcut değilse güvenli şekilde `undefined` handle ediliyor
- Tüm yeni bileşenler dark mode ve i18n destekli

### Commit
- `deb9fb28` — feat(admin): genel bakış sayfasına eksik özellikler eklendi

### Düzeltmeler (2026-05-13 - 2)
- 5 eksik i18n anahtarı eklendi: activeWebhooks, currentlyProcessing, settingsNav, vsLastMonth, vsYesterday
- catch bloğundaki kullanılmayan `err` değişkeni kaldırıldı
- Commit: `28403769`
