# HookSniff Dashboard — Teknik Dökümantasyon (Derinlemesine)

> Tarih: 2026-05-21
> Bu dosya gerçek çalışma mantıklarını içerir: API katmanı, state yönetimi, validasyon, hata handling, real-time features.

---

## 🏗️ MİMARİ GENEL BAKIŞ

### Katmanlı Yapı
```
┌─────────────────────────────────────────────┐
│  Page Components (sayfa/*.tsx)              │  ← UI + local state
├─────────────────────────────────────────────┤
│  Custom Hooks (hooks/useDashboardData.ts)   │  ← React Query + Zod validation
├─────────────────────────────────────────────┤
│  API Client (lib/api.ts)                    │  ← fetch, retry, auth, CSRF
├─────────────────────────────────────────────┤
│  Zod Schemas (schemas/api.ts)               │  ← Runtime type validation
├─────────────────────────────────────────────┤
│  Error Catalog (lib/error-catalog.ts)       │  ← User-friendly error messages
├─────────────────────────────────────────────┤
│  GCP Cloud Run API (Rust/Axum)              │  ← Backend
└─────────────────────────────────────────────┘
```

### Temel Teknolojiler
- **State Management**: React Query (TanStack Query) — localStorage persistence yok, server-side truth
- **Validasyon**: Zod — API response'ları runtime'da doğrulanır
- **Routing**: Next.js 15 App Router + `next-intl` i18n
- **Auth**: JWT (cookie-based) + API key (Bearer token)
- **Real-time**: SSE (Server-Sent Events) via `fetch` + `ReadableStream`
- **Grafikler**: Recharts (LazyCharts ile code-splitting)
- **UI Bileşenleri**: Tremor tabanlı (StatCard, ChartCard)

---

## 🔐 AUTH SİSTEMİ

### Token Yönetimi
```typescript
// lib/api.ts — API_BASE tanımı
export const API_BASE = typeof window !== 'undefined' 
  ? '/api/v1'                          // Browser: Vercel proxy
  : 'https://hooksniff-api-...run.app/v1';  // SSR: Direct Cloud Run
```

### 401 Auto-Refresh Mekanizması
```
1. API çağrısı → 401 response
2. doRefresh() çağrılır (POST /v1/auth/refresh, credentials: 'include')
3. Refresh başarılıysa → orijinal istek tekrarlanır
4. Refresh başarısızsa → localStorage temizle → /login'e redirect
5. Concurrent 401'ler → TEK refresh Promise (refreshPromise singleton)
```

**Kritik Detay**: `refreshPromise` singleton pattern — birden fazla 401 aynı anda gelse bile sadece TEK refresh isteği atılır. Diğerleri bu Promise'in sonucunu bekler.

### CSRF Koruması
```typescript
function getCSRFHeaders(method: string): Record<string, string> {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    return { 'Origin': window.location.origin };
  }
  return {};
}
```
- mutating isteklerde `Origin` header'ı otomatik eklenir
- Browser otomatik gönderir, attacker cross-origin spoof edemez

---

## 📡 API CLIENT (`lib/api.ts`)

### `apiFetch<T>()` — Merkezi Fetch Fonksiyonu

**Akış:**
```
1. assertOnline() — offline kontrol (navigator.onLine)
2. Header'ları oluştur (Content-Type, CSRF, Auth)
3. AbortController ile 30s timeout
4. for (attempt = 0; attempt <= 2; attempt++):
   a. fetch() çağrısı
   b. 401 → doRefresh() → retry
   c. 502/503/504 → exponential backoff (1s, 2s) ile retry
   d. Başarılı → return JSON
   e. Hata → error-catalog ile user-friendly message
5. Network hatası → retry with backoff
6. Timeout → "Request timed out" hatası
```

### Retry Stratejisi
- **Max retries**: 2 (toplam 3 deneme)
- **Backoff**: Exponential (1s, 2s, 4s)
- **Retryable**: 502, 503, 504 (transient errors)
- **Non-retryable**: 4xx hataları (client error)

### Error Handling Pipeline
```
API Response (error) 
  → extractErrorCode() — error code çıkar
  → getUserFriendlyMessage() — kullanıcı dostu mesaj
  → throw new Error(message)
```

### API Modülleri

#### `endpointsApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `list` | GET /endpoints | Tüm endpoint'leri listeler |
| `get` | GET /endpoints/:id | Tek endpoint detayı |
| `create` | POST /endpoints | Yeni endpoint (url, description, application_id) |
| `update` | PUT /endpoints/:id | Endpoint güncelle (url, description, is_active, retry_policy, routing_strategy, fallback_url) |
| `updateRetryPolicy` | PUT /endpoints/:id/retry-policy | Sadece retry policy güncelle |
| `delete` | DELETE /endpoints/:id | Endpoint sil |
| `rotateSecret` | POST /endpoints/:id/rotate-secret | Signing secret yenile |

#### `webhooksApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `list` | GET /webhooks?page=&status= | Teslimat listesi (pagination + status filter) |
| `create` | POST /webhooks | Yeni webhook gönder (endpoint_id, event, data) |
| `get` | GET /webhooks/:id/details | Teslimat detayı (headers, body, response) |
| `getAttempts` | GET /webhooks/:id/attempts | Tüm deneme listesi |
| `replay` | POST /webhooks/:id/replay | Tekli replay |
| `batchReplay` | POST /webhooks/batch/replay | Toplu replay (ids array) |

#### `analyticsApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `deliveryTrend` | GET /analytics/delivery-trend?range= | Zaman serisi (24h/7d/30d/90d) |
| `successRate` | GET /analytics/success-rate?range= | Başarı oranı + counts |

#### `applicationsApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `list` | GET /applications | Uygulama listesi |
| `get` | GET /applications/:id | Uygulama detayı |
| `create` | POST /applications | Yeni uygulama (name, description) |
| `update` | PUT /applications/:id | Uygulama güncelle |
| `delete` | DELETE /applications/:id | Uygulama sil |

#### `environmentsApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `list` | GET /environments | Ortam listesi |
| `get` | GET /environments/:id | Ortam detayı |
| `create` | POST /environments | Yeni ortam (name, slug, description, color) |
| `update` | PUT /environments/:id | Ortam güncelle |
| `delete` | DELETE /environments/:id | Ortam sil |
| `listVariables` | GET /environments/:id/variables | Ortam değişkenleri |
| `createVariable` | POST /environments/:id/variables | Değişken ekle (key, value, is_secret) |
| `deleteVariable` | DELETE /environments/:envId/variables/:varId | Değişken sil |

#### `backgroundTasksApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `list` | GET /background-tasks | Görev listesi |
| `get` | GET /background-tasks/:id | Görev detayı |
| `cancel` | PUT /background-tasks/:id | Görev iptal |

#### `operationalWebhooksApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `list` | GET /operational-webhooks | Endpoint listesi |
| `get` | GET /operational-webhooks/:id | Endpoint detayı |
| `create` | POST /operational-webhooks | Yeni endpoint (url, event_types) |
| `update` | PUT /operational-webhooks/:id | Endpoint güncelle |
| `delete` | DELETE /operational-webhooks/:id | Endpoint sil |
| `listDeliveries` | GET /operational-webhooks/:id/deliveries | Teslimat geçmişi |

#### `messagePollerApi`
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `poll` | GET /message-poller/poll?consumer_id=&limit= | Mesaj polling |
| `seek` | POST /message-poller/seek | Cursor pozisyonu değiştir |
| `commit` | POST /message-poller/commit | Mesaj işlendi olarak işaretle |

#### `api` (Generic)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `getAuditLog` | GET /audit-log?page=&limit=&action= | Denetim günlüğü |
| `getEndpointHealth` | GET /endpoint-health?range= | Endpoint sağlık durumu |
| `getApiKeys` | GET /api-keys | API key listesi |
| `createApiKey` | POST /api-keys | Yeni API key (name) |
| `deleteApiKey` | DELETE /api-keys/:id | API key sil |
| `rotateApiKey` | POST /api-keys/:id/rotate | API key yenile |
| `getPortalConfig` | GET /portal/config | Portal yapılandırması |
| `getPortalEmbedCode` | GET /portal/embed-code | Embed kodu |
| `updatePortalConfig` | POST /portal/config | Portal güncelle |
| `getRateLimits` | GET /rate-limits | Rate limit listesi |
| `setRateLimit` | POST /rate-limits/:endpointId | Rate limit ayarla (rps, burst, enabled) |
| `deleteRateLimit` | DELETE /rate-limits/:endpointId | Rate limit kaldır |
| `getSchemas` | GET /schemas | Schema listesi |
| `createSchema` | POST /schemas | Yeni schema (name, schema JSON) |
| `validateSchema` | POST /schemas/:id/validate | Payload doğrula |
| `search` | GET /search?q=&type= | Global arama |
| `getServiceTokens` | GET /service-tokens | Token listesi |
| `createServiceToken` | POST /service-tokens | Yeni token (name) |
| `revealServiceToken` | POST /service-tokens/:id/reveal | Token göster |
| `getTemplates` | GET /templates?industry= | Şablon listesi |
| `applyTemplate` | POST /templates/:id/apply | Şablon uygula (endpoint_url, enabled_agents) |

---

## 🎣 REACT QUERY HOOK'lar (`hooks/useDashboardData.ts`)

### Query Hook'ları (Veri Okuma)

Her hook şu pattern'i izler:
```typescript
export function useXxx() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['xxx'],
    queryFn: validated(() => api.fetchXxx(token!), ZodSchema),
    enabled: !!token,           // Token yoksa sorgu atma
    staleTime: 30_000,          // 30sn cache (fresh)
  });
}
```

**`validated()` wrapper'ı**: API response'unu Zod schema ile doğrular. Parse başarısız olursa runtime hata fırlatır.

| Hook | Query Key | Cache | Veri Kaynağı |
|------|-----------|-------|---------------|
| `useEndpoints` | `['endpoints']` | 30s | GET /endpoints |
| `useEndpointDetail(id)` | `['endpoint', id]` | 15s | GET /endpoints/:id |
| `useWebhooks(params)` | `['webhooks', params]` | 15s | GET /webhooks |
| `useDashboardStats` | `['stats']` | 30s | GET /stats |
| `useDeliveryTrend(range)` | `['analytics', 'delivery-trend', range]` | 30s | GET /analytics/delivery-trend |
| `useSuccessRate(range)` | `['analytics', 'success-rate', range]` | 30s | GET /analytics/success-rate |
| `useLatencyTrend(range)` | `['analytics', 'latency-trend', range]` | 30s | GET /analytics/latency-trend |
| `useBillingUsage` | `['billing', 'usage']` | 60s | GET /billing/usage |
| `useBillingInvoices` | `['billing', 'invoices']` | 60s | GET /billing/invoices |
| `useBillingSubscription` | `['billing', 'subscription']` | 60s | GET /billing/subscription |
| `useApplications` | `['applications']` | 30s | GET /applications |
| `useApplicationDetail(id)` | `['application', id]` | 15s | Parallel: app + endpoints + deliveries |
| `useAlerts` | `['alerts']` | 30s | GET /alerts |
| `useTeams` | `['teams']` | 30s | GET /teams |
| `useTeamMembers(teamId)` | `['teams', teamId, 'members']` | 15s | GET /teams/:id/members |
| `useTeamDetail(teamId)` | `['teams', teamId, 'detail']` | 15s | GET /teams/:id |
| `useTransformRules(endpointId)` | `['transforms', endpointId]` | 15s | GET /transforms/:endpointId |
| `useRateLimits` | `['rate-limits']` | 30s | GET /rate-limits |
| `useSchemas` | `['schemas']` | 30s | GET /schemas |
| `useServiceTokens` | `['service-tokens']` | 30s | GET /service-tokens |
| `useTemplates` | `['templates']` | 60s | GET /templates |

### Mutation Hook'ları (Veri Yazma)

Her mutation şu pattern'i izler:
```typescript
export function useDeleteXxx() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteXxx(token!, id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['xxx'] });
    },
  });
}
```

**Optimistic Update örneği** (`useToggleEndpoint`):
```typescript
onMutate: async ({ id, is_active }) => {
  await queryClient.cancelQueries({ queryKey: ['endpoint', id] });
  const previous = queryClient.getQueryData(['endpoint', id]);
  queryClient.setQueryData(['endpoint', id], (old) => ({ ...old, is_active }));
  return { previous };  // Rollback verisi
},
onError: (_err, { id }, context) => {
  if (context?.previous) {
    queryClient.setQueryData(['endpoint', id], context.previous);  // Rollback
  }
},
```

| Mutation | Invalidates | Optimistic |
|----------|-------------|------------|
| `useDeleteEndpoint` | endpoints, stats | ❌ |
| `useToggleEndpoint` | endpoint, endpoints, stats | ✅ |
| `useReplayDelivery` | webhooks, stats | ❌ |
| `useCreateAlert` | alerts | ❌ |
| `useUpdateAlert` | alerts | ❌ |
| `useDeleteAlert` | alerts | ❌ |
| `useTestAlert` | — | ❌ |
| `useCreateTeam` | teams | ❌ |
| `useUpdateTeam` | teams | ❌ |
| `useDeleteTeam` | teams | ❌ |
| `useInviteTeamMember` | teams[id].members | ❌ |
| `useRemoveTeamMember` | teams[id].members | ❌ |
| `useUpdateTeamMemberRole` | teams[id].members | ❌ |
| `useTransferOwnership` | teams, teams[id].members | ❌ |
| `useRevokeInvite` | teams | ❌ |
| `useResendInvite` | teams | ❌ |
| `useCreateTransformRule` | transforms[endpointId] | ❌ |
| `useUpdateTransformRule` | transforms[endpointId] | ❌ |
| `useDeleteTransformRule` | transforms[endpointId] | ❌ |
| `useTestTransform` | — | ❌ |
| `useSetRateLimit` | rate-limits | ❌ |
| `useDeleteRateLimit` | rate-limits | ❌ |
| `useCreateSchema` | schemas | ❌ |

---

## ✅ ZOD SCHEMAS (`schemas/api.ts`)

### Validasyon Mekanizması
```typescript
function validated<T>(
  fetcher: () => Promise<unknown>,
  schema: { parse: (data: unknown) => T }
): () => Promise<T> {
  return async () => {
    const data = await fetcher();
    return schema.parse(data);  // Runtime validation — hatalı veri crash eder
  };
}
```

### Temel Schemalar

#### `EndpointSchema`
```typescript
z.object({
  id: z.string(),
  url: z.string().url(),
  description: z.string().nullish(),
  is_active: z.boolean(),
  created_at: z.string(),
  routing_strategy: z.string().nullish(),      // round-robin, failover, weighted, random
  fallback_url: z.string().nullish(),
  avg_response_ms: z.number().nullish(),
  failure_streak: z.number().nullish(),
  retry_policy: z.object({                     // Nested object
    max_attempts: z.number(),
    backoff: z.string(),                       // exponential, linear, fixed
    initial_delay_secs: z.number(),
    max_delay_secs: z.number(),
  }).nullish(),
  signing_secret: z.string().nullish(),
  allowed_ips: z.array(z.string()).nullish(),
  event_filter: z.array(z.string()).nullish(),
  custom_headers: z.record(z.string(), z.string()).nullish(),
  application_id: z.string().nullish(),
  format: z.string().nullish(),
})
```

#### `DeliverySchema`
```typescript
z.object({
  id: z.string(),
  endpoint_id: z.string(),
  event: z.string().nullish(),
  status: z.enum(['pending', 'delivered', 'failed']),
  attempt_count: z.number(),
  response_status: z.number().nullish(),
  created_at: z.string(),
})
```

#### `DeliveryListResponseSchema`
```typescript
z.object({
  deliveries: z.array(DeliverySchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
})
```

#### `StatsResponseSchema`
```typescript
z.object({
  total_deliveries: z.number(),
  delivered: z.number(),
  failed: z.number(),
  pending: z.number(),
  success_rate: z.number(),
  endpoints_count: z.number(),
})
```

#### `DeliveryTrendSchema`
```typescript
z.object({
  range: z.string(),
  buckets: z.array(z.object({
    timestamp: z.string(),
    successful: z.number(),
    failed: z.number(),
  })),
})
```

#### `SuccessRateSchema`
```typescript
z.object({
  success_rate: z.number(),
  successful: z.number(),
  failed: z.number(),
  pending: z.number(),
})
```

#### `LatencyTrendSchema`
```typescript
z.object({
  buckets: z.array(z.object({
    ts: z.string(),
    avg_ms: z.number(),
    p95_ms: z.number(),
  })),
})
```

---

## 📡 REAL-TIME: SSE STREAM (`hooks/useDeliveryStream.ts`)

### Bağlantı Mekanizması
```
1. fetch(`${API_BASE}/stream/deliveries`, { headers: { Authorization: Bearer ... } })
2. response.body.getReader() — ReadableStream
3. TextDecoder ile chunk'ları decode et
4. SSE formatını parse et:
   - "event: delivery" → event type
   - "data: {...}" → JSON parse → DeliveryEvent
5. State güncelle: [yeni_delivery, ...eski] (max 100)
6. onDelivery callback çağır
```

### DeliveryEvent Tipi
```typescript
interface DeliveryEvent {
  id: string;
  endpoint_id: string;
  event: string | null;
  status: string;
  attempts: number;
  endpoint_url: string;
  created_at: string;
}
```

### Özellikler
- **Auto-reconnect**: Bağlantı koparsa yeniden bağlanır
- **Max buffer**: 100 delivery (eski olanlar atılır)
- **EventSource yerine fetch**: Custom header desteği (Authorization) için
- **Cleanup**: Component unmount'ta bağlantı kapatılır

---

## 🔄 URL-DRIVEN STATE (Deliveries Sayfası)

### State Yönetimi
```
URL: /deliveries?page=3&status=failed

searchParams.get('page') → 3
searchParams.get('status') → 'failed'

setParam('status', 'all') → URL'den parametre silinir
setParam('page', '5') → URL güncellenir
```

### Avantajları
- Bookmarklenebilir
- Browser back/forward çalışır
- Shareable link
- SEO friendly

### Arama (Debounced)
```
searchInput (anlık) → 300ms debounce → debouncedSearch (API'ye gider)
```

---

## 🎨 DASHBOARD WIDGET SİSTEMİ

### Widget Konfigürasyonu
```typescript
interface WidgetConfig {
  id: string;        // 'stat-cards', 'charts', 'recent-deliveries'
  visible: boolean;
}
```

### Saklama
- `localStorage` key: `dashboard_widget_config`
- Varsayılan: tüm widget'lar görünür

### Drag & Drop
```
1. onDragStart(id) → dragId state'e kaydedilir
2. onDragOver(id) → overId güncellenir (görsel feedback)
3. onDrop(id) → widget sırası güncellenir
4. saveWidgetConfig() → localStorage'a yaz
```

---

## 🛡️ GÜVENLİK

### Error Catalog (`lib/error-catalog.ts`)

Merkezi hata yönetimi — API error code'ları user-friendly mesajlara dönüştürülür:

| Code | Mesaj |
|------|-------|
| `UNAUTHORIZED` | "Please sign in to continue." |
| `INVALID_CREDENTIALS` | "Invalid email or password." |
| `RATE_LIMITED` | "Too many requests. Please wait." |
| `PLAN_UPGRADE_REQUIRED` | "This feature requires a plan upgrade." |
| `DATABASE_ERROR` | "Something went wrong. Please try again." |

**Pattern**: API → `extractErrorCode()` → `getUserFriendlyMessage()` → UI

### Input Sanitization (`lib/sanitize.ts`)
- XSS koruması
- HTML tag temizleme

---

## 📊 GRAFİK SİSTEMEMİ

### LazyCharts
- Code-splitting: Grafikler sadece gerektiğinde yüklenir
- `LazyAreaChart`, `LazyPieChart` — dynamic import

### Tremor Bileşenleri
- `StatCard`: Renkli istatistik kartları (blue, emerald, violet, red)
- `ChartCard`: Grafik wrapper'ı (başlık, alt başlık, time range selector)

### Zaman Aralığı
```typescript
type TimeRange = '24h' | '7d' | '30d' | '90d';
```
- Dashboard, Analytics, Latency sayfalarında kullanılır
- API'ye `?range=7d` parametresi olarak gider

---

## 🌐 i18n (Çoklu Dil)

### Yapılandırma
- `next-intl` kütüphanesi
- Dil dosyaları: `messages/en.json`, `messages/tr.json`
- URL formatı: `/en/dashboard`, `/tr/dashboard`

### Kullanım
```typescript
const t = useTranslations('dashboard');    // dashboard.* key'leri
const tc = useTranslations('common');      // common.* key'leri
```

---

## 🧩 BİLEŞEN MİMARİSİ

### Ortak Bileşenler
| Bileşen | Dosya | Kullanım |
|---------|-------|----------|
| `ConfirmDialog` | components/ConfirmDialog.tsx | Silme/onay modalları |
| `Toast` | components/Toast.tsx | Bildirim toast'ları |
| `StatusBadge` | components/StatusBadge.tsx | Durum etiketleri |
| `LoadingSpinner` | components/LoadingSpinner.tsx | Yükleme göstergesi |
| `LazySection` | components/LazySection.tsx | Skeleton loading |
| `DashboardWidget` | components/DashboardWidget.tsx | Sürükle-bırak widget |

### Code Splitting
- Her sayfa `dynamic()` ile lazy load
- SSR devre dışı (`ssr: false`) — client-only sayfalar
- Skeleton loading state

---

## 📋 SAYFA BAZLI ÇALIŞMA AKIŞLARI

### 1. Endpoints Sayfası
```
Kullanıcı → "Yeni Endpoint" butonu → form (URL + açıklama)
  → endpointsApi.create(token, { url, description })
  → onSuccess: queryClient.invalidateQueries(['endpoints'])
  → Endpoint listesi otomatik yenilenir

Kullanıcı → Toggle (aktif/pasif)
  → useToggleEndpoint (OPTIMISTIC UPDATE)
  → UI anında güncellenir
  → API çağrısı arka planda
  → Hata olursa eski değere rollback

Kullanıcı → Secret Rotation
  → endpointsApi.rotateSecret(token, id)
  → Yeni secret gösterilir (NewKeyAlert bileşeni)

Kullanıcı → Toplu Silme
  → selected Set'inden ID'leri al
  → Sırayla delete çağrısı
  → queryClient.invalidateQueries(['endpoints'])
```

### 2. Deliveries Sayfası
```
Sayfa açılır → URL'den page ve status okunur
  → useWebhooks({ page, status }) → API çağrısı
  → Zod validasyonu → Tablo render

Arama → searchInput (anlık) → 300ms debounce → debouncedSearch
  → API'ye ?q= parametresi

Replay → useReplayDelivery(id)
  → POST /webhooks/:id/replay
  → webhooks ve stats cache invalidated

SSE Stream → useDeliveryStream hook
  → fetch('/stream/deliveries') → ReadableStream
  → Yeni delivery'ler anlık tabloya eklenir
```

### 3. Analytics Sayfası
```
Sayfa açılır → 3 paralel sorgu:
  1. useDeliveryTrend(range) → Area chart data
  2. useSuccessRate(range) → Donut chart + stat cards
  3. useLatencyTrend(range) → Latency chart

Zaman aralığı değişimi → range state güncellenir
  → Tüm sorgular otomatik yeniden çekilir (queryKey değişir)
```

### 4. Routing Sayfası
```
Endpoint listesi → useEndpoints()
Her endpoint için → routing_strategy ve fallback_url gösterilir

Düzenleme → Modal açılır
  → Strategy seçimi (round-robin, failover, weighted, random)
  → Fallback URL input
  → endpointsApi.update(token, id, { routing_strategy, fallback_url })
  → Toast "Routing updated"
```

### 5. Retry Policy Sayfası
```
Endpoint listesi → useEndpoints()
Her endpoint için → retry_policy detayları

Düzenleme → Modal açılır
  → Max attempts (slider/input)
  → Backoff type (exponential/linear/fixed)
  → Initial delay (saniye)
  → Max delay (saniye)
  → endpointsApi.updateRetryPolicy(token, id, policy)
  → "Varsayılana Sıfırlama" butonu: { max: 3, backoff: exponential, initial: 10, max: 3600 }
```

### 6. Rate Limiting Sayfası
```
Rate limit listesi → useRateLimits()
İstatistikler → total_endpoints, avg_rps, peak_rps

Düzenleme → Modal açılır
  → RPS (requests per second)
  → Burst size
  → Enabled toggle
  → api.setRateLimit(token, endpointId, { rps, burst, enabled })

Silme → ConfirmDialog → api.deleteRateLimit(token, endpointId)
```

### 7. Schemas Sayfası
```
Schema listesi → api.getSchemas(token)

Oluşturma → Form (name + JSON Schema editörü)
  → api.createSchema(token, { name, schema })
  → Schema listesi yenilenir

Doğrulama → Schema seç + payload yapıştır
  → api.validateSchema(token, schemaId, payload)
  → Sonuç: { valid: true/false, errors: [{ path, message }] }
```

### 8. Templates Sayfası
```
Şablon listesi → useTemplates()
Şablon detayları: name, description, industry, event_types, agents, tags

Uygulama → Modal açılır
  → Endpoint URL input
  → Agent seçimi (enabled_agents checkbox)
  → api.applyTemplate(token, templateId, { endpoint_url, enabled_agents })
  → Toast "Template applied"
```

### 9. Transforms Sayfası
```
Endpoint seçimi → Dropdown
Transform kuralları → useTransformRules(endpointId)

Kural oluşturma → Form:
  → Filter (include/exclude pattern)
  → Map (source_field → target_field)
  → Enrich (key-value pairs)
  → transformsApi.create(token, endpointId, { rule })

Test → Test payload gir
  → transformsApi.test(token, ruleId, payload)
  → Sonuç gösterimi
```

### 10. Inbound Webhooks Sayfası
```
Provider yapılandırması → Stripe, GitHub, Shopify
Webhook URL'leri → Gelen webhook'lar işlenir
Yönlendirme → Kendi endpoint'lerine forwarding
```

### 11. Team Sayfası
```
Ekip listesi → useTeams()
Ekip detayı → useTeamDetail(teamId) + useTeamMembers(teamId)

Ekip oluşturma → CreateTeamModal → useCreateTeam()
Üye daveti → InviteMemberModal (email + role) → useInviteTeamMember()
Rol değiştirme → useUpdateTeamMemberRole()
Üye çıkarma → ConfirmDialog → useRemoveTeamMember()
Sahiplik transferi → TransferOwnershipModal → useTransferOwnership()
Davet iptali → useRevokeInvite()
Davet yeniden gönderme → useResendInvite()
Ekip silme → ConfirmDialog → useDeleteTeam()
Ekipten ayrılma → ConfirmDialog → useLeaveTeam()
```

### 12. Billing Sayfası
```
Plan bilgileri → useBillingSubscription()
Faturalar → useBillingInvoices()
Kullanım → useBillingUsage()
Aşım ayarları → useOverageSettings()

Plan yükseltme → PlanCards → billingApiExtended.upgrade()
İptal → ConfirmDialog → billingApiExtended.cancel()
Duraklatma → pauseDays seçimi → billingApiExtended.pause()
İndirim kodu → discountCode input → billingApiExtended.applyDiscount()
```

### 13. Settings Sayfası
```
5 sekme: Profile, Security, Notifications, Privacy, Danger Zone

Profile → ProfileSection (ad, email, avatar)
Security → PasswordSection + TwoFactorSection (TOTP)
Notifications → NotificationSection (toggle'lar)
Privacy → PrivacyConsentSection (KVKK/GDPR onayları)
Danger Zone → DangerZoneSection (hesap silme, veri dışa aktarma)
```

### 14. Playground Sayfası
```
HTTP method + path + body seçimi
Preset templates → Hazır payload'lar
AI Generator → AI destekli payload oluşturma
Send → API'ye istek at
Response → Status, headers, body, duration gösterimi
History → localStorage'da geçmiş istekler
```

### 15. Signature Verifier Sayfası
```
Payload + Secret + Signature gir
Algorithm seç (SHA-256 / SHA-512)
Verify → Web Crypto API ile HMAC hesapla
  → timingSafeEqual() ile constant-time comparison
  → Sonuç: Valid / Invalid
Code examples → Node.js, Python, Go implementasyonu
```

---

## 🔧 PERFORMANS OPTİMİZASYONLARI

1. **React Query Cache**: 15-60s staleTime — gereksiz API çağrılarını önler
2. **Code Splitting**: Her sayfa dynamic import — initial bundle küçük
3. **LazyCharts**: Grafikler sadece gerektiğinde yüklenir
4. **LazySection**: Skeleton loading — layout shift önler
5. **Debounce**: Arama 300ms debounce — gereksiz API çağrılarını önler
6. **Optimistic Updates**: Toggle endpoint — UI anında güncellenir
7. **Singleton Refresh**: Concurrent 401'ler tek refresh ile çözülür

---

> Bu dosya `.ai-context/` dizininde GitHub'da saklanır.
> Her oturum başında okunmalı, değişiklikler sonrası güncellenmeli.
