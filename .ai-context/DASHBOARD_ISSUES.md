# 🐛 HOOKSNIFF DASHBOARD — SORUN LİSTESİ

> **Son güncelleme:** 2026-05-09 06:08 GMT+8
> **Durum:** 30/31 düzeltildi (%97)
> **Commit:** `686c5d4`

---

## ✅ DÜZELTİLENLER — KRİTİK

| # | Sorun | Çözüm | Commit |
|---|-------|-------|--------|
| 1-3 | `landing.footer.*` eksik (ja/ko) — build error | ja.json ve ko.json'a `about`, `faq`, `contact` key'leri eklendi | `5c1dbf2` |
| 27 | `tc('nav.dashboard')` bulunamıyor — build error | `useTranslations('common')` → `useTranslations('nav')`, `tNav('dashboard')` | `5c1dbf2` |
| A | Pricing tutarsızlığı: Landing 1,000 / API 10,000 | Billing page Free plan limiti `10,000 webhooks/month` olarak düzeltildi | `5c1dbf2` |

## ✅ DÜZELTİLENLER — i18n (Hardcoded Strings)

| # | Sayfa | Sorun | Çözüm |
|---|-------|-------|-------|
| 4-5 | Sidebar (layout.tsx:35-36) | `'Transforms'`, `'Inbound'` hardcoded | `t('transforms')`, `t('inbound')` — 8 locale'de key eklendi |
| 6-9 | Billing (billing/page.tsx) | `'Free'`, `'Pro'`, `'Business'` hardcoded | `t('plans.free')`, `t('plans.pro')`, `t('plans.business')` |
| 10-13 | Inbound (inbound/page.tsx) | `'Generic'`, `'Active'`, `'Disabled'`, toast msg hardcoded | `t('active')`, `t('disabled')`, `t('configCreated')`, `t('configFailed')` |
| 29 | docs/layout.tsx | `'Docs'` hardcoded | Link ile değiştirildi |
| 32-35 | Footer.tsx | Tüm linkler hardcoded, GitHub URL yanlış, Blog linki boş | Tamamen yeniden yazıldı — `t()` ile, doğru GitHub URL |
| 44 | About page | `'Delivery Rate'`, `'Avg Latency'` hardcoded | `t('deliveryRate')`, `t('avgLatency')` |
| 45 | FAQ page | 15 soru/cevap tamamen hardcoded İngilizce | Tamamen yeniden yazıldı — `t('q1')`...`t('q15')`, `t('a1')`...`t('a15')` |
| 46 | Contact page | `'Sending...'`, `'Send Message'` hardcoded | `t('sending')`, `t('sendMessage')` |

**Eklenen i18n key sayısı:** ~100+ key × 8 locale = **800+ çeviri satırı**

## ✅ DÜZELTİLENLER — SEO

| # | Sorun | Çözüm |
|---|-------|-------|
| I | Sitemap yok | `src/app/sitemap.ts` oluşturuldu — tüm sayfalar × 8 dil |
| J | robots.txt yok | `public/robots.txt` oluşturuldu — dashboard/admin engellendi |
| K | OG image yok | `public/og-image.svg` + layout'ta `openGraph.images` eklendi |
| L | Canonical URL yok | `alternates.canonical` + `alternates.languages` eklendi |
| N | Favicon yok | `public/favicon.svg` oluşturuldu + layout'ta `icons` eklendi |
| O | Manifest yok | `public/manifest.json` oluşturuldu |

## ✅ DÜZELTİLENLER — Güvenlik

| # | Sorun | Çözüm |
|---|-------|-------|
| G | Şifre gücü kontrolü yok | Login/register formuna password strength indicator eklendi (Weak/Medium/Strong + renk barı) |
| T | Autocomplete eksik | Settings formuna `autoComplete="name"`, `"email"`, `"current-password"`, `"new-password"` eklendi; Contact formuna `autoComplete="name"`, `"email"` eklendi |
| W | Confirm dialog tutarsız | Endpoints ve Alerts sayfaları `confirm()` → `ConfirmDialog` component'e geçirildi |

## ✅ DÜZELTİLENLER — UX

| # | Sorun | Çözüm |
|---|-------|-------|
| 14-15 | React hook warning (search/page.tsx) | `useEffect [page]` → `[page, search]` |
| 36/53 | Sidebar logo tıklanabilir değil | `<div>` → `<Link href="/">` yapıldı |
| 37/54 | Sidebar "Home" menü öğesi yok | Logo artık ana sayfaya link |
| 39 | Docs nav tutarsız | `dark:border-slate-700` → `dark:border-slate-800` + `bg-white/70 dark:bg-slate-900/70` |
| 40/42 | Status sayfasında nav bar yok | Nav bar eklendi (Logo + Link + LanguageSwitcher) |

## ✅ DÜZELTİLENLER — Performans

| # | Sorun | Çözüm |
|---|-------|-------|
| P | Font CSS `@import` render-blocking | `next/font/google` ile `Inter` ve `JetBrains Mono` preload edildi; CSS variable (`--font-inter`, `--font-jetbrains-mono`) ile Tailwind entegrasyonu |

## ✅ DÜZELTİLENLER — Hata Sayfaları

| # | Sorun | Çözüm |
|---|-------|-------|
| Q | `error.tsx`, `not-found.tsx`, `loading.tsx` yok | Üç sayfa da oluşturuldu |

---

## ⏳ KALAN (1 sorun)

| # | Sorun | Öncelik | Not |
|---|-------|---------|-----|
| F | Token localStorage'da saklanıyor (XSS riski) | 🔴 Kritik | `src/lib/store.tsx:33` — `localStorage.getItem('hooksniff_auth')`. HttpOnly cookie'ye geçiş backend + frontend refactor gerektirir. Ayrı planlama yapılmalı. |

---

## 📊 İSTATİSTİKLER

| Metrik | Değer |
|--------|-------|
| Toplam sorun | 31 |
| Düzeltilen | 30 (%97) |
| Kalan | 1 (%3) |
| Değiştirilen dosya | 26+ |
| Eklenen satır | ~1000+ |
| i18n key | ~100+ × 8 locale |
| Commit sayısı | 4 |

---

## 📝 NOTLAR

- Build başarılı ✅ (`npm run build` — 0 error, 1 warning)
- Warning: `admin/users/page.tsx` — `useCallback` missing dependency `tc` (farklı sayfa, bu scope dışında)
- OG image SVG olarak oluşturuldu — production'da PNG'ye çevrilmeli (1200×630)
- Favicon SVG olarak oluşturuldu — production'da PNG fallback eklenebilir
- FAQ çevirileri: EN ve TR tam, diğer diller EN fallback (DE, ES, FR, PT-BR, JA, KO)
