# HookSniff Admin Panel — API & Data Flow Analysis

**Tarih:** 2026-05-10  
**Analiz Kapsamı:** Backend API (Rust/Axum) + Frontend Dashboard (Next.js) + Network Katmanı

---

## 1. Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js / Vercel)                   │
│                                                                  │
│  Admin Pages ──► lib/api.ts (adminApi) ──► fetch() ─────────────┼──► /api/* (Vercel rewrite)
│  store.tsx ────► useAuth() ──► cookie-based auth                │
│  AuthGuard ────► client-side redirect                           │
│  AdminLayout ──► is_admin check (client-side)                   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│               Backend API (Rust/Axum / Cloud Run)               │
│                                                                  │
│  Middleware Pipeline:                                            │
│  request_id → rate_limit → auth_middleware → admin_middleware    │
│                                                                  │
│  Admin Routes (/v1/admin/*):                                     │
│  ├── GET  /users          ── list_users                         │
│  ├── GET  /users/:id      ── get_user_detail                    │
│  ├── PUT  /users/:id/plan ── change_plan                        │
│  ├── PUT  /users/:id/status ── change_status                    │
│  ├── GET  /stats          ── system_stats                       │
│  ├── GET  /revenue        ── revenue_by_month                   │
│  └── POST /sdk-update     ── notify_sdk_update                  │
│                                                                  │
│  Auth: Cookie (hooksniff_token) + Bearer JWT/API key            │
│  DB: PostgreSQL (sqlx)                                          │
│  Cache: Redis (Upstash) / In-memory fallback                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoint'leri — Admin

| Endpoint | Method | Auth | Rate Limit | Input Validation | Status | Sorun |
|---|---|---|---|---|---|---|
| `/v1/admin/users` | GET | ✅ auth + admin middleware | ✅ plan-based | ✅ pagination, search, filters | ✅ Çalışıyor | `bind_idx` unused assignment warning (kod kalitesi) |
| `/v1/admin/users/:id` | GET | ✅ auth + admin middleware | ✅ plan-based | ✅ UUID path param | ✅ Çalışıyor | — |
| `/v1/admin/users/:id/plan` | PUT | ✅ auth + admin middleware | ✅ plan-based | ✅ plan enum check | ✅ Çalışıyor | — |
| `/v1/admin/users/:id/status` | PUT | ✅ auth + admin middleware | ✅ plan-based | ✅ self-deactivation guard | ✅ Çalışıyor | — |
| `/v1/admin/stats` | GET | ✅ auth + admin middleware | ✅ plan-based | — | ✅ Çalışıyor | Revenue hesaplama hardcoded ($29/$99) |
| `/v1/admin/revenue` | GET | ✅ auth + admin middleware | ✅ plan-based | — | ⚠️ UYUMSUZLUK | Frontend beklenen format farklı (aşağıda) |
| `/v1/admin/sdk-update` | POST | ✅ auth + admin middleware | ✅ plan-based | ✅ empty check | ✅ Çalışıyor | — |
| `/v1/admin/settings` | PUT | ❌ YOK | ❌ | ❌ | 🔴 EKSIK | Frontend çağırıyor ama backend'de bu route yok! |

---

## 3. Kritik Uyumsuzluklar (Frontend ↔ Backend)

### 🔴 KRİTİK: `/admin/settings` Endpoint Eksik

**Frontend** (`admin/settings/page.tsx`):
```typescript
const res = await fetch(`${API}/admin/settings`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(settings),
});
```

**Backend** (`admin.rs`): Bu route tanımlı DEĞİL. Admin router'ında sadece 7 endpoint var, `/settings` bunlardan biri değil.

**Etki:** Settings sayfasındaki "Save" butonu 404/405 hatası döndürecek. Platform ayarları (maintenance mode, signup toggle, plan limits) kaydedilemez.

---

### 🔴 KRİTİK: Revenue Response Format Uyumsuzluğu

**Backend** (`/v1/admin/revenue`) döndürür:
```rust
// Vec<RevenueRow> — sadece month + revenue
pub struct RevenueRow {
    pub month: String,    // "2024-01"
    pub revenue: f64,
}
```

**Frontend** (`adminApi.getRevenue`) bekler:
```typescript
interface RevenueResponse {
  monthly_revenue: { month: string; revenue: number }[];
  revenue_by_plan: { plan: string; revenue: number; count: number }[];
  mrr: number;
  churn_rate: number;
}
```

**Etki:** Revenue sayfası `revenue?.monthly_revenue`, `revenue?.mrr`, `revenue?.churn_rate` alanlarını `undefined` olarak okuyacak. Grafikler boş, MRR ve churn rate "0" görünecek.

---

### 🟡 ORTA: User Detail — Endpoint `created_at` Eksik

**Backend** `EndpointSummary`:
```rust
pub struct EndpointSummary {
    pub id: Uuid,
    pub url: String,
    pub description: Option<String>,
    pub is_active: bool,
    // ❌ created_at YOK
}
```

**Frontend** `AdminUserDetail`:
```typescript
endpoints: { id: string; url: string; is_active: boolean; created_at: string }[];
// ❌ created_at bekleniyor ama gelmeyecek
```

**Etki:** User detail sayfasında endpoint oluşturulma tarihi gösterilemeyecek.

---

### 🟡 ORTA: Admin System Page — `/health` Endpoint Eksik

**Frontend** (`admin/system/page.tsx`):
```typescript
const res = await fetch(`${API}/health`, {
  headers: { Authorization: `Bearer ${token}` },
});
// Beklenen response: { database, redis, api, queue }
```

**Backend:** `/health` route'u tanımlı DEĞİL. Sadece `/status` (public) var, o da farklı format döndürüyor (`components` array).

**Etki:** System health sayfası 404 döndürecek, hiçbir servis durumu gösterilemeyecek.

---

## 4. Veri Akışı Analizi

### Admin Overview Sayfası
```
AdminOverviewPage
  └─► useAuth() → token (cookie-based)
  └─► adminApi.getStats(token)
       └─► apiFetch('/admin/stats', { token })
            └─► fetch(API_BASE + '/admin/stats', { credentials: 'include' })
                 └─► Backend: auth_middleware → admin_middleware → system_stats()
                      └─► SQL: COUNT(customers), COUNT(deliveries), SUM(revenue), ...
                           └─► JSON response → setStats() → UI render
```

### Admin Users Sayfası
```
AdminUsersPage
  └─► useAuth() → token
  └─► adminApi.listUsers(token, { page, search, plan, status })
       └─► apiFetch('/admin/users?page=...&search=...', { token })
            └─► Backend: auth_middleware → admin_middleware → list_users()
                 └─► Dynamic SQL with WHERE clauses + pagination
                      └─► PaginatedUsers response → setUsers() → Table render
```

### Admin User Detail Sayfası
```
AdminUserDetailPage
  └─► useParams() → id
  └─► adminApi.getUserDetail(token, id)
       └─► apiFetch('/admin/users/' + id, { token })
            └─► Backend: 3 parallel SQL queries
                 ├── User info
                 ├── Endpoints list
                 ├── Recent deliveries (LIMIT 50)
                 └── Usage stats (COUNT queries)
                      └─► UserDetailResponse → setDetail() → UI render
```

### Admin Revenue Sayfası
```
AdminRevenuePage
  └─► adminApi.getRevenue(token)
       └─► apiFetch('/admin/revenue', { token })
            └─► Backend: generate_series SQL (last 12 months)
                 └─► Vec<RevenueRow> [{ month, revenue }]
                      └─► ⚠️ Frontend revenue.monthly_revenue → UNDEFINED
                      └─► ⚠️ Frontend revenue.mrr → UNDEFINED
                      └─► ⚠️ Frontend revenue.churn_rate → UNDEFINED
```

### Admin Settings Sayfası
```
AdminSettingsPage
  └─► useState(defaultSettings) — hardcoded defaults
  └─► handleSave()
       └─► fetch(API + '/admin/settings', { method: 'PUT', body: settings })
            └─► 🔴 Backend: 404 Not Found (route doesn't exist)
```

### Admin System Sayfası
```
AdminSystemPage
  └─► useEffect → setInterval(fetchHealth, 15000)
  └─► fetchHealth()
       └─► fetch(API + '/health', { headers: { Authorization } })
            └─► 🔴 Backend: 404 Not Found (route doesn't exist)
       └─► Expected: { database, redis, api, queue }
```

---

## 5. Auth & Güvenlik Analizi

### Auth Flow
```
Login → POST /v1/auth/login
  ├─ Rate limit: 10 attempts/IP/15min
  ├─ Password verify (Argon2id)
  ├─ 2FA check (TOTP)
  ├─ Generate JWT access token (24h)
  ├─ Generate refresh token (30 days, HttpOnly cookie)
  └─ Set-Cookie: hooksniff_token (HttpOnly, Secure, SameSite=None)

Dashboard → GET /v1/auth/me (cookie-based session verify)
  └─ Returns: { id, email, name, plan, is_admin }

Admin Access:
  ├─ Frontend: AdminLayout checks user.is_admin (client-side)
  ├─ Backend: auth_middleware → admin_middleware (server-side)
  └─ Double protection: ✅
```

### Güvenlik Değerlendirmesi

| Katman | Durum | Notlar |
|---|---|---|
| Auth middleware | ✅ İyi | Cookie + Bearer dual support, API key hash (Argon2id) |
| Admin middleware | ✅ İyi | `is_admin` check, 403 on non-admin |
| Rate limiting | ✅ İyi | Plan-based, Redis/InMemory, proper headers |
| Input validation | ✅ İyi | Plan enum, UUID paths, email format |
| Error handling | ✅ İyi | Consistent `AppError` enum, no info leakage |
| Self-protection | ✅ İyi | Admin can't deactivate themselves |
| SQL injection | ✅ İyi | Parameterized queries (sqlx) |
| CSRF (settings) | ⚠️ Eksik | Settings page uses raw `fetch()` without CSRF token |
| Token refresh | ✅ İyi | Auto-refresh on 401, cookie-based |

---

## 6. Frontend API Katmanı Sorunları

### 6.1 `api.ts` — Response Parse Hatası Riski

```typescript
// api.ts:42 — 401 handler
if (res.status === 401) {
  // Refresh attempt
  const refreshRes = await fetch(`${API_BASE}/auth/refresh`, { ... });
  if (refreshRes.ok) {
    const retryRes = await fetch(`${API_BASE}${path}`, { ... });
    if (retryRes.ok) {
      return retryRes.json(); // ✅ retry works
    }
  }
  // Fall through to logout
  localStorage.removeItem('hooksniff_auth'); // ❌ Wrong key! Should be 'hooksniff_user'
  window.location.href = '/login';
}
```

**Sorun:** `localStorage.removeItem('hooksniff_auth')` — store.tsx'de `STORAGE_KEY = 'hooksniff_user'` olarak tanımlı. Yanlış key siliniyor, stale auth data kalabilir.

### 6.2 `admin/settings/page.tsx` — Token Header Kullanımı

```typescript
const res = await fetch(`${API}/admin/settings`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // token = 'cookie' (placeholder)
  },
  body: JSON.stringify(settings),
});
```

**Sorun:** `token` store.tsx'den `'cookie'` string olarak gelior (HttpOnly cookie modu). Ama bu sayfa `apiFetch` yerine raw `fetch()` kullanıyor ve `Authorization: Bearer cookie` gönderiyor. Backend middleware'i bu placeholder'ı atlayıp cookie'den okuyor olsa da, bu tutarsız bir pattern.

### 6.3 `admin/system/page.tsx` — Aynı Sorun

```typescript
const res = await fetch(`${API}/health`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Aynı raw `fetch()` + placeholder token pattern'i. Ayrıca `/health` endpoint'i backend'de yok.

### 6.4 Eksik Error State Yönetimi

Birçok admin sayfasında:
```typescript
} catch (err) {
  // Error handled silently ← boş catch
}
```

**Sorun:** Kullanıcıya hata gösterilmiyor. Sadece loading bitiyor ve boş/eksik data gösteriliyor.

---

## 7. Rate Limiting Analizi

### Backend Rate Limiting
- **Global middleware**: Plan-based (Free/Pro/Business → farklı limits)
- **Auth endpoints**: Login 10/IP/15min, Register 5/IP/hour, Reset 5/IP/hour
- **Redis support**: Sliding window with sorted sets (production)
- **In-memory fallback**: Development/single-instance
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

### Frontend Rate Limiting
- **Newsletter**: 3/IP/hour (in-memory, Next.js API route)
- **Admin endpoints**: ❌ Frontend'de rate limit handling yok. 429 response'da retry logic eksik.

---

## 8. Sorunlar Özeti

| # | Tip | Açıklama | Etki | Öncelik |
|---|---|---|---|---|
| 1 | 🔴 Eksik Route | `/admin/settings` PUT endpoint'i backend'de tanımlı değil | Settings sayfası çalışmaz | P0 |
| 2 | 🔴 Format Uyumsuzluğu | `/admin/revenue` response formatı frontend ile uyumsuz | Revenue sayfası boş/grafik yok | P0 |
| 3 | 🔴 Eksik Route | `/health` endpoint'i backend'de tanımlı değil (admin system page) | System health sayfası çalışmaz | P0 |
| 4 | 🟡 Wrong localStorage Key | 401 handler'da `hooksniff_auth` siliniyor, `hooksniff_user` olmalı | Stale auth data kalabilir | P1 |
| 5 | 🟡 Eksik Field | `EndpointSummary`'de `created_at` yok | User detail'de tarih gösterilemez | P1 |
| 6 | 🟡 Hardcoded Revenue | `system_stats` revenue hesaplama hardcoded ($29/$99) | Gerçek fiyat farklıysa yanlış MRR | P1 |
| 7 | 🟡 Silent Error | Admin sayfalarında boş catch blocks | Kullanıcı hata göremez | P2 |
| 8 | 🟡 Raw fetch() | Settings/System pages raw `fetch()` kullanıyor, `apiFetch` değil | Tutarsız auth handling | P2 |
| 9 | 🟡 No 429 Handling | Frontend'de rate limit response handling eksik | Rate limit'te UX bozulur | P2 |
| 10 | ⚪ bind_idx Warning | `list_users`'ta `bind_idx` unused assignment | Kod kalitesi | P3 |

---

## 9. Öneriler

### Acil (P0)
1. **`/admin/settings` route ekle** — Backend `admin.rs`'ye GET + PUT `/settings` endpoint'i ekle. Platform settings için DB tablosu veya config dosyası oluştur.
2. **Revenue response formatını düzelt** — Backend `revenue_by_month`'ı `RevenueResponse` formatına çevir: `{ monthly_revenue, revenue_by_plan, mrr, churn_rate }`.
3. **`/health` route ekle** — Backend'e `GET /health` endpoint'i ekle (zaten `health_check` fonksiyonu var, sadece route registration eksik).

### Kısa Vadeli (P1)
4. **localStorage key düzelt** — `api.ts`'de `'hooksniff_auth'` → `'hooksniff_user'`.
5. **`EndpointSummary`'ye `created_at` ekle** — SQL query'ye `created_at` ekle.
6. **Revenue hesaplamayı dinamik yap** — Hardcoded $29/$99 yerine `billing` tablosundan gerçek fiyatları oku.

### Orta Vadeli (P2)
7. **Error handling standardizasyonu** — Tüm admin sayfalarında `toast()` ile hata göster.
8. **Raw fetch → apiFetch migrasyonu** — Settings ve System pages'i `apiFetch` kullanacak şekilde refactor et.
9. **429 retry logic** — `apiFetch`'e exponential backoff ile retry ekle.

---

## 10. Backend Admin Route'ları — Tam Liste (Mevcut)

```
GET  /v1/admin/users              → list_users (paginated, filtered)
GET  /v1/admin/users/:id          → get_user_detail (user + endpoints + deliveries + stats)
PUT  /v1/admin/users/:id/plan     → change_plan (free/pro/business)
PUT  /v1/admin/users/:id/status   → change_status (activate/ban)
GET  /v1/admin/stats              → system_stats (total users, deliveries, revenue, active today)
GET  /v1/admin/revenue            → revenue_by_month (last 12 months)
POST /v1/admin/sdk-update         → notify_sdk_update (send notifications to admins)
```

**Eksik (frontend tarafından çağrılıyor ama backend'de yok):**
```
PUT  /v1/admin/settings           → ❌ TANIMLI DEĞİL
GET  /v1/health                   → ❌ TANIMLI DEĞİL (sadece /status var)
```

---

## 11. Frontend Admin API Kullanım Haritası

| Sayfa | API Call | Yöntem | Backend Karşılığı |
|---|---|---|---|
| `/admin` (overview) | `adminApi.getStats()` | `apiFetch` | ✅ `/admin/stats` |
| `/admin/users` | `adminApi.listUsers()` | `apiFetch` | ✅ `/admin/users` |
| `/admin/users/:id` | `adminApi.getUserDetail()` | `apiFetch` | ✅ `/admin/users/:id` |
| `/admin/users/:id` | `adminApi.updateUserPlan()` | `apiFetch` | ✅ `/admin/users/:id/plan` |
| `/admin/users/:id` | `adminApi.updateUserStatus()` | `apiFetch` | ✅ `/admin/users/:id/status` |
| `/admin/revenue` | `adminApi.getRevenue()` | `apiFetch` | ⚠️ `/admin/revenue` (format mismatch) |
| `/admin/settings` | raw `fetch('/admin/settings')` | raw fetch | ❌ Route yok |
| `/admin/system` | raw `fetch('/health')` | raw fetch | ❌ Route yok |
