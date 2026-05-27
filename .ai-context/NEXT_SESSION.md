# 📋 Sonraki Oturum Rehberi

> **Son güncelleme:** 2026-05-27 (OpenClaw — Performans Optimizasyonu v3: Duplicate API Temizliği)
> **Bu dosya her oturum başında okunur.**

---

## ✅ Build Durumu: ÇALIŞIYOR

Build stabil. `npm run build` → exit 0 ✅

### Son Yapılan İş (2026-05-27 — Performans Optimizasyonu v3: Duplicate API Temizliği)
- **NotificationCenter:** 4 doğrudan API çağrısı → React Query hook'ları (cached, deduplicated)
- **BroadcastBanner:** doğrudan fetch → `useBroadcasts` React Query hook'u
- **EmailVerificationBanner:** ayrı `/auth/me` fetch'i → store'dan `email_verified` okuma (0 API)
- **Store:** `email_verified` User interface'ine eklendi
- **Yeni hook'lar:** `useBroadcasts.ts`, `useUnreadCounts.ts`
- **Sonuç:** 19 → 12 API çağrısı sayfa başına (%37 azalma), broadcasts ve teams duplicate'ları tamamen silindi
- **Commit:** `0b212b12`

### Önceki Yapılan İş (2026-05-27 — Performans Optimizasyonu v2)
- **`reactCompiler: true` varsayılan olarak açıldı** — `NEXT_EXPERIMENTAL_PERF` env var kaldırıldı, artık her build'de aktif
- **`cacheComponents: true` varsayılan olarak açıldı**
- **`useStatusCounts` optimizasyonu:** 4 ayrı API çağrısı → 1 (`/v1/stats` endpoint'i kullanılıyor) — %75 daha az ağ trafiği
- **QueryClient staleTime:** 30sn → 60sn (daha az gereksiz refetch)
- **gcTime:** 5dk → 10dk (cache daha uzun tutulur)
- **API timeout:** 30sn → 10sn (hızlı hata tespiti)
- **DeliveriesContent:** `useStatusCounts` yeni format'a uygun hale getirildi
- Commit: `5f52ccaa`

### Önceki Yapılan İş (2026-05-27 — Performans Optimizasyonu v1)
- **QueryClient cache stratejisi yenilendi:**
  - `staleTime`: 5dk → 30sn (daha taze veri)
  - `refetchOnMount: false` → `'always'` (sayfa açıldığında arka planda yenile)
  - `refetchOnWindowFocus: false` → `'always'` (sekmeye dönünce yenile)
  - `gcTime`: 30dk → 5dk (bellek tasarrufu)
- **13 hook'a `placeholderData` eklendi** — loading flash önlendi, sayfa geçişlerinde anında veri gösterimi
- **`useDeliveryLogs` optimizasyonu:** 4 API çağrısı → 1 (status counts ayrı cache'li, 60sn staleTime)
- **`useStatusCounts` hook eklendi** — `useQueries` ile paralel, ayrı cache key'leri
- **AdminShell build fix** — `useMemo`/`useCallback` import, `getUsers`→`listUsers`, `getSystem`→`getSystemHealth`
- Commit: `ab033f64`

### Önceki Yapılan İş (2026-05-27)
- **Dashboard tüm sayfalar düzeltildi** — "Something went wrong" hatası çözüldü
- 5 ayrı hata tespit edilip düzeltildi:
  1. `QueryClientRequiredError` → TanStack DB collection'larına `queryClient` parametresi eklendi
  2. `QueryBuilderError` → `useLiveQuery` callback'inden `null` döndürüldü (plain array yerine)
  3. `useDeliveryLogs` import eksik → DeliveriesContent'e eklendi
  4. `applications.noApplications` i18n eksik → en.json ve tr.json'a eklendi
  5. Undefined data crash → tüm `useLive*` hook'larına `safeMap` null guard eklendi
- **Vercel projesi düzeltildi** — `hooksniff-dash` projesine link, `hooksniff.vercel.app`'a deploy
- Git email `servetarslan02@gmail.com` olarak ayarlandı (Vercel deploy için)
- Commit'ler: `1cdd067a`, `bbb0f5cf`, `2b604fd7`, `2b233d56`, `d56c1ada`

### ⚠️ Kritik Not — Vercel Projesi
- CLI ile deploy ederken `--name hooksniff-dash` KULLANMA
- Önce `vercel link --project hooksniff-dash` yap, sonra `vercel --prod` ile deploy et
- Vercel proje adı: `hooksniff-dash` (hooksniff.vercel.app buna bağlı)
- Alternatif proje: `dashboard` (farklı URL)
- Commit: `e538c6c1`

---

## 📊 Katman Durumu (Gelişmiş Yükleme Sistemleri)

| Katman | Durum | Kapsam |
|--------|-------|--------|
| 1. React Query | ✅ | 46 dosyada useQuery/useMutation |
| 2. Suspense Boundaries | ✅ | 3 layout + 40 docs page refactor |
| 3. Virtual Scrolling | ✅ | VirtualTable 17 + VirtualList 19 = 36 dosyada |
| 4. Concurrent Features | ✅ | useDebouncedSearch 8 dosyada (tüm text search input'larda) |
| 5. Akıllı Prefetch | ✅ | PrefetchLink 60 dosyada (tüm Link'ler PrefetchLink) |
| 6. Cache Components | ✅ | cacheComponents: true — prerender hataları düzeltildi |
| 7. View Transitions | ✅ | 6 dosyada |
| 8. Turbopack | ✅ | Config aktif |
| 9. React Compiler | ✅ | babel-plugin-react-compiler kuruldu |
| 10. PPR | ❌ | Client layout'lar ile uyumsuz |
| 11. Infinite Scroll | ⏳ | Sıradaki adım |

**Aktif katmanlar: 1-9. Bloke: 10. Sıradaki: 12 (Infinite Scroll).**

---

## 🔜 Sonraki Adımlar

### Öncelik Sırası
1. **API yavaşlıkları (500-900ms)** — Rust backend yavaş, Cloud Run cold start veya DB sorguları. Backend log'larına bak, slow query'leri bul. en önemli iş bu
2. **auth/me hâlâ 2x çağrılıyor** — store'dan bir kez, muhtemelen usePermissions veya useTeams'den bir kez daha. Tekilleştir.
3. **Redis altyapısı** — Upstash yeni hesap veya alternatif (webhook hızlandırma için gerekli)
4. **DB Sorgu Optimizasyonu** — slow query log, index optimizasyonu (6 oturum)
5. **API Hızlandırma** — auth cache, rate limiting Redis'e taşıma (8 oturum)
6. **Webhook Hızlandırma** — Redis Streams queue (10 oturum)
7. **Cold Start** — minScale:1 (0.5 oturum)

### Kritik Notlar

- **Upstash Redis kotası dolmuş** (500K/500K) — yeni hesap veya alternatif gerekli
- **`cacheComponents: true`** açılamaz — `next-intl` server-side `getTranslations` Suspense gerektiriyor, layout yapısı buna izin vermiyor
- **Gelişmiş yükleme sistemi** 9/9 katman aktif (cacheComponents hariç)
- **Dashboard build** stabil, tüm sayfalar derleniyor

---

## 📁 Son Commit'ler

| Commit | Açıklama |
|--------|----------|
| `e538c6c1` | refactor: docs pages — async Content + Suspense wrapper (40 pages) |
| `0f11eca1` | wip: cacheComponents — server/client split devam ediyor |
| `c0ea8430` | feat: React Compiler — Katman 9 TAMAMLANDI |
| `34d9ff60` | perf: ViewTransition — changelog + newsletter |
| `c700b751` | perf: Deliveries VirtualTable |
| `f62ac666` | fix: build hataları düzeltildi |

---

## 📊 Proje Hızlandırma Planları

7 proje planı `.ai-context/` klasöründe hazır:

| Proje | Oturum | Öncelik |
|-------|--------|---------|
| DB Sorgu Optimizasyonu | 6 | 🔴 Yüksek (Faz 1 ✅, Faz 2 başlandı) |
| API Hızlandırma | 8 | 🔴 Yüksek |
| Webhook Hızlandırma | 10 | 🔴 Yüksek |
| Cold Start | 4 | 🟡 Orta |
| WebSocket/SSE | 7 | 🟢 Düşük |
| Güvenlik Geliştirme | 20 | 🟢 Düşük |
| Cortex Geliştirme | 19 | 🟢 Düşük |

**Toplam:** ~74 oturum. Önerilen sıra: DB → API → Webhook → Cold Start → diğerleri.
