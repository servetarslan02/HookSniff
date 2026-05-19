# 🛡️ HookSniff Admin Panel — Kapsamlı Analiz Raporu

> **Tarih:** 2026-05-20 00:52 GMT+8
> **Hazırlayan:** AI Assistant (Kaynak kod analizi)
> **Amaç:** Admin panelindeki tüm sayfaları, bileşenleri, veri akışlarını ve eksikleri belgelemek

---

## 📋 İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Admin Layout & Auth Guard](#2-admin-layout--auth-guard)
3. [Sayfa Sayfa Analiz (9 Sayfa)](#3-sayfa-sayfa-analiz)
4. [User Detail Sayfası (9 Sekme)](#4-user-detail-sayfası)
5. [Paylaşılan Bileşenler](#5-paylaşılan-bileşenler)
6. [API Endpoint'leri (Admin)](#6-api-endpointleri)
7. [React Query Hooks (Admin)](#7-react-query-hooks)
8. [Durum & Eksikler](#8-durum--eksikler)

---

## 1. Genel Bakış

### Admin Panel Erişimi
- **Koşul:** `user.is_admin === true`
- **Yetkisiz erişim:** "Access Denied" sayfası + dashboard'a redirect
- **URL:** `/admin` (ayrı layout, ayrı sidebar)

### Admin Teknoloji Stack
| Bileşen | Teknoloji |
|---------|-----------|
| Layout | Ayrı layout.tsx (sidebar + header) |
| State | Zustand (useAuth store) |
| Veri | React Query (useAdminData.ts hooks) |
| Grafikler | Recharts (LazyCharts) |
| i18n | next-intl (admin.* key'leri) |
| Bileşenler | Tremor (StatCard, ChartCard) |
| Deploy | Vercel (otomatik) |

### Admin Dizin Yapısı
```
admin/
├── layout.tsx                    ← Admin shell (sidebar + auth guard)
├── page.tsx                      ← Overview (4 tab'lı)
├── loading.tsx                   ← Loading skeleton
├── components/
│   ├── OverviewTab.tsx           ← Overview sekmesi
│   ├── ActivityTab.tsx           ← Activity sekmesi
│   ├── HealthTab.tsx             ← Health sekmesi
│   ├── InfraTab.tsx              ← Infrastructure sekmesi
│   └── system/
│       ├── HealthStatus.tsx      ← Sistem sağlık durumu
│       ├── QueueStatus.tsx       ← Queue durumu
│       ├── Infrastructure.tsx    ← Altyapı bilgisi
│       ├── FailedTable.tsx       ← Failed deliveries tablosu
│       ├── DeadLetters.tsx       ← Dead letters tablosu
│       ├── RateLimits.tsx        ← Rate limit violations
│       ├── LatencyTable.tsx      ← API latency tablosu
│       └── TestWebhook.tsx       ← Test webhook console
├── users/
│   ├── page.tsx                  ← Kullanıcı listesi
│   ├── components/
│   │   ├── UserFilters.tsx       ← Filtreleme
│   │   ├── UserTable.tsx         ← Tablo
│   │   ├── BulkActions.tsx       ← Toplu işlemler
│   │   ├── PlanChangeModal.tsx   ← Plan değiştirme modal
│   │   └── BanModal.tsx          ← Ban modal
│   └── [id]/
│       ├── page.tsx              ← Kullanıcı detayı (9 sekme)
│       └── components/
│           ├── OverviewTab.tsx   ← Profil + plan + analitik
│           ├── EndpointsTab.tsx  ← Endpoint'ler
│           ├── WebhooksTab.tsx   ← Webhook'lar
│           ├── ApiKeysTab.tsx    ← API key'ler
│           ├── ApplicationsTab.tsx ← Uygulamalar
│           ├── UsageTab.tsx      ← Kullanım istatistikleri
│           ├── NotesTab.tsx      ← Notlar + etiketler
│           ├── CommunicationsTab.tsx ← İletişim geçmişi
│           ├── BillingTab.tsx    ← Fatura + ödeme + refund + GDPR
│           └── UserModals.tsx    ← Tüm modal'lar
├── revenue/
│   ├── page.tsx                  ← Gelir sayfası
│   └── components/
│       └── RevenueContent.tsx    ← Gelir içerik bileşeni
├── feature-flags/
│   └── page.tsx                  ← Feature flag yönetimi
├── system/
│   └── page.tsx                  ← Sistem durumu (8 section)
├── settings/
│   ├── page.tsx                  ← Platform ayarları (4 tab)
│   └── components/
│       ├── GeneralTab.tsx        ← Genel ayarlar
│       ├── EmailTab.tsx          ← Email ayarları
│       ├── AlertsTab.tsx         ← Alert ayarları
│       └── DevTab.tsx            ← Geliştirici ayarları
├── activity/
│   └── page.tsx                  ← Audit log
├── alerts/
│   └── page.tsx                  ← Alert yönetimi
└── email/
    └── page.tsx                  ← Toplu email
```

---

## 2. Admin Layout & Auth Guard

**Dosya:** `admin/layout.tsx` (238 satır)

### Sidebar (9 Bölüm)
| Bölüm | URL | İkon | Açıklama |
|-------|-----|------|----------|
| Overview | `/admin` | 📊 BarChart3 | Genel bakış (4 tab) |
| Users | `/admin/users` | 👥 Users | Kullanıcı yönetimi |
| Revenue | `/admin/revenue` | 💰 DollarSign | Gelir takibi |
| Feature Flags | `/admin/feature-flags` | 🚩 Flag | Özellik bayrakları |
| System | `/admin/system` | 🖥️ Monitor | Sistem durumu |
| Settings | `/admin/settings` | ⚙️ Settings | Platform ayarları |
| Activity Log | `/admin/activity` | 📋 ClipboardList | Denetim kaydı |
| Alerts | `/admin/alerts` | 🔔 Bell | Alarm yönetimi |
| Email | `/admin/email` | 📧 Mail | Toplu email |

### Auth Guard
```typescript
useEffect(() => {
  if (user && !user.is_admin) {
    router.push("/");  // Admin olmayan → dashboard'a redirect
  }
}, [user, router, locale]);
```

### Header Özellikleri
- Bildirim sayısı badge'i (unread count)
- WebSocket bağlantı durumu göstergesi
- Theme toggle (dark/light)
- Dil seçici (EN/TR)
- Skip to content link (erişilebilirlik)

---

## 3. Sayfa Sayfa Analiz

### 3.1 Overview (`/admin`)

**Dosya:** `admin/page.tsx` (240+ satır)
**Tür:** 4 tab'lı sayfa (URL-based: `?tab=overview|activity|health|infra`)
**Amaç:** Sistem geneli durum özeti

#### Üst Kısım (Her Zaman Görünür)
- **4 StatCard:**
  - Toplam Kullanıcı (trend: vs yesterday)
  - Toplam Teslimat (trend: vs yesterday)
  - Toplam Gelir $ (trend: vs yesterday)
  - Aktif Kullanıcı Bugün (trend: vs yesterday)
- **Live Webhooks Indicator:** Aktif webhook sayısı + "currently processing"
- **Refresh All butonu:** Tüm verileri yenile
- **Export Dashboard CSV:** İstatistikleri CSV olarak indir

#### Tab 1: Overview (`OverviewTab.tsx`)
- Gelir grafikleri (MRR, ARR)
- Plan bazlı dağılım
- Son aktivite özeti

#### Tab 2: Activity (`ActivityTab.tsx`)
- Son audit log kayıtları
- Aksiyon tipleri (LOGIN, REGISTER, ENDPOINT_CREATE, vb.)
- Kullanıcı bazlı aktivite

#### Tab 3: Health (`HealthTab.tsx`)
- Rate limit violations (son 24 saat)
- Failed deliveries (son 24 saat)
- Queue durumu (pending/processing/failed)
- Endpoint sağlık durumu (total/active/disabled)

#### Tab 4: Infrastructure (`InfraTab.tsx`)
- Feature flag listesi
- Deploy bilgisi (versiyon, commit, tarih)
- Sistem altyapı durumu

**Veri Kaynakları (React Query):**
- `useAdminStats()` → `/admin/stats`
- `useAdminRevenue()` → `/admin/revenue`
- `useAdminAuditLogs({ limit: 5 })` → `/admin/audit-logs`
- `useAdminFeatureFlags()` → `/admin/feature-flags`
- `useAdminDeployInfo()` → `/admin/deploy-info`
- `useRateLimitViolations({ limit: 1 })` → Rate limit violations
- `useFailedDeliveries({ limit: 1 })` → Failed deliveries
- `useQueueStatus()` → Queue durumu

**Durum:** ✅ Tam çalışır (4 tab, lazy loading, CSV export, trend karşılaştırma)

---

### 3.2 Users (`/admin/users`)

**Dosya:** `admin/users/page.tsx` (339 satır)
**Tür:** Tablo sayfası (filtre + sayfalama + toplu işlem)
**Amaç:** Tüm kullanıcıları listele, yönet

#### Filtreleme (`UserFilters.tsx`)
- Arama (email, isim)
- Plan filtresi (developer, startup, pro, enterprise)
- Durum filtresi (active, banned)
- Tarih aralığı (7d, 30d, 90d)
- Sıralama (email, name, plan, status, created_at — asc/desc)

#### Tablo (`UserTable.tsx`)
- Checkbox seçimi (tek tek veya toplu)
- Kolonlar: ID, Email, İsim, Plan (renkli badge), Durum, Oluşturulma
- Plan badge renkleri: developer=gray, startup=emerald, pro=blue, enterprise=violet
- Satır tıklama → detay sayfası

#### Toplu İşlemler (`BulkActions.tsx`)
- Seçili kullanıcıları ban/unban
- Seçili kullanıcıların planını değiştir
- Toplu işlem durumu göstergesi

#### Modal'lar
- **PlanChangeModal.tsx** — Plan değiştirme onayı
- **BanModal.tsx** — Ban sebebi girişi

#### Export
- CSV export (filtrelenmiş kullanıcılar)

**API:** `useAdminUsers(params)`, `useUpdateUserPlan()`, `useUpdateUserStatus()`
**Durum:** ✅ Tam çalışır (filtre, sıralama, toplu işlem, CSV export)

---

### 3.3 Revenue (`/admin/revenue`)

**Dosya:** `admin/revenue/page.tsx` (300+ satır)
**Tür:** İstatistik + grafik + plan yönetimi
**Amaç:** Gelir takibi, metrikler, plan fiyatları

#### Üst Kısım — İstatistik Kartları
- **MRR** — Monthly Recurring Revenue (trend: vs last month)
- **Total Revenue** — Toplam gelir
- **Collected Revenue** — Tahsil edilen gelir
- **Churn Rate** — Kayıp oranı (%)
- **Export Report** — CSV indirme

#### Gelişmiş Metrikler (`useAdminRevenueMetrics()`)
- **ARPU** — Average Revenue Per User ($)
- **LTV** — Customer Lifetime Value ($)
- **NRR** — Net Revenue Retention (%)
- **Expansion Revenue** — Plan yükseltmelerden gelen ek gelir ($)

#### Müşteri Dağılımı
- Toplam müşteri sayısı
- Ödeme yapan müşteri sayısı
- Ortalama retention süresi (ay)
- Churn oranı

#### İçerik (`RevenueContent.tsx`)
- **Gelir Grafiği** — Aylık gelir trendi (area chart)
- **Plan Dağılımı** — Pie chart (hangi plandan ne kadar gelir)
- **Cohort Analizi** — Aylık müşteri cohort karşılaştırması
- **Refund Listesi** — Yapılan iadeler (son 50)
- **Churn Listesi** — Kayıp müşteriler
- **Plan Fiyat Yönetimi** — Fiyatları düzenleme (startup/pro/enterprise)

#### Tarih Aralığı Filtresi
- 7 gün, 30 gün, 90 gün, 12 ay, tüm zamanlar

**API:** `useAdminRevenue()`, `useAdminRevenueMetrics()`, `useAdminRevenueCohorts()`, `useAdminRefunds()`, `useAdminChurn()`, `useAdminSettings()`, `useUpdateSettings()`
**Durum:** ✅ Tam çalışır (metrikler, grafikler, cohort, refund, plan yönetimi)

---

### 3.4 Feature Flags (`/admin/feature-flags`)

**Dosya:** `admin/feature-flags/page.tsx` (337 satır)
**Tür:** CRUD sayfası
**Amaç:** Özellik bayraklarını yönet

#### İşlevler
- Feature flag listesi
- Yeni flag oluştur:
  - İsim
  - Açıklama
  - Enabled (toggle)
  - Rollout percentage (0-100 slider)
  - Enabled for plans (checkbox: developer, startup, pro, enterprise)
- Flag düzenle (aynı form)
- Flag silme (onay dialogu)
- Enable/disable toggle (hızlı geçiş)

#### Flag Kartları
- İsim + açıklama
- Durum badge'i (enabled/disabled)
- Rollout yüzdesi
- Plan listesi
- Oluşturulma tarihi

**API:** `useAdminFeatureFlags()`, `useCreateFeatureFlag()`, `useUpdateFeatureFlag()`, `useDeleteFeatureFlag()`
**Durum:** ✅ Tam çalışır (CRUD, rollout, plan bazlı filtre)

---

### 3.5 System (`/admin/system`)

**Dosya:** `admin/system/page.tsx` (209 satır)
**Tür:** 8 section'lı sayfa (lazy loading)
**Amaç:** Sistem durumu izleme

#### Section 1: Health Status (`HealthStatus.tsx`)
- DB durumu + latency
- Redis durumu + latency
- API durumu + uptime
- Queue durumu (pending/processing/failed)
- Genel sağlık durumu (healthy/degraded/unhealthy)

#### Section 2: Queue Status (`QueueStatus.tsx`)
- Pending sayısı
- Processing sayısı
- Failed sayısı
- Queue depth grafiği

#### Section 3: Infrastructure (`Infrastructure.tsx`)
- Deploy bilgisi (versiyon, commit hash, tarih)
- Feature flag sayısı
- Sistem bilgileri

#### Section 4: Failed Deliveries (`FailedTable.tsx`)
- Son 24 saatteki başarısız teslimatlar
- Tablo: ID, user email, endpoint URL, event type, response status, attempts, tarih
- Seçim checkbox'ları
- **Batch Replay** — Seçili teslimatları tekrar gönder

#### Section 5: Dead Letters (`DeadLetters.tsx`)
- Kalıcı olarak başarısız olmuş teslimatlar
- Tablo: ID, user email, endpoint, error message, attempts, tarih
- Dead letter detayları

#### Section 6: Rate Limit Violations (`RateLimits.tsx`)
- Son 24 saatteki hız limiti ihlalleri
- Tablo: user email, endpoint, IP, request sayısı, limit, tarih

#### Section 7: API Latency (`LatencyTable.tsx`)
- Endpoint bazlı response time
- Tablo: endpoint, method, avg ms, p95 ms, p99 ms, error rate

#### Section 8: Test Webhook (`TestWebhook.tsx`)
- Endpoint URL girişi
- Event type seçimi
- JSON payload editörü
- Gönder butonu
- Sonuç gösterimi (status, response, duration)

**API:** `useSystemHealth()`, `useAdminAlerts()`, `useQueueStatus()`, `useFailedDeliveries()`, `useDeadLetters()`, `useRateLimitViolations()`, `useApiLatency()`, `useBatchReplay()`
**Durum:** ✅ Tam çalışır (8 section, lazy loading, batch replay)

---

### 3.6 Settings (`/admin/settings`)

**Dosya:** `admin/settings/page.tsx` (333 satır)
**Tür:** 4 tab'lı sayfa
**Amaç:** Platform ayarlarını yönet

#### Tab 1: General (`GeneralTab.tsx`)
- Varsayılan plan seçimi
- Signup enable/disable toggle
- Maintenance mode toggle
- Plan limitleri (endpoint, webhook, rate limit, retention günleri — plan bazlı)
- Plan fiyatları (startup, pro, enterprise)

#### Tab 2: Email (`EmailTab.tsx`)
- Resend API key
- Email sender adresi
- Email ayarları

#### Tab 3: Alerts (`AlertsTab.tsx`)
- Alert conditions (success_rate, latency, consecutive_failures)
- Alert thresholds
- Alert channels (email, slack, webhook)

#### Tab 4: Dev (`DevTab.tsx`)
- Webhook secret
- CORS origins
- Global rate limit
- Backup retention days
- Retry max attempts

**API:** `useAdminSettings()`, `useUpdateSettings()`
**Durum:** ✅ Tam çalışır (4 tab, tüm platform ayarları)

---

### 3.7 Activity Log (`/admin/activity`)

**Dosya:** `admin/activity/page.tsx` (332 satır)
**Tür:** Tablo sayfası (filtre + sayfalama)
**Amaç:** Tüm admin aksiyonlarını izle

#### Aksiyon Tipleri (37 çeşit)
| Aksiyon | Renk | İkon |
|---------|------|------|
| LOGIN | blue | Key |
| REGISTER | green | User |
| ENDPOINT_CREATE | emerald | Plus |
| ENDPOINT_DELETE | red | Trash2 |
| ENDPOINT_UPDATE | amber | Pencil |
| API_KEY_CREATE | violet | ShieldCheck |
| API_KEY_DELETE | red | Trash2 |
| IMPERSONATE | orange | Eye |
| PASSWORD_CHANGE | yellow | Lock |
| 2FA_ENABLE | green | Shield |
| 2FA_DISABLE | red | Shield |
| SETTINGS_UPDATE | indigo | Settings |
| FEATURE_FLAG_CREATE | emerald | Flag |
| FEATURE_FLAG_UPDATE | amber | Flag |
| FEATURE_FLAG_DELETE | red | Flag |
| ALERT_CREATE | orange | AlertTriangle |
| ALERT_UPDATE | amber | AlertTriangle |
| ALERT_DELETE | red | AlertTriangle |
| DELIVERY_REPLAY | cyan | ↩️ |
| USER_PLAN_CHANGE | purple | CreditCard |
| USER_STATUS_CHANGE | pink | User |
| USER_EMAIL_SEND | blue | Mail |
| USER_GDPR_EXPORT | teal | 📤 |
| USER_GDPR_DELETE | red | Trash2 |
| ADMIN_TEST_WEBHOOK | gray | FlaskConical |
| BULK_REPLAY | cyan | ↩️ |
| ADMIN_REFUND | rose | 💸 |
| BULK_EMAIL_SENT | blue | Mail |
| GDPR_EXPORT | teal | 📤 |
| GDPR_DATA_DELETE | red | Trash2 |
| SERVICE_TOKEN_CREATE | violet | Key |
| SERVICE_TOKEN_DELETE | red | Trash2 |
| MEMBER_INVITE | green | User |
| MEMBER_REMOVE | red | User |
| ROLE_CHANGE | purple | User |
| SUBSCRIPTION_CANCEL | red | CreditCard |

#### Filtreleme
- Aksiyon tipi filtresi (dropdown)
- Sayfalama (load more)

**API:** `useAdminAuditLogs({ limit, action })`
**Durum:** ✅ Tam çalışır (37 aksiyon tipi, filtre, sayfalama)

---

### 3.8 Alerts (`/admin/alerts`)

**Dosya:** `admin/alerts/page.tsx` (381 satır)
**Tür:** CRUD sayfası
**Amaç:** Sistem alarmlarını yönet

#### İşlevler
- Alert listesi (aktif/pasif filtresi)
- Alert oluşturma formu:
  - İsim
  - Koşul: failure_rate (%), latency (ms), consecutive_failures
  - Eşik değeri
  - Kanal: email, slack, webhook
- Alert düzenle
- Alert silme (onay)
- Enable/disable toggle
- Son incident geçmişi

#### Alert Kartları
- İsim + koşul + eşik
- Durum badge'i (active/inactive)
- Kanal ikonları
- Oluşturulma tarihi
- Incident sayısı

**API:** `useAdminAlerts()`, `useCreateAlert()`, `useUpdateAlert()`, `useDeleteAlert()`
**Durum:** ✅ Tam çalışır (CRUD, filtre, toggle)

---

### 3.9 Email (`/admin/email`)

**Dosya:** `admin/email/page.tsx` (228 satır)
**Tür:** Form sayfası
**Amaç:** Toplu email gönderimi

#### İşlevler
- Email formu:
  - Konu (subject)
  - İçerik (body — textarea)
  - Plan filtresi: all paid, startup, pro, enterprise, free
  - Durum filtresi: all, verified only, unverified only
- Gönder butonu
- Onay dialogu (göndermeden önce)
- Sonuç gösterimi (total_sent, total_failed, message)
- Gönderim geçmişi (son 10)

#### Plan Filtresi
- Varsayılan: Ücretli kullanıcılar (free hariç)
- Opsiyonel: Free dahil

**API:** `adminApi.sendBulkEmail(token, { subject, body, plan_filter, status_filter })`
**Durum:** ✅ Tam çalışır (form, onay, geçmiş)

---

## 4. User Detail Sayfası (9 Sekme)

**Dosya:** `admin/users/[id]/page.tsx` (380+ satır)
**URL:** `/admin/users/[id]`
**Amaç:** Tek bir kullanıcının tüm kaynaklarını görüntüle ve yönet

### Üst Kısım — Aksiyon Butonları
- **🪝 Test Webhook** — Kullanıcıya test webhook gönder
- **📧 Send Email** — Kullanıcıya email gönder
- **👁️ Impersonate** — Kullanıcının yerine geç (yeni sekmede açar)

### Sekme 1: Overview (`OverviewTab.tsx`)
**İçerik:**
- Kullanıcı bilgi kartı: ID, email, isim, durum, oluşturulma tarihi
- Plan değiştirme (dropdown + kaydet butonu)
- Durum değiştirme (active/banned toggle + ban sebebi modal)
- Plan geçmişi tablosu
- Endpoint sağlık durumu (son teslimatlar)
- Kullanıcı analitik grafiği (30 günlük)

### Sekme 2: Endpoints (`EndpointsTab.tsx`)
**İçerik:**
- Kullanıcının tüm endpoint'leri
- Tablo: URL, açıklama, durum (aktif/pasif), oluşturulma tarihi
- Endpoint sayısı

### Sekme 3: Webhooks (`WebhooksTab.tsx`)
**İçerik:**
- Kullanıcının tüm webhook teslimatları
- Filtre: durum (delivered/failed/pending)
- Sayfalama
- Tablo: ID, event type, durum (badge), attempt sayısı, tarih
- Aksiyonlar: Detay görüntüle, replay
- Toplam sayısı

### Sekme 4: API Keys (`ApiKeysTab.tsx`)
**İçerik:**
- Kullanıcının API key'leri
- Tablo: İsim, prefix, oluşturulma tarihi
- Key rotasyonu

### Sekme 5: Applications (`ApplicationsTab.tsx`)
**İçerik:**
- Kullanıcının uygulamaları
- Tablo: İsim, açıklama, endpoint sayısı, oluşturulma tarihi

### Sekme 6: Usage (`UsageTab.tsx`)
**İçerik:**
- 4 istatistik kartı: Toplam teslimat, başarı oranı, endpoint sayısı, son 7 gün
- Teslimat dağılımı: delivered/failed/pending
- En çok kullanılan event type'lar

### Sekme 7: Notes & Tags (`NotesTab.tsx`)
**İçerik:**
- Etiketler (tags): VIP, at-risk, enterprise-ready, churn-risk
  - Etiket ekleme (input)
  - Etiket silme (X butonu)
  - Renkli badge'ler
- Notlar: Admin notları
  - Not ekleme (textarea)
  - Not listesi (admin email + tarih + içerik)

### Sekme 8: Communications (`CommunicationsTab.tsx`)
**İçerik:**
- İletişim geçmişi tablosu
- Filtre: tür (email, impersonate, refund, plan_change, ban, gdpr_export, gdpr_delete)
- Sayfalama
- Tablo: Tür (ikon + badge), konu, detaylar, admin email, tarih

### Sekme 9: Billing (`BillingTab.tsx`)
**İçerik:**
- Fatura listesi (invoices)
  - Filtre: durum (paid, pending, failed)
  - Sayfalama
  - Tablo: ID, miktar, plan, durum (badge), tarih
- Ödeme geçmişi (payments)
  - Tablo: ID, miktar, durum, tarih
- Refund geçmişi (refunds)
  - Tablo: ID, miktar, sebep, durum, tarih
- **Process Refund butonu** — İade işlemi (sadece ücretli planlar)
- **GDPR Export** — Kullanıcı verisini JSON olarak indir
- **GDPR Delete** — Kullanıcı verisini sil (onay + sebep)

### Modal'lar (`UserModals.tsx`)
- Ban modal (sebep girişi)
- Email modal (konu + içerik)
- Refund modal (miktar + sebep)
- Test webhook modal (URL + event + payload + sonuç)
- GDPR delete modal (sebep + onay)
- Delivery detail modal (teslimat detayları + attempt'ler)

**API Hooks (30+):**
- `useAdminUserDetail(id)`, `useAdminUserAnalytics(id, 30)`, `useAdminUserPlanHistory(id)`
- `useAdminUserEndpoints(id)`, `useAdminUserWebhooks(id, params)`, `useAdminUserApiKeys(id)`
- `useAdminUserApplications(id)`, `useAdminUserUsage(id)`
- `useAdminUserNotes(id)`, `useAdminUserTags(id)`, `useAdminUserCommunications(id, params)`
- `useAdminUserInvoices(id, params)`, `useAdminUserPayments(id)`, `useAdminUserRefunds(id)`
- `useDeliveryDetail(id)`, `useDeliveryAttempts(id)`
- `useUpdateUserPlan()`, `useUpdateUserStatus()`, `useAdminSendEmail()`, `useAdminImpersonate()`
- `useAdminRefundUser()`, `useAdminGdprExport()`, `useAdminGdprDelete()`
- `useAdminUserTestWebhook()`, `useAdminAddNote()`, `useAdminAddTag()`, `useAdminRemoveTag()`, `useAdminReplayDelivery()`

**Durum:** ✅ Tam çalışır (9 sekme, 30+ hook, tüm CRUD operasyonları)

---

## 5. Paylaşılan Bileşenler

### System Bileşenleri (`admin/components/system/`)
| Bileşen | Satır | İşlev |
|---------|-------|-------|
| `HealthStatus.tsx` | ~80 | DB, Redis, API, queue sağlık durumu kartları |
| `QueueStatus.tsx` | ~60 | Queue depth göstergesi (pending/processing/failed) |
| `Infrastructure.tsx` | ~70 | Deploy bilgisi, versiyon, commit |
| `FailedTable.tsx` | ~100 | Failed deliveries tablosu + checkbox + batch replay |
| `DeadLetters.tsx` | ~80 | Dead letters tablosu (kalıcı başarısızlıklar) |
| `RateLimits.tsx` | ~80 | Rate limit violations tablosu |
| `LatencyTable.tsx` | ~80 | API latency tablosu (avg/p95/p99) |
| `TestWebhook.tsx` | ~100 | Test webhook console (URL + payload + sonuç) |

### Overview Bileşenleri (`admin/components/`)
| Bileşen | Satır | İşlev |
|---------|-------|-------|
| `OverviewTab.tsx` | ~150 | Gelir özeti, plan dağılımı, son aktivite |
| `ActivityTab.tsx` | ~100 | Son audit log kayıtları |
| `HealthTab.tsx` | ~120 | Rate limit, failed, queue, endpoint sağlık |
| `InfraTab.tsx` | ~80 | Feature flags, deploy info |

### User Detail Bileşenleri (`admin/users/[id]/components/`)
| Bileşen | Satır | İşlev |
|---------|-------|-------|
| `OverviewTab.tsx` | ~350 | Profil, plan, analitik, endpoint durumu |
| `EndpointsTab.tsx` | ~80 | Endpoint listesi tablosu |
| `WebhooksTab.tsx` | ~100 | Webhook listesi + filtre + sayfalama |
| `ApiKeysTab.tsx` | ~80 | API key listesi |
| `ApplicationsTab.tsx` | ~80 | Uygulama listesi |
| `UsageTab.tsx` | ~80 | Kullanım istatistikleri + grafik |
| `NotesTab.tsx` | ~120 | Notlar + etiketler |
| `CommunicationsTab.tsx` | ~100 | İletişim geçmişi |
| `BillingTab.tsx` | ~200 | Fatura + ödeme + refund + GDPR |
| `UserModals.tsx` | ~300 | Tüm modal'lar (ban, email, refund, webhook, GDPR, delivery) |

---

## 6. API Endpoint'leri (Admin)

### Overview & Stats
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/stats` | Sistem istatistikleri |
| GET | `/admin/revenue` | Gelir raporu |
| GET | `/admin/revenue/metrics` | ARPU, LTV, NRR, Expansion |
| GET | `/admin/revenue/cohorts` | Cohort analizi |
| GET | `/admin/revenue/export` | CSV export |
| GET | `/admin/deploy-info` | Deploy bilgisi |

### Users
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/users` | Kullanıcı listesi (filtre + sayfalama) |
| GET | `/admin/users/export` | CSV export |
| GET | `/admin/users/{id}` | Kullanıcı detayı |
| PUT | `/admin/users/{id}/plan` | Plan değiştir |
| GET | `/admin/users/{id}/plan-history` | Plan geçmişi |
| PUT | `/admin/users/{id}/status` | Ban/unban |
| POST | `/admin/users/{id}/impersonate` | Impersonate |
| POST | `/admin/users/{id}/send-email` | Email gönder |
| GET | `/admin/users/{id}/analytics` | Kullanıcı analitik |

### User Resources
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/users/{id}/endpoints` | Endpoint'ler |
| GET | `/admin/users/{id}/webhooks` | Webhook'lar (filtre + sayfalama) |
| GET | `/admin/users/{id}/api-keys` | API key'ler |
| GET | `/admin/users/{id}/applications` | Uygulamalar |
| GET | `/admin/users/{id}/usage` | Kullanım istatistikleri |
| GET | `/admin/users/{id}/notes` | Notlar |
| POST | `/admin/users/{id}/notes` | Not ekle |
| GET | `/admin/users/{id}/tags` | Etiketler |
| POST | `/admin/users/{id}/tags` | Etiket ekle |
| DELETE | `/admin/users/{id}/tags/{tag}` | Etiket sil |
| GET | `/admin/users/{id}/communications` | İletişim geçmişi |
| GET | `/admin/users/{id}/invoices` | Faturalar |
| GET | `/admin/users/{id}/payments` | Ödemeler |
| GET | `/admin/users/{id}/refunds` | Refund'lar |

### User Actions
| Method | Endpoint | İşlev |
|--------|----------|-------|
| POST | `/admin/users/{id}/refund` | İade yap |
| POST | `/admin/users/{id}/test-webhook` | Test webhook gönder |
| POST | `/admin/users/{id}/webhooks/{id}/replay` | Delivery replay |
| GET | `/admin/users/{id}/export` | GDPR export |
| DELETE | `/admin/users/{id}/data` | GDPR delete |

### System
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/system/health` | Sistem sağlık durumu |
| GET | `/admin/queue/status` | Queue durumu |
| GET | `/admin/deliveries/failed` | Failed deliveries |
| GET | `/admin/deliveries/dead-letters` | Dead letters |
| GET | `/admin/rate-limit-violations` | Rate limit ihlalleri |
| GET | `/admin/api-latency` | API latency |
| POST | `/admin/deliveries/batch-replay` | Toplu replay |

### Feature Flags
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/feature-flags` | Flag listesi |
| POST | `/admin/feature-flags` | Flag oluştur |
| PUT | `/admin/feature-flags/{id}` | Flag güncelle |
| DELETE | `/admin/feature-flags/{id}` | Flag sil |

### Settings
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/settings` | Platform ayarları |
| PUT | `/admin/settings` | Ayarları güncelle |

### Alerts
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/alerts` | Alert listesi |
| POST | `/admin/alerts` | Alert oluştur |
| PUT | `/admin/alerts/{id}` | Alert güncelle |
| DELETE | `/admin/alerts/{id}` | Alert sil |

### Audit Log
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/audit-logs` | Audit log (filtre + sayfalama) |

### Email
| Method | Endpoint | İşlev |
|--------|----------|-------|
| POST | `/admin/bulk-email` | Toplu email gönder |

### Refunds
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/refunds` | Refund listesi |

### Churn
| Method | Endpoint | İşlev |
|--------|----------|-------|
| GET | `/admin/churn` | Churn raporu |

**Toplam:** 45+ HTTP endpoint

---

## 7. React Query Hooks (Admin)

**Dosya:** `hooks/useAdminData.ts`

### Stats & Revenue
- `useAdminStats()` — Sistem istatistikleri
- `useAdminRevenue()` — Gelir raporu
- `useAdminRevenueMetrics()` — ARPU, LTV, NRR
- `useAdminRevenueCohorts(months)` — Cohort analizi
- `useAdminChurn()` — Churn raporu

### Users
- `useAdminUsers(params)` — Kullanıcı listesi
- `useAdminUserDetail(id)` — Kullanıcı detayı
- `useAdminUserAnalytics(id, days)` — Analitik
- `useAdminUserPlanHistory(id)` — Plan geçmişi
- `useAdminUserEndpoints(id)` — Endpoint'ler
- `useAdminUserWebhooks(id, params)` — Webhook'lar
- `useAdminUserApiKeys(id)` — API key'ler
- `useAdminUserApplications(id)` — Uygulamalar
- `useAdminUserUsage(id)` — Kullanım
- `useAdminUserNotes(id)` — Notlar
- `useAdminUserTags(id)` — Etiketler
- `useAdminUserCommunications(id, params)` — İletişim
- `useAdminUserInvoices(id, params)` — Faturalar
- `useAdminUserPayments(id)` — Ödemeler
- `useAdminUserRefunds(id)` — Refund'lar

### User Mutations
- `useUpdateUserPlan()` — Plan değiştir
- `useUpdateUserStatus()` — Ban/unban
- `useAdminSendEmail()` — Email gönder
- `useAdminImpersonate()` — Impersonate
- `useAdminRefundUser()` — İade yap
- `useAdminGdprExport()` — GDPR export
- `useAdminGdprDelete()` — GDPR delete
- `useAdminUserTestWebhook()` — Test webhook
- `useAdminAddNote()` — Not ekle
- `useAdminAddTag()` — Etiket ekle
- `useAdminRemoveTag()` — Etiket sil
- `useAdminReplayDelivery()` — Delivery replay

### System
- `useSystemHealth()` — Sistem sağlık
- `useQueueStatus()` — Queue durumu
- `useFailedDeliveries(params)` — Failed deliveries
- `useDeadLetters(params)` — Dead letters
- `useRateLimitViolations(params)` — Rate limit ihlalleri
- `useApiLatency(params)` — API latency
- `useBatchReplay()` — Toplu replay

### Feature Flags
- `useAdminFeatureFlags()` — Flag listesi
- `useCreateFeatureFlag()` — Flag oluştur
- `useUpdateFeatureFlag()` — Flag güncelle
- `useDeleteFeatureFlag()` — Flag sil

### Settings & Alerts
- `useAdminSettings()` — Platform ayarları
- `useUpdateSettings()` — Ayarları güncelle
- `useAdminAlerts()` — Alert listesi
- `useCreateAlert()` — Alert oluştur
- `useUpdateAlert()` — Alert güncelle
- `useDeleteAlert()` — Alert sil

### Audit Log
- `useAdminAuditLogs(params)` — Audit log

### Refunds
- `useAdminRefunds(params)` — Refund listesi

### Deploy
- `useAdminDeployInfo()` — Deploy bilgisi

**Toplam:** 50+ React Query hook

---

## 8. Durum & Eksikler

### ✅ Tam Çalışan Sayfalar (9/9)

| Sayfa | Durum | Son İyileştirme |
|-------|-------|-----------------|
| Overview | ✅ | 4 tab, CSV export, trend |
| Users | ✅ | Filtre, sıralama, toplu işlem |
| User Detail | ✅ | 9 sekme, 30+ hook, tüm CRUD |
| Revenue | ✅ | ARPU, LTV, NRR, cohort, refund |
| Feature Flags | ✅ | CRUD, rollout, plan bazlı |
| System | ✅ | 8 section, batch replay |
| Settings | ✅ | 4 tab, tüm platform ayarları |
| Activity Log | ✅ | 37 aksiyon tipi, filtre |
| Alerts | ✅ | CRUD, filtre, toggle |
| Email | ✅ | Toplu email, filtre, geçmiş |

### 📊 Admin Panel İstatistikleri

| Metrik | Değer |
|--------|-------|
| Toplam sayfa | 9 |
| Toplam bileşen | 30+ |
| Toplam API endpoint | 45+ |
| Toplam React Query hook | 50+ |
| Aksiyon tipi (audit) | 37 |
| i18n key (admin.*) | 200+ |

### ⚠️ Potansiyel İyileştirmeler

| # | İyileştirme | Öncelik | Açıklama |
|---|-------------|---------|----------|
| 1 | Real-time dashboard | Orta | WebSocket ile canlı istatistik güncelleme |
| 2 | Grafik filtreleri | Orta | Revenue grafikte plan bazlı filtre |
| 3 | Export tüm sayfalar | Düşük | Her sayfada CSV export butonu |
| 4 | Admin activity heatmap | Düşük | Zaman bazlı aktivite yoğunluğu grafiği |
| 5 | Customer health score | Yüksek | Otomatik müşteri sağlık skoru (kullanım trendi + ödeme + endpoint durumu) |
| 6 | Bulk operations genişletme | Orta | Toplu email + tolu plan değiştirme + toplu ban |
| 7 | Admin dashboard widget'ları | Düşük | Sürükle-bırak widget sistemi |
| 8 | Alert incident history | Orta | Geçmiş incident'lerin detaylı log'u |
| 9 | Revenue forecast | Yüksek | 3/6/12 aylık gelir projeksiyonu |
| 10 | Customer segmentation | Yüksek | Dinamik segment oluşturma (kural bazlı) |

---

## 📝 Son Güncelleme

Bu rapor 2026-05-20 tarihinde admin paneli kaynak kod analizi ile hazırlanmıştır.
