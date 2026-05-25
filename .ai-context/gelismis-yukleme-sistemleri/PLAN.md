# 🏔️ Gelişmiş Yükleme Sistemleri — Ana Plan

> **Başlangıç:** 2026-05-25
> **Hedef:** Tüm 172 sayfayı zirve performans teknolojileriyle optimize et
> **Yaklaşım:** Ekleme tabanlı (eski kod silinmez, üstüne katman eklenir)
> **Kural:** Her adım sonrası `cargo check` + `cargo test` zorunlu

---

## 📋 İçindekiler

1. [Hedef Teknolojiler](#hedef-teknolojiler)
2. [Uygulama Katmanları](#uygulama-katmanları)
3. [Sayfa Kategorileri ve Öncelik](#sayfa-kategorileri-ve-öncelik)
4. [Güvenlik Kuralları](#güvenlik-kuralları)
5. [Test Stratejisi](#test-stratejisi)
6. [Detaylı Uygulama Adımları](#detaylı-uygulama-adımları)
7. [Sayfa Takip Tablosu](#sayfa-takip-tablosu)
8. [Rollback Planı](#rollback-planı)

---

## Hedef Teknolojiler

### Katman 1: React Query — Stale-While-Revalidate + Optimistic Updates
- **Ne:** Veri çekme stratejisi optimizasyonu
- **Nasıl:** QueryClient global config + hook-level overrides
- **Etki:** Tüm API istekleri (172 sayfa)
- **Durum:** ✅ QueryClient güncellendi (providers.tsx)

### Katman 2: Layout Suspense Boundaries — Streaming Yükleme
- **Ne:** Sayfa parçalar halinde yüklenir, üst kısım anında görünür
- **Nasıl:** Dashboard layout + Admin layout + Docs layout'a `<Suspense>` eklenir
- **Etki:** 172 sayfa otomatik
- **Durum:** ⏳ Yapılacak

### Katman 3: Virtual Scrolling — Büyük Listeler
- **Ne:** 100+ satırda sadece görünen satırlar render edilir
- **Nasıl:** `<VirtualList>` bileşeni + `useVirtualList` hook
- **Etki:** Tüm liste sayfaları (endpoints, deliveries, webhooks, users, vb.)
- **Durum:** ⏳ Yapılacak (bileşen oluşturuldu, entegrasyon yapılacak)

### Katman 4: Concurrent Features — useTransition + useDeferredValue
- **Ne:** Arama ve filtreleme ana thread'i bloklamaz
- **Nasıl:** Arama kutularına `useDeferredValue`, filtre butonlarına `useTransition`
- **Etki:** Tüm arama/filtre bileşenleri
- **Durum:** ⏳ Yapılacak

### Katman 5: Akıllı Prefetch — Hover + Viewport
- **Ne:** Link hover'da veri önceden çekilir, viewport'a giren satırların detayı yüklenir
- **Nasıl:** `<PrefetchLink>` bileşeni + viewport observer
- **Etki:** Tüm navigasyon linkleri
- **Durum:** ⏳ Yapılacak

### Katman 6: Service Worker + PWA — Offline Cache
- **Ne:** İkinci ziyarette anında yükleme, offline çalışma
- **Nasıl:** Workbox ile Service Worker + manifest.json
- **Etki:** Tüm statik varlıklar + API cache
- **Durum:** ⏳ Yapılacak (sonraki oturum)

### Katman 7: Bundle Splitting — Kod Bölme
- **Ne:** Sadece gerekli kod yüklenir
- **Nasıl:** Dynamic imports + route-based splitting
- **Etki:** İlk yükleme boyutu
- **Durum:** ⏳ Yapılacak (sonraki oturum)

---

## Uygulama Katmanları

```
┌───────────────────────────────────────────────────────┐
│                    NEXT.JS APP                        │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Service Worker (Katman 6)                      │  │
│  │  → Statik varlık cache                         │  │
│  │  → API response cache (stale-while-revalidate) │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Layout Suspense (Katman 2)                     │  │
│  │  → dashboard/layout.tsx                         │  │
│  │  → admin/layout.tsx                             │  │
│  │  → docs/layout.tsx                              │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  React Query Provider (Katman 1)                │  │
│  │  → providers.tsx (global config)                │  │
│  │  → staleTime, gcTime, SWR, optimistic           │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Virtual List │ │ PrefetchLink │ │ Concurrent   │  │
│  │ (Katman 3)   │ │ (Katman 5)   │ │ (Katman 4)   │  │
│  │ → 100+ satır │ │ → Hover data │ │ → useDeferred│  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Sayfalar (172 adet)                            │  │
│  │  → Mevcut kod aynen kalır                       │  │
│  │  → Yeni katmanlar üstüne eklenir                │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

---

## Sayfa Kategorileri ve Öncelik

### Kategori A: Dashboard — Veri Ağırlıklı (Öncelik 1)
**~50 sayfa — En çok etkilenecek**

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

| Sayfa | Kritik Sorun | Çözüm |
|-------|--------------|-------|
| admin/system/ | 6 paralel query | Suspense |
| admin/settings/ | 3 query | Suspense |
| admin/security/ | Ağır sayfa | Suspense + Lazy |
| admin/cortex/ | Büyük sayfa | Suspense |

### Kategori C: Dokümantasyon (Öncelik 3)
**~60 sayfa — Statik, az optimizasyon gerekli**

- Prefetch yeterli
- Service Worker cache (sonraki oturum)

### Kategori D: Landing/Marketing (Öncelik 4)
**~30 sayfa — Statik**

- Service Worker cache yeterli
- Image optimization

### Kategori E: Auth (Öncelik 5)
**~7 sayfa — Hafif**

- Minimal optimizasyon
- Suspense yeterli

---

## Güvenlik Kuralları

### 🔴 KIRMIZI ÇİZGİLER (Asla İhlal Edilmez)

1. **Eski kod SİLİNMEZ** — Sadece üstüne katman eklenir
2. **Her adımda `cargo check`** — Rust tarafı bozulmamalı
3. **Her adımda `cargo test`** — Testler geçmeli
4. **Her adımda dashboard build** — `npm run build` hatasız olmalı
5. **Tek seferde bir katman** — Birden fazla katmanı aynı anda değiştirme
6. **Commit öncesi manuel kontrol** — Sayfa açılmalı, veri görünmeli

### 🟡 SARI ÇİZGİLER (Dikkatli Olunur)

1. **React Query staleTime** — Çok uzun tutarsan eski veri gösterilir
2. **Suspense fallback** — Skeleton, gerçek içerikle aynı layout'ta olmalı (layout shift!)
3. **Virtual scrolling** — Sabit yükseklik gerekli (dynamic height karmaşık)
4. **Prefetch** — Çok agresif prefetch bant genişliğini aşırı kullanır

### 🟢 YEŞİL ÇİZGİLER (Serbest)

1. **Yeni bileşen oluşturma** — `components/` altına yeni dosya ekleme
2. **Yeni hook oluşturma** — `hooks/` altına yeni dosya ekleme
3. **Config değişikliği** — `providers.tsx`, `next.config.js` ayarları

---

## Test Stratejisi

### Her Adım Sonrası Zorunlu Testler

```bash
# 1. Rust kontrolü (API/Worker bozulmamış mı?)
cd /root/.openclaw/workspace/HookSniff
cargo check --workspace          # Derleme hatası yok mu?
cargo test --workspace           # Tüm testler geçiyor mu?
cargo clippy --workspace -- -D warnings  # Kod kalitesi

# 2. Dashboard kontrolü
cd dashboard
npm run build                    # Build hatası yok mu?
npm run lint                     # ESLint hatası yok mu?
npm run test                     # Testler geçiyor mu?

# 3. Görsel kontrol (manuel)
# → Sayfayı tarayıcıda aç
# → Veri yükleniyor mu?
# → Skeleton görünüyor mu?
# → Veri geldiğinde skeleton kayboluyor mu?
# → Eski fonksiyonlar hâlâ çalışıyor mu?
```

### Test Sonuçları Kaydı

Her adım sonrası test sonuçları `.ai-context/gelismis-yukleme-sistemleri/TEST_RESULTS.md` dosyasına kaydedilir.

---

## Detaylı Uygulama Adımları

### Adım 1: Layout Suspense Boundaries (Katman 2)
**Süre:** ~20 dakika
**Etki:** 172 sayfa
**Risk:** 🟢 Düşük

```
1. dashboard/layout.tsx → <Suspense> ekle
2. admin/layout.tsx → <Suspense> ekle
3. docs/layout.tsx → <Suspense> ekle
4. Loading bileşenleri oluştur (SkeletonDashboard, SkeletonAdmin)
5. cargo check + cargo test
6. npm run build
7. Manuel kontrol: sayfalar açılıyor mu?
8. Commit + push
```

### Adım 2: Virtual Scrolling Entegrasyonu (Katman 3)
**Süre:** ~30 dakika
**Etki:** ~20 liste sayfası
**Risk:** 🟢 Düşük

```
1. useVirtualList hook oluştur (zaten var)
2. En kritik listeye uygula (deliveries)
3. cargo check + cargo test
4. npm run build
5. Manuel kontrol: liste kaydırması sorunsuz mu?
6. Diğer listelere yay
7. Commit + push
```

### Adım 3: Concurrent Features (Katman 4)
**Süre:** ~20 dakika
**Etki:** ~15 arama/filtre sayfası
**Risk:** 🟢 Düşük

```
1. useDeferredValueWrapper hook oluştur
2. Arama kutularına uygula
3. cargo check + cargo test
4. npm run build
5. Manuel kontrol: arama yaparken UI donmuyor mu?
6. Commit + push
```

### Adım 4: Akıllı Prefetch (Katman 5)
**Süre:** ~30 dakika
**Etki:** Tüm navigasyon
**Risk:** 🟢 Düşük

```
1. PrefetchLink bileşenini geliştir (zaten var)
2. Dashboard layout'taki link'lere uygula
3. cargo check + cargo test
4. npm run build
5. Manuel kontrol: hover'da veri önceden yükleniyor mu?
6. Commit + push
```

### Adım 5: Kritik Sayfa Optimizasyonları
**Süre:** ~40 dakika
**Etki:** En yavaş 10 sayfa
**Risk:** 🟡 Orta

```
1. admin/user-detail (16 query → Suspense + Lazy loading)
2. deliveries (1000+ kayıt → Virtual + Infinite scroll)
3. analytics (5 query → Suspense + Parallel)
4. endpoints (liste → Virtual)
5. Her sayfa sonrası: cargo check + test + build + manuel kontrol
6. Her sayfa sonrası: commit
```

### Adım 6: Service Worker + PWA (Katman 6)
**Süre:** ~40 dakika
**Etki:** Tüm site
**Risk:** 🟡 Orta
**Oturum:** Sonraki

```
1. next-pwa veya workbox kurulumu
2. Service Worker oluştur
3. Cache stratejisi belirle
4. manifest.json oluştur
5. Offline fallback sayfası
6. cargo check + cargo test
7. npm run build
8. Manuel kontrol: ikinci ziyaret hızlı mı?
9. Commit + push
```

### Adım 7: Bundle Splitting (Katman 7)
**Süre:** ~30 dakika
**Etki:** İlk yükleme boyutu
**Risk:** 🟢 Düşük
**Oturum:** Sonraki

```
1. Dynamic imports analizi
2. Route-based splitting
3. Chart lazy loading (zaten var ✅)
4. cargo check + cargo test
5. npm run build
6. Bundle analyzer çalıştır
7. Commit + push
```

---

## Sayfa Takip Tablosu

> Bu tablo her oturumda güncellenir. ✅ = optimize edildi, ⏳ = yapılacak, ⚪ = gerek yok

### Dashboard Sayfaları
| Sayfa | Suspense | Virtual | Prefetch | Concurrent | Durum |
|-------|----------|---------|----------|------------|-------|
| (dashboard)/page.tsx | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| endpoints/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| endpoints/[id]/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| deliveries/ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| deliveries/[id]/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| webhooks/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| analytics/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| logs/ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| billing/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| team/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| api-keys/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| service-tokens/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| notifications/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| alerts/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| transforms/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| inbound/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| applications/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| applications/[id]/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| search/ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| audit-log/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| health/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| settings/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| account/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| sso/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| templates/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| routing/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| environments/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| custom-domain/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| sandbox/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| schemas/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| streaming/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| portal-customize/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| retry-policy/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| rate-limiting/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| integrations/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| connectors/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| background-tasks/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| webhook-builder/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| signature-verifier/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| api-importer/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| operational-webhooks/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| observability/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| message-poller/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| content-mgmt/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| devtools/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| core/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| security-section/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| organization/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |

### Admin Sayfaları
| Sayfa | Suspense | Virtual | Prefetch | Concurrent | Durum |
|-------|----------|---------|----------|------------|-------|
| admin/page.tsx | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/users/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| admin/users/[id]/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/revenue/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/security/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/system/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/settings/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/alerts/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| admin/broadcasts/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/coupons/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| admin/email/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |
| admin/feature-flags/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| admin/refund-requests/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| admin/activity/ | ⏳ | ⏳ | ⏳ | ⚪ | ⏳ |
| admin/cortex/ | ⏳ | ⚪ | ⏳ | ⚪ | ⏳ |

### Statik Sayfalar (Sadece Prefetch + Service Worker)
| Sayfa | Durum |
|-------|-------|
| docs/* (60 sayfa) | ⏳ |
| landing/* (30 sayfa) | ⏳ |
| auth/* (7 sayfa) | ⏳ |

---

## Rollback Planı

### Her Adım İçin

```bash
# Adım öncesi
git stash  # Değişiklikleri kaydet

# Adım sonrası test
cargo check --workspace && cargo test --workspace && cd dashboard && npm run build

# Başarılıysa
git add . && git commit -m "perf: [katman adı] eklendi" && git push

# Başarısızsa
git checkout -- .  # Tüm değişiklikleri geri al
git stash pop      # Stash'ten geri yükle
```

### Acil Durum

```bash
# Son çalışan duruma dön
git log --oneline -5  # Son çalışan commit'i bul
git revert HEAD       # Son commit'i geri al
git push
```

---

## Performans Hedefleri

| Metrik | Şu An | Hedef | Ölçüm |
|--------|-------|-------|-------|
| İlk yükleme (LCP) | ~3-4 sn | <1.5 sn | Chrome DevTools |
| Sayfa geçişi | ~1-2 sn | <200ms | Chrome DevTools |
| Input lag | ~100ms | <16ms | React Profiler |
| Bellek kullanımı | Yüksek | %60 azalma | Chrome Memory |
| İkinci ziyaret | ~2 sn | <500ms | Chrome DevTools |
| API istek sayısı | 20-30 paralel | 5-10 paralel | Network tab |

---

*Bu dosya her oturumda güncellenir. Sonraki oturum: NEXT_SESSION.md'yi oku.*
