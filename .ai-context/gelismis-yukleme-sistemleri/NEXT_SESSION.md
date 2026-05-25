# 📋 Sonraki Oturum Rehberi — Gelişmiş Yükleme Sistemleri (v2)

> **Son güncelleme:** 2026-05-26
> **Bu dosya her oturum başında okunur.** Yeni oturum buradan devam eder.

---

## 🚀 Hızlı Başlangıç (Her Oturum)

```bash
# 1. Repo güncelle
cd /root/.openclaw/workspace/HookSniff
git pull origin main

# 2. Hafıza oku (ÖNCELİK SIRASI!)
cat .ai-context/gelismis-yukleme-sistemleri/GECIS_STRATEJISI.md  ← ⚠️ İLK BUNU OKU
cat .ai-context/gelismis-yukleme-sistemleri/NEXT_SESSION.md      ← BU DOSYA
cat .ai-context/gelismis-yukleme-sistemleri/PAGE_TRACKER.md      ← Sayfa takibi
cat .ai-context/gelismis-yukleme-sistemleri/MEMORY.md            ← Yapılan işler

# 3. Kalınan yerden devam et
```

---

## 📍 Tüm Adımlar — Durum Takibi

| # | Adım | Katman | Durum | Tarih | Commit |
|---|------|--------|-------|-------|--------|
| 0 | QueryClient optimizasyonu | 1 | ✅ | 2026-05-25 | 707b64e0 |
| 1 | Layout Suspense Boundaries | 2 | ✅ | 2026-05-26 | (pending push) |
| 2 | Virtual Scrolling | 3 | ✅ | 2026-05-26 | 0981bc4a, 805a5b67, 6d33f997, bde296d8 |

### Adım 1 Detay — Layout Suspense Boundaries (2026-05-26)

**Yapılan:**
- `LoadingSkeletons.tsx` oluşturuldu (SkeletonDashboard, SkeletonAdmin, SkeletonDocs)
- `(dashboard)/layout.tsx` → Suspense eklendi (SkeletonDashboard fallback)
- `admin/layout.tsx` → Suspense eklendi (SkeletonAdmin fallback)
- `docs/layout.tsx` → Suspense eklendi (SkeletonDocs fallback)

**Etki:** 172 sayfa — tüm dashboard/admin/docs sayfaları otomatik loading skeleton alır

**Sonraki adım:** Adım 3 — Concurrent Features (Katman 4)

### Adım 2 Detay — Virtual Scrolling (2026-05-26) ✅ TAMAMLANDI

**Yapılan (19/21 sayfa):**
- `LogsContent.tsx` → `VirtualTable` (@tanstack/react-virtual)
- `service-tokens/page.tsx` → `VirtualTable`
- `admin/users/UserTable.tsx` → `VirtualTable`
- `endpoints/EndpointsContent.tsx` → `VirtualList` (card layout)
- `notifications/page.tsx` → `VirtualList` (list layout)
- `alerts/page.tsx` → `VirtualList` (list layout)
- `api-keys/KeyList.tsx` → `VirtualList` (list layout)
- `team/TeamList.tsx` → `VirtualList` (list layout)
- `admin/activity/page.tsx` → `VirtualList` (grid layout)
- `admin/alerts/page.tsx` → `VirtualList` (list layout)
- `admin/feature-flags/page.tsx` → `VirtualList` (list layout)
- `audit-log/page.tsx` → `VirtualTable`
- `search/page.tsx` → `VirtualTable`
- `billing/InvoiceTable.tsx` → `VirtualTable`
- `schemas/page.tsx` → `VirtualList`
- `applications/page.tsx` → `VirtualList`
- `templates/page.tsx` → `VirtualList`
- `transforms/page.tsx` → `VirtualList`
- `environments/EnvironmentsContent.tsx` → `VirtualList`
- Build başarılı ✅

**Kalan (2 sayfa, düşük öncelik):**
- operational-webhooks/OperationalWebhooksList.tsx (az kayıt)
- inbound/InboundContent.tsx (az kayıt)

**Sonraki adım:** Adım 3 — Concurrent Features (Katman 4)
| 2 | Virtual Scrolling | 3 | ✅ | 2026-05-26 | 0981bc4a, 805a5b67, 6d33f997, bde296d8 |
| 3 | Concurrent Features | 4 | ⏳ | — | — |
| 4 | Akıllı Prefetch | 5 | ⏳ | — | — |
| 5 | Turbopack | 8 | ⏳ | — | — |
| 6 | React Compiler | 9 | ⏳ | — | — |
| 7 | Cache Components | 6 | ⏳ | — | — |
| 8 | View Transitions | 7 | ⏳ | — | — |
| 9 | PPR | 10 | ⏳ | — | — |
| 10 | Infinite Scroll | 12 | ⏳ | — | — |
| 11 | <Activity/> | 11 | ⏳ | — | — |
| 12 | Service Worker + PWA | 13 | ⏳ | — | — |
| 13 | TanStack DB | 14 | ⏳ | — | — |

---

## 🔜 Sıradaki Adım: ADIM 1 — Layout Suspense Boundaries

### Ne Yapılacak?

Dashboard, Admin ve Docs layout'larına `<Suspense>` boundaries ekle. **172 sayfa** tek seferde etkilenir.

### Dosyalar

| Dosya | İşlem |
|-------|-------|
| `dashboard/src/components/LoadingSkeletons.tsx` | **YENİ OLUŞTUR** |
| `dashboard/src/app/[locale]/(dashboard)/layout.tsx` | **DÜZENLE** — Suspense ekle |
| `dashboard/src/app/[locale]/admin/layout.tsx` | **DÜZENLE** — Suspense ekle |
| `dashboard/src/app/[locale]/docs/layout.tsx` | **DÜZENLE** — Suspense ekle |

### Adım Adım

#### 1.1 — LoadingSkeletons.tsx Oluştur

```tsx
// dashboard/src/components/LoadingSkeletons.tsx

export function SkeletonDashboard() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonAdmin() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDocs() {
  return (
    <div className="animate-pulse flex gap-6 p-6">
      <div className="w-64 space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-96" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}
```

#### 1.2 — Dashboard Layout'a Suspense Ekle

```tsx
// dashboard/src/app/[locale]/(dashboard)/layout.tsx
import { Suspense } from 'react';
import { SkeletonDashboard } from '@/components/LoadingSkeletons';

// Mevcut layout bileşenini bul, children'ı Suspense ile sarmala:
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MevcutDashboardShell>
      <Suspense fallback={<SkeletonDashboard />}>
        {children}
      </Suspense>
    </MevcutDashboardShell>
  );
}
```

#### 1.3 — Admin Layout'a Suspense Ekle

```tsx
// dashboard/src/app/[locale]/admin/layout.tsx
import { Suspense } from 'react';
import { SkeletonAdmin } from '@/components/LoadingSkeletons';

// Mevcut layout'u bul, Suspense ekle
```

#### 1.4 — Docs Layout'a Suspense Ekle

```tsx
// dashboard/src/app/[locale]/docs/layout.tsx
import { Suspense } from 'react';
import { SkeletonDocs } from '@/components/LoadingSkeletons';

// Mevcut layout'u bul, Suspense ekle
```

#### 1.5 — Test Et

```bash
cd /root/.openclaw/workspace/HookSniff
cargo check --workspace && cargo test --workspace
cd dashboard && npm run build && npm run test
# Manuel: Dashboard'u aç, skeleton görünüyor mu?
```

#### 1.6 — Commit

```bash
git add . && git commit -m "perf: layout Suspense boundaries — 172 sayfa otomatik loading" && git push
```

---

## 🔜 Adım 2-4: Virtual + Concurrent + Prefetch

(GECIS_STRATEJISI.md'deki detaylı talimatlar)

---

## 🔜 Adım 5: Turbopack

```js
// dashboard/next.config.js — tek satır ekle
module.exports = {
  turbo: true,  // ← 5-10x hızlı build
  // ... mevcut config
};
```

**Test:** `npm run build` — build süresini ölç.

---

## 🔜 Adım 6: React Compiler

```js
// dashboard/next.config.js
module.exports = {
  experimental: {
    reactCompiler: true,  // ← Otomatik memoization
  },
};
```

**Test:** `npm run build` — hata varsa düzelt. Manuel: tüm sayfalar çalışıyor mu?

---

## 🔜 Adım 7: Cache Components

```js
// dashboard/next.config.js
module.exports = {
  cacheComponents: true,  // ← "use cache" desteği
};
```

**Sonra statik sayfalara ekle:**
```tsx
// docs/page.tsx, pricing/page.tsx, about/page.tsx vb.
"use cache";

export default function DocsPage() {
  // Bu sayfa sunucuda cache'lenir, anında yüklenir
}
```

**Dinamik sayfalarda PPR:**
```tsx
// dashboard endpoints/page.tsx
import { Suspense } from 'react';

export default function EndpointsPage() {
  return (
    <div>
      {/* Statik kısım — anında yüklenir */}
      <PageHeader title="Endpoints" />
      
      {/* Dinamik kısım — stream edilir */}
      <Suspense fallback={<SkeletonTable />}>
        <EndpointsList />
      </Suspense>
    </div>
  );
}
```

**Test:** `npm run build`. Manuel: sayfa geçişleri anında mı?

---

## 🔜 Adım 8: View Transitions

```tsx
// dashboard/src/components/ViewTransition.tsx
'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ViewTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        // React otomatik günceller
      });
    }
    prevPath.current = pathname;
  }, [pathname]);

  return <>{children}</>;
}

// CSS ekle:
// ::view-transition-old(root) { animation: fade-out 0.2s ease-out; }
// ::view-transition-new(root) { animation: fade-in 0.2s ease-in; }
```

**Test:** Manuel: sayfa geçişlerinde animasyon var mı?

---

## 🔜 Adım 9: PPR (Partial Pre-Rendering)

```tsx
// Statik kısım + dinamik kısım ayırma
export default function DashboardPage() {
  return (
    <div>
      {/* Statik: header, sidebar, nav — anında yüklenir */}
      <DashboardHeader />
      <DashboardSidebar />
      
      {/* Dinamik: veri tabloları — stream edilir */}
      <Suspense fallback={<SkeletonDashboard />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
```

---

## 🔜 Adım 10: Infinite Scroll

```tsx
// dashboard/src/hooks/useInfiniteScroll.ts
import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(
  hasMore: boolean,
  isLoading: boolean,
  onLoadMore: () => void
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return sentinelRef;
}
```

**Kullanım:**
```tsx
const sentinelRef = useInfiniteScroll(hasMore, isLoading, loadMore);

return (
  <VirtualList items={items} ... />
  <div ref={sentinelRef} />  {/* Sentinel — görünürse yeni veri yüklenir */}
);
```

---

## 🔜 Adım 11: <Activity/>

```tsx
import { Activity } from 'react';

// Aktif olmayan sekmeleri duraklat
<Activity mode={isTabActive ? 'visible' : 'hidden'}>
  <HeavyComponent />
</Activity>
```

---

## 🔜 Adım 12: Service Worker

```bash
cd dashboard
npm install next-pwa
```

```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // mevcut config
});
```

---

## 🔜 Adım 13: TanStack DB

```bash
cd dashboard
npm install @tanstack/db
```

```tsx
// Collection tanımla
import { createCollection } from '@tanstack/db';

const endpointsCollection = createCollection({
  id: 'endpoints',
  getKey: (item) => item.id,
  sync: {
    syncFn: async ({ begin, write, commit }) => {
      const data = await fetch('/api/endpoints');
      begin();
      data.forEach(item => write({ type: 'insert', value: item }));
      commit();
    },
  },
});
```

---

## ⚠️ Kritik Kurallar (Her Oturum)

1. **Tek seferde bir adım**
2. **Her adımda test** — `cargo check + cargo test + npm run build`
3. **Temiz geçiş** — Yeni kod çalışınca eski kodu SİL
4. **Commit at** — Her başarılı adımda commit + push
5. **PAGE_TRACKER.md güncelle**
6. **MEMORY.md güncelle**
7. **Duplikasyon yok**

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

*Bu dosya her oturumda güncellenir. v2: 14 katman, Cache Components, View Transitions, React Compiler, Turbopack, PPR eklendi.*
