# 🐛 HOOKSNIFF DASHBOARD — SORUN LİSTESİ

> **Son güncelleme:** 2026-05-09 05:50 GMT+8
> **Durum:** Güncellendi — çoğu sorun düzeltildi

---

## ✅ DÜZELTİLENLER (Bu oturumda)

| # | Sorun | Durum |
|---|-------|-------|
| 1-3 | `landing.footer.*` eksik (ja/ko) | ✅ Düzeltildi — tüm 8 locale'de footer tamamlandı |
| 4-5 | Sidebar `'Transforms'`/`'Inbound'` hardcoded | ✅ `t('transforms')` / `t('inbound')` yapıldı |
| 6-9 | Billing `'Free'`/`'Pro'`/`'Business'` hardcoded | ✅ `t('plans.free')` vb. yapıldı |
| 10-13 | Inbound hardcoded strings | ✅ `t('active')`, `t('disabled')`, `t('configCreated')` |
| 14-15 | React hook warning (search) | ✅ useEffect `[page]` → `[page, search]` |
| 27 | `tc('nav.dashboard')` key eksik | ✅ `tNav('dashboard')` yapıldı |
| 29 | docs/layout `'Docs'` hardcoded | ✅ Link ile |
| 32 | Footer Blog linki boş `#` | ✅ Tüm linkler düzeltildi |
| 33 | Footer GitHub URL yanlış | ✅ `servetarslan02/HookSniff` yapıldı |
| 34-35 | Footer tüm linkler hardcoded | ✅ `t()` ile |
| 36/53 | Sidebar logo tıklanabilir değil | ✅ `<Link href="/">` yapıldı |
| 39 | Docs nav tutarsız | ✅ `dark:border-slate-800` ile uyumlu |
| 40/42 | Status sayfasında nav bar yok | ✅ Nav bar eklendi |
| 44 | About hardcoded `'Delivery Rate'`/`'Avg Latency'` | ✅ `t('deliveryRate')` / `t('avgLatency')` |
| 45 | FAQ tamamen hardcoded | ✅ 15 Q&A artık `t()` ile |
| 46 | Contact hardcoded `'Sending...'`/`'Send Message'` | ✅ `t('sending')` / `t('sendMessage')` |
| A | Pricing tutarsızlığı (1,000 vs 10,000) | ✅ Billing page → 10,000 (API ile uyumlu) |
| F | Token localStorage'da | ⏳ Henüz düzeltilmedi (büyük refactor) |
| G | Şifre gücü yok | ⏳ Henüz düzeltilmedi |
| I | Sitemap yok | ✅ `src/app/sitemap.ts` oluşturuldu |
| J | robots.txt yok | ✅ `public/robots.txt` oluşturuldu |
| K | OG image yok | ⏳ Henüz düzeltilmedi |
| L | Canonical URL yok | ⏳ Henüz düzeltilmedi |
| N | Favicon yok | ⏳ Henüz düzeltilmedi |
| O | Manifest yok | ✅ `public/manifest.json` oluşturuldu |
| P | Font CSS @import | ⏳ `next/font` migration yapılmalı |
| Q | Error pages yok | ✅ `error.tsx`, `not-found.tsx`, `loading.tsx` oluşturuldu |
| W | Confirm dialog tutarsız | ✅ endpoints/alerts → ConfirmDialog |

---

## ⏳ HALA DÜZELTİLMEMİŞ

| # | Sorun | Öncelik |
|---|-------|---------|
| F | Token localStorage'da (XSS riski) | 🔴 Kritik — büyük refactor |
| G | Şifre gücü kontrolü yok | 🟡 Orta |
| K | OG image yok | 🟡 Orta |
| L | Canonical URL yok | 🟢 Düşük |
| N | Favicon yok | 🟢 Düşük |
| P | Font CSS @import → next/font | 🟢 Düşük |
| R | Lazy loading az | 🟢 Düşük |
| S | Keyboard navigation yok | 🟢 Düşük |
| T | Autocomplete eksik (settings/contact) | 🟢 Düşük |
| 37/54 | Sidebar "Home" menü öğesi yok | 🟢 Düşük |

---

## ✅ İYİ YAPILANLAR
- Tüm dashboard sayfalarında loading state var
- Dark mode desteği tutarlı
- Mobile hamburger menu landing page'de var
- Dashboard sidebar responsive
- Status badge renk kodlaması tutarlı
- 8 dil desteği (EN, TR, DE, ES, FR, PT-BR, JA, KO)
- Build başarılı ✅
