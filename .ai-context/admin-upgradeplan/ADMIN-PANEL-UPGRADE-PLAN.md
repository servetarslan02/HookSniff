# 🪝 HookSniff Kullanıcı Paneli — Kapsamlı Analiz Raporu

> **Tarih:** 2026-05-20 00:46 GMT+8
> **Hazırlayan:** AI Assistant (Oturum analizi)
> **Amaç:** Dashboard'daki tüm sayfaları, bileşenleri, veri akışlarını ve eksikleri belgelemek

---

## 📋 İçindekiler

1. [Genel Mimari](#1-genel-mimari)
2. [Sidebar Yapısı (Navigasyon)](#2-sidebar-yapısı)
3. [Ana Dashboard Sayfaları (11 Bölüm)](#3-ana-dashboard-sayfaları)
4. [Admin Panel (9 Sayfa)](#4-admin-panel)
5. [Public Sayfalar (20+ Sayfa)](#5-public-sayfalar)
6. [Paylaşılan Bileşenler](#6-paylaşılan-bileşenler)
7. [Veri Akışı & API Entegrasyonu](#7-veri-akışı--api-entegrasyonu)
8. [Durum & Eksikler](#8-durum--eksikler)

---

## 1. Genel Mimari

### Teknoloji Stack
| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Framework | Next.js (App Router) | 15+ |
| Dil | TypeScript | 5.x |
| Stil | Tailwind CSS | 4.x |
| State | Zustand (store.tsx) | - |
| Veri Çekme | React Query (@tanstack/react-query) | - |
| Grafikler | Recharts (LazyCharts ile) | - |
| i18n | next-intl (EN + TR) | - |
| İkonlar | Lucide React | - |
| Tablo | Özel VirtualTable bileşeni | - |
| Deploy | Vercel (otomatik) | - |

### Dizin Yapısı
```
dashboard/src/
├── app/
│   ├── [locale]/
│   │   ├── (dashboard)/          ← Auth gerektiren ana panel (50+ sayfa)
│   │   ├── admin/                ← Admin paneli (9 sayfa, ayrı layout)
│   │   ├── docs/                 ← Dokümantasyon (30+ sayfa)
│   │   ├── auth/                 ← Auth callback
│   │   ├── login/register/...    ← Public sayfalar
│   │   └── ...
│   └── api/                      ← Next.js API routes (auth, playground, status)
├── components/                   ← Paylaşılan bileşenler (30+ dosya)
├── hooks/                        ← React Query hooks (useDashboardData.ts)
├── lib/
│   ├── api.ts                    ← API istemcisi (tüm endpoint'ler)
│   ├── api-types.ts              ← TypeScript tip tanımları
│   ├── store.tsx                 ← Zustand store (auth, theme)
│   └── errors.ts                 ← Hata yönetimi
├── i18n/
│   ├── navigation.ts             ← i18n navigation utils
│   └── request.ts                ← Locale config
└── messages/
    ├── en.json                   ← İngilizce çeviriler
    └── tr.json                   ← Türkçe çeviriler
```

---

## 2. Sidebar Yapısı

### Dashboard Sidebar (11 Ana Bölüm)
```
🏠 Core                 → /core           (Dashboard + API Keys + Service Tokens)
📱 Applications         → /applications   (Uygulama yönetimi)
📦 Deliveries           → /deliveries     (Logs + Deliveries + Search)
🪝 Operational Webhooks → /operational-webhooks
⚡ Integrations         → /integrations   (Integrations + Connectors + Streaming)
👁️ Observability        → /observability  (Health + Alerts + Analytics)
🔧 DevTools             → /devtools       (Playground + Signature + Webhook Builder + API Importer)
⚙️ Routing & Config     → /routing-config (Routing + Retry + Custom Domain + Environments + Rate Limiting)
👥 Organization         → /organization   (Team + SSO + Audit Log)
💳 Billing              → /billing-section
👤 Account              → /account        (Settings + Notifications + Portal Customize + Portal Manage)
```

### Admin Sidebar (9 Bölüm — sadece `is_admin` kullanıcılar)
```
📊 Overview     → /admin
👥 Users        → /admin/users
💰 Revenue      → /admin/revenue
🚩 Feature Flags → /admin/feature-flags
🖥️ System       → /admin/system
⚙️ Settings     → /admin/settings
📋 Activity Log → /admin/activity
🔔 Alerts       → /admin/alerts
📧 Email        → /admin/email
```

---

## 3. Ana Dashboard Sayfaları

### 3.1 Core (`/core`)

**Dosya:** `app/[locale]/(dashboard)/core/page.tsx`
**Tür:** TabbedSection (3 sekme)
**Amaç:** Ana kontrol merkezi — istatistikler, API anahtarları, servis token'ları

#### Sekme 1: Dashboard Overview
**Dosya:** `DashboardOverview.tsx` (446 satır)
**Bileşenler:**
- `StatCard` — Toplam teslimat, başarı oranı, aktif endpoint, pending sayısı
- `DeliveryTrendChart` — Area chart (başarılı/failed teslimat trendi)
- `SuccessRateDonut` — Pie chart (başarılı/failed/pending oranı)
- `RecentDeliveriesTable` — Son 5 teslimat tablosu
- `ActivityFeed` — Son aktivite akışı
- `TimeRangeSelector` — Zaman aralığı seçici (24h/7d/30d/90d)
- Widget drag-drop desteği (sıralama, gizleme/gösterme)

**Veri Kaynakları (React Query):**
- `useDashboardStats()` → `/admin/stats` (opsiyonel) veya fallback
- `useDeliveryTrend(timeRange)` → Teslimat trend verisi
- `useWebhooks({ page: 1 })` → Son teslimatlar
- `useEndpoints()` → Endpoint sayısı

**Durum:** ✅ Çalışıyor, React Query ile optimize edilmiş

#### Sekme 2: API Keys
**Dosya:** `api-keys/page.tsx` (116 satır)
**İşlevler:**
- API key listesi (isim, prefix, oluşturulma tarihi)
- Yeni key oluştur (isim ile)
- Key rotasyonu (eski → yeni key)
- Key silme (onay dialogu)
- Yeni oluşturulan key gösterimi (bir kereye mahsus)

**API:** `useApiKeys()`, `useCreateApiKey()`, `useDeleteApiKey()`, `useRotateApiKey()`
**Durum:** ✅ Çalışıyor

#### Sekme 3: Service Tokens
**Dosya:** `service-tokens/page.tsx` (222 satır)
**İşlevler:**
- Token listesi (isim, scope, süre, durum)
- Yeni token oluştur
- Token düzenleme (isim)
- Token silme
- Token göster/gizle (reveal)

**API:** `useServiceTokens()`, `useCreateServiceToken()`, `useDeleteServiceToken()`, `useRevealServiceToken()`, `useUpdateServiceToken()`
**Durum:** ✅ Çalışıyor

---

### 3.2 Applications (`/applications`)

**Dosya:** `app/[locale]/(dashboard)/applications/page.tsx` (406 satır)
**Tür:** Tek sayfa (card grid)
**Amaç:** Uygulama yönetimi — müşteri webhook uygulamaları

**İşlevler:**
- Uygulama listesi (kart görünümü)
- Uygulama oluştur (isim + açıklama modal)
- Uygulama düzenle (isim + açıklama)
- Uygulama silme (onay dialogu)
- Etiketler: active/inactive, new (<7 gün), production (>5 endpoint)
- Detay sayfası: `/applications/[id]`

**Bileşenler:**
- App kartları (isim, açıklama, endpoint sayısı, etiketler, tarih)
- Empty state (ilk uygulama)
- Loading skeleton

**API:** `useApplications()`, `useCreateApplication()`, `useUpdateApplication()`, `useDeleteApplication()`
**Durum:** ✅ Çalışıyor

---

### 3.3 Deliveries (`/deliveries`)

**Dosya:** `app/[locale]/(dashboard)/deliveries/page.tsx`
**Tür:** TabbedSection (3 sekme)
**Amaç:** Webhook teslimat takibi ve hata ayıklama

#### Sekme 1: Logs
**Dosya:** `logs/page.tsx` (418 satır)
**İşlevler:**
- Teslimat logları listesi (sayfalı)
- Durum filtresi: all/delivered/failed/pending
- Arama (event type, ID, endpoint)
- Otomatik yenileme (5sn toggle)
- Detay paneli: attempt'ler, response kodu, hata mesajı
- Status badge'leri (renkli)
- Sayfalama (URL-based: ?page=1&status=failed)

**Veri:** `useDeliveryLogs({ page, status, refetchInterval })`
**Durum:** ✅ Çalışıyor

#### Sekme 2: Deliveries
**Dosya:** `deliveries/DeliveriesList.tsx`
**İşlevler:** Teslimat listesi (detaylı görünüm)
**Durum:** ✅ Çalışıyor

#### Sekme 3: Search
**Dosya:** `search/page.tsx`
**İşlevler:** Teslimat arama (event type, ID, endpoint ile)
**Durum:** ✅ Çalışıyor

---

### 3.4 Operational Webhooks (`/operational-webhooks`)

**Dosya:** `app/[locale]/(dashboard)/operational-webhooks/page.tsx`
**Tür:** Container component → `OperationalWebhooksContainer.tsx`
**Amaç:** HookSniff'in kendi operational webhook'larını yönetme

**İşlevler:**
- Operational webhook endpoint'leri listesi
- Yeni endpoint oluştur (URL, event type)
- Endpoint düzenle/sil
- Teslimat durumlarını izle
- Event types: delivery.completed, delivery.failed, alert.triggered, vb.

**Durum:** ✅ Çalışıyor

---

### 3.5 Integrations (`/integrations`)

**Dosya:** `app/[locale]/(dashboard)/integrations/page.tsx`
**Tür:** TabbedSection (3 sekme)
**Amaç:** Harici servis entegrasyonları

#### Sekme 1: Integrations
**Dosya:** `integrations/IntegrationsContent.tsx` (445 satır)
**İşlevler:**
- Entegrasyon listesi (provider bazlı)
- Yeni entegrasyon oluştur (8 provider: Stripe, Shopify, GitHub, Slack, Twilio, Discord, Linear, Notion + Generic)
- Entegrasyon düzenle/sil
- Sağlık durumu: healthy/degraded/failing/new
- Durum: pending/processing/delivered/failed/filtered
- Endpoint bağlama
- Config yönetimi

**API:** `integrationsApi.list()`, `integrationsApi.create()`, vb.
**Durum:** ✅ Çalışıyor

#### Sekme 2: Connectors
**Dosya:** `connectors/page.tsx` (265 satır)
**İşlevler:**
- Connector config'leri listesi (8 provider)
- Yeni config oluştur (connector seçimi + isim)
- Config düzenle/sil
- Provider ikonları (Stripe, Shopify, GitHub, Slack, Twilio, Discord, Linear, Notion)

**API:** `connectorsApi.list()`, `connectorsApi.listConfigs()`, `connectorsApi.createConfig()`, vb.
**Durum:** ✅ Çalışıyor

#### Sekme 3: Streaming
**Dosya:** `streaming/page.tsx` (496 satır)
**İşlevler:**
- Stream kanalları listesi
- Kanal oluştur (isim, açıklama, tip: SSE/WebSocket/Webhook, event filtresi)
- Kanal düzenle/sil
- Mesaj yayınla (event type + JSON payload)
- Canlı event feed (SSE ile gerçek zamanlı)
- Abonelik yönetimi
- Kanal detay: overview/messages/subscriptions sekmeleri

**API:** `streamApi.listChannels()`, `streamApi.createChannel()`, `streamApi.publish()`, vb.
**Durum:** ✅ Çalışıyor

---

### 3.6 Observability (`/observability`)

**Dosya:** `app/[locale]/(dashboard)/observability/page.tsx`
**Tür:** TabbedSection (3 sekme)
**Amaç:** İzleme, alarmlar ve analitik

#### Sekme 1: Health
**Dosya:** `health/page.tsx` (159 satır)
**İşlevler:**
- Endpoint sağlık durumu listesi
- Durum kartları: healthy/degraded/unhealthy (sayılarla)
- Her endpoint için sağlık kartı
- Yenileme butonu
- Hata banner'ı (retry ile)

**Veri:** `useEndpointHealth()`
**Durum:** ✅ Çalışıyor

#### Sekme 2: Alerts
**Dosya:** `alerts/page.tsx` (281 satır)
**İşlevler:**
- Alert listesi (aktif/pasif toggle)
- Alert oluşturma formu:
  - İsim
  - Koşul: failure_rate (%), latency (ms), consecutive_failures
  - Eşik değeri
  - Kanal: Slack, email, webhook
- Alert düzenle/sil
- Alert test butonu
- Durum badge'leri

**API:** `useAlerts()`, `useCreateAlert()`, `useUpdateAlert()`, `useDeleteAlert()`, `useTestAlert()`
**Durum:** ✅ Çalışıyor

#### Sekme 3: Analytics
**Dosya:** `analytics/page.tsx` (170 satır)
**İşlevler:**
- Teslimat trendi (area chart — başarılı/failed)
- Başarı oranı (pie chart — başarılı/failed/pending)
- Latency trendi (area chart)
- Zaman aralığı seçici: 24h/7d/30d/90d
- İstatistik kartları

**Veri:** `useDeliveryTrend(timeRange)`, `useSuccessRate(timeRange)`, `useLatencyTrend(timeRange)`
**Durum:** ✅ Çalışıyor

---

### 3.7 DevTools (`/devtools`)

**Dosya:** `app/[locale]/(dashboard)/devtools/page.tsx`
**Tür:** TabbedSection (4 sekme)
**Amaç:** Geliştirici araçları

#### Sekme 1: Playground
**Dosya:** `sandbox/page.tsx` → `sandbox/content.tsx` → `sandbox/playground/page.tsx`
**İşlevler:**
- JSON payload oluşturucu
- Endpoint seçimi
- Webhook gönderimi
- Response görüntüleyici (status, header, body)
- Geçmiş paneli (önceki test'ler)
- Canlı request viewer

**Durum:** ✅ Çalışıyor

#### Sekme 2: Signature Verifier
**Dosya:** `signature-verifier/page.tsx` (252 satır)
**İşlevler:**
- Secret gizli/görünür toggle
- Payload textarea
- İmza hesaplama (HMAC-SHA256)
- İmza doğrulama (karşılaştırma)
- Format otomatik normalize (hex → sha256= prefix)
- Çok dilli kod örnekleri: Node.js, Python, Go (tab'lı geçiş)
- Kopyalama butonu (HTTPS fallback)
- Klavye kısayolu: Ctrl/Cmd + Enter
- Temizleme butonu

**Durum:** ✅ Çalışıyor (son oturumda kapsamlı iyileştirme yapıldı)

#### Sekme 3: Webhook Builder
**Dosya:** `webhook-builder/page.tsx`
**İşlevler:**
- Event type seçimi
- JSON payload editörü
- Header ekleme/düzenleme
- Önizleme
- Gönderimi

**Durum:** ✅ Çalışıyor

#### Sekme 4: API Importer
**Dosya:** `api-importer/page.tsx` + `api-importer/parser.ts`
**İşlevler:**
- OpenAPI/Swagger spec yapıştırma
- Parse sonuçları paneli
- Endpoint'leri otomatik oluşturma
- Spec doğrulama

**Durum:** ✅ Çalışıyor

---

### 3.8 Routing & Config (`/routing-config`)

**Dosya:** `app/[locale]/(dashboard)/routing-config/page.tsx`
**Tür:** TabbedSection (5 sekme)
**Amaç:** Endpoint yönlendirme, retry, domain, ortam ve hız sınırlama

#### Sekme 1: Routing
**Dosya:** `routing/page.tsx` (179 satır)
**İşlevler:**
- Endpoint listesi (routing stratejisi ile)
- Strateji seçimi: round-robin, failover, weighted, random
- Fallback URL belirleme
- Düzenleme modal'ı
- Strateji açıklamaları (ikon + açıklama)

**API:** `endpointsApi.update(token, id, { routing_strategy, fallback_url })`
**Durum:** ✅ Çalışıyor

#### Sekme 2: Retry Policy
**Dosya:** `retry-policy/page.tsx` (217 satır)
**İşlevler:**
- Endpoint listesi (retry politikası ile)
- Max attempts (1-10 arası slider/input)
- Backoff tipi: exponential, linear, fixed
- Initial delay (saniye)
- Max delay (saniye)
- Varsayılana sıfırla butonu
- Önizleme kartı (gecikme hesaplama)

**API:** `endpointsApi.update(token, id, { retry_policy })`
**Durum:** ✅ Çalışıyor

#### Sekme 3: Custom Domain
**Dosya:** `custom-domain/page.tsx` (376 satır)
**İşlevler:**
- Mevcut domain'ler listesi
- Yeni domain ekleme (http/https otomatik temizleme)
- DNS kayıtları gösterimi (CNAME + TXT)
- TXT record kopyalama
- Domain doğrulama (CNAME kontrolü — vercel-dns.com kabul)
- SSL durumu
- Domain silme (onay dialogu)
- Loading skeleton
- Empty state
- Load error + retry butonu
- Enter tuşu ile form gönderimi

**Durum:** ✅ Çalışıyor (son oturumda 14 sorun düzeltildi)

#### Sekme 4: Environments
**Dosya:** `environments/page.tsx` (449 satır)
**İşlevler:**
- Ortam listesi (production, staging, development)
- Ortam oluştur (isim, slug, açıklama, renk, varsayılan)
- Ortam düzenle/sil
- Ortam değişkenleri yönetimi:
  - Key-value çiftleri
  - Secret flag (gizli değişken)
  - Değişken ekleme/düzenleme/silme
- Varsayılan ortam işaretleme

**API:** `environmentsApi.list()`, `environmentsApi.create()`, `environmentsApi.listVariables()`, vb.
**Durum:** ✅ Çalışıyor

#### Sekme 5: Rate Limiting
**Dosya:** `rate-limiting/page.tsx` (226 satır)
**İşlevler:**
- Endpoint listesi (rate limit ayarları ile)
- RPS (requests per second) ayarı
- Burst size ayarı
- Enable/disable toggle
- Düzenleme modal'ı
- İstatistik kartları: toplam endpoint, avg RPS, peak RPS
- Silme (rate limit kaldırma)

**API:** `useRateLimits()`, `useSetRateLimit()`, `useDeleteRateLimit()`
**Durum:** ✅ Çalışıyor

---

### 3.9 Organization (`/organization`)

**Dosya:** `app/[locale]/(dashboard)/organization/page.tsx`
**Tür:** TabbedSection (3 sekme) + takım seçici
**Amaç:** Organizasyon, takım, SSO ve denetim yönetimi

#### Takım Seçici
- Birden fazla takım varsa üst kısımda select dropdown
- Varsayılan olarak ilk takım seçilir
- SSO sayfasına `teamId` prop olarak geçilir

#### Sekme 1: Team
**Dosya:** `team/page.tsx` (404 satır)
**Bileşenler:** `TeamList.tsx`, `TeamDetail.tsx`, `CreateTeamModal.tsx`, `InviteMemberModal.tsx`, `TransferOwnershipModal.tsx`
**İşlevler:**
- Takım listesi (isim, üye sayısı, tarih)
- Takım oluşturma (isim)
- Takım detayı: üye listesi, davet listesi
- Üye davet etme (email + rol: admin/member)
- Üye çıkarma (onay)
- Rol değiştirme (admin/member)
- Sahhiplik transfer etme (onay modal)
- Davet iptal etme
- Davet yeniden gönderme
- Takım silme (sahip only)
- Takımdan ayrılma (sahip olmayan)

**API:** `useTeams()`, `useTeamMembers()`, `useCreateTeam()`, `useInviteTeamMember()`, vb. (15+ hook)
**Durum:** ✅ Çalışıyor

#### Sekme 2: SSO
**Dosya:** `sso/page.tsx`
**İşlevler:**
- Enterprise plan kontrolü (olmayan → upgrade prompt)
- SSO config formu:
  - Sağlayıcı seçimi: SAML 2.0 veya OpenID Connect
  - SAML: metadata URL, entity ID, SSO URL, sertifika
  - OIDC: issuer URL, client ID, client secret
- Config kaydetme/silme
- Test butonu (gerçek IdP bağlantısı)
- Enforce akışı (4 adım):
  1. Sağlayıcı seçimi
  2. Yapılandırma
  3. Test
  4. Zorunlu kıl (onay modal: "Tüm ekip üyeleri SSO ile giriş yapacak")
- Admin bypass checkbox

**API:** `ssoApi.getConfig()`, `ssoApi.saveConfig()`, `ssoApi.testSso()`, `ssoApi.deleteSso()`
**Durum:** ✅ Çalışıyor (son oturumda SSO organizasyona taşındı)

#### Sekme 3: Audit Log
**Dosya:** `audit-log/page.tsx` (139 satır)
**İşlevler:**
- Audit log listesi (sayfalı)
- Aksiyon filtresi (dropdown)
- Aksiyon ikonları: auth.login, auth.logout, auth.register, endpoint.create/update/delete, apikey.create/rotate/delete, webhook.send/replay, team.invite/remove, settings.update, billing.update, schema.create, portal.update
- Tarih formatı
- "Daha fazla yükle" butonu

**Veri:** `useAuditLogs({ page, limit, action })`
**Durum:** ✅ Çalışıyor

---

### 3.10 Billing (`/billing-section`)

**Dosya:** `app/[locale]/(dashboard)/billing-section/page.tsx` → `billing/page.tsx` (225 satır)
**Tür:** Tek sayfa (çok bileşenli)
**Amaç:** Faturalandırma ve plan yönetimi

**Bileşenler:**
- `PlanCards.tsx` — Plan karşılaştırma kartları (Free/Developer/Business/Enterprise)
- `SubscriptionDetails.tsx` — Mevcut plan bilgisi, yenileme tarihi
- `InvoiceTable.tsx` — Fatura listesi (durum badge'leri)
- `UsageChart.tsx` — Kullanım grafiği
- `OverageSettings.tsx` — Aşım ayarları
- `InvoiceStatusBadge.tsx` — Fatura durum badge'i

**İşlevler:**
- Plan karşılaştırma (özellikler, fiyat, limitler)
- Plan yükseltme modal'ı
- Plan düşürme modal'ı
- Abonelik iptal modal'ı
- Fatura listesi (sayfalı)
- Kullanım grafiği

**API:** `useBillingInvoices()`, `billingApiExtended`
**Durum:** ✅ Çalışıyor

---

### 3.11 Account (`/account`)

**Dosya:** `app/[locale]/(dashboard)/account/page.tsx`
**Tür:** TabbedSection (4 sekme)
**Amaç:** Kullanıcı hesap yönetimi

#### Sekme 1: Settings
**Dosya:** `settings/page.tsx` (159 satır)
**Tür:** İç tab'lı layout (5 sekme)
**İşlevler:**
- **Profile** — İsim, email düzenleme (`ProfileSection.tsx`)
- **Security** — Şifre değiştirme, 2FA (TOTP + backup code) (`PasswordSection.tsx`, `TwoFactorSection.tsx`)
- **Notifications** — Bildirim tercihleri (`NotificationSection.tsx`)
- **Privacy** — Gizlilik onayları (`PrivacyConsentSection.tsx`)
- **Danger Zone** — Hesap silme (`DangerZoneSection.tsx`)

**Durum:** ✅ Çalışıyor (son oturumda tab'lı layout'a çevrildi)

#### Sekme 2: Notifications
**Dosya:** `notifications/page.tsx` (345 satır)
**İşlevler:**
- Bildirim listesi (sayfalı)
- Tür filtresi: all/webhook_failed/alert/system/billing
- Tür ikonları (renkli)
- Okundu/okunmadı durumu
- Toplu okundu işaretleme
- Bildirim silme
- Göreceli zaman ("2m ago", "3h ago")

**API:** `useNotifications()`, `useMarkNotificationAsRead()`, `useMarkAllNotificationsAsRead()`, `useDeleteNotification()`
**Durum:** ✅ Çalışıyor

#### Sekme 3: Portal Customize
**Dosya:** `portal-customize/page.tsx` (294 satır)
**Bileşenler:** `PortalPreview.tsx`, `EmbedCodePanel.tsx`
**İşlevler:**
- Portal config:
  - Primary color (renk seçici)
  - Logo URL
  - Company name
  - Font family seçimi
  - Dark mode toggle
  - Show events toggle
  - Show deliveries toggle
  - Allowed events listesi
- Canlı önizleme (iframe)
- Embed kodu paneli (kopyalama)
- Kaydetme

**API:** `usePortalConfig()`, `usePortalEmbedCode()`, `useUpdatePortalConfig()`
**Durum:** ✅ Çalışıyor

#### Sekme 4: Portal Manage
**Dosya:** `portal-manage/page.tsx`
**İşlevler:** Portal yönetim sayfası
**Durum:** ✅ Çalışıyor

---

## 4. Admin Panel

### Layout
**Dosya:** `app/[locale]/admin/layout.tsx` (238 satır)
**Özellikler:**
- Ayrı sidebar (9 bölüm)
- Admin auth guard (`is_admin` kontrolü)
- Unauthorized → "Access Denied" sayfası
- Bildirim sayısı badge'i
- WebSocket bağlantı durumu
- Skip to content link (erişilebilirlik)
- Mobile responsive

### 4.1 Overview (`/admin`)
**İşlevler:** Sistem istatistikleri, son aktivite
**Durum:** ✅ Mevcut

### 4.2 Users (`/admin/users`)
**Dosya:** `admin/users/page.tsx` + `admin/users/[id]/page.tsx`
**İşlevler:**
- Kullanıcı listesi (sayfalı, arama)
- Kullanıcı detayı (profesyonel bilgiler)
- Ban/unban
- Plan değiştirme
- Impersonate (kullanıcının yerine geçme)
- CSV export
- Email gönderimi
- Plan geçmişi
- Kullanıcı analitik

**Durum:** ✅ Mevcut

### 4.3 Revenue (`/admin/revenue`)
**İşlevler:** Gelir grafikleri, plan bazlı gelir, churn raporu
**Durum:** ✅ Mevcut

### 4.4 Feature Flags (`/admin/feature-flags`)
**İşlevler:** Feature flag CRUD (oluştur, oku, güncelle, sil)
**Durum:** ✅ Mevcut

### 4.5 System (`/admin/system`)
**İşlevler:** DB, Redis, API, queue sağlık durumu, test webhook console (15sn auto-refresh)
**Durum:** ✅ Mevcut

### 4.6 Settings (`/admin/settings`)
**İşlevler:** Platform ayarları
**Durum:** ✅ Mevcut

### 4.7 Activity Log (`/admin/activity`)
**İşlevler:** Admin audit log
**Durum:** ✅ Mevcut

### 4.8 Alerts (`/admin/alerts`)
**İşlevler:** Admin alarmları (API'de CRUD var)
**Durum:** ✅ Mevcut (ayrı sayfa var)

### 4.9 Email (`/admin/email`)
**İşlevler:** Email yönetimi
**Durum:** ✅ Mevcut

---

## 5. Public Sayfalar

### Auth Sayfaları
| Sayfa | Dosya | İşlev |
|-------|-------|-------|
| Login | `login/page.tsx` | Email + şifre girişi, 2FA desteği |
| Register | `register/page.tsx` | Kayıt formu |
| Forgot Password | `forgot-password/page.tsx` | Şifre sıfırlama isteği |
| Reset Password | `reset-password/page.tsx` | Yeni şifre belirleme |
| Verify Email | `verify-email/page.tsx` | Email doğrulama |
| Auth Callback | `auth/callback/page.tsx` | OAuth callback |

### Marketing Sayfaları
| Sayfa | Dosya | İşlev |
|-------|-------|-------|
| Get Started | `get-started/page.tsx` | Başlangıç sayfası |
| Pricing | `pricing/page.tsx` | Fiyatlandırma |
| About | `about/page.tsx` | Hakkında |
| Contact | `contact/page.tsx` | İletişim formu |
| Blog | `blog/[slug]/page.tsx` | Blog yazıları |
| Changelog | `changelog/[slug]/page.tsx` | Değişiklik günlüğü |
| FAQ | `faq/page.tsx` | SSS |
| Status | `status/page.tsx` | Sistem durumu |
| Security | `security/page.tsx` | Güvenlik politikası |
| Privacy | `privacy/page.tsx` | Gizlilik politikası |
| Terms | `terms/page.tsx` | Kullanım şartları |
| Newsletter | `newsletter/page.tsx` | Bülten aboneliği |

### SEO / Alternatives Sayfaları
| Sayfa | Dosya | İşlev |
|-------|-------|-------|
| What is a Webhook | `what-is-a-webhook/page.tsx` | SEO içerik |
| Build vs Buy | `build-vs-buy/page.tsx` | SEO içerik |
| Use Cases | `use-cases/page.tsx` | Kullanım senaryoları |
| Startups | `startups/page.tsx` | Startup'lar için |
| Compare | `compare/page.tsx` | Rakip karşılaştırma |
| Alternatives | `alternatives/*/page.tsx` | Svix, Hookdeck, Convoy, Hook0, vb. |
| Providers | `providers/*/page.tsx` | Stripe, GitHub, Shopify webhook rehberi |

### Dokümantasyon (30+ Sayfa)
**Layout:** `docs/layout.tsx` (299 satır — premium sidebar tasarımı)
**Sayfalar:**
- Quickstart, API Reference, Architecture, Best Practices
- Security, Rate Limiting, Retries, Delivery Guarantees
- Event Types, Event Processing, CloudEvents
- Inbound Webhooks, Smart Routing, Transforms
- Idempotency, DLQ, Error Handling, Error Codes
- SDK Libraries, Playground, Templates
- Multi-tenant, Organization, Embed Portal
- Self-hosting (AWS, Kubernetes, Bare Metal)
- Monitoring, Troubleshooting, Migration from Svix
- Changelog, Support, What is HookSniff

---

## 6. Paylaşılan Bileşenler

### UI Bileşenleri (`components/`)
| Bileşen | Dosya | İşlev |
|---------|-------|-------|
| AuthGuard | `AuthGuard.tsx` | Auth kontrolü (login yoksa redirect) |
| CodeBlock | `CodeBlock.tsx` | Kod bloğu gösterimi (syntax highlight) |
| ConfirmDialog | `ConfirmDialog.tsx` | Onay dialogu (silme, iptal vb.) |
| CookieConsent | `CookieConsent.tsx` | Cookie onay banner'ı |
| DashboardWidget | `DashboardWidget.tsx` | Dashboard widget sistemi (drag-drop) |
| EmailVerificationBanner | `EmailVerificationBanner.tsx` | Email doğrulama uyarısı |
| EmptyState | `EmptyState.tsx` | Boş durum bileşeni |
| ErrorBoundary | `ErrorBoundary.tsx` | Hata yakalama |
| Footer | `Footer.tsx` | Footer bileşeni |
| LanguageSwitcher | `LanguageSwitcher.tsx` | Dil seçici (EN/TR) |
| LazyCharts | `LazyCharts.tsx` | Lazy-loaded Recharts bileşenleri |
| LazySection | `LazySection.tsx` | Lazy-loaded section + skeleton |
| LoadingSpinner | `LoadingSpinner.tsx` | Yükleme spinner'ı |
| NotificationCenter | `NotificationCenter.tsx` | Bildirim merkezi (header'da) |
| Onboarding | `Onboarding.tsx` | İlk giriş rehberi |
| OnboardingWizard | `OnboardingWizard.tsx` | Kurulum sihirbazı |
| PrefetchLink | `PrefetchLink.tsx` | Prefetch'li link (performans) |
| PublicNavbar | `PublicNavbar.tsx` | Public sayfa navbar'ı |
| SdkTabs | `SdkTabs.tsx` | SDK dil seçici tab'ları |
| StatusBadge | `StatusBadge.tsx` | Durum badge'i (delivered/failed/pending) |
| TabbedSection | `TabbedSection.tsx` | Tab'lı section bileşeni |
| ThemeProvider | `ThemeProvider.tsx` | Tema sağlayıcı (dark/light) |
| ThemeToggle | `ThemeToggle.tsx` | Tema geçiş butonu |
| Toast | `Toast.tsx` | Bildirim toast'ı |
| VirtualTable | `VirtualTable.tsx` | Sanal tablo (büyük veri için) |

### Tremor Bileşenleri (`components/tremor/`)
| Bileşen | İşlev |
|---------|-------|
| StatCard | İstatistik kartı (ikon, değer, trend) |
| ChartCard | Grafik kartı (başlık, çocuk) |
| StatusBadge | Durum badge'i |

### Onboarding Bileşenleri (`components/onboarding/`)
| Bileşen | İşlev |
|---------|-------|
| Confetti | Konfeti animasyonu |
| SetupChecklist | Kurulum kontrol listesi |
| SuccessToast | Başarı toast'ı |

---

## 7. Veri Akışı & API Entegrasyonu

### API İstemcisi (`lib/api.ts`)
Tüm API çağrıları bu dosyada tanımlı. Ana fonksiyonlar:
- `apiFetch()` — Genel fetch fonksiyonu (token, error handling)
- `applicationsApi` — Uygulama CRUD
- `endpointsApi` — Endpoint CRUD + routing + retry
- `webhooksApi` — Webhook gönderimi + teslimatlar
- `integrationsApi` — Entegrasyon CRUD
- `connectorsApi` — Connector CRUD
- `streamApi` — Streaming CRUD
- `billingApiExtended` — Faturalandırma
- `adminApi` — Admin endpoint'leri
- `ssoApi` — SSO config
- `environmentsApi` — Ortam yönetimi
- `backgroundTasksApi` — Arka plan görevleri
- `messagePollerApi` — Mesaj polling

### React Query Hooks (`hooks/useDashboardData.ts`)
Tüm veri çekme React Query ile yönetilir:
- `useDashboardStats()`, `useDeliveryTrend()`, `useSuccessRate()`, `useLatencyTrend()`
- `useEndpoints()`, `useApplications()`, `useWebhooks()`
- `useAlerts()`, `useCreateAlert()`, `useUpdateAlert()`, `useDeleteAlert()`
- `useTeams()`, `useTeamMembers()`, `useAuditLogs()`
- `useBillingInvoices()`, `useApiKeys()`, `useServiceTokens()`
- `useNotifications()`, `useEndpointHealth()`
- `useRateLimits()`, `useTransformRules()`, `useInboundConfigs()`
- ... (40+ hook)

### State Yönetimi (`lib/store.tsx`)
Zustand store:
- `user` — Kullanıcı bilgileri (name, email, plan, is_admin)
- `token` — JWT token
- `login()`, `logout()` — Auth aksiyonları
- `theme` — Tema tercihi (dark/light)

---

## 8. Durum & Eksikler

### ✅ Çalışan Sayfalar (50+)
Tüm dashboard sayfaları aktif ve çalışıyor. Son oturumlarda kapsamlı iyileştirmeler yapıldı:
- 2FA fix
- Custom domain 14 sorun düzeltildi
- Signature verifier 8 sorun düzeltildi
- Dokümantasyon Türkçe çeviri (300+ key)
- Endpoint limits kaldırıldı
- SSO organizasyona taşındı
- Settings tab'lı layout
- Documentation premium redesign
- Organization kapsamlı denetim

### ⚠️ Bilinen Eksikler

| Kategori | Eksik | Öncelik |
|----------|-------|---------|
| Admin | Müşteri webhook'larını görme | Yüksek |
| Admin | Global failed deliveries | Yüksek |
| Admin | Dead letters izleme | Yüksek |
| Admin | Fatura görüntüleme (invoices tablosu boş) | Orta |
| Admin | Refund (Polar.sh entegrasyonu) | Orta |
| Admin | Müşteri notları + etiketleri | Orta |
| Admin | GDPR tools | Düşük |
| Dashboard | SSO state in-memory (Redis'e taşınmalı) | Orta |
| Dashboard | OIDC JWKS imza doğrulaması | Düşük |
| Dashboard | SAML Single Logout (SLO) | Düşük |
| Dashboard | TXT record domain doğrulama | Düşük |
| Genel | `%5 frontend i18n eksik` | Düşük |
| Genel | P2 kalan 21 sorun | Düşük |

### 📊 İstatistikler

| Metrik | Değer |
|--------|-------|
| Toplam dashboard sayfası | 50+ |
| Admin sayfaları | 9 |
| Public sayfalar | 20+ |
| Docs sayfaları | 30+ |
| Paylaşılan bileşen | 30+ |
| React Query hook | 40+ |
| i18n key (EN) | 1000+ |
| i18n key (TR) | 1000+ |
| SDK sayısı | 11 |
| DB migration | 64 |
| Çözülen sorun | 75/103 |
| Kalan sorun | 28 (P2+P3) |

---

## 📝 Son Güncelleme

Bu rapor 2026-05-20 tarihinde `.ai-context/` dosyaları ve kaynak kod incelenerek hazırlanmıştır.
