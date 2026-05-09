# i18n Dil Uyumsuzluk Raporu — Derinlemesine Analiz
**Tarih:** 2026-05-10
**Durum:** Tespit — henüz düzeltilmedi

---

## 1. Eksik Çeviri Anahtarı

`settings.apiDesc` anahtarı **6 dilde eksik** (sadece `en.json` ve `tr.json`'da var):

| Dil | Durum |
|------|-------|
| tr.json | ✅ Mevcut |
| de.json | ❌ Eksik |
| ja.json | ❌ Eksik |
| pt-BR.json | ❌ Eksik |
| es.json | ❌ Eksik |
| fr.json | ❌ Eksik |
| ko.json | ❌ Eksik |

---

## 2. Çevrilmemiş Değerler (en.json ile birebir aynı)

Toplam anahtar sayısı: **715**

| Dil | Çevrilmemiş | Oran | Not |
|------|-------------|------|-----|
| tr.json | 23 | %3.2 | Teknik terimler + footer linkleri (kasıtlı) |
| de.json | 431 | %60.3 | "Previous", "Name", "Retry", "Download", "View" gibi temel kelimeler çevrilmemiş |
| ja.json | ~410 | %57.3 | Aynı pattern |
| pt-BR.json | ~422 | %59.0 | Aynı pattern |
| es.json | ~420 | %58.7 | Aynı pattern |
| fr.json | ~418 | %58.5 | Aynı pattern |
| ko.json | ~410 | %57.3 | Aynı pattern |

**tr.json hariç tüm dillerde temel UI kelimeleri (Previous, Name, Retry, Refresh, Sending, Creating, Saving, Deleting, Download, View, Remove, Email, Event, Attempts, Time, Response, Payload, Headers) çevrilmemiş.**

### Kasıtlı Olarak Bırakılmış Terimler (tüm dillerde aynı)
- Teknik: `URL`, `API`, `SDK`, `CLI`, `HTTP`, `REST`, `JSON`, `CSV`, `DNS`, `SSL`, `TLS`, `WebSocket`, `CDN`, `Beta`
- Marka: `GitHub`, `HookSniff`, `Pro`, `Plan`, `Endpoint`, `Webhook`
- Footer link isimleri: `GitHub`, `Pricing`, `Use Cases`, `Compare`, `Customers`, `Security`, `Playground`, `Startups`, `Newsletter`, `Blog`

---

## 3. useTranslations KULLANAN Sayfalarda Bile Hardcoded Text

Bu sayfalar `useTranslations` kullanıyor ama içinde hâlâ İngilizce metin var:

### Dashboard Sayfaları
| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `dashboard/layout.tsx` | "HookSniff", "Webhook Dashboard" |
| `dashboard/inbound/page.tsx` | "How it works", "External Service", "Verify Signature", "Your Endpoint", "Add Inbound Provider" |
| `dashboard/playground/page.tsx` | "Request History" |
| `dashboard/endpoints/page.tsx` | "Description" |
| `dashboard/alerts/page.tsx` | "Name", "Condition", "Threshold", "Channels" |
| `dashboard/team/page.tsx` | "Team Name", "Email", "Role" |
| `dashboard/deliveries/page.tsx` | "Event", "Status", "Attempts", "Response", "Time" |
| `dashboard/search/page.tsx` | "Event", "Status", "Endpoint", "Attempts", "Time" |
| `dashboard/webhooks/new/page.tsx` | "Endpoint", "Event Type" |

### Diğer Sayfalar
| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `contact/page.tsx` | "Contact", "Contact Us", "Email", "Location", "Response Time" |
| `about/page.tsx` | "About", "About HookSniff", "Our Mission", "Our Story" |
| `docs/page.tsx` | "API Base URL", "Authentication", "Rate Limits", "Plan", "Free" |
| `docs/layout.tsx` | "HookSniff", "Docs" |
| `docs/api/page.tsx` | "Code", "Meaning", "Description", "Bad Request", "Invalid request body or parameters" |
| `docs/sdks/page.tsx` | "Python SDK", "Installation", "Quick Start" |
| `login/page.tsx` | "HookSniff" |
| `terms/page.tsx` | "You must provide accurate registration information", "You are responsible for maintaining the security...", vb. |
| `privacy/page.tsx` | "Email address", "Browser type and version", "Operating system", "Device information", "Cookies and session tokens" |
| `admin/page.tsx` | "Admin Overview" |
| `admin/users/page.tsx` | "Actions", "Created", "Email", "Name", "Plan", "Status" |
| `admin/users/[id]/page.tsx` | "Attempts", "Created", "Email", "Endpoints", "Event", "Management", "Name", "No endpoints", "Recent Deliveries", "Status", "Success Rate", "Time", "Total Deliveries", "User Detail", "User Info" |
| `admin/settings/page.tsx` | "Default Plan", "Free", "Max Endpoints", "Max Retry Attempts", "Pro" |
| `admin/revenue/page.tsx` | "Revenue Dashboard" |
| `page.tsx` (landing) | "HookSniff" (2 kez) |

---

## 4. Hiç Çeviri Kullanmayan Sayfalar (tamamen hardcoded İngilizce)

### Dashboard Sayfaları — Çeviri Key'leri Bile Yok
| Sayfa | Hardcoded Metin Sayısı | Not |
|-------|----------------------|-----|
| `dashboard/deliveries/[id]` | ~15 | "Delivery Details", "Back to deliveries", "Failed to load delivery", "Error", "Error Message", "Response Body", "No attempt data available", "Attempts will appear here once the delivery is processed" |
| `dashboard/endpoints/[id]` | ~10 | "API Requests", "Avg Response", "Current Secret", "Endpoint Settings", "Failure Streak", "Rate Limits", "Retry Policy", "Signing Secret" |
| `dashboard/routing` | ~0 (boş sayfa) | Key yok, sayfa boş |
| `dashboard/templates` | ~1 | "No templates available" |
| `dashboard/transforms` | ~10 | "Create", "Enrich", "Filter", "Map", "New Transform Rule", "Select Endpoint", "Enrich key", "Enrich value", "Map from", "Map to" |
| `dashboard/portal` | ~10 | "Profile", "Email", "Plan", "Endpoints", "Member since", "Usage", "API calls today", "Webhook limit", "Webhooks used" |
| `dashboard/schemas` | ~1 | "No schemas registered yet" |

### Pazarlama Sayfaları
| Sayfa | Hardcoded Metin Sayısı |
|-------|----------------------|
| `pricing/page.tsx` | ~12 | "Pricing", "Free", "Pro", "Business", "Feature", "Compare all features", "Frequently asked questions", "What users say", "Support levels", "Build vs Buy", "Hookdeck", "Svix" |
| `security/page.tsx` | ~10 | "Security", "Architecture security", "Certificate pinning on API", "Data at rest", "Data in transit", "HSTS with preload", "Neon PostgreSQL with encrypted volumes", "No HTTP fallback", "Upstash Redis with TLS", "View source code" |
| `startups/page.tsx` | Hardcoded |
| `what-is-a-webhook/page.tsx` | Hardcoded |
| `compare/page.tsx` + `CompareContent.tsx` | Hardcoded |
| `build-vs-buy/page.tsx` + `BuildVsBuyContent.tsx` | Hardcoded |
| `webhooks/page.tsx` | Hardcoded |
| `webhooks/guides/page.tsx` | Hardcoded |
| `webhooks/glossary/page.tsx` | Hardcoded |

### Providers Sayfaları
| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `providers/page.tsx` | "Providers", "Webhook Provider Guides" |
| `providers/github/page.tsx` | "GitHub", "GitHub Integration", "GitHub Webhooks Guide", "Providers", "Configure GitHub", "Create a HookSniff endpoint", "Select events", "Start receiving GitHub webhooks", "When It Fires", "Event" |
| `providers/shopify/page.tsx` | "Shopify", "Shopify Integration", "Shopify Webhooks Guide", "Providers", "Configure Shopify", "Create a HookSniff endpoint", "Start receiving Shopify webhooks", "Topic", "Verify HMAC", "When It Fires" |
| `providers/stripe/page.tsx` | "Stripe", "Stripe Integration", "Stripe Webhooks Guide", "Providers", "Configure Stripe", "Create a HookSniff endpoint", "Select events", "Start receiving Stripe webhooks", "When It Fires", "Event" |

### İçerik Sayfaları
| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `blog/page.tsx` | "Blog", "Subscribe to our newsletter", "What Users Say" |
| `changelog/page.tsx` | "Changelog", "Latest", "All areas", "All types", "Navigate", "Subscribe" |
| `customers/page.tsx` | "Customers", "Featured stories", "All customer stories", "Built on trusted infrastructure", "Join thousands of developers", "Talk to us" |
| `use-cases/page.tsx` | "Use Cases", "All industries", "Code example", "Common events", "Key metrics" |
| `newsletter/page.tsx` | "Newsletter", "The Webhook Digest", "Subscribers", "Issues sent", "Open rate", "Recent Issues", "What subscribers say", "Your privacy matters", "Privacy Policy", "Frequently Asked Questions", "Servet Arslan" |
| `status/page.tsx` | "System Status", "Overall Uptime", "Latency", "Components", "Incident History", "Past Maintenance", "Scheduled Maintenance", "Upcoming", "Today", "No data", "No scheduled maintenance", "Uptime", "HookSniff", "Docs" |
| `playground/page.tsx` | "Playground", "Playground API", "HookSniff", "No signup", "Rate limited", "No requests yet", "Body", "Headers", "Event type", "IP Address", "Query Parameters", "Python", "Quick samples", "Clear all", "Feature" |

### Alternatifler Sayfaları (8 sayfa)
| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `alternatives/svix` | "HookSniff vs Svix", "Svix", "Alternatives", "Feature", "HookSniff Pro is " |
| `alternatives/svix-alternatives` | Hardcoded |
| `alternatives/hookdeck` | "HookSniff vs Hookdeck", "Hookdeck", "Alternatives", "Feature" |
| `alternatives/hookdeck-alternatives` | Hardcoded |
| `alternatives/convoy` | "HookSniff vs Convoy", "Convoy", "Feature" |
| `alternatives/convoy-alternatives` | Hardcoded |
| `alternatives/hook0` | "Feature" |
| `alternatives/webhook-relay` | "HookSniff vs Webhook Relay", "Webhook Relay", "Feature" |

### Dokümantasyon Sayfaları (11 sayfa)
| Sayfa | Hardcoded Metin Sayısı |
|-------|----------------------|
| `docs/self-hosting` | ~15+ | "Quick Setup", "Docker Compose", "Database", "Redis", "API", "Dashboard", "REST API", "Nginx Reverse Proxy", "Cloud Deployment", "Firewall", "Management Commands", "Environment Variables", "Port", "PostgreSQL", "Description" |
| `docs/architecture` | ~15+ | "Architecture", "Components", "Data Flow", "API Server", "Database", "Auth", "Billing", "Deploy", "Payments", "Persistent storage", "Layer", "Async message delivery", "Async REST API" |
| `docs/concepts` | ~15+ | "Core Concepts", "Endpoints", "Events", "Event Types", "Attempt", "Attempt Tracking", "Delivery Status", "Dead Letter Queue", "API Keys", "FIFO Delivery", "FIFO order", "Delay", "Cumulative" |
| `docs/retries` | ~15+ | "Custom Retry Policy", "Exponential Backoff Schedule", "Delay After Failure", "Delay before first retry", "Maximum delivery attempts", "Dead Letter Queue Behavior", "Default", "Parameter", "Description", "Attempt", "Cumulative Time", "Immediate", "HTTP status code", "DNS resolution failure", "Delivery status is set to" |
| `docs/dlq` | ~15+ | "Dead Letter Queue", "DLQ Retention", "Max DLQ Entries", "Inspecting DLQ Entries", "Replaying Failed Webhooks", "Free", "Pro", "Business", "Plan", "Retention", "Audit failed deliveries for compliance", "Inspect the original payload and all retry attempts", "Replay deliveries after fixing the issue", "Endpoint returning", "The endpoint has been disabled or deleted" |
| `docs/event-types` | Hardcoded |
| `docs/idempotency` | Hardcoded |
| `docs/integrations` | Hardcoded |
| `docs/portal` | Hardcoded |
| `docs/security` | Hardcoded |
| `docs/dashboard` | Hardcoded |

---

## 5. Attribute-Level Hardcoded Text

### placeholder
| Dosya | Hardcoded |
|-------|-----------|
| `dashboard/settings/page.tsx` | `placeholder="DELETE"` |
| `contact/page.tsx` | `placeholder="Your name"`, `placeholder="How can we help?"` |
| `blog/page.tsx` | `placeholder="Search posts by title or content..."` |

### title
| Dosya | Hardcoded |
|-------|-----------|
| `dashboard/endpoints/page.tsx` | `title="Settings"` |
| `dashboard/deliveries/[id]/page.tsx` | `title="Back to deliveries"`, `title="Copy headers"`, `title="Copy payload"`, `title="Copy response body"`, `title="Replay Webhook"`, `title="Copy"` |

### aria-label
| Dosya | Hardcoded |
|-------|-----------|
| `components/LanguageSwitcher.tsx` | `aria-label="Switch language"` |
| `components/NotificationCenter.tsx` | `aria-label="Notifications"` |
| `dashboard/layout.tsx` | `aria-label="Open sidebar"` |
| `admin/layout.tsx` | `aria-label="Open sidebar"` |
| `page.tsx` (landing) | `aria-label="Toggle navigation"` |

---

## 6. Bileşenler (components/) Hardcoded

| Bileşen | Hardcoded Metin |
|---------|----------------|
| `ErrorBoundary.tsx` | "Something went wrong" |
| `NotificationCenter.tsx` | "Notifications" |
| `LanguageSwitcher.tsx` | "Switch language" (aria-label) |

---

## 7. Eksik Çeviri Key'leri (en.json'da bile yok)

Aşağıdaki sayfalar için çeviri key'leri hiç oluşturulmamış:

- **dashboard/deliveries/[id]** — "Delivery Details", "Back to deliveries", "Error", "Error Message", "Response Body", "No attempt data available", "Attempts will appear here once the delivery is processed"
- **dashboard/endpoints/[id]** — "API Requests", "Avg Response", "Current Secret", "Endpoint Settings", "Failure Streak", "Rate Limits", "Retry Policy", "Signing Secret"
- **dashboard/routing** — Key yok
- **dashboard/templates** — "No templates available"
- **dashboard/transforms** — "Create", "Enrich", "Filter", "Map", "New Transform Rule", "Select Endpoint", "Enrich key", "Enrich value", "Map from", "Map to"
- **dashboard/portal** — "Profile", "Email", "Plan", "Endpoints", "Member since", "Usage", "API calls today", "Webhook limit", "Webhooks used"
- **dashboard/schemas** — "No schemas registered yet"
- **pricing** — "Pricing", "Free", "Pro", "Business", "Feature", "Compare all features", "Frequently asked questions", "What users say", "Support levels", "Build vs Buy"
- **security** — "Security", "Architecture security", "Certificate pinning on API", "Data at rest", "Data in transit", "HSTS with preload", vb.
- **providers/** — Tüm provider sayfaları
- **docs/** — Tüm dokümantasyon sayfaları
- **alternatives/** — Tüm alternatifler sayfaları
- **blog, changelog, customers, use-cases, newsletter, status, playground** — Tümü

---

## 8. Öncelik Sıralaması

### 🔴 Kritik (kullanıcı doğrudan görür, etkisi büyük)
1. `dashboard/deliveries/[id]` — Detay sayfası tamamen İngilizce
2. `dashboard/endpoints/[id]` — Ayarlar sayfası tamamen İngilizce
3. `dashboard/portal` — Kullanıcı profili tamamen İngilizce
4. `dashboard/transforms` — Transform kuralları tamamen İngilizce
5. `dashboard/layout.tsx` — "HookSniff", "Webhook Dashboard" hardcoded
6. `dashboard/inbound/page.tsx` — "How it works" vb. hardcoded
7. `dashboard/alerts/page.tsx` — Tablo header'ları hardcoded
8. `dashboard/team/page.tsx` — Tablo header'ları hardcoded
9. `dashboard/deliveries/page.tsx` — Tablo header'ları hardcoded
10. `dashboard/search/page.tsx` — Tablo header'ları hardcoded
11. Bileşenler: `ErrorBoundary`, `NotificationCenter`

### 🟡 Orta (pazarlama sayfaları, kullanıcı ilk girişte görür)
12. `pricing/page.tsx` — Fiyatlandırma tamamen İngilizce
13. `security/page.tsx` — Güvenlik sayfası tamamen İngilizce
14. `contact/page.tsx` — İletişim formu hardcoded
15. `about/page.tsx` — Hakkımızda hardcoded
16. `login/page.tsx` — Login sayfası
17. `terms/page.tsx` — Kullanım şartları hardcoded
18. `privacy/page.tsx` — Gizlilik politikası hardcoded
19. `providers/` — Tüm provider sayfaları

### 🟢 Düşük (içerik/blog, SEO odaklı)
20. `docs/` — Tüm dokümantasyon (11 sayfa)
21. `alternatives/` — Tüm alternatifler (8 sayfa)
22. `blog/`, `changelog/`, `customers/`, `use-cases/`
23. `newsletter/`, `status/`, `playground/`
24. `admin/` sayfaları

---

## 9. Teknik Detaylar

- **Framework:** next-intl (`useTranslations` hook)
- **Çeviri dosyaları:** `dashboard/src/messages/{locale}.json`
- **Desteklenen diller:** en, tr, de, ja, pt-BR, es, fr, ko
- **i18n yapılandırması:** `dashboard/src/i18n/routing.ts`, `request.ts`, `navigation.ts`
- **Dosya yapısı:** `app/[locale]/` — locale parametresi URL'de (ör. `/tr/dashboard`)

---

## 10. Notlar

- `tr.json` neredeyse tam çevrilmiş, diğer dillerde büyük eksiklik var
- Bazı terimler (Endpoint, Plan, Test, GitHub, Pricing vb.) evrensel olabilir — bunlar kasıtlı İngilizce bırakılmış olabilir
- Footer link isimleri (GitHub, Pricing, Security vb.) çoğu dilde aynı — bu kasıtlı olabilir
- Dashboard tablo header'ları (Event, Status, Attempts, Response, Time) hem `useTranslations` kullanan sayfalarda hem de çevrilmemiş — `t()` çağrıları çalışıyor ama değerler çevrilmemiş
- `dashboard/deliveries/[id]` sayfası için çeviri key'leri `en.json`'da mevcut ama sayfa bunları kullanmıyor
- `dashboard/routing` sayfası boş — ne hardcoded ne çeviri var
- `dashboard/templates` ve `dashboard/schemas` sayfaları neredeyse boş, sadece "No data" mesajı var
