# Real-Time Upgrade — Sonraki Oturum

> Son güncelleme: 2026-05-16 22:10 GMT+8

## Tamamlanan (Bu Oturum)

### React Query Geçişleri (11 sayfa tamamlandı)
- [x] audit-log → `useAuditLogs` hook
- [x] health → `useEndpointHealth` hook (30s auto-refetch)
- [x] analytics → `useDeliveryTrend` + `useSuccessRate` + `useLatencyTrend`
- [x] api-keys → `useApiKeys` + `useCreateApiKey` + `useDeleteApiKey` + `useRotateApiKey`
- [x] rate-limiting → `useRateLimits`
- [x] retry-policy → `useEndpoints`
- [x] routing → `useEndpoints`
- [x] schemas → `useSchemas`
- [x] search → `useSearch` (debounced, paginated)
- [x] service-tokens → `useServiceTokens` + CRUD mutations
- [x] templates → `useTemplates`

### Altyapı Eklemeleri
- [x] 13 read hook + 11 mutation hook (`useDashboardData.ts`)
- [x] 16 Zod şeması (`schemas/api.ts`)
- [x] 15 API type + 22 API method (`lib/api.ts`)
- [x] EndpointHealthSchema, LatencyTrendSchema, ApiKeySchema vb.
- [x] SearchResponseData type düzeltmesi (backend ile uyumlu)

### Commit'ler
- `baff5b44` — audit-log + health
- `1eaa50cb` — 9 sayfa + hooks + schemas + types

---

## 📋 Sıradaki İşler

### Öncelik 1 — Kalan 4 Sayfa (hook'lar hazır, sadece sayfa rewrite)

| # | Sayfa | Mevcut Hook'lar | Durum |
|---|-------|----------------|-------|
| 1 | portal-customize | `usePortalConfig`, `usePortalEmbedCode`, `useUpdatePortalConfig` | ⬜ |
| 2 | portal-manage | `usePortalProfile`, `usePortalUsage` | ⬜ |
| 3 | webhook-builder | `useEndpoints`, `useCreateWebhook` | ⬜ |
| 4 | webhooks/webhooks/new | `useEndpoints`, `useCreateWebhook` | ⬜ |

**Not:** Bu sayfalar daha karmaşık (form submit, preview, embed code). Hook'lar hazır, sadece sayfa kodu rewrite edilecek.

### Öncelik 2 — TypeScript Kontrolü
- `npm install` (dashboard/)
- `npx tsc --noEmit` — tüm dosyalarda tip kontrolü
- Hata varsa düzelt

### Öncelik 3 — Deploy Kontrolü
- Vercel deploy tetiklendi mi? (push → auto-deploy)
- Cloud Run deploy tetiklendi mi?
- Dashboard aç, WS bağlantısı yeşil gösterge kontrol et

### Öncelik 4 — Opsiyonel
- Sentry DSN env var ekle (`NEXT_PUBLIC_SENTRY_DSN`)
- k6 stress test (`tests/load/k6_ws_stress.js`)

---

## Teknik Notlar

### Git
- Email: servetarslan02@users.noreply.github.com
- Remote: https://github.com/servetarslan02/HookSniff.git (token yok, push için token gerekli)

### Hook Deseni
```typescript
// Read hook
export function useXxx() {
  const { token } = useAuth();
  return useQuery<Type[]>({
    queryKey: ['xxx'],
    queryFn: validated(() => api.getXxx(token!), XxxSchema.array()),
    enabled: !!token,
    staleTime: 15_000,
  });
}

// Mutation hook
export function useCreateXxx() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Type) => api.createXxx(token!, data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['xxx'] }),
  });
}
```

### Sayfa Deseni
```typescript
'use client';
import { useXxx } from '@/hooks/useDashboardData';

export default function XxxPage() {
  const { data = [], isLoading } = useXxx();
  // loading state → skeleton
  // empty state → illustration
  // data state → table/cards
}
```
