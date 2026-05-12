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

## 🆕 Eksik Admin Sayfaları — 10 Sayfa Yapısı

Tüm özellikler aşağıdaki 10 sayfaya toplanmıştır (özellik kaybı yok):

### 1. 📊 Genel Bakış (`/admin`) — Mevcut + Genişletilmiş
**Mevcut:** 4 istatistik kartı, plan dağılımı, son aktivite, recent signups
**Eklenecek:**
- MRR/ARR kartı — Aylık/yıllık tekrarlayan gelir
- Uptime kartı — Platform uptime yüzdesi + SLA durumu
- Feature flag durumu — Aktif/pasif feature sayısı
- Son deploy — Versiyon ve zaman bilgisi
- Güvenlik uyarıları — SSRF/spoofing/replay attempt sayısı
- Endpoint durumu — Toplam, aktif, devre dışı
- Standard Webhooks durumu — Uyumluluk yüzdesi
- Deduplication stats — Filtrelenen tekrarlayan event

### 2. 👤 Kullanıcılar (`/admin/users`) — Mevcut + Genişletilmiş
**Mevcut:** Arama, filtre, sıralama, toplu işlem, impersonate, CSV export
**Eklenecek:**
- Müşteri notları ve etiketleri
- Müşteri geçmişi (plan değişiklik, ban, impersonate)
- Müşteri sağlık skoru
- Support Agent rolü (Svix ✅)
- Müşteri segmentasyonu
- Müşteri iletişim geçmişi
- Müşteri dashboard'u (admin gözünden)

### 3. 💰 Gelir (`/admin/revenue`) — Mevcut + Genişletilmiş
**Mevcut:** Gelir istatistikleri, tarih aralığı, churn analizi
**Eklenecek:**
- MRR/ARR kartı
- ARPU kartı
- LTV kartı
- Gelir projeksiyonu (3/6/12 ay)
- Cohort analizi
- Net Revenue Retention
- Expansion Revenue
- Fatura yönetimi (oluşturma, düzenleme, iptal)
- Ödeme geçmişi
- Promosyon/kupon yönetimi
- Fiyatlandırma planı yönetimi

### 4. 🖥️ Sistem (`/admin/system`) — Mevcut + Genişletilmiş
**Mevcut:** DB/Redis/API durumu, queue, son hatalar
**Eklenecek:**
- Backup yönetimi (manuel tetikleme, geçmişi, restore, cron, retention)
- Uptime monitoring (24h/7d/30d, SLA hedefi, incident geçmişi)
- Log seviyesi ayarı (Debug/Info/Warn/Error, modül bazlı)
- Feature flags (toggle, percentage rollout, A/B testing, geçmişi)
- Canlı log akışı (WebSocket streaming)
- Servis restart (API/Worker/DB)
- Bağlantı havuzu durumu (DB, Redis)
- Disk kullanımı
- Structured health checks (worker bazlı JSON)
- Deploy yönetimi (rollback, versiyon geçmişi)
- Environment yönetimi (staging/production)
- Cache yönetimi (Redis temizleme, TTL)
- Rate limit yönetimi (global + per-customer)

### 5. 📋 Aktivite (`/admin/activity`) — Mevcut + Genişletilmiş
**Mevcut:** Audit log, aksiyon filtreleme, sayfalama
**Eklenecek:**
- SSRF attempt log (hangi müşteri, hangi URL)
- Spoofing attempt log (sahte webhook tespit)
- Replay attempt log (replay saldırı tespit)
- Endpoint disable log (devre dışı kalma geçmişi)
- Support Agent erişim log (destek ekibi portal erişimi)
- Session management (aktif oturum listesi, sonlandırma)
- 2FA zorunlu (admin kullanıcılar için)
- IP whitelist (admin paneline erişim kısıtlaması)
- Login history (başarılı/başarısız giriş denemeleri)
- Anomali tespiti (olağandışı aktivite uyarısı)
- Quick filter (tek tıkla filtre oluşturma)

### 6. ⚙️ Ayarlar (`/admin/settings`) — Mevcut + Genişletilmiş
**Mevcut:** Platform ayarları (20+), alert kuralları
**Eklenecek:**
- Standard Webhooks ayarları (toggle, custom ID, prefix)
- Retry schedule ayarları (varsayılan + custom: 5sn, 1dk, 10dk, 1sa)
- Deduplication ayarları (exact, field-based, time window)
- Email template yönetimi (endpoint disable, welcome, billing, maintenance, feature)
- Bildirim kanal ayarları (Slack, Teams, Discord, PagerDuty, OpsGenie, custom webhook)
- GDPR ayarları (data deletion, consent log, data export, breach notification, DPO)
- Whitelabel ayarları (logo, renk, CSS, footer, favicon)
- Password policy (minimum uzunluk, karmaşıklık)
- API key rotasyonu ayarları
- API versiyon yönetimi

### 7. 🛡️ Güvenlik (`/admin/security`) — YENİ
**Eklenecek:**
- SSRF attempt dashboard (hangi müşteri, hangi URL, zaman)
- Webhook spoofing tespit dashboard
- Replay attack tespit dashboard
- Endpoint spam tespiti
- Abuse tespit dashboard (anormal kullanım pattern)
- Rate limit ihlali takibi
- IP reputation kontrolü
- Hesap kilidi yönetimi
- Toplu hesap oluşturma tespiti
- SOC 2 durumu ve eksikler
- GDPR uyumluluk durumu
- Compliance dashboard

### 8. 🧪 Webhook Araçları (`/admin/webhook-tools`) — YENİ
**Eklenecek:**
- Webhook test konsolu (admin'den test gönderme, payload template, sonuç)
- Bulk replay (tarih aralığı, durum bazlı filtre, endpoint bazlı, ilerleme)
- Quick filters (tek tıkla filtre)
- Payload analizi (şüpheli içerik tespiti)
- Custom retry schedule test
- Deduplication test

### 9. 📊 Raporlar (`/admin/reports`) — YENİ
**Eklenecek:**
- Haftalık/aylık otomatik rapor
- Platform metrikleri raporu
- Kullanım projeksiyonu (kapasite planlama)
- Maliyet analizi (altyapı maliyeti vs gelir)
- Performans raporu (P50/P95/P99 latency, error rate)
- Müşteri segment raporu
- Metrik export (New Relic/Datadog/Grafana)
- Custom dashboard (widget sürükle-bırak)

### 10. 👥 Ekip (`/admin/team`) — YENİ
**Eklenecek:**
- Admin kullanıcı listesi
- Rol yönetimi (Admin, Member, Viewer, Support Agent)
- Support Agent rolü (müşteri portalı önizleme yetkisi)
- Davet yönetimi
- 2FA zorunluluk ayarı
- IP whitelist ayarı
- Session timeout ayarı
- Password policy ayarı

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
