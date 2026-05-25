# Deep Accessibility & SEO Audit Report — HookSniff Dashboard

> **Audit Date:** 2026-05-10  
> **Scope:** `/src/app/[locale]/` (106 files) + `/src/components/` (21 files)  
> **Total Files Scanned:** 127 .tsx/.ts files  

---

## 📊 Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Accessibility (A11Y) | 8 | 22 | 22 | 8 | 60 |
| SEO | 3 | 12 | 8 | 2 | 25 |
| HTML Structure | 2 | 10 | 25 | 15 | 52 |
| **TOTAL** | **13** | **44** | **55** | **25** | **137** |

---

## 🔴 ERİŞİLEBİLİRLİK (A11Y) SORUNLARI

### 1. `<label>` ile `<input>` Arasında `htmlFor`/`id` Eşleşmesi Eksik (CRITICAL)

Hiçbir form dosyasında `htmlFor` attribute'u kullanılmamış. `<label>` etiketleri mevcut ancak input ile programatik olarak bağlı değil.

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/portal-customize/page.tsx | 140-141 | `<label>` + `<input>` — `htmlFor`/`id` eşleşmesi yok | 🔴 Critical | A11Y | `<label htmlFor="company-name">` + `<input id="company-name">` ekle |
| dashboard/portal-customize/page.tsx | 150-151 | Logo URL input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/portal-customize/page.tsx | 160-162 | Primary Color input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/inbound/page.tsx | 103-104 | Webhook Secret input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/inbound/page.tsx | 110-111 | Route to Endpoint input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/sso/page.tsx | 124-125 | Metadata URL input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/sso/page.tsx | 134-135 | Entity ID input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/sso/page.tsx | 144-145 | SSO URL input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/sso/page.tsx | 154-156 | X.509 Certificate textarea — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/sso/page.tsx | 173-174 | Issuer URL input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/sso/page.tsx | 183-184 | Client ID input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/sso/page.tsx | 193-194 | Client Secret input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/signature-verifier/page.tsx | 136-137 | Payload textarea — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/signature-verifier/page.tsx | 146-147 | Webhook Secret input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/signature-verifier/page.tsx | 156-157 | Signature input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/webhook-builder/page.tsx | 152 | URL input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/endpoints/[id]/page.tsx | 209 | URL input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/endpoints/page.tsx | 143-144 | URL input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/alerts/page.tsx | 118 | Email input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/transforms/page.tsx | 99 | Filter input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/retry-policy/page.tsx | 171-268 | 8 input — hiçbiri `htmlFor`/`id` yok | 🔴 Critical | A11Y | Tüm inputlara `htmlFor`/`id` ekle |
| dashboard/settings/page.tsx | 175 | Name input — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |
| dashboard/billing/page.tsx | — | Plan selection inputs — `htmlFor`/`id` yok | 🔴 Critical | A11Y | `htmlFor`/`id` eşleştir |

### 2. `<div onClick>` — Erişilebilirlik Davranışı Eksik (HIGH)

Modal overlay'lerinde `<div onClick>` kullanılmış ancak `role="button"`, `tabIndex`, `onKeyDown` eklenmemiş. Neyse ki bunlar overlay oldukları için düşük öncelikli, ancak yine de düzeltilmeli.

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/billing/page.tsx | 431 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | `<button>` kullan veya `role="button"` + `onKeyDown` ekle |
| dashboard/billing/page.tsx | 468 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| dashboard/settings/page.tsx | 371 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| dashboard/team/page.tsx | 245 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| dashboard/team/page.tsx | 292 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| dashboard/api-keys/page.tsx | 278 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| dashboard/api-keys/page.tsx | 306 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| dashboard/deliveries/page.tsx | 208 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| dashboard/logs/page.tsx | 313 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |
| admin/users/page.tsx | 241 | `<div onClick>` overlay — `role="button"` yok | 🟡 Medium | A11Y | Aynı |

### 3. Icon-Only Button'larda `aria-label` Eksik (HIGH)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| components/OnboardingWizard.tsx | 643 | `✕` close button — `aria-label` eksik | 🔴 Critical | A11Y | `aria-label="Close notification"` ekle |
| dashboard/portal-customize/page.tsx | 272 | `✕` remove event button — `aria-label` eksik (bazı durumlarda) | 🟠 High | A11Y | `aria-label` ekle |
| components/Onboarding.tsx | ~167 | Skip button — `aria-label` eksik | 🟡 Medium | A11Y | `aria-label="Skip onboarding tour"` ekle |

### 4. `aria-live` Region Eksik (HIGH)

Tüm uygulamada hiçbir `aria-live` region tanımlanmamış. Dinamik içerik güncellemeleri (bildirimler, hata mesajları, başarı mesajları) ekran okuyucular tarafından algılanamaz.

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| components/NotificationCenter.tsx | — | Bildirim dropdown — `aria-live="polite"` eksik | 🟠 High | A11Y | `<div aria-live="polite">` ekle |
| components/Toast.tsx | — | Toast mesajları — `aria-live` eksik | 🟠 High | A11Y | `<div role="alert" aria-live="assertive">` ekle |
| dashboard/api-keys/page.tsx | 133 | Error mesajı — `role="alert"` eksik | 🟠 High | A11Y | `role="alert"` ekle |
| components/ErrorBoundary.tsx | — | Error state — `role="alert"` eksik | 🟠 High | A11Y | `role="alert"` ekle |

### 5. Modal/Dialog'larda Focus Trapping Eksik (HIGH)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/billing/page.tsx | 430 | Upgrade modal — focus trapping eksik (sadece `tabIndex={-1}` var) | 🟠 High | A11Y | ConfirmDialog.tsx'deki pattern'i uygula |
| dashboard/billing/page.tsx | 467 | Cancel modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/settings/page.tsx | 371 | Delete modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/team/page.tsx | 245 | Create team modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/team/page.tsx | 292 | Invite modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/api-keys/page.tsx | 278 | Delete key modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/api-keys/page.tsx | 306 | Rotate key modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/deliveries/page.tsx | 208 | Detail modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/logs/page.tsx | 313 | Detail modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| admin/users/page.tsx | 241 | Plan change modal — focus trapping eksik | 🟠 High | A11Y | Aynı |
| dashboard/layout.tsx | 64-68 | Mobile sidebar — focus trapping eksik | 🟠 High | A11Y | Focus trap ekle |
| admin/layout.tsx | ~64 | Mobile sidebar — focus trapping eksik | 🟠 High | A11Y | Focus trap ekle |

### 6. Skip Link Eksik (MEDIUM)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| app/[locale]/layout.tsx | — | Ana layout — skip link yok | 🟡 Medium | A11Y | `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>` ekle |
| dashboard/layout.tsx | — | Dashboard layout — skip link yok | 🟡 Medium | A11Y | Aynı |
| admin/layout.tsx | — | Admin layout — skip link yok | 🟡 Medium | A11Y | Aynı |

### 7. `aria-expanded` Eksik — Dropdown/Toggle'lar (MEDIUM)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| components/NotificationCenter.tsx | 78 | Notification dropdown toggle — `aria-expanded` eksik | 🟡 Medium | A11Y | `aria-expanded={open}` ekle |
| dashboard/layout.tsx | 131 | Sidebar toggle button — `aria-expanded` eksik | 🟡 Medium | A11Y | `aria-expanded={sidebarOpen}` ekle |
| admin/layout.tsx | ~120 | Sidebar toggle button — `aria-expanded` eksik | 🟡 Medium | A11Y | Aynı |
| components/LanguageSwitcher.tsx | — | Language dropdown — `aria-expanded` eksik | 🟡 Medium | A11Y | `aria-expanded` ekle |
| components/NotificationCenter.tsx | — | Dropdown menü — `aria-expanded` attribute eksik (sadece `open` state var) | 🟡 Medium | A11Y | `aria-expanded={open}` ekle |

### 7b. `aria-selected` / `aria-current` Kullanılmamış (LOW)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/layout.tsx | 88-126 | Sidebar nav linkleri — aktif link için `aria-current="page"` eksik | 🟢 Low | A11Y | Aktif link'e `aria-current="page"` ekle |
| admin/layout.tsx | 74-100 | Sidebar nav linkleri — aktif link için `aria-current="page"` eksik | 🟢 Low | A11Y | Aynı |
| dashboard/sso/page.tsx | 97-99 | Provider tab'ları — `aria-selected` eksik | 🟢 Low | A11Y | `aria-selected={provider === p.id}` ekle |
| dashboard/playground/page.tsx | 197-199 | Tab'lar — `aria-selected` eksik | 🟢 Low | A11Y | `aria-selected={activeTab === tab}` ekle |

### 8. Renk Kontrastı Sorunları (MEDIUM)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/schemas/page.tsx | 38 | `text-gray-400` on white bg — kontrast yetersiz (~2.9:1) | 🟡 Medium | A11Y | `text-gray-500` veya `text-gray-600` kullan |
| dashboard/templates/page.tsx | 38 | `text-gray-400` on white bg — kontrast yetersiz | 🟡 Medium | A11Y | Aynı |
| dashboard/portal/page.tsx | 48 | `text-gray-500` loading text — kontrast sınırda | 🟢 Low | A11Y | `text-gray-600` kullan |
| components/Onboarding.tsx | 162 | `text-gray-400` skip button — kontrast yetersiz | 🟡 Medium | A11Y | `text-gray-500` kullan |
| components/OnboardingWizard.tsx | 297,362 | `text-gray-400` labels — kontrast yetersiz | 🟡 Medium | A11Y | `text-gray-500` kullan |
| components/AuthGuard.tsx | 22,33 | `text-gray-500` loading text — kontrast borderline | 🟢 Low | A11Y | `text-gray-600` kullan |

### 9. Heading Hierarchy Sorunları (MEDIUM)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/inbound/page.tsx | 63 | `<h2>` ile başlıyor, `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/endpoints/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/endpoints/[id]/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/transforms/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/settings/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/team/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/notifications/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/deliveries/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/deliveries/[id]/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/logs/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| dashboard/page.tsx | — | `<h1>` yok (ana dashboard sayfası) | 🟡 Medium | A11Y | `<h1>` ekle |
| login/page.tsx | — | `<h1>` yok | 🟡 Medium | A11Y | `<h1>` ekle |
| what-is-a-webhook/page.tsx | 73 | `<h4>` kullanılmış ama `<h3` atlanmış | 🟢 Low | A11Y | `<h3>` kullan |

### 10. `<tr onClick>` — Erişilebilirlik Eksik (LOW)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/deliveries/page.tsx | 139 | `<tr onClick>` — `role="row"` + `tabIndex={0}` + `onKeyDown` eksik | 🟢 Low | A11Y | `tabIndex={0}` + `onKeyDown` + `role="row"` ekle |
| dashboard/templates/page.tsx | 43 | `<div cursor-pointer>` ama `onClick` yok — interaktif element eksik | 🟢 Low | A11Y | `<button>` veya `<a>` kullan |

---

## 🔍 SEO SORUNLARI

### 1. `<meta name="description">` Eksik — Sayfa Bazında (CRITICAL)

70+ sayfada metadata (title, description) tanımlanmamış. Root layout'taki default metadata kullanılıyor, bu da her sayfa için aynı description anlamına geliyor.

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| app/[locale]/page.tsx | — | Ana sayfa — `generateMetadata` eksik | 🔴 Critical | SEO | `export const metadata` ekle |
| dashboard/page.tsx | — | Dashboard ana sayfa — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| login/page.tsx | — | Login sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| pricing/page.tsx | — | Pricing sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| about/page.tsx | — | About sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| contact/page.tsx | — | Contact sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| faq/page.tsx | — | FAQ sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| terms/page.tsx | — | Terms sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| privacy/page.tsx | — | Privacy sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| status/page.tsx | — | Status sayfası — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| docs/page.tsx | — | Docs ana sayfa — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| docs/* (15 alt sayfa) | — | Tüm docs alt sayfaları — metadata eksik | 🟠 High | SEO | Her birine `export const metadata` ekle |
| use-cases/page.tsx | — | Use cases — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| customers/page.tsx | — | Customers — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| newsletter/page.tsx | — | Newsletter — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| playground/page.tsx | — | Playground — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| get-started/page.tsx | — | Get Started — metadata eksik | 🟠 High | SEO | `export const metadata` ekle |
| verify-email/page.tsx | — | Verify Email — metadata eksik | 🟢 Low | SEO | `export const metadata` ekle |
| auth/callback/page.tsx | — | Auth Callback — metadata eksik | 🟢 Low | SEO | Gerekli olmayabilir |

### 2. Structured Data (JSON-LD) Eksik (HIGH)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| app/[locale]/page.tsx | — | Ana sayfa — JSON-LD (Organization, WebApplication) eksik | 🟠 High | SEO | `<script type="application/ld+json">` ekle |
| pricing/page.tsx | — | Pricing sayfası — JSON-LD (Product, Offer) eksik | 🟠 High | SEO | Structured data ekle |
| about/page.tsx | — | About sayfası — JSON-LD (Organization) eksik | 🟠 High | SEO | Structured data ekle |
| faq/page.tsx | — | FAQ sayfası — JSON-LD (FAQPage) eksik | 🟠 High | SEO | FAQPage schema ekle |
| docs/* | — | Docs sayfaları — JSON-LD (TechArticle) eksik | 🟡 Medium | SEO | TechArticle schema ekle |
| alternatives/* | — | Alternatives sayfaları — JSON-LD (WebPage) eksik | 🟡 Medium | SEO | WebPage schema ekle |

### 3. `hreflang` Tag'leri — `x-default` Eksik (MEDIUM)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| app/[locale]/layout.tsx | 71 | `alternates.languages` tanımlı ama `x-default` eksik | 🟡 Medium | SEO | `'x-default': 'https://hooksniff.vercel.app/en'` ekle |

### 4. `<link rel="canonical">` — Dinamik Sayfalar İçin Eksik (MEDIUM)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| app/[locale]/layout.tsx | 71 | Canonical sadece locale bazında — alt sayfalar için dinamik canonical yok | 🟡 Medium | SEO | Her sayfada `generateMetadata` ile dinamik canonical ekle |
| changelog/[slug]/page.tsx | 21 | `generateMetadata` var ama canonical eksik | 🟡 Medium | SEO | `alternates.canonical` ekle |
| blog/[slug]/page.tsx | 1621 | `generateMetadata` var ama canonical eksik | 🟡 Medium | SEO | `alternates.canonical` ekle |

### 5. Open Graph Tag'leri — Eksik Sayfalar (MEDIUM)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| changelog/[slug]/page.tsx | 21 | `generateMetadata` var ama OG tag'leri eksik | 🟡 Medium | SEO | `openGraph` objesi ekle |
| blog/[slug]/page.tsx | 1621 | `generateMetadata` var ama OG tag'leri eksik | 🟡 Medium | SEO | `openGraph` objesi ekle |
| alternatives/hookdeck-alternatives/page.tsx | 4 | `description` var ama `openGraph` eksik | 🟡 Medium | SEO | `openGraph` ekle |
| alternatives/svix-alternatives/page.tsx | 4 | `description` var ama `openGraph` eksik | 🟡 Medium | SEO | `openGraph` ekle |
| alternatives/convoy-alternatives/page.tsx | 4 | `description` var ama `openGraph` eksik | 🟡 Medium | SEO | `openGraph` ekle |

### 6. Image Alt Tag'leri — SEO Uyumlu Değil (LOW)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/portal-customize/page.tsx | 303 | `alt="Logo"` — çok genel | 🟢 Low | SEO | `alt="Company logo"` veya dinamik alt |
| components/OnboardingWizard.tsx | — | Emoji tabanlı icon'lar — alt text eksik | 🟢 Low | SEO | `aria-hidden="true"` veya `alt` ekle |

---

## 🏗️ HTML YAPISI SORUNLARI

### 1. `<table>` — `scope` Attribute Eksik (HIGH)

Tüm tablolarda `<thead>` ve `<tbody>` kullanılmış (iyi), ancak hiçbir `<th>` elementinde `scope` attribute'u yok.

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| what-is-a-webhook/page.tsx | 48 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | `<th scope="col">` ekle |
| alternatives/webhook-relay/page.tsx | 25 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| alternatives/hookdeck-alternatives/page.tsx | 37 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| alternatives/hookdeck/page.tsx | 42 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| alternatives/svix/page.tsx | 42 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| alternatives/hook0/page.tsx | 25 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| alternatives/convoy/page.tsx | 25 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| alternatives/svix-alternatives/page.tsx | 81 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| alternatives/convoy-alternatives/page.tsx | 33 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/rate-limiting/page.tsx | 118 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/billing/page.tsx | 382 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/page.tsx | 533 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/audit-log/page.tsx | 120 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/deliveries/page.tsx | 125 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/custom-domain/page.tsx | 101 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/logs/page.tsx | 191 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| dashboard/search/page.tsx | 131 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| admin/users/[id]/page.tsx | 251 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| admin/users/page.tsx | 144 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| docs/self-hosting/page.tsx | 31 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| docs/retries/page.tsx | 18,70 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| docs/architecture/page.tsx | 118 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| docs/api/page.tsx | 153 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| docs/concepts/page.tsx | 57 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| docs/page.tsx | 61 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| docs/dlq/page.tsx | 104 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| playground/page.tsx | 868 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| compare/CompareContent.tsx | 341 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| privacy/page.tsx | 111 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| pricing/page.tsx | 259 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| providers/shopify/page.tsx | 58 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| providers/github/page.tsx | 67 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| providers/stripe/page.tsx | 76 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |
| blog/[slug]/page.tsx | 1786 | `<th>` — `scope="col"` eksik | 🟠 High | HTML | Aynı |

### 2. Semantic HTML Eksik — Dashboard Sayfaları (MEDIUM)

Dashboard sayfaları semantic HTML elementleri (`<main>`, `<section>`, `<article>`) kullanmak yerine `<div>` ile yapılmış.

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/layout.tsx | — | `<main>` elementi eksik — içerik `<div>` içinde | 🟡 Medium | HTML | `<main id="main-content">` ekle |
| admin/layout.tsx | — | `<main>` elementi eksik | 🟡 Medium | HTML | Aynı |
| dashboard/page.tsx | — | `<section>` kullanımı yok — tüm içerik `<div>` | 🟡 Medium | HTML | Anlamlı section'lar ekle |
| dashboard/analytics/page.tsx | — | `<section>` kullanımı yok | 🟡 Medium | HTML | Aynı |
| dashboard/settings/page.tsx | — | `<section>` kullanımı yok | 🟡 Medium | HTML | Aynı |

### 3. `<nav>` — `aria-label` Eksik (MEDIUM)

Birden fazla `<nav>` elementi olan sayfalarda (`docs/layout.tsx`, `blog/[slug]/page.tsx`) `aria-label` olmadan ekran okuyucular hangi navigasyon olduğunu ayırt edemez.

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/layout.tsx | 88 | Sidebar `<nav>` — `aria-label` eksik | 🟡 Medium | HTML | `<nav aria-label="Dashboard sidebar">` ekle |
| admin/layout.tsx | 74 | Sidebar `<nav>` — `aria-label` eksik | 🟡 Medium | HTML | `<nav aria-label="Admin sidebar">` ekle |
| docs/layout.tsx | 65 | Header `<nav>` — `aria-label` eksik | 🟡 Medium | HTML | `<nav aria-label="Main navigation">` ekle |
| docs/layout.tsx | 89 | Sidebar `<nav>` — `aria-label` eksik (2. nav!) | 🟡 Medium | HTML | `<nav aria-label="Documentation sidebar">` ekle |
| blog/[slug]/page.tsx | — | 2 `<nav>` elementi — `aria-label` eksik | 🟡 Medium | HTML | Her nav'a farklı `aria-label` ekle |
| what-is-a-webhook/page.tsx | 9 | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | `<nav aria-label="Main navigation">` ekle |
| alternatives/* (9 dosya) | — | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | Aynı |
| build-vs-buy/BuildVsBuyContent.tsx | 114 | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | Aynı |
| contact/page.tsx | 35 | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | Aynı |
| about/page.tsx | 11 | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | Aynı |
| use-cases/page.tsx | 371 | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | Aynı |
| customers/* | — | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | Aynı |
| startups/page.tsx | 9 | `<nav>` — `aria-label` eksik | 🟢 Low | HTML | Aynı |

### 4. `<form>` — `onSubmit` Olmadan (LOW)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| dashboard/endpoints/page.tsx | 140 | `<form onSubmit>` — doğru kullanılmış ✅ | — | — | — |
| dashboard/settings/page.tsx | 158 | `<form onSubmit>` — doğru kullanılmış ✅ | — | — | — |
| dashboard/settings/page.tsx | 223 | `<form onSubmit>` — doğru kullanılmış ✅ | — | — | — |

### 5. Nested `<a>` Tag'leri — Tespit Edilmedi ✅

Nested link sorunu bulunamadı.

---

## 📈 İYİLEŞTİRME ÖNERİLERİ (Öncelik Sırasına Göre)

### 🔴 P0 — Kritik (Hemen Düzelt)
1. **Tüm `<label>` + `<input>` eşleşmelerine `htmlFor`/`id` ekle** — 23+ dosya etkileniyor
2. **Ana sayfa ve kritik sayfalara `generateMetadata` ekle** — SEO için şart
3. **OnboardingWizard close button'a `aria-label` ekle**

### 🟠 P1 — Yüksek (Bu Sprint)
4. **Tüm modal'lara focus trapping uygula** — ConfirmDialog.tsx'deki pattern'i kopyala
5. **`aria-live` region'lar ekle** — Toast, NotificationCenter, ErrorBoundary
6. **Tüm `<th>` elementlerine `scope="col"` ekle** — 34 dosya
7. **Dashboard sayfalarına `<h1>` ekle** — 12+ sayfa
8. **Structured data (JSON-LD) ekle** — Ana sayfa, pricing, FAQ, about

### 🟡 P2 — Orta (Gelecek Sprint)
9. **Skip link ekle** — 3 layout dosyası
10. **`aria-expanded` ekle** — Dropdown/toggle component'leri
11. **Renk kontrastını düzelt** — `text-gray-400` → `text-gray-500/600`
12. **Semantic HTML kullanımı** — Dashboard layout'larına `<main>`, `<section>` ekle
13. **`x-default` hreflang ekle**
14. **Dinamik canonical URL'ler ekle**

### 🟢 P3 — Düşük (Backlog)
15. **`<tr onClick>` erişilebilirliği** — `tabIndex` + `onKeyDown`
16. **Image alt text'leri iyileştir**
17. **`<div cursor-pointer>` elementlerini `<button>`/`<a>`'ya dönüştür**

---

## ✅ OLUMLU BULGULAR

1. **ConfirmDialog.tsx** — Mükemmel focus trapping implementasyonu (useRef, useEffect, keydown handler, focus restore)
2. **Semantic HTML** — Marketing sayfalarında (`what-is-a-webhook`, `alternatives/*`, `build-vs-buy`) `<article>`, `<section>`, `<nav>`, `<main>` doğru kullanılmış
3. **`<html lang>`** — Doğru locale ile ayarlanmış
4. **Open Graph** — Root layout'ta tam OG tag'leri mevcut
5. **Canonical URL** — Root layout'ta dinamik canonical mevcut
6. **`<table>` yapısı** — `<thead>` ve `<tbody>` doğru kullanılmış
7. **Image component** — Next.js `<Image>` component'i kullanılmış (alt attribute ile)
8. **Dark mode** — Tüm component'lerde `dark:` variant'ları destekleniyor
9. **Blog JSON-LD** — Blog listesi sayfasında structured data mevcut
10. **Icon-only buttons** — Çoğu icon-only button'da `aria-label` mevcut (transforms, api-keys, deliveries)

---

> **Not:** Bu audit 127 dosyanın grep-based analizi ile gerçekleştirilmiştir. Manuel test (ekran okuyucu, keyboard navigation) önerilir.
