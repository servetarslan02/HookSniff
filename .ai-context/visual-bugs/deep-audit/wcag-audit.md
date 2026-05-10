# WCAG Accessibility Audit — HookSniff Admin Panel

**Tarih:** 2026-05-10  
**Sayfalar:** Overview, Users, Settings  
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

| Sınıf | RGB Değeri | Beyaz zemin oranı | AA Normal (4.5:1) | AA Large (3:1) | Durum |
|-------|------------|-------------------|-------------------|-----------------|-------|
| `text-gray-400` | rgb(100, 116, 139) | ~5.4:1 | ✅ | ✅ | Geçer |
| `text-gray-500` | rgb(148, 163, 184) | ~3.5:1 | ❌ | ✅ | **Normal text için FAIL** |
| `text-slate-400` | rgb(148, 163, 184) | ~3.5:1 | ❌ | ✅ | **Normal text için FAIL** |
| `text-slate-500` | rgb(100, 116, 139) | ~5.4:1 | ✅ | ✅ | Geçer |

**Etkilenen elementler:**
- `text-gray-500`: "HookSniff Management", form açıklamaları ("Tüm API endpoint'lerini geçici olarak devre dışı bırak", "Yeni kullanıcı kayıtlarına izin ver"), field label'ları ("Max Endpoints", "Max Webhooks/Month", "Rate Limit", "Retention"), email adresi
- `text-slate-400`: Sidebar link label'ları ("Overview", "Users", "Revenue", "System"), "Back to Dashboard", "Configure platform-wide defaults..."

**12px font-size'taki text-gray-500 elementleri özellikle riskli** — küçük metin + düşük kontrast birleşimi.

---

## E. TOGGLE / ROLE (WCAG 4.1.2 - Name, Role, Value)

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| Dark mode toggle: role="switch" | ❌ | Toggle butonu `<button>` olarak render ediliyor ama `role="switch"` yok. |
| Dark mode toggle: aria-checked | ❌ | `aria-checked` attribute'u yok. Screen reader butonun durumunu (açık/kapalı) okuyamaz. |
| Dark mode toggle: aria-label | ❌ | Buton boş text'e sahip ve `aria-label` yok. Sadece `img` child var (ikon). |
| Bakım Modu toggle: role="switch" | ❌ | Settings sayfasında toggle butonu `role="switch"` yok. |
| Bakım Modu toggle: aria-checked | ❌ | `aria-checked` yok. |
| Kayıtlar Etkin toggle: role="switch" | ❌ | Aynı sorun. |
| Kayıtlar Etkin toggle: aria-checked | ❌ | `aria-checked` yok. |
| Toggle butonları: accessible name | ❌ | Settings'teki 2 toggle butonu (`rounded-full` class'lı) boş text'e sahip ve `aria-label` yok. Screen reader bu butonların ne işe yaradığını bilemez. |

---

## F. TABLE ACCESSIBILITY (WCAG 1.3.1)

### Users Sayfası Tablosu

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| `<th>` scope="col" | ❌ | **7 column header'ın hiçbirinde scope="col" yok** (ID, Email, Name, Plan, Status, Created, Actions). |
| Table caption/aria-label | ❌ | Tablonun `<caption>` elementi veya `aria-label` attribute'u yok. |
| Table role | ⚠️ | `<table>` elementi semantic HTML kullanıyor (role belirtilmemiş, bu doğru). |

---

## G. EK BULGULAR

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| `<html lang>` | ✅ | `lang="tr"` doğru ayarlanmış. |
| Page title | ✅ | "HookSniff — Webhook Delivery Service" — anlamlı ve tanımlayıcı. |
| Image alt text | ✅ | Tüm img elementlerinde alt veya aria-label mevcut. |
| Skip navigation link | ❌ | Hiçbir sayfada skip-to-content link'i yok. |
| Focus indicators | ⚠️ | İlk odaklanabilir elementte outline tespit edilemedi — CSS ile kaldırılmış olabilir. Klavye navigasyonu için kritik. |

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

---

## H. DARK MODE CONTRAST (WCAG 1.4.3)

### Dark Mode Renk Analizi

Dark mode arka planları:
- **Primary bg:** `#0f172a` (slate-950) — `<div className="min-h-screen bg-gray-50 dark:bg-slate-950">`
- **Card bg:** `#1e293b` (slate-900) — `<aside>`, `<header>`, `.glass-card`
- **Input bg:** `#1e293b` (slate-800) — `dark:bg-slate-800`

| Sınıf | RGB Değeri | slate-950 (#0f172a) oranı | slate-900 (#1e293b) oranı | AA Normal (4.5:1) | AA Large (3:1) | Durum |
|-------|------------|---------------------------|---------------------------|-------------------|-----------------|-------|
| `text-white` | #ffffff | ~15.4:1 | ~13.1:1 | ✅ | ✅ | Geçer |
| `text-gray-900 dark:text-white` | #ffffff | ~15.4:1 | ~13.1:1 | ✅ | ✅ | Geçer |
| `text-slate-300` | #cbd5e1 | ~9.4:1 | ~8.0:1 | ✅ | ✅ | Geçer |
| `text-slate-400` | #94a3b8 | ~5.9:1 | ~5.0:1 | ✅ | ✅ | Geçer |
| `text-gray-500 dark:text-slate-400` | #94a3b8 | ~5.9:1 | ~5.0:1 | ✅ | ✅ | Geçer |
| `text-gray-400 dark:text-slate-500` | #64748b | ~3.5:1 | ~3.0:1 | ❌ | ✅ | **Normal text için FAIL** |
| `text-slate-500` | #64748b | ~3.5:1 | ~3.0:1 | ❌ | ✅ | **Normal text için FAIL** |
| `text-gray-400` (dark mode'da slate-500'e maplenmemiş) | #9ca3af | ~4.6:1 | ~3.9:1 | ⚠️ | ✅ | **Sınırda — kart bg üzerinde FAIL** |

### Etkilenen Elementler (Dark Mode)

**`text-gray-400 dark:text-slate-500` (FAIL — ~3.5:1):**
- Loading spinner text: "Loading users..."
- Empty state text: "No users found."
- "No recent signups" mesajı
- Retry açıklaması: `{t('retryDesc')}`
- Tarih bilgisi (Recent Signups): `text-[11px] text-gray-400 dark:text-slate-500`

**`text-slate-500` (FAIL — ~3.5:1):**
- Logout butonu: `text-gray-400 dark:text-slate-500`
- Pagination disabled durumu
- Placeholder text'ler (bazı input'larda)

**⚠️ Sınırda (card bg üzerinde ~3.9:1):**
- `text-gray-400` dark mode'da slate-500'e maplenmemiş kullanımlar

**Düzeltme Önerisi:**
- `text-slate-500` (#64748b) yerine `text-slate-400` (#94a3b8) kullanın → ~5.9:1 kontrast sağlar.
- Veya custom renk: `text-[#7c8da4]` → ~4.5:1 minimum kontrastı karşılar.

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

## GÜNCELLENMİŞ ÖZET — Kritik Sorunlar (Öncelik Sırasıyla)

1. **❌ Form labels eksik (13+ input)** — Screen reader kullanıcıları form alanlarını kullanamaz. WCAG 3.3.2 Level A ihlali.
2. **❌ Toggle role="switch" + aria-checked eksik (4 toggle)** — Screen reader buton durumunu okuyamaz. WCAG 4.1.2 Level A ihlali.
3. **❌ scope="col" eksik (7 header)** — Tablo yapısı screen reader'a düzgün aktarılmaz. WCAG 1.3.1 Level A ihlali.
4. **❌ Table caption/aria-label eksik** — Tablonun amacı screen reader'a aktarılamıyor. WCAG 1.3.1 Level A ihlali.
5. **❌ İki h1 (tüm sayfalar)** — Sayfa yapısı kafa karıştırıcı. WCAG 1.3.1 Level A ihlali.
6. **❌ text-slate-500 dark mode kontrast yetersiz (~3.5:1)** — Loading/empty state text'leri okunamıyor. WCAG 1.4.3 Level AA ihlali.
7. **❌ contentinfo/footer eksik** — Landmark yapısı eksik. WCAG 1.3.1 Level A.
8. **❌ Skip navigation link'i yok** — Klavye kullanıcıları için erişim zorluğu. WCAG 2.4.1 Level A.
9. **❌ Table action link/button touch target çok küçük (~20px)** — Mobilde tıklanması zor. WCAG 2.5.5 Level AA ihlali.
10. **❌ Settings toggle buton yüksekliği 24px** — AAA touch target karşılanmıyor. WCAG 2.5.5 Level AAA ihlali.
11. **❌ Modal focus trap eksik** — Focus modal dışına çıkabilir. WCAG 2.4.3 Level A ihlali.
12. **⚠️ Focus indicator — CSS mevcut ama doğrulanmalı** — `globals.css`'de `*:focus-visible` tanımlı. WCAG 2.4.7 Level AA.

**Level A ihlali sayısı: 8** (önceki 6'ya +2: table caption, modal focus trap)
**Level AA ihlali sayısı: 3** (önceki 2'ye +1: touch targets)
**Level AAA ihlali sayısı: 1** (toggle buton yüksekliği)
