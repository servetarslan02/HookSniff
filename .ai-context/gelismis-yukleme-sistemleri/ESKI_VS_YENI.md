# 🔄 Eski vs Yeni Kod Ayrımı

> **Amaç:** Yeni oturumlar eski kodla yeni kodu karıştırmasın.
> **Kural:** Eski kod "legacy" olarak işaretlenir, yeni katmanlar "perf" olarak.
> **Son güncelleme:** 2026-05-25

---

## 📂 Dosya Yapısı — Eski vs Yeni

### ✅ YENİ DOSYALAR (Performans Katmanı — Bu Dosyalar Değiştirilir)

```
dashboard/src/
├── components/
│   ├── LoadingSkeletons.tsx        ← YENİ (Adım 1)
│   ├── VirtualList.tsx             ← YENİ ✅ Oluşturuldu
│   └── PrefetchLink.tsx            ← MEVCUT (geliştirilecek)
├── hooks/
│   ├── useVirtualList.ts           ← YENİ (Adım 2)
│   ├── useDebouncedSearch.ts       ← YENİ (Adım 3)
│   └── ... (mevcut hook'lar)       ← DOKUNULMAZ
├── app/[locale]/
│   ├── providers.tsx               ← GÜNCELLENDİ ✅ (QueryClient)
│   ├── (dashboard)/layout.tsx      ← GÜNCELLENECEK (Adım 1 — Suspense)
│   ├── admin/layout.tsx            ← GÜNCELLENECEK (Adım 1 — Suspense)
│   └── docs/layout.tsx             ← GÜNCELLENECEK (Adım 1 — Suspense)
└── .ai-context/
    └── gelismis-yukleme-sistemleri/ ← YENİ ✅ Tüm plan burada
```

### ⚪ ESKİ DOSYALAR (DOKUNULMAZ — Sadece Okunur)

```
dashboard/src/
├── lib/
│   ├── api.ts                      ← ESKİ — API client (DOKUNULMAZ)
│   ├── api-types.ts                ← ESKİ — Tip tanımları (DOKUNULMAZ)
│   ├── store.tsx                   ← ESKİ — Auth state (DOKUNULMAZ)
│   ├── errors.ts                   ← ESKİ — Hata yönetimi (DOKUNULMAZ)
│   └── ...                         ← ESKİ (DOKUNULMAZ)
├── hooks/
│   ├── useEndpoints.ts             ← ESKİ — Endpoint hook (DOKUNULMAZ)
│   ├── useWebhooks.ts              ← ESKİ — Webhook hook (DOKUNULMAZ)
│   ├── useBilling.ts               ← ESKİ — Billing hook (DOKUNULMAZ)
│   ├── useAdminData.ts             ← ESKİ — Admin hook (DOKUNULMAZ)
│   ├── useDashboardData.ts         ← ESKİ — Dashboard hook (DOKUNULMAZ)
│   └── ... (26 hook)               ← ESKİ (DOKUNULMAZ)
├── components/
│   ├── StatusBadge.tsx             ← ESKİ (DOKUNULMAZ)
│   ├── ConfirmDialog.tsx           ← ESKİ (DOKUNULMAZ)
│   ├── Toast.tsx                   ← ESKİ (DOKUNULMAZ)
│   └── ...                         ← ESKİ (DOKUNULMAZ)
├── app/[locale]/
│   ├── (dashboard)/
│   │   ├── endpoints/page.tsx      ← ESKİ sayfa (DOKUNULMAZ)
│   │   ├── deliveries/page.tsx     ← ESKİ sayfa (DOKUNULMAZ)
│   │   └── ...                     ← ESKİ sayfalar (DOKUNULMAZ)
│   └── admin/
│       └── ...                     ← ESKİ sayfalar (DOKUNULMAZ)
└── ...                             ← ESKİ (DOKUNULMAZ)
```

### 🔧 RUST TARAFI (DOKUNULMAZ — Sadece cargo check/test)

```
api/src/                            ← ESKİ Rust kodu (DOKUNULMAZ)
worker/src/                         ← ESKİ Rust kodu (DOKUNULMAZ)
common/src/                         ← ESKİ Rust kodu (DOKUNULMAZ)
migrations/                         ← ESKİ migrasyonlar (DOKUNULMAZ)
```

---

## 🏷️ Kod İşaretleme Sistemi

Yeni eklenen her dosyaya şu yorum satırı eklenir:

```tsx
// ═══════════════════════════════════════════════════
// 🚀 PERFORMANS KATMANI — Gelişmiş Yükleme Sistemleri
// ═══════════════════════════════════════════════════
// Bu dosya performans optimizasyonu için oluşturulmuştur.
// Eski kod: [dosya yolu] — DOKUNULMAZ
// Plan: .ai-context/gelismis-yukleme-sistemleri/PLAN.md
// ═══════════════════════════════════════════════════
```

Eski dosyalara bir şey eklenmez.

---

## 🔍 "Bu Dosya Eski mi Yeni mi?" — Hızlı Rehber

| Soru | Cevap |
|------|-------|
| `components/VirtualList.tsx` | ✅ YENİ |
| `components/LoadingSkeletons.tsx` | ✅ YENİ (henüz oluşturulmadı) |
| `hooks/useVirtualList.ts` | ✅ YENİ (henüz oluşturulmadı) |
| `hooks/useDebouncedSearch.ts` | ✅ YENİ (henüz oluşturulmadı) |
| `hooks/useEndpoints.ts` | ⚪ ESKİ — DOKUNULMAZ |
| `hooks/useWebhooks.ts` | ⚪ ESKİ — DOKUNULMAZ |
| `lib/api.ts` | ⚪ ESKİ — DOKUNULMAZ |
| `lib/store.tsx` | ⚪ ESKİ — DOKUNULMAZ |
| `app/[locale]/providers.tsx` | 🟡 GÜNCELLENDİ (QueryClient config) |
| `app/[locale]/(dashboard)/layout.tsx` | 🟡 GÜNCELLENECEK (Suspense eklenecek) |
| `app/[locale]/(dashboard)/deliveries/page.tsx` | ⚪ ESKİ — DOKUNULMAZ (sadece Suspense sarmalayacak) |
| `api/src/` | ⚪ ESKİ Rust — DOKUNULMAZ |
| `worker/src/` | ⚪ ESKİ Rust — DOKUNULMAZ |

---

## 🚫 Yapılmayacaklar (Kesin Kurallar)

1. **`hooks/useEndpoints.ts` DÜZENLENMEZ** — Sadece yeni hook'lar oluşturulur
2. **`lib/api.ts` DÜZENLENMEZ** — API client aynen kalır
3. **`lib/store.tsx` DÜZENLENMEZ** — Auth state aynen kalır
4. **Sayfa bileşenleri DÜZENLENMEZ** — Sadece layout Suspense sarmalar
5. **Rust kodu DÜZENLENMEZ** — Sadece `cargo check/test` çalıştırılır
6. **`package.json` DÜZENLENMEZ** — Yeni paket eklenmez (gerekirse PLAN.md'de not edilir)

---

## ✅ Yapılacaklar (Yeni Katmanlar)

1. **`components/LoadingSkeletons.tsx` OLUŞTUR** — Skeleton bileşenleri
2. **`components/VirtualList.tsx` KULLAN** — Mevcut bileşeni listelere uygula
3. **`hooks/useVirtualList.ts` OLUŞTUR** — TanStack Virtual wrapper hook
4. **`hooks/useDebouncedSearch.ts` OLUŞTUR** — useDeferredValue wrapper
5. **Layout'lara Suspense EKLE** — Dashboard, Admin, Docs
6. **`PrefetchLink.tsx` GELİŞTİR** — Hover prefetch ekle

---

## 📊 Entegrasyon Örneği — Eski + Yeni Birlikte

```tsx
// ═══════════════════════════════════════════════════
// deliveries/page.tsx — ESKİ SAYFA (DOKUNULMAZ)
// ═══════════════════════════════════════════════════

'use client';
import { useWebhooks } from '@/hooks/useWebhooks';  // ← ESKİ hook (DOKUNULMAZ)
import { useVirtualList } from '@/hooks/useVirtualList';  // ← YENİ hook
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';  // ← YENİ hook

export default function DeliveriesPage() {
  // ESKİ — aynen kalır
  const { data: deliveries, isLoading } = useWebhooks();
  
  // YENİ — virtual list (eski listenin yerine geçer)
  const parentRef = useRef(null);
  const { virtualItems, totalSize } = useVirtualList(deliveries ?? [], parentRef);
  
  // YENİ — debounced search (eski setTimeout yerine)
  const { input, deferredValue, handleChange } = useDebouncedSearch();
  
  // ESKİ JSX — sadece liste kısmı değişir
  return (
    <div>
      {/* ESKİ header — aynen kalır */}
      <h1>Deliveries</h1>
      
      {/* YENİ arama — useDeferredValue ile */}
      <input value={input} onChange={e => handleChange(e.target.value)} />
      
      {/* YENİ liste — virtual scrolling ile */}
      <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map(row => (
            <div key={row.key} style={{ position: 'absolute', top: row.start, height: row.size }}>
              <DeliveryRow data={deliveries[row.index]} />  {/* ESKİ bileşen */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Dikkat:** Eski `useWebhooks` hook'u ve `DeliveryRow` bileşeni aynen kalır. Sadece **liste render** kısmı virtual yapılır.

---

## 🔄 Oturum Başında Kontrol Listesi

Yeni oturum başladığında:

```
□ git pull origin main
□ .ai-context/gelismis-yukleme-sistemleri/NEXT_SESSION.md oku
□ .ai-context/gelismis-yukleme-sistemleri/PAGE_TRACKER.md oku
□ Bu dosyayı oku (ESKI_VS_YENI.md) — hangi dosyalara dokunulmayacağını bil
□ Sıradaki adımı uygula
□ cargo check + cargo test çalıştır
□ npm run build çalıştır
□ Manuel kontrol yap
□ Commit + push
□ PAGE_TRACKER.md güncelle
```

---

*Bu dosya karışıklığı önlemek için oluşturulmuştur. Her oturumda okunmalıdır.*
