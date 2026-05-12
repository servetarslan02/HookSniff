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

## 🆕 Eksik Admin Sayfaları (Sektör Karşılaştırma)

### 7. 🚩 Feature Flags (`/admin/feature-flags`)
- Özellik açma/kapama toggle'ları
- Percentage rollout (kullanıcı yüzdesine göre)
- A/B testing desteği
- Feature flag geçmişi
- **Rakipler:** Svix ✅, Hookdeck ✅

### 8. 💾 Backup Yönetimi (`/admin/backups`)
- Manuel backup tetikleme
- Backup geçmişi listesi
- Restore işlemi
- Backup zamanlaması (cron)
- Retention policy ayarı
- **Rakipler:** Convoy ✅, Hookdeck ✅

### 9. 📊 Uptime Monitoring (`/admin/uptime`)
- Platform uptime yüzdesi (24h/7d/30d)
- SLA hedefi takibi
- Incident geçmişi
- Status page entegrasyonu
- **Rakipler:** Svix ✅ (%99.999997), Hookdeck ✅

### 10. 🧪 Webhook Test Konsolu (`/admin/webhook-test`)
- Admin'den webhook test gönderme
- Payload template seçici
- Sonuç gösterimi (status, response, duration)
- Geçmiş test kayıtları
- **Rakipler:** Hookdeck ✅, Svix ✅

### 11. 🔄 Bulk Replay (`/admin/bulk-replay`)
- Tarih aralığı seçimi
- Durum bazlı filtre (sadece failed'lar)
- Endpoint bazlı seçim
- İlerleme göstergesi
- **Rakipler:** Svix ✅, Hookdeck ✅

### 12. 📜 Sistem Log Viewer (`/admin/system-logs`)
- Raw log görüntüleyici
- Log seviyesi filtresi (Debug/Info/Warn/Error)
- Tarih aralığı
- Arama (keyword)
- Streaming (canlı log akışı)
- **Rakipler:** Convoy ✅, Hookdeck ✅

---

### 13. 🛡️ Güvenlik Dashboard (`/admin/security`)
- SSRF attempt log'u (hangi müşteri, hangi URL denedi)
- Webhook spoofing tespit log'u
- Replay attack tespit log'u
- Endpoint spam tespiti
- Şüpheli aktivite listesi
- IP reputation kontrolü
- **Rakipler:** Svix ✅, Hookdeck ✅
- **Kaynak:** Güvenlik araştırması — SSRF, spoofing, replay vektörleri

### 14. 📧 Email Şablonları (`/admin/email-templates`)
- Endpoint disable email şablonu (whitelabel)
- Welcome email şablonu
- Billing hatırlatma şablonu
- Maintenance bildirim şablonu
- Feature announcement şablonu
- **Rakipler:** Svix ✅ (Ağustos 2025'te ekledi)
- **Kaynak:** Svix changelog — Email Notifications

### 15. 🔔 Bildirim Kanalları (`/admin/notification-channels`)
- Slack entegrasyonu
- Microsoft Teams entegrasyonu
- Discord entegrasyonu
- PagerDuty entegrasyonu
- OpsGenie entegrasyonu
- Custom webhook bildirim
- **Rakipler:** Hookdeck ✅ (Teams, Slack, PagerDuty, OpsGenie)
- **Kaynak:** Hookdeck changelog — Microsoft Teams Integration

### 16. 📋 Compliance Dashboard (`/admin/compliance`)
- SOC 2 durumu ve eksikler
- GDPR uyumluluk durumu
- Data deletion request yönetimi
- Consent log yönetimi
- Breatch notification şablonu
- Audit log export (compliance için)
- **Rakipler:** Svix ✅ (SOC 2, GDPR, HIPAA, PCI-DSS)
- **Kaynak:** Compliance araştırması

---

## 🆕 Deep Research Ek Özellikler

### Support Agent Rolü (Svix, Haziran 2025)
- Yeni rol: "Support Agent" — Viewer + müşteri portalı önizleme
- Destek ekibi müşteri portalını müşteri gözüyle görebilmeli
- **Ek:** admin/roles sayfasına yeni rol ekle

### Endpoint Disable Email (Svix, Ağustos 2025)
- Endpoint otomatik devre dışı kalınca müşteriye whitelabel email
- Admin'e de bildirim gönderilmeli
- **Ek:** Email şablonları sayfasına ekle

### Standard Webhooks Uyumluluğu (Hookdeck, Kasım 2025)
- webhook- prefix, whsec_ secret format
- OpenAI, Anthropic, Google kullanıyor
- **Ek:** API ayarlarına Standard Webhooks toggle

### Deduplication (Hookdeck, Ağustos 2025)
- Exact deduplication (birebir aynı payload)
- Field-based matching (belirli alanlarla eşleştirme)
- Time window (1sn - 1sa)
- **Ek:** Endpoint ayarlarına deduplication kuralları

### Custom Retry Schedules (Hookdeck, Kasım 2025)
- Müşteri tanımlı retry zamanlaması
- Örnek: 5sn, 1dk, 10dk, 1sa
- **Ek:** Retry policy sayfasına custom schedule

### Quick Filters (Hookdeck, Kasım 2025)
- Event detayından tek tıkla filtre oluşturma
- Manuel filtre oluşturma hızlandırılmalı
- **Ek:** Log ve teslimat sayfalarına quick filter

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
