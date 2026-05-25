# 🔄 Geçiş Stratejisi — TÜM SAYFALAR GEÇECEK

> **Kural:** Hiçbir sayfa atlanmaz. Tüm 172 sayfa yeni sisteme geçecek.
> **Son güncelleme:** 2026-05-25

---

## 📐 Ne Değişecek, Ne Değişmeyecek?

### ❌ DEĞİŞMEYEN (Sadece Altyapı — API Katmanı)

Bu dosyalar **optimize edilmiyor** çünkü zaten optimize çalışyorlar. Bunlar "motor" — sayfalar "araba". Arabayı yeniliyoruz, motoru değil.

| Dosya | Neden değişmiyor |
|-------|-----------------|
| `lib/api.ts` | API client — zaten hızlı (fetch + retry + token refresh) |
| `lib/api-types.ts` | Tip tanımları — statik veri |
| `lib/store.tsx` | Auth state — zaten minimal |
| `lib/errors.ts` | Hata yönetimi — zaten küçük |
| `hooks/use*.ts` (26 hook) | React Query hook'ları — zaten cache'liyor |
| `components/StatusBadge.tsx` | Görsel bileşen — zaten küçük |
| `components/ConfirmDialog.tsx` | Görsel bileşen — zaten küçük |
| `components/Toast.tsx` | Görsel bileşen — zaten küçük |
| `api/src/`, `worker/src/` | Rust — backend, frontend'i etkilemez |

### ✅ DEĞİŞECEK (TÜM SAYFALAR + LAYOUT'LAR)

**Her sayfa** şu optimizasyonlardan en az birini alacak:

| Optimizasyon | Kriter | Uygulanacak sayfa sayısı |
|-------------|--------|------------------------|
| **Suspense boundary** | Tüm sayfalar | 172 |
| **Virtual scrolling** | Liste gösteren sayfalar | ~35 |
| **useDeferredValue** | Arama kutusu olan sayfalar | ~15 |
| **Prefetch** | Link içeren tüm sayfalar | ~170 |

---

## 🗑️ Her Adımda Silinecekler

### Adım 1: Layout Suspense Boundaries

**Silinecek:** Yok (sadece `<Suspense>` sarmalayıcı ekleniyor)

**Değiştirilecek:**
- `dashboard/layout.tsx` → Suspense sarar
- `admin/layout.tsx` → Suspense sarar
- `docs/layout.tsx` → Suspense sarar

---

### Adım 2: Virtual Scrolling — TÜM LİSTE SAYFALARI

**Silinecek (swap sonrası):**

```tsx
// ESKİ — silinecek
{items.map((item, i) => (
  <Row key={item.id} data={item} />
))}

// YENİ — yerine gelecek
<VirtualList items={items} renderItem={(item) => <Row data={item} />} />
```

**Geçirilecek sayfalar (TAM LISTE):**

| # | Sayfa | Eski Kod | Yeni Kod |
|---|-------|----------|----------|
| 1 | deliveries/ | `.map()` | `<VirtualList>` |
| 2 | endpoints/ | `.map()` | `<VirtualList>` |
| 3 | webhooks/ | `.map()` | `<VirtualList>` |
| 4 | logs/ | `.map()` | `<VirtualList>` |
| 5 | team/ | `.map()` | `<VirtualList>` |
| 6 | api-keys/ | `.map()` | `<VirtualList>` |
| 7 | service-tokens/ | `.map()` | `<VirtualList>` |
| 8 | notifications/ | `.map()` | `<VirtualList>` |
| 9 | alerts/ | `.map()` | `<VirtualList>` |
| 10 | transforms/ | `.map()` | `<VirtualList>` |
| 11 | inbound/ | `.map()` | `<VirtualList>` |
| 12 | applications/ | `.map()` | `<VirtualList>` |
| 13 | templates/ | `.map()` | `<VirtualList>` |
| 14 | environments/ | `.map()` | `<VirtualList>` |
| 15 | schemas/ | `.map()` | `<VirtualList>` |
| 16 | audit-log/ | `.map()` | `<VirtualList>` |
| 17 | search/ | `.map()` | `<VirtualList>` |
| 18 | admin/users/ | `.map()` | `<VirtualList>` |
| 19 | admin/alerts/ | `.map()` | `<VirtualList>` |
| 20 | admin/coupons/ | `.map()` | `<VirtualList>` |
| 21 | admin/feature-flags/ | `.map()` | `<VirtualList>` |
| 22 | admin/refund-requests/ | `.map()` | `<VirtualList>` |
| 23 | admin/activity/ | `.map()` | `<VirtualList>` |
| 24 | operational-webhooks/ | `.map()` | `<VirtualList>` |
| 25 | billing (invoices) | `.map()` | `<VirtualList>` |
| 26 | docs/* (liste varsa) | `.map()` | `<VirtualList>` |

---

### Adım 3: useDeferredValue — TÜM ARAMA SAYFALARI

**Silinecek (swap sonrası):**

```tsx
// ESKİ — silinecek
const [searchInput, setSearchInput] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
const debounceRef = useRef<NodeJS.Timeout | null>(null);
useEffect(() => {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    setDebouncedSearch(searchInput);
  }, 300);
  return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
}, [searchInput]);

// YENİ — yerine gelecek
const { input: searchInput, deferredValue: debouncedSearch, handleChange: setSearchInput } = useDebouncedSearch();
```

**Geçirilecek sayfalar:**

| # | Sayfa | Eski Kod | Yeni Kod |
|---|-------|----------|----------|
| 1 | deliveries/ | setTimeout debounce | `useDebouncedSearch()` |
| 2 | logs/ | setTimeout debounce | `useDebouncedSearch()` |
| 3 | search/ | setTimeout debounce | `useDebouncedSearch()` |
| 4 | endpoints/ | setTimeout debounce | `useDebouncedSearch()` |
| 5 | webhooks/ | setTimeout debounce | `useDebouncedSearch()` |
| 6 | admin/users/ | setTimeout debounce | `useDebouncedSearch()` |
| 7 | admin/alerts/ | setTimeout debounce | `useDebouncedSearch()` |
| 8 | admin/coupons/ | setTimeout debounce | `useDebouncedSearch()` |
| 9 | admin/feature-flags/ | setTimeout debounce | `useDebouncedSearch()` |
| 10 | admin/refund-requests/ | setTimeout debounce | `useDebouncedSearch()` |
| 11 | admin/activity/ | setTimeout debounce | `useDebouncedSearch()` |
| 12 | templates/ | setTimeout debounce | `useDebouncedSearch()` |
| 13 | team/ | setTimeout debounce | `useDebouncedSearch()` |
| 14 | api-keys/ | setTimeout debounce | `useDebouncedSearch()` |
| 15 | notifications/ | setTimeout debounce | `useDebouncedSearch()` |

---

### Adım 4: Prefetch — TÜM LİNKLER

**Silinecek (swap sonrası):**

```tsx
// ESKİ — silinecek
<Link href="/endpoints">Endpoints</Link>

// YENİ — yerine gelecek
<PrefetchLink href="/endpoints" prefetchQueries={[endpointsQuery]}>Endpoints</PrefetchLink>
```

**Geçirilecek:** Dashboard sidebar + admin sidebar + tüm iç linkler (~50 link)

---

### Adım 5: Kritik Sayfa Özel Optimizasyonları

Bu sayfalar ekstra optimizasyon alacak:

| Sayfa | Sorun | Özel Çözüm |
|-------|-------|------------|
| admin/users/[id] | 16 paralel query | Lazy loading — sadece görünür sekme query çeksin |
| analytics | 5 paralel query | Suspense — paralel yükleme |
| deliveries | 1000+ kayıt | Virtual + Infinite scroll |
| dashboard (ana) | 7 paralel query | Suspense — paralel yükleme |

---

## 📊 Toplam Geçiş Sayısı

| Optimizasyon | Sayfa sayısı |
|-------------|-------------|
| Suspense boundary | 172 (layout'tan otomatik) |
| Virtual scrolling | ~26 liste sayfası |
| useDeferredValue | ~15 arama sayfası |
| Prefetch | ~50 link |
| **Toplam etkilenen** | **172 sayfa** |

---

## 🧹 Temizlik Kontrol Listesi

Her adım sonrası:

```
□ Eski kod silindi mi? (swap sonrası)
□ Yeni kod çalışıyor mu?
□ cargo check — 0 hata?
□ cargo test — tüm testler geçiyor mu?
□ npm run build — hatasız mı?
□ Manuel — sayfa açılıyor mu, veri görünüyor mu?
□ Gereksiz import temizlendi mi?
□ console.log/warn temizlendi mi?
□ Yorum satırları temiz mi?
```

---

## 🎯 Sonuç

**Hiçbir sayfa atlanmaz.** Tüm 172 sayfa yeni sisteme geçecek. Sadece API katmanı (hook'lar, API client, auth store) değişmez — çünkü onlar zaten optimize.

*Bu dosya her geçiş sonrası güncellenir.*
