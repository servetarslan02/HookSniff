# 🐛 07 — Dark Mode Hataları

> Durum: 🟡 ORTA — Dark mode toggle eksik, mekanizma tutarsız
> Etkilenen sayfa: ~60+
> Tahmini düzeltme süresi: 1 saat

---

## 1. Dark Mode Toggle Sadece Landing Page'de Var

**Sorun:** Dark mode toggle butonu sadece landing page (`/tr`) navigation bar'ında var. Diğer hiçbir sayfada yok.

### Toggle Olan Sayfalar
- ✅ `/tr` (landing page)

### Toggle OLMAYAN Sayfalar
- ❌ `/tr/blog`
- ❌ `/tr/blog/[slug]`
- ❌ `/tr/changelog`
- ❌ `/tr/customers`
- ❌ `/tr/customers/[slug]`
- ❌ `/tr/alternatives/*` (8 sayfa)
- ❌ `/tr/providers/*` (4 sayfa)
- ❌ `/tr/docs/*` (15 sayfa)
- ❌ `/tr/pricing`
- ❌ `/tr/about`
- ❌ `/tr/contact`
- ❌ `/tr/faq`
- ❌ `/tr/security`
- ❌ `/tr/privacy`
- ❌ `/tr/terms`
- ❌ `/tr/playground`
- ❌ `/tr/status`
- ❌ `/tr/use-cases`

**Etki:** Kullanıcı dark mode'u sadece landing page'den açabilir. Diğer sayfalarda kapatamaz.

---

## 2. Dark Mode Doğru Çalışıyor (Açıksa)

**Olumlu:** Eğer dark mode landing page'de açılırsa, diğer tüm sayfalarda doğru şekilde devam ediyor. Renkler, kontrast ve okunabilirlik iyi.

---

## 3. Manuel Dark Mode Class Çalışmıyor

**Sorun:** JavaScript ile `<html>` elementine `dark` class'ı eklemek dark mode stillerini tetiklemiyor. Toggle muhtemelen farklı bir mekanizma kullanıyor (localStorage + class on body veya data attribute).

---

## 4. Dark Mode Toggle Mekanizması Bilinmiyor

**Sorun:** Hangi mekanizmanın kullanıldığı belirsiz:
- `localStorage` + class on `<body>`?
- `data-theme` attribute?
- CSS custom properties?
- Tailwind `dark:` prefix?

**Not:** `ThemeProvider.tsx` ve `ThemeToggle.tsx` incelenmeli.

---

## Önerilen Düzeltme Adımları

1. **Toggle'ı layout'a taşı** — Root layout veya dashboard layout'ta toggle her zaman görünmeli
2. **Mekanizmayı belirle** — `ThemeProvider.tsx` ve `ThemeToggle.tsx` dosyalarını incele
3. **Tüm sayfalarda tutarlı** — Aynı toggle component'i her sayfada kullanılmalı
4. **Persist et** — Kullanıcı tercihi localStorage'da saklanmalı