# 🔄 Geçiş Stratejisi — Temiz Kod, Kalabalık Yok

> **Kural:** Her geçiş tamamlandığında eski kod SİLİNİR.
> **Amaç:** Kod kalabalığı olmasın, sadece çalışan yeni kod kalsın.
> **Son güncelleme:** 2026-05-25

---

## 📐 Geçiş Akışı (Her Adım İçin)

```
1. Yeni kodu yaz
2. Eski kodu yeni kodla DEĞİŞTİR (swap)
3. cargo check + cargo test
4. npm run build
5. Manuel kontrol — her şey çalışıyor mu?
6. Eski kodu SİL
7. Commit + push
```

**Eski ve yeni birlikte DURMAZ.** Yeni çalışıyorsa eski silinir.

---

## 🗑️ Her Adımda Silinecekler

### Adım 1: Layout Suspense Boundaries

**Silinecek:** Yok (sadece Suspense ekleniyor, eski kod sarmalanıyor)

**Değiştirilecek:**
- `dashboard/src/app/[locale]/(dashboard)/layout.tsx` → Suspense sarar
- `dashboard/src/app/[locale]/admin/layout.tsx` → Suspense sarar
- `dashboard/src/app/[locale]/docs/layout.tsx` → Suspense sarar

**Not:** Layout bileşenleri aynen kalır, sadece `<Suspense>` sarmalayıcı eklenir.

---

### Adım 2: Virtual Scrolling

**Silinecek (swap sonrası):**

| Eski Kod | Yeni Kod | Silinir mi? |
|----------|----------|-------------|
| `{items.map(item => <Row />)}` | `<VirtualList items={items} />` | ✅ Eski map silinir |
| Manuel scroll handler | TanStack Virtual | ✅ Eski handler silinir |

**Dosyalar:**
- `deliveries/DeliveriesContent.tsx` → eski `.map()` → yeni `<VirtualList>`
- `endpoints/EndpointsContent.tsx` → eski `.map()` → yeni `<VirtualList>`
- `webhooks/WebhooksContent.tsx` → eski `.map()` → yeni `<VirtualList>`
- `admin/users/page.tsx` → eski `.map()` → yeni `<VirtualList>`
- `logs/LogsContent.tsx` → eski `.map()` → yeni `<VirtualList>`
- `team/TeamContent.tsx` → eski `.map()` → yeni `<VirtualList>`
- (diğer listeler — PAGE_TRACKER.md'de V sütunu)

---

### Adım 3: Concurrent Features (useDeferredValue)

**Silinecek (swap sonrası):**

| Eski Kod | Yeni Kod | Silinir mi? |
|----------|----------|-------------|
| `const [debounced, setDebounced] = useState('')` | `useDebouncedSearch()` | ✅ Eski state silinir |
| `useEffect(() => { setTimeout(...) }, [input])` | `useDeferredValue(input)` | ✅ Eski useEffect + setTimeout silinir |
| `debounceRef` | Yok | ✅ Eski ref silinir |

**Dosyalar:**
- `deliveries/DeliveriesContent.tsx` → eski debounce → yeni `useDebouncedSearch`
- `logs/LogsContent.tsx` → eski debounce → yeni `useDebouncedSearch`
- `search/SearchContent.tsx` → eski debounce → yeni `useDebouncedSearch`
- `endpoints/EndpointsContent.tsx` → eski debounce → yeni `useDebouncedSearch`
- `admin/users/page.tsx` → eski debounce → yeni `useDebouncedSearch`

---

### Adım 4: Akıllı Prefetch

**Silinecek (swap sonrası):**

| Eski Kod | Yeni Kod | Silinir mi? |
|----------|----------|-------------|
| `<Link href="/endpoints">` | `<PrefetchLink href="/endpoints" prefetchQueries={[...]}>` | ✅ Eski Link silinir |

**Dosyalar:**
- Dashboard sidebar link'leri → eski `<Link>` → yeni `<PrefetchLink>`
- Admin sidebar link'leri → eski `<Link>` → yeni `<PrefetchLink>`

---

## 🧹 Temizlik Kontrol Listesi

Her adım sonrası kontrol et:

```
□ Eski kod silindi mi?
□ Yeni kod çalışıyor mu?
□ cargo check — 0 hata?
□ cargo test — tüm testler geçiyor mu?
□ npm run build — hatasız mı?
□ Manuel — sayfa açılıyor mu, veri görünüyor mu?
□ Gereksiz import temizlendi mi? (eski import kalmasın)
□ console.log/warn/error temizlendi mi?
□ Gereksiz yorum satırı temizlendi mi?
```

---

## 📦 Silinen Kod Geri Gelir mi?

**Hayır.** Git'te duruyor. Bir şey bozulursa:

```bash
# Son çalışan duruma dön
git log --oneline -5
git revert HEAD
```

Ama geri almaya gerek kalmayacak çünkü her adım önce test ediliyor.

---

## 🎯 Temiz Kod Prensipleri

1. **Duplikasyon yok** — Aynı işi yapan iki kod parçası birlikte durmaz
2. **Ölü kod yok** — Kullanılmayan import, fonksiyon, değişken silinir
3. **Yorum satırı minimal** — "Eski kod" gibi yorumlar kalıcı olmaz
4. **Tek kaynak** — Bir işlev bir yerde tanımlanır, kopyalanmaz
5. **Sürpriz yok** — Yeni kod eski kodun davranışını birebir korur

---

*Bu dosya her geçiş sonrası güncellenir. Silinen kodlar burada listelenir.*
