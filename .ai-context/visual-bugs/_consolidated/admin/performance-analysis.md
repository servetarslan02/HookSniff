# 🔍 Performance Deep Audit — HookSniff Dashboard

**Tarih:** 2026-05-10  
**Analiz Tipi:** Dosya tabanlı statik analiz (browser yok)

---

## 📊 Genel Bakış

| Metrik | Değer |
|--------|-------|
| **Framework** | Next.js 15.5.15 (App Router) |
| **React** | v19 |
| **TypeScript** | v5+ |
| **CSS** | Tailwind CSS 3.4 + PostCSS |
| **Toplam TSX Dosyası** | 179 |
| **Toplam Kod Satırı** | ~38,816 |
| **'use client' Dosya Sayısı** | 82 (tüm dosyaların %45.8'i) |
| **Desteklenen Diller** | 8 (en, tr, de, ja, pt-BR, es, fr, ko) |

---

## 🚨 Kritik Bulgular

### 1. ⚠️ DEVASA Blog Sayfası — 1,922 Satır
**Dosya:** `src/app/[locale]/blog/[slug]/page.tsx`

Bu dosya **1,922 satır** ile projenin açık ara en büyük dosyası. İçerik:
- Blog postlarının tamamı **hardcoded** (statik string olarak kod içinde)
- `posts` objesi muhtemelen yüzlerce blog yazısını tek bir dosyada tutuyor
- Bu sayfa her locale için build-time'da derleniyor (8 locale × N blog postu)

**Risk:**
- **Build time patlaması:** 8 locale × tüm blog postları = büyük build süresi
- **First Load JS:** Eğer bu sayfa client component'e dönüşürse, tüm blog content'i bundle'a girer
- **Bakım kabusu:** 1,922 satırlık dosyada blog eklemek/değiştirmek riskli

**Öneri:**
```
✅ Blog içeriklerini MDX/Markdown dosyalarına taşı
✅ contentlayer veya next-mdx-remote kullan
✅ generateStaticParams ile sadece mevcut postları build et
✅ Blog listesiniкомпонента böl (BlogCard, BlogContent, vb.)
```

### 2. ⚠️ 'use client' Oranı Çok Yüksek — %45.8
**82 dosya** `'use client'` directive kullanıyor. Bu, tüm sayfaların ve componentlerin neredeyse yarısının client-side render edildiği anlamına geliyor.

**Risk:**
- **hydration maliyeti:** Client component'ler SSR sonrası yeniden hydrate edilir
- **JS bundle şişmesi:** Client component'ler tüm bağımlılıklarını client'a gönderir
- **TTFB etkisi:** Client component'ler streaming SSR'dan tam yararlanamaz

**En Çok 'use client' Olan Klasörler:**
| Klasör | Sayı |
|--------|------|
| `src/app/[locale]/dashboard/` | ~30+ sayfa |
| `src/components/` | ~19 component |
| `src/app/[locale]/admin/` | ~6 sayfa |

**Öneri:**
```
✅ Dashboard layout'unu kontrol et — gereksiz client wrapping var mı?
✅ 'use client' olmadan çalışabilecek component'leri server component yap
✅ Interactive olmayan component'leri (StatCard, ChartCard vb.) server'a taşı
✅ Mümkün olduğunca client boundary'yi叶子 component'lere indir
```

### 3. ⚠️ Recharts Import — Eager Loading
**Dosyalar:**
- `src/app/[locale]/admin/page.tsx` → PieChart, Pie, Cell, ResponsiveContainer, Tooltip
- `src/app/[locale]/admin/revenue/page.tsx` → BarChart, Bar, XAxis, YAxis, vb.

Recharts **ağır bir kütüphane** (~400KB+ gzipped). Doğrudan import edilmesi:
- Admin sayfalarının bundle boyutunu patlatır
- Kullanıcılar admin paneline gitmese bile, navigation prefetch ile JS yüklenebilir

**Öneri:**
```
✅ Recharts importlarını dynamic() ile lazy load et
✅ Veya lighter alternatif kullan (Chart.js, lightweight-charts)
✅ Admin sayfalarını ayrı bir route group'a al (ayrı chunk)
```

### 4. ⚠️ Screenshots Klasörü — 440KB
```
public/screenshots/           → 440KB toplam
├── compare-hero.jpg          → 126KB
├── compare-sections.jpg      → 126KB
├── scorecard.jpg             → 126KB
├── playground.png            → 48KB
└── build-vs-buy.png          → 7.8KB
```

**Risk:**
- Bu görseller `public/` altında olduğu için **optimize edilmeden** sunuluyor
- Next.js Image component'i kullanılmamış olabilir (sadece 4 dosyada `next/image` import var)

**Öneri:**
```
✅ Tüm <img> tag'lerini <Image from 'next/image'> ile değiştir
✅ public/screenshots altındaki görselleri optimize et (WebP, quality ayarı)
✅ OG image (60KB) için AVIF formatı dene
✅ Favicon'lar küçük (16KB toplam) — sorun yok
```

---

## 🟡 Orta Seviye Bulgular

### 5. Font Loading — İyi Yapılandırılmış ✅
```typescript
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-jetbrains-mono' });
```
- `display: 'swap'` doğru kullanılmış → FOIT yok
- CSS variable ile uygulanmış → esnek
- `next/font/google` kullanılmış → self-hosted, harici istek yok

**Değerlendirme:** ✅ Bu kısım iyi yapılandırılmış.

### 6. Image Optimization — Kısmen Uygulanmış ⚠️
```typescript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [{ protocol: 'https', hostname: '**' }],
}
```
- AVIF/WebP formatları yapılandırılmış ✅
- Ama sadece **4 dosyada** `next/image` import edilmiş
- `public/screenshots` altındaki görseller muhtemelen `<img>` ile yükleniyor

### 7. Animasyonlar — 6 Custom Animation Tanımlı
```javascript
// tailwind.config.js
animation: {
  'gradient-shift': '8s ease infinite',
  'fade-in-up': '0.5s ease-out',
  'float': '6s ease-in-out infinite',
  'shimmer': '2s ease-in-out infinite',
  'count-up': '1s ease-out',
  'glow-pulse': '2s ease-in-out infinite',
}
```
- `float` ve `glow-pulse` infinite animasyonlar → **GPU kullanımı**
- `shimmer` background-position animasyonı → paint-heavy

**Öneri:**
```
✅ Infinite animasyonları `prefers-reduced-motion` media query ile koşullu yap
✅ Shimmer yerine transform-based animasyon kullan (GPU-accelerated)
✅ Float animasyonunu sadece hero section'da kullan,全局 değil
```

### 8. Code Splitting — Minimal Kullanım ⚠️
Sadece **2 dynamic import** tespit edildi:
```typescript
// src/app/[locale]/page.tsx
const ThemeToggleBtn = dynamic(() => import('@/components/ThemeToggle'), { ssr: false });
const LanguageSwitcherBtn = dynamic(() => import('@/components/LanguageSwitcher'), { ssr: false });
```

**Risk:**
- 179 dosyadan sadece 2'si dynamic import
- Dashboard sayfaları ve admin sayfaları eager load

**Öneri:**
```
✅ Admin sayfalarını dynamic import ile lazy load et
✅ Playground sayfasını dynamic import ile lazy load et (695 satır)
✅ Chart/Graph component'lerini dynamic import et
```

### 9. Data Fetching — 15 useEffect/useState/fetch Kullanımı
Dashboard ana sayfasında (`src/app/[locale]/dashboard/page.tsx`) **15 adet** useEffect/useState/fetch pattern var.

**Risk:**
- Client-side data fetching → waterfall效应
- Cache-Control header'ları sadece API route'da (`s-maxage=30`)

**Öneri:**
```
✅ Server component'lerde fetch() kullan (Next.js 15 automatic caching)
✅ React Suspense ile streaming data fetching
✅ SWR veya React Query ile client-side caching
```

### 10. Middleware — Hafif ✅
```typescript
// src/middleware.ts
export default createMiddleware(routing);
// Matcher: /((?!api|_next|_vercel|.*\.\.*).*) /
```
- next-intl middleware sadece locale routing yapıyor
- Statik dosyalar exclude edilmiş
- **Performans etkisi minimal**

---

## ✅ İyi Yapılmış Şeyler

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| **Font Loading** | ✅ İyi | `next/font/google` + `display: swap` |
| **Image Config** | ✅ İyi | AVIF/WebP formatları yapılandırılmış |
| **Security Headers** | ✅ Mükemmel | CSP, X-Frame-Options, vb. hepsi mevcut |
| **Static Params** | ✅ İyi | Blog, changelog, customers için `generateStaticParams` |
| **Error Handling** | ✅ İyi | `error.tsx`, `loading.tsx`, `not-found.tsx` mevcut |
| **Middleware** | ✅ İyi | Hafif, sadece locale routing |
| **API Proxy** | ✅ İyi | Rewrite ile CORS sorunu yok |
| **Static OG Image** | ✅ İyi | SVG + PNG fallback |

---

## 📈 Öncelikli Aksiyon Planı

### 🔴 Yüksek Öncelik (Hemen yapılmalı)

| # | Aksiyon | Etki | Zorluk |
|---|---------|------|--------|
| 1 | Blog sayfasını parçala (1,922 satır → MDX) | 🔴 Yüksek | 🟡 Orta |
| 2 | Recharts'i dynamic import et | 🔴 Yüksek | 🟢 Kolay |
| 3 | 'use client' sayısını azalt (82 → ~40) | 🔴 Yüksek | 🟡 Orta |

### 🟡 Orta Öncelik (1-2 hafta)

| # | Aksiyon | Etki | Zorluk |
|---|---------|------|--------|
| 4 | Screenshot görsellerini optimize et (WebP) | 🟡 Orta | 🟢 Kolay |
| 5 | Dashboard data fetching'i server'a taşı | 🟡 Orta | 🟡 Orta |
| 6 | Infinite animasyonları koşullu yap | 🟡 Orta | 🟢 Kolay |

### 🟢 Düşük Öncelik (Sprint boşluğunda)

| # | Aksiyon | Etki | Zorluk |
|---|---------|------|--------|
| 7 | Admin sayfalarını route group'a al | 🟢 Düşük | 🟢 Kolay |
| 8 | Playground sayfasını dynamic import et | 🟢 Düşük | 🟢 Kolay |
| 9 | Count-up animasyonunu performans için optimize et | 🟢 Düşük | 🟢 Kolay |

---

## 📊 Tahmini Bundle Analizi

| Chunk | Tahmini Boyut | Not |
|-------|---------------|-----|
| **Framework (Next.js + React)** | ~150KB gz | Sabit |
| **next-intl** | ~30KB gz | 8 locale dosyası |
| **Recharts** | ~120KB gz | ⚠️ Admin'de eager load |
| **Dashboard pages** | ~200KB gz | 30+ client component |
| **Blog page** | ~50KB gz | Hardcoded content |
| **Components** | ~80KB gz | 19 client component |
| **Toplam tahmini** | **~630KB gz** | İlk yükleme |

**Hedef:** ~400KB gz (Recharts lazy load + 'use client' azaltma ile ulaşılabilir)

---

## 🔧 Teknik Detaylar

### Next.js Config
```javascript
reactStrictMode: true          // ✅ İyi
images.formats: ['avif', 'webp'] // ✅ İyi
CSP headers: strict             // ✅ İyi
API rewrites: Cloud Run backend // ✅ İyi (CORS yok)
```

### Tailwind Config
```javascript
darkMode: 'class'               // ✅ İyi (system preference değil, manuel kontrol)
content: ['./src/**/*.{js,ts,jsx,tsx,mdx}']  // ✅ İyi (tree-shake)
plugins: ['@tailwindcss/forms'] // ✅ Minimal
```

### Dependencies
```
Production deps: 8 (minimal ✅)
Dev deps: 13 (normal)
```

**Dikkat çekici:**
- `@upstash/redis` → Edge-compatible cache
- `recharts` → ⚠️ Ağır charting kütüphanesi
- `lucide-react` → Icon library (tree-shakeable ✅)

---

## 📝 Sonuç

HookSniff Dashboard'un **altyapısı iyi kurulmuş** (Next.js 15, App Router, proper font loading, security headers). Ana performans sorunları:

1. **Blog sayfası** (1,922 satır hardcoded content) — en büyük teknik borç
2. **'use client' oranı** (%45.8) — client hydration maliyeti
3. **Recharts eager loading** — admin sayfaları gereksiz şişiriyor

Bu üç sorun çözülürse, tahmini bundle **~630KB gz → ~400KB gz** aralığına düşebilir.

---

*Rapor: Dosya tabanlı statik analiz. Runtime performans ölçümü için Lighthouse/PageSpeed Insights gereklidir.*
