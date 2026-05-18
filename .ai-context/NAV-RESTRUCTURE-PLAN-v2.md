# Dashboard Restructure Plan — Temiz Yapı

> Tarih: 2026-05-19 02:36 GMT+8
> Durum: Planlama aşaması

---

## 📊 Mevcut Sorunlar

### 1. Duplikasyon (10 gereksiz sayfa)
```
billing + billing-overview + billing-section  → 3 sayfa (tek olmalı)
team + team-mgmt                              → 2 sayfa (tek olmalı)
settings + settings-section                   → 2 sayfa (tek olmalı)
routing + routing-config                      → 2 sayfa (tek olmalı)
portal-customize + portal-manage + portal-section → 3 sayfa (tek olmalı)
sandbox + sandbox/playground                  → 2 sayfa (tek olmalı)
```

### 2. Sidebar'da Olmayan Sayfalar (kullanıcı ulaşamıyor)
```
/api-keys          — nerede?
/search            — nerede?
/logs              — nerede?
/alerts            — nerede?
/analytics         — nerede?
/health            — nerede?
/rate-limiting     — nerede?
/audit-log         — nerede?
/sso               — nerede?
/routing           — nerede?
/retry-policy      — nerede?
/custom-domain     — nerede?
/portal-*          — nerede?
/team              — nerede?
/service-tokens    — nerede?
/notifications     — nerede?
/signature-verifier — nerede?
/webhook-builder   — nerede?
/api-importer      — nerede?
/templates         — nerede?
/schemas           — nerede?
/transforms        — nerede?
/streaming         — sidebar'da ama monitoring altında kaybolmuş
```

### 3. Monitoring Section Çok Kalabalık (9 item)
```
Observability, Operational Webhooks, Message Poller, Inbound, 
Connectors, Integrations, Streaming, Security Section, Routing Config
```
→ Bunlar farklı kategoriler, tek section'da karışmış

---

## 🎯 Yeni Yapı — 10 Section, Temiz Hiyerarşi

```
┌─────────────────────────────────────────────────┐
│  🪝 HookSniff                                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  📊 Overview          → /dashboard (ana sayfa)   │
│                                                  │
│  ── CORE ────────────────────────────────────── │
│  🔗 Endpoints         → /endpoints              │
│  📱 Applications      → /applications           │
│  🔑 API Keys          → /api-keys               │
│                                                  │
│  ── DELIVERIES ───────────────────────────────── │
│  📨 Deliveries        → /deliveries              │
│  🔍 Search            → /search                  │
│  📋 Logs              → /logs                    │
│                                                  │
│  ── SCHEMA & CONTENT ─────────────────────────── │
│  📐 Schemas           → /schemas (tab)           │
│  📄 Templates         → /templates (tab)         │
│  🔄 Transforms        → /transforms (tab)        │
│  📥 Inbound           → /inbound (tab)           │
│                                                  │
│  ── DEVTOOLS ─────────────────────────────────── │
│  🧪 Playground        → /playground (tab)        │
│  🔐 Signature Tool    → /signature-verifier (tab)│
│  📥 API Importer      → /api-importer (tab)      │
│  🔧 Webhook Builder   → /webhook-builder (tab)   │
│                                                  │
│  ── OBSERVABILITY ────────────────────────────── │
│  💓 Health            → /health (tab)            │
│  🔔 Alerts            → /alerts (tab)            │
│  📈 Analytics         → /analytics (tab)         │
│                                                  │
│  ── SECURITY ─────────────────────────────────── │
│  ⏱️ Rate Limiting     → /rate-limiting (tab)     │
│  📜 Audit Log         → /audit-log (tab)         │
│  🔒 SSO               → /sso (tab)              │
│                                                  │
│  ── ROUTING ──────────────────────────────────── │
│  🔀 Routing Rules     → /routing (tab)           │
│  🔄 Retry Policy      → /retry-policy (tab)      │
│  🌐 Custom Domain     → /custom-domain (tab)     │
│                                                  │
│  ── INTEGRATIONS ─────────────────────────────── │
│  🪝 Op. Webhooks      → /operational-webhooks    │
│  📬 Message Poller    → /message-poller           │
│  🔌 Connectors        → /connectors              │
│  🔗 Integrations      → /integrations            │
│  📡 Streaming         → /streaming               │
│                                                  │
│  ── PORTAL ───────────────────────────────────── │
│  🎨 Customize         → /portal (tab: customize) │
│  🖼️ Manage            → /portal (tab: manage)    │
│                                                  │
│  ── ACCOUNT ──────────────────────────────────── │
│  👥 Team              → /team (tab)              │
│  🔑 Service Tokens    → /service-tokens (tab)    │
│  🔔 Notifications     → /notifications (tab)     │
│  ⚙️ Settings          → /settings (tab)          │
│                                                  │
│  ── BILLING ──────────────────────────────────── │
│  💳 Billing           → /billing (tek sayfa)     │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📋 Section Detayları

### 📊 Overview — `/dashboard`
- Genel istatistikler (toplam endpoint, mesaj, success rate)
- Son aktivite
- Hızlı erişim butonları

### 🔗 CORE — 3 sayfa
| Sayfa | URL | İçerik |
|-------|-----|--------|
| Endpoints | `/endpoints` | Endpoint listesi, CRUD |
| Applications | `/applications` | Uygulama grupları |
| API Keys | `/api-keys` | API key yönetimi |

### 📨 DELIVERIES — 3 sayfa
| Sayfa | URL | İçerik |
|-------|-----|--------|
| Deliveries | `/deliveries` | Mesaj teslim geçmişi |
| Search | `/search` | Webhook arama |
| Logs | `/logs` | Tüm delivery logları |

### 📐 SCHEMA & CONTENT — 4 tab (tek sayfa: `/content`)
| Tab | Component | İçerik |
|-----|-----------|--------|
| Schemas | `<SchemasPage />` | Event şemaları |
| Templates | `<TemplatesPage />` | Webhook şablonları |
| Transforms | `<TransformsPage />` | Payload dönüşümleri |
| Inbound | `<InboundPage />` | Gelen webhook'lar |

### 🛠️ DEVTOOLS — 4 tab (tek sayfa: `/devtools`)
| Tab | Component | İçerik |
|-----|-----------|--------|
| Playground | `<PlaygroundPage />` | Test webhook gönderme |
| Signature Tool | `<SignatureVerifierPage />` | HMAC imza doğrulama |
| API Importer | `<ApiImporterPage />` | API import |
| Webhook Builder | `<WebhookBuilderPage />` | Görsel webhook oluşturucu |

### 📡 OBSERVABILITY — 3 tab (tek sayfa: `/observability`)
| Tab | Component | İçerik |
|-----|-----------|--------|
| Health | `<HealthPage />` | Servis sağlık durumu |
| Alerts | `<AlertsPage />` | Uyarılar |
| Analytics | `<AnalyticsPage />` | Grafikler, istatistikler |

### 🔒 SECURITY — 3 tab (tek sayfa: `/security`)
| Tab | Component | İçerik |
|-----|-----------|--------|
| Rate Limiting | `<RateLimitingPage />` | Hız sınırı ayarları |
| Audit Log | `<AuditLogPage />` | Denetim günlüğü |
| SSO | `<SsoPage />` | Tek oturum açma |

### 🔀 ROUTING — 3 tab (tek sayfa: `/routing`)
| Tab | Component | İçerik |
|-----|-----------|--------|
| Routing Rules | `<RoutingPage />` | Webhook yönlendirme |
| Retry Policy | `<RetryPolicyPage />` | Yeniden deneme politikası |
| Custom Domain | `<CustomDomainPage />` | Özel domain ayarları |

### 🔗 INTEGRATIONS — 5 sayfa
| Sayfa | URL | İçerik |
|-------|-----|--------|
| Op. Webhooks | `/operational-webhooks` | Operasyonel webhook'lar |
| Message Poller | `/message-poller` | Mesaj polling |
| Connectors | `/connectors` | Shopify, Stripe vb. |
| Integrations | `/integrations` | 3. parti entegrasyonlar |
| Streaming | `/streaming` | SSE/WebSocket |

### 🎨 PORTAL — 2 tab (tek sayfa: `/portal`)
| Tab | Component | İçerik |
|-----|-----------|--------|
| Customize | `<PortalCustomizePage />` | Portal görünüm özelleştirme |
| Manage | `<PortalManagePage />` | Portal yönetimi |

### 👥 ACCOUNT — 4 tab (tek sayfa: `/account`)
| Tab | Component | İçerik |
|-----|-----------|--------|
| Team | `<TeamPage />` | Üye yönetimi |
| Service Tokens | `<ServiceTokensPage />` | Token yönetimi |
| Notifications | `<NotificationsPage />` | Bildirim ayarları |
| Settings | `<SettingsPage />` | Genel ayarlar |

### 💳 BILLING — 1 sayfa (`/billing`)
- Plan yönetimi
- Ödeme geçmişi
- Kullanım istatistikleri

---

## 🔄 Birleştirme Planı

### Adım 1: Duplikasyonları Temizle
```
billing + billing-overview + billing-section  → /billing
team + team-mgmt                              → /account (Team tab)
settings + settings-section                   → /account (Settings tab)
routing + routing-config                      → /routing (tek sayfa)
portal-customize + portal-manage + portal-section → /portal (tek sayfa)
sandbox + sandbox/playground                  → /devtools (Playground tab)
```

### Adım 2: Tab Container'ları Oluştur
```
/content     → Schemas, Templates, Transforms, Inbound
/devtools    → Playground, Signature Tool, API Importer, Webhook Builder
/observability → Health, Alerts, Analytics
/security    → Rate Limiting, Audit Log, SSO
/routing     → Routing Rules, Retry Policy, Custom Domain
/portal      → Customize, Manage
/account     → Team, Service Tokens, Notifications, Settings
```

### Adım 3: Sidebar'ı Güncelle
Yeni `sections` array:
```typescript
const sections = [
  {
    key: 'core',
    label: 'Core',
    items: [
      { name: 'Endpoints', href: '/endpoints', icon: '🔗' },
      { name: 'Applications', href: '/applications', icon: '📱' },
      { name: 'API Keys', href: '/api-keys', icon: '🔑' },
    ],
  },
  {
    key: 'deliveries',
    label: 'Deliveries',
    items: [
      { name: 'Deliveries', href: '/deliveries', icon: '📨' },
      { name: 'Search', href: '/search', icon: '🔍' },
      { name: 'Logs', href: '/logs', icon: '📋' },
    ],
  },
  {
    key: 'content',
    label: 'Schema & Content',
    items: [
      { name: 'Content', href: '/content', icon: '📐' },
    ],
  },
  {
    key: 'devtools',
    label: 'DevTools',
    items: [
      { name: 'DevTools', href: '/devtools', icon: '🛠️' },
    ],
  },
  {
    key: 'observability',
    label: 'Observability',
    items: [
      { name: 'Observability', href: '/observability', icon: '📡' },
    ],
  },
  {
    key: 'security',
    label: 'Security',
    items: [
      { name: 'Security', href: '/security', icon: '🔒' },
    ],
  },
  {
    key: 'routing',
    label: 'Routing',
    items: [
      { name: 'Routing', href: '/routing', icon: '🔀' },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    items: [
      { name: 'Op. Webhooks', href: '/operational-webhooks', icon: '🪝' },
      { name: 'Message Poller', href: '/message-poller', icon: '📬' },
      { name: 'Connectors', href: '/connectors', icon: '🔌' },
      { name: 'Integrations', href: '/integrations', icon: '🔗' },
      { name: 'Streaming', href: '/streaming', icon: '📡' },
    ],
  },
  {
    key: 'portal',
    label: 'Portal',
    items: [
      { name: 'Portal', href: '/portal', icon: '🎨' },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    items: [
      { name: 'Account', href: '/account', icon: '👥' },
    ],
  },
  {
    key: 'billing',
    label: 'Billing',
    items: [
      { name: 'Billing', href: '/billing', icon: '💳' },
    ],
  },
];
```

### Adım 4: Eski URL'leri Redirect Et
`middleware.ts` veya `next.config.js`:
```
/billing-overview   → /billing
/billing-section    → /billing
/team-mgmt          → /account
/settings-section   → /account
/routing-config     → /routing
/portal-section     → /portal
/portal-customize   → /portal
/portal-manage      → /portal
/sandbox            → /devtools
/sandbox/playground → /devtools
/content-mgmt       → /content
/security-section   → /security
```

### Adım 5: i18n Key'leri Güncelle
Nav çevirileri yeni yapına uygun şekilde güncellenmeli.

---

## 📊 Özet

| | Eski | Yeni | Fark |
|--|------|------|------|
| Sidebar sections | 5 | 11 | +6 (daha organize) |
| Top-level sayfa | ~40 | ~15 | -25 (tab'lara taşındı) |
| Duplikasyon | 10 gereksiz | 0 | -10 |
| Erişilebilirlik | Birçok sayfa kayıp | Tüm sayfalar erişilebilir | ✅ |

---

## ⚠️ Notlar

- Mevcut component'ler **silinmeyecek** — tab container'lar bunları dynamic import ile çağıracak
- Eski URL'ler redirect edilecek (SEO + bookmark koruması)
- `applications/[id]` gibi detail sayfaları korunacak
- Admin panel ayrı kalacak (`/admin`)
- Public sayfalar (landing, docs, blog) etkilenmeyecek
