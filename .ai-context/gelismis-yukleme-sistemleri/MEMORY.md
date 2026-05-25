# 🧠 Gelişmiş Yükleme Sistemleri — Hafıza

> **Başlangıç:** 2026-05-25
> **Son güncelleme:** 2026-05-25
> **Bu dosya her oturum sonunda güncellenir.**

---

## 📋 Proje Nedir?

HookSniff dashboard'unda **172 sayfa** var. Tüm sayfaları zirve performans teknolojileriyle optimize ediyoruz. Amaç: Vercel, Stripe, Linear, GitHub seviyesinde yükleme hızı.

---

## 🔧 Mevcut Teknoloji Stack

| Teknoloji | Versiyon | Durum |
|-----------|----------|-------|
| Next.js | 16.2.6 | ✅ Güncel |
| React | 19.2.6 | ✅ Güncel (use() hook destekliyor) |
| TanStack React Query | 5.100.10 | ✅ Kurulu |
| TanStack Virtual | 3.13.24 | ✅ Kurulu ama **kullanılmıyor** |
| Recharts | 3.8.1 | ✅ Kurulu (lazy loading var) |
| Tailwind CSS | 4.3.0 | ✅ Güncel |
| Sentry | 10.53.1 | ✅ Kurulu |
| next-intl | 4.0.0 | ✅ Kurulu (5 dil) |

---

## 📊 Yapılan İşler

### 2026-05-25 — İlk Oturum

#### Yapılan
1. **Araştırma yapıldı** — Vercel, Stripe, Linear, GitHub'ın performans teknolojileri araştırıldı
2. **PLAN.md oluşturuldu** — 7 katmanlı uygulama planı
3. **NEXT_SESSION.md oluşturuldu** — Her adımın detaylı talimatları
4. **PAGE_TRACKER.md oluşturuldu** — 172 sayfa takip tablosu
5. **QueryClient optimizasyonu** — `providers.tsx` güncellendi:
   - `gcTime`: 10dk → 30dk (daha uzun cache)
   - `refetchOnReconnect`: false (offline'da istek gönderme)
   - `refetchOnMount`: false (cache varsa yeniden çekme)
   - `retry`: 2 → 1 (hız için)
   - `networkMode`: 'online'
   - `placeholderData`: önceki veriyi göster (SWR pattern)
   - Focus manager devre dışı (Linear tarzı)

#### Bulgu
- `@tanstack/react-virtual` zaten kurulu ama hiçbir listede kullanılmıyor — büyük fırsat
- `admin/user-detail` sayfası **16 paralel query** çalıştırıyor — en kritik sayfa
- Dashboard layout Suspense boundary yok — tüm sayfalar aynı anda yükleniyor
- Arama kutularında `useDeferredValue` yok — setTimeout debounce kullanılıyor

---

## 🎯 Kritik Sayfalar (En Yavaş)

| Sayfa | Sorun | Öncelik |
|-------|-------|---------|
| admin/users/[id] | 16 paralel query | 🔴 |
| deliveries | 1000+ kayıt, virtual yok | 🔴 |
| analytics | 5 paralel query | 🟡 |
| logs | Arama + filtre, debounce kötü | 🟡 |
| endpoints | Liste, virtual yok | 🟡 |

---

## 📐 Uygulama Kuralları

1. **Eski kod SİLİNMEZ** — Sadece üstüne katman eklenir
2. **Her adımda `cargo check + cargo test`** — Rust tarafı bozulmamalı
3. **Her adımda `npm run build`** — Dashboard build hatasız olmalı
4. **Tek seferde bir katman** — Birden fazla katmanı aynı anda değiştirme
5. **Commit öncesi manuel kontrol** — Sayfa açılmalı, veri görünmeli
6. **PAGE_TRACKER.md güncelle** — Her tamamlanan sayfa işaretlenmeli

---

## 🔗 İlgili Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `PLAN.md` | Ana plan, tüm adımlar |
| `NEXT_SESSION.md` | Sonraki oturum rehberi |
| `PAGE_TRACKER.md` | Sayfa takip tablosu |
| `MEMORY.md` | Bu dosya |
| `dashboard/src/app/[locale]/providers.tsx` | QueryClient config |
| `dashboard/src/components/LoadingSkeletons.tsx` | Skeleton bileşenleri (yeni) |
| `dashboard/src/hooks/useVirtualList.ts` | Virtual list hook (yeni) |
| `dashboard/src/hooks/useDebouncedSearch.ts` | Debounced search hook (yeni) |
| `dashboard/src/components/PrefetchLink.tsx` | Prefetch link (geliştirilecek) |

---

## 📝 Oturum Notları

### Oturum 1 — 2026-05-25

- Servet tüm sayfaları optimize etmemizi istiyor
- Tek tek sayfa değil, **sistem kuracağız** (5 katman)
- Eski kod silinmeyecek, üstüne eklenecek
- Her adımda test zorunlu
- `.ai-context/` klasörüne detaylı dokümantasyon oluşturuldu
- QueryClient optimizasyonu yapıldı (providers.tsx)
- Sonraki oturum: Layout Suspense Boundaries (Adım 1)

---

*Bu dosya her oturum sonunda güncellenir.*
