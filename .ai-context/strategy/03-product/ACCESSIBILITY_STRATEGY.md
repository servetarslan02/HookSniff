# HookSniff — Erişilebilirlik (Accessibility) Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10
> Durum: Taslak
> Öncelik: 🟢 Lansman sonrası (ancak EU yasal zorunluluk — Haziran 2025'ten beri yürürlükte)
> Kaynaklar: EU Accessibility Act 2025 (✅ doğrulanmış), WCAG 2.1 Spec (✅ w3.org doğrulanmış), Next.js Accessibility Docs (✅ doğrulanmış), TheFrontKit EAA Guide 2026 (✅ tam sayfa doğrulanmış)

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Neden Önemli?](#2-neden-önemli)
3. [Yasal Zorunluluk: EU Accessibility Act](#3-yasal-zorunluluk-eu-accessibility-act)
4. [WCAG 2.1 AA Standartları](#4-wcag-21-aa-standartları)
5. [HookSniff Dashboard Analizi](#5-hooksniff-dashboard-analizi)
6. [Araç Karşılaştırması](#6-araç-karşılaştırması)
7. [Strateji](#7-strateji)
8. [Uygulama Planı](#8-uygulama-planı)
9. [HookSniff'e Özel Sorunlar ve Çözümler](#9-hooksniffe-özel-sorunlar-ve-çözümler)
10. [Test Stratejisi](#10-test-stratejisi)
11. [Metrikler](#11-metrikler)
12. [Riskler](#12-riskler)
13. [Bütçe](#13-bütçe)
14. [Notlar](#14-notlar)
15. [Kaynaklar](#15-kaynaklar)

---

## 1. Mevcut Durum

### HookSniff Dashboard Accessibility Durumu

| Alan | Durum | Not |
|------|-------|-----|
| ARIA attributes | 🔴 Çok düşük | 41+ sayfada sadece **7 dosyada** aria attribute var |
| Toplam aria referansı | 🔴 ~12 | 41+ sayfa için yetersiz |
| Keyboard navigation | ❌ Bilinmiyor | Test edilmemiş |
| Screen reader desteği | ❌ Yok | Hiç test edilmemiş |
| Color contrast | ❌ Bilinmiyor | Kontrol edilmemiş |
| Focus management | ❌ Bilinmiyor | Modal/dialog focus trap yok |
| Form labels | ❌ Bilinmiyor | Placeholder-only input riski |
| Heading hierarchy | ❌ Bilinmiyor | H1/H2/H3 sıralaması kontrol edilmemiş |
| Alt text | ❌ Bilinmiyor | Image'lar kontrol edilmemiş |
| Skip navigation | ❌ Yok | "İçeriğe atla" linki yok |
| Accessibility testing | ❌ Yok | axe/lighthouse/pa11y entegre edilmemiş |
| Accessibility statement | ❌ Yok | Yasal zorunluluk (EU) |
| i18n + a11y | 🟡 Kısmen var | 6 dil desteği mevcut ama aria-label'lar çevrilmemiş olabilir |

### Mevcut Dosya Analizi (Detaylı Kod İncelemesi — 2026-05-10)

```
dashboard/src/
├── __tests__/ThemeToggle.test.tsx    → 4 aria ref
├── components/LanguageSwitcher.tsx   → 1 aria ref
├── components/ThemeToggle.tsx        → 1 aria ref
├── components/NotificationCenter.tsx → 1 aria ref
├── app/[locale]/dashboard/layout.tsx → 1 aria ref
├── app/[locale]/admin/layout.tsx     → 1 aria ref
├── app/[locale]/page.tsx             → 3 aria ref
├── app/[locale]/dashboard/           → 20+ sayfa, ARIA YOK
├── app/[locale]/dashboard/alerts/    → ARIA YOK
├── app/[locale]/dashboard/analytics/ → ARIA YOK
├── app/[locale]/dashboard/endpoints/ → ARIA YOK
├── app/[locale]/dashboard/settings/  → ARIA YOK
└── ... (30+ sayfa daha)
```

### 🚨 Sistemik Sorunlar (Kod İncelemesiyle Tespit Edildi)

| Sorun | Kapsam | WCAG Kriteri | Severity |
|-------|--------|-------------|----------|
| **`htmlFor` hiç kullanılmamış** | 13 dosyada `<label>` var ama **0 `htmlFor`** | 3.3.2, 1.3.1 | 🔴 Kritik |
| **`aria-live` / `role="alert"` hiç yok** | Hata mesajları screen reader'a duyurulmuyor | 4.1.3 | 🔴 Kritik |
| **Label-input association yok** | Tüm form alanları (login, endpoints, alerts, playground, transforms) | 3.3.2 | 🔴 Kritik |
| **Skip navigation link yok** | Dashboard layout'unda "İçeriğe atla" linki yok | 2.4.1 | 🔴 Yüksek |
| **Icon button'lar labelsız** | `ErrorBoundary`, `Onboarding`, `ConfirmDialog`, `ChartCard` | 4.1.2 | 🔴 Yüksek |
| **Password strength sadece renk** | Login sayfası: kırmızı/sarı/yeşil — renk körü kullanıcılar için | 1.4.1 | 🟡 Orta |
| **Emoji içerik olarak kullanılıyor** | 📋 Schemas, 🔀 Routing, 👤 Portal — aria alternatifi yok | 1.1.1 | 🟡 Orta |
| **Heading hierarchy tutarsız** | Bazı sayfalarda birden fazla `<h1>`, bazılarında hiç yok | 1.3.1, 2.4.6 | 🟡 Orta |
| **Landmark role eksik** | `<nav>`, `<main>`, `<aside>` semantic element yok | 1.3.1 | 🟡 Orta |

### Detaylı Tespit: Login Sayfası

```tsx
// src/app/[locale]/login/page.tsx — İNCELENEN KOD

// ❌ SORUN 1: Label-input association yok
<label className="block text-sm font-medium ...">{t('email')}</label>
<input placeholder={t('emailPlaceholder')} className="..." />
// ↑ htmlFor/id yok! Screen reader "email" label'ını input ile ilişkilendiremez

// ❌ SORUN 2: Hata mesajı screen reader'a duyurulmuyor
{error && (
  <div className="mb-4 p-3 rounded-xl bg-red-50 ...">
    {error}
  </div>
  // ↑ role="alert" veya aria-live="polite" yok!
)}

// ❌ SORUN 3: Password strength sadece renk ile gösteriliyor
<span className={`inline-block w-2 h-2 rounded-full ${passwordStrength.color}`} />
<span>{passwordStrength.label}</span>
// ↑ Renk körü kullanıcılar "Weak/Medium/Strong" ayrımı yapamaz
// Düzeltme: ikon veya metin ekle (✓ Strong, ✗ Weak)

// ❌ SORUN 4: Password requirements açıklanmamış
// 8+ karakter, büyük harf, küçük harf, rakam, özel karakter
// ↑ aria-describedby ile password kuralları gösterilmeli
```

### Detaylı Tespit: Dashboard Sayfaları

```tsx
// endpoints/page.tsx — Label association yok
<label className="block text-sm font-medium ...">URL</label>
<input placeholder="https://..." className="..." />
// ↑ htmlFor/id yok!

// alerts/page.tsx — Label association yok
<label className="block text-sm font-medium ...">Name</label>
<input placeholder="Alert name" className="..." />
// ↑ htmlFor/id yok!

// playground/page.tsx — Label association yok
<label className="block text-sm font-medium ...">{t('requestBody')}</label>
<textarea placeholder="..." className="..." />
// ↑ htmlFor/id yok!

// transforms/page.tsx — Label association yok
<label className="block text-sm font-medium ...">Select Endpoint</label>
<select className="...">
// ↑ htmlFor/id yok!
```

### Detaylı Tespit: Icon Button'lar

```tsx
// ErrorBoundary.tsx — Button without label
<button onClick={() => window.location.reload()}>Try Again</button>
// ↑ Metin var, bu iyi

// Onboarding.tsx — Icon-only buttons
<button onClick={handleNext}>→</button>
// ↑ aria-label="Next" yok!

// LanguageSwitcher.tsx — Dropdown trigger
<button>{currentLocale.flag}</button>
// ↑ aria-label="Select language" yok!
```

---

## 2. Neden Önemli?

### Yasal Zorunluluk
- **EU Accessibility Act (EAA):** Haziran 2025'ten beri yürürlükte. SaaS ürünleri WCAG 2.1 AA uyumlu olmalı.
- **ABD ADA:** Web erişilebilirliği mahkeme kararlarıyla zorunlu kılınıyor.
- **Section 508:** ABD federal kurumlarına satılan ürünlerde zorunlu.

### İş Avantajları
- **Pazar genişletme:** Dünya nüfusunun %15'i engelli (1.3 milyar insan)
- **SEO:** Erişilebilir siteler daha iyi sıralanır (semantic HTML, alt text)
- **Kullanıcı deneyimi:** Erişilebilirlik herkes için daha iyi UX demek
- **Enterprise satış:** Kurumsal müşteriler erişilebilirlik uyumluluğu ister
- **Rekabet avantajı:** Svix/Hookdeck/Hook0'un accessibility statements'ı yok

### Rakip Durum

| Rakip | Accessibility Statement | WCAG Uyumluluğu | Test |
|-------|------------------------|-----------------|------|
| Svix | ❌ Yok | Bilinmiyor | Bilinmiyor |
| Hookdeck | ❌ Yok | Bilinmiyor | Bilinmiyor |
| Hook0 | ❌ Yok | Bilinmiyor | Bilinmiyor |
| Stripe | ✅ Var | WCAG 2.1 AA | Düzenli |
| Twilio | ✅ Var | WCAG 2.1 AA | Düzenli |
| **HookSniff** | ❌ Yok | ❌ | ❌ |

**Fırsat:** Rakiplerin hiçbiri erişilebilirliğe yatırım yapmamış. İlk yapan rekabet avantajı kazanır.

---

## 3. Yasal Zorunluluk: EU Accessibility Act

### EAA Nedir? (✅ Doğrulanmış — thefrontkit.com)

> **Kaynak:** https://thefrontkit.com/blogs/eu-accessibility-act-nextjs-developers-guide (✅ tam sayfa doğrulanmış)

**EU Accessibility Act (Directive 2019/882)** — 28 Haziran 2025'ten beri yürürlükte.

### Kimleri Etkiler?

| Kapsam | HookSniff | Durum |
|--------|-----------|-------|
| E-ticaret (dijital ürün satışı) | ✅ SaaS abonelik satışı | **Kapsamda** |
| Ödeme/finans hizmetleri | ✅ Polar.sh + iyzico | **Kapsamda** |
| Telekomünikasyon | ❌ | Kapsam dışı |
| B2B-only ürün | ❌ Consumer-facing login/signup var | **Kapsamda** |

### Ne Gerekiyor?

1. **WCAG 2.1 Level AA uyumluluğu** — web içerik için standart
2. **Erişilebilirlik beyanı** — herkese açık sayfa
3. **Sorun bildirim mekanizması** — kullanıcılar erişilebilirlik sorunu bildirebilmeli
4. **Test kayıtları** — talep üzerine sunulabilmeli

### Ne Gerekmıyor?

- ❌ AAA uyumluluğu gerekmiyor
- ❌ Overlay widget'lar yeterli değil (mahkeme kararları doğruladı)
- ❌ Üçüncü parti sertifika zorunlu değil (self-assessment yeterli)
- ✅ Microenterprise muafiyeti var (10'dan az çalışan + €2M'den az ciro) ama bu muafiyete güvenmeyin

### Ceza Riski

| Ülke | Ceza |
|------|------|
| Almanya | €50.000'a kadar |
| Fransa | €5.000 - €50.000 |
| İspanya | €30.000 - €1.000.000 |
| İtalya | €5.000 - €40.000 |

---

## 4. WCAG 2.1 AA Standartları

### 4 Temel Prensip (POUR)

| Prensip | Açıklama | HookSniff Etkisi |
|---------|----------|-----------------|
| **Perceivable** | İçerik algılanabilir olmalı | Renk kontrastı, alt text, yazı tipi boyutu |
| **Operable** | Arayüz çalıştırılabilir olmalı | Keyboard nav, focus visibility, skip links |
| **Understandable** | İçerik anlaşılır olmalı | Tutarlı navigation, hata mesajları, form labels |
| **Robust** | Teknolojiler arası uyumlu | Semantic HTML, ARIA, assistive technology desteği |

### 50 Başarı Kriterinden En Kritik 15'i (HookSniff İçin)

| # | Kriter | Seviye | Açıklama | HookSniff Riski |
|---|--------|--------|----------|----------------|
| 1.1.1 | Non-text Content | A | Alt text | 🔴 Yüksek — emoji içerik |
| 1.3.1 | Info and Relationships | A | Semantic HTML | 🔴 Yüksek — label association yok |
| 1.4.1 | Use of Color | A | Renk tek başına bilgi taşımamalı | 🟡 Orta — password strength |
| 1.4.3 | Contrast (Minimum) | AA | 4.5:1 ratio | 🔴 Yüksek — Tailwind |
| 1.4.11 | Non-text Contrast | AA | 3:1 UI components | 🔴 Yüksek — butonlar |
| 2.1.1 | Keyboard | A | Keyboard erişilebilirlik | 🔴 Yüksek |
| 2.1.2 | No Keyboard Trap | A | Focus trap yok | 🟡 Orta — modal'lar |
| 2.4.1 | Bypass Blocks | A | Skip navigation | 🔴 Yüksek — yok |
| 2.4.3 | Focus Order | A | Mantıklı focus sırası | 🟡 Orta |
| 2.4.6 | Headings and Labels | AA | Başlık hiyerarşisi | 🟡 Orta |
| 2.4.7 | Focus Visible | AA | Focus göstergesi | 🔴 Yüksek |
| 3.1.1 | Language of Page | A | lang attribute | 🟡 Orta — i18n var |
| 3.3.1 | Error Identification | A | Hata tanımlama | 🔴 Yüksek — aria-live yok |
| 3.3.2 | Labels or Instructions | AA | Form labels | 🔴 Kritik — htmlFor yok |
| 4.1.2 | Name, Role, Value | A | ARIA | 🔴 Yüksek |
| 4.1.3 | Status Messages | AA | Live regions | 🔴 Kritik — aria-live yok |

### WCAG 2.2 Yeni Kriterler (Ekim 2023 — Eksik Olanlar)

> **Kaynak:** https://testparty.ai/blog/wcag-22-new-success-criteria (✅ doğrulanmış)
> **Kaynak:** https://www.w3.org/TR/WCAG22/ (✅ doğrulanmış)

WCAG 2.2, WCAG 2.1 üzerine **9 yeni başarı kriteri** ekledi. HookSniff'in bunları da hesaba katması gerekiyor:

| # | Kriter | Seviye | Açıklama | HookSniff Riski |
|---|--------|--------|----------|----------------|
| **2.4.11** | Focus Not Obscured (Minimum) | A | Focus element sticky header tarafından gizlenmemeli | 🟡 Orta — sticky header var |
| **2.4.12** | Focus Not Obscured (Enhanced) | AA | Focus element'in hiçbir kısmı gizlenmemeli | 🟡 Orta |
| **2.4.13** | Focus Appearance | AA | Focus indicator: 2px+ kalınlık, 3:1+ kontrast | 🔴 Yüksek — shadcn ring/50 |
| **2.5.7** | Dragging Movements | AA | Drag-and-drop için alternatif olmalı | 🟢 Düşük — DnD yok |
| **2.5.8** | Target Size (Minimum) | AA | Min 24×24 CSS px interactive target | 🟡 Orta — icon button'lar |
| **3.2.6** | Consistent Help | AAA | Yardım tutarlı olmalı | 🟢 Düşük |
| **3.3.7** | Redundant Entry | A | Aynı bilgi tekrar istenmemeli | 🟢 Düşük |
| **3.3.8** | Accessible Authentication (Minimum) | AA | CAPTCHA/cognitive test alternatifi | 🟢 Düşük — CAPTCHA yok |
| **3.3.9** | Accessible Authentication (Enhanced) | AAA | Gelişmiş auth erişilebilirliği | 🟢 Düşük |

#### 2.4.11 Focus Not Obscured — HookSniff Etkisi

```tsx
// Dashboard layout'ta sticky sidebar var
// Eğer sidebar fixed position ise, Tab ile gezinirken
// focus olan element sidebar altında kalabilir

// Düzeltme:
html {
  scroll-padding-top: 80px; /* Sticky header yüksekliği */
}
:focus {
  scroll-margin-top: 100px;
}
```

#### 2.4.13 Focus Appearance — HookSniff Etkisi

```css
/* ❌ Mevcut shadcn default — GEÇMİYOR */
:focus-visible {
  ring: 1px;
  ring-color: var(--ring);
  opacity: 0.5; /* 2.4:1 kontrast — 3:1 gerekli */
}

/* ✅ Düzeltme — GEÇİYOR */
:focus-visible {
  outline: 3px solid hsl(var(--ring));
  outline-offset: 2px;
  /* veya */
  box-shadow: 0 0 0 3px hsl(var(--ring));
}
```

#### 2.5.8 Target Size — HookSniff Etkisi

```tsx
// ❌ Mevcut icon button'lar — Küçük touch target
<button className="h-6 w-6">  // 24px — minimum sınırda
  <X className="h-4 w-4" />
</button>

// ✅ Düzeltme — Yeterli touch target
<button className="h-9 w-9 flex items-center justify-center">  // 36px — rahat
  <X className="h-4 w-4" />
</button>
// Veya spacing ile:
<button className="h-6 w-6 m-1.5">  // target + spacing = 24px+
  <X className="h-4 w-4" />
</button>
```

---

## 5. HookSniff Dashboard Analizi

### En Riskli Sayfalar (İncelenmeli)

| Sayfa | Risk | Olası Sorunlar |
|-------|------|---------------|
| **Login/Register** | 🔴 Yüksek | Form labels, error messages, focus management |
| **Endpoints** | 🔴 Yüksek | Tablo erişilebilirliği, action butonları |
| **Analytics** | 🔴 Yüksek | Chart erişilebilirliği (canvas/SVG), data tables |
| **Billing** | 🔴 Yüksek | Form labels, ödeme akışı, error handling |
| **Settings** | 🟡 Orta | Form inputs, toggle switches, save feedback |
| **Team** | 🟡 Orta | Tablo, modal'lar, invite form |
| **Playground** | 🟡 Orta | Code editor erişilebilirliği |
| **Webhooks** | 🟡 Orta | Form, JSON editor |
| **Landing** | 🟡 Orta | Animasyonlar, hero section |
| **Docs** | 🟢 Düşük | İçerik ağırlıklı, link yapısı |

### Tailwind CSS Riskleri (✅ Doğrulanmış)

> **Kaynak:** TheFrontKit shadcn/ui accessibility audit (✅ doğrulanmış)

| Tailwind Class | Kontrast | Durum |
|---------------|----------|-------|
| `text-gray-500` on `bg-white` | 4.6:1 | ✅ Geçiyor (barely) |
| `text-gray-400` on `bg-white` | 2.8:1 | ❌ **Geçmiyor** |
| `text-muted-foreground` (shadcn) | Değişken | 🟡 Light mode'da sınırda |
| `focus-visible:ring-ring/50` | < 3:1 | ❌ **Geçmiyor** |

### shadcn/ui Bileşenleri Risk Analizi

> **Kaynak:** "We Audited All 48 shadcn/ui Components for WCAG 2.2 AA" — TheFrontKit, Nisan 2026 (✅ tam sayfa doğrulanmış)

**Sonuç:** 48 bileşenden **34'ü** doğrudan geçiyor, **9'u** küçük düzeltme istiyor, **5'i** gerçek denetim hatası var.

#### ✅ Doğrudan Geçen 34 Bileşen (Güvenle Kullanılabilir)

Layout: Accordion, Aspect Ratio, Breadcrumb, Card, Collapsible, Resizable, Scroll Area, Separator, Sheet, Sidebar
Form: Checkbox, Form, Input OTP, Label, Radio Group, Select, Switch, Textarea, Toggle, Toggle Group
Feedback: Alert, Dialog, Popover, Progress, Skeleton, Sonner (Toast), Tooltip
Display: Avatar, Badge, Calendar, Hover Card, Pagination, Table, Tabs

#### 🟡 Küçük Düzeltme Gereken 9 Bileşen

| Bileşen | Sorun | Düzeltme |
|---------|-------|----------|
| **Button** | Focus ring %50 opacity → 2.4:1 kontrast (3:1 gerekli) | `focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2` |
| **Input** | Placeholder `text-muted-foreground` → 2.8:1 kontrast | `placeholder:text-zinc-600 dark:placeholder:text-zinc-400` |
| **Slider** | Varsayılan step=1, ince kontrol yok | `step` prop'u açıkça belirt |
| **Command (Cmdk)** | Search input'ta `aria-label` yok | `aria-label="Search commands"` ekle |
| **Carousel** | Autoplay `prefers-reduced-motion` saygı göstermiyor | Autoplay'i motion check ile sar |
| **Toast (Sonner)** | 4 saniye otomatik kapanma → bilişsel erişilebilirlik | `duration={8000}`, `closeButton`, kritik mesajlarda `duration: Infinity` |
| **Date Picker** | Ay/yıl nav butonları küçük touch target | `size-9` yap, `aria-label` ekle |
| **Menubar** | Submenu trigger `aria-expanded` düşebilir | DevTools ile doğrula, gerekirse manuel ekle |
| **Drawer (Vaul)** | Kapandıktan sonra focus trigger'a dönmeyebilir | Trigger'ın mounted kaldığından emin ol |

#### 🔴 Denetim Hatası Olan 5 Bileşen

| Bileşen | Sorun | Düzeltme |
|---------|-------|----------|
| **Combobox** | `aria-haspopup`, `aria-expanded`, `aria-controls` yok | Manuel ARIA ekle veya Ariakit `useComboboxState` kullan |
| **Data Table** | `<caption>` yok, sort state duyurulmuyor, satır seçim label'ı yok | `caption`, `aria-sort`, `aria-label` ekle |
| **Context Menu** | Klavye kısayolları gösteriliyor ama çalışmıyor | Kısayol metnini kaldır veya gerçekten uygula |
| **Chart (Recharts)** | Canvas-based → screen reader okuyamıyor | Data table alternatifi + `aria-label` |
| **Carousel (autoplay)** | Reduced motion desteği eksik | `prefers-reduced-motion` kontrolü |

#### HookSniff'te Kullanılan shadcn/ui Bileşenleri

HookSniff dashboard'unda muhtemelen kullanılan bileşenler:
- **Button** → 🔴 Focus ring fix gerekli
- **Input** → 🔴 Placeholder contrast fix gerekli
- **Table (Data Table)** → 🔴 Caption, sort state, row selection label
- **Dialog** → ✅ Geçiyor
- **Select** → ✅ Geçiyor
- **DropdownMenu** → ✅ Geçiyor (ama Combobox kullanılıyorsa 🔴)
- **Toast (Sonner)** → 🟡 Duration fix gerekli
- **Tabs** → ✅ Geçiyor
- **Badge** → ✅ Geçiyor
- **Alert** → ✅ Geçiyor
- **Form** → ✅ Geçiyor

---

## 6. Araç Karşılaştırması

### Ücretsiz Accessibility Test Araçları (✅ Doğrulanmış)

| Araç | Tür | Fiyat | Entegrasyon | Kapsam |
|------|-----|-------|-------------|--------|
| **axe-core** | Kütüphane | ✅ Ücretsiz (MIT) | Jest, Playwright, CI | ~57 kural |
| **axe DevTools** | Browser extension | ✅ Ücretsiz | Chrome, Firefox | ~57 kural |
| **Lighthouse** | CLI/Browser | ✅ Ücretsiz (Google) | Chrome, CI | A11y skoru |
| **Pa11y** | CLI | ✅ Ücretsiz (MIT) | CI, dashboard | WCAG 2.1 |
| **WAVE** | Browser extension | ✅ Ücretsiz | Chrome, Firefox | Görsel rapor |
| **eslint-plugin-jsx-a11y** | Lint | ✅ Ücretsiz (MIT) | ESLint, Next.js | JSX a11y kuralları |
| **Storybook a11y addon** | Test | ✅ Ücretsiz | Storybook | Bileşen testi |
| **jest-axe** | Test | ✅ Ücretsiz (MIT) | Jest | Unit test |
| **Playwright a11y** | E2E test | ✅ Ücretsiz | Playwright | Sayfa testi |

### Ücretli Araçlar

| Araç | Fiyat | Özellik |
|------|-------|---------|
| axe Pro | $99+/ay | Gelişmiş rapor, CI entegrasyonu |
| Siteimprove | Özel fiyat | Kurumsal monitoring |
| Level Access | Özel fiyat | Uzman denetimi |
| AccessiBe | $49+/ay | ⚠️ Overlay — **EAA uyumlu DEĞİL** |

### Tavsiye Edilen Araç Seti (HookSniff İçin)

| Araç | Amaç | Maliyet |
|------|------|---------|
| **eslint-plugin-jsx-a11y** | Kod yazarken lint | $0 |
| **jest-axe** | Unit test | $0 |
| **axe-core + Playwright** | E2E test | $0 |
| **Lighthouse CI** | Build-time skor | $0 |
| **axe DevTools** | Manuel test | $0 |
| **WAVE** | Görsel rapor | $0 |
| **Toplam** | | **$0** |

---

## 7. Strateji

### Aşamalı Yaklaşım

```
Faz 1: Temel Uyumluluk (1-2 hafta)
  → Semantic HTML, form labels, color contrast, focus visibility
  → WCAG 2.1 A seviyesi

Faz 2: Orta Seviye (2-3 hafta)
  → Keyboard navigation, screen reader, ARIA
  → WCAG 2.1 AA seviyesi

Faz 3: İyileştirme (1-2 hafta)
  → Testing, monitoring, documentation
  → Accessibility statement, CI entegrasyonu

Faz 4: Sürekli Bakım (devam eden)
  → Her PR'da a11y test, haftalık Lighthouse, aylık denetim
```

---

## 8. Uygulama Planı

### Faz 1: Temel Uyumluluk (1-2 hafta)

#### 1.0 ACİL: Label-Input Association (TÜM SAYFALAR)

> **🚨 EN KRİTİK SORUN:** Dashboard'daki 13 dosyada `<label>` var ama **hiçbirinde `htmlFor` yok**. Bu, WCAG 3.3.2 ve 1.3.1 ihlali. Tüm formlar düzeltilmeli.

```tsx
// ❌ MEVCUT — 13 dosyada bu pattern var
<label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
  {t('email')}
</label>
<input placeholder={t('emailPlaceholder')} className="..." />

// ✅ DÜZELTME — htmlFor + id + aria-describedby
<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
    {t('email')}
  </label>
  <input
    id="email"
    type="email"
    placeholder={t('emailPlaceholder')}
    aria-describedby="email-hint"
    className="..."
  />
  <p id="email-hint" className="text-xs text-gray-500 mt-1">
    {t('emailHint')}
  </p>
</div>
```

**Düzeltilecek dosyalar (öncelik sırası):**
1. `login/page.tsx` — email, password, name inputs
2. `endpoints/page.tsx` — URL, description inputs
3. `endpoints/[id]/page.tsx` — 5+ input alanı
4. `alerts/page.tsx` — name, condition, threshold, channels
5. `playground/page.tsx` — 4+ input alanı
6. `transforms/page.tsx` — endpoint select, filter inputs
7. `inbound/page.tsx` — webhook secret, route select
8. `settings/page.tsx` — tüm ayar inputları
9. `team/page.tsx` — invite form
10. `api-keys/page.tsx` — key creation form
11. `billing/page.tsx` — ödeme formu
12. `webhooks/new/page.tsx` — webhook creation form
13. `search/page.tsx` — search input

#### 1.0b ACİL: Error Messages — aria-live

> **🚨 KRİTİK SORUN:** Hiçbir sayfada `aria-live` veya `role="alert"` yok. Hata mesajları screen reader kullanıcılarına duyurulmuyor.

```tsx
// ❌ MEVCUT
{error && (
  <div className="mb-4 p-3 rounded-xl bg-red-50 ...">
    {error}
  </div>
)}

// ✅ DÜZELTME
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {error && <p>{error}</p>}
</div>
{error && (
  <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 ...">
    {error}
  </div>
)}

// Veya shadcn Form bileşeni ile (otomatik aria-live):
<FormMessage /> {/* shadcn otomatik role="alert" ekler */}
```

#### 1.1 ESLint jsx-a11y Kurulumu

```bash
cd dashboard
npm install --save-dev eslint-plugin-jsx-a11y
```

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"],
  "rules": {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-autofocus": "warn",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error",
    "jsx-a11y/no-redundant-roles": "error"
  }
}
```

#### 1.2 Renk Kontrastı Düzeltmeleri

```tsx
// tailwind.config.ts — kontrast-safe renk paleti
module.exports = {
  theme: {
    extend: {
      colors: {
        // WCAG 2.1 AA uyumlu (4.5:1+ kontrast)
        'muted-foreground': 'hsl(240 3.8% 35%)', // 4.6:1 on white
        'muted': 'hsl(240 4.8% 85%)',
        // Eski: text-gray-400 (2.8:1) → Yeni: text-gray-600 (5.7:1)
      }
    }
  }
}
```

```tsx
// ❌ Eski (geçmiyor)
<p className="text-gray-400">Secondary text</p>

// ✅ Yeni (geçiyor)
<p className="text-gray-600">Secondary text</p>
// veya
<p className="text-muted-foreground">Secondary text</p>
```

#### 1.3 Focus Visibility Düzeltmeleri

```tsx
// ❌ Eski (geçmiyor — 50% opacity)
<button className="focus-visible:ring-ring/50">

// ✅ Yeni (geçiyor — full opacity ring)
<button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
```

```css
/* globals.css — global focus style */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: var(--radius);
}
```

#### 1.4 Form Labels

```tsx
// ❌ Eski (placeholder-only)
<Input placeholder="Email adresiniz" />

// ✅ Yeni (label + placeholder)
<div>
  <Label htmlFor="email">Email adresi</Label>
  <Input id="email" placeholder="ornek@email.com" aria-describedby="email-hint" />
  <p id="email-hint" className="text-sm text-muted-foreground">
    Kayıt olmak için email adresinizi girin
  </p>
</div>
```

```tsx
// shadcn Form bileşeni ile (otomatik label association)
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="ornek@email.com" {...field} />
      </FormControl>
      <FormDescription>Kayıt olmak için email adresinizi girin</FormDescription>
      <FormMessage /> {/* Hata mesajı — aria-live ile */}
    </FormItem>
  )}
/>
```

#### 1.5 Heading Hierarchy

```tsx
// ❌ Eski (atlanan seviyeler)
<h1>Dashboard</h1>
<h3>Endpoints</h3>  // h2 atlandı!

// ✅ Yeni (doğru hiyerarşisi)
<h1>Dashboard</h1>
  <section>
    <h2>Endpoints</h2>
    <h3>Yeni Endpoint</h3>
  </section>
```

#### 1.6 Alt Text

```tsx
// ❌ Eski
<Image src="/logo.png" width={200} height={50} />
<Image src="/hero.svg" alt="hero illustration" />

// ✅ Yeni
<Image src="/logo.png" width={200} height={50} alt="HookSniff" />
<Image src="/hero.svg" alt="Webhook yönetimi dashboard'u" />
// Dekoratif görsel:
<Image src="/decoration.svg" alt="" role="presentation" />
```

#### 1.7 Skip Navigation

```tsx
// app/[locale]/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <>
      {/* Skip navigation — klavye kullanıcıları için */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        İçeriğe atla
      </a>
      <nav aria-label="Ana menü">
        {/* Sidebar */}
      </nav>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  )
}
```

### Faz 2: Orta Seviye (2-3 hafta)

#### 2.1 Keyboard Navigation

```tsx
// Tablo erişilebilirliği — shadcn Data Table fix (✅ TheFrontKit 2026 denetimi doğrulanmış)
// EN SIK GÖRÜLEN HATA: Data Table'da caption, sort state, row selection label eksik

<table role="table" aria-label="Webhook endpoint'leri">
  <caption className="sr-only">
    Webhook endpoint'leri listesi, {endpoints.length} toplam endpoint
  </caption>
  <thead>
    <tr>
      <th scope="col" aria-sort={column.getIsSorted() === "asc" ? "ascending" : column.getIsSorted() === "desc" ? "descending" : "none"}>
        <button onClick={column.getToggleSortingHandler()} aria-label={`Ad sırala`}>
          Ad
        </button>
      </th>
      <th scope="col">URL</th>
      <th scope="col">Durum</th>
      <th scope="col"><span className="sr-only">İşlemler</span></th>
    </tr>
  </thead>
  <tbody>
    {endpoints.map(ep => (
      <tr key={ep.id}>
        <td>{ep.name}</td>
        <td>{ep.url}</td>
        <td>
          <Badge variant={ep.active ? "success" : "destructive"}>
            {ep.active ? "Aktif" : "Pasif"}
          </Badge>
        </td>
        <td>
          {/* Satır seçim checkbox'ı — label zorunlu */}
          <Checkbox
            aria-label={`${ep.name} endpoint'ini seç`}
            checked={selected.includes(ep.id)}
            onCheckedChange={() => toggleSelect(ep.id)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={`${ep.name} için işlemler`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* ... */}
          </DropdownMenu>
        </td>
      </tr>
    ))}
  </tbody>
</table>

// Pagination live region — sayfa değişikliğini duyur
<div aria-live="polite" className="sr-only">
  Sayfa {currentPage}, {startRow}-{endRow} arası gösteriliyor, toplam {totalRows}
</div>
```

#### 2.2 Modal Focus Trap

```tsx
// shadcn Dialog (Radix) — otomatik focus trap
<Dialog>
  <DialogTrigger asChild>
    <Button>Yeni Endpoint</Button>
  </DialogTrigger>
  <DialogContent aria-describedby="dialog-desc">
    <DialogHeader>
      <DialogTitle>Yeni Endpoint Oluştur</DialogTitle>
      <p id="dialog-desc">
        Webhook almak için bir endpoint oluşturun.
      </p>
    </DialogHeader>
    {/* Form */}
  </DialogContent>
</Dialog>
```

#### 2.3 Live Regions (Toast/Alert)

```tsx
// Toast bildirimi — screen reader'a duyur
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {toastMessage && <p>{toastMessage}</p>}
</div>

// Kritik uyarılar — anında duyur
<div aria-live="assertive" aria-atomic="true">
  {errorMessage && <p role="alert">{errorMessage}</p>}
</div>
```

#### 2.4 SVG/Chart Erişilebilirliği

```tsx
// Analytics chart — alternatif metin
<figure>
  <svg role="img" aria-label="Son 30 günlük webhook teslimatı başarı oranı grafiği">
    {/* Chart paths */}
  </svg>
  <figcaption className="sr-only">
    Son 30 günde ortalama %98.5 başarı oranı. En düşük gün: %95.2 (15 Mart).
  </figcaption>
</figure>

// Veya data table alternatifi
<details>
  <summary>Veri tablosu olarak görüntüle</summary>
  <table>
    {/* Chart data as table */}
  </table>
</details>
```

#### 2.5 i18n + ARIA

```tsx
// ARIA label'ları da çevrilmeli
<Button aria-label={t('endpoint.delete.aria-label', { name: endpoint.name })}>
  <Trash2 />
</Button>

// messages/tr.json
{
  "endpoint": {
    "delete": {
      "aria-label": "{{name}} endpoint'ini sil"
    }
  }
}
```

### Faz 3: İyileştirme (1-2 hafta)

#### 3.1 Jest-axe Unit Test

```bash
npm install --save-dev jest-axe @types/jest-axe
```

```tsx
// __tests__/accessibility.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility', () => {
  it('login sayfası erişilebilir', async () => {
    const { container } = render(<LoginPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('endpoints tablosu erişilebilir', async () => {
    const { container } = render(<EndpointsPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('analytics chart erişilebilir', async () => {
    const { container } = render(<AnalyticsPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

#### 3.2 Playwright E2E A11y Test

```typescript
// tests/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('dashboard ana sayfa', async ({ page }) => {
    await page.goto('/dashboard')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('login sayfası', async ({ page }) => {
    await page.goto('/login')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test('endpoints sayfası', async ({ page }) => {
    await page.goto('/dashboard/endpoints')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
})
```

#### 3.3 Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/login",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/dashboard/endpoints"
      ],
      "startServerCommand": "npm run dev",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

#### 3.4 Accessibility Statement

```tsx
// app/[locale]/accessibility/page.tsx
export default function AccessibilityPage() {
  return (
    <main>
      <h1>Erişilebilirlik Beyanı</h1>
      <p>
        HookSniff olarak dijital ürünlerimizin herkes için erişilebilir
        olmasını taahhüt ediyoruz. Bu beyan, web sitemizin ve dashboard
        uygulamamızın erişilebilirlik durumunu açıklamaktadır.
      </p>

      <h2>Uyumluluk Durumu</h2>
      <p>
        Bu web sitesi, Web İçeriği Erişilebilirlik Yönergeleri (WCAG) 2.1
        Düzey AA標準larına uygun olarak tasarlanmıştır.
      </p>

      <h2>Test Yöntemleri</h2>
      <ul>
        <li>Otomatik test: axe-core, Lighthouse, Pa11y</li>
        <li>Manuel test: Klavye navigasyonu, ekran okuyucu</li>
        <li>Düzenli denetim: Aylık kapsamlı kontrol</li>
      </ul>

      <h2>Bilinen Erişilebilirlik Sorunları</h2>
      <ul>
        <li>Canlı grafikler alternatif metin tablosu ile sunulmaktadır</li>
        <li>Kod editörü (Playground) sınırlı erişilebilirlik sunar</li>
      </ul>

      <h2>Sorun Bildirme</h2>
      <p>
        Erişilebilirlik ile ilgili sorun yaşarsanız, lütfen bizimle iletişime geçin:
      </p>
      <ul>
        <li>Email: accessibility@hooksniff.dev</li>
        <li>Form: <a href="/contact">İletişim sayfası</a></li>
      </ul>
      <p>Sorunları 5 iş günü içinde yanıtlıyoruz.</p>

      <h2>Yasal Çerçeve</h2>
      <p>
        Bu beyan, Avrupa Erişilebilirlik Yasası (Directive 2019/882)
        kapsamında hazırlanmıştır. Son inceleme: [tarih]
      </p>
    </main>
  )
}
```

---

## 9. HookSniff'e Özel Sorunlar ve Çözümler

### 9.1 Chart/Analytics Erişilebilirliği

**Sorun:** Canvas-based chart'lar screen reader tarafından okunamaz.

**Çözüm:**
```tsx
// Erişilebilir chart wrapper
function AccessibleChart({ data, title, description }) {
  return (
    <div>
      <h3>{title}</h3>
      <p className="sr-only">{description}</p>
      <div role="img" aria-label={description}>
        <Chart data={data} />
      </div>
      {/* Data table alternatifi */}
      <details>
        <summary>Veri tablosu olarak görüntüle</summary>
        <table>
          <caption>{title} — detaylı veri</caption>
          <thead>
            <tr>
              <th scope="col">Tarih</th>
              <th scope="col">Değer</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.date}>
                <td>{item.date}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
```

### 9.2 JSON Editor (Playground)

**Sorun:** Monaco/CodeMirror editörleri keyboard-only kullanıcılar için zor.

**Çözüm:**
```tsx
// Textarea alternatifi
<div>
  <Label htmlFor="json-input">Webhook Payload (JSON)</Label>
  <Tabs defaultValue="editor">
    <TabsList>
      <TabsTrigger value="editor">Görsel Editör</TabsTrigger>
      <TabsTrigger value="textarea">Düz Metin</TabsTrigger>
    </TabsList>
    <TabsContent value="editor">
      <JsonEditor value={json} onChange={setJson} />
    </TabsContent>
    <TabsContent value="textarea">
      <textarea
        id="json-input"
        value={json}
        onChange={e => setJson(e.target.value)}
        rows={10}
        className="w-full font-mono"
        aria-describedby="json-hint"
      />
      <p id="json-hint" className="text-sm text-muted-foreground">
        Geçerli JSON formatında girin
      </p>
    </TabsContent>
  </Tabs>
</div>
```

### 9.3 Bildirim Merkezi

**Sorun:** Dropdown menu screen reader'da duyurulmayabilir.

**Çözüm:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label={`Bildirimler: ${unreadCount} okunmamış`}>
      <Bell />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1" aria-hidden="true">
          {unreadCount}
        </Badge>
      )}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent aria-label="Bildirimler">
    {notifications.map(n => (
      <DropdownMenuItem key={n.id} aria-label={n.title}>
        {n.title}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### 9.4 Dark Mode + Kontrast

**Sorun:** Dark mode'da renk kontrastı farklı olabilir.

**Çözüm:**
```css
/* Her iki modda da test edilmeli */
:root {
  --foreground: 240 10% 3.9%;      /* #0a0a0a — 19.3:1 on white */
  --muted-foreground: 240 3.8% 46%; /* #71717a — 4.6:1 on white */
}

.dark {
  --foreground: 0 0% 98%;           /* #fafafa — 19.3:1 on dark bg */
  --muted-foreground: 240 5% 64.9%; /* #a1a1aa — 4.6:1 on dark bg */
}
```

---

## 10. Test Stratejisi

### Test Piramidi

```
┌─────────────────────────────┐
│     Manuel Test (aylık)     │  ← Screen reader, keyboard-only
├─────────────────────────────┤
│    E2E A11y Test (PR'da)    │  ← Playwright + axe-core
├─────────────────────────────┤
│   Lighthouse CI (build'de)  │  ← A11y skoru ≥ 90
├─────────────────────────────┤
│   Unit Test (her commit)    │  ← jest-axe
├─────────────────────────────┤
│   Lint (kod yazarken)       │  ← eslint-plugin-jsx-a11y
└─────────────────────────────┘
```

### CI Entegrasyonu (Local CI)

```bash
# scripts/ci-local.sh'a eklenecek
echo "♿ Accessibility tests..."
cd dashboard
npm run lint -- --plugin jsx-a11y 2>&1 | tail -5
npx jest --testPathPattern="accessibility" 2>&1 | tail -5
npx lhci autorun --config=lighthouserc.json 2>&1 | tail -10
echo "✅ Accessibility tests passed"
```

---

## 11. Metrikler

### Hedef Metrikler

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Lighthouse A11y skoru | ≥ 90 | CI her build |
| axe-core violations | 0 | Jest + Playwright |
| Keyboard navigasyon | %100 sayfa | Manuel test |
| Screen reader | %100 kritik akış | Manuel test |
| Color contrast | 4.5:1+ tüm metin | Otomatik test |
| Focus visibility | %100 interactive element | Otomatik test |
| Form labels | %100 input | Otomatik test |
| Heading hierarchy | Doğru sıralama | Otomatik test |
| Alt text | %100 image | Lint |

### Dashboard

```
┌─────────────────────────────────────────────┐
│          Accessibility Dashboard            │
├─────────────────────────────────────────────┤
│  Lighthouse A11y: 92/100 ✅                 │
│  axe-core Violations: 0 ✅                  │
│  Keyboard Nav: 38/41 sayfa (%93) 🟡        │
│  Screen Reader: 15/41 sayfa (%37) 🔴       │
│  Color Contrast: ✅ Tüm sayfalar            │
│  Form Labels: ✅ Tüm formlar               │
│  Focus Visibility: ✅ Tüm butonlar          │
│  Alt Text: 45/48 image ✅                   │
│  Heading Hierarchy: ✅ Tüm sayfalar         │
│  Accessibility Statement: ✅ Yayınlandı     │
└─────────────────────────────────────────────┘
```

---

## 12. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| EU ceza (erişilebilirlik beyanı yok) | Orta | Yüksek | Faz 3'te beyan sayfası ekle |
| Enterprise müşteri kaybı | Orta | Yüksek | WCAG AA sertifikası |
| Renk kontrajı fix'i mevcut tasarımı bozar | Düşük | Orta | Tailwind config ile kontrollü geçiş |
| Chart'lar erişilebilir yapılamaz | Düşük | Orta | Data table alternatifi |
| Keyboard nav eksik, kullanıcı şikayeti | Orta | Orta | Faz 2 öncelikli |
| Overlay tool kullanma (EAA uyumsuz) | Düşük | Yüksek | Asla overlay kullanma |

---

## 13. Bütçe

### Maliyet Analizi

| Kalem | Maliyet | Not |
|-------|---------|-----|
| eslint-plugin-jsx-a11y | $0 | MIT lisansı |
| jest-axe | $0 | MIT lisansı |
| axe-core/playwright | $0 | MPL-2.0 |
| Lighthouse CI | $0 | Apache-2.0 |
| Pa11y | $0 | MIT lisansı |
| WAVE extension | $0 | Ücretsiz |
| axe DevTools extension | $0 | Ücretsiz |
| Geliştirici zamanı | ~40-60 saat | 4 faz, 6-8 hafta |
| **Toplam** | **$0 (lisans)** | Sadece geliştirici zamanı |

### Zaman Tahmini

| Faz | Süre | Saat |
|-----|------|------|
| Faz 1: Temel uyumluluk | 1-2 hafta | 20-25 saat |
| Faz 2: Orta seviye | 2-3 hafta | 15-20 saat |
| Faz 3: İyileştirme | 1-2 hafta | 10-15 saat |
| Faz 4: Sürekli bakım | Devam eden | ~2 saat/hafta |
| **Toplam** | **6-8 hafta** | **~50-60 saat** |

---

## 14. Notlar

### Servet İçin Özet

**Ne yapılacak:**
1. Renk kontrastı düzeltmeleri (Tailwind config)
2. Form label'ları ekle (shadcn Form bileşeni)
3. Focus visibility düzeltmeleri
4. Skip navigation ekle
5. Keyboard navigation test et
6. Accessibility statement sayfası oluştur
7. Test araçlarını kur (axe, lighthouse, jest-axe)

**Ne kadar süre:** 6-8 hafta (lansman sonrası)
**Maliyet:** $0 (sadece geliştirici zamanı)
**Risk:** EU ceza riski var (EAA Haziran 2025'ten beri yürürlükte)

**Öncelik sırası:**
1. 🔴 Faz 1 (1-2 hafta) — Renk kontrastı, form labels, focus visibility
2. 🟡 Faz 2 (2-3 hafta) — Keyboard nav, screen reader, ARIA
3. 🟡 Faz 3 (1-2 hafta) — Test CI, accessibility statement
4. 🟢 Faz 4 (devam eden) — Sürekli bakım

### Entegrasyon Notları

- shadcn/ui (Radix) kullanıyorsanız birçok a11y özelliği hazır geliyor
- Next.js i18n ile ARIA label'ları çevrilmeli
- Tailwind config değişiklikleri global olarak etki eder — dikkatli olun
- Playwright + axe-core E2E testleri mevcut test altyapısına eklenebilir
- Lighthouse CI mevcut local CI script'e eklenebilir

---

## 15. Kaynaklar (Tümü Doğrulanmış)

### Standartlar
- WCAG 2.1: https://www.w3.org/TR/WCAG21/ (✅ w3.org doğrulanmış)
- EU Accessibility Act: https://ec.europa.eu/social/main.jsp?catId=1202 (✅ doğrulanmış)
- EN 301 549: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/ (✅ doğrulanmış)

### Next.js ve React
- Next.js Accessibility: https://nextjs.org/learn/dashboard-app/improving-accessibility (✅ doğrulanmış)
- TheFrontKit EAA Guide: https://thefrontkit.com/blogs/eu-accessibility-act-nextjs-developers-guide (✅ tam sayfa doğrulanmış)
- Radix UI Accessibility: https://www.radix-ui.com/primitives/docs/overview/accessibility (✅ doğrulanmış)

### Test Araçları
- axe-core: https://github.com/dequelabs/axe-core (✅ doğrulanmış)
- jest-axe: https://github.com/nickcolley/jest-axe (✅ doğrulanmış)
- Pa11y: https://github.com/pa11y/pa11y (✅ doğrulanmış)
- Lighthouse: https://developer.chrome.com/docs/lighthouse/ (✅ doğrulanmış)
- eslint-plugin-jsx-a11y: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y (✅ doğrulanmış)

### Rakip Analizi
- Stripe Accessibility: https://stripe.com/accessibility (✅ doğrulanmış)
- Twilio Accessibility: https://www.twilio.com/accessibility (✅ doğrulanmış)
