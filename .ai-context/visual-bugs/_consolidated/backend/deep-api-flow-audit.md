# Deep API Flow Audit — HookSniff Dashboard ↔ Backend

**Date**: 2026-05-10  
**Scope**: All dashboard pages that communicate with the Rust API backend  
**Method**: Full source read of `dashboard/src/lib/api.ts`, all `dashboard/src/app/[locale]/dashboard/*/page.tsx` pages, and all `api/src/routes/*.rs` handlers. Cross-referenced request/response types, endpoint paths, error handling, and data flow patterns.

---

## Executive Summary

The dashboard and backend are **largely well-aligned** — most CRUD endpoints (endpoints, webhooks, alerts, analytics, stats) work correctly. However, there are **10 high-impact issues** where frontend and backend types diverge, causing silent failures or broken pages. Several anti-patterns in data fetching also create performance and UX problems.

---

## TOP 10 Issues (Ranked by Impact)

### 🔴 1. Admin Revenue Page — Complete Frontend/Backend Type Mismatch

**Severity**: Page-breaking  
**File**: `dashboard/src/app/[locale]/admin/revenue/page.tsx` ↔ `api/src/routes/admin.rs`

The frontend expects `adminApi.getRevenue()` to return `RevenueResponse`:
```ts
export interface RevenueResponse {
  monthly_revenue: { month: string; revenue: number }[];
  revenue_by_plan: { plan: string; revenue: number; count: number }[];
  mrr: number;
  churn_rate: number;
}
```

But the backend `GET /v1/admin/revenue` returns `Vec<RevenueRow>`:
```rust
pub struct RevenueRow {
    pub month: String,
    pub revenue: f64,
}
// Response: Json<Vec<RevenueRow>>  — a flat array, NOT an object
```

**Impact**: The frontend accesses `data.monthly_revenue`, `data.mrr`, `data.churn_rate`, `data.revenue_by_plan` — all `undefined`. The revenue page renders empty charts and `$0` for all stats.

**Fix** (backend — `api/src/routes/admin.rs`):
```rust
#[derive(Serialize)]
struct RevenueDashboardResponse {
    monthly_revenue: Vec<RevenueRow>,
    revenue_by_plan: Vec<PlanRevenue>,
    mrr: f64,
    churn_rate: f64,
}

#[derive(Serialize)]
struct PlanRevenue {
    plan: String,
    revenue: f64,
    count: i64,
}

async fn revenue_by_month(...) -> Result<Json<RevenueDashboardResponse>, AppError> {
    // ... existing monthly query ...
    
    let plan_revenue = sqlx::query_as::<_, (String, i64)>(
        "SELECT plan, COUNT(*) as count FROM customers WHERE is_active = TRUE GROUP BY plan"
    ).fetch_all(&pool).await?;
    
    let mrr: f64 = plan_revenue.iter().map(|(plan, count)| {
        let price = match plan.as_str() {
            "pro" => 29.0,
            "business" => 99.0,
            _ => 0.0,
        };
        price * (*count as f64)
    }).sum();
    
    Ok(Json(RevenueDashboardResponse {
        monthly_revenue: rows,
        revenue_by_plan: plan_revenue.into_iter().map(|(plan, count)| PlanRevenue {
            revenue: match plan.as_str() {
                "pro" => 29.0 * count as f64,
                "business" => 99.0 * count as f64,
                _ => 0.0,
            },
            plan,
            count,
        }).collect(),
        mrr,
        churn_rate: 0.0, // Implement actual churn calculation
    }))
}
```

---

### 🔴 2. Notifications API — Frontend Sends Parameters Backend Doesn't Accept

**Severity**: Feature-breaking (filters don't work)  
**File**: `dashboard/src/app/[locale]/dashboard/notifications/page.tsx` ↔ `api/src/routes/notifications.rs`

Frontend sends `type` and `read` query params:
```ts
notificationsApi.list(token, {
  page,
  type: typeFilter === 'all' ? undefined : typeFilter,
  read: readFilter === 'all' ? undefined : readFilter === 'read',
});
```

Backend `ListParams` only accepts:
```rust
pub struct ListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub unread_only: Option<bool>,  // Not "read"!
}
```

**Problems**:
1. `type` filter → silently ignored (no server-side filtering by notification type)
2. `read` filter → field name mismatch. Frontend sends `read=true/false`, backend expects `unread_only=true/false`
3. Frontend `Notification` type uses `read: boolean`, backend returns `is_read: boolean`

**Fix** (backend — add `type` filter, rename field):
```rust
#[derive(Debug, Deserialize)]
pub struct ListParams {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub unread_only: Option<bool>,
    #[serde(rename = "type")]
    pub notification_type: Option<String>,
}
```
Then add `WHERE type = $X` condition when `notification_type` is provided.

**Fix** (frontend — align field names):
```ts
// In notificationsApi.list, change "read" to "unread_only"
if (params?.read === false) searchParams.set("unread_only", "true");
```

---

### 🔴 3. Billing Usage API — Frontend/Backend Response Shape Mismatch

**Severity**: Page-breaking (billing page shows wrong data)  
**File**: `dashboard/src/app/[locale]/dashboard/billing/page.tsx` ↔ `api/src/routes/billing.rs`

Frontend expects `billingApiExtended.getUsage()` to return:
```ts
export interface BillingUsage {
  deliveries_used: number;
  deliveries_limit: number;
  endpoints_count: number;
  endpoints_limit: number;
}
```

Backend `GET /v1/billing/usage` returns:
```rust
struct UsageResponse {
    plan: String,
    payment_provider: String,
    webhooks: UsageCounter { used, limit, remaining },
    endpoints: UsageCounter { used, limit, remaining },
    rate_limit: RateLimitInfo,
    period: PeriodInfo,
}
```

**Impact**: `data.deliveries_used` is `undefined` (should be `data.webhooks.used`). `data.deliveries_limit` is `undefined` (should be `data.webhooks.limit`). Billing page shows 0/10000 usage always.

**Fix** (frontend — `api.ts`):
```ts
export interface BillingUsage {
  webhooks: { used: number; limit: number; remaining: number };
  endpoints: { used: number; limit: number; remaining: number };
  plan: string;
  period: { start: string; end: string };
}
```

Then in `billing/page.tsx`:
```ts
billingApiExtended.getUsage(token).then((data) => {
  setUsageCount(data.webhooks?.used ?? 0);
  setUsageLimit(data.webhooks?.limit ?? 10000);
});
```

---

### 🔴 4. Auth Login Response — Frontend Expects `user` + `api_key`, Backend Returns `customer`

**Severity**: Auth flow breakage  
**File**: `dashboard/src/lib/api.ts` ↔ `api/src/routes/auth.rs`

Frontend `authApi.login` return type:
```ts
{ token: string; user: { id, email, name?, plan }; api_key: string }
```

Backend login returns (via `auth_response_with_cookie`):
```json
{ "token": "...", "customer": { "id", "email", "name", "plan", ... } }
```

**Problems**:
1. Field is `customer`, not `user` — frontend's `data.user` is `undefined`
2. `api_key` is only returned on **registration**, not login — `data.api_key` is `undefined` on login
3. The store likely reads `data.user.email` → gets `undefined`

**Fix** (align the frontend type with actual backend response):
```ts
login: (email: string, password: string) =>
  apiFetch<{ token: string; customer: { id: string; email: string; name?: string; plan: string }; api_key?: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  }),
```

Then update the auth store to read `data.customer` instead of `data.user`.

---

### 🟠 5. Search Page Bypasses API Client — No Auth Token, No Error Handling

**Severity**: Security + reliability  
**File**: `dashboard/src/app/[locale]/dashboard/search/page.tsx`

```ts
const res = await fetch(`${API}/search?${params}`, {
  headers: {},          // ← NO Authorization header!
  credentials: 'include',
});
```

**Problems**:
1. No `Authorization: Bearer <token>` header — relies entirely on cookie auth
2. No error handling (silently catches all errors)
3. No timeout (unlike `apiFetch` which has 30s timeout)
4. Duplicates the base URL construction logic
5. `token` is in the dependency array of `useCallback` but never used in the fetch

**Fix**:
```ts
import { apiFetch } from '@/lib/api';

const search = useCallback(async (p = 1) => {
  if (!token) return;
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    params.set('page', p.toString());
    params.set('per_page', '20');
    const data = await apiFetch<SearchResponse>(`/search?${params}`, { token });
    setResults(data);
  } catch {
    // handle error
  } finally {
    setLoading(false);
  }
}, [token, query, status]);
```

---

### 🟠 6. Dashboard Activity Feed — 5-Second Polling Creates Excessive Server Load

**Severity**: Performance  
**File**: `dashboard/src/app/[locale]/dashboard/page.tsx`

```ts
const interval = setInterval(fetchDeliveries, 5000);
```

The `ActivityFeed` component polls `GET /v1/webhooks?page=1` every 5 seconds. For N concurrent dashboard users, this generates N requests every 5 seconds = 12N requests/minute just for the activity feed. Combined with the stats + analytics calls on mount, the dashboard makes **6+ API calls on load**.

**Fix**: Use SSE/streaming (the backend already has `api/src/routes/stream.rs`) or increase interval to 30s with visibility-based pausing:
```ts
useEffect(() => {
  fetchDeliveries();
  const interval = setInterval(fetchDeliveries, 30_000); // 30s, not 5s
  // Pause when tab is hidden
  const handleVisibility = () => {
    if (document.hidden) clearInterval(interval);
  };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}, [fetchDeliveries]);
```

---

### 🟠 7. Deliveries Page — Client-Side Search Filter on Server-Paginated Data

**Severity**: UX (search only works on current page)  
**File**: `dashboard/src/app/[locale]/dashboard/deliveries/page.tsx`

```ts
const filtered = deliveries.filter((d) =>
  !search || d.event?.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search)
);
```

The search input filters the **already-fetched page** of 20 deliveries. If the user searches for an event on page 2, it won't find deliveries from page 1. The search is purely cosmetic.

**Fix**: Send search to the server (add `q` param to the backend list endpoint):
```ts
// Frontend
const fetchData = useCallback(async () => {
  const data = await webhooksApi.list(token, {
    page,
    status: filter === 'all' ? undefined : filter,
    q: search || undefined,  // Send to server
  });
  // ...
}, [token, page, filter, search]);

// Add debounce
const debouncedSearch = useDebouncedValue(search, 300);
// Use debouncedSearch in the dependency array instead of search
```

Backend (`webhooks.rs`): Add `q` parameter with `ILIKE` on `event_type` and `id::text`.

---

### 🟠 8. Teams API — Frontend/Backend Route & Type Misalignment

**Severity**: Feature-breaking (team management partially broken)  
**File**: `dashboard/src/app/[locale]/dashboard/team/page.tsx` ↔ `api/src/routes/teams.rs`

**Route mismatch**:
- Frontend `teamsApi.removeMember(token, teamId, memberId)` → `DELETE /teams/{teamId}/members/{memberId}`
- Backend route: `DELETE /teams/{id}/members/{uid}` where `uid` is **customer_id**, not team_member.id
- Frontend passes `m.id` (team_member row UUID) → backend looks up by `customer_id` → likely 404

**Role values mismatch**:
- Frontend `ROLE_OPTIONS = ['owner', 'admin', 'member']`
- Backend `VALID_ROLES = ['admin', 'editor', 'viewer']`
- Changing role to "member" → backend returns 400 "Invalid role"
- "editor" and "viewer" roles exist in backend but are never offered in the UI

**Type mismatch** — `TeamMember`:
```ts
// Frontend expects:
{ id, user_id, email, name?, role, joined_at }

// Backend returns:
{ id, team_id, customer_id, role, invited_at, joined_at? }
```

The frontend accesses `m.name || m.email` and `m.joined_at` — `name` comes from a JOIN with customers table in `list_members`, so it works. But `user_id` doesn't exist (it's `customer_id`).

**Fix**: Update frontend `TeamMember` type:
```ts
export interface TeamMember {
  id: string;
  customer_id: string;  // not user_id
  email: string;
  name?: string;
  role: 'admin' | 'editor' | 'viewer';  // not owner/admin/member
  invited_at: string;
  joined_at?: string;
}
```

Also fix `removeMember` — pass `customer_id` not `id`:
```ts
const handleRemoveMember = async (member: TeamMember) => {
  await teamsApi.removeMember(token, selectedTeam.id, member.customer_id);
};
```

---

### 🟡 9. apiFetch 401 Refresh — Race Condition with Concurrent Requests

**Severity**: Reliability (intermittent auth failures)  
**File**: `dashboard/src/lib/api.ts`

When multiple API calls return 401 simultaneously (e.g., token expiry during dashboard load), each one independently tries to refresh:
```ts
if (res.status === 401) {
  const refreshRes = await fetch(`${API_BASE}/auth/refresh`, ...);
  // ...
}
```

**Problem**: If 5 requests all get 401 at the same time, 5 refresh calls fire. The first succeeds and revokes the old refresh token. The remaining 4 fail (revoked token) and trigger logout + redirect.

**Fix**: Singleton refresh promise:
```ts
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}
```

---

### 🟡 10. Notifications Page — `is_read` vs `read` Field Name Mismatch

**Severity**: UI inconsistency  
**File**: `dashboard/src/app/[locale]/dashboard/notifications/page.tsx` ↔ `api/src/routes/notifications.rs`

Backend `Notification` struct serializes as `is_read`:
```rust
pub is_read: bool,
```

But the frontend `Notification` type expects `read`:
```ts
export interface Notification {
  read: boolean;  // ← should be is_read
}
```

The frontend uses `n.read` everywhere (filtering, display, marking). Since the backend sends `is_read`, `n.read` is always `undefined` → falsy → all notifications appear as unread.

**Fix**: Either rename the Rust field with `#[serde(rename = "read")]` or update the frontend type to `is_read`.

---

## Additional Issues (Lower Priority)

### 11. Endpoints Page — No Server-Side Search
The endpoints list fetches all endpoints and displays them. No search/filter capability. For users with many endpoints, this becomes unwieldy. Add `?q=` query parameter to backend.

### 12. Deliveries Page — No Abort on Unmount
`fetchData` doesn't cancel in-flight requests when the component unmounts or when page/filter changes rapidly. This can cause stale data to overwrite fresh data.

```tsx
// Fix: use AbortController
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort();
}, [fetchData]);
```

### 13. Billing Cancel — Uses Dynamic Import for Generic API
```ts
const { api } = await import('@/lib/api');
await api.delete('/billing/subscription', token);
```
Dynamic import on every cancel click is unnecessary. Import at the top level.

### 14. Admin Users — Status Filter Type Mismatch
Frontend sends `status: "active"` (string) to `GET /v1/admin/users?status=active`. Backend `PaginationParams.status` is `Option<String>` and compares with `status == "active"` → `is_active = true`. This actually works because of the string comparison. However, sending `status: "banned"` maps to `is_active = false` only if the string is exactly "active". Any other value (e.g., "inactive") would set `is_active = false` too. Fragile but functional.

### 15. No Request Deduplication
Multiple dashboard components can fire the same API call simultaneously (e.g., stats fetched by both the overview page and a sidebar widget). No request deduplication or shared cache exists.

---

## Summary Table

| # | Issue | Severity | Frontend File | Backend File | Status |
|---|-------|----------|---------------|--------------|--------|
| 1 | Revenue page type mismatch | 🔴 Page-breaking | `admin/revenue/page.tsx` | `admin.rs` | BROKEN |
| 2 | Notifications filter params | 🔴 Feature-breaking | `notifications/page.tsx` | `notifications.rs` | BROKEN |
| 3 | Billing usage response shape | 🔴 Page-breaking | `billing/page.tsx` | `billing.rs` | BROKEN |
| 4 | Auth login response shape | 🔴 Auth-breaking | `api.ts` (authApi) | `auth.rs` | BROKEN |
| 5 | Search bypasses API client | 🟠 Security | `search/page.tsx` | — | FIXABLE |
| 6 | Dashboard 5s polling | 🟠 Performance | `dashboard/page.tsx` | — | FIXABLE |
| 7 | Client-side search on paginated data | 🟠 UX | `deliveries/page.tsx` | `webhooks.rs` | FIXABLE |
| 8 | Teams route/type misalignment | 🟠 Feature-breaking | `team/page.tsx` | `teams.rs` | BROKEN |
| 9 | 401 refresh race condition | 🟡 Reliability | `api.ts` | — | FIXABLE |
| 10 | Notification `is_read` vs `read` | 🟡 UI bug | `notifications/page.tsx` | `notifications.rs` | BROKEN |

---

## What's Working Well ✓

- **Endpoints CRUD** — Full lifecycle works correctly (create, list, update, delete, retry policy)
- **Webhooks/Deliveries** — Pagination, status filtering, replay all work
- **Analytics** — Delivery trends, success rate, latency all match backend types
- **Stats** — `GET /v1/stats` response matches `StatsResponse` perfectly
- **Alerts** — Create, list, delete, test all functional
- **Auth registration** — Returns token + customer + api_key correctly
- **Admin users** — List, detail, plan change, status change all work
- **Idempotency** — Properly implemented on webhook creation
- **Batch operations** — Webhook batch create and replay handle errors gracefully
