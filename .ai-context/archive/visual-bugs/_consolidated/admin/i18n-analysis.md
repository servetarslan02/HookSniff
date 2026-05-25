# i18n Analiz Raporu — HookSniff Admin Paneli

**Tarih:** 2026-05-10  
**Kapsam:** Admin paneli (6 sayfa + layout) + Dashboard sidebar + çeviri dosyaları karşılaştırması

---

## Kütüphane

- **Kullanılan:** `next-intl` (v3+ App Router)
- **Yapı:**
  ```
  dashboard/src/
  ├── i18n/
  │   ├── routing.ts        # 8 locale: en, tr, de, ja, pt-BR, es, fr, ko
  │   ├── navigation.ts     # createNavigation(routing)
  │   └── request.ts        # getRequestConfig → messages/${locale}.json
  ├── messages/
  │   ├── en.json  (1120 satır, 893 key) ← referans
  │   ├── tr.json  (1120 satır, 893 key) ← tam
  │   ├── de.json  (1029 satır, 804 key) ← 89 eksik
  │   ├── es.json  (1029 satır, 804 key) ← 89 eksik
  │   ├── fr.json  (1029 satır, 804 key) ← 89 eksik
  │   ├── ja.json  (1029 satır, 804 key) ← 89 eksik
  │   ├── ko.json  (1029 satır, 804 key) ← 89 eksik
  │   └── pt-BR.json(1029 satır, 804 key) ← 89 eksik
  └── middleware.ts          # createMiddleware(routing)
  ```

---

## 1. Eksik Key'ler — 6 Dil (de, es, fr, ja, ko, pt-BR)

EN ve TR tam (893 key). Diğer **6 dilde** aynı 89 key eksik:

### `getStarted.*` — 56 key eksik

| Key | EN Değeri |
|-----|-----------|
| `getStarted.title` | (Get Started sayfa başlığı) |
| `getStarted.subtitle` | (alt başlık) |
| `getStarted.heroBadge` | Hero badge |
| `getStarted.fiveMinSetup` | 5-minute setup |
| `getStarted.freeForever` | Free forever |
| `getStarted.noCreditCard` | No credit card |
| `getStarted.quickstart` | Quickstart |
| `getStarted.step1Title` – `step6Title` | Adım başlıkları |
| `getStarted.step1Desc` – `step6Desc` | Adım açıklamaları |
| `getStarted.createFreeAccount` | Create free account |
| `getStarted.goToDashboard` | Go to dashboard |
| `getStarted.openDashboard` | Open dashboard |
| `getStarted.install` / `installAndUse` | Install |
| `getStarted.viaDashboard` / `viaDashboardDesc` | Via dashboard |
| `getStarted.viaApi` / `viaApiDesc` | Via API |
| `getStarted.embedTitle` / `embedDesc` / `embedCode` | Embed |
| `getStarted.cliTitle` / `cliDesc` | CLI |
| `getStarted.eventTypesTitle` / `eventTypesDesc` | Event types |
| `getStarted.testWebhook` | Test webhook |
| `getStarted.tryPlayground` / `tryPlaygroundBtn` | Try playground |
| `getStarted.tipPlayground` | Tip |
| `getStarted.realtimeDashboard` / `realtimeDashboardDesc` | Realtime dashboard |
| `getStarted.alerts` / `alertsDesc` | Alerts |
| `getStarted.autoRetries` / `autoRetriesDesc` | Auto retries |
| `getStarted.customizeColors` | Customize colors |
| `getStarted.portalSettings` | Portal settings |
| `getStarted.elevenSdks` | 11 SDKs |
| `getStarted.manageKeys` | Manage keys |
| `getStarted.keepSecret` | Keep secret |
| `getStarted.signedInAs` | Signed in as |
| `getStarted.yourApiKey` | Your API key |
| `getStarted.viewDeliveries` | View deliveries |
| `getStarted.readyTitle` / `readyDesc` | Ready |
| `getStarted.show` / `hide` | Show / Hide |

### `onboarding.*` — 32 key eksik

| Key | EN Değeri |
|-----|-----------|
| `onboarding.welcomeTitle` | Welcome |
| `onboarding.welcomeWizardDesc` | Wizard description |
| `onboarding.whatBuilding` / `whatBuildingDesc` | What are you building |
| `onboarding.chooseSdk` / `chooseSdkDesc` | Choose SDK |
| `onboarding.createFirstEndpoint` / `createFirstEndpointDesc` | Create endpoint |
| `onboarding.endpointUrl` / `endpointUrlPlaceholder` | Endpoint URL |
| `onboarding.descriptionOptional` / `descPlaceholder` | Description |
| `onboarding.createEndpointBtn` | Create button |
| `onboarding.creating` | Creating... |
| `onboarding.sendTestWebhook` / `sendTestWebhookDesc` | Send test |
| `onboarding.testCommand` | Test command |
| `onboarding.iveSentTest` | I've sent test |
| `onboarding.installCommand` | Install command |
| `onboarding.noRealUrl` | No real URL |
| `onboarding.letsGo` | Let's go |
| `onboarding.successTitle` | Success |
| `onboarding.allSetTitle` / `allSetDesc` | All set |
| `onboarding.completed` | Completed |
| `onboarding.continue` | Continue |
| `onboarding.goToDashboardBtn` | Go to dashboard |
| `onboarding.usePlayground` | Use playground |
| `onboarding.setupProgress` | Setup progress |
| `onboarding.skipSetup` | Skip setup |
| `onboarding.dismissChecklist` | Dismiss checklist |

### `settings.*` — 1 key eksik

| Key | EN Değeri |
|-----|-----------|
| `settings.apiDesc` | API description |

**Etkilenen sayfalar:** Get Started, Onboarding Wizard, Settings (API sekmesi)

---

## 2. Hardcode String'ler — Admin Paneli

### 🔴 admin/layout.tsx — **11 hardcode string**

| Satır (yaklaşık) | String | Mevcut Key | Öneri |
|---|---|---|---|
| ~50 | `"Access Denied"` | ❌ yok | `admin.accessDenied` ekle |
| ~51 | `"You don't have admin privileges."` | ❌ yok | `admin.noPrivileges` ekle |
| ~55 | `"Back to Dashboard"` | `common.back` + `nav.dashboard` | `t('back') + ' ' + t('dashboard')` |
| ~67 | `"Admin Panel"` (sidebar başlık) | ❌ yok | `admin.panelTitle` ekle |
| ~68 | `"HookSniff Management"` | ❌ yok | `admin.management` ekle |
| ~70-80 | Navigation: `"Overview"`, `"Users"`, `"Revenue"`, `"System"`, `"Settings"` | `admin.overview`, `admin.userManagement` vb. var | Kullanılmıyor! |
| ~95 | `"Back to Dashboard"` (sidebar alt) | `nav.dashboard` | Kullanılmıyor |
| ~107 | `"Admin"` (top bar badge) | ❌ yok | `admin.badge` ekle |
| ~110 | `"Admin"` (h1 fallback) | `admin.overview` | Fallback olarak kullanılabilir |
| ~115 | `"Admin"` (email fallback) | — | Kabul edilebilir |
| ~120 | `"Logout"` | `nav.logout` | Kullanılmıyor! |

### 🔴 admin/page.tsx — **3 hardcode string** (key mevcut ama kullanılmıyor!)

| Satır | String | Mevcut Key | Durum |
|---|---|---|---|
| ~82 | `"Admin Overview"` | `admin.overview` ✅ | **Kullanılmıyor!** Loading'de `t('overview')` var ama normal render'da hardcode |
| ~83-84 | `"Platform-wide metrics and recent activity"` | `admin.overviewDesc` ✅ | **Kullanılmıyor!** |
| ~153 | `"No recent signups"` | `admin.noSignups` ✅ | **Kullanılmıyor!** |

### 🔴 admin/users/page.tsx — **~20 hardcode string**

| Satır (yaklaşık) | String | Mevcut Key | Durum |
|---|---|---|---|
| ~85 | `"Manage users, plans, and account status"` | `admin.userManagementDesc` ✅ | **Kullanılmıyor!** |
| ~119 | `"Loading users..."` | `admin.loadingUsers` ✅ | **Kullanılmıyor!** |
| ~122 | `"No users found."` | `admin.noUsers` ✅ | **Kullanılmıyor!** |
| ~128 | `"ID"` (table header) | `common.id` ✅ | Kullanılmıyor |
| ~129 | `"Email"` | `common.email` ✅ | Kullanılmıyor |
| ~130 | `"Name"` | `common.name` ✅ | Kullanılmıyor |
| ~131 | `"Plan"` | `common.plan` ✅ | Kullanılmıyor |
| ~132 | `"Status"` | `common.status` ✅ | Kullanılmıyor |
| ~133 | `"Created"` | `common.created` ✅ | Kullanılmıyor |
| ~134 | `"Actions"` | `common.actions` ✅ | Kullanılmıyor |
| ~145 | `"View"` (buton) | `common.view` ✅ | Kullanılmıyor |
| ~150 | `"Plan"` (buton) | `common.plan` ✅ | Kullanılmıyor |
| ~156 | `"Ban"` / `"Activate"` | ❌ yok | `admin.ban` / `admin.activate` ekle |
| ~169 | `"Showing X–Y of Z"` | `common.showing` ✅ | Kullanılmıyor |
| ~176 | `"Previous"` | `common.previous` ✅ | Kullanılmıyor |
| ~180 | `"Page X of Y"` | `common.pageOf` ✅ | Kullanılmıyor |
| ~186 | `"Next"` | `common.next` ✅ | Kullanılmıyor |
| ~197 | `"Change Plan"` (modal) | `admin.changePlan` ✅ | **Kullanılmıyor!** |
| ~199 | `"Change plan for {email}"` | `admin.changePlanFor` ✅ | **Kullanılmıyor!** |
| ~211 | `"Cancel"` | `common.cancel` ✅ | Kullanılmıyor |
| ~218 | `"Update Plan"` | `admin.updatePlan` ✅ | **Kullanılmıyor!** |
| ~83 | Toast: `"Plan updated to ${newPlan}"` | `admin.planUpdated` ✅ | Kullanılmıyor |
| ~97 | Toast: `"User banned/activated"` | `admin.userBanned` / `admin.userActivated` ✅ | Kullanılmıyor |

### 🔴 admin/users/[id]/page.tsx — **~25 hardcode string** (hiç i18n yok!)

Bu dosyada **`useTranslations` hiç import edilmemiş**. Tüm stringler hardcode:

| String | Önerilen Key |
|---|---|
| `"Failed to load user details"` | `admin.failedLoadUser` |
| `"Failed to update plan"` | `admin.failedUpdatePlan` |
| `"Failed to update status"` | `admin.failedUpdateStatus` |
| `"User Not Found"` | `admin.userNotFound` |
| `"← Back to Users"` | `admin.backToUsers` |
| `"User Detail"` | `admin.userDetail` |
| `"User Info"` | `admin.userInfo` |
| `"Management"` | `admin.management` |
| `"Endpoints"` | `admin.endpointsList` |
| `"Recent Deliveries"` | `admin.recentDeliveries` |
| `"ID"`, `"Email"`, `"Name"`, `"Status"`, `"Created"` | `common.*` (mevcut) |
| `"Plan"` | `common.plan` |
| `"Account Status"` | `admin.accountStatus` |
| `"Update"` (buton) | `common.update` |
| `"Ban User"` / `"Activate User"` | `admin.banUser` / `admin.activateUser` |
| `"Usage Stats"` | `admin.usageStats` |
| `"Total Deliveries"` | `admin.totalDeliveries` |
| `"Success Rate"` | `admin.successRate` |
| `"Endpoints"` (usage) | `admin.endpointCount` |
| `"Active"` / `"Inactive"` | `admin.activeEp` / `admin.inactiveEp` |
| `"No endpoints"` | `admin.noEndpoints` |
| `"No deliveries"` | `admin.noDeliveries` |
| `"ID"`, `"Event"`, `"Status"`, `"Attempts"`, `"Time"` (table) | `common.*` (mevcut) |
| Toast: `"Plan updated to ${newPlan}"` | `admin.planUpdated` |
| Toast: `"User banned/activated"` | `admin.userBanned` / `admin.userActivated` |

### 🔴 admin/revenue/page.tsx — **3 hardcode string** (key mevcut ama kullanılmıyor!)

| Satır | String | Mevcut Key | Durum |
|---|---|---|---|
| ~62 | `"Revenue Dashboard"` | `admin.revenue` ✅ | **Kullanılmıyor!** |
| ~63-64 | `"Financial metrics and revenue breakdown"` | `admin.revenueDesc` ✅ | **Kullanılmıyor!** |
| ~107 | `"Revenue"` (chart tooltip) | — | `admin.revenueLabel` ekle |
| ~147 | `"(X users)"` | `admin.users` ✅ | **Kullanılmıyor!** |

### 🔴 admin/system/page.tsx — **~15 hardcode string**

| Satır (yaklaşık) | String | Mevcut Key | Durum |
|---|---|---|---|
| ~93 | `"Monitor infrastructure services and system status"` | `admin.systemHealthDesc` ✅ | **Kullanılmıyor!** |
| ~103 | `"Last checked: {time} · Auto-refresh every 15s"` | `admin.lastChecked` + `admin.autoRefresh15s` ✅ | **Kullanılmıyor!** Parçalı hardcode |
| ~128 | `"API Server"` (service) | `admin.apiServer` ✅ | **Kullanılmıyor!** |
| ~134 | `"PostgreSQL Database"` | `admin.database` ✅ (kısmen) | Hardcode |
| ~140 | `"Redis Cache"` | `admin.cache` ✅ (kısmen) | Hardcode |
| ~146 | `"Webhook Queue"` | ❌ yok | `admin.webhookQueue` ekle |
| ~128-149 | `"Uptime:"`, `"Latency:"`, `"Checking..."` | ❌ yok | `admin.uptime`, `admin.latency`, `admin.checking` ekle |
| ~128-149 | `"pending"`, `"processing"`, `"failed"` | ❌ yok | `admin.pending`, `admin.processing`, `admin.failed` ekle |
| ~180-190 | Infrastructure: `"Oracle Cloud ARM"`, `"Neon PostgreSQL"`, `"Upstash Redis"`, `"Cloudflare"`, `"Vercel"`, `"Grafana Cloud"` | ❌ yok | Bunlar sabit değerler (altyapı bilgisi), hardcode kabul edilebilir |
| ~180-190 | `"4 OCPU, 24 GB RAM"`, `"Serverless, 0.5 GB"`, vb. | ❌ yok | Aynı — sabit altyapı detayları |

### 🟡 admin/settings/page.tsx — **~10 hardcode string** (key mevcut ama kullanılmıyor!)

| Satır (yaklaşık) | String | Mevcut Key | Durum |
|---|---|---|---|
| ~74 | `"Configure platform-wide defaults and limits"` | `admin.platformSettingsDesc` ✅ | **Kullanılmıyor!** |
| ~95 | `"Default Plan"` (label) | `admin.defaultPlan` ✅ | **Kullanılmıyor!** |
| ~97 | `"Free"` / `"Pro"` (options) | `admin.freePlan` / `admin.proPlan` ✅ | **Kullanılmıyor!** |
| ~112 | `"Max Endpoints"` (label) | `admin.maxEndpoints` ✅ | **Kullanılmıyor!** |
| ~118 | `"Max Webhooks/Month"` | `admin.maxWebhooksMonth` ✅ | **Kullanılmıyor!** |
| ~124 | `"Rate Limit (req/min)"` | `admin.rateLimitReqMin` ✅ | **Kullanılmıyor!** |
| ~130 | `"Retention (days)"` | `admin.retentionDays` ✅ | **Kullanılmıyor!** |
| (Pro plan için aynı label'lar tekrar) | | | |
| ~167 | `"Max Retry Attempts"` | `admin.maxRetryAttempts` ✅ | **Kullanılmıyor!** |
| ~79 | Toast: `"Failed to save settings"` | ❌ yok | `admin.failedSaveSettings` ekle |

### 🟡 Dashboard layout.tsx — **~10 hardcode string** (sidebar navigasyonu)

| String | Mevcut Key | Durum |
|---|---|---|
| `"🚀 Get Started"` | `getStarted.title` ✅ | Hardcode (emoji prefix ile) |
| `"⚡ Rate Limiting"` | ❌ yok | `nav.rateLimiting` ekle |
| `"🔐 Signature Tool"` | ❌ yok | `nav.signatureTool` ekle |
| `"📥 API Importer"` | ❌ yok | `nav.apiImporter` ekle |
| `"🖼️ Portal Customize"` | ❌ yok | `nav.portalCustomize` ekle |
| `"🔧 Webhook Builder"` | ❌ yok | `nav.webhookBuilder` ekle |
| `"📋 Audit Log"` | ❌ yok | `nav.auditLog` ekle |
| `"🔐 SSO / SAML"` | ❌ yok | `nav.sso` ekle |
| `"🔄 Retry Policy"` | ❌ yok | `nav.retryPolicy` ekle |
| `"🌐 Custom Domain"` | ❌ yok | `nav.customDomain` ekle |
| `"HookSniff"` / `"Webhook Dashboard"` | — | Marka adı, hardcode kabul edilebilir |
| `"User"` (email fallback) | — | Kabul edilebilir |

---

## 3. Özet İstatistikler

| Metrik | Değer |
|--------|-------|
| Toplam çeviri key (EN) | 893 |
| TR coverage | **100%** (893/893) |
| DE/ES/FR/JA/KO/PT-BR coverage | **90.0%** (804/893) |
| Eksik key (dil başına) | **89** |
| Admin component sayısı | 6 sayfa + 1 layout |
| `useTranslations` kullanmayan admin sayfası | **1** (`users/[id]/page.tsx`) |
| Hardcode string (admin paneli) | **~87** |
| Key mevcut ama kullanılmayan | **~35** |
| Yeni key oluşturulması gereken | **~52** |

---

## 4. Tutarlılık Sorunları

1. **Key var ama kullanılmıyor:** Admin sayfalarının çoğunda `t('overview')` gibi key'ler loading state'te kullanılıyor ama normal render'da hardcode string'ler var. Bu, i18n'in "yarım uygulanmış" olduğunu gösteriyor.

2. **`users/[id]/page.tsx` hiç i18n kullanmıyor:** Tek bir `useTranslations` import'u bile yok. Diğer admin sayfaları kısmen i18n kullanırken bu sayfa tamamen hardcode.

3. **Dashboard sidebar'da 10 hardcode navigasyon:** Sidebar'daki `t('dashboard')` gibi bazı item'lar i18n kullanırken, `"Rate Limiting"`, `"Signature Tool"` gibi yeni eklenen item'lar hardcode kalmış.

4. **6 dilde 89 key eksik:** `getStarted.*` ve `onboarding.*` key'leri sadece EN ve TR'de mevcut. Bu sayfalar diğer dillerde açıldığında key bulunamayacak.

5. **Toast mesajları hardcode:** `"Plan updated to ${newPlan}"`, `"User banned/activated"` gibi toast mesajları interpolation ile hardcode yazılırken, translation dosyasında `admin.planUpdated: "{plan} olarak güncellendi"` gibi key'ler mevcut ama kullanılmıyor.

6. **Table header'ları hardcode:** `"ID"`, `"Email"`, `"Name"`, `"Plan"`, `"Status"`, `"Created"`, `"Actions"` — `common.*` namespace'inde hepsi mevcut ama admin tablolarında kullanılmıyor.

---

## 5. Öneriler

### Yüksek Öncelik

1. **`users/[id]/page.tsx`'e i18n ekle:** `useTranslations('admin')` ve `useTranslations('common')` import edip tüm string'leri `t()` ve `tc()` ile değiştir.

2. **Mevcut key'leri kullan:** Admin sayfalarında zaten tanımlı olan `admin.overview`, `admin.overviewDesc`, `admin.noSignups`, `admin.userManagementDesc`, `admin.loadingUsers`, `admin.noUsers`, `admin.changePlan`, `admin.changePlanFor`, `admin.updatePlan`, `admin.planUpdated`, `admin.userBanned`, `admin.userActivated`, `admin.revenue`, `admin.revenueDesc`, `admin.users`, `admin.systemHealthDesc`, `admin.lastChecked`, `admin.autoRefresh15s`, `admin.apiServer`, `admin.database`, `admin.cache`, `admin.platformSettingsDesc`, `admin.defaultPlan`, `admin.freePlan`, `admin.proPlan`, `admin.maxEndpoints`, `admin.maxWebhooksMonth`, `admin.rateLimitReqMin`, `admin.retentionDays`, `admin.maxRetryAttempts` key'lerini ilgili yerlerde kullan.

3. **`common.*` key'lerini kullan:** Table header'ları ve butonlar için `common.id`, `common.email`, `common.name`, `common.plan`, `common.status`, `common.created`, `common.actions`, `common.view`, `common.cancel`, `common.update`, `common.previous`, `common.next`, `common.showing`, `common.pageOf` key'lerini kullan.

### Orta Öncelik

4. **Yeni key'ler oluştur (admin namespace):**
   - `admin.accessDenied`, `admin.noPrivileges`, `admin.panelTitle`, `admin.management`
   - `admin.ban`, `admin.activate`, `admin.banUser`, `admin.activateUser`
   - `admin.userDetail`, `admin.userInfo`, `admin.accountStatus`
   - `admin.backToUsers`, `admin.endpointsList`, `admin.recentDeliveries`
   - `admin.usageStats`, `admin.successRate`, `admin.endpointCount`
   - `admin.activeEp`, `admin.inactiveEp`, `admin.noEndpoints`, `admin.noDeliveries`
   - `admin.failedLoadUser`, `admin.failedUpdatePlan`, `admin.failedUpdateStatus`, `admin.failedSaveSettings`
   - `admin.userNotFound`, `admin.revenueLabel`
   - `admin.webhookQueue`, `admin.uptime`, `admin.latency`, `admin.checking`
   - `admin.pending`, `admin.processing`, `admin.failed`

5. **Yeni key'ler oluştur (nav namespace):**
   - `nav.rateLimiting`, `nav.signatureTool`, `nav.apiImporter`, `nav.portalCustomize`
   - `nav.webhookBuilder`, `nav.auditLog`, `nav.sso`, `nav.retryPolicy`, `nav.customDomain`

6. **Admin layout navigasyonunu i18n yap:** `adminNavigation` array'indeki `name` field'larını `t('overview')`, `t('userManagement')` vb. ile değiştir. Ancak bu client component'te olduğu için `useTranslations` zaten mevcut — sadece array'i render sırasında dinamik hale getir.

### Düşük Öncelik

7. **6 dile eksik 89 key'i ekle:** `getStarted.*` ve `onboarding.*` key'lerini de, es, fr, ja, ko, pt-BR dosyalarına çevir.

8. **Altyapı bilgileri:** System page'deki `"Oracle Cloud ARM"`, `"Neon PostgreSQL"` gibi değerler sabit altyapı detayları — hardcode kalabilir veya `admin.infra.*` key'leri oluşturulabilir.

9. **Emoji prefix'li navigasyon item'ları:** `"🚀 Get Started"` gibi emoji prefix'ler i18n'de sorun yaratmaz ama key'in value'suna emoji dahil edilmeli (örn. `nav.getStarted: "🚀 Başla"`).

---

## 6. Dosya Bazlı Özet

| Dosya | Hardcode | Key Mevcut Kullanılmıyor | Yeni Key Gerekli | i18n Import |
|-------|----------|--------------------------|------------------|-------------|
| `admin/layout.tsx` | 11 | 3 | 8 | ❌ `useTranslations` yok |
| `admin/page.tsx` | 3 | 3 | 0 | ✅ var |
| `admin/users/page.tsx` | ~20 | ~15 | 5 | ✅ var |
| `admin/users/[id]/page.tsx` | ~25 | 0 | ~20 | ❌ `useTranslations` yok |
| `admin/revenue/page.tsx` | 3 | 3 | 1 | ✅ var |
| `admin/system/page.tsx` | ~15 | 3 | ~10 | ✅ var |
| `admin/settings/page.tsx` | ~10 | ~8 | 1 | ✅ var |
| `dashboard/layout.tsx` | 10 | 0 | 10 | ✅ var (ama nav items hardcode) |
