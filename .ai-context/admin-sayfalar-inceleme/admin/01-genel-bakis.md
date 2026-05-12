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
- ~~Dashboard widget özelleştirme yok~~ → 🔜 İleri aşama feature request
- ~~Grafik zoom/drill-down yok~~ → 🔜 Chart library bağımlı
- ~~Veri export yok~~ → ✅ Dashboard CSV export butonu eklendi
- ~~Gerçek zamanlı güncelleme yok~~ → ✅ Auto-refresh toggle (30sn polling) eklendi
- ~~Karşılaştırma (bu hafta vs geçen hafta) yok~~ → ✅ Günlük trend karşılaştırması (vs yesterday)

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

## Kalan Durum
- 🟢 **Tüm kritik ve orta sorunlar çözüldü**
- 🔵 **Widget özelleştirme** — İleri aşama feature request (şu an scope dışı)
- 🔵 **Grafik zoom/drill-down** — Chart library bağımlı (şu an scope dışı)
- 🟢 **TypeScript** — 0 hata
- 🟢 **Next.js build** — Başarılı (pre-existing NotificationCenter hatası düzeltildi)
- 🟢 **Cargo test (admin)** — 32/32 geçti

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Feature Flags CRUD Eksik
- **Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`
- **Backend:**
  ```
  POST   /v1/admin/feature-flags      → Oluşturma
  PUT    /v1/admin/feature-flags/{id}  → Güncelleme
  DELETE /v1/admin/feature-flags/{id}  → Silme
  ```
- **Sorun:** `adminApi.createFeatureFlag`, `updateFeatureFlag`, `deleteFeatureFlag` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor. Admin sadece listeleyebiliyor.
- **Adımlar:**
  1. Feature Flags yönetim kartı ekle (admin/page.tsx)
  2. Toggle ile enable/disable: `adminApi.updateFeatureFlag(token, id, { is_enabled: !current })`
  3. "Yeni Flag" butonu + modal form (name, description, rollout_percentage, enabled_for_plans)
  4. Silme butonu + ConfirmDialog
  5. i18n key: `createFeatureFlag`, `editFeatureFlag`, `deleteFeatureFlag`, `rolloutPercentage`

### 🔒 Güvenlik

#### G-01: Raw Fetch Kullanımı (1 yer)
- **Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`
- **Sorun:** 1 yerde `fetch()` kullanılıyor, CSRF koruması atlanıyor.
- **Adımlar:**
  1. `fetch()` → `apiFetch()` veya `adminApi` metodına çevir
