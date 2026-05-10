# 🔍 Dashboard İnceleme

> Kapsam: `dashboard/src/` — 83 sayfa, 19 bileşen, 7 lib/hook, 57 test
> Tarih: 2026-05-10

---

## 🔴 Kritik

| # | Sorun | Dosya | Satır |
|---|-------|-------|-------|
| 1 | `credentials: 'include'` headers İÇİNDE — auth cookie gönderilmiyor | `dashboard/.../settings/page.tsx` | ~82, ~106 | ✅ Düzeltildi (2026-05-10) |
| 2 | Aynı hata api-keys sayfasında da var | `dashboard/.../api-keys/page.tsx` | ~72 | ✅ Düzeltildi (2026-05-10) |
| 3 | Aynı hata search sayfasında da var | `dashboard/.../search/page.tsx` | ~65 | ✅ Düzeltildi (2026-05-10) |
| 4 | 9+ sayfada Authorization header eksik (alerts, billing, health, inbound, transforms, analytics, logs, notifications, routing) | Çeşitli | fetch() |
| 5 | Admin sayfalarında sunucu tarafı yetkilendirme yok (6 sayfa, sadece client-side token) | `admin/page.tsx`, `revenue/`, `settings/`, `system/`, `users/`, `users/[id]/` | - |
| 6 | Playground'ta hardcoded `Bearer YOUR_TOKEN` + SSRF riski | `dashboard/.../playground/page.tsx` | ~340 |
| 7 | Blog'ta `dangerouslySetInnerHTML` (şu an güvenli ama tehlikeli pattern) | `dashboard/.../blog/[slug]/page.tsx` | ~highlight |
| 8 | Blog tüm content (~600 satır) client'a bundle ediliyor | `dashboard/.../blog/[slug]/page.tsx` | posts objesi |
| 9 | Landing page Pro $49, pricing page Pro $29 — tutarsız | `page.tsx` vs `pricing/page.tsx` | - | ✅ Düzeltildi (2026-05-10) |
| 10 | Privacy/terms 7 gün diyor, pricing 3 gün diyor (data retention) | `privacy/page.tsx` vs `pricing/page.tsx` | - |

## 🟠 Yüksek

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | 17/23 dashboard sayfası hatayı sessizce yutuyor (`catch {}`) | Core dashboard pages |
| 2 | Checkout URL doğrulamasız redirect | `billing/page.tsx` | ✅ Düzeltildi (2026-05-10) |
| 3 | `alert()` kullanımı (toast sistemi yerine) | endpoints, settings, alerts | ✅ Düzeltildi (2026-05-10) |
| 4 | Newsletter form'da CSRF koruması yok | `blog/page.tsx`, `contact/page.tsx` |
| 5 | ROI calculator yanlış Svix/Hookdeck formülleri | `pricing/page.tsx` | ✅ Düzeltildi (2026-05-10) |
| 6 | "PayStack" gerçek şirket adı — trademark riski | `customers/page.tsx` |
| 7 | 15+ sayfa gereksiz client component (SEO/performans kaybı) | Public pages |

## 🟡 Orta

| # | Sorun | Kapsam |
|---|-------|--------|
| 1 | Modal'larda focus trapping, ESC, role="dialog" yok | Tüm modal'lar |
| 2 | Icon-only butonlarda `aria-label` yok | Tüm sayfalar |
| 3 | Tıklanabilir satırlar keyboard-navigable değil | Tablo sayfaları |
| 4 | FAQ accordion'da `aria-expanded` yok | faq, pricing, build-vs-buy |
| 5 | Form mesajlarında `role="alert"` yok | login, contact, newsletter |
| 6 | SVG gradient ID collision riski | dashboard, analytics |
| 7 | `attempts.sort()` state mutation | `deliveries/[id]/page.tsx` |
| 8 | Notification preferences local state only | `settings/page.tsx` | ✅ Düzeltildi (2026-05-10) |
| 9 | Inconsistent styling (`glass-card` vs plain `bg-white`) | portal, routing, schemas, templates |
| 10 | Dashboard token refresh yok (401 → login) | `lib/api.ts` | ✅ Düzeltildi (2026-05-10) |
| 11 | 5s/30s polling background tab'da devam ediyor | dashboard, health, status |
| 12 | `window.location.href` yerine Next.js router | `search/page.tsx` | ✅ Düzeltildi (2026-05-10) |
| 13 | Dead code (`selected` state, `_setEvent`, `_endpoints`) | deliveries, search, playground | ✅ Düzeltildi (2026-05-10) |
| 14 | Duplicate chart code (dashboard + analytics) | `page.tsx` + `analytics/page.tsx` |

## 🔵 Düşük

| # | Sorun | Dosya |
|---|-------|-------|
| 1 | Missing structured data (JSON-LD) | Public SEO pages |
| 2 | Tables `<caption>` eksik | docs, alternatives pages |
| 3 | Inconsistent `<a>` vs `<Link>` (i18n routing bypass) | about, pricing |
| 4 | Missing OpenGraph metadata on some pages | docs, alternatives |
| 5 | Missing `aria-live` regions for loading states | Tüm dashboard pages |
| 6 | Format edilmemiş tarihler | `schemas/page.tsx` |
| 7 | Template cards clickable ama action yok | `templates/page.tsx` |
| 8 | Blog post ordering manual (`orderedSlugs`) | `blog/[slug]/page.tsx` |
| 9 | ASCII art diagrams accessibility | `docs/architecture/page.tsx` |
| 10 | `formatRelativeTime` future date handle etmiyor | `status/page.tsx` |
| 11 | Retry attempt docs'da tutarsız (3 vs 6) | docs/retries, docs/concepts |
| 12 | Code example'da `useTranslations` (React hook) Express handler'da | `docs/sdks/page.tsx` |
| 13 | Hook0 comparison hatalı (self-hosted only yazıyor ama cloud var) | `alternatives/hook0/page.tsx` |
| 14 | Blog search input'da `<label>` eksik | `blog/page.tsx` |

## 🟢 Güçlü Yönler

- ✅ i18n desteği (next-intl) tüm sayfalarda
- ✅ Auth guard tüm dashboard sayfalarında
- ✅ Dark mode desteği
- ✅ Recharts + Tremor component library
- ✅ SEO sayfaları server component (glossary, guides, providers, security)
- ✅ Changelog entry sayfası mükemmel OpenGraph desteği
