# 🐛 HookSniff — Kapsamlı Görsel Denetim Raporu (FINAL)

> **Tarih:** 2026-05-10 16:30-16:46 GMT+8  
> **Denetim Metodu:** 5 paralel AI agent + kaynak kod analizi  
> **Toplam Taranan Sayfa:** ~70 public sayfa (dashboard hariç)  
> **Dashboard URL:** https://hooksniff.vercel.app/tr  

---

## 📊 GENEL ÖZET

| Severity | Adet | Açıklama |
|----------|------|----------|
| 🔴 Critical | **12** | Boş sayfa, 404, routing çökmesi, sistematik çeviri eksikliği |
| 🟠 High | **35** | Tamamen İngilizce içerik, kırık link, çift branding |
| 🟡 Medium | **30** | Karışık footer, dark mode eksik, SEO title |
| 🟢 Low | **5** | Küçük iyileştirmeler |
| **TOPLAM** | **~82** | |

---

## 🔴 KRİTİK BULGULAR (12)

### 1. SİSTEMATİK ÇEVİRİ BAŞARISIZLIĞI — TÜM SAYFALAR
**Severity:** 🔴 Critical | **Etkilenen:** ~65/70 sayfa

Türkçe locale (`/tr/`) altında olmasına rağmen, sayfa içeriklerinin **büyük çoğunluğu İngilizce**. Sadece navigation bar ve bazı sidebar linkleri Türkçe.

**Tamamen Türkçe olan sayfalar (sadece 3):**
- `/tr` (landing page) ✅
- `/tr/faq` ✅
- `/tr/get-started` ✅

**Kısmen Türkçe olan sayfalar (3):**
- `/tr/pricing` — kartlar Türkçe,SectionsIn İngilizce
- `/tr/privacy` — başlık Türkçe, body İngilizce
- `/tr/terms` — başlık Türkçe, body İngilizce

**Tamamen İngilizce olan sayfalar (~64):**
- Tüm docs sayfaları (15)
- Tüm alternatives sayfaları (8)
- Tüm blog sayfaları (12+)
- Tüm customers sayfaları (6)
- Tüm providers sayfaları (4)
- Changelog, webhooks, compare, status, security, about, contact, vb.

**Neden:** Sayfa içerikleri hardcoded İngilizce metin olarak yazılmış. `useTranslations()` hook'u sadece dashboard component'lerinde kullanılıyor, public sayfalarda içerik doğrudan JSX içinde İngilizce.

---

### 2. `/tr/blog/hooksniff-vs-svix` — BOŞ SAYFA (Loading Spinner)
**Severity:** 🔴 Critical | **Kategori:** Routing

Bu URL'e gidildiğinde sadece loading spinner (🪝 emoji) görünüyor, hiçbir içerik yüklenmiyor. Blog listing'de bu slug'a link var ama sayfa boş dönüyor. Gerçek karşılaştırma yazısı `/tr/blog/hooksniff-vs-svix-vs-hookdeck` adresinde.

---

### 3. `/tr/docs/api` — 404 HATASI
**Severity:** 🔴 Critical | **Kategori:** Routing/Link

API Referansı sayfası 404 döndürüyor. Sidebar'da bu sayfaya link var ama sayfa mevcut değil. Tüm doc sayfalarından kırık link.

---

### 4. Footer Eksik — ~40 Sayfa
**Severity:** 🔴 Critical | **Kategori:** Layout

Sadece landing page (`/tr`) ve doc sayfalarında footer var. Aşağıdaki sayfalarda footer **tamamen eksik:**
- Blog (listing + tüm postlar)
- Changelog
- Customers (listing + tüm hikayeler)
- Alternatives (8 sayfa)
- Providers (4 sayfa)
- Compare
- About, Contact, Security, Privacy, Terms, Status, Playground, vb.

---

### 5. Dark Mode Toggle Eksik — ~60 Sayfa
**Severity:** 🔴 Critical | **Kategori:** UX

Dark mode toggle butonu sadece landing page'de var. Diğer tüm sayfalarda toggle görünmüyor. Kullanıcı dark mode'u sadece landing page'den açabilir, diğer sayfalarda kapatamaz.

---

### 6. Routing Tutarsızlığı — Blog ve Changelog
**Severity:** 🔴 Critical | **Kategori:** Routing

- `/tr/blog` — İlk ziyarette homepage, ikincisinde FAQ, üçüncüsünde doğru blog yüklüyor (non-deterministik)
- `/tr/changelog` — Bazen homepage'e, bazen docs security sayfasına yönlendiriyor

---

### 7. `/tr/docs` Kart Linklerinde Locale Prefix Eksik
**Severity:** 🔴 Critical | **Kategori:** Link

Doc ana sayfasındaki 8 kart linki `/docs/xxx`'e gidiyor, `/tr/docs/xxx`'e değil. Kullanıcı tıkladığında EN locale'e gider.

---

### 8. Customer "Read story →" Linkleri Kırık
**Severity:** 🔴 Critical | **Kategori:** Link

`/tr/customers` sayfasındaki "Read story →" linkleri `/tr/docs/dlq`'ya gidiyor. Olması gereken: `/tr/customers/[slug]`.

---

## 🟠 YÜKSEK SEVERITY BULGULAR (35)

### SEO Title Sorunları
| Sorun | Etkilenen Sayfa |
|-------|----------------|
| Tüm sayfalarda aynı title: "HookSniff — Webhook Delivery Service" | ~70 sayfa |
| Çift branding: "HookSniff Blog \| HookSniff" | Blog postlar |
| Title İngilizce (Türkçe locale'de) | Tüm sayfalar |

### Nav Bar Tutsızlığı
| Nav Tipi | Göründüğü Yer |
|----------|---------------|
| Tam nav bar (linkler + dark mode + panel butonu) | Sadece `/tr` |
| Breadcrumb-only (sadece dil seçici) | Blog, Changelog, Customers, Alternatives, Providers |
| Sol sidebar + breadcrumb | Docs sayfaları |

Kullanıcı content sayfasındaysa ana bölümlere geçiş yapamıyor.

### Hardcoded İngilizce Metinler (En Kritik)
| Sayfa | Hardcoded Sayısı |
|-------|-----------------|
| `/tr/use-cases` | 146 |
| `/tr/playground` | 81 |
| `/tr/customers/[slug]` | 108 |
| `/tr/pricing` | 104 |
| `/tr/blog/[slug]` | 76 |
| `/tr/customers` | 71 |
| `/tr/compare` | 80 |
| Dashboard sayfaları (32) | Login gerekli, test edilemedi |

### Footer Karışık Çeviri
Footer'da bazı linkler Türkçe ("Hakkında", "İletişim", "SSS"), diğerleri İngilizce ("Pricing", "Use Cases", "Compare"). Aynı footer içinde karışık dil.

### Breadcrumb Sorunları
- "Alternatives" linki kendini işaret ediyor (`/tr/alternatives/svix` → `/tr/alternatives/svix`)
- Karışık dil: "Alternatives" İngilizce, "HookSniff" marka adı

---

## 🟡 ORTA SEVERITY BULGULAR (30)

### Layout/Overflow
| Sorun | Sayfa |
|-------|-------|
| Code block horizontal overflow (377px taşma) | Landing page (mobil) |
| Comparison table overflow (11-56px) | Alternatives, Compare |
| Infrastructure logoları metin (GC, NP, UR) | Customers |
| Hero text truncation ("sistem\|") | Landing page |
| Boş beyaz alan (300px+) | Alternatives sayfaları |

### Mobil Sorunlar
| Sorun | Sayfa |
|-------|-------|
| Footer touch target 20px (min 44px) | Landing page footer |
| Nav toggle 40×40px (min 44×44px) | Landing page (mobil) |
| Horizontal scroll | Blog, Alternatives |

### Login/Register Sorunları
| Sorun | Açıklama |
|-------|----------|
| "Forgot Password?" linki yok | Backend endpoint var, frontend link eksik |
| Loading spinner yok | API çağrısı sırasında göstergesi yok |
| Hata mesajı form değiştirince kaybolmuyor | Login ↔ Register geçişinde |
| "Or continue with" İngilizce | Türkçe locale'de |
| Empty alert element | DOM'da boş `<alert>` |

### RSS Link Hatası
- Changelog RSS linki `/blog/rss`'e gidiyor (doğrusu `/changelog/rss`)

### Sızan Import
- `/tr/docs/sdks` sayfasında Node.js örneğinde `import { useTranslations } from 'next-intl'` — SDK kodu değil

---

## 🟢 DÜŞÜK SEVERITY (5)

- Typewriter efektinde `|` cursor karakteri görünüyor
- Language switcher her zaman "TR Türkçe" gösteriyor (içerik İngilizce olsa bile)
- SDK docs'ta karışık başlık stili (Python Türkçe, Node.js İngilizce)
- Dark mode mekanizması belirsiz (class vs data-attribute)
- Client-side auth redirect timing (kısa flash)

---

## 🔍 ROUTING ANALİZİ (Kaynak Kod)

### Mevcut Yapı
```
middleware.ts → next-intl middleware (localePrefix: 'always')
i18n/routing.ts → 8 locale: en, tr, de, ja, pt-BR, es, fr, ko
next.config.js → API rewrite + security headers
layout.tsx → getTranslations('landing') ile metadata
```

### Routing Çökmesinin Muhtemel Nedenleri

1. **Blog slug çakışması:** `/tr/blog/hooksniff-vs-svix` ayrı bir route olarak tanımlı ama bu slug blog posts map'inde yok. `hooksniff-vs-svix-vs-hookdeck` var. Bu durum boş sayfa/döngüye neden olabilir.

2. **SSG/ISR conflict:** Blog ve changelog sayfaları `generateStaticParams` ile statik üretiliyor olabilir ama dynamic route handler tutarsız çalışabilir.

3. **Client-side hydration mismatch:** Bazı sayfalar SSR'da boş dönüyor (sadece loading spinner), client-side'da yükleniyor. Bu non-deterministik routing'e neden oluyor.

4. **Metadata title sabit:** `layout.tsx`'de `title.default: 'HookSniff — Webhook Delivery Service'` hardcoded — tüm sayfalar aynı title'ı alıyor.

---

## 📋 DÜZELTME ÖNCELİK SIRASI

### Öncelik 1 — Kritik (Hemen yapılmalı)
1. ✅ `/tr/docs/api` sayfasını oluştur (404 fix)
2. ✅ `/tr/blog/hooksniff-vs-svix` routing fix (boş sayfa)
3. ✅ Blog/changelog routing tutarsızlığını çöz
4. ✅ Doc kart linklerine `/tr` prefix ekle
5. ✅ Customer "Read story" linklerini düzelt

### Öncelik 2 — Yüksek (Bu oturum)
6. ⬜ Footer'ı tüm sayfalara ekle (layout component)
7. ⬜ Dark mode toggle'ı root layout'a taşı
8. ⬜ Nav bar'ı tüm sayfalarda tutarlı hale getir
9. ⬜ SEO title'ları sayfaya özel yap

### Öncelik 3 — Orta (Sonraki oturum)
10. ⬜ En kritik sayfaları Türkçeleştir (pricing, docs, blog)
11. ⬜ Login/register UX fix'leri
12. ⬜ Mobil overflow fix'leri
13. ⬜ Footer çeviri tutarlılığı

### Öncelik 4 — Düşük (İleride)
14. ⬜ Tüm sayfaları Türkçeleştir
15. ⬜ RSS link fix
16. ⬜ Sızan import temizle
17. ⬜ SDK docs başlık tutarlılığı

---

## 📁 İLGİLİ DOSYALAR

| Dosya | Açıklama |
|-------|----------|
| `.ai-context/visual-bugs/AUDIT-MARKETING.md` | 18 sayfa detaylı rapor |
| `.ai-context/visual-bugs/AUDIT-DOCS.md` | 15 docs sayfası detaylı rapor |
| `.ai-context/visual-bugs/AUDIT-ALTERNATIVES.md` | 13 alternatives/providers sayfası detaylı rapor |
| `.ai-context/visual-bugs/AUDIT-BLOG-CONTENT.md` | 23 blog/changelog/customers sayfası detaylı rapor |
| `.ai-context/visual-bugs/01-ROUTING.md` | Önceki routing analizi |
| `.ai-context/visual-bugs/03-TRANSLATION.md` | Önceki çeviri analizi |

---

*Bu rapor 5 paralel AI agent tarafından ~70 sayfanın taranması ve kaynak kod analizi sonucu oluşturulmuştur.*
