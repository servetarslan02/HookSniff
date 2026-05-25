# 🏔️ Gelişmiş Yükleme Sistemleri — Ana Plan (v2)

> **Başlangıç:** 2026-05-25
> **Güncelleme:** 2026-05-26 — Cache Components, View Transitions, React Compiler, Turbopack, PPR eklendi
> **Hedef:** Tüm 172 sayfayı zirve performans teknolojileriyle optimize et
> **Yaklaşım:** Temiz geçiş — yeni kod çalışınca eski kod silinir
> **Kural:** Her adım sonrası `cargo check` + `cargo test` zorunlu

---

## 📋 İçindekiler

1. [Hedef Teknolojiler (14 Katman)](#hedef-teknolojiler)
2. [Uygulama Katmanları](#uygulama-katmanları)
3. [Sayfa Kategorileri ve Öncelik](#sayfa-kategorileri-ve-öncelik)
4. [Güvenlik Kuralları](#güvenlik-kuralları)
5. [Test Stratejisi](#test-stratejisi)
6. [Detaylı Uygulama Adımları](#detaylı-uygulama-adımları)
7. [Sayfa Takip Tablosu](#sayfa-takip-tablosu)
8. [Rollback Planı](#rollback-planı)

---

## Hedef Teknolojiler — 14 Katman (Zirve)

### Faz 1: Temel Optimizasyonlar (Bu Oturumlar)

| # | Teknoloji | Ne yapıyor | Etki |
|---|-----------|-----------|------|
| 1 | **React Query (SWR + Optimistic)** | Akıllı cache, arka plan yenileme | ✅ Yapıldı |
| 2 | **Layout Suspense Boundaries** | Parça parça yükleme | 172 sayfa |
| 3 | **Virtual Scrolling** | 100+ satırda sadece görünen render | ~26 liste |
| 4 | **Concurrent Features** | useDeferredValue + useTransition | ~15 arama |
| 5 | **Akıllı Prefetch** | Hover'da veri önceden çekme | ~50 link |

### Faz 2: Next.js 16 Zirve Özellikleri (Sonraki Oturumlar)

| # | Teknoloji | Ne yapıyor | Etki |
|---|-----------|-----------|------|
| 6 | **Cache Components** (`"use cache"`) | Anında sayfa geçişi, statik+dinamik hibrit | 🔴 EN BÜYÜK |
| 7 | **View Transitions** | Sayfa geçişlerinde animasyon (iOS hissi) | 🔴 EN BÜYÜK |
| 8 | **Turbopack** | 5-10x daha hızlı build | 🔴 Kolay |
| 9 | **React Compiler** | Otomatik memoization | 🔴 Kolay |
| 10 | **PPR** (Partial Pre-Rendering) | Statik+ dinamik hibrit rendering | 🟡 Orta |
| 11 | **`<Activity/>`** | Arka plan sekmelerde duraklatma | 🟡 Bellek |

### Faz 3: İleri Optimizasyonlar (Daha Sonra)

| # | Teknoloji | Ne yapıyor | Etki |
|---|-----------|-----------|------|
| 12 | **Infinite Scroll** | Sonsuz kaydırma | 🟡 Kolay |
| 13 | **Service Worker + PWA** | Offline cache, anında yükleme | 🟡 Zor |
| 14 | **TanStack DB** | Client-side database, local-first sync | 🟡 Zor |

---

## Uygulama Katmanları — Görsel Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 APP                       │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Turbopack (Katman 8)                             │  │
│  │  → 5-10x hızlı build                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React Compiler (Katman 9)                        │  │
│  │  → Otomatik memoization                           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Cache Components + PPR (Katman 6+10)             │  │
│  │  → "use cache" ile anında yükleme                │  │
│  │  → Statik kısım anında, dinamik kısım stream     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  View Transitions (Katman 7)                      │  │
│  │  → Sayfa geçişlerinde animasyon                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Suspense Boundaries (Katman 2)                   │  │
│  │  → Parça parça streaming                          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React Query + SWR (Katman 1)                     │  │
│  │  → Cache, optimistic, background sync             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ Virtual List │ │ PrefetchLink │ │ Concurrent   │    │
│  │ (Katman 3)   │ │ (Katman 5)   │ │ (Katman 4)   │    │
│  │ → 100+ satır │ │ → Hover data │ │ → useDeferred│    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Service Worker (Katman 13)                       │  │
│  │  → Offline cache                                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Sayfalar (172 adet)                              │  │
│  │  → Temiz geçiş: yeni kod, eski kod silinir       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Sayfa Kategorileri ve Öncelik

### Kategori A: Dashboard — Veri Ağırlıklı (Öncelik 1)
**~55 sayfa — En çok etkilenecek**

| Sayfa | Mevcut Hook | Kritik Sorun | Çözüm |
|-------|------------|--------------|-------|
| endpoints/ | useEndpoints | Tüm endpoint'ler tek seferde | Virtual + Pagination |
| deliveries/ | useWebhooks | 1000+ kayıt olabilir | Virtual + Infinite scroll |
| webhooks/ | useWebhooks | Teslimat geçmişi | Virtual |
| analytics/ | useAnalytics | 5 paralel query | Suspense + Parallel |
| logs/ | useSearch | Arama + filtre | useDeferredValue |
| billing/ | useBilling | 4 paralel query | Suspense |
| admin/users/ | useAdminData | Kullanıcı listesi | Virtual |
| admin/revenue/ | useAdminStats | 6 paralel query | Suspense |
| admin/user-detail/ | useAdminUserDetail | **16 paralel query!** | Suspense + Lazy |
| team/ | useTeams | Üye listesi | Virtual |
| api-keys/ | useApiKeys | Liste | Virtual |
| service-tokens/ | useServiceTokens | Liste | Virtual |
| notifications/ | useNotifications | Liste | Virtual |
| alerts/ | useAlerts | Liste | Virtual |
| transforms/ | useTransforms | Liste | Virtual |
| inbound/ | useInboundConfigs | Liste | Virtual |
| applications/ | useEndpoints | Liste | Virtual |

### Kategori B: Admin Panel (Öncelik 2)
**~15 sayfa**

### Kategori C: Dokümantasyon (Öncelik 3)
**~60 sayfa — Cache Components + View Transitions**

### Kategori D: Landing/Marketing (Öncelik 4)
**~30 sayfa — Cache Components**

### Kategori E: Auth (Öncelik 5)
**~7 sayfa — Hafif**

---

## Güvenlik Kuralları

### 🔴 KIRMIZI ÇİZGİLER

1. **Eski kod SİLİNİR** — Yeni kod çalışınca eski kod silinir (duplikasyon yok)
2. **Her adımda `cargo check`** — Rust tarafı bozulmamalı
3. **Her adımda `cargo test`** — Testler geçmeli
4. **Her adımda dashboard build** — `npm run build` hatasız olmalı
5. **Tek seferde bir katman** — Birden fazla katmanı aynı anda değiştirme
6. **Commit öncesi manuel kontrol** — Sayfa açılmalı, veri görünmeli

### 🟡 SARI ÇİZGİLER

1. **Cache Components** — `"use cache"` direktifi dikkatli kullanılmalı (eski veri riski)
2. **View Transitions** — Tüm tarayıcılar desteklemiyor (fallback gerekli)
3. **React Compiler** — Bazı edge case'lerde sorun çıkabilir
4. **Suspense fallback** — Skeleton, gerçek içerikle aynı layout'ta olmalı

### 🟢 YEŞİL ÇİZGİLER

1. **Yeni bileşen oluşturma** — `components/` altına yeni dosya ekleme
2. **Yeni hook oluşturma** — `hooks/` altına yeni dosya ekleme
3. **Config değişikliği** — `next.config.js` ayarları

---

## Test Stratejisi

### Her Adım Sonrası Zorunlu Testler

```bash
# 1. Rust kontrolü
cargo check --workspace
cargo test --workspace
cargo clippy --workspace -- -D warnings

# 2. Dashboard kontrolü
cd dashboard
npm run build
npm run lint
npm run test

# 3. Görsel kontrol (manuel)
# → Sayfayı tarayıcıda aç
# → Veri yükleniyor mu?
# → Skeleton görünüyor mu?
# → Geçiş animasyonu çalışıyor mu?
# → Eski fonksiyonlar hâlâ çalışıyor mu?
```

---

## Detaylı Uygulama Adımları

### Adım 1: Layout Suspense Boundaries (Katman 2)
**Süre:** ~20 dakika | **Etki:** 172 sayfa | **Risk:** 🟢 Düşük

```
1. LoadingSkeletons.tsx oluştur
2. dashboard/layout.tsx → Suspense ekle
3. admin/layout.tsx → Suspense ekle
4. docs/layout.tsx → Suspense ekle
5. cargo check + cargo test + npm run build
6. Manuel kontrol
7. Commit + push
```

### Adım 2: Virtual Scrolling (Katman 3)
**Süre:** ~30 dakika | **Etki:** ~26 liste sayfası | **Risk:** 🟢 Düşük

```
1. useVirtualList hook oluştur
2. En kritik listeye uygula (deliveries)
3. Eski .map() kodunu sil
4. cargo check + cargo test + npm run build
5. Manuel kontrol
6. Diğer listelere yay
7. Commit + push
```

### Adım 3: Concurrent Features (Katman 4)
**Süre:** ~20 dakika | **Etki:** ~15 arama sayfası | **Risk:** 🟢 Düşük

```
1. useDebouncedSearch hook oluştur
2. Arama kutularına uygula
3. Eski setTimeout debounce kodunu sil
4. cargo check + cargo test + npm run build
5. Manuel kontrol
6. Commit + push
```

### Adım 4: Akıllı Prefetch (Katman 5)
**Süre:** ~30 dakika | **Etki:** ~50 link | **Risk:** 🟢 Düşük

```
1. PrefetchLink bileşenini geliştir
2. Sidebar link'lerine uygula
3. Eski <Link> kodunu sil
4. cargo check + cargo test + npm run build
5. Manuel kontrol
6. Commit + push
```

### Adım 5: Turbopack (Katman 8)
**Süre:** ~5 dakika | **Etki:** Build hızı | **Risk:** 🟢 Düşük

```
1. next.config.js → turbo: true ekle
2. npm run build — çalışıyor mu?
3. Build süresini ölç (öncekiyle karşılaştır)
4. Commit + push
```

### Adım 6: React Compiler (Katman 9)
**Süre:** ~10 dakika | **Etki:** Runtime performans | **Risk:** 🟡 Orta

```
1. next.config.js → experimental.reactCompiler: true ekle
2. npm run build — çalışıyor mu?
3. Hata varsa, ilgili bileşenleri düzelt
4. cargo check + cargo test
5. Manuel kontrol — tüm sayfalar çalışıyor mu?
6. Commit + push
```

### Adım 7: Cache Components (Katman 6)
**Süre:** ~30 dakika | **Etki:** Sayfa geçiş hızı | **Risk:** 🟡 Orta

```
1. next.config.js → cacheComponents: true ekle
2. Statik sayfalara "use cache" ekle (docs, landing)
3. Dinamik sayfalarda Suspense + PPR uygula
4. cargo check + cargo test + npm run build
5. Manuel kontrol — sayfa geçişleri anında mı?
6. Eski fetch cache kodlarını sil
7. Commit + push
```

### Adım 8: View Transitions (Katman 7)
**Süre:** ~20 dakika | **Etki:** Sayfa geçiş animasyonu | **Risk:** 🟢 Düşük

```
1. ViewTransition bileşeni oluştur
2. Layout'lara ekle
3. Animasyon CSS'i yaz (fade + slide)
4. Fallback: animasyon desteklemeyen tarayıcılar
5. cargo check + cargo test + npm run build
6. Manuel kontrol — geçişler akıcı mı?
7. Commit + push
```

### Adım 9: PPR — Partial Pre-Rendering (Katman 10)
**Süre:** ~30 dakika | **Etki:** İlk yükleme | **Risk:** 🟡 Orta

```
1. Statik kısımları belirle (header, sidebar, nav)
2. Dinamik kısımları belirle (veri tabloları, grafikler)
3. Suspense ile ayır
4. cargo check + cargo test + npm run build
5. Manuel kontrol
6. Commit + push
```

### Adım 10: Infinite Scroll (Katman 12)
**Süre:** ~20 dakika | **Etki:** Büyük listeler | **Risk:** 🟢 Düşük

```
1. useInfiniteScroll hook oluştur (IntersectionObserver)
2. Virtual List ile birleştir
3. Eski pagination kodunu sil
4. cargo check + cargo test + npm run build
5. Manuel kontrol
6. Commit + push
```

### Adım 11: <Activity/> (Katman 11)
**Süre:** ~15 dakika | **Etki:** Bellek tasarrufu | **Risk:** 🟢 Düşük

```
1. Aktif olmayan sekmeleri <Activity mode="hidden"> ile sarmala
2. Bellek kullanımını ölç (Chrome DevTools)
3. cargo check + cargo test + npm run build
4. Manuel kontrol
5. Commit + push
```

### Adım 12: Service Worker + PWA (Katman 13)
**Süre:** ~40 dakika | **Etki:** Offline + tekrarlı ziyaret | **Risk:** 🟡 Orta

```
1. next-pwa kurulumu
2. Service Worker oluştur
3. Cache stratejisi belirle
4. manifest.json oluştur
5. cargo check + cargo test + npm run build
6. Manuel kontrol
7. Commit + push
```

### Adım 13: TanStack DB (Katman 14)
**Süre:** ~60 dakika | **Etki:** Local-first sync | **Risk:** 🔴 Zor

```
1. @tanstack/db kurulumu
2. Collection'ları tanımla
3. React Query ile entegrasyon
4. Optimistic updates
5. cargo check + cargo test + npm run build
6. Manuel kontrol
7. Commit + push
```

---

## Performans Hedefleri

| Metrik | Şu An | Faz 1 Hedef | Faz 2 Hedef | Faz 3 Hedef |
|--------|-------|-------------|-------------|-------------|
| İlk yükleme (LCP) | ~3-4 sn | <2 sn | <1 sn | <0.5 sn |
| Sayfa geçişi | ~1-2 sn | <500ms | <100ms | <50ms |
| Input lag | ~100ms | <16ms | <16ms | <16ms |
| Build süresi | ~60 sn | ~60 sn | ~10 sn | ~10 sn |
| Bellek kullanımı | Yüksek | %30 azalma | %50 azalma | %70 azalma |
| İkinci ziyaret | ~2 sn | <1 sn | <200ms | <100ms |

---

*Bu dosya her oturumda güncellenir. v2: Cache Components, View Transitions, React Compiler, Turbopack, PPR eklendi.*
