# 🗂️ Navigation Restructure — Detaylı Uygulama Rehberi

> **Tarih:** 2026-05-15
> **Durum:** ✅ TAMAMLANDI — uygulandı (Oturum 167-168)
> **Tahmini süre:** 2 oturum (1'er saat)

---

## 📌 Bu Dosya Neyi Anlatıyor?

HookSniff dashboard'undaki sidebar menü yapısı ve sayfa düzeni yeniden organize ediliyor.
Bu dosyadaki adımları takip eden herhangi biri (AI veya insan) değişikliği uygulayabilir.

---

## 1. Mevcut Durum (Şu An Ne Var?)

### 1.1 Sidebar Yapısı (layout.tsx)

Dosya: `dashboard/src/app/[locale]/(dashboard)/layout.tsx`

```
Section: Core
  └─ 📊 Core → /core

Section: Monitoring
  └─ 📡 Observability → /observability
  └─ 🛠️ DevTools → /devtools
  └─ 📐 Content → /content-mgmt

Section: Configuration
  └─ 🖼️ Portal → /portal-section
  └─ 🔒 Security → /security-section
  └─ 🔀 Routing → /routing-config

Section: Account
  └─ 👥 Team → /team-mgmt
  └─ 💳 Billing → /billing-overview
  └─ ⚙️ Settings → /settings-section
```

### 1.2 Her Sayfanın İçindeki Tab'lar

Dosya yolu pattern'i: `dashboard/src/app/[locale]/(dashboard)/SAYFA_ADI/page.tsx`

**`/core` sayfası** — 4 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 📊 Dashboard | `<DashboardOverview />` | Genel bakış, grafikler, son webhook'lar |
| 🔗 Endpoints | `<EndpointsPage />` | Endpoint listesi, oluşturma, silme |
| 📦 Deliveries | `<DeliveriesPage />` | Webhook delivery geçmişi |
| 🔍 Search | `<SearchPage />` | Webhook arama |

**`/observability` sayfası** — 4 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 📋 Logs | `<LogsPage />` | Tüm delivery logları |
| 💓 Health | `<HealthPage />` | Servis sağlık durumu |
| 🔔 Alerts | `<AlertsPage />` | Uyarılar |
| 📈 Analytics | `<AnalyticsPage />` | Grafikler, istatistikler |

**`/devtools` sayfası** — 4 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 🧪 Playground | `<PlaygroundPage />` | Test webhook gönderme |
| 🔐 Signature Tool | `<SignatureVerifierPage />` | HMAC imza doğrulama |
| 📥 API Importer | `<ApiImporterPage />` | API import |
| 🔧 Webhook Builder | `<WebhookBuilderPage />` | Görsel webhook oluşturucu |

**`/content-mgmt` sayfası** — 4 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 🔄 Transforms | `<TransformsPage />` | Payload dönüşümleri |
| 📨 Inbound | `<InboundPage />` | Gelen webhook'lar |
| 📐 Schemas | `<SchemasPage />` | Event şemaları |
| 📄 Templates | `<TemplatesPage />` | Webhook şablonları |

**`/portal-section` sayfası** — 2 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 🎨 Customize | `<PortalCustomizePage />` | Portal görünüm özelleştirme |
| 🖼️ Portal | `<PortalManagePage />` | Portal yönetimi |

**`/security-section` sayfası** — 3 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| ⏱️ Rate Limiting | `<RateLimitingPage />` | Hız sınırı ayarları |
| 📜 Audit Log | `<AuditLogPage />` | Denetim günlüğü |
| 🔒 SSO | `<SsoPage />` | Tek oturum açma |

**`/routing-config` sayfası** — 3 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 🔁 Retry Policy | `<RetryPolicyPage />` | Yeniden deneme politikası |
| 🔀 Routing | `<RoutingPage />` | Webhook yönlendirme |
| 🌐 Custom Domain | `<CustomDomainPage />` | Özel domain ayarları |

**`/team-mgmt` sayfası** — 3 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 👥 Team | `<TeamPage />` | Takım üyeleri |
| 🔔 Notifications | `<NotificationsPage />` | Bildirim tercihleri |
| 📁 Applications | `<ApplicationsPage />` | Uygulama yönetimi |

**`/billing-overview` sayfası** — 2 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| 🔑 API Keys | `<ApiKeysPage />` | API anahtarları |
| 💳 Billing | `<BillingPage />` | Abonelik, fatura |

**`/settings-section` sayfası** — 2 tab:
| Tab | Component | Ne yapar |
|-----|-----------|----------|
| ⚙️ Settings | `<SettingsPage />` | Profil, şifre, 2FA, bildirim |
| 🎟️ Service Tokens | `<ServiceTokensPage />` | Servis token'ları |

---

## 2. Sorunlar Nerede?

| Sorun | Açıklama |
|-------|----------|
| **API Keys → Billing** | Müşteri API key almak için faturalandırma sayfasına gitmek zorunda. Halbuki API key = endpoint erişimi. |
| **Applications → Team** | Uygulama yönetimi takım işi değil. Uygulama = webhook endpoint'lerinin grubu. |
| **Service Tokens → Settings** | Geliştirici aracı (test, debug) ayarlar sayfasında kaybolmuş. |
| **Search → Core** | Core'da arama ne arıyor? Bu delivery araması. |
| **Logs → Observability** | Log = delivery geçmişi. Observability = sağlık + uyarı + analitik. Farklı şeyler. |
| **Portal → Configuration** | Portal tek başına bir section,.Configuration'da kayboluyor. |

---

## 3. Yeni Yapı (Hedef)

### 3.1 Yeni Sidebar

```
📊 Core
🔗 Deliveries
📐 Schema & Content
🛠️ DevTools
📡 Observability
🔒 Security
🔀 Routing
👥 Account
```

### 3.2 Her Section'ın İçeriği

**📊 Core** — "Webhook altyapınızı yönetin"
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Dashboard | `<DashboardOverview />` | Mevcut /core → Dashboard tab |
| Endpoints | `<EndpointsPage />` | Mevcut /core → Endpoints tab |
| Applications | `<ApplicationsPage />` | Mevcut /team-mgmt → Applications tab (TAŞINACAK) |
| API Keys | `<ApiKeysPage />` | Mevcut /billing-overview → API Keys tab (TAŞINACAK) |

**🔗 Deliveries** — "Webhook teslimatlarını takip edin"
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Webhook Logs | `<LogsPage />` | Mevcut /observability → Logs tab (TAŞINACAK) |
| Deliveries | `<DeliveriesPage />` | Mevcut /core → Deliveries tab (TAŞINACAK) |
| Search | `<SearchPage />` | Mevcut /core → Search tab (TAŞINACAK) |

**📐 Schema & Content** — "Event yapınızı tanımlayın" (DEĞİŞİKLİK YOK)
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Schemas | `<SchemasPage />` | Mevcut |
| Templates | `<TemplatesPage />` | Mevcut |
| Inbound | `<InboundPage />` | Mevcut |
| Transforms | `<TransformsPage />` | Mevcut |

**🛠️ DevTools** — "Webhook'larınızı test edin" (DEĞİŞİKLİK YOK)
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Playground | `<PlaygroundPage />` | Mevcut |
| Signature Tool | `<SignatureVerifierPage />` | Mevcut |
| Webhook Builder | `<WebhookBuilderPage />` | Mevcut |
| API Importer | `<ApiImporterPage />` | Mevcut |

**📡 Observability** — "Sisteminizi izleyin"
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Health | `<HealthPage />` | Mevcut |
| Alerts | `<AlertsPage />` | Mevcut |
| Analytics | `<AnalyticsPage />` | Mevcut |

**🔒 Security** — "Güvenliğinizi yapılandırın" (DEĞİŞİKLİK YOK)
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Rate Limiting | `<RateLimitingPage />` | Mevcut |
| Audit Log | `<AuditLogPage />` | Mevcut |
| SSO | `<SsoPage />` | Mevcut |

**🔀 Routing** — "Webhook yönlendirmenizi ayarlayın" (DEĞİŞİKLİK YOK)
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Retry Policy | `<RetryPolicyPage />` | Mevcut |
| Routing | `<RoutingPage />` | Mevcut |
| Custom Domain | `<CustomDomainPage />` | Mevcut |

**👥 Account** — "Hesabınızı yönetin"
| Tab | Component | Nereden geliyor |
|-----|-----------|-----------------|
| Team | `<TeamPage />` | Mevcut /team-mgmt → Team tab (TAŞINACAK) |
| Notifications | `<NotificationsPage />` | Mevcut /team-mgmt → Notifications tab (TAŞINACAK) |
| Billing | `<BillingPage />` | Mevcut /billing-overview → Billing tab (TAŞINACAK) |
| Settings | `<SettingsPage />` | Mevcut /settings-section → Settings tab (TAŞINACAK) |
| Portal | `<PortalManagePage />` | Mevcut /portal-section → Portal tab (TAŞINACAK) |

---

## 4. Adım Adım Uygulama

### ADIM 1: layout.tsx — Sidebar'ı yeniden tanımla ✅

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/layout.tsx`

**Ne yapılacak:** `sections` array'ini değiştir.

**Mevcut kod (satır ~44-77):**
```typescript
const sections = [
  {
    key: 'core',
    label: t('sectionCore'),
    items: [
      { name: t('core'), href: '/core', icon: '📊' },
    ],
  },
  {
    key: 'monitoring',
    label: t('sectionMonitoring'),
    items: [
      { name: t('observability'), href: '/observability', icon: '📡' },
      { name: t('devtools'), href: '/devtools', icon: '🛠️' },
      { name: t('contentMgmt'), href: '/content-mgmt', icon: '📐' },
    ],
  },
  {
    key: 'config',
    label: t('sectionConfig'),
    items: [
      { name: t('portalSection'), href: '/portal-section', icon: '🖼️' },
      { name: t('securitySection'), href: '/security-section', icon: '🔒' },
      { name: t('routingConfig'), href: '/routing-config', icon: '🔀' },
    ],
  },
  {
    key: 'account',
    label: t('sectionAccount'),
    items: [
      { name: t('teamMgmt'), href: '/team-mgmt', icon: '👥' },
      { name: t('billingOverview'), href: '/billing-overview', icon: '💳' },
      { name: t('settingsSection'), href: '/settings-section', icon: '⚙️' },
    ],
  },
];
```

**Yeni kod:**
```typescript
const sections = [
  {
    key: 'core',
    label: t('sectionCore'),
    items: [
      { name: t('core'), href: '/core', icon: '📊' },
      { name: t('deliveries'), href: '/deliveries', icon: '🔗' },
    ],
  },
  {
    key: 'content',
    label: t('sectionContent'),
    items: [
      { name: t('contentMgmt'), href: '/content-mgmt', icon: '📐' },
      { name: t('devtools'), href: '/devtools', icon: '🛠️' },
    ],
  },
  {
    key: 'monitoring',
    label: t('sectionMonitoring'),
    items: [
      { name: t('observability'), href: '/observability', icon: '📡' },
      { name: t('securitySection'), href: '/security-section', icon: '🔒' },
      { name: t('routingConfig'), href: '/routing-config', icon: '🔀' },
    ],
  },
  {
    key: 'account',
    label: t('sectionAccount'),
    items: [
      { name: t('account'), href: '/account', icon: '👥' },
    ],
  },
];
```

---

### ADIM 2: /core sayfasını güncelle — Applications ve API Keys ekle ✅

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/core/page.tsx`

**Ne yapılacak:**
1. `ApplicationsPage` ve `ApiKeysPage` component'lerini import et
2. tabs array'ine 2 yeni tab ekle

**Yeni import'lar:**
```typescript
import { ApplicationsPage } from '../team-mgmt/page';  // veya kendi dosyasından
import { ApiKeysPage } from '../billing-overview/page';  // veya kendi dosyasından
```

**Yeni tabs:**
```typescript
tabs={[
  { key: 'overview', label: t('dashboard'), icon: '📊', content: <DashboardOverview /> },
  { key: 'endpoints', label: t('endpoints'), icon: '🔗', content: <EndpointsPage /> },
  { key: 'applications', label: t('applications'), icon: '📁', content: <ApplicationsPage /> },
  { key: 'api-keys', label: t('apiKeys'), icon: '🔑', content: <ApiKeysPage /> },
]}
```

---

### ADIM 3: Yeni /deliveries sayfası oluştur ✅

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx` (YENİ DOSYA)

**Ne yapılacak:** Logs + Deliveries + Search tab'larını birleştiren yeni sayfa oluştur.

**Şablon (mevcut sayfalardan kopyalanacak):**
```tsx
'use client';
import { useTranslations } from 'next-intl';
import { TabbedSection } from '@/components/TabbedSection';
import { LogsPage } from '../observability/page';      // veya ayrı dosyadan
import { DeliveriesPage } from '../core/page';          // veya ayrı dosyadan
import { SearchPage } from '../core/page';              // veya ayrı dosyadan

export default function DeliveriesSectionPage() {
  const t = useTranslations('nav');
  return (
    <TabbedSection
      tabs={[
        { key: 'logs', label: t('logs', { defaultValue: 'Webhook Logs' }), icon: '📋', content: <LogsPage /> },
        { key: 'deliveries', label: t('deliveries', { defaultValue: 'Deliveries' }), icon: '📦', content: <DeliveriesPage /> },
        { key: 'search', label: t('search', { defaultValue: 'Search' }), icon: '🔍', content: <SearchPage /> },
      ]}
    />
  );
}
```

**NOT:** Component'ler ayrı dosyalarda export ediliyorsa import yolları ona göre ayarlanacak.
Eğer component'ler sayfa dosyasının içinde tanımlıysa, önce ayrı dosyalara çıkarılmaları gerekir.

---

### ADIM 4: /observability sayfasını güncelle — Logs tab'ını çıkar ✅

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/observability/page.tsx`

**Ne yapılacak:** Logs tab'ını tabs array'inden kaldır. Geriye 3 tab kalır.

**Yeni tabs:**
```typescript
tabs={[
  { key: 'health', label: t('health'), icon: '💓', content: <HealthPage /> },
  { key: 'alerts', label: t('alerts'), icon: '🔔', content: <AlertsPage /> },
  { key: 'analytics', label: t('analytics'), icon: '📈', content: <AnalyticsPage /> },
]}
```

---

### ADIM 5: Yeni /account sayfası oluştur ✅

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/account/page.tsx` (YENİ DOSYA)

**Ne yapılacak:** Team + Notifications + Billing + Settings + Portal tab'larını birleştir.

```tsx
'use client';
import { useTranslations } from 'next-intl';
import { TabbedSection } from '@/components/TabbedSection';
import { TeamPage } from '../team-mgmt/page';
import { NotificationsPage } from '../team-mgmt/page';
import { BillingPage } from '../billing-overview/page';
import { SettingsPage } from '../settings-section/page';
import { PortalManagePage } from '../portal-section/page';

export default function AccountPage() {
  const t = useTranslations('nav');
  return (
    <TabbedSection
      tabs={[
        { key: 'team', label: t('team', { defaultValue: 'Team' }), icon: '👥', content: <TeamPage /> },
        { key: 'notifications', label: t('notifications', { defaultValue: 'Notifications' }), icon: '🔔', content: <NotificationsPage /> },
        { key: 'billing', label: t('billing', { defaultValue: 'Billing' }), icon: '💳', content: <BillingPage /> },
        { key: 'settings', label: t('settings', { defaultValue: 'Settings' }), icon: '⚙️', content: <SettingsPage /> },
        { key: 'portal', label: t('portal', { defaultValue: 'Portal' }), icon: '🖼️', content: <PortalManagePage /> },
      ]}
    />
  );
}
```

---

### ADIM 6: Eski sayfaları redirect et ✅

**Dosya:** `dashboard/src/middleware.ts`

**Ne yapılacak:** `ROUTE_REDIRECTS` map'ine yeni redirect'ler ekle.

```typescript
const ROUTE_REDIRECTS: Record<string, string> = {
  // Mevcut redirect'ler (korunacak)
  '/endpoints': '/core',
  '/deliveries': '/core',
  '/search': '/core',
  '/logs': '/observability',
  '/health': '/observability',
  '/alerts': '/observability',
  '/analytics': '/observability',
  '/playground': '/devtools',
  '/signature-verifier': '/devtools',
  '/api-importer': '/devtools',
  '/webhook-builder': '/devtools',
  '/transforms': '/content-mgmt',
  '/inbound': '/content-mgmt',
  '/schemas': '/content-mgmt',
  '/templates': '/content-mgmt',
  '/rate-limiting': '/security-section',
  '/audit-log': '/security-section',
  '/sso': '/security-section',
  '/retry-policy': '/routing-config',
  '/routing': '/routing-config',
  '/custom-domain': '/routing-config',

  // YENİ redirect'ler
  '/team-mgmt': '/account',
  '/billing-overview': '/account',
  '/settings-section': '/account',
  '/portal-section': '/account',
  '/portal-customize': '/account',
  '/portal-manage': '/account',
  '/team': '/account',
  '/notifications': '/account',
  '/applications': '/core',
  '/api-keys': '/core',
  '/service-tokens': '/devtools',
};
```

---

### ADIM 7: i18n key'leri ekle ✅

**Dosyalar:**
- `dashboard/src/messages/en.json`
- `dashboard/src/messages/tr.json`

**Eklenecek key'ler (nav section):**

```json
{
  "nav": {
    "sectionCore": "Core",
    "sectionContent": "Content",
    "sectionMonitoring": "Monitoring",
    "sectionAccount": "Account",
    "deliveries": "Deliveries",
    "account": "Account"
  }
}
```

---

### ADIM 8: Eski dosyaları temizle (opsiyonel) ✅

Eğer component'ler ayrı dosyalarda export ediliyorsa, eski sayfa dosyaları silinebilir.
Eğer component'ler sayfa dosyasının içinde tanımlıysa, önce ayrı dosyalara çıkarılmalı.

**Dikkat:** Doğrudan silme! Önce component'leri taşı, sonra eski dosyaları sil.

---

## 5. Kontrol Listesi

- [x] layout.tsx → 8 section tanımlandı ✅
- [x] /core → Applications + API Keys tab eklendi ✅
- [x] /deliveries → Yeni sayfa oluşturuldu (Logs + Deliveries + Search) ✅
- [x] /observability → Logs tab çıkarıldı (3 tab kaldı) ✅
- [x] /account → Yeni sayfa oluşturuldu (Team + Notifications + Billing + Settings + Portal) ✅
- [x] middleware.ts → Eski URL'ler yeni sayfalara redirect ✅
- [x] en.json → Yeni nav key'leri eklendi ✅
- [x] tr.json → Türkçe çeviriler eklendi ✅
- [x] Local build test edildi (`npm run build`) ✅
- [x] GitHub'a push edildi ✅
- [x] Vercel deploy kontrol edildi ✅

---

## 6. Riskler ve Dikkat Edilecekler

| Risk | Çözüm |
|------|-------|
| Component'ler başka dosyalarda export edilmiyor olabilir | Önce export'ları kontrol et, gerekirse refactor et |
| Tab component'leri kendi state'lerini yönetiyor olabilir | State management'i bozmayacak şekilde taşı |
| Eski URL'ler bookmark'lanmış olabilir | Middleware redirect ile koru |
| i18n key'leri eksik olabilir | Build hatası alırsan eksik key'leri ekle |
| TabbedSection component'i farklı props bekliyor olabilir | Mevcut kullanımları incele, aynı pattern'i uygula |

---

## 7. Dosya Haritası

```
dashboard/src/
├── app/[locale]/(dashboard)/
│   ├── layout.tsx                    ← DEĞİŞECEK (sidebar)
│   ├── core/page.tsx                 ← DEĞİŞECEK (2 tab ekle)
│   ├── deliveries/page.tsx           ← YENİ DOSYA
│   ├── content-mgmt/page.tsx         ← DEĞİŞMEZ
│   ├── devtools/page.tsx             ← DEĞİŞMEZ
│   ├── observability/page.tsx        ← DEĞİŞECEK (1 tab çıkar)
│   ├── security-section/page.tsx     ← DEĞİŞMEZ
│   ├── routing-config/page.tsx       ← DEĞİŞMEZ
│   ├── account/page.tsx              ← YENİ DOSYA
│   ├── team-mgmt/page.tsx            ← ESKİ (redirect edilecek)
│   ├── billing-overview/page.tsx     ← ESKİ (redirect edilecek)
│   ├── settings-section/page.tsx     ← ESKİ (redirect edilecek)
│   └── portal-section/page.tsx       ← ESKİ (redirect edilecek)
├── middleware.ts                      ← DEĞİŞECEK (redirect'ler)
├── messages/
│   ├── en.json                       ← DEĞİŞECEK (yeni key'ler)
│   └── tr.json                       ← DEĞİŞECEK (yeni key'ler)
└── components/
    └── TabbedSection.tsx             ← DEĞİŞMEZ
```
