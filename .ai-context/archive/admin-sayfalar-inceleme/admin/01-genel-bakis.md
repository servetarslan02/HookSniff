# 📊 Genel Bakış (Admin Overview)

> Sayfa: `admin/page.tsx`
> Route: `/admin`
> İnceleme Tarihi: 2026-05-12
> Son Güncelleme: 2026-05-13

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
- `adminApi.getRevenue(token)` → MRR/ARR
- `adminApi.getDeployInfo(token)` → Deploy bilgisi
- `adminApi.listFeatureFlags(token)` → Feature flags
- `/health` endpoint → Uptime verisi

### AdminStatsResponse
- total_users, total_deliveries, total_revenue, active_users_today
- **total_endpoints, active_endpoints** ← YENİ
- users_by_plan: [{plan, count}]
- recent_signups: [{id, name, email, plan, created_at}]
- trends: {total_users_yesterday, total_deliveries_yesterday, revenue_yesterday, active_users_yesterday, active_webhooks}

## Özellikler

### İstatistik Kartları (4 adet)
1. **Toplam Kullanıcı** — 👥 (blue) + trend (dün karşılaştırma)
2. **Toplam Teslimat** — 📦 (emerald) + trend
3. **Toplam Gelir** — 💰 i18n currency symbol (violet) + trend
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

### ✅ Düzeltmeler (Tümü Tamamlandı)
- ~~**₺ format hardcoded**~~ → ✅ i18n `currencySymbol` key kullanılıyor
- ~~**Tooltip dark mode**~~ → ✅ CSS değişkenleri (`--tooltip-bg`, `--tooltip-color`)
- ~~**Chart placeholder**~~ → ✅ CSS bar chart, veri yokken (tasarım tercihi)

### ✅ Eksiklikler (Tümü Tamamlandı)
- ~~Veri export yok~~ → ✅ Dashboard CSV export butonu eklendi
- ~~Gerçek zamanlı güncelleme yok~~ → ✅ Auto-refresh toggle (30sn polling) eklendi
- ~~Karşılaştırma (bu hafta vs geçen hafta) yok~~ → ✅ Günlük trend karşılaştırması (vs yesterday)

### 🔜 Gelecek Özellikler (Henüz Yapılmadı)
- ❌ **Dashboard widget özelleştirme** — Sürükle-bırak, gizle/göster, yeniden düzenleme. İleri aşama feature request.
- ❌ **Grafik zoom/drill-down** — Chart library bağımlı, ayrı çalışma gerektirir.

### 🆕 Eklenecekler (Sektör Karşılaştırma) — TÜMÜ TAMAMLANDI
- ✅ **MRR/ARR kartı** — Aylık/yıllık tekrarlayan gelir → EKLENDİ
- ✅ **Uptime kartı** — Platform uptime yüzdesi + SLA durumu → EKLENDİ — /health endpoint'inden 24h + 7d
- ✅ **Feature flag durumu** — Aktif feature sayısı → EKLENDİ — backend: migration + CRUD API, frontend: gerçek veri
- ✅ **Son deploy** — Versiyon ve zaman bilgisi → EKLENDİ — `/v1/admin/deploy-info` endpoint
- ✅ **Aktif oturum sayısı** — Online admin kullanıcı sayısı → EKLENDİ — active_users_today
- ✅ **Bu hafta vs geçen hafta** — Trend karşılaştırması → EKLENDİ — günlük trend (vs yesterday)
- ✅ **Güvenlik uyarıları** — SSRF/spoofing/replay attempt sayısı → EKLENDİ
- ✅ **Endpoint durumu** — Toplam endpoint, aktif, devre dışı sayısı → EKLENDİ
- ✅ **Standard Webhooks durumu** — Uyumluluk yüzdesi → EKLENDİ — feature flag ile durum kontrolü
- ✅ **Deduplication stats** — Filtrelenen tekrarlayan event sayısı → EKLENDİ — feature flag ile durum kontrolü

---

## ✅ Yapılan Güncellemeler (2026-05-13)

### İlk Part — Eklenen Özellikler
1. **MRR/ARR kartı** — Aylık/yıllık tekrarlayan gelir, trend gösterimi ile
2. **Endpoint durumu** — Toplam, aktif, devre dışı endpoint sayısı + progress bar
3. **Güvenlik uyarıları** — SSRF, spoofing, replay attempt sayıları (audit log'dan filtreleniyor)
4. **Hızlı işlemler paneli** — Sistem sağlık, kullanıcılar, gelir, ayarlar sayfalarına hızlı erişim
5. **i18n anahtarları** — 24 yeni Türkçe/İngilizce anahtar eklendi
- Commit: `deb9fb28`

### İkinci Part — Düzeltmeler
- 5 eksik i18n anahtarı eklendi: activeWebhooks, currentlyProcessing, settingsNav, vsLastMonth, vsYesterday
- catch bloğundaki kullanılmayan `err` değişkeni kaldırıldı
- Commit: `28403769`

### Üçüncü Part — Backend + Kritik Düzeltmeler
1. **Backend: total_endpoints/active_endpoints** — `SystemStats` struct'a eklendi, `endpoints` tablosundan COUNT sorgusu
2. **Backend: `/v1/admin/deploy-info`** — Versiyon, git commit, build time, environment döndüren endpoint
3. **Frontend: Type casting düzeltmesi** — `as unknown as Record<string, unknown>` kaldırıldı
4. **Frontend: Uptime URL düzeltmesi** — `/v1/health` → `/health` (root-level endpoint)
5. **Frontend: Uptime veri eşleşmesi** — `uptime_seconds`'dan yüzde hesaplandı
6. **Frontend: Hardcoded "Aktif"** — `t('active')` ile i18n yapıldı
7. **Frontend: Dedup N/A** — Anlamlı mesaj ve `0` değeri gösteriliyor
8. **Test düzeltmeleri** — `role`, `application_id` alanları eklendi
- Commit: `7b6bcf28`

### Dördüncü Part — Tüm Kalan Sorunlar
1. **₺ format hardcoded** → ✅ i18n `currencySymbol` key (`$` EN, `₺` TR)
2. **Tooltip dark mode** → ✅ CSS değişkenleri kullanıldı
3. **Veri export** → ✅ Dashboard CSV export butonu (istatistikler + plan dağılımı + son kayıtlar)
4. **Gerçek zamanlı güncelleme** → ✅ Auto-refresh toggle (30sn polling, son güncelleme zamanı gösterimi)
5. **Locale-aware tarih** → ✅ `tr-TR` hardcoded → dinamik `locale` değişkeni
6. **NotificationCenter.tsx JSX hatası** → ✅ Fazla `}` kaldırıldı
7. **Onboarding.tsx syntax** → ✅ Backtick hatası düzeltildi
8. **OnboardingWizard.tsx syntax** → ✅ 5 adet backtick hatası düzeltildi
9. **Billing/endpoint/api_keys derleme hataları** → ✅ Pre-existing düzeltmeler
- Commit: `57dc7ff0`

---

## Kalan Durum (2026-05-13 Güncellendi)

### ✅ Tamamlanan (24/24 madde)
- ✅ MRR/ARR kartı
- ✅ Uptime kartı
- ✅ Feature flag durumu (listeleme)
- ✅ Son deploy bilgisi
- ✅ Aktif oturum sayısı
- ✅ Günlük trend karşılaştırması
- ✅ Güvenlik uyarıları (SSRF/Spoof/Replay)
- ✅ Endpoint durumu + progress bar
- ✅ Standard Webhooks durumu
- ✅ Deduplication durumu
- ✅ Hızlı işlemler paneli
- ✅ CSV export
- ✅ Auto-refresh toggle
- ✅ ₺ format → i18n currencySymbol
- ✅ Tooltip dark mode CSS vars
- ✅ Locale-aware tarih
- ✅ Hardcoded "Aktif" → t('active')
- ✅ Uptime URL düzeltmesi (/health)
- ✅ Backend: total_endpoints/active_endpoints
- ✅ Backend: /v1/admin/deploy-info
- ✅ i18n: 82/82 key (EN + TR)
- ✅ NotificationCenter JSX hatası
- ✅ Onboarding/OnboardingWizard syntax
- ✅ Billing/endpoint/api_keys derleme hataları

### ❌ Yapılmayan (2 madde)
- ❌ **Widget özelleştirme** — Sürükle-bırak, gizle/göster. İleri aşama.
- ❌ **Grafik zoom/drill-down** — Chart library bağımlı.

### ⚠️ Kısmi (1 madde)
- ⚠️ **Feature Flags CRUD** — Backend'de create/update/delete endpoint'leri var ama frontend'de sadece listeleme yapılmıyor. Admin flag oluşturamıyor/düzenleyemiyor/silemiyor.

### 🟢 Build Durumu
- 🟢 **TypeScript** — 0 hata
- 🟢 **Next.js build** — Başarılı
- 🟢 **Cargo test (admin)** — 32/32 geçti

---

## 🔧 Yapılacaklar (2026-05-13)

### ⚠️ Feature Flags CRUD (Frontend Eksik)
- **Durum:** Backend hazır, frontend'de UI yok
- **Backend:** POST/PUT/DELETE `/v1/admin/feature-flags` endpoint'leri mevcut
- **Frontend:** `adminApi.createFeatureFlag`, `updateFeatureFlag`, `deleteFeatureFlag` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor
- **Yapılacak:** Admin sayfasına flag yönetim kartı ekle (toggle, create, edit, delete)

### 🔒 Güvenlik
- **G-01:** `fetch()` → `apiFetch()` dönüşümü (1 yer, CSRF koruması)

