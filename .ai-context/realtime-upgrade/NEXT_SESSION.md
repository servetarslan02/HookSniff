# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 04:58 GMT+8

## Sıradaki İş: Faz 1 — React Query + Zod

### Yapılacaklar

1. **Kurulum**
   ```bash
   cd dashboard
   npm install @tanstack/react-query @tanstack/react-query-devtools zod
   ```

2. **Zod Schema Tanımları**
   - `dashboard/src/schemas/api.ts` oluştur
   - Endpoint, Delivery, AdminStats, WsEvent schema'ları
   - Tüm API response'ları Zod ile validate et

3. **QueryClient Provider**
   - `dashboard/src/app/[locale]/layout.tsx` (veya `providers.tsx`)
   - `QueryClient` oluştur (staleTime: 5dk, gcTime: 10dk, retry: 2, exponential backoff)
   - `QueryClientProvider` + `ReactQueryDevtools` ekle

4. **Hook'ları oluştur**
   - `dashboard/src/hooks/useAdminData.ts` — admin stats, revenue, audit logs, feature flags, deploy info, users, user detail
   - `dashboard/src/hooks/useDashboardData.ts` — endpoints, endpoint detail, delivery trend, success rate
   - Her hook'ta Zod validation var

5. **Admin sayfalarını güncelle**
   - `admin/page.tsx` — useState+useEffect → useQuery
   - `admin/users/page.tsx` — useAdminUsers()
   - `admin/users/[id]/page.tsx` — useAdminUserDetail()
   - `admin/revenue/page.tsx` — useAdminRevenue()
   - `admin/system/page.tsx` — monitoring hook'ları

6. **Dashboard sayfalarını güncelle**
   - `(dashboard)/core/page.tsx` — useEndpoints()
   - `(dashboard)/endpoints/[id]/page.tsx` — useEndpointDetail()

7. **Optimistic updates ekle**
   - useUpdateEndpoint()
   - useUpdatePlan()
   - useToggleStatus()

8. **Doğrulama**
   - [ ] Dashboard açıldığında loading spinner görünmüyor (cache hit)
   - [ ] Sayfalar arası geçiş <100ms
   - [ ] React Query Devtools çalışıyor
   - [ ] Zod validation çalışıyor (geçersiz veri → hata)
   - [ ] Build başarılı
   - [ ] TypeScript hatası yok

### Dikkat Edilecekler

- Mevcut `useState` + `useEffect` kodunu silmeden önce `useQuery`'yi ekle
- Her sayfayı tek tek değiştir, hepsini birden değil
- `loading` state'i yerine `isLoading` kullan
- `error` state'i yerine `error` kullan
- Auto-refresh polling'i kaldır (React Query otomatik yapıyor)
- Zod validation hatalarını Sentry'ye gönder
