# 📋 Sonraki Oturum Rehberi — Gelişmiş Yükleme Sistemleri (v3)

> **Son güncelleme:** 2026-05-26
> **Bu dosya her oturum başında okunur.** Yeni oturum buradan devam eder.

---

## 🚀 Hızlı Başlangıç (Her Oturum)

```bash
cd /root/.openclaw/workspace/HookSniff
git pull origin main
cat .ai-context/gelismis-yukleme-sistemleri/NEXT_SESSION.md
cat .ai-context/gelismis-yukleme-sistemleri/MEMORY.md
```

---

## 📍 Tüm Adımlar — Durum Takibi

| # | Adım | Katman | Durum | Tarih | Commit |
|---|------|--------|-------|-------|--------|
| 0 | QueryClient optimizasyonu | 1 | ✅ | 2026-05-25 | 707b64e0 |
| 1 | Layout Suspense Boundaries | 2 | ✅ | 2026-05-26 | (pending push) |
| 2 | Virtual Scrolling | 3 | ✅ | 2026-05-26 | 0981bc4a, 805a5b67, 6d33f997, bde296d8, dd3bdceb |
| 3 | Concurrent Features | 4 | ✅ | 2026-05-26 | e3b74c99, c6b29fda |
| 4 | Akıllı Prefetch | 5 | ✅ | 2026-05-26 | 6b4061dc, 00fb2d4b |
| 5 | Build Fix + Cache Components Prep | 6 | ✅ | 2026-05-26 | c306d5be, ebf5ab55 |
| 6 | Cache Components (use cache) | 6 | ⏳ | — | — |
| 7 | View Transitions | 7 | ⏳ | — | — |
| 8 | Turbopack | 8 | ⏳ | — | — |
| 9 | React Compiler | 9 | ⏳ | — | — |
| 10 | PPR | 10 | ⏳ | — | — |
| 11 | Infinite Scroll | 12 | ⏳ | — | — |
| 12 | <Activity/> | 11 | ⏳ | — | — |
| 13 | Service Worker + PWA | 13 | ⏳ | — | — |
| 14 | TanStack DB | 14 | ⏳ | — | — |

---

## 🔜 Sıradaki Adım: ADIM 6 — Cache Components (Katman 6)

### Neden Erteleme?

`cacheComponents: true` aktifken, tüm sayfalar `getTranslations` kullandığı için "Uncached data was accessed outside of <Suspense" hatası alıyor. **60+ docs sayfası** refactor edilmeli:

1. Her docs sayfasının içeriğini ayrı bir component'e taşı
2. Sayfada Suspense ile sar
3. `getTranslations` çağıran component'i Suspense içine koy

### Ne Yapılacak?

```tsx
// docs/quickstart/page.tsx — ÖRNEK
import { Suspense } from 'react';
import { QuickstartContent } from './content';

export const metadata = { title: 'Quickstart — HookSniff' };

export default function QuickstartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuickstartContent />
    </Suspense>
  );
}

// docs/quickstart/content.tsx — YENİ
import { getTranslations } from 'next-intl/server';

export async function QuickstartContent() {
  const t = await getTranslations('docs');
  return <div>...</div>;
}
```

### Adım Adım

1. **next.config.js**: `cacheComponents: true` aç
2. **Her docs sayfası**: İçeriği ayrı component'e taşı, Suspense ile sar
3. **`cargo check + cargo test`**
4. **`npm run build`** — hata varsa düzelt
5. **Commit + push**

### Tahmini Süre: 2-3 oturum (60+ sayfa)

---

## ⚠️ Kritik Kurallar (Her Oturum)

1. **Tek seferde bir adım**
2. **Her adımda test** — `cargo check + cargo test + npm run build`
3. **Temiz geçiş** — Yeni kod çalışınca eski kodu SİL
4. **Commit at** — Her başarılı adımda commit + push
5. **.ai-context dosyalarını güncelle**
6. **Duplikasyon yok**

---

## 📊 Oturum Zaman Planı (1 Saat)

| Dakika | İşlem |
|--------|-------|
| 0-5 | Repo pull, hafıza oku |
| 5-25 | Sıradaki adımı uygula |
| 25-30 | Test et |
| 30-35 | Hata varsa düzelt |
| 35-50 | İkinci adıma başla |
| 50-55 | Test et |
| 55-60 | Commit + push + MEMORY.md güncelle |

---

## 🔧 Bu Oturumda Yapılan (2026-05-26 — OpenClaw 5. Oturum)

### Yapılan
1. **7 alternatif sayfası düzeltildi** — Eksik `{` ve `<div>` wrapper
2. **Blog sistemi refactor edildi** — `posts.ts` çıkarıldı, `BlogPostContent.tsx` yeniden yazıldı
3. **Changelog sayfası Suspense ile sarıldı** — `ChangelogEntryContent.tsx` oluşturuldu
4. **Customer StoryContent yeniden yazıldı** — `useParams` ile düzeltildi
5. **Eksik translation key'leri eklendi** — `compare.sdks`, `alternatives.*`, `customers.*`
6. **`cacheComponents` geçici olarak devre dışı bırakıldı** — 60+ docs sayfası Suspense gerektiriyor
7. **Build başarıyla geçti** ✅
8. **GitHub'a push edildi** — commit: ebf5ab55

### Plan Değerlendirmesi
- Cache Components (Katman 6) ertelendi — büyük refactor gerekiyor
- View Transitions (Katman 7) sonraki adım olarak yapılabilir
- Turbopack (Katman 8) zaten aktif (Next.js 16 default)
- React Compiler (Katman 9) zaten aktif (`reactCompiler: true`)

---

*Bu dosya her oturumda güncellenir. v3: Cache Components ertelendi, build düzeltmeleri yapıldı.*
