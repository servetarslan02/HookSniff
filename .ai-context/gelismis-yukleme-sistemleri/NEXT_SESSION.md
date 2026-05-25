# 📋 Sonraki Oturum Rehberi — Gelişmiş Yükleme Sistemleri

> **Son güncelleme:** 2026-05-25
> **Bu dosya her oturum başında okunur.** Yeni oturum buradan devam eder.

---

## 🚀 Hızlı Başlangıç (Her Oturum)

```bash
# 1. Repo güncelle
cd /root/.openclaw/workspace/HookSniff
git pull origin main

# 2. Hafıza oku
cat .ai-context/gelismis-yukleme-sistemleri/PLAN.md
cat .ai-context/gelismis-yukleme-sistemleri/NEXT_SESSION.md      ← BU DOSYA
cat .ai-context/gelismis-yukleme-sistemleri/MEMORY.md
cat .ai-context/gelismis-yukleme-sistemleri/PAGE_TRACKER.md

# 3. Kalınan yerden devam et (aşağıdaki "Sıradaki Adım" bölümüne bak)
```

---

## 📍 Şu An Neredeyiz?

### Tamamlanan Adımlar

| # | Adım | Durum | Tarih | Commit |
|---|------|-------|-------|--------|
| 0 | QueryClient optimizasyonu | ✅ | 2026-05-25 | (henüz commit yok) |
| 1 | Layout Suspense Boundaries | ⏳ | — | — |
| 2 | Virtual Scrolling Entegrasyonu | ⏳ | — | — |
| 3 | Concurrent Features | ⏳ | — | — |
| 4 | Akıllı Prefetch | ⏳ | — | — |
| 5 | Kritik Sayfa Optimizasyonları | ⏳ | — | — |
| 6 | Service Worker + PWA | ⏳ | — | — |
| 7 | Bundle Splitting | ⏳ | — | — |

---

## 🔜 Sıradaki Adım: ADIM 1 — Layout Suspense Boundaries

### Ne Yapılacak?

Dashboard, Admin ve Docs layout'larına `<Suspense>` boundaries ekle. Bu, **172 sayfanın** loading deneyimini tek seferde değiştirir.

### Dosyalar

| Dosya | İşlem |
|-------|-------|
| `dashboard/src/components/LoadingSkeletons.tsx` | **YENİ OLUŞTUR** — Tüm skeleton bileşenleri |
| `dashboard/src/app/[locale]/(dashboard)/layout.tsx` | **DÜZENLE** — Suspense ekle |
| `dashboard/src/app/[locale]/admin/layout.tsx` | **DÜZENLE** — Suspense ekle |
| `dashboard/src/app/[locale]/docs/layout.tsx` | **DÜZENLE** — Suspense ekle |

### Adım Adım

#### 1.1 — LoadingSkeletons.tsx Oluştur

```tsx
// dashboard/src/components/LoadingSkeletons.tsx
// Dashboard, Admin ve Docs için skeleton bileşenleri

export function SkeletonDashboard() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      
      {/* Table skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonAdmin() {
  // Admin layout skeleton
}

export function SkeletonDocs() {
  // Docs layout skeleton — sidebar + content
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  // Genel tablo skeleton
}

export function SkeletonCard() {
  // Genel kart skeleton
}
```

#### 1.2 — Dashboard Layout'a Suspense Ekle

```tsx
// dashboard/src/app/[locale]/(dashboard)/layout.tsx
import { Suspense } from 'react';
import { SkeletonDashboard } from '@/components/LoadingSkeletons';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <Suspense fallback={<SkeletonDashboard />}>
        {children}
      </Suspense>
    </DashboardShell>
  );
}
```

#### 1.3 — Admin Layout'a Suspense Ekle

```tsx
// dashboard/src/app/[locale]/admin/layout.tsx
import { Suspense } from 'react';
import { SkeletonAdmin } from '@/components/LoadingSkeletons';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <Suspense fallback={<SkeletonAdmin />}>
        {children}
      </Suspense>
    </AdminShell>
  );
}
```

#### 1.4 — Docs Layout'a Suspense Ekle

```tsx
// dashboard/src/app/[locale]/docs/layout.tsx
import { Suspense } from 'react';
import { SkeletonDocs } from '@/components/LoadingSkeletons';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DocsShell>
      <Suspense fallback={<SkeletonDocs />}>
        {children}
      </Suspense>
    </DocsShell>
  );
}
```

#### 1.5 — Test Et

```bash
# Rust kontrolü
cd /root/.openclaw/workspace/HookSniff
cargo check --workspace
cargo test --workspace

# Dashboard kontrolü
cd dashboard
npm run build
npm run test

# Manuel kontrol
# → Dashboard'u tarayıcıda aç
# → Skeleton görünüyor mu?
# → Veri geldiğinde skeleton kayboluyor mu?
# → Diğer sayfaları kontrol et (endpoints, deliveries, admin)
```

#### 1.6 — Commit

```bash
git add dashboard/src/components/LoadingSkeletons.tsx
git add dashboard/src/app/[locale]/(dashboard)/layout.tsx
git add dashboard/src/app/[locale]/admin/layout.tsx
git add dashboard/src/app/[locale]/docs/layout.tsx
git commit -m "perf: layout Suspense boundaries eklendi — 172 sayfa otomatik loading"
git push origin main
```

---

## 🔜 Sonraki Adım: ADIM 2 — Virtual Scrolling

### Ne Yapılacak?

En kritik listelerde virtual scrolling aktif et. `@tanstack/react-virtual` zaten kurulu.

### Hedef Sayfalar (Öncelik sırası)

1. `deliveries/page.tsx` — En çok veri olan sayfa
2. `endpoints/page.tsx` — Endpoint listesi
3. `webhooks/page.tsx` — Webhook listesi
4. `admin/users/page.tsx` — Kullanıcı listesi
5. `logs/page.tsx` — Log listesi
6. `team/page.tsx` — Üye listesi

### Adım Adım

#### 2.1 — useVirtualList Hook Oluştur

```tsx
// dashboard/src/hooks/useVirtualList.ts
import { useVirtualizer } from '@tanstack/react-virtual';

export function useVirtualList<T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>,
  options?: { estimateSize?: number; overscan?: number }
) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => options?.estimateSize ?? 48,
    overscan: options?.overscan ?? 5,
  });

  return {
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex: virtualizer.scrollToIndex,
  };
}
```

#### 2.2 — Deliveries Sayfasına Uygula

```tsx
// dashboard/src/app/[locale]/(dashboard)/deliveries/DeliveriesContent.tsx
// Mevcut {items.map(...)} yerine virtual list kullan

import { useVirtualList } from '@/hooks/useVirtualList';

// ... mevcut kod ...

// Tablo body'sini virtual yap
const parentRef = useRef<HTMLDivElement>(null);
const { virtualItems, totalSize } = useVirtualList(deliveries, parentRef);

return (
  <div ref={parentRef} className="overflow-auto" style={{ height: '600px' }}>
    <div style={{ height: totalSize, position: 'relative' }}>
      {virtualItems.map((virtualRow) => (
        <div
          key={virtualRow.key}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: virtualRow.size,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <DeliveryRow data={deliveries[virtualRow.index]} />
        </div>
      ))}
    </div>
  </div>
);
```

#### 2.3 — Test Et

```bash
cargo check --workspace && cargo test --workspace
cd dashboard && npm run build && npm run test

# Manuel: deliveries sayfasını aç, 1000+ kayıt varsa sorunsuz kaydır
```

---

## 🔜 Sonraki Adım: ADIM 3 — Concurrent Features

### Ne Yapılacak?

Arama kutularına `useDeferredValue`, filtre butonlarına `useTransition` ekle.

### Hedef Sayfalar

1. `deliveries/page.tsx` — Arama + durum filtresi
2. `logs/page.tsx` — Arama
3. `search/page.tsx` — Arama
4. `endpoints/page.tsx` — Arama
5. `admin/users/page.tsx` — Arama

### Adım Adım

#### 3.1 — useDeferredValueWrapper Hook

```tsx
// dashboard/src/hooks/useDebouncedSearch.ts
import { useDeferredValue, useState, useTransition } from 'react';

export function useDebouncedSearch(initialValue = '') {
  const [input, setInput] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const deferredValue = useDeferredValue(input);

  const handleChange = (value: string) => {
    startTransition(() => {
      setInput(value);
    });
  };

  return {
    input,
    deferredValue,
    isPending,
    handleChange,
  };
}
```

#### 3.2 — Deliveries Arama Kutusuna Uygula

```tsx
// Mevcut:
const [searchInput, setSearchInput] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
  return () => clearTimeout(timer);
}, [searchInput]);

// Yeni:
const { input: searchInput, deferredValue: debouncedSearch, handleChange: setSearchInput } = useDebouncedSearch();
// useEffect ve setTimeout GEREKMEZ — React otomatik yönetir
```

---

## 🔜 Sonraki Adım: ADIM 4 — Akıllı Prefetch

### Ne Yapılacak?

Dashboard'daki tüm link'lerde hover'da veri önceden çekilecek.

### Adım Adım

#### 4.1 — PrefetchLink Geliştir

```tsx
// dashboard/src/components/PrefetchLink.tsx (zaten var, geliştirilecek)
// Hover'da ilgili query'leri prefetch et

'use client';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface PrefetchLinkProps {
  href: string;
  prefetchQueries?: { queryKey: unknown[]; queryFn: () => Promise<unknown> }[];
  children: React.ReactNode;
}

export function PrefetchLink({ href, prefetchQueries, children }: PrefetchLinkProps) {
  const queryClient = useQueryClient();

  const handleMouseEnter = useCallback(() => {
    // Sayfa prefetch
    // router.prefetch(href); // Next.js otomatik yapar

    // Veri prefetch
    prefetchQueries?.forEach(({ queryKey, queryFn }) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000,
      });
    });
  }, [queryClient, prefetchQueries]);

  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

#### 4.2 — Sidebar Link'lerine Uygula

```tsx
// Dashboard sidebar'daki link'leri PrefetchLink ile değiştir
// Her link için ilgili query'leri tanımla

<PrefetchLink
  href="/endpoints"
  prefetchQueries={[
    { queryKey: ['endpoints'], queryFn: () => endpointsApi.list(token) },
  ]}
>
  Endpoints
</PrefetchLink>
```

---

## 🔜 Sonraki Adım: ADIM 5 — Kritik Sayfa Optimizasyonları

### En Yavaş Sayfalar (Öncelik sırası)

| # | Sayfa | Sorun | Çözüm |
|---|-------|-------|-------|
| 1 | admin/users/[id] | 16 paralel query | Suspense + Lazy loading |
| 2 | deliveries | 1000+ kayıt | Virtual + Infinite scroll |
| 3 | analytics | 5 paralel query | Suspense + Parallel |
| 4 | logs | Arama + filtre | useDeferredValue |
| 5 | endpoints | Liste | Virtual |

### Her Sayfa İçin Adımlar

```
1. Sayfayı aç, Chrome DevTools Performance tab'ında ölç
2. Sorunlu query'leri belirle (en uzun süren)
3. Suspense boundary ekle (eğer yoksa)
4. Virtual list uygula (eğer liste ise)
5. useDeferredValue uygula (eğer arama varsa)
6. cargo check + cargo test
7. npm run build
8. Manuel kontrol
9. Tekrar ölç — öncekiyle karşılaştır
10. Commit
```

---

## 🔜 Sonraki Oturum: ADIM 6 — Service Worker + PWA

### Ne Yapılacak?

```bash
# 1. Workbox kurulumu
cd dashboard
npm install next-pwa

# 2. next.config.js'e ekle
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

# 3. manifest.json oluştur
# 4. Offline fallback sayfası
# 5. Cache stratejisi:
#    - Statik varlıklar: Cache First
#    - API: Stale While Revalidate
#    - Sayfalar: Network First
```

---

## 🔜 Sonraki Oturum: ADIM 7 — Bundle Splitting

### Ne Yapılacak?

```bash
# 1. Bundle analyzer çalıştır
cd dashboard
ANALYZE=true npm run build

# 2. En büyük chunk'ları belirle
# 3. Dynamic import'lar ekle
# 4. Route-based splitting
# 5. Chart lazy loading (zaten var ✅)
```

---

## ⚠️ Kritik Kurallar (Her Oturum)

1. **Tek seferde bir adım** — Birden fazla adımı aynı anda yapma
2. **Her adımda test** — `cargo check + cargo test + npm run build`
3. **Eski kodu silme** — Sadece üstüne ekle
4. **Commit at** — Her başarılı adımda commit + push
5. **PAGE_TRACKER.md güncelle** — Hangi sayfa tamamlandı işaretle
6. **MEMORY.md güncelle** — Oturum sonunda bulguları kaydet

---

## 📊 Oturum Zaman Planı (1 Saat)

| Dakika | İşlem |
|--------|-------|
| 0-5 | Repo pull, hafıza oku, durum kontrol |
| 5-25 | Sıradaki adımı uygula |
| 25-30 | Test et (cargo + npm + manuel) |
| 30-35 | Hata varsa düzelt |
| 35-50 | İkinci adıma başla (zaman kalırsa) |
| 50-55 | Test et |
| 55-60 | Commit + push + MEMORY.md güncelle |

---

*Bu dosya her oturumda güncellenir. PLAN.md ile birlikte okunur.*
