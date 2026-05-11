# Public Sayfa i18n Düzeltme Raporu

**Tarih:** 2026-05-12
**Durum:** ✅ Tamamlandı

## Düzeltilen Sayfalar

### 1. Security Page (`/security`)
**Namespace:** `security`
**Eklenen key sayısı:** ~44 yeni key

Değiştirilen hardcoded metinler:
- Badge: "Security & Compliance" → `t("badge")`
- Hero başlık: "Enterprise-grade security, startup-friendly pricing" → `t("heroTitle")`
- Hero açıklama: "Security is not optional..." → `t("heroSubtitle")`
- 12 güvenlik özelliği (TLS, HMAC, 2FA, SSO, IP Whitelisting, SSRF, Argon2, Audit Logs, EU Data, API Key Rotation, Rate Limiting, Secret Rotation) → i18n key çiftleri (`featureTls`/`featureTlsDesc` vb.)
- 6 uyumluluk maddesi (GDPR, SOC 2, CCPA, KVKK, Standard Webhooks, CloudEvents) → i18n key'leri
- Sorumlu Açıklama bölümü → `t("responsibleDisclosure")`, `t("responsibleDisclosureDesc")`, `t("responsibleDisclosureCommit")`
- CTA bölümü → `t("ctaTitle")`, `t("ctaDesc")`, `t("ctaContact")`
- Mimari güvenlik: "AES-256 encryption for stored data" → `t("featureTlsDesc")`, "Cloudflare R2 with server-side encryption" → "Cloudflare R2", "TLS 1.3 for all connections" → "TLS 1.3"

### 2. What Is a Webhook Page (`/what-is-a-webhook`)
**Namespace:** `whatIsWebhook`
**Eklenen key sayısı:** ~37 yeni key

Değiştirilen hardcoded metinler:
- Nav başlık: "What is a Webhook?" → `t("title")`
- Sayfa başlık ve alt başlık → `t("title")`, `t("subtitle")`
- Basit açıklama paragrafı (polling vs webhook pizza analogisi) → i18n key'leri
- "How it works" 4 adım → `t("step1")`-`t("step4")` + desc key'leri
- 6 kullanım alanı (Payment, CI/CD, Chat bots, E-commerce, AI agents, Monitoring) → `t("ucXxx")` key çiftleri
- Güvenlik açıklaması → `t("securityDesc")`
- "Getting started" 5 adım → `t("gsStep1")`-`t("gsStep5")`
- Pro tip → `t("proTip")`, `t("proTipDesc")`
- CTA → `t("ctaTitle")`, `t("ctaDesc")`, `t("ctaButton")`

### 3. Startups Page (`/startups`)
**Namespace:** `startups`
**Eklenen key sayısı:** ~16 yeni key

Değiştirilen hardcoded metinler:
- Badge: "🚀 Startup Program" → `t("badge")`
- Alt başlık: "Special pricing for early-stage startups..." → `t("subtitle")`
- 3 fayda kartı (50% off Pro, Extended free tier, Priority support) → `t("benefitXxxTitle")`/`t("benefitXxxDesc")`
- "Who qualifies?" başlığı ve 5 madde → `t("whoQualifies")`, `t("qualify1")`-`t("qualify5")`
- CTA açıklaması ve buton → `t("ctaDesc")`, `t("ctaButton")`

### 4. Pricing Page (`/pricing`)
**Namespace:** `pricing`
**Eklenen key sayısı:** ~27 yeni key

Değiştirilen hardcoded metinler:
- Security & Compliance 8 kartı (TLS 1.3, SOC 2, GDPR, HMAC, 2FA, Audit Logs, SSO, IP Whitelisting) → `t("securityItemXxxTitle")`/`t("securityItemXxxDesc")`
- Support levels özellikleri (Free/Pro/Business feature listeleri) → `t.raw('supportFreeFeatures')`, `t.raw('supportProFeatures')`, `t.raw('supportBusinessFeatures')`
- 3 testimonial (alıntılar, yazarlar, şirketler) → `t("testimonialXxxQuote")`, `t("testimonialXxxAuthor")`, `t("testimonialXxxCompany")`

### 5. FAQ Page (`/faq`)
**Namespace:** Root level (`faqTitle`, `faqSubtitle`, `q1`-`q15`, `a1`-`a15`, category keys)
**Eklenen key sayısı:** 0 (zaten tamamen i18n kullanılıyordu)

Değiştirilen hardcoded metin: Yok. Sayfa zaten `t()` çağrıları ile tamamen i18n uyumluydu.

## Dosya Değişiklikleri

| Dosya | Değişiklik |
|-------|-----------|
| `src/messages/tr.json` | ~124 yeni Türkçe key eklendi |
| `src/messages/en.json` | ~124 yeni İngilizce key eklendi |
| `src/app/[locale]/security/page.tsx` | Hardcoded metinler `t()` ile değiştirildi, `features` ve `compliance` array'leri kaldırıldı |
| `src/app/[locale]/what-is-a-webhook/page.tsx` | Tüm hardcoded İngilizce metinler `t()` ile değiştirildi |
| `src/app/[locale]/startups/page.tsx` | Tüm hardcoded İngilizce metinler `t()` ile değiştirildi |
| `src/app/[locale]/pricing/page.tsx` | Security items, support features, testimonials i18n'e taşındı |
| `src/app/[locale]/faq/page.tsx` | Değişiklik gerekmedi |

## Kalan İngilizce Metinler (Kasıtlı)

Aşağıdaki metinler kasıtlı olarak İngilizce bırakılmıştır:
- Teknik terimler: TLS 1.3, HMAC-SHA256, 2FA/TOTP, SSO/SAML, GDPR, SOC 2, CCPA, KVKK, SSRF, Argon2, CloudEvents, AES-256, Cloudflare R2, CI/CD, API, SDK, HTTP, POST, WebSocket, IP/CIDR
- Plan isimleri: Free, Pro, Business
- Ürün isimleri: HookSniff, Svix, Hookdeck, Stripe, GitHub, Slack, Discord, Okta, Auth0, Neon, Upstash
