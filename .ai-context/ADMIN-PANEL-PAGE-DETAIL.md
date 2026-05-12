# 📋 HookSniff Admin Panel — Sayfa Sayfa Detaylı Analiz

> **Tarih:** 2026-05-12 15:30 GMT+8
> **Hazırlayan:** AI Asistan (Oturum 126)
> **Kapsam:** 5 sayfa + layout + backend API + i18n

---

## 🏗️ GENEL YAPI

### Sidebar Menü (5 öğe)
```
📊 Genel Bakış     → /admin
👥 Kullanıcılar    → /admin/users
💰 Gelir           → /admin/revenue
🖥️ Sistem          → /admin/system
⚙️ Ayarlar         → /admin/settings
← Panele Dön       → /dashboard
```

### Backend API Endpoint'leri
```
GET  /v1/admin/stats              → Sistem istatistikleri
GET  /v1/admin/users              → Kullanıcı listesi (sayfalama + filtre)
GET  /v1/admin/users/:id          → Kullanıcı detay
PUT  /v1/admin/users/:id/plan     → Plan değiştirme
PUT  /v1/admin/users/:id/status   → Ban/aktivasyon
GET  /v1/admin/revenue            → Aylık gelir
POST /v1/admin/sdk-update         → SDK güncelleme bildirimi
GET  /v1/admin/settings           → Platform ayarları
PUT  /v1/admin/settings           → Ayar güncelleme
```

---

## 📊 SAYFA 1: GENEL BAKIŞ (Overview)

**URL:** `/admin`
**Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`
**Backend:** `GET /v1/admin/stats`

### Mevcut İçerik

#### 1. Başlık
- `<h1>` — i18n: `admin.overviewTitle` = "Admin Overview"
- `<p>` — i18n: `admin.overviewDesc` = "Platform-wide metrics and recent activity"

#### 2. İstatistik Kartları (4 adet)
| Kart | Veri | i18n Key | Durum |
|------|------|----------|-------|
| 👥 Toplam Kullanıcı | `stats.total_users` | `admin.totalUsers` | ⚠️ API hata veriyor |
| 📦 Toplam Teslimat | `stats.total_deliveries` | `admin.totalDeliveries` | ⚠️ API hata veriyor |
| 💰 Toplam Gelir | `stats.total_revenue` (₺ format) | `admin.totalRevenue` | ⚠️ API hata veriyor |
| 🔥 Bugünkü Aktif | `stats.active_users_today` | `admin.activeUsersToday` | ⚠️ API hata veriyor |

**Sorun:** `/v1/admin/stats` endpoint'i `DATABASE_ERROR` döndürüyor. Tüm kartlar "0" veya hata gösteriyor.

#### 3. Pasta Grafik — Plan Dağılımı
- `stats.users_by_plan` → Free/Pro/Business dağılımı
- `PieChart` component (Recharts)
- Renkler: Free=gri, Pro=mavi, Business=mor
- **Sorun:** API hata verdiğinden grafik boş

#### 4. Son Kayıt Olanlar Listesi
- `stats.recent_signups` → Son 10 kullanıcı
- Her satırda: isim/email, plan badge, tarih
- **Sorun:** API hata verdiğinden liste boş

### Eksiklikler

| # | Eksik | Açıklama | Öncelik |
|---|-------|----------|---------|
| 1 | **API düzeltme** | stats endpoint DATABASE_ERROR | 🔴 Kritik |
| 2 | **Son Aktiviteler kartı** | "Son 5 admin işlemi" yok (audit log özeti) | 🔴 Yüksek |
| 3 | **Trend göstergesi** | "Dün +%12" gibi değişim yok | 🟡 Orta |
| 4 | **Hızlı aksiyonlar** | "Yeni kullanıcı ara" gibi快捷方式 yok | 🟢 Düşük |
| 5 | **Canlı webhook sayısı** | "Şu an aktif X webhook işlemi" yok | 🟡 Orta |

### Olması Gereken Tam Yapı

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Genel Bakış                                           │
│ Platform genel metrikleri ve son aktiviteler              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │ 150  │ │ 12K  │ │ ₺450 │ │  23  │ │  3   │           │
│ │Kullanıcı│Teslimat│Gelir │Bugün │Alarm  │           │
│ │+12%↑ │ │+8%↑ │ │+15%↑│ │Aktif │ │Aktif │           │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                          │
│ ┌─────────────────────┐ ┌─────────────────────┐         │
│ │ 📈 Kullanıcılar     │ │ 📋 Son Aktiviteler  │         │
│ │   Plan Dağılımı     │ │                     │         │
│ │                     │ │ 🔴 Ali banlandı     │         │
│ │  [Pasta Grafik]     │ │    5 dk önce        │         │
│ │                     │ │                     │         │
│ │  Free: 120          │ │ 🟡 Plan: free→pro   │         │
│ │  Pro: 25            │ │    1 saat önce      │         │
│ │  Business: 5        │ │                     │         │
│ │                     │ │ 🟢 Yeni kayıt       │         │
│ └─────────────────────┘ │    2 saat önce      │         │
│                          └─────────────────────┘         │
│ ┌───────────────────────────────────────────────┐       │
│ │ 📋 Son Kayıt Olanlar                          │       │
│ │                                               │       │
│ │ | İsim        | Email          | Plan | Tarih |       │
│ │ |-------------|----------------|------|-------|       │
│ │ | Mehmet Y.   | mehmet@x.com   | Pro  | Bugün |       │
│ │ | Ayşe K.     | ayse@y.com     | Free | Dün  |       │
│ └───────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

---

## 👥 SAYFA 2: KULLANICILAR (Users)

**URL:** `/admin/users`
**Dosya:** `dashboard/src/app/[locale]/admin/users/page.tsx`
**Backend:** `GET /v1/admin/users`, `PUT /v1/admin/users/:id/plan`, `PUT /v1/admin/users/:id/status`

### Mevcut İçerik

#### 1. Başlık
- `<h1>` — i18n: `admin.userManagement` = "User Management"
- `<p>` — i18n: `admin.userManagementDesc` = "Manage users, plans, and account status"

#### 2. Arama ve Filtreler
| Filtre | Tip | i18n Key | Çalışıyor mu? |
|--------|-----|----------|---------------|
| Arama çubuğu | text input | `admin.searchByEmail` | ✅ |
| Plan filtre | select (Free/Pro/Business) | `admin.allPlans` + plan key'leri | ✅ |
| Durum filtre | select (Active/Banned) | `admin.allStatuses` | ✅ |

#### 3. Kullanıcı Tablosu
| Kolon | Veri | i18n Key | Durum |
|-------|------|----------|-------|
| ID | `user.id` (8 karakter) | `common.id` | ✅ |
| Email | `user.email` | `common.email` | ✅ |
| İsim | `user.name \|\| '—'` | `common.name` | ✅ |
| Plan | Badge (Free/Pro/Business) | `common.plan` | ✅ |
| Durum | StatusBadge component | `common.status` | ✅ |
| Oluşturulma | `toLocaleDateString('tr-TR')` | `common.created` | ✅ |
| Aksiyonlar | Detay/Plan Değiştir/Ban | `common.actions` | ✅ |

#### 4. Sayfalama
- "X-Y / Z gösteriliyor" bilgisi
- Önceki/Sonraki butonları
- Sayfa numarası gösterimi

#### 5. Plan Değiştirme Modal
- Kullanıcı email'i gösteriliyor
- Plan seçici (Free/Pro/Business)
- İptal/Güncelle butonları
- **Eksik:** Onay dialog'u yok (ConfirmDialog)

#### 6. Ban/Aktivasyon
- Direkt tıklama ile ban/aktivasyon
- **Eksik:** Onay dialog'u yok, sebebi sorulmuyor

### Eksiklikler

| # | Eksik | Açıklama | Öncelik |
|---|-------|----------|---------|
| 1 | **CSV Export** | Kullanıcı listesini indirme butonu yok | 🔴 Yüksek |
| 2 | **Kullanıcı Taklidi** | "Kullanıcı gibi gör" butonu yok | 🔴 Yüksek |
| 3 | **Toplu İşlem** | Birden fazla kullanıcıyı seç + toplu ban/plan değişikliği | 🟡 Orta |
| 4 | **Ban Sebebi** | Ban atarken sebebi yazma/sorma yok | 🟡 Orta |
| 5 | **Sıralama** | Kolon başlıklarına tıklayarak sıralama yok | 🟡 Orta |
| 6 | **Kayıt Tarihi Filtresi** | "Son 7 gün", "Son 30 gün" filtresi yok | 🟡 Orta |
| 7 | **Plan Badge Renkleri** | Free=gri, Pro=mavi, Business=mor olmalı (şu an hepsi aynı) | 🟢 Düşük |
| 8 | **Kullanıcı Avatar** | İsim baş harfi veya profil resmi yok | 🟢 Düşük |

### Olması Gereken Tam Yapı

```
┌──────────────────────────────────────────────────────────┐
│ 👥 Kullanıcı Yönetimi                                     │
│ Kullanıcıları yönet, planları değiştir, hesap durumunu   │
│ kontrol et                                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [🔍 Email veya isim ara...    ] [Plan ▼] [Durum ▼]  │ │
│ │                                        [⬇ CSV İndir] │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ID       | Email        | İsim   | Plan | Durum | ...│ │
│ │----------|--------------|--------|------|-------|     │ │
│ │ a1b2...  | ali@x.com    | Ali    | Pro  | ✅    |     │ │
│ │ c3d4...  | ayse@y.com   | Ayşe   | Free | ✅    |     │ │
│ │ e5f6...  | mehmet@z.com | Mehmet | Free | 🔴    |     │ │
│ │                                                      │ │
│ │ Aksiyonlar:                                          │ │
│ │ [📋 Detay] [🔄 Plan Değiştir] [👁️ Taklit] [🚫 Ban]  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ Sayfa: 1-20 / 150        [← Önceki] [1] [2] [3] [→ Sonraki]│
└──────────────────────────────────────────────────────────┘
```

---

## 💰 SAYFA 3: GELİR (Revenue)

**URL:** `/admin/revenue`
**Dosya:** `dashboard/src/app/[locale]/admin/revenue/page.tsx`
**Backend:** `GET /v1/admin/revenue`

### Mevcut İçerik

#### 1. Başlık
- `<h1>` — i18n: `admin.revenueTitle` = "Revenue Dashboard"
- `<p>` — i18n: `admin.revenueDesc` = "Financial metrics and revenue breakdown"

#### 2. İstatistik Kartları (3 adet)
| Kart | Veri | i18n Key | Durum |
|------|------|----------|-------|
| 💰 MRR | `revenue.mrr` (₺ format) | `admin.mrr` | ⚠️ API hata veriyor |
| 📈 Toplam Gelir | Aylık toplam | `admin.totalRevenueLabel` | ⚠️ API hata veriyor |
| 📉 Churn Rate | `revenue.churn_rate` (%) | `admin.churnRate` | ⚠️ API hata veriyor |

#### 3. Aylık Gelir Grafiği (Bar Chart)
- `revenue.monthly_revenue` → Son 12 ay
- BarChart component (Recharts)
- ₺ formatında tooltip
- **Sorun:** API hata verdiğinden grafik boş

#### 4. Plan Bazlı Gelir (Pasta Grafik)
- `revenue.revenue_by_plan` → Free/Pro/Business gelir dağılımı
- PieChart + Plan renkleri
- Her plan için: renk + isim + tutar + kullanıcı sayısı
- **Sorun:** API hata verdiğinden grafik boş

### Backend Sorunu Detayı

`GET /v1/admin/revenue` endpoint'indeki SQL:
```sql
SELECT
    TO_CHAR(month_series, 'YYYY-MM') as month,
    COALESCE(
        (SELECT SUM(CASE plan WHEN 'pro' THEN 29.0 WHEN 'business' THEN 99.0 ELSE 0.0 END)
         FROM customers WHERE is_active = TRUE AND created_at <= month_series + INTERVAL '1 month'),
        0.0
    ) as revenue
FROM generate_series(
    DATE_TRUNC('month', NOW() - INTERVAL '11 months'),
    DATE_TRUNC('month', NOW()),
    INTERVAL '1 month'
) as month_series
ORDER BY month_series
```

**Muhtemel Sorun:** Neon DB'de `generate_series` veya subquery uyumsuzluğu. Frontend `RevenueResponse` bekliyor ama backend `Vec<RevenueRow>` döndürüyor — type mismatch olabilir.

### Eksiklikler

| # | Eksik | Açıklama | Öncelik |
|---|-------|----------|---------|
| 1 | **API düzeltme** | revenue endpoint çalışmıyor | 🔴 Kritik |
| 2 | **CSV Export** | Gelir raporunu indirme butonu yok | 🔴 Yüksek |
| 3 | **Tarih aralığı seçici** | "Son 3 ay", "Son 6 ay", "Son 12 ay" filtresi yok | 🟡 Orta |
| 4 | **Plan fiyat ayarı** | $29/$99 hardcoded → DB'den okunmalı | 🟡 Orta |
| 5 | **Churn detayı** | Hangi kullanıcılar churn etti? Liste yok | 🟡 Orta |
| 6 | **MRR trend** | "Geçen aya göre +%5" gibi değişim yok | 🟡 Orta |
| 7 | **Fatura geçmişi** | Her kullanıcının ödeme geçmişi yok | 🟡 Orta |
| 8 | ** gelir projeksiyonu** | "Bu hızla devam ederse ay sonu ₺X" yok | 🟢 Düşük |

### Olması Gereken Tam Yapı

```
┌──────────────────────────────────────────────────────────┐
│ 💰 Gelir Paneli                                            │
│ Finansal metrikler ve gelir dağılımı                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐                              │
│ │ ₺450 │ │ ₺5.4K│ │ %2.1 │    [⬇ Rapor İndir]          │
│ │ MRR  │ │Toplam│ │Churn │    [Son 3 Ay ▼]              │
│ │+15%↑ │ │      │ │-0.5%↓│                              │
│ └──────┘ └──────┘ └──────┘                              │
│                                                          │
│ ┌─────────────────────────┐ ┌─────────────────────┐     │
│ │ 📈 Aylık Gelir          │ │ 💰 Plan Bazlı Gelir │     │
│ │                         │ │                     │     │
│ │  ₺800 ┤      ██        │ │  [Pasta Grafik]     │     │
│ │  ₺600 ┤   ██ ██ ██     │ │                     │     │
│ │  ₺400 ┤██ ██ ██ ██ ██  │ │  Pro: ₺350 (25 kişi)│     │
│ │  ₺200 ┤██ ██ ██ ██ ██  │ │  Business: ₺100     │     │
│ │    ₺0 ┤──────────────   │ │  Free: ₺0           │     │
│ │       Oca Feb Mar ...   │ │                     │     │
│ └─────────────────────────┘ └─────────────────────┘     │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 📋 Churn Analizi (Son 30 Gün)                 │       │
│ │                                               │       │
│ │ | Kullanıcı   | Plan | Tutar | Churn Tarihi  |       │
│ │ |-------------|------|-------|---------------|       │
│ │ | user@x.com  | Pro  | ₺29  | 12 May 2026   |       │
│ │ | user2@y.com | Pro  | ₺29  | 8 May 2026    |       │
│ └───────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

---

## 🖥️ SAYFA 4: SİSTEM (System)

**URL:** `/admin/system`
**Dosya:** `dashboard/src/app/[locale]/admin/system/page.tsx`
**Backend:** `GET /health`

### Mevcut İçerik

#### 1. Başlık
- `<h1>` — i18n: `admin.systemHealth` = "System Health"
- `<p>` — i18n: `admin.systemHealthDesc` = "Monitor infrastructure services and system status"

#### 2. Genel Durum Banner'ı
- Yeşil/Sarı/Kırmızı dot + durum yazısı
- "Tüm sistemler çalışıyor" / "Kısmi kesinti" / "Sorun tespit edildi"
- Son kontrol zamanı (tr-TR format)
- "Otomatik yenileme: 15sn" bilgisi

#### 3. Servis Kartları (4 adet)
| Servis | İkon | Durum | Detay | Latency Bar |
|--------|------|-------|-------|-------------|
| API Server | 🚀 | healthy/degraded/unhealthy | Uptime: Xd Yh Zm | ❌ (yok) |
| Database (PostgreSQL) | 🐘 | connected/slow/error | Latency: Xms | ✅ (0-500ms bar) |
| Cache (Redis) | ⚡ | connected/slow/error | Latency: Xms | ✅ (0-500ms bar) |
| Queue | 📬 | healthy/degraded | X pending · Y processing · Z failed | ❌ (yok) |

#### 4. Altyapı Bilgisi (6 kart)
| Servis | Sağlayıcı | Detay |
|--------|-----------|-------|
| API Server | Oracle Cloud ARM | 4 OCPU, 24 GB RAM |
| Database | Neon PostgreSQL | Serverless, 0.5 GB |
| Cache | Upstash Redis | Serverless, 256 MB |
| CDN | Cloudflare | DNS, SSL, DDoS |
| Dashboard | Vercel | Next.js 15 |
| Monitoring | Grafana Cloud | OpenTelemetry |

### Eksiklikler

| # | Eksik | Açıklama | Öncelik |
|---|-------|----------|---------|
| 1 | **Alert durumu** | Aktif alarm sayısı/özeti yok | 🔴 Yüksek |
| 2 | **Kuyruk detayı** | "Son 1 saatte X başarısız" trend yok | 🟡 Orta |
| 3 | **Geçmiş grafik** | "Son 24 saat uptime" grafiği yok | 🟡 Orta |
| 4 | **Log görüntüleme** | Son hata log'ları yok | 🟡 Orta |
| 5 | **Webhook Test** | "Test webhook gönder" butonu yok | 🟡 Orta |
| 6 | **Deploy durumu** | Son deploy zamanı/versiyonu yok | 🟢 Düşük |
| 7 | **DB boyutu** | "DB X MB kullanıyor" bilgisi yok | 🟢 Düşük |

### Olması Gereken Tam Yapı

```
┌──────────────────────────────────────────────────────────┐
│ 🖥️ Sistem Sağlığı                                         │
│ Altyapı servislerini izle ve sistem durumunu kontrol et  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 🟢 Tüm Sistemler Çalışıyor · Son kontrol: 14:32:15      │
│    Otomatik yenileme: 15sn                                │
│                                                          │
│ ┌──────┐ ┌──────┐                                        │
│ │  2   │ │  0   │  ← Alarm sayısı / Kritik sorun         │
│ │Alarm │ │Kritik│                                        │
│ └──────┘ └──────┘                                        │
│                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│ │ 🚀 API       │ │ 🐘 Database  │ │ ⚡ Redis      │      │
│ │ Healthy      │ │ Connected    │ │ Connected    │      │
│ │ Uptime: 3d   │ │ Latency: 12ms│ │ Latency: 3ms │      │
│ │ ████████ 99% │ │ ██░░░░ 12ms  │ │ █░░░░░ 3ms   │      │
│ └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 📬 Kuyruk Durumu                              │       │
│ │                                               │       │
│ │ Pending: 12    Processing: 3    Failed: 0     │       │
│ │                                               │       │
│ │ Son 1 saat: ████████████████████ 150 teslimat │       │
│ │ Başarılı:   ████████████████████ 148 (%98.7)  │       │
│ │ Başarısız:  ░░ 2 (%1.3)                       │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 🧪 Webhook Test                               │       │
│ │                                               │       │
│ │ Endpoint URL: [https://...           ]        │       │
│ │ Event Type:   [order.created         ]        │       │
│ │ Payload:      [{ "order_id": "123" } ]        │       │
│ │                                               │       │
│ │ [🚀 Test Gönder]                              │       │
│ │                                               │       │
│ │ ✅ 200 OK — 230ms                             │       │
│ │ Response: {"received": true}                  │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 🏗️ Altyapı                                    │       │
│ │                                               │       │
│ │ | Servis     | Sağlayıcı       | Detay       |       │
│ │ |------------|-----------------|-------------|       │
│ │ | API Server | Oracle Cloud ARM| 4 OCPU 24GB |       │
│ │ | Database   | Neon PostgreSQL | Serverless  |       │
│ │ | Cache      | Upstash Redis   | 256 MB      |       │
│ │ | CDN        | Cloudflare      | SSL, DDoS   |       │
│ │ | Dashboard  | Vercel          | Next.js 15  |       │
│ │ | Monitoring | Grafana Cloud   | OTel        |       │
│ └───────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────┘
```

---

## ⚙️ SAYFA 5: AYARLAR (Settings)

**URL:** `/admin/settings`
**Dosya:** `dashboard/src/app/[locale]/admin/settings/page.tsx`
**Backend:** `GET /v1/admin/settings`, `PUT /v1/admin/settings`

### Mevcut İçerik

#### 1. Başlık
- `<h1>` — i18n: `admin.platformSettings` = "Platform Settings"
- `<p>` — i18n: `admin.platformSettingsDesc` = "Configure platform-wide defaults and limits"

#### 2. Genel Ayarlar Kartı
| Ayar | Tip | i18n Key | Durum |
|------|-----|----------|-------|
| Bakım Modu | Toggle (role=switch) | `admin.maintenanceMode` | ✅ |
| Kayıtlar Açık | Toggle (role=switch) | `admin.signupsEnabled` | ✅ |
| Varsayılan Plan | Select (Free/Pro) | `admin.defaultPlan` | ✅ |

**Sorun:** API'den veri gelmiyor, default değerler kullanılıyor.

#### 3. Plan Limitleri Kartı
| Ayar | Free | Pro | i18n Key |
|------|------|-----|----------|
| Max Endpoint | 5 | 50 | `admin.maxEndpoints` |
| Max Webhook/Ay | 10000 | 50000 | `admin.maxWebhooksMonth` |
| Rate Limit (dk) | 100 | 1000 | `admin.rateLimitReqMin` |
| Retention (gün) | 7 | 30 | `admin.retentionDays` |

**Sorun:** Backend'deki default değerler ile frontend farklı (backend: 1000/50000, frontend: 10000/50000).

#### 4. Retry Ayarları Kartı
| Ayar | Tip | i18n Key | Durum |
|------|-----|----------|-------|
| Max Retry Denemesi | Number (0-10) | `admin.maxRetryAttempts` | ✅ |

#### 5. Kaydet Butonu
- `admin.saveSettings` = "Save Settings"
- Başarılı/hatalı toast mesajı

### Eksiklikler

| # | Eksik | Açıklama | Öncelik |
|---|-------|----------|---------|
| 1 | **API düzeltme** | Settings endpoint veri gelmiyor | 🔴 Kritik |
| 2 | **Alert Eşikleri** | Teslimat oranı, latency, kuyruk eşikleri yok | 🔴 Yüksek |
| 3 | **Email Ayarları** | Resend API key, sender adresi ayarı yok | 🟡 Orta |
| 4 | **Webhook Secret** | Default webhook secret ayarı yok | 🟡 Orta |
| 5 | **Polar.sh Ayarları** | Plan fiyatları (₺29/₺99) buradan ayarlanmalı | 🟡 Orta |
| 6 | **Backup Ayarları** | Neon backup sıklığı, retention ayarı yok | 🟡 Orta |
| 7 | **API Rate Limit** | Global rate limit ayarı yok | 🟡 Orta |
| 8 | **CORS Ayarları** | İzin verilen origin'ler yok | 🟢 Düşük |

### Olması Gereken Tam Yapı

```
┌──────────────────────────────────────────────────────────┐
│ ⚙️ Platform Ayarları                                      │
│ Platform genel varsayılanlarını ve limitleri yapılandır  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 🔧 Genel                                      │       │
│ │                                               │       │
│ │ Bakım Modu        [●——] API endpoint'leri     │       │
│ │                     geçici olarak devre dışı   │       │
│ │                                               │       │
│ │ Kayıtlar Açık     [——●] Yeni kullanıcı        │       │
│ │                     kayıtlarına izin ver       │       │
│ │                                               │       │
│ │ Varsayılan Plan   [Free ▼] Yeni kullanıcılar  │       │
│ │                     bu planla başlar           │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 📊 Plan Limitleri                             │       │
│ │                                               │       │
│ │                  Free          Pro             │       │
│ │ Max Endpoint     [5]          [50]            │       │
│ │ Max Webhook/Ay   [10000]      [50000]         │       │
│ │ Rate Limit/dk    [100]        [1000]          │       │
│ │ Retention gün     [7]          [30]           │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 🔄 Retry Ayarları                             │       │
│ │                                               │       │
│ │ Max deneme: [3] (0-10 arası)                  │       │
│ │ Başarısız webhook'lar bu kadar tekrar dener   │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 🚨 Alert Eşikleri                             │       │
│ │                                               │       │
│ │ Teslimat Başarı Oranı  [▼ %95] altı → alarm  │       │
│ │ P95 Yanıt Süresi       [▼ 5000ms] üstü       │       │
│ │ Kuyruk Derinliği        [▼ 100] üstü          │       │
│ │ Başarısız Teslimat      [▼ 10/saat] üstü      │       │
│ │                                               │       │
│ │ Bildirim Kanalı: ☑ Email  ☐ Slack  ☐ Webhook │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ ┌───────────────────────────────────────────────┐       │
│ │ 💰 Fiyatlandırma                              │       │
│ │                                               │       │
│ │ Pro Plan:       [₺29/ay]                      │       │
│ │ Business Plan:  [₺149/ay]                     │       │
│ │ Para Birimi:    [TRY ▼]                       │       │
│ └───────────────────────────────────────────────┘       │
│                                                          │
│ [💾 Ayarları Kaydet]                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 BACKEND SORUNLARI

### 1. `/v1/admin/stats` — DATABASE_ERROR

**Muhtemel Neden:** Neon DB'de SQL sorgusu uyumsuzluğu.
**Etki:** Overview sayfası tamamen boş.
**Çözüm:** SQL sorgusunu Neon DB syntax'ına uygun hale getir.

### 2. `/v1/admin/revenue` — DATABASE_ERROR

**Muhtemel Neden:** `generate_series` + subquery kombinasyonu Neon DB'de çalışmıyor.
**Etki:** Revenue sayfası tamamen boş.
**Çözüm:** SQL sorgusunu basitleştir veya iki ayrı sorgu yap.

### 3. Plan Fiyatları Hardcoded

**Mevcut Kod:**
```rust
// admin.rs - system_stats()
let revenue: (Option<f64>,) = sqlx::query_as(
    r#"SELECT COALESCE(SUM(
        CASE plan
            WHEN 'pro' THEN 29.0
            WHEN 'business' THEN 99.0
            ELSE 0.0
        END
    ), 0.0) as revenue FROM customers WHERE is_active = TRUE"#,
)
```

**Sorun:** Fiyatlar kodda sabit. Fiyat değiştirirsen kodu güncellemen gerek.
**Çözüm:** `platform_settings` tablosundan oku.

### 4. Settings Endpoint Veri Gelmiyor

**Mevcut Kod:**
```rust
// admin.rs - get_settings()
let row: Option<(serde_json::Value,)> =
    sqlx::query_as("SELECT value FROM platform_settings WHERE key = 'main'")
        .fetch_optional(&pool)
        .await?;

if let Some((value,)) = row {
    if let Ok(settings) = serde_json::from_value::<PlatformSettings>(value) {
        return Ok(Json(settings));
    }
}

Ok(Json(PlatformSettings::default()))
```

**Sorun:** `platform_settings` tablosunda 'main' key'i yoksa default dönüyor. İlk açılışta veri gelmemesi normal ama "Kaydet" sonrası bile gelmeyebilir.

---

## 📋 İ18N DURUMU

### Mevcut Çeviriler (EN → TR)
Admin panelinde ~80 çeviri anahtarı var. Çoğu Türkçe'ye çevrilmiş.

### Eksik Çeviriler
| Key | EN | TR Durum |
|-----|-----|----------|
| `nav.overview` | Overview | ✅ Genel Bakış |
| `nav.users` | Users | ✅ Kullanıcılar |
| `nav.revenue` | Revenue | ✅ Gelir |
| `nav.system` | System | ✅ Sistem |
| `nav.settingsNav` | Settings | ✅ Ayarlar |

### Eksik i18n Key'ler (Henüz Eklenmemiş)
- Audit Log ile ilgili key'ler
- Export ile ilgili key'ler
- Alert ile ilgili key'ler
- Replay ile ilgili key'ler

---

## 🎯 ÖNCELİK SIRASI

### Bu Oturum (1 saat)

| # | İş | Sayfa | Süre | Açıklama |
|---|-----|-------|------|----------|
| 1 | **stats API düzelt** | Backend | ~15 dk | SQL sorgusunu Neon DB'ye uygun yap |
| 2 | **revenue API düzelt** | Backend | ~15 dk | SQL sorgusunu basitleştir |
| 3 | **Audit Log ekle** | Overview + Backend | ~20 dk | DB tablosu + son 5 aktivite kartı |
| 4 | **Replay butonu** | User Detail + Backend | ~10 dk | "Tekrar Gönder" butonu |

### Sonraki Oturum

| # | İş | Sayfa | Süre |
|---|-----|-------|------|
| 5 | CSV Export | Users + Revenue | ~10 dk |
| 6 | Kullanıcı Taklidi | Users + Backend | ~15 dk |
| 7 | Alert Eşikleri | Settings + Backend | ~20 dk |
| 8 | Alert Durumu | System | ~10 dk |

### 3. Oturum

| # | İş | Sayfa | Süre |
|---|-----|-------|------|
| 9 | Müşteri Grafikleri | User Detail | ~20 dk |
| 10 | Webhook Test Console | System | ~15 dk |
| 11 | Churn Analizi | Revenue | ~15 dk |

---

---

## 👤 SAYFA 6: KULLANICI DETAY (User Detail)

**URL:** `/admin/users/[id]`
**Dosya:** `dashboard/src/app/[locale]/admin/users/[id]/page.tsx`
**Backend:** `GET /v1/admin/users/:id`

### Mevcut İçerik

#### 1. Başlık + Geri Butonu
- Geri butonu → `/admin/users` sayfasına döner
- `<h1>` → Kullanıcı adı veya email
- `<p>` → i18n: `admin.userDetail` = "User Detail"

#### 2. Sol Kart — Kullanıcı Bilgileri (1/3)
| Alan | Veri | i18n Key |
|------|------|----------|
| ID | `detail.user.id` (UUID, font-mono) | — |
| Email | `detail.user.email` | `admin.email` |
| İsim | `detail.user.name \|\| '—'` | `admin.name` |
| Durum | StatusBadge component | `admin.status` |
| Oluşturulma | `toLocaleString()` | `admin.created` |

#### 3. Orta Kart — Yönetim (1/3)
| Bölüm | İçerik | i18n Key |
|-------|--------|----------|
| Plan Seçici | Select (Free/Pro/Business) + Güncelle butonu | `admin.plan`, `admin.update` |
| Hesap Durumu | Ban/Aktifleştir butonu (renk değişimli) | `admin.accountStatus` |
| Kullanım İstatistikleri | Toplam teslimat, başarı oranı, endpoint sayısı | `admin.usageStats` |

**Plan Değiştirme Davranışı:**
- Select değişti → Güncelle butonu aktif
- Aynı plan seçili → buton disabled (opacity-40)
- Başarılı → toast "Plan X olarak güncellendi"
- Hatalı → toast "Plan güncellenemedi"

**Ban Davranışı:**
- Active kullanıcı → kırmızı "Kullanıcıyı Yasakla" butonu
- Banned kullanıcı → yeşil "Kullanıcıyı Aktifleştir" butonu
- **Eksik:** Onay dialog'u yok, sebebi sorulmuyor

#### 4. Sağ Kart — Endpoint'ler (1/3)
- `detail.endpoints` listesi
- Her endpoint: URL (font-mono, truncate), aktif/pasif dot, tarih
- Boş state: "Uç nokta yok" mesajı

#### 5. Alt Bölüm — Son Teslimatlar Tablosu
| Kolon | Veri | i18n Key |
|-------|------|----------|
| ID | `d.id.slice(0, 10)…` | — |
| Event | `d.event \|\| '—'` (badge) | `admin.event` |
| Durum | StatusBadge | `admin.status` |
| Deneme | `d.attempt_count` | `admin.attempts` |
| Zaman | `toLocaleString()` | `admin.time` |

**Eksik:** Her satırda "Tekrar Gönder" butonu yok.

#### 6. Durumlar
- **Yükleme:** Skeleton (h-8 + h-4 pulse)
- **Bulunamadı:** 😕 emoji + "Kullanıcı Bulunamadı" + geri butonu
- **Hata:** Toast "Kullanıcı detayları yüklenemedi"

### Eksiklikler

| # | Eksik | Açıklama | Öncelik |
|---|-------|----------|---------|
| 1 | **Replay butonu** | Teslimat satırında "Tekrar Gönder" yok | 🔴 Yüksek |
| 2 | **Teslimat detayı** | Satıra tıklayınca detay modal yok | 🟡 Orta |
| 3 | **Günlük teslimat grafiği** | Son 30 gün grafik yok | 🟡 Orta |
| 4 | **Event dağılımı** | Hangi event'ten kaç tane? Pasta grafik yok | 🟡 Orta |
| 5 | **Endpoint sağlık** | Endpoint başına başarı oranı yok | 🟡 Orta |
| 6 | **Kullanıcı taklidi** | "Kullanıcı gibi gör" butonu yok | 🔴 Yüksek |
| 7 | **Ban sebebi** | Ban atarken sebebi yazma/sorma yok | 🟡 Orta |
| 8 | **Email gönderme** | Kullanıcıya email atma butonu yok | 🟡 Orta |
| 9 | **Plan geçmişi** | Ne zaman plan değiştirdi? Liste yok | 🟢 Düşük |

---

## 🏗️ LAYOUT & NAVIGATION

**Dosya:** `dashboard/src/app/[locale]/admin/layout.tsx`

### Sidebar Yapısı
```
┌──────────────────────┐
│ ⚡ Yönetim Paneli     │
│    Platform Yönetimi  │
├──────────────────────┤
│ 📊 Genel Bakış       │  → /admin
│ 👥 Kullanıcılar      │  → /admin/users
│ 💰 Gelir             │  → /admin/revenue
│ 🖥️ Sistem            │  → /admin/system
│ ⚙️ Ayarlar           │  → /admin/settings
├──────────────────────┤
│ ← Panele Dön         │  → /dashboard
│ 🌙/☀️ ThemeToggle    │
└──────────────────────┘
```

### Top Bar
- Sol: Mobil hamburger butonu + Sayfa başlığı + "Yönetici" badge
- Sağ: Kullanıcı email + Çıkış butonu

### Auth Guard
- `useEffect` ile `user.is_admin` kontrolü
- Admin değilse → `/dashboard` redirect
- Admin değilse → 🔒 Erişim Reddedildi ekranı

### Mobil Uyum
- Sidebar: `translate-x` animasyonu ile açılır/kapanır
- Overlay: Siyah yarı saydam backdrop
- `md:pl-64` → masaüstünde sidebar offset

### Eksiklikler

| # | Eksik | Açıklama | Öncelik |
|---|-------|----------|---------|
| 1 | **"Aktivite" menüsü** | Audit log sayfası sidebar'da yok | 🔴 Yüksek |
| 2 | **Bildirim ikonu** | Header'da alarm/bildirim zili yok | 🟡 Orta |
| 3 | **Hızlı arama** | Header'da global arama yok | 🟢 Düşük |
| 4 | **Kullanıcı menüsü** | Header'da profil dropdown yok | 🟢 Düşük |

---

## 🧩 REUSABLE COMPONENTS

### StatusBadge
**Dosya:** `dashboard/src/components/StatusBadge.tsx`

Desteklenen durumlar:
| Durum | Renk | İkon |
|-------|------|------|
| delivered/success | Yeşil | ✓ |
| failed/error | Kırmızı | ✕ |
| pending | Amber | … |
| active | Mavi | — |
| inactive | Gri | — |
| banned | Kırmızı | — |
| warning | Amber | — |
| paid | Yeşil | — |

**Boyutlar:** sm, md (default), lg
**Eksik:** "replayed" durumu yok

### StatCard
**Dosya:** `dashboard/src/components/tremor/StatCard.tsx`

Özellikler:
- label, value, icon, trend, color, isPercent
- Trend: up/down/neutral + yüzde + label
- 6 renk: blue, emerald, red, amber, violet, slate
- Hover animasyonu: `hover-lift card-tilt`

**Eksik:** `trend` prop'u hiçbir sayfada kullanılmıyor (Overview'de olmalı)

### ChartCard
**Dosya:** `dashboard/src/components/tremor/ChartCard.tsx`

- Başlık + alt başlık + children (grafik)
- Revenue sayfasında kullanılıyor

---

## 🔧 BACKEND — SDK UPDATE ENDPOINT

**Endpoint:** `POST /v1/admin/sdk-update`
**Dosya:** `api/src/routes/admin.rs` (satır 533-589)

### Amaç
Otomatik SDK versiyon kontrolü (cron job) tarafından çağrılır. Tüm admin kullanıcılara bildirim oluşturur.

### Request Body
```json
{
  "updates": [
    {"sdk": "python", "local_version": "1.0.0", "published_version": "1.1.0"},
    {"sdk": "node", "local_version": "2.0.0", "published_version": "2.1.0"}
  ]
}
```

### Davranış
1. Admin kontrolü
2. Boş updates → "No updates to notify" dön
3. Her admin için `notifications` tablosuna INSERT
4. Bildirim tipi: 'system', link: '/admin'

### Sorun
- `notifications` tablosu **migration'da yok** → runtime error
- Frontend'de bu endpoint'i çağıran UI yok

---

## 🚨 KRİTİK BULGU: EKSİK MİGRATION DOSYALARI

### Tablo Durumu

| Tablo | Migration'da Var mı? | Kodda Kullanılıyor mu? | Durum |
|-------|---------------------|----------------------|-------|
| `customers` | ✅ Evet (001) | ✅ Evet | ✅ OK |
| `endpoints` | ✅ Evet (001) | ✅ Evet | ✅ OK |
| `deliveries` | ✅ Evet (001) | ✅ Evet | ✅ OK |
| `delivery_attempts` | ✅ Evet (001) | ✅ Evet | ✅ OK |
| `dead_letters` | ✅ Evet (001) | ✅ Evet | ✅ OK |
| `idempotency_keys` | ✅ Evet (004) | ✅ Evet | ✅ OK |
| `platform_settings` | ✅ Evet (007) | ✅ Evet | ✅ OK |
| `tfa_backup_codes` | ✅ Evet (007) | ✅ Evet | ✅ OK |
| **`audit_log`** | ❌ **HAYIR** | ✅ Evet (15+ dosya) | 🔴 **CRASH** |
| **`alert_rules`** | ❌ **HAYIR** | ✅ Evet (alerts.rs) | 🔴 **CRASH** |
| **`notifications`** | ❌ **HAYIR** | ✅ Evet (notifications.rs, admin.rs) | 🔴 **CRASH** |
| **`teams`** | ❌ **HAYIR** | ✅ Evet (teams.rs) | 🔴 **CRASH** |
| **`team_members`** | ❌ **HAYIR** | ✅ Evet (teams.rs) | 🔴 **CRASH** |
| **`notification_preferences`** | ❌ **HAYIR** | ✅ Evet (customer_portal.rs) | 🔴 **CRASH** |
| **`portal_configs`** | ❌ **HAYIR** | ✅ Evet (portal_config.rs) | 🔴 **CRASH** |

### Etki
Bu tablolar Neon DB'de yoksa, ilgili API endpoint'leri "relation does not exist" hatası verir. Yani:
- Audit log sayfası → crash
- Alert kuralları → crash
- Bildirimler → crash
- Takımlar → crash
- Portal config → crash

### Çözüm
Her eksik tablo için CREATE TABLE migration dosyası oluşturulmalı.

---

## 📊 MEVCUT AUDIT LOG SİSTEMİ (Önceden Var Ama Görünmez)

### Backend Modülleri
| Dosya | Amaç |
|-------|------|
| `api/src/audit.rs` | `log_action()` helper fonksiyonu |
| `api/src/routes/audit_log.rs` | API endpoint'leri (list + get) |

### Kullanım Noktaları (15+ yer)
| Endpoint | Action | Kaynak |
|----------|--------|--------|
| `POST /auth/register` | REGISTER | auth.rs |
| `POST /auth/login` | LOGIN | auth.rs |
| `POST /auth/2fa/enable` | 2FA_ENABLE | auth.rs |
| `POST /auth/2fa/disable` | 2FA_DISABLE | auth.rs |
| `POST /auth/password` | PASSWORD_CHANGE | auth.rs |
| `POST /endpoints` | ENDPOINT_CREATE | endpoints.rs |
| `PUT /endpoints/:id` | ENDPOINT_UPDATE | endpoints.rs |
| `DELETE /endpoints/:id` | ENDPOINT_DELETE | endpoints.rs |
| `POST /api-keys` | API_KEY_CREATE | api_keys.rs |
| `DELETE /api-keys/:id` | API_KEY_DELETE | api_keys.rs |
| `DELETE /billing/subscription` | SUBSCRIPTION_CANCEL | billing.rs |
| `POST /billing/checkout` | PLAN_CHANGE | billing.rs |
| `POST /teams/:id/invite` | MEMBER_INVITE | teams.rs |
| `DELETE /teams/:id/members/:id` | MEMBER_REMOVE | teams.rs |
| `PUT /teams/:id/members/:id/role` | ROLE_CHANGE | teams.rs |

### API Endpoint'leri
```
GET /v1/audit-log?action=LOGIN&resource_type=auth&limit=50&offset=0
GET /v1/audit-log/:id
```

### Frontend Durumu
- ❌ Admin panelinde audit log sayfası yok
- ❌ Dashboard'da audit log sayfası yok
- ❌ Overview'de son aktiviteler kartı yok
- ✅ Backend tamamen çalışıyor (tablo varsa)

---

## 📊 MEVCUT ALERT SİSTEMİ (Önceden Var Ama Görünmez)

### Backend
**Dosya:** `api/src/routes/alerts.rs`

### API Endpoint'leri
```
GET    /v1/alerts           — Alert kuralları listesi
POST   /v1/alerts           — Yeni alert kuralı oluştur
GET    /v1/alerts/:id       — Alert kuralı detayı
DELETE /v1/alerts/:id       — Alert kuralı sil
POST   /v1/alerts/:id/test  — Alert test et
```

### Alert Koşulları
- `failure_rate` — Başarısızlık oranı eşiği
- `latency` — Yanıt süresi eşiği
- `consecutive_failures` — Ardışık başarısızlık sayısı

### Bildirim Kanalları
- `slack` — Slack webhook
- `email` — Email bildirimi
- `webhook` — Özel webhook URL

### Frontend Durumu
- ❌ Admin panelinde alert sayfası yok
- ❌ Dashboard'da alert sayfası yok
- ❌ Settings'de alert eşikleri yok
- ✅ Backend çalışıyor (tablo varsa)

---

## 📊 MEVCUT DELIVERY DETAY SİSTEMİ

### Backend
**Dosya:** `api/src/routes/delivery_details.rs`

### API Endpoint'leri
```
GET /v1/deliveries/:id/details           — Teslimat detayı + tüm denemeler
GET /v1/deliveries/:id/attempts/:attempt_id  — Tek deneme detayı
```

### Döndürülen Veri
- Endpoint URL, event type, status
- Payload, request headers
- Response status, response body, error message
- Tüm denemeler (attempt_number, status_code, duration_ms, response_headers)
- Signature bilgisi (algorithm, header_name, format, secret_prefix)
- Retry bilgisi (next_retry_at, last_attempt_at)

### Frontend Durumu
- ❌ Admin panelinde bu veriyi gösteren UI yok
- ❌ User Detail'de teslimat satırına tıklayınca detay modal yok
- ✅ Backend çalışıyor

---

## 📊 i18n TAMAMLIK ANALİZİ

### EN Çevirileri (80 key)
Tüm admin key'leri İngilizce'de mevcut. ✅

### TR Çevirileri (80 key)
Tüm admin key'leri Türkçe'ye çevrilmiş. ✅

### Eksik Key'ler (Henüz Eklenmemiş)
| Kategori | Eksik Key'ler | Sayı |
|----------|--------------|------|
| Audit Log | auditLog, auditActivity, allActivities, filterByAction | ~8 |
| Export | exportCSV, exportJSON, downloadReport | ~4 |
| Alert | alertRules, alertIncidents, createAlert, alertCondition | ~10 |
| Replay | replayDelivery, replaySuccess, replayFailed | ~4 |
| Impersonate | impersonateUser, viewAsUser, stopImpersonating | ~4 |
| Customer Charts | dailyDeliveries, eventDistribution, endpointHealth | ~6 |
| Test Console | testWebhook, sendTest, testResult | ~5 |

**Toplam eksik:** ~41 key (EN + TR)

---

## 📋 ÖZET TABLO — TÜM SAYFALAR

| Sayfa | Durum | Çalışan | Eksik | Kritik Eksik |
|-------|-------|---------|-------|-------------|
| Overview | 🔴 Bozuk | Layout, loading, error | API düzelt, audit özeti, trend | stats API |
| Users | 🟢 İyi | Arama, filtre, tablo, plan, ban | Export, taklit, toplu işlem | — |
| User Detail | 🟡 İyi | Bilgi kartı, plan, endpoint'ler, teslimatlar | Replay, grafik, taklit | Replay |
| Revenue | 🔴 Bozuk | Layout, loading, error | API düzelt, export, churn detay | revenue API |
| System | 🟡 İyi | Sağlık kartları, altyapı | Alarm durumu, test console | — |
| Settings | 🟡 İyi | Genel, limitler, retry | Alert eşikleri, fiyat ayarı | — |
| Layout | 🟢 İyi | Sidebar, top bar, auth guard | Aktivite menüsü, bildirim zili | — |

---

## 🎯 GÜNCEL ÖNCELİK SIRASI

### Acil (Bu Oturum)
| # | İş | Sayfa | Süre |
|---|-----|-------|------|
| 1 | stats API düzelt | Backend | ~15 dk |
| 2 | revenue API düzelt | Backend | ~15 dk |
| 3 | Audit log migration oluştur | Backend | ~5 dk |
| 4 | Overview'ye son aktiviteler kartı ekle | Overview | ~10 dk |

### Yakın (Sonraki Oturum)
| # | İş | Sayfa | Süre |
|---|-----|-------|------|
| 5 | Audit log sayfası oluştur (sidebar'a ekle) | Yeni sayfa | ~20 dk |
| 6 | Replay butonu | User Detail + Backend | ~15 dk |
| 7 | CSV Export | Users + Revenue | ~10 dk |
| 8 | Kullanıcı taklidi | Users + Backend | ~15 dk |

### Orta Vade (3. Oturum)
| # | İş | Sayfa | Süre |
|---|-----|-------|------|
| 9 | Alert migration + Settings'de eşikler | Backend + Settings | ~20 dk |
| 10 | Müşteri grafikleri | User Detail | ~20 dk |
| 11 | Webhook Test Console | System | ~15 dk |
| 12 | Eksik migration'lar (notifications, teams, portal_configs) | Backend | ~15 dk |

---

*Bu dosya her oturum sonunda güncellenmeli.*
*Son güncelleme: 2026-05-12 15:35 GMT+8 — Eksik migration'lar, User Detail, Layout, Components, SDK Update eklendi*
