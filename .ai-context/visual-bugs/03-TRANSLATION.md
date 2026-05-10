# 🐛 03 — Çeviri / i18n Hataları

> Durum: 🔴 YÜKSEK — Türkçe locale'de neredeyse tüm içerik İngilizce
> Etkilenen sayfa: ~50+
> Tahmini düzeltme süresi: 3-5 saat

---

## Genel Durum

`/tr/` (Türkçe) locale altında olmasına rağmen, sayfa içeriklerinin büyük çoğunluğu İngilizce. Sadece navigation bar ve bazı sidebar linkleri Türkçe.

---

## Dil Hataları (Karakter Sorunları)

### Yanlış Dil Karakterleri
| Dil | Key | Sorun | Doğrusu |
|-----|-----|-------|---------|
| `tr.json` | `a4` | Çince karakter `指向` var | Kaldırılmalı |
| `ja.json` | `q4` | Korece karakter `어` var | Kaldırılmalı |

### Eksik Placeholder
| Dil | Key | Sorun |
|-----|-----|-------|
| `tr.json` | `apiKeys.keyCount` | `{plural}` placeholder eksik |

---

## Çeviri Coverage (Dil Kapsamı)

| Dil | Toplam Key | Çevrilmemiş | Coverage |
|-----|-----------|-------------|----------|
| en.json | 715 | — | %100 |
| tr.json | 715 | 23 | %96.8 |
| ja.json | 715 | 410 | %42.7 |
| ko.json | 715 | 410 | %42.7 |
| es.json | 715 | 420 | %41.3 |
| fr.json | 715 | 418 | %41.5 |
| pt-BR.json | 715 | 422 | %41.0 |
| de.json | 715 | 431 | %39.7 |

**Not:** Çevrilmemiş sayı, teknik terimler (Webhook, API, SDK vb.) ve footer link isimlerini içerir. Gerçek çevrilmemiş UI metni daha düşüktür.

---

## Hardcoded İngilizce Metinler (Kaynak Kodda)

### 🔴 Kritik — Doğrudan Kullanıcı Gören

| Sayfa | Hardcoded Sayısı | Örnekler |
|-------|-----------------|----------|
| `dashboard/deliveries/[id]` | 32 | "Back to deliveries", "Copy headers", "Replay Webhook" |
| `dashboard/endpoints/[id]` | 24 | "Saving...", "Rotate Secret", "Retry Policy" |
| `dashboard/portal-customize` | 27 | "Branding", "Primary Color", "Features" |
| `dashboard/signature-verifier` | 17 | "Verify Signature", "Computed Signature" |
| `dashboard/rate-limiting` | 15 | "Requests per second", "Burst size" |
| `dashboard/transforms` | 11 | "Add Rule", "Filter", "Template" |
| `dashboard/portal` | 10 | "Portal Preview", "Embed Code" |
| `dashboard/api-importer` | 8 | "Import from URL", "Select endpoints" |
| `dashboard/routing` | 2 | "Unhealthy", "Healthy" |
| `dashboard/templates` | 1 | "No data" |
| `dashboard/schemas` | 1 | "No data" |

### 🟡 Orta — Pazarlama Sayfaları

| Sayfa | Hardcoded Sayısı |
|-------|-----------------|
| `use-cases` | 146 |
| `pricing` | 104 |
| `customers/[slug]` | 108 |
| `compare/CompareContent` | 80 |
| `customers` | 71 |
| `blog/[slug]` | 76 |
| `blog` | 47 |
| `status` | 43 |
| `playground` | 81 |
| `security` | 36 |
| `privacy` | 61 |
| `terms` | 50 |
| `contact` | 15 |
| `about` | 10 |
| `startups` | 5 |
| `what-is-a-webhook` | 28 |
| `providers/stripe` | 26 |
| `providers/github` | 26 |
| `providers/shopify` | 26 |
| `providers` | 6 |
| `newsletter` | 32 |
| `changelog` | 7 |

### 🟢 Düşük — Alternatives Sayfaları (Tümü İngilizce)

| Sayfa | Hardcoded Sayısı |
|-------|-----------------|
| `alternatives/svix` | ~15 |
| `alternatives/svix-alternatives` | ~15 |
| `alternatives/hookdeck` | ~15 |
| `alternatives/hookdeck-alternatives` | ~15 |
| `alternatives/hook0` | ~15 |
| `alternatives/convoy` | ~15 |
| `alternatives/convoy-alternatives` | ~15 |
| `alternatives/webhook-relay` | ~15 |

---

## Component'lerde Hardcoded Metin

| Component | Hardcoded Metin |
|-----------|----------------|
| `OnboardingWizard.tsx` | 40+ öğe: SDK etiketleri, adım başlıkları, açıklamalar |
| `Footer.tsx` | 24 öğe: bölüm başlıkları, link isimleri |
| `ErrorBoundary.tsx` | "Something went wrong" |
| `NotificationCenter.tsx` | "Notifications" |
| `ConfirmDialog.tsx` | "Confirm", "Cancel" |
| `CodeBlock.tsx` | "Copy" |
| `SdkTabs.tsx` | "Copy" |
| `LanguageSwitcher.tsx` | "Switch language" (aria-label) |
| `EmailVerificationBanner.tsx` | "Resend" |
| `StatusBadge.tsx` | Ham API durumu (delivered/failed/pending) |

---

## Hata Mesajları (Hardcoded)

| Dosya | Mesajlar |
|-------|----------|
| `lib/store.tsx` | "Not authenticated", "Login failed", "Registration failed" |
| `lib/api.ts` | "Unknown error", "AbortError" |
| `settings/page.tsx` | "Failed to update profile", "New passwords do not match" |
| `billing/page.tsx` | "Cancel failed", "Upgrade failed", "Upgrade initiated" |
| `endpoints/page.tsx` | "Failed to create endpoint", "Failed to delete" |
| `endpoints/[id]/page.tsx` | "Endpoint not found", "Failed to load endpoint" |
| `deliveries/[id]/page.tsx` | "Failed to load delivery", "Replay failed" |
| `team/page.tsx` | "Failed to load teams", "Failed to create team" |
| `transforms/page.tsx` | "Failed to create rule", "Rule deleted" |
| `notifications/page.tsx` | "Failed to load notifications" |
| `health/page.tsx` | "Healthy", "Degraded", "Unhealthy" |
| `analytics/page.tsx` | "Success", "Failed", "Pending" |

---

## SEO Metadata Başlıkları (Hardcoded)

| Sayfa | Title |
|-------|-------|
| `what-is-a-webhook` | "What is a Webhook? A Complete Guide — HookSniff" |
| `alternatives/webhook-relay` | "HookSniff vs Webhook Relay — Alternative" |
| `alternatives/hookdeck` | "HookSniff vs Hookdeck — Why Choose HookSniff" |
| `alternatives/svix` | "HookSniff vs Svix — Why Choose HookSniff" |
| `alternatives/hook0` | "HookSniff vs Hook0 — Why Choose HookSniff" |
| `alternatives/convoy` | "HookSniff vs Convoy — Convoy Alternative" |
| `customers/[slug]` | "Customer Stories — HookSniff" |
| `startups` | "HookSniff for Startups — Special Pricing" |
| `security` | "Security & Compliance — HookSniff" |

---

## Anlam Kayması Çeviri Hataları

| Dil | Key | EN | Çeviri | Sorun |
|-----|-----|-----|--------|-------|
| tr.json | `landing.pricing.business` | "Business" | "İş" | Plan adı çok kısa, "Kurumsal" olmalı |
| de.json | `deliveries.title` | "Deliveries" | "Zustellungen" | Posta bağlamı, "Lieferungen" olmalı |
| fr.json | `deliveries.title` | "Deliveries" | "Livraisons" | Fiziksel teslimat bağlamı, "Diffusions" olmalı |
| ko.json | `deliveries.title` | "Deliveries" | "배달" | Yemek teslimatı bağlamı, "전달" olmalı |

---

## Footer Çeviri Tutarsızlığı

Footer başlıkları ("Product", "Compare", "Resources", "Company") İngilizce ama bazı linkler Türkçe ("Hakkında", "İletişim", "SSS"). Aynı footer içinde karışık dil var.

---

## Önerilen Düzeltme Adımları

1. **Kritik karakter hatalarını düzelt** — tr.json ve ja.json'daki yanlış dil karakterleri
2. **En kritik sayfaları Türkçeleştir** — pricing, dashboard, endpoints, deliveries
3. **Component'leri i18n'ye taşı** — ErrorBoundary, ConfirmDialog, CodeBlock vb.
4. **Hata mesajlarını Türkçeleştir** — lib/store.tsx, lib/api.ts
5. **SEO metadata'yı Türkçeleştir** — title tag'leri
6. **Footer'ı tamamen Türkçeleştir** — tüm başlıklar ve linkler