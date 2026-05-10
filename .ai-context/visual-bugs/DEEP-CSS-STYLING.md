# DEEP CSS & Styling Audit Report — HookSniff Dashboard

**Taranan Dizinler:**
- `src/app/[locale]/` (97 dosya)
- `src/components/` (21 dosya)
- `src/app/[locale]/globals.css`

**Toplam Bulunan Sorun: 48**

---

## 1. RESPONSIVE SORUNLAR

### 1.1 Tablolar `overflow-x-auto` Wrapper Olmadan

13 tablo, mobilde yatay taşma sorunu yaşayacak şekilde `overflow-x-auto` wrapper'ı olmadan oluşturulmuş.

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/alternatives/webhook-relay/page.tsx` | 25 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/alternatives/hookdeck/page.tsx` | 42 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/alternatives/svix/page.tsx` | 42 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/alternatives/hook0/page.tsx` | 25 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/alternatives/convoy/page.tsx` | 25 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/docs/self-hosting/page.tsx` | 31 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/docs/retries/page.tsx` | 18, 70 | İki `<table>` de overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/docs/architecture/page.tsx` | 118 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/docs/api/page.tsx` | 153 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/docs/concepts/page.tsx` | 57 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/docs/page.tsx` | 61 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/docs/dlq/page.tsx` | 104 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |
| `app/[locale]/privacy/page.tsx` | 111 | `<table>` doğrudan render, overflow-x-auto yok | 🟡 Medium | `<div className="overflow-x-auto">` ile sar |

### 1.2 `<pre>` Blokları `overflow-x-auto` Olmadan

Bazı `<pre>` bloklarında `overflow-x-auto` eksik, uzun kod satırları taşacak.

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/docs/sdks/page.tsx` | 20 | `<pre>` overflow-x-auto yok | 🟡 Medium | `overflow-x-auto` class ekle |
| `app/[locale]/docs/sdks/page.tsx` | 103 | `<pre>` overflow-x-auto yok | 🟡 Medium | `overflow-x-auto` class ekle |
| `app/[locale]/docs/page.tsx` | 52 | `<pre>` overflow-x-auto yok | 🟡 Medium | `overflow-x-auto` class ekle |
| `app/[locale]/docs/api/page.tsx` | 174 | `<pre>` overflow-x-auto yok | 🟡 Medium | `overflow-x-auto` class ekle |
| `app/[locale]/playground/page.tsx` | 464, 472 | `<pre>` `whitespace-pre-wrap` var ama overflow-x-auto yok | 🟢 Low | `overflow-x-auto` ekle (pre-wrap zaten koruyor) |

### 1.3 `vh` Kullanımı — Mobilde Address Bar Sorunu

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/dashboard/deliveries/page.tsx` | 209 | `max-h-[80vh]` — mobilde address bar ile çakışır | 🟡 Medium | `max-h-[80dvh]` kullan |
| `app/[locale]/dashboard/logs/page.tsx` | 314 | `max-h-[80vh]` — mobilde address bar ile çakışır | 🟡 Medium | `max-h-[80dvh]` kullan |
| `app/[locale]/blog/[slug]/page.tsx` | 1899 | `max-h-[calc(100vh-8rem)]` — mobilde address bar ile çakışır | 🟡 Medium | `max-h-[calc(100dvh-8rem)]` kullan |

### 1.4 Fixed Width Değerleri

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/status/page.tsx` | 226 | `style={{ width: \`${m.count * 14}px\` }}` — dinamik px genişlik | 🟡 Medium | Tailwind class veya `min-w` ile değiştir |
| `app/[locale]/status/page.tsx` | 210, 224 | `style={{ gap: '2px' }}` — inline style | 🟢 Low | `gap-0.5` Tailwind class kullan |

### 1.5 Grid Layout — `grid-cols-2` Mobilde Kırılma Riski

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/dashboard/portal/page.tsx` | 68 | `grid grid-cols-2` — mobilde responsive breakpoint yok | 🟡 Medium | `grid-cols-1 sm:grid-cols-2` yap |
| `app/[locale]/dashboard/portal/page.tsx` | 92 | `grid grid-cols-3` — mobilde 3 sütun daralır | 🔴 High | `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` yap |
| `app/[locale]/dashboard/retry-policy/page.tsx` | 210, 285 | `grid grid-cols-2` — mobilde responsive breakpoint yok | 🟡 Medium | `grid-cols-1 sm:grid-cols-2` yap |
| `app/[locale]/docs/event-types/page.tsx` | 17 | `grid grid-cols-2` — mobilde responsive breakpoint yok | 🟡 Medium | `grid-cols-1 sm:grid-cols-2` yap |
| `app/[locale]/login/page.tsx` | 163 | `grid grid-cols-2` — mobilde responsive breakpoint yok | 🟡 Medium | `grid-cols-1 sm:grid-cols-2` yap |

---

## 2. DARK MODE SORUNLARI

### 2.1 Hardcoded Renkler — `dark:` Variant'ı Eksik

#### Components (Kritik — tüm uygulamayı etkiler)

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `components/ConfirmDialog.tsx` | 101 | `bg-white` — dark mode'da parlak beyaz | 🔴 High | `bg-white dark:bg-slate-900` |
| `components/ConfirmDialog.tsx` | 103 | `text-gray-900` — dark mode'da koyu metin | 🔴 High | `text-gray-900 dark:text-white` |
| `components/ConfirmDialog.tsx` | 106 | `text-gray-600` — dark mode'da okunabilirlik düşük | 🔴 High | `text-gray-600 dark:text-slate-400` |
| `components/ConfirmDialog.tsx` | 111 | `border-gray-300 text-gray-700 hover:bg-gray-50` — dark mode'da kontrast düşük | 🔴 High | `dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800` |
| `components/AuthGuard.tsx` | 19, 30 | `bg-gray-50` — dark mode'da parlak arka plan | 🔴 High | `bg-gray-50 dark:bg-slate-950` |
| `components/AuthGuard.tsx` | 22, 33 | `text-gray-500` — dark mode'da okunabilirlik düşük | 🟡 Medium | `text-gray-500 dark:text-slate-400` |
| `components/ErrorBoundary.tsx` | 35 | `text-gray-900` — dark mode'da koyu metin | 🔴 High | `text-gray-900 dark:text-white` |
| `components/ErrorBoundary.tsx` | 36 | `text-gray-600` — dark mode'da okunabilirlik düşük | 🟡 Medium | `text-gray-600 dark:text-slate-400` |
| `components/LoadingSpinner.tsx` | 30-32, 41, 47 | `bg-gray-200` skeleton'lar — dark mode'da çok parlak | 🔴 High | `bg-gray-200 dark:bg-slate-700` |
| `components/LoadingSpinner.tsx` | 40 | `border-gray-200/50` — dark mode'da.border çizgisi | 🟡 Medium | `border-gray-200/50 dark:border-slate-700/50` |
| `components/LoadingSpinner.tsx` | 43 | `divide-gray-200/50` — dark mode'da divide çizgisi | 🟡 Medium | `divide-gray-200/50 dark:divide-slate-700/50` |
| `components/ThemeToggle.tsx` | 14 | `bg-gray-200 hover:bg-gray-300` — dark mode'da track rengi | 🟡 Medium | `bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600` |
| `components/ThemeToggle.tsx` | 19 | `bg-white` thumb — dark mode'da uyumlu olabilir ama shadow eksik | 🟢 Low | `bg-white dark:bg-slate-200` |

#### Docs Pages — `<thead>` Background

8 docs sayfasında `<thead className="bg-gray-50">` kullanılmış, dark mode'da parlak gri kalacak.

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/docs/self-hosting/page.tsx` | 32 | `bg-gray-50` thead — dark mode'da parlak | 🟡 Medium | `bg-gray-50 dark:bg-slate-800` |
| `app/[locale]/docs/retries/page.tsx` | 19, 71 | `bg-gray-50` thead — dark mode'da parlak | 🟡 Medium | `bg-gray-50 dark:bg-slate-800` |
| `app/[locale]/docs/architecture/page.tsx` | 119 | `bg-gray-50` thead — dark mode'da parlak | 🟡 Medium | `bg-gray-50 dark:bg-slate-800` |
| `app/[locale]/docs/api/page.tsx` | 154 | `bg-gray-50` thead — dark mode'da parlak | 🟡 Medium | `bg-gray-50 dark:bg-slate-800` |
| `app/[locale]/docs/concepts/page.tsx` | 58 | `bg-gray-50` thead — dark mode'da parlak | 🟡 Medium | `bg-gray-50 dark:bg-slate-800` |
| `app/[locale]/docs/page.tsx` | 62 | `bg-gray-50` thead — dark mode'da parlak | 🟡 Medium | `bg-gray-50 dark:bg-slate-800` |
| `app/[locale]/docs/dlq/page.tsx` | 105 | `bg-gray-50` thead — dark mode'da parlak | 🟡 Medium | `bg-gray-50 dark:bg-slate-800` |

### 2.2 Code Block'lar — Hardcoded Dark Background (Tema Uyumsuz)

`bg-gray-900` ile kod blokları her iki temada da koyu arka plan kullanıyor. Bu kasıtlı olabilir (code her zaman koyu), ancak tema geçişinde tutarsızlık yaratır.

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/dashboard/portal-customize/page.tsx` | 360, 386 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Kasıtlı olabilir, `dark:bg-slate-900` ile tutarlılaştır |
| `app/[locale]/dashboard/signature-verifier/page.tsx` | 215 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Aynı |
| `app/[locale]/dashboard/playground/page.tsx` | 212, 668 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Aynı |
| `app/[locale]/dashboard/webhook-builder/page.tsx` | 236 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Aynı |
| `app/[locale]/docs/architecture/page.tsx` | 16 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Aynı |
| `app/[locale]/docs/api/page.tsx` | 221, 228 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Aynı |
| `app/[locale]/docs/page.tsx` | 41 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Aynı |
| `app/[locale]/docs/sdks/page.tsx` | 20, 25, 55, 77, 103 | `bg-gray-900 text-green-400` hardcoded | 🟢 Low | Aynı |

### 2.3 Shadow Dark Mode Uyumu

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `components/ConfirmDialog.tsx` | 101 | `shadow-xl` — dark mode'da gölge fark edilmez | 🟡 Medium | `shadow-xl dark:shadow-2xl dark:shadow-black/30` |
| `components/Toast.tsx` | 38 | `shadow-lg` — dark mode'da gölge fark edilmez | 🟢 Low | `shadow-lg dark:shadow-black/30` |

---

## 3. CSS KALİTESİ

### 3.1 `!important` Kullanımı

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `globals.css` | 23 | `display: none !important` (FOUC prevention) | 🟢 Low | Kabul edilebilir — FOUC önlemi için gerekli |
| `globals.css` | 24 | `display: none !important` (FOUC prevention) | 🟢 Low | Kabul edilebilir — FOUC önlemi için gerekli |

**Not:** `!important` kullanımı sadece FOUC (Flash of Unstyled Content) önlemi için. Bu kabul edilebilir bir kullanım.

### 3.2 Inline Style Kullanımı

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/dashboard/portal-customize/page.tsx` | 294 | `style={{ fontFamily: config.font_family }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `app/[locale]/dashboard/portal-customize/page.tsx` | 299, 325, 328 | `style={{ backgroundColor: config.primary_color }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `app/[locale]/dashboard/billing/page.tsx` | 274 | `style={{ width: \`${usagePercent}%\` }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `app/[locale]/dashboard/retry-policy/page.tsx` | 322 | `style={{ width: ... }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `app/[locale]/dashboard/health/page.tsx` | 156 | `style={{ width: \`${ep.success_rate}%\` }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `app/[locale]/admin/system/page.tsx` | 170 | `style={{ width: ... }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `app/[locale]/admin/page.tsx` | 142 | `style={{ backgroundColor: PLAN_COLORS[...] }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `app/[locale]/status/page.tsx` | 169, 181, 210, 224, 226, 235 | Birden fazla inline style | 🟡 Medium | Bazıları Tailwind class'a dönüştürülebilir |
| `app/[locale]/page.tsx` | 78, 204 | `style={{ height: ... }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `components/Onboarding.tsx` | 129 | `style={{ width: \`${progress}%\` }}` | 🟢 Low | Dinamik değer — inline style kabul edilebilir |
| `components/OnboardingWizard.tsx` | 82, 203, 575 | Birden fazla inline style | 🟡 Medium | Bazıları Tailwind class'a dönüştürülebilir |

### 3.3 Z-Index Sistemi

Mevcut z-index kullanımı:

| Seviye | Kullanım | Durum |
|--------|----------|-------|
| `z-10` | Absolute positioned elementler, badge'ler | ✅ Tutarlı |
| `z-20` | Sayfa içi overlay elementler | ✅ Tutarlı |
| `z-30` | Mobile sidebar overlay, sticky header | ✅ Tutarlı |
| `z-40` | Sidebar (aside) | ✅ Tutarlı |
| `z-50` | Modal/dialog overlay'ler, sticky nav | ✅ Tutarlı |
| `z-[60]` | OnboardingWizard progress bar | 🟡 Özel durum |
| `z-[100]` | Toast notifications | 🟡 Özel durum |

**Değerlendirme:** Z-index sistemi genel olarak tutarlı. `z-[60]` ve `z-[100]` Tailwind config'de tanımlanmalı.

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `components/OnboardingWizard.tsx` | 77 | `z-[60]` — arbitrary value, config'de yok | 🟢 Low | `tailwind.config`'e `zIndex.onboarding: 60` ekle |
| `components/Toast.tsx` | 33 | `z-[100]` — arbitrary value, config'de yok | 🟢 Low | `tailwind.config`'e `zIndex.toast: 100` ekle |

### 3.4 Font Loading

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `globals.css` | - | `@font-face` tanımlı değil, sistem fontu kullanılıyor | 🟢 Low | Özel font kullanılacaksa `font-display: swap` ekle |
| `app/[locale]/layout.tsx` | - | Font loading stratejisi belirsiz | 🟢 Low | `next/font` kullanımı kontrol edilmeli |

**Not:** globals.css'de `@font-face` yok, muhtemelen Tailwind'in varsayılan font ailesi kullanılıyor. FOIT riski düşük.

### 3.5 Color Consistency

Renk paleti genel olarak tutarlı:
- Light mode: `gray-50` → `gray-900` (Tailwind gray scale)
- Dark mode: `slate-950` → `slate-400` (Tailwind slate scale)
- Brand: `brand-400` → `brand-600` (custom)
- Accent: `purple-400` → `purple-600`

| Sorun | Severity | Açıklama |
|-------|----------|----------|
| `bg-gray-900` code blocks her iki temada da aynı | 🟢 Low | Kasıtlı — code her zaman koyu arka plan |
| `text-green-400` code blocks dark mode'da yeterince kontrastlı | 🟢 Low | `green-400` yeterli kontrast sağlıyor |

---

## 4. LAYOUT SORUNLARI

### 4.1 Flexbox/Grid Çakışması

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/dashboard/portal/page.tsx` | 68 | `grid grid-cols-2` mobilde içeriği kırpar | 🟡 Medium | Responsive breakpoint ekle |
| `app/[locale]/dashboard/portal/page.tsx` | 92 | `grid grid-cols-3` mobilde içeriği kırpar | 🔴 High | Responsive breakpoint ekle |

### 4.2 Container Width Tutarlılığı

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/page.tsx` | 269, 316, 369, 388, 393, 429 | `max-w-7xl mx-auto px-6` — tutarlı ✅ | 🟢 Low | Sorun yok |
| `app/[locale]/dashboard/layout.tsx` | 143 | `p-4 md:p-8` — dashboard padding tutarlı ✅ | 🟢 Low | Sorun yok |

**Değerlendirme:** Container genişlik tutarlılığı iyi durumda. Ana sayfa ve dashboard farklı max-width kullanıyor (sayfa yapısına uygun).

### 4.3 Sticky/Fixed Element Sorunları

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `app/[locale]/docs/layout.tsx` | 65 | `sticky top-0 z-50` — docs nav bar | 🟢 Low | Sorun yok, doğru kullanım |
| `app/[locale]/page.tsx` | 268 | `sticky top-0 z-50` — ana sayfa nav bar | 🟢 Low | Sorun yok, doğru kullanım |
| `app/[locale]/dashboard/layout.tsx` | 67, 75 | `fixed` sidebar + overlay | 🟢 Low | Sorun yok, doğru kullanım |

### 4.4 Scroll Behavior

| Dosya | Satır | Sorun | Severity | Çözüm |
|-------|-------|-------|----------|-------|
| `globals.css` | 28 | `scroll-behavior: smooth` tanımlı ✅ | 🟢 Low | Sorun yok |

---

## ÖZET

### Severity Dağılımı

| Severity | Sayı | Açıklama |
|----------|------|----------|
| 🔴 High | 8 | Dark mode'da kırık UI, responsive kırılma |
| 🟡 Medium | 28 | Okunabilirlik sorunları, responsive risk |
| 🟢 Low | 12 | İyileştirme önerileri, kabul edilebilir durumlar |

### Kritik Aksiyonlar (Öncelik Sırasıyla)

1. **ConfirmDialog Dark Mode** — `bg-white`, `text-gray-900`, `text-gray-600`, `border-gray-300` → dark variant'ları ekle (4 dosya, 🔴)
2. **AuthGuard Dark Mode** — `bg-gray-50` → `dark:bg-slate-950` (1 dosya, 🔴)
3. **ErrorBoundary Dark Mode** — `text-gray-900`, `text-gray-600` → dark variant'ları ekle (1 dosya, 🔴)
4. **LoadingSpinner Skeleton Dark Mode** — `bg-gray-200` → `dark:bg-slate-700` (1 dosya, 🔴)
5. **Portal page grid-cols-3** — Mobilde responsive breakpoint ekle (1 dosya, 🔴)
6. **13 Tablo overflow-x-auto** — Wrapper ekle (13 dosya, 🟡)
7. **8 Docs thead bg-gray-50** — Dark variant ekle (8 dosya, 🟡)
8. **3 Modal vh kullanımı** — `dvh` ile değiştir (3 dosya, 🟡)

### İyi Yapılmış Şeyler ✅

- `globals.css` dark mode CSS variable'ları tutarlı
- Dashboard layout dark mode variant'ları eksiksiz
- Z-index sistemi genel olarak tutarlı (10→20→30→40→50)
- `scroll-behavior: smooth` tanımlı
- `overflow-x-auto` çoğu tablo ve pre bloğunda mevcut
- `break-all` uzun URL/token'lar için doğru kullanılmış
- Glass card, gradient-text, hover-lift gibi reusable component'ler dark mode destekli
- Skeleton shimmer animasyonu dark mode'da farklı opacity kullanıyor
- Focus ring'ler dark mode'da doğru renk offset'i kullanıyor
