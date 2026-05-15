# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 04:50 GMT+8

## Sıradaki İş: Faz 1 — React Query

### Yapılacaklar

1. **Kurulum**
   ```bash
   cd dashboard
   npm install @tanstack/react-query @tanstack/react-query-devtools
   ```

2. **QueryClient Provider**
   - `dashboard/src/app/[locale]/layout.tsx` (veya `providers.tsx`)
   - `QueryClient` oluştur (staleTime: 5dk, gcTime: 10dk)
   - `QueryClientProvider` + `ReactQueryDevtools` ekle

3. **Hook'ları oluştur**
   - `dashboard/src/hooks/useAdminData.ts` — admin stats, revenue, audit logs, feature flags, deploy info, users, user detail
   - `dashboard/src/hooks/useDashboardData.ts` — endpoints, endpoint detail, delivery trend, success rate

4. **Admin sayfalarını güncelle**
   - `admin/page.tsx` — useState+useEffect → useQuery
   - `admin/users/page.tsx` — useAdminUsers()
   - `admin/users/[id]/page.tsx` — useAdminUserDetail()
   - `admin/revenue/page.tsx` — useAdminRevenue()
   - `admin/system/page.tsx` — monitoring hook'ları

5. **Dashboard sayfalarını güncelle**
   - `(dashboard)/core/page.tsx` — useEndpoints()
   - `(dashboard)/endpoints/[id]/page.tsx` — useEndpointDetail()

6. **Optimistic updates ekle**
   - useUpdateEndpoint()
   - useUpdatePlan()
   - useToggleStatus()

7. **Doğrulama**
   - [ ] Dashboard açıldığında loading spinner görünmüyor (cache hit)
   - [ ] Sayfalar arası geçiş <100ms
   - [ ] React Query Devtools çalışıyor
   - [ ] Build başarılı
   - [ ] TypeScript hatası yok

### Dikkat Edilecekler

- Mevcut `useState` + `useEffect` kodunu silmeden önce `useQuery`'yi ekle
- Her sayfayı tek tek değiştir, hepsini birden değil
- `loading` state'i yerine `isLoading` kullan
- `error` state'i yerine `error` kullan
- Auto-refresh polling'i kaldır (React Query otomatik yapıyor)
