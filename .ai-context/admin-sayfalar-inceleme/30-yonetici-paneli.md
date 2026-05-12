# ⚡ Yönetici Paneli (Admin Panel)

> Route: `/admin`
> İnceleme Tarihi: 2026-05-12

## Alt Sayfalar

### 1. 📊 Genel Bakış (Overview)
> Sayfa: `admin/page.tsx`
> Route: `/admin`

**Bileşenler:** StatCard, PieChart (LazyCharts)
**Veri:** `adminApi.getStats(token)`, `adminApi.getAuditLogs(token)`

**Özellikler:**
- ✅ Admin istatistikleri (StatCard)
- ✅ Plan dağılımı (PieChart: free/pro/business)
- ✅ Audit log özeti
- ✅ Paralel API çağrısı
- ✅ i18n desteği

**Eksiklikler:**
- Gerçek zamanlı güncelleme yok
- Dashboard widget'ları özelleştirilemiyor

---

### 2. 👤 Kullanıcılar (Users)
> Sayfa: `admin/users/page.tsx`
> Route: `/admin/users`
> Detay: `admin/users/[id]/page.tsx`

**Özellikler:**
- ✅ Kullanıcı listeleme (sayfalama)
- ✅ Arama (email, ad)
- ✅ Plan filtresi (free/pro/business)
- ✅ Plan badge renkleri
- ✅ Kullanıcı detayına yönlendirme
- ✅ i18n desteği

**Eksiklikler:**
- Toplu işlem yok
- Export yok
- Kullanıcı düzenleme (admin) yok

---

### 3. 💰 Gelir (Revenue)
> Sayfa: `admin/revenue/page.tsx`
> Route: `/admin/revenue`

**Bileşenler:** StatCard, ChartCard, BarChart, PieChart
**Veri:** `adminApi.getRevenue(token)`, `adminApi.getChurnUsers(token)`

**Özellikler:**
- ✅ Gelir istatistikleri (StatCard)
- ✅ Tarih aralığı seçici (7d/30d/90d/12m/all)
- ✅ Gelir grafiği (BarChart)
- ✅ Plan dağılımı (PieChart)
- ✅ Churn analizi (kayıp kullanıcılar)
- ✅ Plan fiyatları gösterimi
- ✅ i18n desteği

**Eksiklikler:**
- Gelir tahmini yok
- MRR/ARR gösterimi yok
- Cohort analizi yok

---

### 4. 🖥️ Sistem (System)
> Sayfa: `admin/system/page.tsx`
> Route: `/admin/system`

**Veri:** `adminApi.getSystemHealth(token)`

**Özellikler:**
- ✅ Veritabanı durumu + latency
- ✅ Redis durumu + latency
- ✅ API uptime
- ✅ Queue durumu (pending/processing/failed)
- ✅ DB boyutu
- ✅ Son hatalar
- ✅ Queue detayları
- ✅ Fallback mock data (API erişilemezse)
- ✅ i18n desteği

**Eksiklikler:**
- Sistem metrikleri grafiği yok
- Log viewer yok
- Servis restart butonu yok

---

### 5. 📋 Aktivite (Activity)
> Sayfa: `admin/activity/page.tsx`
> Route: `/admin/activity`

**Veri:** `adminApi.getAuditLogs(token)`

**Özellikler:**
- ✅ Audit log listesi
- ✅ Aksiyon renk kodları (LOGIN, REGISTER, ENDPOINT_CREATE, vb.)
- ✅ Sayfalama
- ✅ Filtreleme
- ✅ i18n desteği

**Eksiklikler:**
- Export yok
- Tarih aralığı filtresi yok
- Actor bazlı filtreleme yok

---

### 6. ⚙️ Ayarlar (Settings)
> Sayfa: `admin/settings/page.tsx`
> Route: `/admin/settings`

**PlatformSettings Interface:**
- default_plan, max_endpoints_free/pro, max_webhooks_free/pro
- rate_limit_free/pro, retry_max_attempts
- retention_days_free/pro, maintenance_mode, signup_enabled
- plan_price_pro/business, resend_api_key, email_sender
- webhook_secret, backup_retention_days, global_rate_limit, cors_origins

**AlertRule Interface:**
- id, customer_id, customer_email, name, condition, threshold
- channels, is_active, created_at

**Özellikler:**
- ✅ Platform ayarları (plan limitleri, rate limit)
- ✅ Bakım modu toggle
- ✅ Kayıt açık/kapalı toggle
- ✅ Plan fiyatları düzenleme
- ✅ Alert kuralı yönetimi
- ✅ i18n desteği

**Eksiklikler:**
- Backup yönetimi yok
- Log seviyesi ayarı yok
- API versiyon yönetimi yok

---

## Admin Panel Genel Değerlendirme

### ✅ İyi Yönler
- 6 alt sayfa, kapsamlı admin özellikleri
- StatCard ve ChartCard entegrasyonu
- Lazy loading grafikler
- i18n tam destek
- Rol bazlı erişim kontrolü
- Audit log entegrasyonu

### ⚠️ Potansiyel Sorunlar
- **Veri doğrulama** — Bazı admin API'leri hata dönebilir (DATABASE_ERROR)
- **Grafik performansı** — Büyük veri setlerinde yavaşlama

### 🔴 Eksiklikler
- Admin dashboard özelleştirme
- Real-time monitoring
- Alert yönetimi (admin bazlı)
- Kullanıcı impersonate (detay sayfasında var)
- Sistem log viewer
- Backup yönetimi
- API key yönetimi (admin)
