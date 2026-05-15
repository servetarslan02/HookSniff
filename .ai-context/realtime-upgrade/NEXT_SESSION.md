# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 05:15 GMT+8

## Sıradaki İş: Faz 1 (Devam) — Admin ve Dashboard Sayfaları

Faz 1'in altyapısı tamamlandı (hook'lar, provider, schema'lar). Sıradaki iş:

### 1. Admin Sayfalarını Güncelle

- [ ] `admin/users/page.tsx` → `useAdminUsers()`
- [ ] `admin/users/[id]/page.tsx` → `useAdminUserDetail()`
- [ ] `admin/revenue/page.tsx` → `useAdminRevenue()`
- [ ] `admin/system/page.tsx` → monitoring hook'ları
- [ ] `admin/alerts/page.tsx` → alerts hook'u
- [ ] `admin/settings/page.tsx` → settings hook'u
- [ ] `admin/activity/page.tsx` → audit logs hook'u

### 2. Dashboard Sayfalarını Güncelle

- [ ] `(dashboard)/core/page.tsx` → `useEndpoints()`
- [ ] `(dashboard)/endpoints/[id]/page.tsx` → `useEndpointDetail()`
- [ ] `(dashboard)/deliveries/page.tsx` → `useWebhooks()`

### 3. Faz 1 Doğrulama

- [ ] Dashboard açıldığında loading spinner görünmüyor (cache hit)
- [ ] Sayfalar arası geçiş <100ms
- [ ] React Query Devtools çalışıyor (development)
- [ ] Build başarılı (önceden var olan hatalar hariç)
- [ ] TypeScript hatası yok (bizim dosyalarda)

### 4. Faz 2'ye Geçiş

Faz 1 tüm sayfalar tamamlandıktan sonra → Faz 2: Event System (Rust backend)

## Dikkat Edilecekler

- Her sayfayı tek tek değiştir, hepsini birden değil
- Mevcut `useState` + `useEffect` kodunu silmeden önce `useQuery`'yi ekle
- Zod v4: `z.record(keySchema, valueSchema)` — iki argüman
- Önceden var olan hataları düzeltme (billing, team, admin/layout) — ayrı PR
