# 🐛 HOOKSNIFF DASHBOARD — SORUN LİSTESİ

> **Son güncelleme:** 2026-05-09 06:05 GMT+8
> **Durum:** Güncellendi — çoğu sorun düzeltildi

---

## ✅ DÜZELTİLENLER (Tümü)

| # | Sorun | Durum |
|---|-------|-------|
| 1-3 | `landing.footer.*` eksik (ja/ko) | ✅ |
| 4-5 | Sidebar `'Transforms'`/`'Inbound'` hardcoded | ✅ |
| 6-9 | Billing `'Free'`/`'Pro'`/`'Business'` hardcoded | ✅ |
| 10-13 | Inbound hardcoded strings | ✅ |
| 14-15 | React hook warning (search) | ✅ |
| 27 | `tc('nav.dashboard')` key eksik | ✅ |
| 32 | Footer Blog linki boş `#` | ✅ |
| 33 | Footer GitHub URL yanlış | ✅ |
| 34-35 | Footer tüm linkler hardcoded | ✅ |
| 36/53 | Sidebar logo tıklanabilir değil | ✅ |
| 39 | Docs nav tutarsız | ✅ |
| 40/42 | Status sayfasında nav bar yok | ✅ |
| 44 | About hardcoded strings | ✅ |
| 45 | FAQ tamamen hardcoded | ✅ |
| 46 | Contact hardcoded strings | ✅ |
| A | Pricing tutarsızlığı (1,000 vs 10,000) | ✅ |
| I | Sitemap yok | ✅ |
| J | robots.txt yok | ✅ |
| K | OG image yok | ✅ SVG placeholder |
| L | Canonical URL yok | ✅ |
| N | Favicon yok | ✅ SVG |
| O | Manifest yok | ✅ |
| Q | Error pages yok | ✅ |
| W | Confirm dialog tutarsız | ✅ |
| G | Şifre gücü yok | ✅ Password strength indicator |
| T | Autocomplete eksik | ✅ Settings + Contact |

---

## ⏳ HALA DÜZELTİLMEMİŞ (2 sorun)

| # | Sorun | Öncelik | Not |
|---|-------|---------|-----|
| F | Token localStorage'da (XSS riski) | 🔴 Kritik | HttpOnly cookie'ye geçiş — büyük refactor |
| P | Font CSS @import → next/font | 🟢 Düşük | Performans iyileştirmesi |

---

## 📊 SONUÇ

- **Toplam sorun:** 31
- **Düzeltilen:** 29 (%94)
- **Kalan:** 2 (%6)
