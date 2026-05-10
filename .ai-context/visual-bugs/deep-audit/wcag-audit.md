# WCAG Accessibility Audit — HookSniff Admin Panel

**Tarih:** 2026-05-10  
**Sayfalar:** Overview, Users, Settings  
**Mod:** Light mode (dark mode ayrıca test edilmedi)

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

## ÖZET — Kritik Sorunlar (Öncelik Sırasıyla)

1. **❌ Form labels eksik (13+ input)** — Screen reader kullanıcıları form alanlarını kullanamaz. WCAG 3.3.2 Level A ihlali.
2. **❌ Toggle role="switch" + aria-checked eksik (4 toggle)** — Screen reader buton durumunu okuyamaz. WCAG 4.1.2 Level A ihlali.
3. **❌ scope="col" eksik (7 header)** — Tablo yapısı screen reader'a düzgün aktarılmaz. WCAG 1.3.1 Level A ihlali.
4. **❌ İki h1 (tüm sayfalar)** — Sayfa yapısı kafa karıştırıcı. WCAG 1.3.1 Level A ihlali.
5. **❌ text-gray-500 / text-slate-400 kontrast yetersiz (~3.5:1)** — Normal text AA standardını geçemiyor. WCAG 1.4.3 Level AA ihlali.
6. **❌ contentinfo/footer eksik** — Landmark yapısı eksik. WCAG 1.3.1 Level A.
7. **❌ Skip navigation link'i yok** — Klavye kullanıcıları için erişim zorluğu. WCAG 2.4.1 Level A.
8. **⚠️ Focus indicator eksik** — Klavye navigasyonu görünür değil. WCAG 2.4.7 Level AA.

**Level A ihlali sayısı: 6**  
**Level AA ihlali sayısı: 2**
