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

## 10. Derin Tarama — Ek Bulgular

### 10.0 Metadata Titles (SEO — tüm sayfalar)
Hardcoded `<title>` tag'leri — dil değiştirince değişmez:
- `what-is-a-webhook/page.tsx` — "What is a Webhook? A Complete Guide — HookSniff"
- `alternatives/webhook-relay/page.tsx` — "HookSniff vs Webhook Relay — Alternative"
- `alternatives/hookdeck/page.tsx` — "HookSniff vs Hookdeck — Why Choose HookSniff"
- `alternatives/svix/page.tsx` — "HookSniff vs Svix — Why Choose HookSniff"
- `alternatives/hook0/page.tsx` — "HookSniff vs Hook0 — Why Choose HookSniff"
- `alternatives/convoy/page.tsx` — "HookSniff vs Convoy — Convoy Alternative"
- `customers/[slug]/page.tsx` — "Customer Stories — HookSniff"
- `startups/page.tsx` — "HookSniff for Startups — Special Pricing"
- `security/page.tsx` — "Security & Compliance — HookSniff"
- `build-vs-buy/page.tsx` — "Should you build webhook infrastructure in-house or use a service? Compare 12 dimensions..."
- `compare/CompareContent.tsx` — metadata description hardcoded

### 10.1 Landing Page
| Yer | Hardcoded Metin |
|-----|----------------|
| `DashboardPreview` component | "Deliveries", "Success Rate", "Avg Latency" |
| Pricing CTA button | "Get Started" |

### 10.2 Error / Not Found Sayfaları
| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `error.tsx` | "Something went wrong", "An unexpected error occurred. Please try again.", "Try again" |
| `not-found.tsx` | "404", "The page you're looking for doesn't exist.", "← Back to Home" |

### 10.3 Form Validation & Error Messages
| Dosya | Hardcoded |
|-------|-----------|
| `lib/store.tsx` | "Not authenticated", "Login failed", "Registration failed" |
| `dashboard/settings/page.tsx` | "Password must be at least 8 characters", "Failed to update profile", "Failed to change password", "Failed to delete account" |
| `dashboard/billing/page.tsx` | "Cancel failed", "Upgrade failed" |
| `dashboard/endpoints/page.tsx` | "Failed to create endpoint", "Failed to delete", "Unknown error" |
| `dashboard/endpoints/[id]/page.tsx` | "Failed to load endpoint", "Failed to update", "Rotation failed" |
| `dashboard/transforms/page.tsx` | "Failed to create rule", "Failed to delete" |
| `dashboard/inbound/page.tsx` | "Failed" |
| `dashboard/portal/page.tsx` | "Failed to load portal data" |
| `dashboard/playground/page.tsx` | "Unknown error" |
| `dashboard/api-keys/page.tsx` | (error key used but fallback hardcoded) |
| `OnboardingWizard.tsx` | "Failed to create endpoint" |
| `lib/api.ts` | "Unknown error", "API error: {status}" |

### 10.4 Empty States (Hardcoded)
| Dosya | Hardcoded Metin |
|-------|----------------|
| `dashboard/endpoints/page.tsx` | "No endpoints yet. Create one to start receiving webhooks." |
| `dashboard/alerts/page.tsx` | "No alert rules yet. Create one to get notified about webhook failures." |
| `dashboard/team/page.tsx` | "No members yet. Invite someone!" |
| `dashboard/health/page.tsx` | "No endpoints yet. Create one to start monitoring health." |
| `dashboard/deliveries/[id]/page.tsx` | "No additional debug data captured for this attempt" |
| `admin/users/page.tsx` | "No users found." |
| `dashboard/schemas/page.tsx` | "No schemas registered yet" |
| `dashboard/templates/page.tsx` | "No templates available" |

### 10.5 OnboardingWizard Component
Hardcoded: "Setup Progress", "Create your first endpoint", "Choose your SDK", "Install Command", "Test Command", "Send a test webhook", "API Keys", "Endpoints", "Deliveries", "Playground", " Use the "

### 10.6 StatusBadge Component
Status text'leri API'den geldiği için çevrilebilir ama şu an raw İngilizce: "delivered", "failed", "pending", "active", "inactive", "banned", "paid", "warning"

### 10.7 Contact Sayfası (Detaylı)
Hardcoded: "Contact", "Contact Us", "Email", "Location", "Response Time", "Name", "Subject", "Message", "Send us a message", "Select a topic", "General question", "Technical support", "Feature request", "Bug report", "Enterprise inquiry"

### 10.8 Terms Sayfası (Detaylı)
~25 hardcoded paragraf/sentence — tüm kullanım şartları İngilizce

### 10.9 Privacy Sayfası (Detaylı)
~25 hardcoded paragraf/sentence — tüm gizlilik politikası İngilizce

### 10.10 Newsletter Sayfası
Hardcoded: "Newsletter", "The Webhook Digest", "Subscribers", "Issues sent", "Open rate", "Recent Issues", "What subscribers say", "Your privacy matters", "Privacy Policy", "Frequently Asked Questions", "Servet Arslan"

### 10.11 CompareContent Component
Hardcoded: "Compare", "Compare Page", "Category", "Scorecard", "Total", "Detailed Comparison", "Deep Dive Comparisons", "Frequently Asked Questions", "HookSniff in Action", "Webhook Playground", "Build vs Buy", "View pricing", "Trusted by developers who switched from building their own webhooks"

### 10.12 BuildVsBuyContent Component
Hardcoded: "Build vs Buy", "Time to production", "Days", "Engineers to deploy HookSniff", "HookSniff Pro", "When Building Still Makes Sense", "Compare alternatives", "Frequently Asked Questions"

### 10.13 Startups Sayfası
Hardcoded: "Startups", "Build faster with HookSniff", "Apply for startup pricing"

### 10.14 Status Sayfası (Detaylı)
Hardcoded: "System Status", "Overall Uptime", "Latency", "Components", "Incident History", "Past Maintenance", "Scheduled Maintenance", "Upcoming", "Today", "No data", "No scheduled maintenance", "Uptime", "HookSniff", "Docs"

### 10.15 Dashboard Webhooks New
Hardcoded: "Endpoint", "Event Type"

### 10.16 Changelog Sayfası
Hardcoded: "Changelog", "Latest", "All areas", "All types", "Navigate", "Subscribe"
Error messages: "Something went wrong. Please try again.", "Network error — check your connection."

### 10.17 Ternary Operator Hardcoded Text
| Dosya | Hardcoded |
|-------|-----------|
| `components/ConfirmDialog.tsx` | "Processing..." |
| `components/OnboardingWizard.tsx` | "Creating...", "Create Endpoint →" |
| `dashboard/playground/page.tsx` | "OK", "Redirect", "Client Error", "Server Error" |
| `dashboard/endpoints/[id]/page.tsx` | "Saving...", "Save Retry Policy", "Rotating...", "Rotate Secret" |
| `dashboard/routing/page.tsx` | "Unhealthy", "Healthy" |
| `admin/users/[id]/page.tsx` | "Ban User", "Activate User", "Active", "Inactive" |
| `admin/users/page.tsx` | "Ban", "Activate" |
| `playground/page.tsx` | "Sending...", "Send →" |
| `changelog/page.tsx` | "Hide details ↑", "Show {n} changes →" |
| `newsletter/page.tsx` | "All", "Subscribing...", "Subscribe" |
| `blog/page.tsx` | "Subscribing...", "Subscribe" |

### 10.18 Variable-Assigned Hardcoded Text
| Dosya | Hardcoded |
|-------|-----------|
| `components/OnboardingWizard.tsx` | "Payments", "Email / Notifications", "E-commerce", "SaaS Platform", "AI / Agents", "Other" |
| `components/OnboardingWizard.tsx` | "Node.js", "Python", "Go", "Rust", "C#", "Java", "Ruby", "PHP", "Kotlin", "Elixir" (SDK labels) |
| `components/OnboardingWizard.tsx` | "Create account", "Get API key", "Create first endpoint", "Send first webhook" |
| `dashboard/endpoints/[id]/page.tsx` | "Exponential", "Linear", "Fixed" (retry strategy labels) |
| `dashboard/endpoints/[id]/page.tsx` | "Delay doubles each attempt (10s → 20s → 40s → 80s...)", "Delay increases linearly...", "Same delay every attempt..." |

### 10.19 Template Literal Hardcoded Text
| Dosya | Hardcoded |
|-------|-----------|
| `components/ThemeToggle.tsx` | "Switch to {light/dark} mode" |
| `dashboard/playground/page.tsx` | "Generated {eventType} payload" |
| `dashboard/deliveries/[id]/page.tsx` | "Replay this webhook delivery to the same endpoint? This will create a new delivery attempt." |
| `dashboard/deliveries/page.tsx` | "Replay delivery {id}… to the same endpoint?" |
| `admin/system/page.tsx` | "Checking...", "Uptime: {time}", "Latency: {ms}ms", "{pending} pending · {processing} processing · {failed} failed" |
| `admin/users/[id]/page.tsx` | "Plan updated to {plan}", "User banned/activated" |
| `admin/users/page.tsx` | "Plan updated to {plan}", "User banned/activated" |
| `playground/page.tsx` | "Status: {status} · {time}ms" |

### 10.20 Footer Component — Section Headers
Hardcoded: "Product", "Resources", "Company", "Get Started", "GitHub"

### 10.21 Dashboard Error Messages (Toast/Alert)
| Dosya | Hardcoded |
|-------|-----------|
| `dashboard/endpoints/page.tsx` | "Failed to create endpoint", "Failed to delete", "Unknown error" |
| `dashboard/endpoints/[id]/page.tsx` | "Endpoint not found", "Retry policy updated!", "Failed to load endpoint", "Failed to update", "Rotation failed", "Rotation failed" |
| `dashboard/deliveries/[id]/page.tsx` | "Failed to load delivery", "Webhook replayed successfully!", "Replay failed", "Failed to copy", "No headers captured", "No payload captured" |
| `dashboard/deliveries/page.tsx` | "Failed to load deliveries", "Replay failed" |
| `dashboard/team/page.tsx` | "Failed to load teams", "Failed to load members", "Failed to create team", "Failed to invite member", "Failed to remove member", "Failed to update role" |
| `dashboard/transforms/page.tsx` | "Transform rule created!", "Failed to create rule", "Rule deleted", "Failed to delete" |
| `dashboard/inbound/page.tsx` | "Failed" |
| `dashboard/portal/page.tsx` | "Failed to load portal data" |
| `dashboard/billing/page.tsx` | "Cancel failed", "Upgrade failed" |
| `dashboard/settings/page.tsx` | "Failed to update profile", "Failed to change password", "Failed to delete account", "Password must be at least 8 characters" |

### 10.22 Docs Pages (Detaylı)
| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `docs/integrations` | "Integration Guides", "GitHub Webhooks", "Shopify Webhooks", "Stripe Webhooks", "Generic Webhook Receiver", "Inbound Proxy", "Accepts incoming webhooks on your behalf", "Provides retry logic and monitoring for inbound webhooks", "Validates payloads and logs delivery attempts" + step-by-step instructions |
| `docs/portal` | "Embeddable Portal", "How to Embed", "Iframe", "Customization", "Secure access", "API key scoping", "View deliveries", "Inspect payloads", "Replay failed webhooks", "Rotate secrets", "Zero support tickets" |
| `docs/security` | "Webhook Security Guide", "HMAC signatures", "HTTPS only", "IP Whitelisting", "SSRF Protection", "Timestamp Validation", "TLS Enforcement", "Standard Webhooks", "Python Verification", "localhost" |
| `docs/event-types` | "Event Types", "Registering Event Types", "Filtering by Event Type", "Querying by Event Type", "Schema Validation" |
| `docs/idempotency` | "Idempotency", "Idempotency Keys", "How HookSniff Handles Duplicates", "Best Practices", "Retry with the same idempotency key on network failures", "Keys are retained for {days} days", "Include the event type in the key to avoid collisions across event types" |
| `docs/dashboard` | "Dashboard Guide", "Overview", "Recent Deliveries", "Delivery Monitoring", "Delivery Log", "Attempt Details", "Endpoint Management", "Create Endpoints", "Custom Headers", "Default Retry Policy", "Rotate Secrets", "Event Filtering", "Delivery Stats", "Success Rate", "Latency", "Volume Trends", "Activity Charts", "Activity Log", "Failure Analysis", "Replay", "Alerts", "Endpoint Health", "API Keys", "Multiple API Keys", "Team Collaboration", "Shared Dashboard", "Analytics", "Export", "Settings", "Billing", "Webhook Payload Limits" |
| `docs/quickstart` | (kullanılmayan description field'ı) |
| `docs/sdks` | (kullanılmayan description field'ı) |

### 10.23 Alternatives Pages (Detaylı)
| Sayfa | Hardcoded |
|-------|-----------|
| `alternatives/svix-alternatives` | "Alternatives", "Svix", "Service", "Open Source", "SDKs", "Price", "Recommended" |
| `alternatives/hookdeck-alternatives` | "Alternatives", "Hookdeck", "Service", "Open Source", "SDKs", "Price", "Routing" |
| `alternatives/convoy-alternatives` | "Alternatives", "Convoy", "Service", "Open Source", "SDKs", "Price", "Portal", "Managed Cloud" |

### 10.24 What-is-a-Webhook Sayfası (Detaylı)
Hardcoded: "The Simple Explanation", "How Webhooks Work", "Common Use Cases", "Webhook vs API vs Polling", "Webhook Security", "Getting Started with Webhooks" + tüm comparison table ("Aspect", "Webhook", "Polling", "Direction", "Timing", "Latency", "Efficiency", "Complexity") + use case descriptions ("Payment notifications", "CI/CD pipelines", "Chat bots", "E-commerce", "AI agents", "Monitoring") + security items ("HMAC signatures", "HTTPS only", "IP whitelisting", "Timestamp validation")

### 10.25 Use-Cases Sayfası (Detaylı)
Her use case için hardcoded: title, tagline, description, pain points, benefits, events, metrics, testimonial quote/author/role
- "SaaS Platforms", "E-Commerce", "Fintech & Payments", "AI Agents", "Developer Platforms"

### 10.26 Newsletter Sayfası (Detaylı)
- Recent issues: title, category, excerpt (3 issue)
- FAQ: 5 soru + cevap
- Category types: "Product updates", "Engineering insights", "Industry trends" + descriptions
- Testimonials: quote, author, role (3 adet)
- Error messages: "Something went wrong. Please try again.", "Network error — check your connection."

### 10.27 Admin System Sayfası (Detaylı)
Hardcoded: "API Server", "PostgreSQL Database", "Redis Cache", "Webhook Queue", "Checking...", "Uptime: {time}", "Latency: {ms}ms", "{pending} pending · {processing} processing · {failed} failed", "Monitor infrastructure services and system status", "Last checked: {date} · Auto-refresh every 15s", "Oracle Cloud ARM", "4 OCPU, 24 GB RAM", "Neon PostgreSQL", "Serverless, 0.5 GB", "Upstash Redis", "Serverless, 256 MB", "Cloudflare", "DNS, SSL, DDoS", "Vercel", "Next.js 15", "Grafana Cloud", "OpenTelemetry"

---

## 11. Öncelik Sıralaması (Güncellenmiş)

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
11. Bileşenler: `ErrorBoundary`, `NotificationCenter`, `OnboardingWizard`
12. `error.tsx` — "Something went wrong"
13. `not-found.tsx` — "404", "Back to Home"
14. Empty states — 8 sayfada hardcoded "No X yet" mesajları
15. Error messages — 12+ dosyada hardcoded error text'leri

### 🟡 Orta (pazarlama sayfaları, kullanıcı ilk girişte görür)
16. `pricing/page.tsx` — Fiyatlandırma tamamen İngilizce
17. `security/page.tsx` — Güvenlik sayfası tamamen İngilizce
18. `contact/page.tsx` — İletişim formu hardcoded (15+ alan)
19. `about/page.tsx` — Hakkımızda hardcoded
20. `login/page.tsx` — Login sayfası
21. `terms/page.tsx` — Kullanım şartları (~25 paragraf hardcoded)
22. `privacy/page.tsx` — Gizlilik politikası (~25 paragraf hardcoded)
23. `providers/` — Tüm provider sayfaları (3 sayfa)
24. `startups/page.tsx` — "Build faster with HookSniff"
25. `newsletter/page.tsx` — 11+ hardcoded alan
26. `compare/CompareContent.tsx` — 13+ hardcoded alan
27. `build-vs-buy/BuildVsBuyContent.tsx` — 8+ hardcoded alan
28. `DashboardPreview` — "Deliveries", "Success Rate", "Avg Latency"
29. Landing page "Get Started" button

### 🟢 Düşük (içerik/blog, SEO odaklı)
30. `docs/` — Tüm dokümantasyon (11 sayfa)
31. `alternatives/` — Tüm alternatifler (8 sayfa)
32. `blog/`, `changelog/`, `customers/`, `use-cases/`
33. `status/page.tsx` — 15+ hardcoded alan
34. `playground/page.tsx` — 15+ hardcoded alan
35. `admin/` sayfaları

---

## 12. Notlar

- `tr.json` neredeyse tam çevrilmiş, diğer dillerde büyük eksiklik var
- Bazı terimler (Endpoint, Plan, Test, GitHub, Pricing vb.) evrensel olabilir — bunlar kasıtlı İngilizce bırakılmış olabilir
- Footer link isimleri (GitHub, Pricing, Security vb.) çoğu dilde aynı — bu kasıtlı olabilir
- Dashboard tablo header'ları (Event, Status, Attempts, Response, Time) hem `useTranslations` kullanan sayfalarda hem de çevrilmemiş — `t()` çağrıları çalışıyor ama değerler çevrilmemiş
- `dashboard/deliveries/[id]` sayfası için çeviri key'leri `en.json`'da mevcut ama sayfa bunları kullanmıyor
- `dashboard/routing` sayfası boş — ne hardcoded ne çeviri var
- `dashboard/templates` ve `dashboard/schemas` sayfaları neredeyse boş, sadece "No data" mesajı var
- Error mesajları (throw new Error) kullanıcıya gösteriliyor — bunlar da çevrilmeli
- Terms ve Privacy sayfaları tamamen İngilizce — yasal metinler olduğu için profesyonel çeviri gerekir
- StatusBadge component API'den gelen status string'ini doğrudan gösteriyor — backend'den çevrilmiş gelmeli veya frontend'de map'lenmeli

---

## 13. Son Kontrol — Daha Önce Taranmamış Sayfalar

| Sayfa | Hardcoded Metinler |
|-------|-------------------|
| `dashboard/api-importer/page.tsx` | "OpenAPI Spec URL", "Paste OpenAPI JSON", "Supported Formats" |
| `dashboard/portal-customize/page.tsx` | "Company Name", "Logo URL", "Primary Color", "Font Family", "Dark Mode", "Enable dark mode by default", "Show Deliveries", "Show Events", "Event Subscriptions", "All events allowed", "Allow users to view delivery history", "Allow users to view event types", "Webhook Endpoints", "Recent Deliveries" |
| `dashboard/rate-limiting/page.tsx` | "Rate Limiting", "How Rate Limiting Works", "RPM", "RPS", "Burst", "Throttled", "Throttled Requests", "Auto Retry", "Exponential backoff", "Custom limits", "Endpoint", "Queue", "Alerts", "Throttle notifications", "Total Endpoints" |
| `dashboard/signature-verifier/page.tsx` | "How Webhook Signatures Work", "Verify Signature", "Webhook Secret", "Algorithm" |
| `get-started/page.tsx` | "Quickstart", "Endpoints", "Install", "Test Webhook", "Alerts", "Auto Retries", "Portal Settings", "Embed Code", "Your API Key", "HookSniff", "HookSniff Playground", "Free forever", "No credit card", "Result", "Use" |
| `admin/layout.tsx` | "Access Denied", "Admin Panel", "HookSniff Management" |
| `changelog/[slug]/page.tsx` | "Changelog", "Latest" |

**Tarama tamamlandı.** Toplam 60+ sayfa, 15+ bileşen tarandı. 500+ hardcoded İngilizce metin tespit edildi.

---

## 14. Satır Satır Okuma — Detaylı Bulgular

### 14.1 get-started/page.tsx (EN DETAYLI — 300+ satır hardcoded)
**SDK_EXAMPLES objesi:**
- label: "Node.js", "Python", "Go", "Rust", "curl"
- install: "npm install hooksniff-sdk", "pip install hooksniff", "go get github.com/hooksniff/hooksniff-go", "cargo add hooksniff"
- code: Her SDK için tam kod örnekleri (hardcoded)

**EVENT_TYPES objesi:**
- category: "💳 Payments", "👤 Users", "📦 Orders", "📧 Email", "🤖 AI / Agents", "🔔 Notifications"
- events: Her kategori için 5-6 event type (hardcoded)

**Hero section:**
- "Free tier — no credit card required"
- "Get Started with HookSniff"
- "Send your first webhook in under 5 minutes. HookSniff handles delivery, retries, security, and monitoring."
- "Free forever", "11 SDKs", "No credit card", "5 min setup"

**Step 1:**
- "Create your account"
- "Sign up for free — no credit card required. You get 10,000 webhook deliveries per month on the free plan."
- "Create Free Account →"
- "✓ Signed in as {email}"

**Step 2:**
- "Get your API key"
- "Your API key authenticates requests. You can find it in your dashboard after signing up."
- "Your API Key", "Manage keys →"
- "🙈 Hide", "👁 Show"
- "💡 Keep your API key secret. Never commit it to version control."

**Step 3:**
- "Install the SDK"
- "Choose your language and install the SDK. HookSniff has official SDKs for 11 languages."
- "Install" (label), "Quickstart" (label)

**Step 4:**
- "Create an endpoint"
- "An endpoint is a URL where HookSniff delivers your webhooks. You can create one via the SDK, API, or dashboard."
- "🖥️ Via Dashboard", "⚡ Via API"
- "💡 Tip: Use HookSniff Playground to test webhooks without a real endpoint..."

**Step 5:**
- "Send your first webhook"
- "Now let's send a test webhook. Use the code below or try the interactive playground."
- "Test Webhook" (label)
- "🧪 Try Playground", "📦 View Deliveries"

**Step 6:**
- "Monitor deliveries & go live"
- "Track every webhook delivery in real-time..."
- "📊 Real-time Dashboard", "🔄 Auto Retries", "🔔 Alerts"
- "Success rates, latency, throughput", "Exponential backoff, configurable", "Get notified on failures"
- "Open Dashboard →"

**Event Types Reference section:**
- "📋 Event Type Reference"
- "Common webhook event types you can use. These are suggestions — use any event type you want."

**Embed section:**
- "🖼️ Embed in Your App"
- "Give your customers a white-labeled webhook portal inside your own dashboard."
- "Embed Code" (label)
- "Portal Settings" link text

**CLI section:**
- "⌨️ CLI Quickstart"
- "Manage HookSniff from your terminal."
- "Install & Use" (label)

**CTA section:**
- "Ready to start?"
- "Create your free account and send your first webhook in minutes."
- "Create Free Account", "Try Playground", "Go to Dashboard →"

### 14.2 portal-customize/page.tsx
- "🖼️ Portal Customization"
- "Customize the look and feel of your embedded webhook portal."
- "Saving...", "Save Changes"
- "🎨 Branding" section: "Company Name", "Logo URL", "Primary Color", "Font Family"
- "⚙️ Features" section: "Dark Mode", "Enable dark mode by default", "Show Events", "Allow users to view event types", "Show Deliveries", "Allow users to view delivery history"
- "📋 Allowed Events": "Leave empty to show all events. Add specific event types to filter what users can subscribe to."
- "All events allowed"
- "👁️ Preview": "Webhook Endpoints", "Event Subscriptions", "Recent Deliveries", "2 endpoints configured", "✅ 47 delivered · ❌ 3 failed"
- "📋 Embed Code": "Copy this code into your dashboard to embed the portal."
- "⚛️ React Integration"
- Error messages: "Portal configuration saved!", "Failed to save: {error}", "Event already added"
- "Copied!", "Copy"

### 14.3 rate-limiting/page.tsx
- "⚡ Rate Limiting"
- "Monitor and configure rate limits for your webhook endpoints."
- Overview cards: "Total Endpoints", "Avg Requests/sec", "Peak Requests/sec", "Throttled Requests"
- Table headers: "Endpoint", "RPS", "RPM", "Burst", "Queue", "Throttled"
- Empty state: "Rate Limiting", "HookSniff automatically rate-limits webhook deliveries to protect your endpoints. Configure limits per endpoint in settings."
- Feature cards: "🔄 Auto Retry", "Exponential backoff", "📊 Per-Endpoint", "Custom limits", "🔔 Alerts", "Throttle notifications"
- "How Rate Limiting Works" section:
  - "1️⃣ Token Bucket Algorithm", "Each endpoint has a token bucket that refills at the configured rate. Requests consume tokens."
  - "2️⃣ Burst Handling", "Short bursts are allowed up to the burst size, then requests are queued."
  - "3️⃣ Queue & Retry", "Excess requests are queued and delivered when capacity is available. Failed deliveries retry with exponential backoff."
  - "4️⃣ Per-Endpoint Config", "Each endpoint can have custom rate limits. Defaults: 10 req/sec, 600 req/min, burst 20."

### 14.4 signature-verifier/page.tsx
- "🔐 Signature Verifier"
- "Verify webhook signatures to ensure payloads are authentic. HookSniff signs every webhook with HMAC-SHA256."
- "Algorithm" section: "HMAC-SHA256", "HMAC-SHA512"
- "Verify Signature" section: "Webhook Payload (raw body)", "Webhook Secret", "Signature (from x-hooksniff-signature header)"
- "Verifying...", "✓ Verify Signature", "🔧 Compute Signature"
- Result: "Signature Valid!", "The payload is authentic and has not been tampered with.", "Signature Invalid!", "The signature does not match. The payload may have been tampered with."
- "Code Example — Node.js"
- "How Webhook Signatures Work" section:
  - "1. HookSniff signs the payload", "When a webhook is delivered, HookSniff computes an HMAC hash of the raw request body using your endpoint's secret key."
  - "2. Signature is included in headers", "The signature is sent in the x-hooksniff-signature header (format: sha256=<hex_digest>)."
  - "3. You verify on your server", "Compute the same HMAC hash on your server and compare it with the received signature. Use constant-time comparison to prevent timing attacks."
- Error messages: "Payload and secret are required", "Signature computed!", "Failed to compute signature", "All fields are required", "Verification failed"

### 14.5 api-importer/page.tsx
- "📥 API Spec Importer"
- "Import endpoints from an OpenAPI/Swagger specification. Auto-create webhook endpoints from your existing API."
- Mode toggle: "🔗 From URL", "📋 Paste JSON"
- "OpenAPI Spec URL", "Paste OpenAPI JSON"
- "Fetch", "Parse"
- Results: "{title} v{version}", "{n} endpoints found", "Deselect All", "Select All", "Importing {n}...", "Import {n} Endpoints"
- "Supported Formats" section: "OpenAPI 3.0", "Swagger 2.0", "URL", ".json / .yaml", ".json", "https://..."
- Error messages: "Found {n} endpoints", "Failed to parse OpenAPI spec", "Failed to fetch: {error}", "Failed to parse. Make sure it's valid JSON.", "Select at least one endpoint", "Imported {n}/{total} endpoints"
- "💡 Tip: Imported endpoints will be created with the URL from your API spec. You can update the URL later to point to your actual webhook receiver."
- "Copied!", "Copy"

### 14.6 admin/layout.tsx
- "Access Denied"
- "Admin Panel"
- "HookSniff Management"

**Tarama tamamlandı. Tüm dosyalar satır satır okundu.**

---

## 15. Dil Bilgisi ve Anlam Kayması Tespitleri

### 15.1 KRİTİK: Yanlış Dil Karakteri (Machine Translation Bug)

| Dil | Key | Sorun | Değer |
|-----|-----|-------|-------|
| **tr.json** | `a4` | **Çince karakter** (指向) Türkçe metinde | "Ücretsiz bir hesap oluşturun, sunucu URL'inize**指向** bir endpoint oluşturun..." |
| **ja.json** | `q4` | **Korece karakter** (어) Japonca metinde | "どうהתחילればいいですか？" → "어떻게始めればいいですか？" |

Bu makine çevirisi hataları. Kullanıcıya doğrudan görünüyor.

### 15.2 Placeholder Eksik

| Dil | Key | Sorun |
|-----|-----|-------|
| **tr.json** | `apiKeys.keyCount` | `{plural}` placeholder eksik. en: `{count} key{plural}` → tr: `{count} anahtar` |

### 15.3 Anlam Kayması — Plan İsimleri

| Dil | Key | en | Çeviri | Sorun |
|-----|-----|-------|--------|-------|
| **tr.json** | `landing.pricing.business` | "Business" | "İş" | Plan adı olarak "İş" tek başına anlamsız. "Kurumsal" daha uygun. |

### 15.4 Anlam Kayması — "Deliveries" Çevirisi (Webhook Bağlamı)

| Dil | Key | Çeviri | Sorun |
|-----|-----|--------|-------|
| **de.json** | `deliveries.title` | "Zustellungen" | Posta/kargo bağlamında kullanılır. Webhook için "Lieferungen" daha uygun. |
| **fr.json** | `deliveries.title` | "Livraisons" | Fiziksel teslimat bağlamında kullanılır. Webhook için "Diffusions" veya "Envois" daha uygun. |
| **ko.json** | `deliveries.title` | "배달" | Yemek/paket teslimatı bağlamında kullanılır. Webhook için "전달" daha uygun. |

### 15.5 Çevrilmemiş Terimler (Kasıtlı Olabilir)

| Terim | Diller | Not |
|-------|--------|-----|
| "Dashboard" | tr, de, fr, es, pt-BR, ko | Kasıtlı olabilir — teknik terim |
| "Endpoint" | Tüm diller | Kasıtlı — teknik terim |
| "Webhook" | Tüm diller | Kasıtlı — teknik terim |
| "API" | Tüm diller | Kasıtlı — teknik terim |

### 15.6 Uzunluk Anomalileri (Japonca / Korece)

Japonca ve Korece'de karakter başına anlam yoğunluğu yüksek olduğu için "2 karakter = 8 karakter İngilizce" normaldir. Bunlar hata değil:
- ja: "設定" (2 char) = "Settings" (8 char) ✅
- ko: "설정" (2 char) = "Settings" (8 char) ✅

Ancak bazı çevirilerde anlam daralması olabilir:
- ja: `endpoints.empty` → "エンドポイントがまだありません" (sadece "Endpoint yok") — İngilizce "Create one to start receiving webhooks" kısmı atlanmış.
- ko: `endpoints.empty` → "아직 엔드포인트가 없습니다" (sadece "Endpoint yok") — Aynı sorun.

---

## 16. Özet — Düzeltilmesi Gereken Sorunlar

### Acil (Kullanıcıyı Etkiliyor)
1. `tr.json a4` — Çince karakter (指向) silinmeli
2. `ja.json q4` — Korece karakter (어) silinmeli
3. `tr.json apiKeys.keyCount` — `{plural}` placeholder eklenmeli
4. `tr.json landing.pricing.business` — "İş" → "Kurumsal"

### Orta (Anlam Kayması)
5. `de.json deliveries.title` — "Zustellungen" → "Lieferungen"
6. `fr.json deliveries.title` — "Livraisons" → "Diffusions" veya "Envois"
7. `ko.json deliveries.title` — "배달" → "전달"

### Düşük (İyileştirme)
8. `ja.json endpoints.empty` — "Create one..." kısmı eklenmeli
9. `ko.json endpoints.empty` — "Create one..." kısmı eklenmeli
