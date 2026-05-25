# WCAG Accessibility Audit — HookSniff Admin Panel

**Tarih:** 2026-05-10  
**Sayfalar:** Overview, Users, Revenue, System, Settings  
**Mod:** Light mode + Dark mode (contrast analizi tamamlandı) + Mobil erişilebilirlik

---

## A. HEADING HIERARCHY (WCAG 1.3.1 - Info and Relationships)

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| Birden fazla h1 var mı? | ❌ | **Tüm sayfalarda 2 tane h1 var** — biri sidebar sayfa başlığı ("Overview", "Users", "Settings"), diğeri main içerik başlığı ("Admin Overview", "Kullanıcı Yönetimi", "Platform Ayarları"). Sidebar başlığı h1 yerine `aria-label` veya farklı bir element olmalı. |
| h1 → h2 → h3 sırası doğru mu? | ✅ | Overview: h1 → h2 ("Plana Göre Kullanıcılar", "Son Kayıtlar"). Settings: h1 → h2 ("Genel", "Plan Limitleri") → h3 ("Ücretsiz Plan", "Pro Plan"). Atlama yok. |
| Skipping levels (atlama) | ✅ | h1'den h2'ye, h2'den h3'e geçişlerde atlama tespit edilmedi. |

---

## B. ARIA LANDMARKS (WCAG 1.3.1 - Info and Relationships)

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| `<main>` / role="main" | ✅ | Tüm sayfalarda mevcut (semantic `<main>` elementi). |
| `<nav>` / role="navigation" | ✅ | Sidebar navigation mevcut (`<nav>` elementi). |
| `<aside>` / role="complementary" | ✅ | Sidebar `<aside>` olarak tanımlanmış. |
| `<header>` / role="banner" | ✅ | Üst bar `<header>` elementi. |
| `<footer>` / role="contentinfo" | ❌ | **Tüm sayfalarda footer/contentinfo eksik.** Sayfanın alt kısmında copyright, link veya bilgi alanı yok. |
| Skip-to-content link | ❌ | **Skip navigation link'i yok.** Klavye kullanıcıları her sayfada tüm sidebar linklerinden geçmek zorunda. |

---

## C. FORM LABELS (WCAG 1.3.1, 3.3.2 - Labels or Instructions)

### Users Sayfası

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| Search input label | ❌ | "E-posta veya isimle ara..." sadece placeholder olarak var. `<label>`, `aria-label` veya `aria-labelledby` yok. Placeholder erişilebilirlik için yeterli değildir. |
| Select (plan filter) label | ❌ | "Tüm planlar" select'i için `<label>` veya `aria-label` yok. |
| Select (status filter) label | ❌ | "Tüm durumlar" select'i için `<label>` veya `aria-label` yok. |
| Input ID'leri | ❌ | Hiçbir input'un `id`'si yok → `htmlFor` ile label bağlanması mümkün değil. |

### Settings Sayfası

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| Default Plan select label | ❌ | Select elementi için `<label>` veya `aria-label` yok. |
| Max Endpoints input (Free) | ❌ | `<label>` veya `aria-label` yok. Yakınında "Max Endpoints" metni var ama programatik bağlantı yok. |
| Max Webhooks/Month input (Free) | ❌ | Aynı sorun — visible text var ama label bağlantısı yok. |
| Rate Limit input (Free) | ❌ | Aynı sorun. |
| Retention input (Free) | ❌ | Aynı sorun. |
| Max Endpoints input (Pro) | ❌ | Aynı sorun. |
| Max Webhooks/Month input (Pro) | ❌ | Aynı sorun. |
| Rate Limit input (Pro) | ❌ | Aynı sorun. |
| Retention input (Pro) | ❌ | Aynı sorun. |
| Max Retry Attempts input | ❌ | Aynı sorun. Yakınında açıklama metni var ama label bağlantısı yok. |
| Required field işaretleri | ⚠️ | Hiçbir input `required` olarak işaretli değil. Form veri doğrulama varsa bile screen reader kullanıcıları hangi alanların zorunlu olduğunu bilemez. |

**Not:** Settings sayfasında 10 adet number input ve 1 adet select var. Hiçbirinde programatik label bağlantısı yok. Tüm input'ların `id`'si boş.

---

## D. COLOR CONTRAST (WCAG 1.4.3 - Contrast Minimum)

### Light Mode Renk Analizi

> **Not:** Admin panelinde tüm `text-gray-*` ve `text-slate-*` sınıfları `dark:` variant ile birlikte kullanılır. Light mode'da düşük kontrastlı sınıflar sadece `text-gray-400` olarak tespit edildi. `text-slate-400` light mode'da hiç kullanılmıyor.

| Sınıf | Hex | Beyaz zemin oranı | AA Normal (4.5:1) | AA Large (3:1) | Durum |
|-------|-----|-------------------|-------------------|-----------------|-------|
| `text-gray-400` | #9ca3af | 2.54:1 | ❌ | ❌ | **FAIL — hem normal hem large** |
| `text-gray-500` | #6b7280 | 4.83:1 | ✅ | ✅ | Geçer |
| `text-gray-600` | #4b5563 | 7.47:1 | ✅ | ✅ | Geçer |
| `text-gray-700` | #374151 | 10.34:1 | ✅ | ✅ | Geçer |
| `text-slate-400` | #94a3b8 | — | — | — | Light mode'da kullanılmıyor |
| `text-slate-500` | #64748b | — | — | — | Light mode'da kullanılmıyor |

**Etkilenen elementler (light mode — `text-gray-400`):**
- System: Latency scale labels: `text-xs text-gray-400` → 2.54:1 ❌
- System: Infrastructure label: `text-xs text-gray-400` → 2.54:1 ❌
- Revenue: "(X users)" plan count: `text-xs text-gray-400` → 2.54:1 ❌

> **Kritik:** `text-gray-400` light mode'da beyaz zeminde sadece 2.54:1 — AA Large standardını bile geçemiyor.

---

## E. TOGGLE / ROLE (WCAG 4.1.2 - Name, Role, Value)

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| Dark mode toggle: role="switch" | ❌ | Toggle butonu `<button>` olarak render ediliyor ama `role="switch"` yok. |
| Dark mode toggle: aria-checked | ❌ | `aria-checked` attribute'u yok. Screen reader butonun durumunu (açık/kapalı) okuyamaz. |
| Dark mode toggle: aria-label | ✅ | `aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}` doğru tanımlanmış. |
| Bakım Modu toggle: role="switch" | ❌ | Settings sayfasında toggle butonu `role="switch"` yok. |
| Bakım Modu toggle: aria-checked | ❌ | `aria-checked` yok. |
| Kayıtlar Etkin toggle: role="switch" | ❌ | Aynı sorun. |
| Kayıtlar Etkin toggle: aria-checked | ❌ | `aria-checked` yok. |
| Toggle butonları: accessible name | ❌ | Settings'teki 2 toggle butonu (`rounded-full` class'lı) boş text'e sahip ve `aria-label` yok. Screen reader bu butonların ne işe yaradığını bilemez. |

---

## F. TABLE ACCESSIBILITY (WCAG 1.3.1) — Tamamlanan

### Users Sayfası Tablosu

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| `<table>` semantic HTML | ✅ | `<table>` elementi doğru kullanılmış, `role` belirtilmemiş (bu doğru — semantic HTML varsayılan role'ü alır). |
| `<thead>` / `<tbody>` ayrımı | ✅ | `<thead>` ve `<tbody>` doğru ayrılmış. |
| `<th>` scope="col" | ❌ | **7 column header'ın hiçbirinde `scope="col"` yok.** Screen reader, header'ların sütun mu satır mı olduğunu belirleyemez. |
| Table `<caption>` | ❌ | Tablonun `<caption>` elementi yok. Screen reader tablonun ne hakkında olduğunu bilemez. |
| `aria-label` / `aria-describedby` | ❌ | `<table>` üzerinde `aria-label` veya `aria-describedby` yok. |
| Header text content | ✅ | Tüm `<th>` elementleri anlamlı text içeriyor (ID, Email, Name, Plan, Status, Created, Actions). |
| Table responsive (overflow-x-auto) | ✅ | `<div className="overflow-x-auto">` ile mobilde yatay kaydırma sağlanmış. |

**Düzeltme Önerisi:**
```jsx
<table className="w-full" aria-label="Kullanıcı listesi">
  <caption className="sr-only">Tüm kullanıcıların listesi, plan ve durum bilgileriyle</caption>
  <thead>
    <tr>
      <th scope="col" className="...">ID</th>
      <th scope="col" className="...">Email</th>
      {/* ... diğer header'lar */}
    </tr>
  </thead>
```

---

## G. EK BULGULAR — Tamamlanan

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| `<html lang="tr">` | ✅ | Root layout'ta `lang` attribute doğru ayarlanmış. |
| Page title | ✅ | "HookSniff — Webhook Delivery Service" — anlamlı ve tanımlayıcı. |
| Image alt text | ✅ | Admin panelinde `<img>` elementi bulunmuyor (ikonlar emoji veya SVG). `ThemeToggle`'daki SVG'ler decorative — erişilebilirlik sorunu yok. |
| Skip navigation link | ❌ | **Hiçbir sayfada skip-to-content link'i yok.** Klavye kullanıcıları her sayfada tüm sidebar linklerinden geçmek zorunda (5 nav linki + "Back to Dashboard" + ThemeToggle). |
| Focus indicators | ✅ (CSS mevcut) | `globals.css`'de `*:focus-visible { @apply outline-none ring-2 ring-brand-500 ring-offset-2; }` tanımlanmış. **Ancak raporlama sırasında tespit edilememiş olabilir** — Tailwind'in `ring-brand-500` class'ı doğru çalışıyorsa focus göstergeleri mevcut. Test gereklidir. |
| `ThemeToggle` aria-label | ✅ | `aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}` doğru tanımlanmış. |
| Modal focus trap | ❌ | Plan Change Modal'ı açıkken focus modal dışına çıkabilir. `inert` attribute veya focus trap kütüphanesi yok. |
| Modal kapatma (Escape) | ❌ | Modal sadece backdrop click ile kapanıyor. Escape tuşu ile kapatma desteği yok. |
| StatCard trend SVG | ⚠️ | Trend ok ikonları (↗↘) decorative — `aria-hidden="true"` eksik. Screen reader anlamsız SVG path'i okuyabilir. |
| StatCard trend label contrast | ❌ | `text-xs text-gray-400 dark:text-slate-500` trend.label metni — dark mode'da 3.75:1 (FAIL). WCAG 1.4.3 Level AA. |
| StatusBadge | ✅ | Renkli dot + metinsel status birlikte kullanılıyor. Sadece renk bağımlı değil. |

---

## H. DARK MODE CONTRAST (WCAG 1.4.3)

### Dark Mode Renk Analizi

Dark mode arka planları:
- **Primary bg:** `#0f172a` (slate-950) — `<div className="min-h-screen bg-gray-50 dark:bg-slate-950">`
- **Card bg:** `#1e293b` (slate-900) — `<aside>`, `<header>`, `.glass-card`
- **Input bg:** `#1e293b` (slate-800) — `dark:bg-slate-800`

| Sınıf | Hex | slate-950 (#0f172a) oranı | slate-900 (#1e293b) oranı | AA Normal (4.5:1) | AA Large (3:1) | Durum |
|-------|-----|---------------------------|---------------------------|-------------------|-----------------|-------|
| `text-white` | #ffffff | 15.36:1 | 13.13:1 | ✅ | ✅ | Geçer |
| `text-gray-900 dark:text-white` | #ffffff | 15.36:1 | 13.13:1 | ✅ | ✅ | Geçer |
| `text-slate-300` | #cbd5e1 | 9.40:1 | 8.03:1 | ✅ | ✅ | Geçer |
| `text-slate-400` | #94a3b8 | 6.96:1 | 5.71:1 | ✅ | ✅ | Geçer |
| `text-gray-500 dark:text-slate-400` | #94a3b8 | 6.96:1 | 5.71:1 | ✅ | ✅ | Geçer |
| `text-gray-400 dark:text-slate-500` | #64748b | 3.75:1 | 3.07:1 | ❌ | ✅ | **Normal text için FAIL** |
| `text-slate-500` | #64748b | 3.75:1 | 3.07:1 | ❌ | ✅ | **Normal text için FAIL** |
| `text-gray-500` (dark mode'da slate-400'e maplenmemiş) | #6b7280 | 3.69:1 | 3.03:1 | ❌ | ✅ | **Normal text için FAIL** |

### Etkilenen Elementler (Dark Mode)

**`text-gray-400 dark:text-slate-500` (#64748b) — FAIL (3.75:1 on slate-950, 3.07:1 on slate-900):**

Admin panelinde tüm kullanımlar `text-gray-400 dark:text-slate-500` şeklindedir (light mode'da gray-400, dark mode'da slate-500).

- Loading spinner text: "Loading users..."
- Empty state text: "No users found."
- "No recent signups" mesajı
- Retry açıklaması: `{t('retryDesc')}`
- Tarih bilgisi (Recent Signups): `text-[11px] text-gray-400 dark:text-slate-500`
- System: Latency scale labels: `text-xs text-gray-400 dark:text-slate-500`
- System: Infrastructure label: `text-xs text-gray-400 dark:text-slate-500`
- Revenue: "(X users)" plan count: `text-xs text-gray-400 dark:text-slate-500`

> **Not:** Bu elementler light mode'da da `text-gray-400` (#9ca3af) kullanır → 2.54:1 FAIL. Yani hem light hem dark mode'da kontrast sorunu var.

**Düzeltme Önerisi:**
- `text-gray-400 dark:text-slate-500` yerine `text-gray-500 dark:text-slate-400` kullanın:
  - Light mode: gray-500 (#6b7280) on white = 4.83:1 ✅
  - Dark mode: slate-400 (#94a3b8) on slate-950 = 6.96:1 ✅

---

## I. MOBİL ERİŞİLEBİLİRLİK (WCAG 2.5.5 - Target Size)

### Touch Target Analizi (Minimum 44×44px — WCAG 2.5.5 Level AAA / 24×24px Level AA)

| Element | Tahmini Boyut | AA (24px) | AAA (44px) | Açıklama |
|---------|---------------|-----------|------------|----------|
| Hamburger menu butonu | 40×40px (p-2 + w-6 h-6 icon) | ✅ | ⚠️ | `p-2` (8px) + `w-6 h-6` (24px) = 40px. AAA için yetersiz. |
| Sidebar nav linkleri | ~280×40px | ✅ | ✅ | Tam genişlik, `py-2.5` yeterli yükseklik. |
| "Back to Dashboard" linki | ~280×40px | ✅ | ✅ | Tam genişlik sidebar linki. |
| ThemeToggle | 64×36px (w-16 h-9) | ✅ | ⚠️ | Genişlik yeterli ama yükseklik 36px — AAA için 44px olmalı. |
| Search input | fullWidth × 40px (py-2.5) | ✅ | ⚠️ | `py-2.5` = 10px padding + ~20px text = ~40px. AAA için yetersiz. |
| Select (plan/status filter) | fullWidth × 40px | ✅ | ⚠️ | Aynı sorun. |
| Table "View" linki | ~30×20px | ❌ | ❌ | `text-xs` (12px) + minimal padding. **Çok küçük touch target.** |
| Table "Plan" butonu | ~30×20px | ❌ | ❌ | Aynı sorun. |
| Table "Ban/Activate" butonu | ~50×20px | ❌ | ❌ | `text-xs` font-medium, padding yok. |
| Pagination butonları | ~80×32px (px-3 py-1.5) | ✅ | ⚠️ | `py-1.5` = 6px padding + ~20px text = ~32px. |
| Modal "Cancel" butonu | ~80×36px (px-4 py-2.5) | ✅ | ⚠️ | Yükseklik 36px. |
| Modal "Update Plan" butonu | ~120×36px | ✅ | ⚠️ | Aynı. |
| Settings toggle butonları | 44×24px (w-11 h-6) | ✅ | ❌ | Genişlik 44px ama **yükseklik sadece 24px.** |
| Settings number input'ları | fullWidth × 36px (py-2) | ✅ | ⚠️ | `py-2` = 8px padding + ~20px text = ~36px. |
| Logout butonu | ~50×20px | ❌ | ❌ | `text-sm` minimal padding. **Çok küçük.** |

### Mobil Viewport Sorunları

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| Responsive layout | ✅ | `md:` breakpoint'leri ile sidebar mobilde gizleniyor, içerik tam genişlik alıyor. |
| Sidebar mobil erişimi | ✅ | Hamburger menu ile açılır/kapanır sidebar. Overlay backdrop mevcut. |
| Table horizontal scroll | ✅ | `overflow-x-auto` ile tablo mobilde kaydırılabilir. |
| Modal responsive | ✅ | `max-w-sm w-full mx-4` ile mobilde uygun boyut. |
| Grid responsive | ✅ | `grid-cols-1 md:grid-cols-4` gibi responsive grid'ler mevcut. |
| Font boyutu mobilde | ⚠️ | `text-xs` (12px) tablo header'ları ve action linkleri mobilde okunması zor. Minimum 14px önerilir. |
| Sidebar kapatma | ⚠️ | Sidebar açıkken overlay'e tıklayarak kapanıyor ama **Escape tuşu ile kapatma desteği yok.** |

---

## J. REVENUE SAYFASI (WCAG 1.3.1, 1.1.1)

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| İki h1 | ❌ | Layout header h1 ("Revenue") + sayfa h1 ("Revenue Dashboard"). Aynı sorun. |
| Chart erişilebilirliği | ❌ | BarChart ve PieChart (Recharts) SVG olarak render ediliyor. Screen reader'a tablo/veri alternatifi sunulmuyor. `aria-label`, `<caption>` veya gizli `<table>` alternatifi yok. WCAG 1.1.1 Level A ihlali. |
| Plan dağılımı text kontrastı | ❌ | `text-xs text-gray-400 dark:text-slate-500` "(X users)" metni — dark mode'da ~3.5:1. WCAG 1.4.3 Level AA. |
| Tooltip erişilebilirliği | ⚠️ | Recharts Tooltip fare üzerine gelince gösteriliyor ama klavye ile erişilebilir değil. |
| Emoji ikonları | ⚠️ | 💰📈📉 emoji ikonları decorative olmalı — `aria-hidden="true"` veya `role="img"` + `aria-label` yok. |

---

## K. SYSTEM SAYFASI (WCAG 1.3.1, 1.4.1, 4.1.2)

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| İki h1 | ❌ | Layout header h1 ("System") + sayfa h1 ("System Health"). Aynı sorun. |
| Status dot: sadece renk | ❌ | Servis durumu sadece renkli nokta ile gösteriliyor (🟢🟡🔴). `text-green-700`, `text-yellow-700`, `text-red-700` renk bağımlı. Metinsel status etiketi var ("healthy"/"degraded") ama **dot renk bilgisi `aria-label` ile desteklenmemiş.** WCAG 1.4.1 Level A ihlali. |
| Progress bar: aria eksik | ❌ | Latency bar'ı `<div>` ile render ediliyor. `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` yok. WCAG 4.1.2 Level A ihlali. |
| Auto-refresh bildirimi | ⚠️ | Sayfa 15 saniyede bir otomatik yenileniyor ama screen reader'a `aria-live` region ile bildirim yapılmıyor. İçerik değişikliği sessizce gerçekleşiyor. |
| Emoji ikonları | ⚠️ | 🚀🐘⚡📬 emoji ikonları decorative — `aria-hidden="true"` eksik. |
| Infrastructure kartları | ⚠️ | 6 altyapı kartında label/value/detail var ama yapılandırılmış tablo veya liste olarak sunulmuyor. |

---

## GÜNCELLENMİŞ ÖZET — Kritik Sorunlar (Öncelik Sırasıyla)

1. **❌ Form labels eksik (13+ input)** — Screen reader kullanıcıları form alanlarını kullanamaz. WCAG 3.3.2 Level A ihlali.
2. **❌ Toggle role="switch" + aria-checked eksik (3 toggle)** — Screen reader buton durumunu okuyamaz. WCAG 4.1.2 Level A ihlali.
3. **❌ scope="col" eksik (7 header)** — Tablo yapısı screen reader'a düzgün aktarılmaz. WCAG 1.3.1 Level A ihlali.
4. **❌ Table caption/aria-label eksik** — Tablonun amacı screen reader'a aktarılamıyor. WCAG 1.3.1 Level A ihlali.
5. **❌ İki h1 (tüm sayfalar — 5/5)** — Sayfa yapısı kafa karıştırıcı. WCAG 1.3.1 Level A ihlali.
6. **❌ Chart erişilebilirliği yok (Overview + Revenue)** — SVG chart'lar screen reader'a veri alternatifi sunmuyor. WCAG 1.1.1 Level A ihlali.
7. **❌ Progress bar aria eksik (System)** — Latency bar'ı semantic role ve value attribute'larından yoksun. WCAG 4.1.2 Level A ihlali.
8. **❌ Status dot sadece renk bağımlı (System)** — Renk körlüğü olan kullanıcılar durumu ayırt edemez. WCAG 1.4.1 Level A ihlali.
9. **❌ Light mode: text-gray-400 kontrast KRİTİK (2.54:1)** — Beyaz zeminde okunamaz. System/Revenue sayfalarında label ve scale text'leri etkilenir. WCAG 1.4.3 Level AA ihlali.
10. **❌ Dark mode: text-slate-500 kontrast yetersiz (3.75:1)** — Loading/empty state text'leri okunamıyor. WCAG 1.4.3 Level AA ihlali.
11. **❌ contentinfo/footer eksik** — Landmark yapısı eksik. WCAG 1.3.1 Level A.
12. **❌ Skip navigation link'i yok** — Klavye kullanıcıları için erişim zorluğu. WCAG 2.4.1 Level A.
13. **❌ Table action link/button touch target çok küçük (~20px)** — Mobilde tıklanması zor. WCAG 2.5.5 Level AA ihlali.
14. **❌ Modal focus trap eksik** — Focus modal dışına çıkabilir. WCAG 2.4.3 Level A ihlali.
15. **⚠️ Focus indicator — CSS mevcut ama doğrulanmalı** — `globals.css`'de `*:focus-visible` tanımlı. WCAG 2.4.7 Level AA.
16. **⚠️ Auto-refresh aria-live eksik (System)** — 15s otomatik yenileme screen reader'a bildirilmiyor.
17. **⚠️ Emoji ikonları decorative değil** — Tüm sayfalarda emoji ikonlarına `aria-hidden="true"` eklenmeli.

**Level A ihlali sayısı: 11** (form labels, toggle, scope, caption, h1, chart, progress bar, color-only, footer, skip nav, modal focus trap)
**Level AA ihlali sayısı: 4** (light mode kontrast, dark mode kontrast, touch targets, focus indicator)
**Uyarı sayısı: 3** (auto-refresh, emoji, focus doğrulama)
